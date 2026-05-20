import React, { useState, useEffect, useRef } from 'react';
import { useLuminaStore } from '../store/store';
import { GlassCard } from './GlassCard';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  Info, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SEGMENTS = [
  { id: 'electronics', name: 'Electronics', ticker: 'AAPL', company: 'Apple Inc.' },
  { id: 'apparel', name: 'Apparel', ticker: 'NKE', company: 'Nike Inc.' },
  { id: 'grocery', name: 'Grocery', ticker: 'WMT', company: 'Walmart Inc.' },
  { id: 'automotive', name: 'Automotive', ticker: 'TSLA', company: 'Tesla Inc.' },
  { id: 'other', name: 'Other', ticker: 'SPY', company: 'S&P 500 ETF' }
];

export const StockGauges: React.FC = () => {
  const {
    stockProbabilityData,
    ragResponse,
    isLoadingStock,
    fetchStockProbability,
    submitStockQueryRAG
  } = useLuminaStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('electronics');
  const [selectedHorizon, setSelectedHorizon] = useState<number>(3);
  const [queryInput, setQueryInput] = useState<string>('');
  const [expandedContextId, setExpandedContextId] = useState<number | null>(null);

  const [messages, setMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'assistant';
    text: string;
    retrievedContext?: any;
  }>>([
    {
      id: 1,
      sender: 'assistant',
      text: "👋 Welcome to the **Lumina Operations RAG Terminal**.\n\nI am fused directly with live **Yahoo Finance** market charts and standard **scikit-learn linear/random forest time-series projection models**.\n\nQuery me for semantic operational directives like:\n- *\"Assess safety stock buffers under current volatility indices\"*\n- *\"Evaluate Q4 pricing and marketing promotional elasticities\"*\n- *\"Run dual-supplier mitigation for segment supply disruption\"*"
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync with Live Yahoo Finance & Scikit-learn predictions on segment/timescale shift
  useEffect(() => {
    fetchStockProbability(selectedCategory, selectedHorizon);
  }, [selectedCategory, selectedHorizon, fetchStockProbability]);

  // Append backend RAG responses into conversation flow
  useEffect(() => {
    if (ragResponse && ragResponse.query) {
      // Avoid duplicate appends if already processed
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.sender === 'assistant' && lastMsg.text === ragResponse.response) {
          return prev;
        }
        return [
          ...prev,
          {
            id: Date.now(),
            sender: 'assistant',
            text: ragResponse.response,
            retrievedContext: ragResponse.retrieved_context
          }
        ];
      });
    }
  }, [ragResponse]);

  // Auto-scroll chat terminal
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Append User query
    const userMsgId = Date.now();
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: queryText
      }
    ]);
    setQueryInput('');

    try {
      await submitStockQueryRAG(queryText, selectedCategory, selectedHorizon);
    } catch (e) {
      console.error("RAG dispatch error: ", e);
    }
  };

  // Sparkline builder mapping last 30 closes
  const generateSparklinePoints = (history: any[]) => {
    if (!history || history.length === 0) return '0,15 100,15';
    const prices = history.map(h => h.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min === 0 ? 1 : max - min;
    const width = 120;
    const height = 30;
    const padding = 2;
    
    return history.map((h, i) => {
      const x = (i / (history.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((h.close - min) / range) * (height - padding * 2) - padding;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  // Basic markdown inline parser
  const renderFormattedMessage = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-350">
        {lines.map((line, i) => {
          let cleanLine = line.trim();
          
          if (cleanLine.startsWith('###')) {
            return (
              <h4 key={i} className="text-xs font-bold text-indigo-650 dark:text-indigo-400 mt-3 mb-1.5 flex items-center gap-1.5 font-display border-b border-slate-100 dark:border-white/5 pb-1">
                {cleanLine.replace('###', '').trim()}
              </h4>
            );
          }
          
          if (cleanLine.startsWith('-') || cleanLine.match(/^\d+\./)) {
            const isNumbered = !cleanLine.startsWith('-');
            const marker = isNumbered ? cleanLine.match(/^\d+\./)?.[0] : '•';
            const content = cleanLine.replace(/^(-\s*|\d+\.\s*)/, '').trim();
            return (
              <div key={i} className="flex items-start gap-1.5 pl-1.5 py-0.5">
                <span className="text-indigo-600 dark:text-brand-400 font-bold">{marker}</span>
                <span className="flex-1">{formatInlineStyles(content)}</span>
              </div>
            );
          }
          
          if (!cleanLine) return <div key={i} className="h-1" />;
          
          return <p key={i} className="my-0.5">{formatInlineStyles(cleanLine)}</p>;
        })}
      </div>
    );
  };

  const formatInlineStyles = (content: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const codeRegex = /`(.*?)`/g;
    
    let parts: React.ReactNode[] = [];
    const elements: { start: number; end: number; type: 'bold' | 'code'; text: string }[] = [];
    
    let match;
    while ((match = boldRegex.exec(content)) !== null) {
      elements.push({ start: match.index, end: match.index + match[0].length, type: 'bold', text: match[1] });
    }
    boldRegex.lastIndex = 0;
    
    while ((match = codeRegex.exec(content)) !== null) {
      elements.push({ start: match.index, end: match.index + match[0].length, type: 'code', text: match[1] });
    }
    codeRegex.lastIndex = 0;
    
    elements.sort((a, b) => a.start - b.start);
    
    if (elements.length === 0) return content;
    
    let lastIdx = 0;
    elements.forEach((el, index) => {
      if (el.start > lastIdx) {
        parts.push(content.substring(lastIdx, el.start));
      }
      
      if (el.type === 'bold') {
        parts.push(<strong key={`b-${index}`} className="font-bold text-slate-900 dark:text-white">{el.text}</strong>);
      } else if (el.type === 'code') {
        parts.push(<code key={`c-${index}`} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 font-mono text-[10px] text-indigo-650 dark:text-brand-300">{el.text}</code>);
      }
      
      lastIdx = el.end;
    });
    
    if (lastIdx < content.length) {
      parts.push(content.substring(lastIdx));
    }
    
    return <>{parts}</>;
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Horizon selector tab bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Supply-Chain Volatility Modeling</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Scikit-learn Monte Carlo forecasting models aligned to live tickers.</p>
        </div>

        <div className="flex items-center space-x-1 border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.01] rounded-xl p-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 px-2 select-none uppercase tracking-wider">Horizon:</span>
          {[1, 2, 3, 4, 5, 6].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedHorizon(m)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-tight transition-all duration-150 ${
                selectedHorizon === m
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* Segment Selector tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-white/5 pb-4">
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            onClick={() => setSelectedCategory(seg.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold tracking-tight transition-all duration-200 ${
              selectedCategory === seg.id
                ? 'bg-indigo-650 border-indigo-650 text-white shadow-sm'
                : 'bg-white dark:bg-white/[0.01] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
            }`}
          >
            <span>{seg.name}</span>
            <code className={`px-1.5 py-0.5 rounded text-[10px] font-mono leading-none ${
              selectedCategory === seg.id 
                ? 'bg-indigo-700/50 text-indigo-100' 
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
            }`}>{seg.ticker}</code>
          </button>
        ))}
      </div>

      {/* Ticker status deck */}
      {isLoadingStock && !stockProbabilityData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-2xl" />
          ))}
        </div>
      ) : stockProbabilityData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Price Card */}
          <GlassCard className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.05]" delay={0.05}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Live Price</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-xl font-bold font-display text-slate-900 dark:text-white">
                ${stockProbabilityData.current_price?.toFixed(2)}
              </span>
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                stockProbabilityData.mom_delta >= 0 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300'
              }`}>
                {stockProbabilityData.mom_delta >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                {Math.abs(stockProbabilityData.mom_delta).toFixed(2)}%
              </span>
            </div>
            <p className="text-[9px] text-slate-450 mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              Direct yfinance chart stream
            </p>
          </GlassCard>

          {/* Sparkline Card */}
          <GlassCard className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.05] flex flex-col justify-between" delay={0.1}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">30-Day Ticker Trend</span>
                <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-350 mt-0.5">{stockProbabilityData.ticker} Closes</p>
              </div>
              <svg width="100" height="30" className="overflow-visible text-indigo-500 dark:text-indigo-400">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  points={generateSparklinePoints(stockProbabilityData.history)}
                />
              </svg>
            </div>
            <p className="text-[9px] text-slate-450 mt-1">Stochastic historic alignment</p>
          </GlassCard>

          {/* Volatility Card */}
          <GlassCard className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.05]" delay={0.15}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Annualized Volatility</span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-xl font-bold font-display text-indigo-600 dark:text-brand-300">
                {stockProbabilityData.volatility_coefficient}%
              </span>
            </div>
            <p className="text-[9px] text-slate-450 mt-1">Computed scaling coefficient (daily std * √252)</p>
          </GlassCard>

          {/* Risk Level Card */}
          <GlassCard className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.05]" delay={0.2}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Disruption Index</span>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xl font-bold font-display text-slate-900 dark:text-white">
                {stockProbabilityData.risk_score}
              </span>
              <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                stockProbabilityData.risk_level === 'High' 
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300' 
                  : stockProbabilityData.risk_level === 'Moderate'
                  ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              }`}>
                {stockProbabilityData.risk_level}
              </span>
            </div>
            <p className="text-[9px] text-slate-450 mt-1">Fitted scikit-learn volatility risk</p>
          </GlassCard>
        </div>
      ) : null}

      {/* Main Quantitative Matrix Grid */}
      {isLoadingStock && !stockProbabilityData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="col-span-1 md:col-span-2 h-64 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-2xl" />
          <div className="col-span-1 h-64 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-2xl" />
        </div>
      ) : stockProbabilityData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Probability Rings Card */}
          <GlassCard className="col-span-1 md:col-span-2 flex flex-col justify-between p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.05]" delay={0.1}>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stochastic Modeling Outages</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Directional Horizon Probability shifts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fitted scikit-learn models predict probability distributions over horizon bounds.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6">
              {/* UP Gauge */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <svg className="absolute h-full w-full -rotate-90">
                    <circle cx="40" cy="40" r="32" className="stroke-slate-100 dark:stroke-white/[0.03] fill-none" strokeWidth="5" />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="32" 
                      className="stroke-emerald-500 fill-none transition-all duration-500" 
                      strokeWidth="5" 
                      strokeDasharray={201.06}
                      strokeDashoffset={201.06 - (stockProbabilityData.up / 100) * 201.06}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-base font-display font-bold text-slate-900 dark:text-white">{stockProbabilityData.up}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-805 dark:text-slate-200 flex items-center justify-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Bullish demand
                  </span>
                  <span className="block text-[10px] text-slate-450 mt-0.5">Market upward swings</span>
                </div>
              </div>

              {/* STABLE Gauge */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <svg className="absolute h-full w-full -rotate-90">
                    <circle cx="40" cy="40" r="32" className="stroke-slate-100 dark:stroke-white/[0.03] fill-none" strokeWidth="5" />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="32" 
                      className="stroke-indigo-550 dark:stroke-brand-500 fill-none transition-all duration-500" 
                      strokeWidth="5" 
                      strokeDasharray={201.06}
                      strokeDashoffset={201.06 - (stockProbabilityData.stable / 100) * 201.06}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-base font-display font-bold text-slate-900 dark:text-white">{stockProbabilityData.stable}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-805 dark:text-slate-200 flex items-center justify-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Consolidated flow
                  </span>
                  <span className="block text-[10px] text-slate-450 mt-0.5">Stable market thresholds</span>
                </div>
              </div>

              {/* DOWN Gauge */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <svg className="absolute h-full w-full -rotate-90">
                    <circle cx="40" cy="40" r="32" className="stroke-slate-100 dark:stroke-white/[0.03] fill-none" strokeWidth="5" />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="32" 
                      className="stroke-red-500 fill-none transition-all duration-500" 
                      strokeWidth="5" 
                      strokeDasharray={201.06}
                      strokeDashoffset={201.06 - (stockProbabilityData.down / 100) * 201.06}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-base font-display font-bold text-slate-900 dark:text-white">{stockProbabilityData.down}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-805 dark:text-slate-200 flex items-center justify-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Bearish contraction
                  </span>
                  <span className="block text-[10px] text-slate-450 mt-0.5">Inventory clearance speed</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-white/5 pt-3.5 flex items-center justify-between text-[10px] text-slate-450">
              <span className="flex items-center gap-1.5"><Info className="h-3 w-3 text-indigo-500 dark:text-indigo-400" /> Double-fitted Brownian trajectories</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Simulation completed</span>
            </div>
          </GlassCard>

          {/* Volatility Risk Level Gauge Speedometer */}
          <GlassCard className="col-span-1 flex flex-col justify-between p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.05]" delay={0.2}>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Asset Volatility metrics</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Stochastic depletion</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Integrated model diagnostics calculating total supply disruption index.</p>
            </div>

            {/* Speedometer Gauge */}
            <div className="flex flex-col items-center py-2 relative">
              <div className="relative h-16 w-32 overflow-hidden">
                <svg className="absolute h-32 w-32 top-0 left-0">
                  <path 
                    d="M 16,64 A 36,36 0 0,1 112,64" 
                    fill="none" 
                    className="stroke-slate-100 dark:stroke-white/[0.03]" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 16,64 A 36,36 0 0,1 112,64" 
                    fill="none" 
                    stroke="url(#speedGradient)" 
                    strokeWidth="6" 
                    strokeDasharray={150}
                    strokeDashoffset={150 - (stockProbabilityData.risk_score / 100) * 150}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="speedGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Pointer indicator */}
                <motion.div 
                  className="absolute bottom-0 left-[64px] h-10 w-0.5 bg-slate-900 dark:bg-white origin-bottom rounded-full"
                  style={{ transform: 'translateX(-50%)' }}
                  animate={{ rotate: -90 + (stockProbabilityData.risk_score / 100) * 180 }}
                  transition={{ type: "spring", stiffness: 45 }}
                />
              </div>
              <div className="text-center mt-2.5">
                <span className="text-xl font-display font-bold text-slate-900 dark:text-white">{stockProbabilityData.risk_score}</span>
                <span className="text-[9px] font-semibold text-slate-450 block tracking-widest uppercase mt-0.5">disruption score</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-150 dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01] p-2.5 flex items-center justify-between text-xs mt-2">
              <span className="text-slate-500 dark:text-slate-400 text-[10px]">Horizon profile:</span>
              <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                stockProbabilityData.risk_level === 'High' 
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-500/20' 
                  : stockProbabilityData.risk_level === 'Moderate'
                  ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200/50 dark:border-yellow-500/20'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-500/20'
              }`}>
                {stockProbabilityData.risk_level} Volatility
              </span>
            </div>
          </GlassCard>

        </div>
      ) : null}

      {/* Risk Depletion Heatmap & Scenario Cards */}
      {stockProbabilityData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Depletion Heatmap Card */}
          <GlassCard className="col-span-1 lg:col-span-2 flex flex-col justify-between p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.05]" delay={0.3}>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Replenishment margins</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Inventory Depletion Matrix</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Simulates buffer depletion. Red shows stockout exposures, green is safe holding capacity.</p>
            </div>

            <div className="grid grid-cols-12 gap-1.5 py-4">
              {Array.from({ length: 60 }).map((_, idx) => {
                let colorClass = "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20 dark:border-emerald-500/30";
                
                if (idx < stockProbabilityData.shortages_risk * 0.6) {
                  colorClass = "bg-red-500/20 dark:bg-red-500/30 border-red-500/30 dark:border-red-500/40 animate-pulse";
                } else if (idx < (stockProbabilityData.shortages_risk + 15) * 0.6) {
                  colorClass = "bg-yellow-500/20 dark:bg-yellow-500/30 border-yellow-500/35 dark:border-yellow-500/40";
                }
                
                return (
                  <div 
                    key={idx} 
                    className={`h-4.5 rounded border ${colorClass} transition-all duration-300 hover:scale-110`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-450 border-t border-slate-100 dark:border-white/5 pt-3.5 mt-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded bg-red-500" /> Out-of-stock</span>
                <span className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded bg-yellow-500" /> Buffer threshold</span>
                <span className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded bg-emerald-500" /> Safe</span>
              </div>
              <span className="font-semibold text-indigo-650 dark:text-brand-300">Safety Index: {100 - stockProbabilityData.shortages_risk}%</span>
            </div>
          </GlassCard>

          {/* Action Scenario Cards */}
          <GlassCard className="col-span-1 flex flex-col justify-between p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.05]" delay={0.4}>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Operational vectors</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Structured mitigations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated directives generated based on stock validation bounds.</p>
            </div>

            <div className="space-y-3.5 py-3">
              {/* Shortages Risk Panel */}
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01] p-3">
                <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-2 text-red-650 dark:text-red-300 border border-red-100 dark:border-red-500/20">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-805 dark:text-slate-200">Stockout Risk exposure: {stockProbabilityData.shortages_risk}%</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                    High likelihood of localized safety count shrinkage. Bolster buffer triggers.
                  </p>
                </div>
              </div>

              {/* Surplus/Wastage Panel */}
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01] p-3">
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-500/10 p-2 text-yellow-650 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-500/20">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-805 dark:text-slate-200">Surplus inventory drift: {stockProbabilityData.surplus_risk}%</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                    High model trend deviation risk. Keep storage capacity lean in main facilities.
                  </p>
                </div>
              </div>

              {/* Safety Match */}
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01] p-3">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-2 text-emerald-650 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-805 dark:text-slate-200">System Alignment Locked</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Active JIT triggers optimally mapped against historical baseline speeds.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

        </div>
      )}

      {/* AI Operations RAG Generative Terminal */}
      <GlassCard className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.05] flex flex-col space-y-4" delay={0.5}>
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-650 dark:text-brand-300 bg-indigo-50 dark:bg-indigo-550/15 border border-indigo-150 dark:border-brand-500/20 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3 animate-pulse" /> Live Quantitative RAG Assistant
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">Lumina Operations Generative Terminal</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Queries real-time Yahoo Finance metrics and scikit-learn weights to generate semantic supply chain operational advisories.
            </p>
          </div>
        </div>

        {/* Chat Scrolling body */}
        <div className="h-64 border border-slate-150 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl p-4 overflow-y-auto space-y-4 font-sans text-xs">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-slate-900 border-slate-900 text-white' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-indigo-600 dark:text-indigo-400'
              }`}>
                {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>

              <div className="space-y-2">
                <div className={`p-3 rounded-2xl border text-xs shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 border-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-white/[0.04] text-slate-800 dark:text-slate-250 rounded-tl-none'
                }`}>
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    renderFormattedMessage(msg.text)
                  )}
                </div>

                {/* Retrieved Context Expandable Container */}
                {msg.sender === 'assistant' && msg.retrievedContext && (
                  <div className="border border-slate-150 dark:border-white/[0.03] bg-white/50 dark:bg-slate-900/10 rounded-xl p-2 max-w-full">
                    <button
                      onClick={() => setExpandedContextId(expandedContextId === msg.id ? null : msg.id)}
                      className="flex items-center justify-between w-full text-[10px] font-bold text-slate-450 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350 transition-colors"
                    >
                      <span className="flex items-center gap-1.5 uppercase tracking-wider">
                        <Maximize2 className="h-2.5 w-2.5 text-indigo-500" />
                        Retrieved RAG Parameters Context
                      </span>
                      {expandedContextId === msg.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedContextId === msg.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded-lg">
                            <div>Ticker Reference: <span className="text-slate-805 dark:text-slate-200 font-bold">{msg.retrievedContext.ticker}</span></div>
                            <div>Valuation Index: <span className="text-slate-805 dark:text-slate-200">${msg.retrievedContext.current_price?.toFixed(2)}</span></div>
                            <div>Vol (Annualized): <span className="text-slate-850 dark:text-indigo-300 font-bold">{msg.retrievedContext.volatility}%</span></div>
                            <div>Stochastic Up: <span className="text-emerald-555 dark:text-emerald-450 font-bold">{msg.retrievedContext.probability_up}%</span></div>
                            <div>Stochastic Down: <span className="text-red-555 dark:text-red-450 font-bold">{msg.retrievedContext.probability_down}%</span></div>
                            <div>Stochastic Stable: <span className="text-indigo-555 dark:text-indigo-400 font-bold">{msg.retrievedContext.probability_stable}%</span></div>
                            <div className="col-span-2 mt-1 border-t border-slate-100 dark:border-white/5 pt-1">
                              Semantic Vector Focus: <span className="text-slate-800 dark:text-white font-bold">{
                                msg.text.toLowerCase().includes('safety') || msg.text.toLowerCase().includes('buffer')
                                  ? 'SAFETY_STOCK_INDEX'
                                  : msg.text.toLowerCase().includes('marketing') || msg.text.toLowerCase().includes('promotion')
                                  ? 'MARKETING_PRICE_ELASTICITY'
                                  : msg.text.toLowerCase().includes('volatility') || msg.text.toLowerCase().includes('mitigate')
                                  ? 'RISK_MITIGATION_CONTRACTS'
                                  : 'GENERAL_JIT_PLANNING'
                              }</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoadingStock && messages[messages.length - 1]?.sender === 'user' && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="h-8 w-8 rounded-full border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-indigo-650 flex items-center justify-center shrink-0">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              </div>
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/[0.04] p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 text-xs text-slate-450">
                <span>Lumina RAG is consulting yfinance charts and ML weights</span>
                <span className="flex gap-0.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Preset Prompt Pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Safety Stock Buffer", text: "Assess safety stock buffers under current volatility indices" },
            { label: "Campaign Promotions", text: "Evaluate marketing and promotions under Q4 elasticities" },
            { label: "Disruption Hedging", text: "Run dual-supplier mitigation for segment supply disruption" }
          ].map((pill, idx) => (
            <button
              key={idx}
              disabled={isLoadingStock}
              onClick={() => handleSendQuery(pill.text)}
              className="text-[10px] font-medium px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/[0.05] bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.01] dark:hover:bg-white/[0.03] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* TextInput row */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(queryInput);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            disabled={isLoadingStock}
            placeholder="Ask Lumina RAG advisor regarding safety levels, promotional margins or volatility hedge..."
            className="flex-1 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoadingStock || !queryInput.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </GlassCard>

    </div>
  );
};
