import React, { useState } from 'react';
import { useLuminaStore, ForecastResult } from '../store/store';
import { GlassCard } from '../components/GlassCard';
import { User, Calendar, History, Trash2, ArrowUpRight, BarChart3, Search, Clock, ShieldAlert } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, forecastHistory, activities, clearData, currentForecast } = useLuminaStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Access the main store hook directly to write to it
  const setStoreState = useLuminaStore.setState;

  const handleReloadForecast = (forecast: ForecastResult) => {
    setStoreState({ currentForecast: forecast, activeTab: 'dashboard' });
  };

  const handleResetWorkspace = async () => {
    if (confirm("Are you sure you want to clear your forecast logs and user audit trail?")) {
      await clearData();
    }
  };

  // Filter activity logs based on search term
  const filteredActivities = activities.filter(act => 
    act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.action_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-white/5 pb-5 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Console Profile Hub</h1>
          <p className="text-xs text-slate-505 dark:text-zinc-400">Manage saved forecasts, explore system operations, and audit console logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: User Card & Control Panels */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User Card */}
          {user && (
            <GlassCard className="text-center p-6 flex flex-col items-center" hoverEffect={false}>
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-[#4f46e5] blur-md opacity-20 dark:opacity-40 animate-pulse" />
                <div className="relative h-20 w-20 rounded-2xl border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-4xl font-bold text-white shadow-lg select-none">
                  {user.full_name ? user.full_name.charAt(0) : 'V'}
                </div>
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-4">{user.full_name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#4f46e5]/5 text-[#4f46e5] border border-[#4f46e5]/10 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/25 mt-1.5">
                Guest Quantitative Analyst
              </span>
              
              <div className="w-full border-t border-slate-100 dark:border-white/5 mt-6 pt-5 space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-zinc-500 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Account:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-zinc-500 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Member Since:</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-300">May 2026</span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Settings / System Reset Card */}
          <GlassCard className="p-6 space-y-4" hoverEffect={false}>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Console Operations</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Control panels to reset database variables.</p>
            </div>
            
            <button
              onClick={handleResetWorkspace}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-400 font-bold text-xs transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset Database Workspace</span>
            </button>
          </GlassCard>
          
        </div>

        {/* Right Column: Saved Runs & Audit Timeline */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Saved Forecast Runs Gallery */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display tracking-tight">Saved Analytical Runs</h3>
            
            {forecastHistory.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01] p-8 text-center text-xs text-slate-500">
                No saved forecasting models compiled. Generate runs on the forecaster dashboard.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {forecastHistory.map((run) => (
                  <GlassCard 
                    key={run.id} 
                    className="p-5 flex flex-col justify-between cursor-pointer border border-slate-200 hover:border-[#4f46e5]/30 dark:border-white/[0.06] dark:hover:border-brand-500/40 relative group"
                    onClick={() => handleReloadForecast(run)}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#4f46e5] bg-[#4f46e5]/5 border border-[#4f46e5]/10 dark:text-brand-300 dark:bg-brand-500/10 dark:border-brand-500/15 px-2 py-0.5 rounded">
                          {run.category}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">{run.horizon} Months</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-2 group-hover:text-[#4f46e5] dark:group-hover:text-brand-300 transition">{run.product_name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                        {run.insights.trend_summary}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-white/5 mt-4 pt-3 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
                      <span>{new Date(run.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 font-semibold text-[#4f46e5] dark:text-[#818cf8] group-hover:underline">
                        Load Model <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Audit Timeline / Activity Feed */}
          <GlassCard className="p-6 space-y-4" hoverEffect={false}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
                  <History className="h-4 w-4 text-[#4f46e5] dark:text-indigo-400" /> Operational Audit Trail
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Real-time system events compiled from backend session logs.</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#4f46e5] focus:outline-none transition w-full sm:w-48 dark:border-white/[0.08] dark:bg-zinc-900/30 dark:text-white dark:focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Timeline Tree */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-4">
              {filteredActivities.length === 0 ? (
                <div className="text-center text-xs text-slate-400 dark:text-zinc-500 py-6">
                  No operational activities match filters.
                </div>
              ) : (
                <div className="relative border-l border-slate-200 dark:border-white/10 pl-6 ml-3 space-y-6">
                  {filteredActivities.map((act) => {
                    const isAlert = act.action_type === 'CLEAR_DATA';
                    const isSetup = act.action_type === 'SYSTEM_INIT';
                    const indicatorColor = isAlert ? 'bg-red-500' : isSetup ? 'bg-indigo-500' : 'bg-indigo-600';

                    return (
                      <div key={act.id} className="relative group">
                        {/* Bullet point on border */}
                        <div className={`absolute -left-[30px] top-1.5 h-2 w-2 rounded-full border border-white dark:border-[#030303] ${indicatorColor}`} />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            {act.action_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-450 dark:text-zinc-500 font-semibold flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{act.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
};
