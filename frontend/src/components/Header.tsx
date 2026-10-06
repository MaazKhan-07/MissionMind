import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldCheck, Search, Database, Cpu, Radio, AlertTriangle, CheckCircle2,
  Terminal, Shield
} from 'lucide-react';
import { checkHealth } from '../services/api';
import { HealthResponse } from '../types';

interface HeaderProps {
  onOpenSearch: () => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  missionStatus?: 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  demoMode,
  onToggleDemoMode,
  missionStatus = 'DEGRADED'
}) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [showHealthModal, setShowHealthModal] = useState(false);

  useEffect(() => {
    checkHealth().then(setHealth);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand Title */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
          <Activity className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-mono font-bold text-lg tracking-wider text-slate-100 uppercase">
              MISSION<span className="text-cyan-400">MIND</span>
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              ST-10 COPILOT
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Evidence-Grounded Spacecraft Operations Copilot
          </p>
        </div>
      </div>

      {/* Global Controls & Status */}
      <div className="flex items-center space-x-4">
        {/* Mission Status Badge */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold ${
          missionStatus === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          missionStatus === 'DEGRADED' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
          'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            missionStatus === 'CRITICAL' ? 'bg-red-500 animate-ping' :
            missionStatus === 'DEGRADED' ? 'bg-amber-500 animate-pulse' :
            'bg-emerald-500'
          }`} />
          <span>MISSION STATE: {missionStatus}</span>
        </div>

        {/* System Health Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowHealthModal(!showHealthModal)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg glass-panel hover:border-cyan-500/50 text-xs font-mono text-slate-300 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SYSTEM HEALTH</span>
          </button>

          {/* Health Modal Popover */}
          {showHealthModal && (
            <div className="absolute right-0 mt-2 w-72 glass-panel-glow rounded-xl p-4 shadow-2xl z-50 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="font-bold text-slate-200 uppercase flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>SYSTEM DIAGNOSTICS</span>
                </span>
                <button
                  onClick={() => setShowHealthModal(false)}
                  className="text-slate-400 hover:text-slate-200 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2 text-slate-400">
                    <Radio className="w-3.5 h-3.5" />
                    <span>REST API Service</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">● {health?.status?.toUpperCase() || 'ONLINE'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2 text-slate-400">
                    <Database className="w-3.5 h-3.5" />
                    <span>SQLite + FTS5</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">● {health?.database?.toUpperCase() || 'ONLINE'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2 text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                    <span>Hybrid Retrieval</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">● READY</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2 text-slate-400">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>LLM Engine</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">● CONNECTED</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="flex items-center space-x-2 text-slate-400">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Audit Hash Chain</span>
                  </span>
                  <span className="text-cyan-400 font-semibold">● VERIFIED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Search Keyboard Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-400 transition-all"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search records...</span>
          <kbd className="bg-slate-800 text-[10px] text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
            Ctrl K
          </kbd>
        </button>

        {/* Demo Mode Toggle Badge */}
        <button
          onClick={onToggleDemoMode}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
            demoMode
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${demoMode ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
          <span>{demoMode ? '● DEMO MODE' : 'LIVE MODE'}</span>
        </button>
      </div>
    </header>
  );
};
