import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Shield, Key, Mail, Lock, User, AlertTriangle, ArrowRight, X, RefreshCw } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    signup,
    resetPassword,
    loginDemo,
    authError,
    clearError,
    loading
  } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (tab === 'signin') {
      const ok = await login(email, password);
      if (ok) {
        showToast('Operator verified. Access granted.', 'success');
      }
    } else if (tab === 'signup') {
      const ok = await signup(name, email, password);
      if (ok) {
        showToast('Operator account registered.', 'success');
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
    loginDemo();
    showToast('Entered as Flight Director (Demo Mode).', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md bg-space-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-cyan-glow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech text-base font-bold text-slate-100 tracking-wider">
                MISSION OPERATIONS ACCESS
              </h3>
              <span className="font-mono text-xs text-cyan-400">AUTHENTICATION GATEWAY</span>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-space-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-space-950 p-1 border border-slate-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => { setTab('signin'); clearError(); }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              tab === 'signin' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); clearError(); }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              tab === 'signup' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setTab('forgot'); clearError(); }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              tab === 'forgot' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Forgot Key
          </button>
        </div>

        {/* Graceful Error Notification Box */}
        {authError && (
          <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl space-y-2 text-xs font-mono text-red-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-200">Authentication Service Notice:</strong>
                <span>{authError}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-red-500/20">
              <button
                type="button"
                onClick={handleSubmit}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={handleDemoAccess}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Continue in Demo Mode →
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400">OPERATOR FULL NAME</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mrigesh Koyande"
                  className="w-full bg-space-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400">OPERATOR EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@missionmind.aero"
                className="w-full bg-space-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400">MISSION ACCESS KEY / PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-space-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#66FCF1] hover:bg-[#88FFF8] text-[#0B0C10] font-tech font-bold text-xs tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(102,252,241,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>VERIFYING CREDENTIALS...</span>
            ) : (
              <>
                <span>{tab === 'signin' ? 'AUTHENTICATE SESSION' : tab === 'signup' ? 'REGISTER OPERATOR' : 'SEND RESET INSTRUCTIONS'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fallback Option */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleDemoAccess}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            ⚡ Enter as Demo Flight Director (Instant Access)
          </button>
        </div>
      </div>
    </div>
  );
};
