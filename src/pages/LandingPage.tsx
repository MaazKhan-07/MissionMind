import React from 'react';
import { InteractiveMesh } from '../components/spatial/InteractiveMesh';
import {
  ArrowRight,
  ShieldCheck,
  Bot,
  Activity,
  Layers,
  Radio,
  FileCheck,
  Film
} from 'lucide-react';

interface LandingPageProps {
  onEnterMissionControl: () => void;
  onExploreCopilot: () => void;
  onReplayIntro?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterMissionControl,
  onExploreCopilot,
  onReplayIntro
}) => {
  return (
    <div className="relative min-h-screen bg-void text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Interactive 3D Mesh Layer */}
      <div className="absolute inset-0 z-0">
        <InteractiveMesh className="w-full h-full opacity-80" />
      </div>

      {/* Atmospheric Radial Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.12)_0%,rgba(139,92,246,0.08)_45%,transparent_70%)] pointer-events-none z-0" />

      {/* Main Hero Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-28 pb-16 text-center max-w-5xl mx-auto space-y-8">
        {/* Aerospace Mission Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-panel border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold shadow-cyan-glow">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>ORBITAL-01 // FLIGHT READINESS LEVEL 9</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">STATUS NOMINAL</span>
        </div>

        {/* Primary Headline */}
        <div className="space-y-4">
          <h1 className="font-tech text-5xl sm:text-7xl lg:text-8xl font-black tracking-widest text-slate-100 uppercase">
            MISSION<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">MIND</span>
          </h1>

          <p className="font-tech text-xl sm:text-2xl text-cyan-300/90 font-bold tracking-wider max-w-2xl mx-auto">
            Evidence-grounded intelligence for mission operations.
          </p>

          <p className="font-sans text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Investigate anomalies, trace evidence, understand telemetry, and make decisions you can verify.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onEnterMissionControl}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-tech font-bold text-sm tracking-wider uppercase rounded-xl shadow-cyan-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <span>Enter Mission Control</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreCopilot}
            className="px-7 py-4 glass-panel hover:bg-space-800/80 text-slate-200 font-tech font-bold text-sm tracking-wider uppercase rounded-xl border-slate-700 hover:border-cyan-500/40 hover:text-white transition-all flex items-center gap-2.5"
          >
            <Bot className="w-4 h-4 text-violet-400" />
            <span>Explore Mission Intelligence</span>
          </button>

          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="px-4 py-4 glass-panel hover:bg-space-800/80 text-slate-400 hover:text-slate-200 rounded-xl border-slate-800 text-xs font-mono transition-all flex items-center gap-2"
              title="Watch Intro Sequence"
            >
              <Film className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Intro</span>
            </button>
          )}
        </div>

        {/* Key Aerospace Metrics Strip */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 max-w-4xl">
          <div className="glass-panel p-4 rounded-xl text-left border-slate-800/80 space-y-1">
            <span className="font-mono text-[10px] text-slate-500 uppercase block font-semibold">MISSION HEALTH</span>
            <div className="font-mono text-xl font-bold text-emerald-400 flex items-center gap-1.5">
              <span>96%</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-[11px] text-slate-400">Within Nominal Limits</span>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left border-slate-800/80 space-y-1">
            <span className="font-mono text-[10px] text-slate-500 uppercase block font-semibold">ACTIVE ANOMALIES</span>
            <div className="font-mono text-xl font-bold text-amber-400 flex items-center gap-1.5">
              <span>02</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <span className="text-[11px] text-slate-400">1 Degraded • 1 Review</span>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left border-slate-800/80 space-y-1">
            <span className="font-mono text-[10px] text-slate-500 uppercase block font-semibold">EVIDENCE COVERAGE</span>
            <div className="font-mono text-xl font-bold text-cyan-400 flex items-center gap-1.5">
              <span>94%</span>
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-[11px] text-slate-400">Traceable Telemetry IDs</span>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left border-slate-800/80 space-y-1">
            <span className="font-mono text-[10px] text-slate-500 uppercase block font-semibold">AUDIT INTEGRITY</span>
            <div className="font-mono text-xl font-bold text-violet-400 flex items-center gap-1.5">
              <span>100%</span>
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <span className="text-[11px] text-slate-400">SHA-256 Tamper Evident</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 py-4 px-6 border-t border-slate-800/60 glass-panel flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-4">
        <div>
          MISSION OPERATIONS INTELLIGENCE & EVIDENCE COPILOT // ST-10
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>EVIDENCE FIRST • EXPLANATION SECOND</span>
        </div>
      </footer>
    </div>
  );
};
