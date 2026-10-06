import React from 'react';
import { HistoricalIncident } from '../../types';
import { Badge } from '../common/Badge';
import { History, CheckCircle2, AlertTriangle, BookOpen, ArrowRight } from 'lucide-react';

interface IncidentCardProps {
  incident: HistoricalIncident;
  onView: (id: string) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onView }) => {
  return (
    <div className="mission-card p-5 space-y-4 relative overflow-hidden group">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-100">
                {incident.id}
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-xs text-slate-400">
                {incident.timestamp}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-100">
              {incident.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">SIMILARITY:</span>
          <Badge variant={incident.similarity_score > 85 ? 'inference' : 'system'}>
            {incident.similarity_score}% MATCH
          </Badge>
        </div>
      </div>

      {/* Similarity Reasons Breakdown */}
      <div className="bg-space-950 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
          WHY SIMILAR TO CURRENT ANOMALY?
        </span>
        <ul className="space-y-1 font-mono text-[11px] text-slate-300">
          {incident.similarity_reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">ROOT CAUSE</span>
          <span className="text-amber-300 font-semibold">{incident.root_cause}</span>
        </div>
        <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">HISTORICAL RESOLUTION</span>
          <span className="text-emerald-300 font-semibold">{incident.resolution}</span>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          APPLIED SOP: <strong className="text-blue-300">{incident.procedure_used}</strong>
        </span>
        <button
          onClick={() => onView(incident.id)}
          className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline"
        >
          <span>VIEW INCIDENT RECORD</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
