import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, ArrowRight, FileText } from 'lucide-react';
import { getProcedures } from '../services/api';
import { ProcedureItem } from '../types';

export const ProcedureGuidance: React.FC = () => {
  const [procedures, setProcedures] = useState<ProcedureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProc, setSelectedProc] = useState<ProcedureItem | null>(null);

  useEffect(() => {
    getProcedures()
      .then((data) => {
        setProcedures(data);
        if (data.length > 0) setSelectedProc(data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border-blue-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              OPERATIONAL PROCEDURE GUIDANCE INTELLIGENCE
            </h2>
            <p className="text-xs text-slate-400">
              Verified operational checklist procedures grounded in mission documentation
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Procedure Selector List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            AVAILABLE PROCEDURES
          </h3>

          {procedures.map((proc) => (
            <div
              key={proc.id}
              onClick={() => setSelectedProc(proc)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                selectedProc?.id === proc.id
                  ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                  : 'glass-panel hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-400">{proc.id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {proc.revision}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">{proc.title}</h4>
              <span className="text-[11px] text-slate-500 block mt-2">SUBSYSTEM: {proc.subsystem}</span>
            </div>
          ))}
        </div>

        {/* Procedure Steps Details */}
        {selectedProc && (
          <div className="lg:col-span-2 glass-panel-glow p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-blue-400">{selectedProc.id}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs font-bold text-slate-400">{selectedProc.revision}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-1">{selectedProc.title}</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                APPROVED PROCEDURE
              </span>
            </div>

            <div className="space-y-4">
              {selectedProc.steps.map((step) => (
                <div key={step.step_number} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">STEP 0{step.step_number}</span>
                    <span className="text-[10px] text-slate-500">SOURCE: {selectedProc.id}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-200">{step.action}</p>
                  <p className="text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500 font-bold uppercase">RATIONALE: </span>
                    {step.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
