import React from 'react';
import { MissionScene } from '../components/mission/MissionScene';
import { MissionHealth } from '../components/mission/MissionHealth';
import { AnomalyCards } from '../components/mission/AnomalyCards';
import { MissionHealthData, AnomalyItem } from '../types';
import { Radio, AlertTriangle, ArrowRight, Bot, ShieldCheck, Sparkles } from 'lucide-react';

interface OverviewPageProps {
  healthData: MissionHealthData;
  anomalies: AnomalyItem[];
  onOpenCopilot: (query?: string) => void;
  onOpenAnomalies: () => void;
  onSelectSatellite: () => void;
  onInvestigateAnomaly: (anomaly: AnomalyItem) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  healthData,
  anomalies,
  onOpenCopilot,
  onOpenAnomalies,
  onSelectSatellite,
  onInvestigateAnomaly
}) => {
  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Cinematic Aerospace Top Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border border-slate-800 p-8 shadow-2xl overflow-hidden radar-overlay">
        {/* Ambient Glow Backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>MISSION ALPHA // COMMAND CENTER</span>
          </div>

          <h1 className="font-tech text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-wider text-slate-100 uppercase">
            MISSION OPERATIONS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">INTELLIGENCE</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
            Evidence-grounded decision support for faster, safer and auditable mission operations. Trace every claim directly to verified telemetry logs.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onOpenCopilot()}
              className="px-6 py-3 bg-gradient-to-r from-system to-blue-600 hover:from-system-bright hover:to-blue-500 text-black font-bold font-mono text-xs rounded-xl shadow-cyan-glow flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <Bot className="w-4 h-4" />
              <span>OPEN COPILOT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAnomalies}
              className="px-6 py-3 bg-space-800 hover:bg-space-750 text-slate-200 font-mono text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2.5 transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>VIEW ACTIVE ANOMALIES ({anomalies.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Mission Orbital Visualization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-tech text-base font-bold text-slate-200 tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            REAL-TIME ORBITAL TELEMETRY SCENE
          </h2>
          <span className="font-mono text-xs text-slate-400">SAT-01 • LEO ORBIT</span>
        </div>
        <MissionScene
          onSelectSatellite={onSelectSatellite}
          status="DEGRADED"
        />
      </div>

      {/* Mission Health 4 Compact Metric Cards */}
      <div className="space-y-3">
        <h2 className="font-tech text-base font-bold text-slate-200 tracking-wider">
          CRITICAL SUBSYSTEM HEALTH & TELEMETRY
        </h2>
        <MissionHealth data={healthData} />
      </div>

      {/* Active Anomalies Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-tech text-base font-bold text-slate-200 tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            ACTIVE MISSION ANOMALIES
          </h2>
          <button
            onClick={onOpenAnomalies}
            className="font-mono text-xs text-cyan-400 hover:underline"
          >
            SEE ALL ANOMALIES →
          </button>
        </div>
        <AnomalyCards
          anomalies={anomalies}
          onInvestigate={onInvestigateAnomaly}
        />
      </div>
    </div>
  );
};
