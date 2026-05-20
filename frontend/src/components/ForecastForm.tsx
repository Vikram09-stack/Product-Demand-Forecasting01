import React, { useState, useRef } from 'react';
import { useLuminaStore, ForecastInput } from '../store/store';
import { Sliders, Upload, RefreshCw, FileText } from 'lucide-react';

export const ForecastForm: React.FC = () => {
  const { generateForecast, uploadCSV, isLoadingForecast, theme } = useLuminaStore();
  const [activeMode, setActiveMode] = useState<'form' | 'csv'>('form');

  // Form State
  const [formData, setFormData] = useState<ForecastInput>({
    product_name: 'Quantum Core Processor V5',
    category: 'electronics',
    horizon: 12,
    past_trend: 'growth',
    marketing_spend: 8500,
    seasonality_flag: true,
    competitor_activity: 'medium',
    promotional_multiplier: 1.0,
  });

  // CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvProductName, setCsvProductName] = useState('Historical Dataset Product');
  const [csvCategory, setCsvCategory] = useState('electronics');
  const [csvHorizon, setCsvHorizon] = useState(12);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number' || name === 'promotional_multiplier' || name === 'horizon') {
      parsedValue = Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateForecast(formData);
  };

  // Drag and Drop File Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleCSVSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    await uploadCSV(csvFile, csvProductName, csvCategory, csvHorizon);
  };

  const isDark = theme === 'dark';

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#09090b] p-1 shadow-sm transition-colors duration-200">
      
      {/* Mode Selector Tab */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-50 dark:bg-zinc-950 p-1 border border-slate-100 dark:border-white/[0.04] select-none">
        <button
          type="button"
          onClick={() => setActiveMode('form')}
          className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
            activeMode === 'form'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Form Console</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('csv')}
          className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
            activeMode === 'csv'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>CSV Engine</span>
        </button>
      </div>

      <div className="p-4 pt-5">
        {activeMode === 'form' ? (
          /* Parameter Form */
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Product Name */}
            <div>
              <label htmlFor="product_name" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                Product Name
              </label>
              <input
                id="product_name"
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleFormChange}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/30 px-3 py-2 text-xs text-slate-800 dark:text-white focus:border-[#4f46e5] dark:focus:border-indigo-500 focus:outline-none transition duration-150"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs text-slate-800 dark:text-white focus:border-[#4f46e5] dark:focus:border-indigo-500 focus:outline-none transition duration-150"
                >
                  <option value="electronics">Electronics</option>
                  <option value="apparel">Apparel</option>
                  <option value="grocery">Grocery</option>
                  <option value="automotive">Automotive</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Past Trend */}
              <div>
                <label htmlFor="past_trend" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                  Past Trend
                </label>
                <select
                  id="past_trend"
                  name="past_trend"
                  value={formData.past_trend}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs text-slate-800 dark:text-white focus:border-[#4f46e5] dark:focus:border-indigo-500 focus:outline-none transition duration-150"
                >
                  <option value="growth">Growth (+MoM)</option>
                  <option value="stable">Stable (Flat)</option>
                  <option value="decline">Decline (-MoM)</option>
                  <option value="volatile">Volatile (Choppy)</option>
                </select>
              </div>
            </div>

            {/* Forecast Horizon slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="horizon" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Forecast Horizon
                </label>
                <span className="text-xs font-bold text-[#4f46e5] dark:text-[#818cf8]">{formData.horizon} Months</span>
              </div>
              <input
                id="horizon"
                type="range"
                name="horizon"
                min="1"
                max="24"
                value={formData.horizon}
                onChange={handleFormChange}
                className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4f46e5] dark:accent-[#818cf8]"
              />
            </div>

            {/* Marketing Spend */}
            <div>
              <label htmlFor="marketing_spend" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                Marketing Budget (USD/month)
              </label>
              <input
                id="marketing_spend"
                type="number"
                name="marketing_spend"
                min="0"
                value={formData.marketing_spend}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/30 px-3 py-2 text-xs text-slate-800 dark:text-white focus:border-[#4f46e5] dark:focus:border-indigo-500 focus:outline-none transition duration-150"
              />
            </div>

            {/* Competitor Activity */}
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                Competitor Activity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, competitor_activity: level }))}
                    className={`py-1.5 rounded-lg text-[10px] font-bold uppercase border transition duration-150 ${
                      formData.competitor_activity === level
                        ? 'bg-[#4f46e5]/5 border-[#4f46e5]/30 text-[#4f46e5] dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-300'
                        : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:text-slate-800 dark:bg-white/[0.01] dark:border-white/[0.05] dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Promotional Multiplier Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="promotional_multiplier" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Promotional Multiplier
                </label>
                <span className="text-xs font-bold text-[#4f46e5] dark:text-[#818cf8]">{formData.promotional_multiplier.toFixed(2)}x</span>
              </div>
              <input
                id="promotional_multiplier"
                type="range"
                name="promotional_multiplier"
                min="1.0"
                max="2.0"
                step="0.05"
                value={formData.promotional_multiplier}
                onChange={handleFormChange}
                className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4f46e5] dark:accent-[#818cf8]"
              />
            </div>

            {/* Seasonality Checkbox Toggle */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-4">
              <div>
                <label htmlFor="seasonality_flag" className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Enable Seasonality Effects
                </label>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Applies historical cyclical trends based on category</p>
              </div>
              <input
                id="seasonality_flag"
                type="checkbox"
                name="seasonality_flag"
                checked={formData.seasonality_flag}
                onChange={handleFormChange}
                className="h-4 w-4 rounded border-slate-350 bg-white text-[#4f46e5] focus:ring-[#4f46e5] dark:border-white/10 dark:bg-zinc-800 dark:text-brand-600 dark:focus:ring-brand-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoadingForecast}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-[#4f46e5] hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoadingForecast ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Computing Models...</span>
                </>
              ) : (
                <>
                  <span>Compile AI Forecast</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* CSV Upload Mode */
          <form onSubmit={handleCSVSubmit} className="space-y-4">
            
            {/* Product Name */}
            <div>
              <label htmlFor="csv_product_name" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                Product Name
              </label>
              <input
                id="csv_product_name"
                type="text"
                value={csvProductName}
                onChange={(e) => setCsvProductName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/30 px-3 py-2 text-xs text-slate-800 dark:text-white focus:border-[#4f46e5] dark:focus:border-indigo-500 focus:outline-none transition duration-150"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="csv_category" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                  Category
                </label>
                <select
                  id="csv_category"
                  value={csvCategory}
                  onChange={(e) => setCsvCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs text-slate-800 dark:text-white focus:border-[#4f46e5] dark:focus:border-indigo-500 focus:outline-none transition duration-150"
                >
                  <option value="electronics">Electronics</option>
                  <option value="apparel">Apparel</option>
                  <option value="grocery">Grocery</option>
                  <option value="automotive">Automotive</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Horizon */}
              <div>
                <label htmlFor="csv_horizon" className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                  Horizon
                </label>
                <select
                  id="csv_horizon"
                  value={csvHorizon}
                  onChange={(e) => setCsvHorizon(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs text-slate-800 dark:text-white focus:border-[#4f46e5] dark:focus:border-indigo-500 focus:outline-none transition duration-150"
                >
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                  <option value={18}>18 Months</option>
                  <option value={24}>24 Months</option>
                </select>
              </div>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center border border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                dragOver 
                  ? 'border-[#4f46e5] bg-[#4f46e5]/5 dark:border-indigo-500 dark:bg-indigo-500/5' 
                  : csvFile 
                  ? 'border-emerald-500/40 bg-emerald-500/5' 
                  : 'border-slate-200 hover:border-slate-350 dark:border-white/10 dark:bg-white/[0.01] dark:hover:bg-white/[0.02]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv"
                className="hidden"
              />
              
              {csvFile ? (
                <>
                  <FileText className="h-8 w-8 text-emerald-500 mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 max-w-xs truncate">{csvFile.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{(csvFile.size / 1024).toFixed(1)} KB • Swap file</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400 dark:text-zinc-600 mb-2" />
                  <p className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">Drag & Drop sales CSV, or <span className="text-[#4f46e5] dark:text-[#818cf8] underline">browse</span></p>
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 mt-1 max-w-[180px]">Format: 'date' (YYYY-MM), 'sales' (units)</p>
                </>
              )}
            </div>

            {/* Seed Demo Link */}
            <div className="text-center pt-2 select-none">
              <button
                type="button"
                onClick={() => {
                  const csvContent = "date,sales\n2025-01,1200\n2025-02,1300\n2025-03,1450\n2025-04,1600\n2025-05,1550\n2025-06,1700\n2025-07,1850\n2025-08,1900\n2025-09,1950\n2025-10,2100\n2025-11,2500\n2025-12,2800";
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const file = new File([blob], 'aura_pro_sales.csv', { type: 'text/csv' });
                  setCsvFile(file);
                  setCsvProductName('Quantum Core Processor');
                  setCsvCategory('electronics');
                }}
                className="text-[9px] text-[#4f46e5] dark:text-[#818cf8] hover:underline font-bold uppercase tracking-wide"
              >
                💡 Seed Simulated Demo CSV file
              </button>
            </div>

            {/* Submit CSV */}
            <button
              type="submit"
              disabled={isLoadingForecast || !csvFile}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-[#4f46e5] hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoadingForecast ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Analyzing Dataset...</span>
                </>
              ) : (
                <>
                  <span>Parse & Forecast CSV</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
