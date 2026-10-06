import React from 'react';
import { FileText, Printer, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const MissionBrief: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              EXECUTIVE MISSION BRIEF & INCIDENT REPORT
            </h2>
            <p className="text-xs text-slate-400">
              Auditable operational report compiled from verified backend telemetry evidence
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs transition-all shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>PRINT / EXPORT REPORT</span>
        </button>
      </div>

      {/* Printable Brief Document Container */}
      <div className="glass-panel-glow p-8 rounded-2xl space-y-6 border-slate-800 text-slate-200">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 tracking-wider">MISSIONMIND • ST-10 OPERATIONAL REPORT</span>
            <h1 className="text-xl font-bold text-slate-100 mt-1 uppercase">INCIDENT BRIEF: ANOM-001 (COMMUNICATIONS DEGRADATION)</h1>
            <p className="text-xs text-slate-400">Generated: 2026-03-14 14:35:00 UTC • Orbit Pass 1432</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-3 py-1 rounded bg-amber-500/20 border border-amber-500/50 text-amber-400">
              STATE: DEGRADED
            </span>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
          ℹ️ <span className="font-bold text-slate-300">DATA CLASSIFICATION:</span> Grounded telemetry decision support. Contains <span className="text-cyan-400 font-bold">Illustrative synthetic data</span> for hackathon demonstration.
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">1. EXECUTIVE SUMMARY</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            At 14:32:18 UTC during orbital pass 1432, Ground Station reported an abrupt 4.2 dBm attenuation in S-Band Transceiver RF signal strength. RAG evidence retrieval confirmed that EPS main battery bus voltage dropped to 23.8 V at 14:31:42 UTC (breaching the 24.5 V warning limit), causing automatic transceiver power throttle.
          </p>
        </div>

        {/* Section 2: Key Telemetry Metrics */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">2. VERIFIED TELEMETRY EVIDENCE</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">EPS VOLTAGE</span>
              <span className="text-xs font-bold text-red-400">23.8 V (LOW)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">COMMS SIGNAL</span>
              <span className="text-xs font-bold text-amber-400">-102.4 dBm</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">CURRENT DRAW</span>
              <span className="text-xs font-bold text-amber-400">18.2 A</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">EVIDENCE COVERAGE</span>
              <span className="text-xs font-bold text-emerald-400">87% VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Section 3: Recommended Action & Procedure */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">3. RECOMMENDED OPERATIONAL ACTIONS</h3>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
            <div className="font-bold text-slate-200">PROCEDURE COMMS-04 STEP 1 & 3:</div>
            <p className="text-slate-300">Execute load shedding on non-critical secondary payload thermal heaters to restore EPS bus voltage above 24.5 V minimum threshold.</p>
          </div>
        </div>

        {/* Section 4: Audit & Signoff */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div>AUDIT TRAIL HASH: <span className="font-mono text-slate-300">8f3e2b10a99c4d5e7f123...</span></div>
          <div className="flex items-center space-x-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CHAIN VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
