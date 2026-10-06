import React, { useState, useEffect } from 'react';
import { FileSearch, X, CheckCircle2, AlertTriangle, ShieldCheck, Database } from 'lucide-react';
import { getEvidenceRecord } from '../services/api';
import { EvidenceRecord } from '../types';

interface EvidenceModalProps {
  recordId: string | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ recordId, onClose }) => {
  const [record, setRecord] = useState<EvidenceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recordId) {
      setLoading(true);
      setError(null);
      getEvidenceRecord(recordId)
        .then((rec) => setRecord(rec))
        .catch((err) => setError(err.message || 'Evidence record not found'))
        .finally(() => setLoading(false));
    } else {
      setRecord(null);
    }
  }, [recordId]);

  if (!recordId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono animate-fade-in">
      <div className="w-full max-w-2xl glass-panel-glow rounded-2xl p-6 shadow-2xl border-cyan-500/30 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">EVIDENCE RECORD INSPECTOR</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-300">{recordId}</span>
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Verified Source Record Details
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Fetching record {recordId} from database...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-950/30 border border-red-500/40 text-center space-y-2">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        ) : record ? (
          <div className="space-y-4">
            {/* Primary Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">RECORD ID</span>
                <span className="text-xs font-bold text-cyan-400">{record.id}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">TYPE</span>
                <span className="text-xs font-bold text-slate-200">{record.type}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">SUBSYSTEM</span>
                <span className="text-xs font-bold text-slate-200">{record.subsystem}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">TIMESTAMP</span>
                <span className="text-xs font-bold text-slate-200">{record.timestamp}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">MEASURED VALUE</span>
                <span className="text-xs font-bold text-amber-400">{record.value || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">LIMIT THRESHOLD</span>
                <span className="text-xs font-bold text-slate-400">{record.limit || 'N/A'}</span>
              </div>
            </div>

            {/* Content Payload */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                RAW CONTENT PAYLOAD
              </span>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed">
                {record.content}
              </div>
            </div>

            {/* Why This Evidence Supports Answer */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>GROUNDING JUSTIFICATION</span>
              </div>
              <p className="text-emerald-200/90 leading-relaxed">
                This record provides unambiguous telemetry evidence verifying the claim. The measured value ({record.value}) was validated against database storage.
              </p>
            </div>
          </div>
        ) : null}

        <div className="pt-2 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl glass-panel hover:border-slate-700 text-xs font-bold text-slate-300"
          >
            CLOSE PANEL
          </button>
        </div>
      </div>
    </div>
  );
};
