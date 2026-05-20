import React from 'react';
import { useLuminaStore } from '../store/store';
import { BarChart3, TrendingUp, User, LogOut, ChevronDown, Activity, Settings, Shield } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, activeTab, setActiveTab, logout } = useLuminaStore();

  const handleTabClick = (tab: 'landing' | 'dashboard' | 'probability' | 'profile') => {
    setActiveTab(tab);
  };

  return (
    <aside className="w-64 border-r border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#030303] flex flex-col justify-between h-[calc(100vh-56px)] sticky top-14 select-none shrink-0 transition-colors duration-200">
      
      {/* Navigation Links */}
      <div className="flex-grow py-6 px-3 overflow-y-auto space-y-7">
        
        {/* Section 1: GET STARTED */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Get Started
            </span>
            <ChevronDown className="h-3 w-3 text-slate-300 dark:text-zinc-600" />
          </div>
          
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Forecast Workspace</span>
          </button>

          <button
            onClick={() => handleTabClick('probability')}
            className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'probability'
                ? 'bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Stock Volatility</span>
          </button>
        </div>

        {/* Section 2: ANALYTICS CORE */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              System Audit
            </span>
            <ChevronDown className="h-3 w-3 text-slate-300 dark:text-zinc-600" />
          </div>

          <button
            onClick={() => handleTabClick('profile')}
            className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'profile'
                ? 'bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile Feed & Audit</span>
          </button>

          <button
            onClick={() => handleTabClick('profile')}
            className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-slate-400/80 dark:text-zinc-600 cursor-not-allowed"
            disabled
          >
            <Settings className="h-3.5 w-3.5" />
            <span>System Settings</span>
          </button>
        </div>

        {/* Section 3: METRIC BADGES (Extra Premium Touch) */}
        <div className="px-3 pt-2">
          <div className="rounded-lg border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              <span>Simulation Status</span>
              <span className="text-emerald-500 animate-pulse">Online</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-zinc-400">
              VistaPeak Engine is running synced. SQLite transactions are logged to active logs.
            </p>
          </div>
        </div>

      </div>

      {/* User Profile Card widget (Uilora Style - Pinned Bottom-Left) */}
      {user && (
        <div className="p-3 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/30 dark:bg-zinc-950/10">
          <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#09090b]">
            <div className="flex items-center space-x-2 min-w-0">
              {/* Initials Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4f46e5] text-white text-xs font-bold shadow-sm shadow-indigo-500/10 select-none">
                {user.full_name ? user.full_name.charAt(0) : 'V'}
              </div>
              {/* User Identity */}
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                  {user.full_name || 'Vikram Rehni'}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 truncate">
                  {user.email || 'vikram@lumina.ai'}
                </span>
              </div>
            </div>
            {/* Sleek Log Out Icon Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 rounded-md text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

    </aside>
  );
};
