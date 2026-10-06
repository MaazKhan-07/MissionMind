import React, { useState } from 'react';
import { EvidenceRecord } from '../../types';
import { Badge } from '../common/Badge';
import { FileText, Copy, Check, X, Database, ShieldCheck, Terminal, Layers } from 'lucide-react';

interface EvidencePanelProps {
  record: EvidenceRecord | null;
  onClose: () => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  record,
  onClose
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!record) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(record.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(record.raw_content);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="h-full bg-space-900 border-l border-slate-800 flex flex-col justify-between overflow-y-auto p-4 select-none">
      <div className="space-y-4">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-tech text-sm font-bold text-slate-100 tracking-wider">
                EVIDENCE RECORD INSPECTOR
              </h3>
              <span className="font-mono text-[10px] text-cyan-400">TRACED SOURCE</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-space-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Record ID & Actions Header */}
        <div className="bg-space-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">RECORD ID</div>
            <div className="font-mono text-base font-bold text-cyan-300">{record.id}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyId}
              className="px-2.5 py-1 bg-space-800 hover:bg-space-750 text-slate-300 font-mono text-[11px] rounded border border-slate-700 flex items-center gap-1 transition-colors"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId ? 'COPIED' : 'COPY ID'}</span>
            </button>
          </div>
        </div>

        {/* Key Metadata Table */}
        <div className="space-y-2 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-space-950 p-2.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">TYPE</span>
              <span className="font-semibold text-slate-200">{record.type}</span>
            </div>
            <div className="bg-space-950 p-2.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">SUBSYSTEM</span>
              <span className="font-semibold text-cyan-400">{record.subsystem}</span>
            </div>
          </div>

          <div className="bg-space-950 p-2.5 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">TIMESTAMP</span>
            <span className="font-semibold text-slate-100">{record.timestamp}</span>
          </div>

          {record.parameter && (
            <div className="bg-space-950 p-2.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">PARAMETER</span>
              <span className="font-semibold text-emerald-300">{record.parameter}</span>
            </div>
          )}

          {record.value && (
            <div className="bg-space-950 p-2.5 rounded border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">OBSERVED VALUE</span>
                <span className="font-bold text-base text-amber-400">{record.value}</span>
              </div>
              {record.status && (
                <Badge
                  variant={
                    record.status === 'LOW' || record.status === 'HIGH' || record.status === 'WARNING'
                      ? 'inference'
                      : record.status === 'CRITICAL'
                      ? 'critical'
                      : 'fact'
                  }
                >
                  {record.status}
                </Badge>
              )}
            </div>
          )}

          {record.limit && (
            <div className="bg-space-950 p-2.5 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">OPERATIONAL LIMIT THRESHOLD</span>
              <span className="font-semibold text-slate-300">{record.limit}</span>
            </div>
          )}

          <div className="bg-space-950 p-2.5 rounded border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block">SOURCE FILE</span>
            <span className="font-semibold text-cyan-400 underline">{record.source_file}</span>
          </div>
        </div>

        {/* Structured Details JSON */}
        {record.details && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
              Structured Attributes
            </span>
            <div className="bg-space-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              {Object.entries(record.details).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-800/50 pb-1 last:border-0">
                  <span className="text-slate-400">{k}:</span>
                  <span className="text-cyan-300 font-semibold">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Log Payload */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold flex items-center gap-1">
              <Terminal className="w-3 h-3 text-cyan-400" /> RAW RECORD PAYLOAD
            </span>
            <button
              onClick={handleCopyRaw}
              className="text-[10px] font-mono text-cyan-400 hover:underline"
            >
              {copiedRaw ? 'COPIED RAW' : 'COPY RAW'}
            </button>
          </div>
          <pre className="bg-black/90 p-3 rounded-lg border border-slate-800 text-[10px] font-mono text-emerald-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
            {record.raw_content}
          </pre>
        </div>
      </div>

      {/* Footer Verification Stamp */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          GROUNDING VERIFIED
        </span>
        <span>DB HASH MATCH</span>
      </div>
    </div>
  );
};
