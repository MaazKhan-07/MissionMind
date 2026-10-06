import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Play, RefreshCw, AlertTriangle, FileText, CheckCircle2, X } from 'lucide-react';
import { getAuditTrail, verifyAuditChain } from '../services/api';
import { AuditItem, AuditVerifyResponse } from '../types';

export const AuditView: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [verifyResult, setVerifyResult] = useState<AuditVerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [replayItem, setReplayItem] = useState<AuditItem | null>(null);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const [logs, ver] = await Promise.all([getAuditTrail(), verifyAuditChain()]);
      setAuditLogs(logs);
      setVerifyResult(ver);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await verifyAuditChain();
      setVerifyResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              AUDIT TRAIL & TAMPER-EVIDENT HASH CHAIN
            </h2>
            <p className="text-xs text-slate-400">
              Cryptographically chained investigation record history for regulatory compliance and auditability
            </p>
          </div>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{verifying ? 'VERIFYING CHAIN...' : 'VERIFY CHAIN'}</span>
        </button>
      </div>

      {/* Hash Verification Status Card (P0 Feature 10) */}
      {verifyResult && (
        <div className={`glass-panel p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          verifyResult.chain_valid
            ? 'border-emerald-500/40 bg-emerald-950/20'
            : 'border-red-500/40 bg-red-950/20'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              verifyResult.chain_valid ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400' : 'bg-red-950 border-red-500/50 text-red-400'
            }`}>
              {verifyResult.chain_valid ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase">AUDIT INTEGRITY:</span>
                <span className={`text-xs font-bold ${verifyResult.chain_valid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {verifyResult.chain_valid ? '✓ VERIFIED' : '⚠ INTEGRITY CHECK FAILED'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                {verifyResult.message}
              </p>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block pt-0.5">
                SECURITY CLASSIFICATION: TAMPER-EVIDENT SHA-256 AUDIT CHAIN
              </span>
            </div>
          </div>

          {verifyResult.latest_hash && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-right">
              <span className="text-[10px] text-slate-500 uppercase block">LATEST RECORD HASH</span>
              <span className="text-[11px] font-mono text-cyan-400 font-bold tracking-tight">
                {verifyResult.latest_hash.substring(0, 16)}...{verifyResult.latest_hash.substring(48)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Audit Log Table Stream */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          INVESTIGATION AUDIT HISTORY LOGS ({auditLogs.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading audit history logs...</p>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No audit records logged yet. Run a copilot investigation query to populate audit chain.
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-cyan-400">{item.id}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{item.timestamp}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      SESSION: {item.session_id}
                    </span>
                  </div>

                  {/* REPLAY BUTTON (P0 Feature 9: Replay uses stored audit info, NO fresh AI call!) */}
                  <button
                    onClick={() => setReplayItem(item)}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs transition-all self-start sm:self-auto"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>REPLAY INVESTIGATION</span>
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-200">
                  QUERY: &quot;{item.query}&quot;
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">RETRIEVED RECORDS:</span>
                    {item.retrieved_record_ids.map((rId) => (
                      <span key={rId} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-[11px]">
                        {rId}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-3 text-slate-400">
                    <span>STRENGTH: <strong className="text-slate-200">{Math.round(item.retrieval_strength * 100)}%</strong></span>
                    <span>DROPPED CLAIMS: <strong className="text-amber-400">{item.dropped_claims_count}</strong></span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 truncate pt-1">
                  HASH: {item.hash}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REPLAY MODAL (P0 Feature 9) */}
      {replayItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono">
          <div className="w-full max-w-3xl glass-panel-glow rounded-2xl p-6 shadow-2xl border-cyan-500/30 space-y-5 relative">
            <button
              onClick={() => setReplayItem(null)}
              className="absolute right-4 top-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <Play className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase">ANSWER REPLAY MODE</span>
                <h3 className="text-base font-bold text-slate-100">
                  Replaying Audit Session {replayItem.id}
                </h3>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300">
              ℹ️ <span className="font-bold">REPLAY NOTICE:</span> Replay uses exact stored audit evidence and response payload from SHA-256 audit log without making a fresh AI provider call.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">ORIGINAL OPERATOR QUERY</span>
                <p className="text-sm font-bold text-slate-100 mt-0.5">&quot;{replayItem.query}&quot;</p>
              </div>

              <div>
                <span className="text-slate-500 block uppercase">STORED VALIDATED OUTPUT</span>
                <pre className="mt-1 p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(replayItem.validated_output, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setReplayItem(null)}
                className="px-4 py-2 rounded-xl glass-panel text-xs font-bold text-slate-300"
              >
                CLOSE REPLAY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
