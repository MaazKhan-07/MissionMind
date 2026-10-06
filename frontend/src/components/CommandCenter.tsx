import React, { useState, useEffect } from 'react';
import {
  Activity, AlertTriangle, ShieldCheck, Cpu, Radio, Zap, Thermometer,
  ArrowRight, RefreshCw, CheckCircle2, Clock, FileText, Database
} from 'lucide-react';
import { ThreeMissionView } from './ThreeMissionView';
import { getAnomalies } from '../services/api';
import { AnomalyItem } from '../types';

interface CommandCenterProps {
  onInvestigateAnomaly: (anomaly: AnomalyItem) => void;
  onOpenTimeline: () => void;
  onOpenAudit: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onInvestigateAnomaly,
  onOpenTimeline,
  onOpenAudit
}) => {
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverviewData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnomalies();
      setAnomalies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch operational anomalies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner / Mission Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border-cyan-500/20">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-cyan-950 border border-cyan-800 text-cyan-400">
              PASS 1432 • ST-10 ORBITAL OPERATOR
            </span>
            <span className="text-xs text-slate-400">UTC 2026-03-14 14:35:00</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide">
            MISSION OPERATIONS COMMAND CENTER
          </h2>
          <p className="text-xs text-slate-400">
            Real-time evidence-grounded anomaly decision support system
          </p>
        </div>

        <button
          onClick={fetchOverviewData}
          className="self-start lg:self-auto flex items-center space-x-2 px-3 py-2 rounded-xl glass-panel hover:border-cyan-500/50 text-xs text-slate-300 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>REFRESH METRICS</span>
        </button>
      </div>

      {/* 3D Mission Orbit Visualization & Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreeMissionView status="DEGRADED" />
        </div>

        {/* System Health Breakdown Card */}
        <div className="glass-panel p-5 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>SUBSYSTEM HEALTH STATUS</span>
              <span className="text-[10px] text-slate-500">REALTIME</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-300">COMMS Subsystem</span>
                </div>
                <span className="text-xs font-bold text-amber-400">DEGRADED (-102 dBm)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-slate-300">EPS Power Bus</span>
                </div>
                <span className="text-xs font-bold text-red-400">UNDERVOLTAGE (23.8V)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-300">Thermal Control</span>
                </div>
                <span className="text-xs font-bold text-amber-400">ELEVATED (68.2°C)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300">AI Guardrail Pipeline</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">ACTIVE & VERIFIED</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <div className="p-2 rounded bg-slate-900 text-center">
              <span className="text-slate-500 block">EVIDENCE COVERAGE</span>
              <span className="text-cyan-400 font-bold text-sm">87% VERIFIED</span>
            </div>
            <div className="p-2 rounded bg-slate-900 text-center">
              <span className="text-slate-500 block">AUDIT CHAIN</span>
              <span className="text-emerald-400 font-bold text-sm">147 ENTRIES</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Anomalies Section (P0 Requirement) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              ACTIVE MISSION ANOMALIES ({anomalies.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Click anomaly to open 1-click investigation
          </span>
        </div>

        {loading ? (
          <div className="p-8 glass-panel rounded-xl text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading active mission anomalies...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-950/30 border border-red-500/40 text-center space-y-3">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
            <p className="text-xs text-red-300">Unable to retrieve live anomaly feed: {error}</p>
            <button
              onClick={fetchOverviewData}
              className="px-3 py-1.5 rounded-lg bg-red-900/50 hover:bg-red-900 border border-red-700 text-xs text-red-200"
            >
              Retry Connection
            </button>
          </div>
        ) : anomalies.length === 0 ? (
          <div className="p-8 glass-panel rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-slate-200">No active anomalies detected.</p>
            <p className="text-xs text-slate-400">All spacecraft subsystems operating within nominal parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="glass-panel-glow p-5 rounded-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-cyan-400">{anom.id}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-semibold text-slate-300">{anom.subsystem} SUBSYSTEM</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      anom.severity === 'CRITICAL' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                      'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    }`}>
                      {anom.severity}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {anom.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {anom.affected_parameters.map((param) => (
                      <span key={param} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {param}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{anom.timestamp.split(' ')[1]}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{anom.evidence_count} evidence records</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onInvestigateAnomaly(anom)}
                    className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs transition-all shadow-md shadow-cyan-500/10"
                  >
                    <span>INVESTIGATE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access Operational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div
          onClick={onOpenTimeline}
          className="glass-panel p-4 rounded-xl cursor-pointer hover:border-cyan-500/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase">DETERMINISTIC TIMELINE</h4>
              <p className="text-[11px] text-slate-400">Inspect chronologically timestamped mission events</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </div>

        <div
          onClick={onOpenAudit}
          className="glass-panel p-4 rounded-xl cursor-pointer hover:border-cyan-500/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase">AUDIT TRAIL & HASH VERIFICATION</h4>
              <p className="text-[11px] text-slate-400">Verify tamper-evident SHA-256 audit chain</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
