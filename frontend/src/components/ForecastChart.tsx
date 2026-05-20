import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { useLuminaStore } from '../store/store';
import { TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

export const ForecastChart: React.FC = () => {
  const { currentForecast, theme } = useLuminaStore();

  if (!currentForecast) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.01] p-6 text-center">
        <AlertCircle className="h-10 w-10 text-slate-400 mb-2 animate-bounce" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">No Forecast Loaded</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mt-1">
          Configure the parameters on the left or upload a historical CSV to compile demand dynamics.
        </p>
      </div>
    );
  }

  const { historical_demand, forecasted_demand, product_name, category, trend_direction } = currentForecast;

  // Combine into single continuous chart dataset
  const chartData = [
    ...historical_demand.map(h => ({
      date: h.date,
      historical: h.demand,
      forecast: null,
      confidence: [h.demand, h.demand]
    })),
    // Anchor connection point from the last historical month to the first forecast
    {
      date: historical_demand[historical_demand.length - 1].date,
      historical: historical_demand[historical_demand.length - 1].demand,
      forecast: historical_demand[historical_demand.length - 1].demand,
      confidence: [historical_demand[historical_demand.length - 1].demand, historical_demand[historical_demand.length - 1].demand]
    },
    ...forecasted_demand.map(f => ({
      date: f.date,
      historical: null,
      forecast: f.demand,
      confidence: [f.lower_bound, f.upper_bound]
    }))
  ];

  const isDark = theme === 'dark';
  const isUp = trend_direction === 'UP';
  const isDown = trend_direction === 'DOWN';
  
  // Custom styling elements based on trend direction
  const strokeColor = isUp ? '#10b981' : isDown ? '#ef4444' : '#4f46e5';

  // Contrast-aware Recharts values
  const axisStroke = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.12)";
  const tickFill = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(15, 23, 42, 0.6)";
  const gridStroke = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(15, 23, 42, 0.05)";
  const refLineStroke = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 23, 42, 0.15)";
  const tooltipBg = isDark ? "#09090b" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.08)";
  const tooltipLabelColor = isDark ? "#a1a1aa" : "#64748b";

  // Custom tooltips showing nice stats
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isFore = data.forecast !== null && data.historical === null;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#09090b]/90 p-4 shadow-xl backdrop-blur-md">
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mb-1">{data.date}</p>
          {data.historical !== null && (
            <p className="text-xs font-semibold text-[#4f46e5] dark:text-indigo-400">
              Historical Sales: <span className="font-bold text-slate-900 dark:text-white">{data.historical.toLocaleString()} units</span>
            </p>
          )}
          {isFore && (
            <>
              <p className="text-xs font-semibold text-[#4f46e5] dark:text-indigo-400">
                Forecast Demand: <span className="font-bold text-slate-900 dark:text-white">{data.forecast.toLocaleString()} units</span>
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1.5 border-t border-slate-100 dark:border-white/5 pt-1.5">
                Confidence Band: <span className="text-slate-700 dark:text-zinc-300 font-semibold">{Math.round(data.confidence[0]).toLocaleString()} - {Math.round(data.confidence[1]).toLocaleString()}</span>
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {product_name} 
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#4f46e5]/5 border border-[#4f46e5]/10 text-[#4f46e5] dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20">
              {category.toUpperCase()}
            </span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Historical sales alongside forecast confidence thresholds</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-slate-200 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01] px-3.5 py-1.5 flex items-center gap-2.5">
            <div className={`h-2.5 w-2.5 rounded-full animate-pulse`} style={{ backgroundColor: strokeColor }} />
            <div>
              <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Trend Outlook</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                {trend_direction} TRAJECTORY
                <TrendingUp className="h-3.5 w-3.5" style={{ color: strokeColor, transform: isDown ? 'rotate(90deg)' : 'none' }} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Forecasting Area Chart */}
      <div className="relative h-[360px] w-full rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.01] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Historical Glow Fill */}
              <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
              {/* Forecast Confidence Band Fill */}
              <linearGradient id="colorFore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.16}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.01}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            
            <XAxis 
              dataKey="date" 
              stroke={axisStroke} 
              tick={{ fill: tickFill, fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            
            <YAxis 
              stroke={axisStroke} 
              tick={{ fill: tickFill, fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            
            <Tooltip content={<CustomTooltip />} />

            {/* Historical Area */}
            <Area 
              type="monotone" 
              dataKey="historical" 
              stroke="#4f46e5" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHist)" 
              dot={false}
            />

            {/* Forecast Confidence Interval Bounds */}
            <Area 
              type="monotone" 
              dataKey="confidence" 
              stroke="none" 
              fillOpacity={0.08}
              fill={strokeColor}
              connectNulls
            />

            {/* Forecast Area Line */}
            <Area 
              type="monotone" 
              dataKey="forecast" 
              stroke={strokeColor} 
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorFore)" 
              connectNulls
              dot={false}
            />

            {/* Split reference divider line */}
            <ReferenceLine 
              x={historical_demand[historical_demand.length - 1].date} 
              stroke={refLineStroke} 
              strokeDasharray="3 3"
              label={{ value: 'FORECAST HORIZON', position: 'top', fill: tickFill, fontSize: 8, fontWeight: 'bold' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
