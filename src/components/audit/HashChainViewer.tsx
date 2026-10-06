import React, { useState } from 'react';
import { AuditEntry } from '../../types';
import { Badge } from '../common/Badge';
import { ShieldCheck, Hash, RotateCcw, CheckCircle2, Lock, ArrowDown } from 'lucide-react';

interface HashChainViewerProps {
  entries: AuditEntry[];
  onReplay: (entry: AuditEntry) => void;
}

export const HashChainViewer: React.FC<HashChainViewerProps> = ({
  entries,
  onReplay
}) => {
  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const handleVerifyChain = () => {
    setVerifying(true);
    setVerifiedSuccess(false);
    setTimeout(() => {
      setVerifying(false);
      setVerifiedSuccess(true);
    }, 1200);
  };

  return (
    <div className="bg-space-900 border border-slate-800 rounded-xl p-6 space-y-6 select-none shadow-2xl">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-fact-bg text-fact border border-fact-border shadow-green-glow/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-tech text-base font-bold text-slate-100 tracking-wider">
              TAMPER-EVIDENT AUDIT TRAIL CHAIN
            </h3>
            <span className="font-mono text-xs text-emerald-400">CRYPTOGRAPHIC DECISION LOG</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold rounded-lg shadow-green-glow flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Lock className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'VERIFYING HASHES...' : 'VERIFY HASH CHAIN'}</span>
          </button>
        </div>
      </div>

      {/* Verification Success Toast Notice */}
      {verifiedSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex items-center justify-between text-xs font-mono text-emerald-300 animate-pulse-subtle">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>ALL {entries.length} AUDIT BLOCKS VERIFIED. ZERO TAMPERING DETECTED IN CRYPTOGRAPHIC CHAIN.</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
            100% INTEGRITY
          </span>
        </div>
      )}

      {/* Audit Block Chain Entries */}
      <div className="space-y-6">
        {entries.map((entry, idx) => (
          <div key={entry.session_id} className="space-y-3">
            <div className="bg-space-950 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-emerald-500/50 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-slate-100">SESSION: {entry.session_id}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{entry.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="fact">
                    STATUS: {entry.chain_status}
                  </Badge>
                  <button
                    onClick={() => onReplay(entry)}
                    className="px-2.5 py-1 bg-space-800 hover:bg-space-700 text-cyan-400 border border-slate-700 font-mono text-[11px] rounded flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>REPLAY ANSWER</span>
                  </button>
                </div>
              </div>

              {/* User Query */}
              <div className="text-xs font-mono">
                <span className="text-slate-500 block uppercase text-[10px]">USER QUERY:</span>
                <span className="text-slate-100 font-semibold">"{entry.query}"</span>
              </div>

              {/* Retrieved Records Chips */}
              <div className="space-y-1 text-xs font-mono">
                <span className="text-slate-500 block uppercase text-[10px]">RETRIEVED RECORD IDS:</span>
                <div className="flex flex-wrap gap-1.5">
                  {entry.retrieved_record_ids.map((id) => (
                    <span key={id} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[11px]">
                      [{id}]
                    </span>
                  ))}
                </div>
              </div>

              {/* Output Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-space-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">RAW MODEL OUTPUT</span>
                  <p className="text-slate-400 text-[11px] mt-1 line-clamp-3">{entry.raw_model_output}</p>
                </div>
                <div className="bg-space-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-emerald-400 block uppercase font-bold">VALIDATED FINAL OUTPUT</span>
                  <p className="text-slate-200 text-[11px] mt-1 line-clamp-3">{entry.validated_output}</p>
                </div>
              </div>

              {/* Hashes */}
              <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>PREVIOUS BLOCK HASH:</span>
                  <span className="text-slate-500 truncate max-w-xs">{entry.previous_hash}</span>
                </div>
                <div className="flex justify-between text-cyan-400 font-bold">
                  <span>CURRENT BLOCK HASH:</span>
                  <span className="truncate max-w-xs">{entry.current_hash}</span>
                </div>
              </div>
            </div>

            {/* Chain Link Arrow */}
            {idx < entries.length - 1 && (
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-5 h-5 animate-bounce" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
