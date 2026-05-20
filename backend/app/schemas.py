from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Forecast Schemas
class ForecastCreate(BaseModel):
    product_name: str
    category: str
    horizon: int = 12  # months, 1 to 24
    past_trend: str = "growth"  # growth, decline, stable, volatile
    marketing_spend: float = 5000.0  # USD/month
    seasonality_flag: bool = True
    competitor_activity: str = "medium"  # low, medium, high
    promotional_multiplier: float = 1.0  # e.g., 1.2 for 20% boost

class ForecastPoint(BaseModel):
    date: str
    demand: float
    lower_bound: float
    upper_bound: float

class SeasonalityComponent(BaseModel):
    month: str
    factor: float

class ForecastInsights(BaseModel):
    trend_summary: str
    risk_assessment: str
    recommendations: List[str]

class ForecastResponse(BaseModel):
    id: int
    product_name: str
    category: str
    horizon: int
    inputs: Dict[str, Any]
    historical_demand: List[Dict[str, Any]]
    forecasted_demand: List[ForecastPoint]
    seasonality_decomposition: List[SeasonalityComponent]
    trend_direction: str  # "UP", "DOWN", "STABLE"
    insights: ForecastInsights
    created_at: datetime

    class Config:
        from_attributes = True

# Activity Log Schemas
class ActivityLogResponse(BaseModel):
    id: int
    action_type: str
    description: str
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Stock RAG Schemas
class StockRagQuery(BaseModel):
    query: str
    category: str = "electronics"
    horizon: int = 3

