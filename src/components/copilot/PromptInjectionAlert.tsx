import React from 'react';
import { ShieldAlert, Terminal, Lock } from 'lucide-react';

interface PromptInjectionAlertProps {
  source?: string;
}

export const PromptInjectionAlert: React.FC<PromptInjectionAlertProps> = ({
  source = 'LOG-99999'
}) => {
  return (
    <div className="bg-red-950/20 border-2 border-red-500/50 rounded-xl p-4 space-y-3 shadow-red-glow/20 relative overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="font-mono text-xs font-bold text-red-400 flex items-center gap-2">
            ⚠ SUSPICIOUS CONTENT DETECTED
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px]">
              SECURITY ISOLATED
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Retrieved document contained prompt-injection instructions attempting to hijack AI reasoning.
          </p>
        </div>
      </div>

      <div className="bg-space-950 p-3 rounded-lg border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
        <div>
          <span className="text-slate-500">SOURCE RECORD:</span>{' '}
          <span className="text-cyan-400 font-bold">[{source}]</span>
        </div>
        <div>
          <span className="text-slate-500">STATUS:</span>{' '}
          <span className="text-amber-400 font-bold">TREATED AS DATA</span>
        </div>
        <div>
          <span className="text-slate-500">ACTION:</span>{' '}
          <span className="text-emerald-400 font-bold">INSTRUCTION DISCARDED</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
        <Lock className="w-3 h-3 text-cyan-400" />
        <span>MissionMind sandboxes retrieved logs to prevent indirect prompt injection attacks.</span>
      </div>
    </div>
  );
};
