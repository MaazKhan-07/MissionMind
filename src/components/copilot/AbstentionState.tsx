import React from 'react';
import { AlertOctagon, HelpCircle, ArrowRight, ShieldCheck, Search } from 'lucide-react';

interface AbstentionStateProps {
  reason?: string;
  missingData?: string[];
  onViewEvidence: () => void;
  onTryQuery: (query: string) => void;
}

export const AbstentionState: React.FC<AbstentionStateProps> = ({
  reason,
  missingData = [],
  onViewEvidence,
  onTryQuery
}) => {
  return (
    <div className="bg-amber-950/20 border-2 border-amber-500/50 rounded-xl p-6 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Top Banner Header */}
      <div className="flex items-start gap-4 border-b border-amber-500/30 pb-4">
        <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-glow shrink-0">
          <AlertOctagon className="w-7 h-7 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            ⚠ INSUFFICIENT EVIDENCE
          </div>
          <h3 className="font-tech text-lg font-bold text-slate-100">
            AI Abstention Triggered
          </h3>
          <p className="text-xs text-slate-300">
            {reason || "MissionMind could not establish a reliable answer from the available mission records."}
          </p>
        </div>
      </div>

      {/* Missing Data Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          MISSING DATA REQUIRED FOR GROUNDING:
        </h4>
        <div className="bg-space-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
          {missingData.length > 0 ? (
            missingData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{item}</span>
              </div>
            ))
          ) : (
            <div className="text-xs font-mono text-slate-400">
              • Gyroscope bias telemetry (ADCS-GYRO-03)<br />
              • Attitude subsystem operational logs<br />
              • Day 3 sensor calibration baseline record
            </div>
          )}
        </div>
      </div>

      {/* Safety Policy Explanation */}
      <div className="bg-space-900 border border-slate-800 p-4 rounded-lg flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-mono font-bold text-cyan-300">WHY THIS MATTERS:</span>
          <p className="text-slate-300">
            MissionMind enforces a strict <strong className="text-white">"No evidence → No claim"</strong> guardrail.
            The system will never hallucinate or invent telemetry parameters when grounded evidence is incomplete.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={onViewEvidence}
          className="px-4 py-2.5 bg-space-800 hover:bg-space-700 text-slate-200 font-mono text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-2 transition-all"
        >
          <Search className="w-4 h-4 text-cyan-400" />
          <span>VIEW AVAILABLE EVIDENCE</span>
        </button>
        <button
          onClick={() => onTryQuery('Why did the comms subsystem fail at 14:32?')}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold rounded-lg shadow-amber-glow flex items-center gap-2 transition-all"
        >
          <span>TRY ANOMALY QUERY (14:32)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
