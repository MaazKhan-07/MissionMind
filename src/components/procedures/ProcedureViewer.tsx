import React from 'react';
import { OperationalProcedure } from '../../types';
import { Badge } from '../common/Badge';
import { BookOpen, CheckSquare, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

interface ProcedureViewerProps {
  procedure: OperationalProcedure;
  onExecuteStep?: (stepNumber: number) => void;
}

export const ProcedureViewer: React.FC<ProcedureViewerProps> = ({
  procedure,
  onExecuteStep
}) => {
  return (
    <div className="bg-space-900 border border-slate-800 rounded-xl p-6 space-y-6 select-none shadow-2xl">
      {/* Header Document Metadata */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400">
                SOP: {procedure.id}
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-xs text-slate-400">
                {procedure.revision}
              </span>
            </div>
            <h3 className="font-tech text-lg font-bold text-slate-100">
              {procedure.title}
            </h3>
          </div>
        </div>

        <Badge variant="recommendation">
          SUBSYSTEM: {procedure.subsystem}
        </Badge>
      </div>

      {/* Purpose & Source Document info */}
      <div className="bg-space-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span>SOURCE DOCUMENT: <strong className="text-slate-200">{procedure.source}</strong></span>
          <span>LAST REVISION: <strong className="text-slate-200">{procedure.last_updated}</strong></span>
        </div>
        <p className="text-slate-300 font-sans border-t border-slate-800/80 pt-2">
          {procedure.purpose}
        </p>
      </div>

      {/* Numbered Operational Action Steps */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          OPERATIONAL CHECKLIST STEPS ({procedure.steps.length} STEPS):
        </h4>

        <div className="space-y-3">
          {procedure.steps.map((step) => (
            <div
              key={step.step_number}
              className="bg-space-950 p-4 rounded-xl border border-slate-800 space-y-2 group hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    0{step.step_number}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100 font-mono">
                      {step.action}
                    </h5>
                    <p className="text-xs text-slate-300 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>

                {onExecuteStep && (
                  <button
                    onClick={() => onExecuteStep(step.step_number)}
                    className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-mono text-[11px] font-semibold rounded border border-blue-500/30 shrink-0"
                  >
                    VERIFY STEP
                  </button>
                )}
              </div>

              {step.verification_telemetry && (
                <div className="pl-10 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>VERIFICATION TELEMETRY: <strong className="text-cyan-400">[{step.verification_telemetry}]</strong></span>
                  <span className="text-emerald-400 font-semibold">● READY FOR CHECK</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
