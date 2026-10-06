import React from 'react';
import { Inference } from '../../types';
import { CitationChip } from './CitationChip';
import { Badge } from '../common/Badge';
import { Lightbulb, Info } from 'lucide-react';

interface InferenceCardProps {
  inference: Inference;
  onCitationClick: (citation: string) => void;
  activeCitation?: string | null;
}

export const InferenceCard: React.FC<InferenceCardProps> = ({
  inference,
  onCitationClick,
  activeCitation
}) => {
  return (
    <div className="mission-card mission-card-inference p-4 space-y-3 relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1">
          <Lightbulb className="w-4 h-4 text-inference shrink-0 mt-0.5" />
          <div className="text-xs text-slate-100 font-semibold leading-relaxed">
            {inference.statement}
          </div>
        </div>
        <Badge variant="inference">
          CONFIDENCE: {inference.confidence}
        </Badge>
      </div>

      <div className="pl-6 space-y-2 border-t border-amber-500/10 pt-2 text-xs">
        <div className="flex items-start gap-1.5 text-slate-300">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-300">
            <strong className="text-amber-400 font-mono">Reasoning:</strong> {inference.reasoning}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-mono text-slate-400">SUPPORTING EVIDENCE:</span>
          {inference.citations.map((cit) => (
            <CitationChip
              key={cit}
              citation={cit}
              onClick={onCitationClick}
              active={activeCitation === cit}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
