import React, { useState, useEffect } from 'react';
import { CopilotAnswer } from '../../types';
import { FactCard } from './FactCard';
import { InferenceCard } from './InferenceCard';
import { RecommendationCard } from './RecommendationCard';
import { AbstentionState } from './AbstentionState';
import { DroppedClaimsBadge } from './DroppedClaimsBadge';
import { PromptInjectionAlert } from './PromptInjectionAlert';
import { Badge } from '../common/Badge';
import {
  Clock,
  Database,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AnswerViewProps {
  answer: CopilotAnswer | null;
  loading: boolean;
  onCitationClick: (citation: string) => void;
  onProcedureClick: (procedureId: string) => void;
  onViewEvidence: () => void;
  onTryQuery: (query: string) => void;
  activeCitation?: string | null;
}

export const AnswerView: React.FC<AnswerViewProps> = ({
  answer,
  loading,
  onCitationClick,
  onProcedureClick,
  onViewEvidence,
  onTryQuery,
  activeCitation
}) => {
  const [loadingStep, setLoadingStep] = useState<number>(0);

  const processingSteps = [
    'QUERY PARSED',
    'TIME WINDOW IDENTIFIED (14:28:00 – 14:35:00 UTC)',
    'RETRIEVING TELEMETRY & FLIGHT LOGS',
    'SEARCHING HISTORICAL INCIDENTS',
    'CHECKING OPERATIONAL PROCEDURES',
    'VALIDATING NUMERICAL CITATIONS',
    'ANSWER VERIFIED BY GUARDRAIL ENGINE'
  ];

  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < processingSteps.length - 1) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="bg-space-900 border border-slate-800 rounded-xl p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="font-tech text-base font-bold text-slate-100 tracking-wider">
              MISSIONMIND EVIDENCE PIPELINE
            </h3>
            <span className="font-mono text-xs text-cyan-400">EXECUTING GROUNDED REASONING CHAIN</span>
          </div>
        </div>

        {/* Animated Processing Step Sequence */}
        <div className="space-y-3 font-mono text-xs">
          {processingSteps.map((step, idx) => {
            const isCompleted = idx < loadingStep;
            const isCurrent = idx === loadingStep;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-cyan-glow/20'
                    : isCompleted
                    ? 'bg-space-950/60 border-slate-800 text-slate-400'
                    : 'bg-space-950/20 border-slate-900 text-slate-600 opacity-40'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className="flex-1 font-semibold">{step}</span>
                {isCurrent && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="bg-space-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-space-800 border border-slate-700 flex items-center justify-center mx-auto text-cyan-400">
          <Database className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-tech text-base font-bold text-slate-200">READY FOR INVESTIGATION</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Select an active anomaly or enter a spacecraft query on the left to trigger evidence-grounded AI reasoning.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Query Header Bar */}
      <div className="bg-space-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">QUERY:</span>
            <h3 className="text-sm font-semibold text-slate-100 font-mono">
              "{answer.query}"
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={answer.retrieval_strength === 'HIGH' ? 'fact' : answer.retrieval_strength === 'MEDIUM' ? 'inference' : 'critical'}>
              RETRIEVAL STRENGTH: {answer.retrieval_strength}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>TIME WINDOW: <strong className="text-slate-200">{answer.time_window.start} → {answer.time_window.end}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-fact" />
            <span>EVIDENCE RECORDS: <strong className="text-fact">{answer.retrieved_records_count} RETRIEVED</strong></span>
          </div>
        </div>
      </div>

      {/* Prompt Injection Visualization Alert */}
      {answer.prompt_injection_detected && (
        <PromptInjectionAlert source={answer.suspicious_source} />
      )}

      {/* ABSTENTION STATE */}
      {answer.abstain ? (
        <AbstentionState
          reason={answer.abstain_reason}
          missingData={answer.missing_data}
          onViewEvidence={onViewEvidence}
          onTryQuery={onTryQuery}
        />
      ) : (
        /* THREE-TIER EVIDENCE ANSWER UI */
        <div className="space-y-6">
          {/* 🟢 SECTION 1: OBSERVED FACTS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <h4 className="font-tech text-sm font-bold text-emerald-400 flex items-center gap-2 tracking-wider">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                🟢 1. OBSERVED FACTS
              </h4>
              <span className="font-mono text-[10px] text-emerald-400/80 uppercase">
                DIRECTLY SUPPORTED BY MISSION RECORDS
              </span>
            </div>

            <div className="space-y-2">
              {answer.facts.map((fact) => (
                <FactCard
                  key={fact.id}
                  fact={fact}
                  onCitationClick={onCitationClick}
                  activeCitation={activeCitation}
                />
              ))}
            </div>
          </div>

          {/* 🟠 SECTION 2: INFERENCE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <h4 className="font-tech text-sm font-bold text-amber-400 flex items-center gap-2 tracking-wider">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                🟠 2. INFERENCE
              </h4>
              <span className="font-mono text-[10px] text-amber-400/80 uppercase">
                INTERPRETATION OF MULTIPLE OBSERVATIONS
              </span>
            </div>

            <div className="space-y-2">
              {answer.inferences.map((inf) => (
                <InferenceCard
                  key={inf.id}
                  inference={inf}
                  onCitationClick={onCitationClick}
                  activeCitation={activeCitation}
                />
              ))}
            </div>
          </div>

          {/* 🔵 SECTION 3: RECOMMENDATIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-blue-500/30 pb-2">
              <h4 className="font-tech text-sm font-bold text-blue-400 flex items-center gap-2 tracking-wider">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                🔵 3. RECOMMENDATIONS
              </h4>
              <span className="font-mono text-[10px] text-blue-400/80 uppercase">
                PROCEDURE-GROUNDED ACTION STEPS
              </span>
            </div>

            <div className="space-y-2">
              {answer.recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.step_number}
                  recommendation={rec}
                  onProcedureClick={onProcedureClick}
                />
              ))}
            </div>
          </div>

          {/* 🛡️ DROPPED CLAIMS EVIDENCE GUARDRAIL */}
          {answer.dropped_claims && answer.dropped_claims.length > 0 && (
            <DroppedClaimsBadge claims={answer.dropped_claims} />
          )}

          {/* Audit Chain Footer Stamp */}
          <div className="p-3 bg-space-950 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between font-mono text-[10px] text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AUDIT SESSION: <strong className="text-slate-200">{answer.audit_session_id}</strong></span>
            </div>
            <div className="truncate max-w-xs">
              <span>HASH: <span className="text-cyan-400 truncate">{answer.chain_hash}</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
