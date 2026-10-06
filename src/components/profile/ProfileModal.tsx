import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { User, Shield, Key, Bell, LogOut, X, Check, Activity } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings
}) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  if (!isOpen || !user) return null;

  const handleSignOut = () => {
    logout();
    showToast('Mission operator signed out.', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-space-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-sm">
              {user.callsign || 'OP'}
            </div>
            <div>
              <h3 className="font-tech text-base font-bold text-slate-100">
                OPERATOR PROFILE
              </h3>
              <span className="font-mono text-xs text-cyan-400">SESSION IDENTIFIER: {user.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-space-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card Details */}
        <div className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-500">OPERATOR:</span>
            <span className="text-slate-100 font-semibold">{user.name}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-500">ROLE:</span>
            <span className="text-cyan-300 font-semibold">{user.role}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-500">CALLSIGN:</span>
            <span className="text-amber-400 font-bold">{user.callsign}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-500">EMAIL:</span>
            <span className="text-slate-300">{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">SESSION MODE:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              user.mode === 'authenticated' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {user.mode === 'authenticated' ? 'AUTHENTICATED' : 'DEMO OPERATOR'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full py-2.5 px-4 bg-space-800 hover:bg-space-750 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-mono transition-all flex items-center justify-between"
          >
            <span>Operator Preferences & Settings</span>
            <span>→</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 bg-red-950/30 hover:bg-red-900/40 text-red-300 rounded-xl border border-red-500/30 text-xs font-mono transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Operator Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
