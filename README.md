# Lumina Forecast 🌌

**Lumina Forecast** is a premium, industrial-grade Product Demand Forecasting & Inventory Volatility SaaS platform. It combines a visually breathtaking, high-fidelity React dashboard (reminiscent of Linear, Apple, and Arc Browser styling) with a fast, lightweight FastAPI Python backend backed by an SQLite relational storage layer.

---

## 🎨 High-Fidelity Premium Aesthetics

Lumina Forecast is crafted to feel like a ₹10–15 Lakh enterprise quantitative planning tool:
- **Glassmorphism Panels**: Deep `backdrop-filter` cards with subtle inner border-glows and shadow elevations.
- **Ambient mesh background**: A canvas-based interactive gradient system that pulses and shifts fluidly in response to navigation.
- **Micro-interactions**: Framer Motion physics-based transitions across pages, hover scales, and dynamic coordinate highlights.
- **Quantitative Terminals**: Pure SVG gauge charts, progress rings, and Monte Carlo timelines for stock risk modeling.

---

## 🚀 Key Features

1. **AI Demand Forecasting Engine**:
   - Multi-variable parameter analyzer: modeling product categories, growth/decay slopes, promotion multipliers, marketing spends, competitor drag, and annual cycles.
   - Solid historical line combined with expanding forecasted confidence bounds (modeling standard error propagation).
   - High-speed spreadsheet CSV uploader that automatically extracts sales structures and trends.

2. **Volatility Modeling (Quant Dashboard)**:
   - Monte Carlo directional shifts: computing Upward, Downward, or Balanced stock probabilities over a 1–6 month selector.
   - Volatility coefficients speedometer (disruption indexing).
   - Dynamic depletion heatmaps showing warehouse stock health across sales channels.

3. **Workspace Profile Hub**:
   - Multi-model catalogs: saved historical runs are stored securely in SQLite and can be loaded back into active memory with a single click.
   - Comprehensive audit trails: real-time system logs detailing user actions (logins, uploads, clearings, and runs).

4. **Fault-Tolerant Offline Fallback**:
   - The React core features an automatic fallback runner: if the Python FastAPI backend is not active, the system seamlessly runs high-fidelity client-side forecasting simulations. You can double-click or host the build offline, and it works perfectly!

---

## 🧠 Machine Learning Pipeline & Architecture

Lumina Forecast executes a strict, industrial-grade **9-Stage Machine Learning Pipeline** for every forecast request (manual inputs & CSV uploads):

1. **CSV Upload / Manual Input (S1)**: Ingests raw sales historical coordinates from spreadsheet data or automated parameter forms.
2. **Data Preprocessing (S2)**: Performs date parsing, formats normalization, chronological sorting, and structural column alignment.
3. **Feature Engineering (S3)**: Generates highly predictive statistical signals, including:
   - *Time descriptors*: linear `time_index` step signals.
   - *Cyclic season math*: sine and cosine month transformations (`sin_month`, `cos_month`) to capture annual seasonal oscillations.
   - *Temporal lags*: multi-month lags (`lag_1`, `lag_2`) and 3-month rolling averages (`rolling_mean_3`).
   - *Promotion interactions*: promotional multiplier and marketing spend cross-multiplications.
4. **Encoding + Missing Value Handling (S4)**: Automatically imputes NaN parameters using forward-backward filling, mean normalization, and encodes categories via robust One-Hot structures.
5. **Chronological Train/Test Split (S5)**: Divides historical coordinates using a strict **time-series chronological split (80% Train, 20% Test)** to prevent data leakage and preserve temporal dependencies.
6. **Linear Regression Training (S6)**: Fits an OLS model as a clean parametric baseline.
7. **Random Forest Regressor Training (S7)**: Trains a multi-estimator ensemble model to capture highly complex non-linear relations.
8. **Model Evaluation & Champion Selection (S8)**: Evaluates both algorithms on the test partition, computing Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and $R^2$ scores. The algorithm yielding the higher $R^2$ is automatically designated the "Champion" model.
9. **Multi-Step Forecast Output + Graphs (S9)**: Auto-regressively predicts future coordinates by feeding predicted steps back into subsequent lags, projecting confidence boundaries mapped to champion validation RMSE, and rendering interactive area chart bands.

---

## 📂 Project Architecture

```
lumina-forecast/
├── README.md
├── backend/
│   ├── app/
│   │   ├── main.py        # Central FastAPI setup, CORS & database initializers
│   │   ├── forecaster.py  # Trend, seasonality, promotion & insight simulators
│   │   ├── models.py      # SQLAlchemy 2.0 database tables
│   │   ├── schemas.py     # Pydantic validation schemas
│   │   └── core/
│   │       └── config.py  # SQLite connection environments
│   └── requirements.txt   # Web, database, and quantitative packages
└── frontend/
    ├── package.json
    ├── vite.config.ts     # Proxy settings to local port 8000
    ├── tailwind.config.js # Futuristic glows & Space Grotesk typography
    └── src/
        ├── index.css      # Ambient gradient meshes & customized scrollbars
        ├── App.tsx        # Framer Motion page switches & routing
        ├── store/
        │   └── store.ts   # Zustand state manager & API connector
        ├── utils/
        │   └── mockData.ts# Client-side numerical simulation algorithms
        ├── components/    # Reusable Recharts areas, gauges & form parameters
        └── pages/         # High-converting Landing, login & workspace panels
```

---

## 🛠️ Step-by-Step Installation

Follow these instructions to start the local development services.

### Prerequisite Checklist
Make sure you have the following installed on your machine:
- **Node.js** (v18+)
- **Python** (v3.10+) and `pip`

---

### Step 1: Start the FastAPI Backend

1. Navigate to the `backend` directory in your terminal:
   ```bash
   cd backend
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Boot up the local development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The SQLite database file `lumina.db` is automatically created, migrated, and seeded with high-fidelity demo values on startup!*
   - Verify API documentation is running: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Step 2: Start the React Frontend

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local port:
   - [http://localhost:5173](http://localhost:5173)

---

### Step 3: Run the Application Sandbox

- On the **Landing Page**, click **"Access Free Sandbox"** or **"Console Access"** to sign in automatically with a seeded guest quantitative analyst dashboard!
- Try adjusting horizon ranges, inputting marketing spends, enabling seasonality switches, or loading a mock CSV file to observe the Recharts line update dynamically with confidence bands.
- Explore the **Stock Volatility** quantitatively or browse the **Profile Hub** to audit your console operations and reload previous runs!
