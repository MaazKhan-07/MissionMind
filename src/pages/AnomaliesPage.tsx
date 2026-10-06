import React from 'react';
import { AnomalyItem } from '../types';
import { AnomalyCards } from '../components/mission/AnomalyCards';
import { AlertTriangle, Filter } from 'lucide-react';

interface AnomaliesPageProps {
  anomalies: AnomalyItem[];
  onInvestigate: (anomaly: AnomalyItem) => void;
}

export const AnomaliesPage: React.FC<AnomaliesPageProps> = ({
  anomalies,
  onInvestigate
}) => {
  return (
    <div className="space-y-6 pb-12 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-tech text-2xl font-bold text-slate-100 uppercase tracking-wider">
              ACTIVE ANOMALIES & INCIDENTS
            </h1>
            <span className="font-mono text-xs text-amber-400">
              {anomalies.length} OPEN FLIGHT ANOMALIES FLAGGED
            </span>
          </div>
        </div>
      </div>

      <AnomalyCards anomalies={anomalies} onInvestigate={onInvestigate} />
    </div>
  );
};
