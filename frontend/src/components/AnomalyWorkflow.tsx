import React from 'react';
import { AlertOctagon, ArrowRight, Bot, Clock, FileSearch, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AnomalyItem } from '../types';

interface AnomalyWorkflowProps {
  anomalies: AnomalyItem[];
  selectedAnomaly: AnomalyItem | null;
  onSelectAnomaly: (anomaly: AnomalyItem) => void;
  onStartCopilotQuery: (query: string, anomalyId: string) => void;
  onOpenTimeline: () => void;
}

export const AnomalyWorkflow: React.FC<AnomalyWorkflowProps> = ({
  anomalies,
  selectedAnomaly,
  onSelectAnomaly,
  onStartCopilotQuery,
  onOpenTimeline
}) => {
  const currentAnomaly = selectedAnomaly || anomalies[0];

  const workflowSteps = [
    { id: 1, label: 'DETECTED', icon: AlertOctagon, active: true },
    { id: 2, label: 'INVESTIGATE', icon: FileSearch, active: true },
    { id: 3, label: 'EVIDENCE', icon: FileSearch, active: true },
    { id: 4, label: 'AI ANALYSIS', icon: Bot, active: true },
    { id: 5, label: 'RECOMMENDATION', icon: CheckCircle2, active: true },
    { id: 6, label: 'AUDIT', icon: ShieldCheck, active: true },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border-amber-500/20">
        <div className="flex items-center space-x-3">
          <AlertOctagon className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              ANOMALY INVESTIGATION WORKFLOW
            </h2>
            <p className="text-xs text-slate-400">
              End-to-end evidence lifecycle from anomaly detection to auditable decision support
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Step Lifecycle Progress Bar */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {workflowSteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center space-y-1.5 shrink-0 px-2">
                  <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">{step.label}</span>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="flex-1 h-0.5 min-w-[30px] bg-cyan-500/30 self-center mb-5" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Anomaly Selector & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Anomaly List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            ACTIVE MISSION ANOMALIES
          </h3>

          {anomalies.map((anom) => (
            <div
              key={anom.id}
              onClick={() => onSelectAnomaly(anom)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                currentAnomaly?.id === anom.id
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                  : 'glass-panel hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400">{anom.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  anom.severity === 'CRITICAL' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                  'bg-amber-500/20 border-amber-500/50 text-amber-400'
                }`}>
                  {anom.severity}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200 line-clamp-2">{anom.summary}</p>
              <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span>{anom.subsystem}</span>
                <span>{anom.evidence_count} evidence records</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Selected Anomaly Detail & Action Cards */}
        {currentAnomaly && (
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel-glow p-6 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-cyan-400">{currentAnomaly.id}</span>
                    <span className="text-xs text-slate-400">{currentAnomaly.timestamp}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">
                    {currentAnomaly.summary}
                  </h3>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded border ${
                  currentAnomaly.severity === 'CRITICAL' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                  'bg-amber-500/20 border-amber-500/50 text-amber-400'
                }`}>
                  {currentAnomaly.severity}
                </span>
              </div>

              {/* Anomaly Parameters Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">SUBSYSTEM</span>
                  <span className="text-xs font-bold text-slate-200">{currentAnomaly.subsystem}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">EVIDENCE COUNT</span>
                  <span className="text-xs font-bold text-cyan-400">{currentAnomaly.evidence_count} RECORDS</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 uppercase block">TIME WINDOW</span>
                  <span className="text-xs font-bold text-slate-200">14:28 - 14:35 UTC</span>
                </div>
              </div>

              {/* Affected Parameters List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  AFFECTED TELEMETRY PARAMETERS
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentAnomaly.affected_parameters.map((param) => (
                    <span key={param} className="px-3 py-1 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                      {param}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons (P0 Requirements: OPEN, INVESTIGATE, VIEW TIMELINE, ASK COPILOT) */}
              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => onStartCopilotQuery(currentAnomaly.default_query, currentAnomaly.id)}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>INVESTIGATE WITH COPILOT</span>
                </button>

                <button
                  onClick={onOpenTimeline}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl glass-panel hover:border-cyan-500/50 text-slate-200 font-semibold text-xs transition-all"
                >
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>VIEW TIMELINE</span>
                </button>

                <button
                  onClick={() => onStartCopilotQuery(currentAnomaly.default_query, currentAnomaly.id)}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs transition-all"
                >
                  <FileSearch className="w-4 h-4 text-slate-400" />
                  <span>ASK COPILOT</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
