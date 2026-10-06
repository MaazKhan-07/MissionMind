import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import { Badge } from '../common/Badge';
import { Clock, GitCommit, FileCode, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface IncidentTimelineProps {
  events: TimelineEvent[];
  onSelectNode: (sourceId: string) => void;
  selectedSourceId?: string | null;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  events,
  onSelectNode,
  selectedSourceId
}) => {
  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('vertical');

  return (
    <div className="bg-space-900 border border-slate-800 rounded-xl p-6 space-y-6 select-none shadow-2xl">
      {/* Timeline Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-tech text-base font-bold text-slate-100 tracking-wider">
              DETERMINISTIC INCIDENT TIMELINE
            </h3>
            <span className="font-mono text-xs text-cyan-400">
              TIME WINDOW: 14:28:02 UTC → 14:33:01 UTC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'vertical' ? 'horizontal' : 'vertical')}
            className="px-3 py-1.5 bg-space-800 hover:bg-space-750 border border-slate-700 text-xs font-mono text-slate-300 rounded-lg transition-colors"
          >
            TOGGLE {viewMode === 'vertical' ? 'HORIZONTAL' : 'VERTICAL'}
          </button>
        </div>
      </div>

      {/* Deterministic Rules Notice */}
      <div className="p-3 bg-space-950 border border-slate-800 rounded-lg flex items-center gap-2 text-xs font-mono text-slate-400">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>Timeline events are generated strictly from timestamped telemetry logs. No AI hallucinated events.</span>
      </div>

      {/* Vertical Timeline View */}
      {viewMode === 'vertical' ? (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-amber-500 before:to-red-500">
          {events.map((ev) => {
            const isSelected = selectedSourceId === ev.source_id;
            return (
              <div
                key={ev.id}
                onClick={() => onSelectNode(ev.source_id)}
                className={`relative group cursor-pointer p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-cyan-glow'
                    : 'bg-space-950/80 border-slate-800 hover:border-slate-700 hover:bg-space-950'
                }`}
              >
                {/* Node Dot Icon */}
                <div className={`absolute -left-[31px] top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-space-950 ${
                  ev.severity === 'CRITICAL'
                    ? 'border-red-500 text-red-400 shadow-red-glow'
                    : ev.severity === 'WARNING'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-cyan-500 text-cyan-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    ev.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' : ev.severity === 'WARNING' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-100">{ev.timestamp}</span>
                    <span className="text-slate-500">({ev.time_offset})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ev.severity === 'CRITICAL' ? 'critical' : ev.severity === 'WARNING' ? 'inference' : 'system'}>
                      {ev.subsystem} • {ev.severity}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-medium">
                  {ev.event}
                </p>

                {ev.details && (
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    {ev.details}
                  </p>
                )}

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-400 group-hover:underline">
                    <FileCode className="w-3 h-3" />
                    SOURCE RECORD: [{ev.source_id}]
                  </span>
                  <span>Click node to inspect evidence →</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Horizontal Scroll Timeline View */
        <div className="overflow-x-auto pb-4">
          <div className="flex items-stretch gap-4 min-w-[900px] pt-4 relative">
            {events.map((ev, idx) => (
              <div
                key={ev.id}
                onClick={() => onSelectNode(ev.source_id)}
                className="w-64 shrink-0 bg-space-950 border border-slate-800 p-4 rounded-xl space-y-3 cursor-pointer hover:border-cyan-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                    <span className="font-bold text-slate-100">{ev.timestamp}</span>
                    <Badge variant={ev.severity === 'CRITICAL' ? 'critical' : 'system'}>
                      {ev.severity}
                    </Badge>
                  </div>
                  <div className="text-xs font-medium text-slate-200">
                    {ev.event}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
                  <span>[{ev.source_id}]</span>
                  <span>{ev.subsystem}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
