import React, { useState } from 'react';
import { useLuminaStore } from '../store/store';
import { Sparkles, Sun, Moon, Search, Heart, LayoutGrid, HelpCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, activeTab, setActiveTab, theme, toggleTheme } = useLuminaStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogoClick = () => {
    setActiveTab(isAuthenticated ? 'dashboard' : 'landing');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-[#030303]/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          
          {/* Logo & Branding */}
          <div 
            onClick={handleLogoClick} 
            className="flex cursor-pointer items-center space-x-2 shrink-0"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4f46e5] text-white shadow-sm shadow-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Lumina<span className="text-[#4f46e5] dark:text-[#818cf8]">Forecast</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 tracking-wider">v2.4</span>
          </div>

          {/* Center Search Bar Simulator (Uilora Style) */}
          <div className="hidden md:flex items-center relative mx-4 flex-grow max-w-sm">
            <div className="w-full flex items-center space-x-2 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-900/40 text-xs text-slate-400 dark:text-zinc-500 hover:border-slate-300 dark:hover:border-white/10 transition duration-150">
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search ML simulations..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="flex-grow bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-zinc-600 text-xs py-0.5"
              />
              <span className="text-[9px] font-mono border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-1 py-0.5 rounded shrink-0">⌘K</span>
            </div>

            {/* Quick search autocomplete results popover */}
            <AnimatePresence>
              {searchFocused && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] p-2 shadow-xl z-50 text-xs"
                >
                  <p className="font-bold text-[9px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2 py-1">Quick Actions</p>
                  <button 
                    onMouseDown={() => setActiveTab('dashboard')}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 flex items-center justify-between"
                  >
                    <span>Run Demand Forecast Simulation</span>
                    <span className="text-[10px] text-indigo-500">Go</span>
                  </button>
                  <button 
                    onMouseDown={() => setActiveTab('probability')}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 flex items-center justify-between"
                  >
                    <span>Calculate Volatility safety buffers</span>
                    <span className="text-[10px] text-indigo-500">Go</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side Switches & Actions */}
          <div className="flex items-center space-x-3 shrink-0">
            
            {/* Segment Toggle Switch (Uilora Style) */}
            <div className="hidden sm:flex items-center rounded-lg bg-slate-100 dark:bg-zinc-900 p-0.5 border border-slate-200 dark:border-white/5 text-[9px] font-bold tracking-wider uppercase select-none shrink-0">
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-zinc-700/20">Web</span>
              <span className="px-2 py-0.5 text-slate-400 dark:text-zinc-500">App</span>
            </div>

            {/* Heart and bell secondary placeholders */}
            <button className="hidden sm:flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-900/40 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition">
              <Heart className="h-3.5 w-3.5" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-900/40 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-indigo-400" /> : <Moon className="h-3.5 w-3.5 text-slate-600" />}
            </button>

            {/* Console Access / Profile Indicator */}
            {!isAuthenticated ? (
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center justify-center px-3 py-1 rounded-md text-[11px] font-bold bg-[#4f46e5] text-white hover:bg-indigo-500 shadow-sm transition transform active:scale-[0.98] select-none"
              >
                Console Access
              </button>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-white/5 bg-[#4f46e5]/10 text-[#4f46e5] dark:text-[#818cf8] font-bold text-xs select-none">
                {user?.full_name?.charAt(0) || 'V'}
              </div>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};
