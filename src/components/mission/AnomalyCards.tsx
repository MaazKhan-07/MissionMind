import React from 'react';
import { AnomalyItem } from '../../types';
import { Badge } from '../common/Badge';
import { AlertTriangle, Clock, Layers, FileText, ArrowRight } from 'lucide-react';

interface AnomalyCardsProps {
  anomalies: AnomalyItem[];
  onInvestigate: (anomaly: AnomalyItem) => void;
}

export const AnomalyCards: React.FC<AnomalyCardsProps> = ({
  anomalies,
  onInvestigate
}) => {
  return (
    <div className="space-y-3">
      {anomalies.map((item) => (
        <div
          key={item.id}
          className={`mission-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all border-l-4 ${
            item.severity === 'CRITICAL'
              ? 'border-l-red-500 bg-red-950/10'
              : item.severity === 'WARNING'
              ? 'border-l-amber-500 bg-amber-950/10'
              : 'border-l-cyan-500 bg-cyan-950/10'
          }`}
        >
          {/* Left Info Column */}
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  item.severity === 'CRITICAL'
                    ? 'critical'
                    : item.severity === 'WARNING'
                    ? 'inference'
                    : 'system'
                }
              >
                {item.severity}
              </Badge>
              <span className="font-mono text-xs font-bold text-slate-100">
                {item.id}
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {item.timestamp}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 shrink-0 ${
                item.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
              }`} />
              {item.title}
            </h4>

            <p className="text-xs text-slate-300">
              {item.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
              <div className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-system" />
                <span>SUBSYSTEM: <strong className="text-slate-200">{item.subsystem}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-fact" />
                <span>EVIDENCE: <strong className="text-fact">{item.evidence_count} records</strong></span>
              </div>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={() => onInvestigate(item)}
              className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-system-dark to-blue-600 hover:from-system hover:to-blue-500 text-black font-bold font-mono text-xs rounded-lg shadow-cyan-glow flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>INVESTIGATE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
