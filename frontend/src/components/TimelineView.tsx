import React, { useState, useEffect } from 'react';
import { Clock, Filter, FileSearch, AlertTriangle, ArrowRight } from 'lucide-react';
import { getTimeline } from '../services/api';
import { TimelineItem } from '../types';

interface TimelineViewProps {
  onSelectCitation: (recordId: string) => void;
  anomalyId?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onSelectCitation, anomalyId }) => {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    getTimeline(anomalyId)
      .then((data) => setTimeline(data))
      .finally(() => setLoading(false));
  }, [anomalyId]);

  const subsystems = ['ALL', 'EPS', 'COMMS', 'THERMAL', 'GROUND', 'ADCS'];

  const filteredTimeline = selectedSubsystem === 'ALL'
    ? timeline
    : timeline.filter(t => t.subsystem === selectedSubsystem);

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              DETERMINISTIC INCIDENT TIMELINE
            </h2>
            <p className="text-xs text-slate-400">
              Chronologically ordered timestamped events directly extracted from telemetry logs
            </p>
          </div>
        </div>

        {/* Subsystem Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">FILTER:</span>
          <div className="flex flex-wrap gap-1">
            {subsystems.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubsystem(sub)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  selectedSubsystem === sub
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="p-12 glass-panel rounded-2xl text-center space-y-3">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Generating deterministic timeline...</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
          {filteredTimeline.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Marker Point */}
              <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center ${
                item.severity === 'CRITICAL' ? 'border-red-500 bg-red-950' :
                item.severity === 'WARNING' ? 'border-amber-500 bg-amber-950' :
                'border-cyan-500 bg-cyan-950'
              }`} />

              {/* Event Card */}
              <div className="glass-panel p-4 rounded-xl space-y-3 group-hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {item.timestamp}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">{item.subsystem}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      item.severity === 'CRITICAL' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                      item.severity === 'WARNING' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' :
                      'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      {item.severity}
                    </span>

                    <button
                      onClick={() => onSelectCitation(item.source_id)}
                      className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:border-cyan-500 text-xs font-bold font-mono transition-all"
                    >
                      [{item.source_id}]
                    </button>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-100">
                  {item.event}
                </p>

                {/* "Why this event?" Action (P0 Requirement: opens source record evidence modal!) */}
                <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                  <button
                    onClick={() => onSelectCitation(item.source_id)}
                    className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>WHY THIS EVENT? (INSPECT SOURCE RECORD)</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
