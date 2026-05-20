import { ForecastResult, ActivityLog } from '../store/store';

// Helper to generate date labels
const getDatesList = (startMonthsBack: number, count: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  const baseDate = new Date(today.getFullYear(), today.getMonth() - startMonthsBack, 1);
  
  for (let i = 0; i < count; i++) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    dates.push(`${yyyy}-${mm}`);
  }
  return dates;
};

// Custom mathematical forecaster matching backend logic
export const getMockForecastRun = (
  productName: string,
  category: string,
  horizon: number,
  pastTrend: string,
  marketingSpend: number,
  seasonalityFlag: boolean,
  competitorActivity: string,
  promotionalMultiplier: number
): ForecastResult => {
  const base = category === 'electronics' ? 2500 : 
               category === 'apparel' ? 1500 : 
               category === 'grocery' ? 4000 : 
               category === 'automotive' ? 800 : 1200;

  let monthlyGrowth = 0.003;
  let trendDir: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  if (pastTrend === 'growth') {
    monthlyGrowth = 0.016;
    trendDir = 'UP';
  } else if (pastTrend === 'decline') {
    monthlyGrowth = -0.012;
    trendDir = 'DOWN';
  } else if (pastTrend === 'volatile') {
    monthlyGrowth = 0.001;
    trendDir = 'STABLE';
  }

  const marketingBoost = marketingSpend > 0 ? 0.05 * Math.log(Math.max(1.0, marketingSpend / 100)) : 0.0;
  const competitorDrag = competitorActivity === 'high' ? -0.15 : competitorActivity === 'medium' ? -0.06 : 0.0;
  const demandMultiplier = 1.0 + marketingBoost + competitorDrag;

  const getSeasFactor = (month: number): number => {
    if (!seasonalityFlag) return 1.0;
    if (category === 'electronics') {
      const factors: Record<number, number> = {1: 0.75, 2: 0.8, 3: 0.9, 4: 0.95, 5: 1.0, 6: 0.95, 7: 0.9, 8: 0.95, 9: 1.05, 10: 1.15, 11: 1.45, 12: 1.65};
      return factors[month] || 1.0;
    } else if (category === 'apparel') {
      const factors: Record<number, number> = {1: 1.25, 2: 1.0, 3: 0.85, 4: 0.9, 5: 1.1, 6: 1.3, 7: 1.25, 8: 1.05, 9: 0.9, 10: 0.85, 11: 1.1, 12: 1.35};
      return factors[month] || 1.0;
    }
    const factors: Record<number, number> = {1: 0.95, 2: 0.92, 3: 1.0, 4: 1.02, 5: 1.05, 6: 0.98, 7: 0.96, 8: 1.0, 9: 1.04, 10: 1.02, 11: 1.05, 12: 1.08};
    return factors[month] || 1.0;
  };

  // Generate 24 months history
  const histDates = getDatesList(24, 24);
  let runningBase = base;
  const historical_demand = histDates.map((dateStr, idx) => {
    runningBase *= (1 + monthlyGrowth);
    const m = parseInt(dateStr.split('-')[1]);
    const seas = getSeasFactor(m);
    // slight noise
    const noise = 1.0 + (Math.sin(idx) * 0.04) + (Math.cos(idx * 2) * 0.02);
    return {
      date: dateStr,
      demand: Math.round(runningBase * demandMultiplier * seas * noise * 10) / 10
    };
  });

  // Generate forecast
  const foreDates = getDatesList(0, horizon);
  let runningForeBase = runningBase;
  const forecasted_demand = foreDates.map((dateStr, idx) => {
    runningForeBase *= (1 + monthlyGrowth);
    const m = parseInt(dateStr.split('-')[1]);
    const seas = getSeasFactor(m);
    const demandVal = runningForeBase * demandMultiplier * seas * promotionalMultiplier;
    
    // widening confidence boundaries
    const uncertainty = 0.05 + (0.02 * (idx + 1)) + (pastTrend === 'volatile' ? 0.08 : 0.0);
    return {
      date: dateStr,
      demand: Math.round(demandVal * 10) / 10,
      lower_bound: Math.round(demandVal * (1 - uncertainty) * 10) / 10,
      upper_bound: Math.round(demandVal * (1 + uncertainty) * 10) / 10
    };
  });

  // Seasonality decomposition
  const monthsNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const seasonality_decomposition = monthsNames.map((name, idx) => ({
    month: name,
    factor: Math.round(getSeasFactor(idx + 1) * 100) / 100
  }));

  // Strategic Insights
  const recommendations: string[] = [];
  if (marketingSpend > 2000) {
    recommendations.push(`Maximize Marketing ROI: Promotional investments are driving a ${(marketingBoost * 100).toFixed(1)}% demand lift. Synchronize supply routes to avoid peak-period blockages.`);
  } else {
    recommendations.push("Capitalize on Elasticity: Base sales are robust. A focused 10% advertising expansion in shoulder months could capture high incremental margins.");
  }
  
  if (seasonalityFlag) {
    const peakIndex = seasonality_decomposition.reduce((maxIdx, current, idx, arr) => current.factor > arr[maxIdx].factor ? idx : maxIdx, 0);
    recommendations.push(`Prepare Seasonal Safety Stock: Major demand peak scheduled in ${monthsNames[peakIndex]} (factor: ${seasonality_decomposition[peakIndex].factor}x). Order raw materials 45 days prior.`);
  }
  
  if (promotionalMultiplier > 1.0) {
    recommendations.push(`Logistics Synergy: Your proposed ${promotionalMultiplier}x promotion multiplier will spike order frequency. Coordinate with third-party logistics to guarantee shipping containers.`);
  }
  recommendations.push("Implement Lean Replenishment: Set safety stock buffer to 18% during stable quarters to reduce warehouse carrying costs.");

  const mockModelComparison = {
    lr: { mae: 142.50, rmse: 178.20, r2: 0.885 },
    rf: { mae: 95.40, rmse: 122.15, r2: 0.942 }
  };

  const mockFeatureImportances = [
    { feature: "Time index", importance: 0.485 },
    { feature: "Lag 1", importance: 0.285 },
    { feature: "Promo spend interaction", importance: 0.125 },
    { feature: "Sin month", importance: 0.075 },
    { feature: "Cos month", importance: 0.030 }
  ];

  const mockPipelineSteps = [
    "CSV Upload / Manual Input",
    "Data Preprocessing (Parsing & Sorting)",
    "Feature Engineering (Time Descriptors, Cyclic Month Math, Lags, Interactions)",
    "One-hot encoding of categories & Imputation of NaN/missing indices",
    "Chronological time-series Train/Test Split",
    "Linear Regression training & evaluation",
    "Random Forest Regressor training & evaluation",
    "Model evaluation metrics comparisons",
    "Multi-step forecasting using the champion model"
  ];

  const insights = {
    trend_summary: trendDir === 'UP' 
      ? `Strong expansion trajectory identified for ${productName}. The baseline demand is expanding at ${(monthlyGrowth * 100).toFixed(1)}% MoM, indicating exceptional customer adoption.`
      : trendDir === 'DOWN'
      ? `Inventory risk warning: Demand displays structural contraction at ${(Math.abs(monthlyGrowth) * 100).toFixed(1)}% monthly. Clearance promotions advised.`
      : `Consistent average velocity detected. ${productName} presents a highly stable seasonal pattern, making it a perfect candidate for automated replenishment workflows.`,
    risk_assessment: competitorActivity === 'high'
      ? "High Risk: Intense competitor campaigns are causing a 15% reduction in base conversion. Closely audit marketing expenditures to protect margin share."
      : pastTrend === 'volatile'
      ? "Moderate-High Risk: High noise levels indicate erratic demand. Maintain safety stock buffers to prevent unexpected out-of-stocks."
      : "Low Risk: Demand curves show high statistical predictability. Safety buffer requirements can be safely dialed down by 5%.",
    recommendations,
    model_comparison: mockModelComparison,
    best_model_name: "Random Forest Regressor",
    feature_importances: mockFeatureImportances,
    pipeline_steps: mockPipelineSteps
  };

  return {
    id: Math.round(Math.random() * 10000),
    product_name: productName,
    category,
    horizon,
    inputs: { productName, category, horizon, pastTrend, marketingSpend, seasonalityFlag, competitorActivity, promotionalMultiplier },
    historical_demand,
    forecasted_demand,
    seasonality_decomposition,
    trend_direction: trendDir,
    insights,
    created_at: new Date().toISOString()
  };
};

export const generateMockForecastHistory = (): ForecastResult[] => {
  return [
    getMockForecastRun("AuraPro Laptop S14", "electronics", 12, "growth", 7500, true, "medium", 1.0),
    getMockForecastRun("Apex Performance Hoodies", "apparel", 6, "volatile", 1500, true, "low", 1.2),
    getMockForecastRun("Organic Almond Milk 1L", "grocery", 12, "stable", 500, false, "medium", 1.0),
  ];
};

export const MOCK_ACTIVITIES: ActivityLog[] = [
  {
    id: 101,
    action_type: "LOGIN",
    description: "Successfully authenticated sandbox session.",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 102,
    action_type: "GENERATE_FORECAST",
    description: "Generated 12-month demand outlook for 'AuraPro Laptop S14'.",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: 103,
    action_type: "GENERATE_FORECAST",
    description: "Compiled 6-month seasonal forecast for 'Apex Performance Hoodies'.",
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString()
  },
  {
    id: 104,
    action_type: "EXPORT_DATA",
    description: "Exported demand forecast reports for 'AuraPro Laptop' as CSV.",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  }
];
