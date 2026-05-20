import React, { useState } from 'react';
import { useLuminaStore } from '../store/store';
import { GlassCard } from '../components/GlassCard';
import { Sparkles, Mail, Lock, LogIn, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const { login, isLoadingForecast } = useLuminaStore();
  const [email, setEmail] = useState('sterling.ops@luminaforecast.ai');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  const handleGoogleSignIn = () => {
    login('alex.sterling@google-oauth.lumina.db');
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-4">
      {/* Background radial spotlights */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

      <GlassCard className="w-full max-w-md p-8 relative z-10 border border-white/[0.08] shadow-2xl" hoverEffect={false}>
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-glass-glow shadow-brand-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white mt-4">
            Welcome to Lumina Console
          </h2>
          <p className="text-xs text-slate-400">
            Access industrial-grade AI-powered demand planning pipelines.
          </p>
        </div>

        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center space-x-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-sm font-semibold text-slate-200 py-3.5 transition active:scale-[0.98]"
        >
          {/* Google Color G logo */}
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.484 0-6.289-2.884-6.289-6.429 0-3.544 2.805-6.428 6.29-6.428 1.587 0 3.018.583 4.118 1.55l3.056-3.111C18.665 1.706 15.65 0 12.24 0 6.009 0 1 5.093 1 11.286c0 6.192 5.01 11.285 11.24 11.285 6.027 0 10.638-4.148 10.638-11.002 0-.668-.073-1.32-.208-1.944L12.24 10.285z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative bg-[#0c0616] px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            or use demo sandbox
          </span>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Corporate Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.01] pl-10 pr-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none transition"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Security Token / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.01] pl-10 pr-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoadingForecast}
            className="w-full flex items-center justify-center space-x-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 py-3 font-semibold text-sm text-white shadow-glass-glow shadow-brand-500/10 hover:shadow-brand-500/25 active:scale-[0.98] transition mt-2 disabled:opacity-50"
          >
            <span>Execute Secure Sandbox Login</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>
      </GlassCard>
    </div>
  );
};
