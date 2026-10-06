import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Clock,
  Menu,
  Sparkles,
  Database,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';
import { StatusIndicator } from '../common/StatusIndicator';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onToggleMobileMenu: () => void;
  isLiveMode: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCommandPalette,
  onToggleMobileMenu,
  isLiveMode
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Comms Link Anomaly Flagged',
      time: '14:32:18 UTC',
      type: 'CRITICAL',
      text: 'Signal strength decreased by 12 dBm on Svalbard GS'
    },
    {
      id: 2,
      title: 'EPS Battery Bus Voltage Low',
      time: '14:31:42 UTC',
      type: 'WARNING',
      text: 'Voltage dropped to 23.8 V threshold limit'
    },
    {
      id: 3,
      title: 'Evidence Guardrail Validation',
      time: '14:32:45 UTC',
      type: 'INFO',
      text: '1 unsupported claim removed from Copilot response'
    }
  ];

  return (
    <header className="h-16 bg-space-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile Menu & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg bg-space-800 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img
            src="/logo.jpg"
            alt="MissionMind Logo"
            className="w-7 h-7 rounded-lg object-cover border border-cyan-500/40 shadow-cyan-glow shrink-0"
          />
          <span className="font-tech text-lg font-bold tracking-widest text-slate-100 hidden sm:inline">
            MISSION<span className="text-system">MIND</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded font-semibold">
            SAT-01 // MISSION ALPHA
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-xl mx-4 hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full h-9 bg-space-950/80 border border-slate-800 hover:border-system/50 rounded-lg px-3 flex items-center justify-between text-slate-400 hover:text-slate-200 transition-all group"
        >
          <div className="flex items-center gap-2 text-xs font-mono">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-system transition-colors" />
            <span>Ask MissionMind anything or search telemetry...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono bg-space-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Clock & Status Indicators */}
      <div className="flex items-center gap-4">
        {/* Live UTC Clock */}
        <div className="hidden lg:flex items-center gap-1.5 font-mono text-xs text-slate-300 bg-space-950/80 px-2.5 py-1 rounded border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-system animate-spin" style={{ animationDuration: '10s' }} />
          <span>{utcTime || '14:32:18 UTC'}</span>
        </div>

        {/* Status Indicators Pill */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1 bg-space-950/80 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">STATUS</span>
            <StatusIndicator status="DEGRADED" label="DEGRADED" size="sm" />
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">DATA</span>
            <StatusIndicator status="SYNCED" label="SYNCED" size="sm" />
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase">AI</span>
            <StatusIndicator status="READY" label="READY" size="sm" />
          </div>
        </div>

        {/* Notifications Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-space-800 hover:bg-space-750 text-slate-300 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-space-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-space-950 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Mission Alerts
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-space-850 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${
                        n.type === 'CRITICAL' ? 'text-red-400' : n.type === 'WARNING' ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{n.text}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-space-950 text-center border-t border-slate-800">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-mono text-system hover:underline"
                >
                  Clear All Notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
