import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAudio } from '../contexts/AudioContext';
import { Shield, Key, Mail, Lock, User, AlertTriangle, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const {
    login,
    signup,
    resetPassword,
    loginDemo,
    authError,
    clearError,
    loading
  } = useAuth();
  const { showToast } = useToast();
  const { playClickSound } = useAudio();

  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    clearError();

    if (tab === 'signin') {
      const ok = await login(email, password);
      if (ok) {
        showToast('Operator verified. Access granted to MissionMind.', 'success');
        onSuccess();
      }
    } else if (tab === 'signup') {
      const ok = await signup(name, email, password);
      if (ok) {
        showToast('Operator account registered. Welcome aboard.', 'success');
        onSuccess();
      }
    } else if (tab === 'forgot') {
      const ok = await resetPassword(email);
      if (ok) {
        showToast('Password reset instructions dispatched.', 'info');
        setTab('signin');
      }
    }
  };

  const handleDemoAccess = () => {
    playClickSound();
    loginDemo();
    showToast('Entered as Flight Director (Demo Mode).', 'info');
    onSuccess();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0B0C10] overflow-hidden select-none font-sans">
      {/* 1. Full-Screen Cinematic Auth Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('/media/auth-background.jpeg')` }}
      />

      {/* 2. Dark Cinematic Vignette & Radial Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/80 to-black/60 backdrop-blur-[2px]" />

      {/* Ambient Radial Cyan Glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 3. Glassmorphic Auth Card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-[#0B0C10]/85 border border-[#66FCF1]/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-6 animate-scale-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-1">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="font-tech text-3xl font-extrabold tracking-widest text-[#C5C6C7] uppercase">
            MISSION<span className="text-[#66FCF1]">MIND</span>
          </h1>
          <p className="font-mono text-xs text-[#66FCF1] tracking-wider uppercase font-semibold">
            MISSION OPERATIONS INTELLIGENCE GATEWAY
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-space-950 p-1 border border-slate-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setTab('signin');
              clearError();
            }}
            className={`flex-1 py-2 rounded-lg transition-all font-bold ${
              tab === 'signin'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setTab('signup');
              clearError();
            }}
            className={`flex-1 py-2 rounded-lg transition-all font-bold ${
              tab === 'signup'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setTab('forgot');
              clearError();
            }}
            className={`flex-1 py-2 rounded-lg transition-all font-bold ${
              tab === 'forgot'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Forgot Key
          </button>
        </div>

        {/* Graceful Firebase / Network Error Box */}
        {authError && (
          <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-2xl space-y-2 text-xs font-mono text-red-300 backdrop-blur-md">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-200 font-bold">Authentication Gateway Notice:</strong>
                <span className="text-[11px] leading-relaxed">{authError}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-red-500/20">
              <button
                type="button"
                onClick={handleSubmit}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={handleDemoAccess}
                className="text-[11px] text-emerald-400 hover:underline font-bold"
              >
                Continue in Demo Mode →
              </button>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 font-bold">OPERATOR FULL NAME</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Flight Commander"
                  className="w-full bg-space-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 font-bold">OPERATOR EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@missionmind.aero"
                className="w-full bg-space-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400 font-bold">MISSION ACCESS KEY / PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-space-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#66FCF1] hover:bg-[#88FFF8] text-[#0B0C10] font-tech font-bold text-xs tracking-widest uppercase rounded-xl shadow-[0_0_25px_rgba(102,252,241,0.4)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span>AUTHENTICATING OPERATOR...</span>
            ) : (
              <>
                <span>{tab === 'signin' ? 'AUTHENTICATE SESSION' : tab === 'signup' ? 'REGISTER OPERATOR' : 'DISPATCH RESET KEY'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Instant Demo Access Button */}
        <div className="pt-3 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleDemoAccess}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enter as Demo Flight Director (Instant Access)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
