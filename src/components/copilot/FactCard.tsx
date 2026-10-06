import React from 'react';
import { Fact } from '../../types';
import { CitationChip } from './CitationChip';
import { CheckCircle2 } from 'lucide-react';

interface FactCardProps {
  fact: Fact;
  onCitationClick: (citation: string) => void;
  activeCitation?: string | null;
}

export const FactCard: React.FC<FactCardProps> = ({
  fact,
  onCitationClick,
  activeCitation
}) => {
  return (
    <div className="mission-card mission-card-fact p-3.5 space-y-2 relative overflow-hidden group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1">
          <CheckCircle2 className="w-4 h-4 text-fact shrink-0 mt-0.5" />
          <div className="text-xs text-slate-100 font-medium leading-relaxed">
            {fact.statement}
          </div>
        </div>
        <CitationChip
          citation={fact.citation}
          onClick={onCitationClick}
          active={activeCitation === fact.citation}
        />
      </div>

      {fact.observed_value && (
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pl-6 border-t border-emerald-500/10 pt-1.5">
          <span>PARAM: <strong className="text-emerald-300">{fact.parameter || 'telemetry'}</strong></span>
          <span>OBSERVED: <strong className="text-emerald-400 font-bold">{fact.observed_value}</strong></span>
        </div>
      )}
    </div>
  );
};
