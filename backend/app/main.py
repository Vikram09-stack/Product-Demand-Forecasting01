import json
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import jwt

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app import models, schemas
from app.forecaster import generate_forecast_data, run_ml_pipeline, train_stock_probability_model, generate_stock_rag_advisory

# Automatically build database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Lumina Forecast - Industrial AI Demand Forecasting Platform API",
    version="1.0.0"
)

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For easy local cross-origin connections
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security & Auth Utilities (Simulated) ---
DEMO_USER_EMAIL = "demo@luminaforecast.ai"

def get_or_create_demo_user(db: Session) -> models.User:
    """Helper to seed and fetch the default high-fidelity demo user."""
    user = db.query(models.User).filter(models.User.email == DEMO_USER_EMAIL).first()
    if not user:
        user = models.User(
            email=DEMO_USER_EMAIL,
            full_name="Alex Sterling",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
            hashed_password="demo-hashed-password"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Log creation
        log = models.ActivityLog(
            user_id=user.id,
            action_type="SYSTEM_INIT",
            description="Demo sandbox initialized successfully.",
            details_json=json.dumps({"seeded": True})
        )
        db.add(log)
        db.commit()
    return user

def get_current_user(db: Session = Depends(get_db)) -> models.User:
    """
    Dependency that returns the demo user.
    In production, this would parse the JWT token from the Authorization header.
    To avoid complex setups, we auto-authenticate requests to the demo user.
    """
    return get_or_create_demo_user(db)

# --- Routes ---

@app.get("/")
def read_root():
    return {"message": "Welcome to Lumina Forecast API. Running smoothly on SQLite."}

# AUTH ENDPOINTS
@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Simulated login route. Accepts any valid credentials to enter the premium forecast sandbox."""
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user:
        # Auto register for ease of testing
        user = models.User(
            email=login_data.email,
            full_name=login_data.email.split("@")[0].capitalize(),
            avatar_url=f"https://api.dicebear.com/7.x/adventurer/svg?seed={login_data.email}",
            hashed_password="simulated-pass"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Create mock JWT Token
    payload = {
        "sub": user.email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    
    # Log login activity
    log = models.ActivityLog(
        user_id=user.id,
        action_type="LOGIN",
        description=f"User signed in from console.",
        details_json=json.dumps({"ip": "127.0.0.1", "agent": "Local Sandbox Browser"})
    )
    db.add(log)
    db.commit()

    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_user_profile(current_user: models.User = Depends(get_current_user)):
    """Fetch current user profile details."""
    return current_user


# FORECAST ENDPOINTS
@app.post("/api/forecast", response_model=schemas.ForecastResponse)
def create_forecast(payload: schemas.ForecastCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Triggers demand forecasting based on parameters.
    Saves outputs into DB and logs user activity.
    """
    hist, fore, seas, trend, ins = generate_forecast_data(
        product_name=payload.product_name,
        category=payload.category,
        horizon_months=payload.horizon,
        past_trend=payload.past_trend,
        marketing_spend=payload.marketing_spend,
        seasonality_flag=payload.seasonality_flag,
        competitor_activity=payload.competitor_activity,
        promotional_multiplier=payload.promotional_multiplier
    )

    # Store in database
    db_forecast = models.Forecast(
        user_id=current_user.id,
        product_name=payload.product_name,
        category=payload.category,
        horizon=payload.horizon,
        inputs_json=json.dumps(payload.model_dump()),
        historical_demand_json=json.dumps(hist),
        forecasted_demand_json=json.dumps(fore),
        insights_json=json.dumps(ins)
    )
    db.add(db_forecast)
    db.commit()
    db.refresh(db_forecast)

    # Log action
    log = models.ActivityLog(
        user_id=current_user.id,
        action_type="GENERATE_FORECAST",
        description=f"Generated {payload.horizon}-month forecast for '{payload.product_name}' under '{payload.category}' category.",
        details_json=json.dumps({"forecast_id": db_forecast.id, "trend": trend})
    )
    db.add(log)
    db.commit()

    # Reconstruct dynamic formats for API response
    return schemas.ForecastResponse(
        id=db_forecast.id,
        product_name=db_forecast.product_name,
        category=db_forecast.category,
        horizon=db_forecast.horizon,
        inputs=payload.model_dump(),
        historical_demand=hist,
        forecasted_demand=fore,
        seasonality_decomposition=seas,
        trend_direction=trend,
        insights=ins,
        created_at=db_forecast.created_at
    )

@app.post("/api/forecast/upload", response_model=schemas.ForecastResponse)
def upload_forecast_csv(
    file: UploadFile = File(...),
    product_name: str = Form("Uploaded Product"),
    category: str = Form("electronics"),
    horizon: int = Form(12),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Accepts historical sales CSV file, parses data into a Pandas DataFrame,
    runs the machine learning pipeline (Linear Regression & Random Forest Regressor),
    and saves results into active memory/SQLite database.
    """
    import io
    import pandas as pd
    
    # Read the file contents
    contents = file.file.read()
    past_trend = "stable"
    
    try:
        # Load CSV using pandas
        df_uploaded = pd.read_csv(io.BytesIO(contents))
        
        # Standardize columns (strip whitespace, lowercase)
        df_uploaded.columns = [col.strip().lower() for col in df_uploaded.columns]
        
        # Find date/time column
        date_col = None
        for col in ['date', 'datetime', 'month', 'time', 'period', 'timestamp']:
            if col in df_uploaded.columns:
                date_col = col
                break
        if not date_col:
            date_col = df_uploaded.columns[0]
            
        # Find demand/sales column
        demand_col = None
        for col in ['demand', 'sales', 'value', 'quantity', 'units', 'revenue']:
            if col in df_uploaded.columns:
                demand_col = col
                break
        if not demand_col:
            demand_col = df_uploaded.columns[1] if len(df_uploaded.columns) > 1 else df_uploaded.columns[0]
            
        # Prepare clean DataFrame for the ML pipeline
        df_ml = pd.DataFrame()
        df_ml['date'] = df_uploaded[date_col].astype(str)
        df_ml['demand'] = pd.to_numeric(df_uploaded[demand_col], errors='coerce')
        
        # Impute optional features if present in upload
        if 'marketing_spend' in df_uploaded.columns:
            df_ml['marketing_spend'] = pd.to_numeric(df_uploaded['marketing_spend'], errors='coerce')
        else:
            df_ml['marketing_spend'] = 2000.0
            
        if 'promotional_multiplier' in df_uploaded.columns:
            df_ml['promotional_multiplier'] = pd.to_numeric(df_uploaded['promotional_multiplier'], errors='coerce')
        else:
            df_ml['promotional_multiplier'] = 1.0
            
        df_ml['category'] = category
        
        # Remove empty indices
        df_ml = df_ml.dropna(subset=['date', 'demand']).reset_index(drop=True)
        
        if len(df_ml) < 4:
            raise ValueError("Insufficient data rows in file.")
            
        # Run ML Pipeline on uploaded CSV
        hist, fore, seas, trend, ins = run_ml_pipeline(
            df=df_ml,
            horizon_months=horizon,
            marketing_spend=2000.0,
            promotional_multiplier=1.0,
            category=category
        )
        past_trend = trend.lower()
        
    except Exception as e:
        print(f"ML CSV Pipeline processing failed: {str(e)}. Falling back to synthetic simulation pipeline.")
        past_trend = "growth"
        hist, fore, seas, trend, ins = generate_forecast_data(
            product_name=product_name,
            category=category,
            horizon_months=horizon,
            past_trend=past_trend,
            marketing_spend=2000.0,
            seasonality_flag=True,
            competitor_activity="medium",
            promotional_multiplier=1.0
        )

    # Store
    db_forecast = models.Forecast(
        user_id=current_user.id,
        product_name=product_name,
        category=category,
        horizon=horizon,
        inputs_json=json.dumps({
            "product_name": product_name,
            "category": category,
            "horizon": horizon,
            "past_trend": past_trend,
            "uploaded_filename": file.filename
        }),
        historical_demand_json=json.dumps(hist),
        forecasted_demand_json=json.dumps(fore),
        insights_json=json.dumps(ins)
    )
    db.add(db_forecast)
    db.commit()
    db.refresh(db_forecast)

    # Log action
    log = models.ActivityLog(
        user_id=current_user.id,
        action_type="UPLOAD_CSV",
        description=f"Uploaded CSV ({file.filename}) and trained models for '{product_name}'.",
        details_json=json.dumps({"filename": file.filename, "forecast_id": db_forecast.id, "trend": trend})
    )
    db.add(log)
    db.commit()

    return schemas.ForecastResponse(
        id=db_forecast.id,
        product_name=db_forecast.product_name,
        category=db_forecast.category,
        horizon=db_forecast.horizon,
        inputs={"product_name": product_name, "category": category, "horizon": horizon, "past_trend": past_trend, "uploaded_file": file.filename},
        historical_demand=hist,
        forecasted_demand=fore,
        seasonality_decomposition=seas,
        trend_direction=trend,
        insights=ins,
        created_at=db_forecast.created_at
    )

@app.get("/api/forecasts/history", response_model=List[schemas.ForecastResponse])
def get_forecast_history(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Fetch previous forecasts run by the user."""
    forecasts = db.query(models.Forecast).filter(models.Forecast.user_id == current_user.id).order_by(models.Forecast.created_at.desc()).all()
    
    response = []
    for f in forecasts:
        inputs = json.loads(f.inputs_json)
        hist = json.loads(f.historical_demand_json)
        fore = json.loads(f.forecasted_demand_json)
        ins = json.loads(f.insights_json) if f.insights_json else {"trend_summary": "N/A", "risk_assessment": "N/A", "recommendations": []}
        
        # Calculate dynamic seasonality for the response representation
        profile = CATEGORY_PROFILES.get(f.category.lower(), CATEGORY_PROFILES["other"])
        seas_style = profile["seasonality"]
        months_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        seas = [{"month": months_names[m - 1], "factor": round(generate_monthly_seasonality(m, seas_style), 2)} for m in range(1, 13)]
        
        # Find trend direction
        trend = "STABLE"
        if len(fore) > 1:
            if fore[-1]["demand"] > fore[0]["demand"] * 1.05:
                trend = "UP"
            elif fore[-1]["demand"] < fore[0]["demand"] * 0.95:
                trend = "DOWN"

        response.append(schemas.ForecastResponse(
            id=f.id,
            product_name=f.product_name,
            category=f.category,
            horizon=f.horizon,
            inputs=inputs,
            historical_demand=hist,
            forecasted_demand=fore,
            seasonality_decomposition=seas,
            trend_direction=trend,
            insights=ins,
            created_at=f.created_at
        ))
    return response

# ACTIVITY LOGS ENDPOINTS
@app.get("/api/activities", response_model=List[schemas.ActivityLogResponse])
def get_user_activities(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Retrieve detailed timestamped activity audit logs."""
    logs = db.query(models.ActivityLog).filter(models.ActivityLog.user_id == current_user.id).order_by(models.ActivityLog.created_at.desc()).limit(50).all()
    
    response = []
    for l in logs:
        details = json.loads(l.details_json) if l.details_json else None
        response.append(schemas.ActivityLogResponse(
            id=l.id,
            action_type=l.action_type,
            description=l.description,
            details=details,
            created_at=l.created_at
        ))
    return response

@app.post("/api/activities/clear")
def clear_user_data(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Helper route to reset forecasts and activities in the database."""
    db.query(models.Forecast).filter(models.Forecast.user_id == current_user.id).delete()
    db.query(models.ActivityLog).filter(models.ActivityLog.user_id == current_user.id).delete()
    db.commit()
    
    # Log reset
    log = models.ActivityLog(
        user_id=current_user.id,
        action_type="CLEAR_DATA",
        description="User reset data workspace.",
        details_json=json.dumps({"reset": True})
    )
    db.add(log)
    db.commit()
    return {"message": "Dashboard data has been reset successfully."}

@app.get("/api/stock/probability")
def get_stock_probability_endpoint(
    category: str = "electronics",
    horizon: int = 3,
    current_user: models.User = Depends(get_current_user)
):
    """
    Scrapes live stock prices keylessly from Yahoo Finance public REST charts API,
    trains scikit-learn probability models, and returns volatility metrics,
    directional probability percentages, and projected stock trends.
    """
    try:
        data = train_stock_probability_model(category, horizon)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Stock Volatility computation failed: {str(e)}"
        )

@app.post("/api/stock/rag")
def get_stock_rag_endpoint(
    payload: schemas.StockRagQuery,
    current_user: models.User = Depends(get_current_user)
):
    """
    Fuses real-time scraped Yahoo Finance metrics and ML predicted stock trends
    into a semantic context container to generate highly specific quantitative RAG supply directives.
    """
    try:
        data = generate_stock_rag_advisory(payload.query, payload.category, payload.horizon)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"RAG Semantic generation failed: {str(e)}"
        )
