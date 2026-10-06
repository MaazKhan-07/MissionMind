import React from 'react';
import { Recommendation } from '../../types';
import { CitationChip } from './CitationChip';
import { ShieldAlert, BookOpen } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onProcedureClick: (procedureId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onProcedureClick
}) => {
  return (
    <div className="mission-card mission-card-recommendation p-3.5 space-y-2 relative overflow-hidden group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-mono text-xs font-bold shrink-0">
            0{recommendation.step_number}
          </span>
          <div className="text-xs text-slate-100 font-medium leading-relaxed pt-0.5">
            {recommendation.action}
          </div>
        </div>
        <CitationChip
          citation={recommendation.procedure_id}
          onClick={onProcedureClick}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pl-9 border-t border-blue-500/10 pt-1.5">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-blue-400" />
          <span>PROCEDURE: <strong className="text-blue-300">{recommendation.procedure_name}</strong></span>
        </span>
        <button
          onClick={() => onProcedureClick(recommendation.procedure_id)}
          className="text-blue-400 hover:underline font-semibold"
        >
          VIEW SOP →
        </button>
      </div>
    </div>
  );
};
