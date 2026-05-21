import React, { useEffect, useRef } from 'react';
import { useLuminaStore } from '../store/store';
import { Sparkles, ArrowRight, Play, Cpu, ShieldCheck, Database, HelpCircle } from 'lucide-react';

export const Landing: React.FC = () => {
  const { login, theme } = useLuminaStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  // High-precision trigonometric wireframe mesh canvas simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY - 56; // Adjust for Top Navbar height
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // 3D perspective grid configurations
    const cols = 35;
    const rows = 28;
    const fov = 340;
    const cy = height * 0.58; // Center Y of perspective plane

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const isDarkTheme = document.documentElement.classList.contains('dark');
      
      // Strict monochromatic line styling
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = isDarkTheme 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(15, 23, 42, 0.045)';

      const time = Date.now() * 0.0006;
      const cx = width * 0.65; // Shift grid focus to the right side of the screen

      // 1. Generate 3D grid points
      const points: { x: number; y: number }[][] = [];

      for (let r = 0; r < rows; r++) {
        points[r] = [];
        for (let c = 0; c < cols; c++) {
          // Centered width coordinate and depth coordinate
          const x3d = (c - cols / 2) * 58;
          const z3d = r * 38 + 90;

          // Triple-sinusoid wave generator representing high-fidelity physics
          let y3d = Math.sin(c * 0.16 + time * 1.5) * Math.cos(r * 0.12 + time * 1.2) * 44;
          y3d += Math.sin(r * 0.22 - time * 0.8) * 16;
          y3d += Math.cos((c + r) * 0.1 + time) * 10;

          // Proximity mouse warping (bends the mathematical grid)
          if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
            const scaleProj = fov / (z3d + fov * 0.15);
            const rawProjX = cx + x3d * scaleProj;
            const rawProjY = cy + y3d * scaleProj;

            const dist = Math.hypot(rawProjX - mouseRef.current.x, rawProjY - mouseRef.current.y);
            if (dist < 180) {
              const force = (180 - dist) / 180;
              y3d += force * 85; // Bends the wireframe lines downward
            }
          }

          // Screen projection
          const scaleProj = fov / (z3d + fov * 0.15);
          points[r][c] = {
            x: cx + x3d * scaleProj,
            y: cy + y3d * scaleProj
          };
        }
      }

      // 2. Draw horizontal grid lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        ctx.moveTo(points[r][0].x, points[r][0].y);
        for (let c = 1; c < cols; c++) {
          ctx.lineTo(points[r][c].x, points[r][c].y);
        }
        ctx.stroke();
      }

      // 3. Draw vertical grid lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        ctx.moveTo(points[0][c].x, points[0][c].y);
        for (let r = 1; r < rows; r++) {
          ctx.lineTo(points[r][c].x, points[r][c].y);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleDemoAccess = () => {
    login('guest.analyst@luminaforecast.ai');
  };

  return (
    <div className="relative min-h-[calc(100vh-56px)] w-full overflow-hidden flex flex-col justify-between select-none bg-white dark:bg-[#030303] transition-colors duration-200">
      
      {/* High-precision wireframe canvas overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Main Grid Content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Small uppercase tag */}
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#4f46e5] dark:text-[#818cf8]">
              <span>Quantitative Supply Chain Intelligence</span>
            </div>

            {/* Asymmetric bold cinematic headline */}
            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
              AI Demand Forecasting.<br />
              <span className="text-[#4f46e5] dark:text-[#818cf8]">
                Real-Time Predictive Insights.
              </span>
            </h1>

            {/* Premium, spaced description */}
            <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              VistaPeak AI integrates proprietary machine learning models directly into your supply chain ledger. 
              Generate seasonal decompositions, compute Monte Carlo probabilities, and rightsizing buffers with pixel-perfect layouts.
            </p>

            {/* Clean border actions */}
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={handleDemoAccess}
                className="flex items-center space-x-2 rounded-md bg-[#4f46e5] px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm transition active:scale-[0.98]"
              >
                <span>Access Free Sandbox</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              
              <button
                onClick={handleDemoAccess}
                className="flex items-center space-x-2 rounded-md border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-900/40 px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white hover:border-slate-350 dark:hover:border-white/10 transition active:scale-[0.98]"
              >
                <span>API Documentation</span>
              </button>
            </div>

          </div>

        </div>

        {/* Dynamic Card Showcase Grid (Uilora documentation style) */}
        <div className="mt-28 w-full">
          {/* Section tag (Uilora capsule indicator) */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-3.5 w-1 rounded-full bg-[#4f46e5] dark:bg-[#818cf8]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-display">Core Compute Core</h2>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500">3 MODULES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1 */}
            <div className="glass-panel p-5 rounded-xl flex flex-col justify-between h-44 hover:border-slate-300 dark:hover:border-white/10 transition duration-200">
              <div className="rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 p-2.5 text-[#4f46e5] dark:text-[#818cf8] w-fit">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100 font-display">Prophesy ML Core</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-normal">
                  Multi-variable simulator analyzing baseline linear growth, cyclic seasonality vectors, and promotional budgets.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-5 rounded-xl flex flex-col justify-between h-44 hover:border-slate-300 dark:hover:border-white/10 transition duration-200">
              <div className="rounded-lg bg-[#4f46e5]/5 dark:bg-[#4f46e5]/10 border border-[#4f46e5]/10 dark:border-[#4f46e5]/20 p-2.5 text-[#4f46e5] dark:text-[#818cf8] w-fit">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100 font-display">Stochastic Volatility</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-normal">
                  Computes inventory safety buffers using dynamic variance models and Monte Carlo probability calculations.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-5 rounded-xl flex flex-col justify-between h-44 hover:border-slate-300 dark:hover:border-white/10 transition duration-200">
              <div className="rounded-lg bg-[#4f46e5]/5 dark:bg-[#4f46e5]/10 border border-[#4f46e5]/10 dark:border-[#4f46e5]/20 p-2.5 text-[#4f46e5] dark:text-[#818cf8] w-fit">
                <Database className="h-4 w-4" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100 font-display">Relational Audit Logs</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-normal">
                  Relational SQLite database persistence layer tracking simulation inputs and operational audit actions automatically.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Sleek Minimalist Footer */}
      <div className="relative z-10 w-full border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-zinc-950/10 py-6 text-center text-[10px] text-slate-400 dark:text-zinc-500 backdrop-blur-sm transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 VistaPeak AI Engine. Precision quantitative forecasting SaaS platform.</p>
          <div className="flex items-center space-x-4 font-bold uppercase">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition">Docs</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition">Console API</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition">Privacy</a>
          </div>
        </div>
      </div>

    </div>
  );
};
