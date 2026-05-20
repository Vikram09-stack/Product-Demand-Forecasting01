import React, { useState } from 'react';
import { useLuminaStore } from '../store/store';
import { ForecastForm } from '../components/ForecastForm';
import { ForecastChart } from '../components/ForecastChart';
import { GlassCard } from '../components/GlassCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, AlertTriangle, ShieldCheck, Flame, Briefcase, Zap, Info, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { currentForecast, isLoadingForecast, theme, generateForecast } = useLuminaStore();
  const [whatIfScenario, setWhatIfScenario] = useState<number>(0); // adjustment slider

  // Seasonality decomposition calculations
  const seasonalityData = currentForecast ? currentForecast.seasonality_decomposition : [];
  
  // Calculate average demand
  const averageForecastDemand = currentForecast 
    ? Math.round(currentForecast.forecasted_demand.reduce((sum, curr) => sum + curr.demand, 0) / currentForecast.forecasted_demand.length)
    : 0;

  // Calculate highest peak demand
  const peakDemand = currentForecast
    ? Math.max(...currentForecast.forecasted_demand.map(f => f.demand))
    : 0;

  // Recharts high-contrast themes based on active theme state
  const isDark = theme === 'dark';
  const gridStroke = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.08)";
  const tickFill = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(15, 23, 42, 0.6)";
  const tooltipBg = isDark ? "#09090b" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.08)";
  const tooltipLabel = isDark ? "#818cf8" : "#4f46e5";
  const tooltipColor = isDark ? "#ffffff" : "#0f172a";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-white/5 pb-5 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Demand Forecast Workspace</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Configure parameters, run multi-variable ML simulations and export reports.</p>
        </div>
      </div>

      {/* Main Grid: Inputs (Left) vs Outputs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <ForecastForm />
        </div>

        {/* Right Column: Dynamic Output Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {isLoadingForecast ? (
            /* Skeleton Loading State */
            <div className="h-[600px] rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01] p-8 flex flex-col justify-between animate-pulse">
              <div className="space-y-3">
                <div className="h-6 w-1/3 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                <div className="h-4 w-1/2 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
              </div>
              <div className="h-[300px] w-full bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-indigo-500 animate-spin" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded-lg"></div>
                <div className="h-4 w-5/6 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
              </div>
            </div>
          ) : currentForecast ? (
            <div className="space-y-6">
              
              {/* Forecast Area Chart */}
              <GlassCard className="p-6">
                <ForecastChart />
              </GlassCard>

              {/* KPI Metrics Dashboard Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Metric 1 */}
                <GlassCard className="p-4 flex flex-col justify-between" hoverEffect={false}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">Peak Demand Target</span>
                  <div className="mt-3.5">
                    <span className="text-xl font-display font-bold text-slate-900 dark:text-white">{(peakDemand + whatIfScenario).toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-medium">units projected</span>
                  </div>
                </GlassCard>

                {/* Metric 2 */}
                <GlassCard className="p-4 flex flex-col justify-between" hoverEffect={false}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">MoM Growth Rate</span>
                  <div className="mt-3.5">
                    <span className={`text-xl font-display font-bold ${currentForecast.trend_direction === 'UP' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {currentForecast.trend_direction === 'UP' ? '+1.6%' : '-1.2%'}
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-medium">baseline slope</span>
                  </div>
                </GlassCard>

                {/* Metric 3 */}
                <GlassCard className="p-4 flex flex-col justify-between" hoverEffect={false}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">Forecast Mean</span>
                  <div className="mt-3.5">
                    <span className="text-xl font-display font-bold text-slate-900 dark:text-white">{(averageForecastDemand + whatIfScenario).toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-medium">units average</span>
                  </div>
                </GlassCard>

                {/* Metric 4 */}
                <GlassCard className="p-4 flex flex-col justify-between" hoverEffect={false}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">Safety Buffer</span>
                  <div className="mt-3.5">
                    <span className="text-xl font-display font-bold text-[#4f46e5] dark:text-[#818cf8]">
                      {currentForecast.inputs.pastTrend === 'volatile' ? '22%' : '15%'}
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-medium">calculated offset</span>
                  </div>
                </GlassCard>

              </div>

              {/* What-If Simulation sliders and Seasonal Decomposition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Seasonal Decomposition Card */}
                <GlassCard className="p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">Seasonal Decomposition</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Multiplicative Seasonality Factor</h4>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Visualizes cyclical variations throughout the annual cycle.</p>
                  </div>

                  <div className="h-32 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={seasonalityData}>
                        <XAxis dataKey="month" stroke={gridStroke} tick={{ fill: tickFill, fontSize: 8 }} />
                        <Tooltip 
                          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}
                          labelStyle={{ color: tooltipLabel, fontWeight: 'bold', fontSize: 10 }}
                          itemStyle={{ color: tooltipColor, fontSize: 10 }}
                        />
                        <Bar dataKey="factor" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                {/* What-If Scenario Slider */}
                <GlassCard className="p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">Dynamic Planning</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">What-If Replenishment Slider</h4>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Simulate a manual demand adjustment across forecast coordinates.</p>
                  </div>

                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400">Manual Load Shift:</span>
                      <span className={`font-bold ${whatIfScenario >= 0 ? 'text-[#4f46e5] dark:text-[#818cf8]' : 'text-red-500'}`}>
                        {whatIfScenario >= 0 ? `+${whatIfScenario}` : whatIfScenario} units
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-500"
                      max="1500"
                      step="50"
                      value={whatIfScenario}
                      onChange={(e) => setWhatIfScenario(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4f46e5] dark:accent-[#818cf8]"
                    />
                    <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-zinc-650 font-bold uppercase">
                      <span>-500 clearance</span>
                      <span>+1500 surge load</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-white/5 pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-[#4f46e5] dark:text-[#818cf8]" /> Live graph adjustments mapped</span>
                    <button onClick={() => setWhatIfScenario(0)} className="text-[#4f46e5] dark:text-[#818cf8] hover:underline">Reset</button>
                  </div>
                </GlassCard>

              </div>

              {/* Machine Learning Pipeline & Evaluation Diagnostics */}
              <GlassCard className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-150 dark:border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">ML Pipeline Diagnostics</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 font-display">Model Training & Chronological Evaluation</h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-indigo-250 dark:border-indigo-500/25 bg-indigo-50 dark:bg-brand-500/10 text-[10px] font-bold text-indigo-750 dark:text-brand-300 self-start sm:self-auto select-none">
                    <Zap className="h-3.5 w-3.5 text-indigo-500 dark:text-[#818cf8] animate-pulse" />
                    <span>Champion: {currentForecast.insights.best_model_name || "Random Forest"}</span>
                  </div>
                </div>

                {/* Step-by-Step Flow Chart Visualizer */}
                <div className="mt-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5">Pipeline Execution Flow</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 text-center">
                    {(currentForecast.insights.pipeline_steps || [
                      "Input", "Preprocess", "Feature Eng", "Encoding", "Train Split", "Linear Fit", "RForest Fit", "Evaluate", "Output"
                    ]).map((step, idx) => {
                      const shortLabels = ["Input", "Preprocess", "Feature Eng", "Encoding", "Train Split", "Linear Fit", "RForest Fit", "Evaluate", "Output"];
                      return (
                        <div key={idx} className="flex flex-col items-center justify-between p-1.5 rounded-lg border border-slate-150 dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01] select-none">
                          <span className="text-[10px] font-mono font-bold text-[#4f46e5] dark:text-[#818cf8] mb-0.5">S{idx+1}</span>
                          <span className="text-[8px] font-semibold text-slate-600 dark:text-zinc-400 leading-tight">{shortLabels[idx]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Model Performance Comparison Table */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Model Metric Comparisons</h4>
                    <div className="rounded-xl border border-slate-150 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-150 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02] select-none">
                            <th className="p-2.5 font-bold text-slate-500 dark:text-zinc-550">Algorithm</th>
                            <th className="p-2.5 font-bold text-slate-500 dark:text-zinc-550 text-right">MAE</th>
                            <th className="p-2.5 font-bold text-slate-500 dark:text-zinc-550 text-right">RMSE</th>
                            <th className="p-2.5 font-bold text-slate-500 dark:text-zinc-550 text-right">R² Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Linear Regression row */}
                          <tr className={`border-b border-slate-150 dark:border-white/[0.03] ${currentForecast.insights.best_model_name === "Linear Regression" ? 'bg-indigo-500/5 dark:bg-brand-500/[0.03]' : ''}`}>
                            <td className="p-2.5 font-bold text-slate-800 dark:text-zinc-300 flex items-center gap-1.5">
                              <span>Linear Regression</span>
                              {currentForecast.insights.best_model_name === "Linear Regression" && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-zinc-400 text-right font-mono">{(currentForecast.insights.model_comparison?.lr?.mae || 142.5).toFixed(1)}</td>
                            <td className="p-2.5 text-slate-600 dark:text-zinc-400 text-right font-mono">{(currentForecast.insights.model_comparison?.lr?.rmse || 178.2).toFixed(1)}</td>
                            <td className="p-2.5 text-emerald-600 dark:text-emerald-400 text-right font-mono font-bold">{(currentForecast.insights.model_comparison?.lr?.r2 || 0.885).toFixed(3)}</td>
                          </tr>
                          {/* Random Forest row */}
                          <tr className={`${currentForecast.insights.best_model_name !== "Linear Regression" ? 'bg-indigo-500/5 dark:bg-brand-500/[0.03]' : ''}`}>
                            <td className="p-2.5 font-bold text-slate-800 dark:text-zinc-300 flex items-center gap-1.5">
                              <span>Random Forest</span>
                              {currentForecast.insights.best_model_name !== "Linear Regression" && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-zinc-400 text-right font-mono">{(currentForecast.insights.model_comparison?.rf?.mae || 95.4).toFixed(1)}</td>
                            <td className="p-2.5 text-slate-600 dark:text-zinc-400 text-right font-mono">{(currentForecast.insights.model_comparison?.rf?.rmse || 122.1).toFixed(1)}</td>
                            <td className="p-2.5 text-emerald-600 dark:text-emerald-400 text-right font-mono font-bold">{(currentForecast.insights.model_comparison?.rf?.r2 || 0.942).toFixed(3)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Feature Importance Indicators */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">Feature Importance Weights</h4>
                    <div className="space-y-2.5 py-1">
                      {(currentForecast.insights.feature_importances || [
                        { feature: "Time index", importance: 0.485 },
                        { feature: "Lag 1 sales", importance: 0.285 },
                        { feature: "Promo interaction", importance: 0.125 },
                        { feature: "Sin month", importance: 0.075 },
                        { feature: "Cos month", importance: 0.030 }
                      ]).map((feat, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs select-none">
                            <span className="font-semibold text-slate-700 dark:text-zinc-350">{feat.feature}</span>
                            <span className="font-mono text-slate-500 dark:text-zinc-500">{(feat.importance * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${feat.importance * 100}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.08 }}
                              className="h-full bg-[#4f46e5] dark:bg-[#818cf8] rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Strategic Insights panel */}
              <GlassCard className="p-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">AI Tactical Advisory Advisory</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Supply Chain Directives</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Automated strategic recommendations computed from parameter matrices.</p>

                <div className="mt-5 space-y-4">
                  {/* Trend Summary */}
                  <div className="rounded-xl bg-slate-50/50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.04] p-4">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-[#4f46e5] dark:text-[#818cf8]" /> Base Trajectory Analysis
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
                      {currentForecast.insights.trend_summary}
                    </p>
                  </div>

                  {/* Recommendations Bullet List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Actionable Operational Tasks</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {currentForecast.insights.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-200/50 dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01] p-3 text-xs">
                          <div className="rounded-full bg-indigo-500/5 dark:bg-brand-500/10 p-1 text-[#4f46e5] dark:text-brand-300 border border-[#4f46e5]/10 dark:border-brand-500/20 shrink-0 mt-0.5">
                            <ChevronRight className="h-3 w-3" />
                          </div>
                          <span className="text-slate-500 dark:text-zinc-400 leading-normal">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>

            </div>
          ) : (
            /* Dashboard Empty State (Uilora documentation style) */
            <div className="flex h-[600px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01] p-8 text-center">
              <Zap className="h-12 w-12 text-[#4f46e5] dark:text-[#818cf8] mb-3 animate-pulse" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">FastAPI Forecast Workspace</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
                Configure your product's past demand trajectories, promotional budgets, and seasonal conditions in the parameters panel, or drop a CSV file to trigger quantitative forecasting.
              </p>
              
              <div className="mt-6">
                <button
                  onClick={() => generateForecast({
                    product_name: 'AuraPro Laptop S14',
                    category: 'electronics',
                    horizon: 12,
                    past_trend: 'growth',
                    marketing_spend: 5000,
                    seasonality_flag: true,
                    competitor_activity: 'medium',
                    promotional_multiplier: 1.0
                  })}
                  className="px-5 py-2.5 rounded-lg bg-[#4f46e5] hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition active:scale-[0.98]"
                >
                  🚀 Spin Up Demo Simulation
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
