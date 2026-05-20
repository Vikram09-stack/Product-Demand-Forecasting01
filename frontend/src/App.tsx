import React, { useEffect } from 'react';
import { useLuminaStore } from './store/store';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { StockGauges } from './components/StockGauges';
import { Profile } from './pages/Profile';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const { isAuthenticated, activeTab, theme, fetchHistory, fetchActivities } = useLuminaStore();

  // Dynamically set HTML class tag when theme boots/swaps
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Proactive background fetching when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
      fetchActivities();
    }
  }, [isAuthenticated, fetchHistory, fetchActivities]);

  // Page Routing manager
  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <Landing />;
      case 'dashboard':
        return isAuthenticated ? <Dashboard /> : <Login />;
      case 'probability':
        return isAuthenticated ? (
          <div className="p-4 sm:p-6 lg:p-8">
            <StockGauges />
          </div>
        ) : (
          <Login />
        );
      case 'profile':
        return isAuthenticated ? <Profile /> : <Login />;
      default:
        return <Landing />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#030303] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Navbar */}
      <Navbar />

      {/* Structured Screen Container */}
      {isAuthenticated ? (
        <div className="flex flex-row w-full flex-grow items-stretch overflow-hidden">
          {/* Sidebar Left Navigation */}
          <Sidebar />

          {/* Right Workspace Panel */}
          <div className="flex-grow overflow-y-auto h-[calc(100vh-56px)] bg-slate-50/40 dark:bg-[#060608]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full"
              >
                {renderActivePage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Full width viewport for guest/landing states */
        <main className="flex-grow w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>
      )}
    </div>
  );
};

export default App;
