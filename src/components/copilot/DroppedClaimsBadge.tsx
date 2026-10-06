import React, { useState } from 'react';
import { DroppedClaim } from '../../types';
import { ShieldCheck, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface DroppedClaimsBadgeProps {
  claims: DroppedClaim[];
}

export const DroppedClaimsBadge: React.FC<DroppedClaimsBadgeProps> = ({ claims }) => {
  const [expanded, setExpanded] = useState(false);

  if (!claims || claims.length === 0) return null;

  return (
    <div className="bg-space-900 border border-emerald-500/40 rounded-xl overflow-hidden shadow-green-glow/10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-emerald-950/30 hover:bg-emerald-950/50 flex items-center justify-between text-left transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-emerald-300 flex items-center gap-2">
              🛡 EVIDENCE GUARDRAIL ACTIVE
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                {claims.length} {claims.length === 1 ? 'CLAIM REMOVED' : 'CLAIMS REMOVED'}
              </span>
            </div>
            <span className="text-[11px] text-slate-300">
              Post-generation validator stripped unsupported numerical claims.
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
      </button>

      {expanded && (
        <div className="p-4 bg-space-950 border-t border-emerald-500/20 space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="p-3 bg-space-900 border border-slate-800 rounded-lg space-y-2 text-xs font-mono">
              <div className="flex items-start gap-2 text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase text-[10px] text-slate-500">REJECTED MODEL STATEMENT:</span>
                  <p className="line-through text-slate-300 mt-0.5">"{claim.claim}"</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div>
                  <span className="text-slate-500">CITED SOURCE:</span>{' '}
                  <span className="text-cyan-400 font-bold">[{claim.source_cited}]</span>
                </div>
                <div>
                  <span className="text-slate-500">ACTUAL EVIDENCED VALUE:</span>{' '}
                  <span className="text-emerald-400 font-bold">{claim.raw_value_in_record}</span>
                </div>
              </div>

              <div className="text-[10px] text-amber-400 bg-amber-950/30 p-2 rounded border border-amber-500/20">
                <strong>GUARDRAIL RATIONALE:</strong> {claim.reason}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
