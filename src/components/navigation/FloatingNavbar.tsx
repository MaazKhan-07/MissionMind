import React, { useState } from 'react';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Compass,
  Search,
  Sun,
  Moon,
  Laptop,
  User,
  Shield,
  Layers,
  Sparkles,
  Bot,
  LineChart,
  AlertTriangle
} from 'lucide-react';

interface FloatingNavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenCommandPalette: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenCommandPalette
}) => {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const { user, openAuthModal } = useAuth();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Mission Control', path: '/' },
    { label: 'Copilot', path: '/copilot' },
    { label: 'Evidence', path: '/evidence' },
    { label: 'Telemetry', path: '/telemetry' },
    { label: 'Anomalies', path: '/anomalies' },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-40">
      <div className="glass-panel rounded-2xl px-4 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between transition-all">
        {/* Left: Brand Identity */}
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <img
            src="/logo.jpg"
            alt="MissionMind Logo"
            className="w-7 h-7 rounded-lg object-cover border border-cyan-500/40 shadow-cyan-glow group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-tech text-base font-bold tracking-wider text-slate-100 flex items-center gap-0.5">
              MISSION<span className="text-cyan-400">MIND</span>
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30 shadow-cyan-glow/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-space-800/60'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search / Command Palette */}
          <button
            onClick={onOpenCommandPalette}
            className="p-2 rounded-lg bg-space-800/60 hover:bg-space-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all flex items-center gap-2"
            title="Search telemetry and evidence (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline text-[11px] font-mono text-slate-400">⌘K</span>
          </button>



          {/* Profile / Auth Button */}
          {user ? (
            <button
              onClick={() => onNavigate('/profile')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-space-800/80 border border-slate-700 text-xs font-mono text-slate-200 hover:border-cyan-500/40 transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                {user.callsign || 'OP'}
              </div>
              <span className="hidden sm:inline truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs tracking-wider transition-all"
            >
              SIGN IN
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
