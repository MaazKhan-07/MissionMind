import React, { useState } from 'react';
import { Activity, AlertTriangle, LineChart as IconLineChart, Zap, Thermometer, Radio } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

export const TelemetryView: React.FC = () => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('EPS');

  // Synthetic time-series telemetry data for charts
  const epsData = [
    { time: '14:25:00', voltage: 27.8, limit_min: 24.5, current: 8.2 },
    { time: '14:27:00', voltage: 27.6, limit_min: 24.5, current: 8.5 },
    { time: '14:28:02', voltage: 27.4, limit_min: 24.5, current: 9.1 },
    { time: '14:29:17', voltage: 26.2, limit_min: 24.5, current: 14.8 },
    { time: '14:30:04', voltage: 25.1, limit_min: 24.5, current: 18.2 },
    { time: '14:31:42', voltage: 23.8, limit_min: 24.5, current: 19.5 }, // UNDERVOLTAGE VIOLATION
    { time: '14:33:00', voltage: 24.1, limit_min: 24.5, current: 16.0 },
    { time: '14:35:00', voltage: 25.4, limit_min: 24.5, current: 11.2 },
  ];

  const commsData = [
    { time: '14:25:00', snr: -65.2, limit_min: -90.0 },
    { time: '14:28:02', snr: -66.8, limit_min: -90.0 },
    { time: '14:30:04', snr: -78.4, limit_min: -90.0 },
    { time: '14:31:42', snr: -95.1, limit_min: -90.0 }, // DEGRADED VIOLATION
    { time: '14:32:18', snr: -102.4, limit_min: -90.0 }, // DEGRADED VIOLATION
    { time: '14:35:00', snr: -72.1, limit_min: -90.0 },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              TELEMETRY INTELLIGENCE & THRESHOLD ANALYSIS
            </h2>
            <p className="text-xs text-slate-400">
              Interactive parameter visualization with limit violation detection
            </p>
          </div>
        </div>

        {/* Subsystem Selector */}
        <div className="flex items-center space-x-2">
          {['EPS', 'COMMS', 'THERMAL'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubsystem(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSubsystem === sub
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sub} SUBSYSTEM
            </button>
          ))}
        </div>
      </div>

      {/* Limit Violation Warning Callout Banner */}
      <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 flex items-center justify-between text-red-200 text-xs">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <span className="font-bold text-red-300 uppercase">LIMIT VIOLATION DETECTED — EPS BATTERY BUS</span>
            <p className="text-red-200/80">Value 23.8 V breached minimum threshold limit of 24.5 V at 14:31:42 UTC.</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase">THRESHOLD</span>
          <span className="font-bold text-red-400 font-mono">24.5 V MIN</span>
        </div>
      </div>

      {/* Main Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Battery Bus Voltage */}
        <div className="glass-panel p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>EPS BATTERY BUS VOLTAGE (V)</span>
            </span>
            <span className="text-xs font-bold text-red-400">CRITICAL LOW: 23.8 V</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={epsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis domain={[22, 30]} stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <ReferenceLine y={24.5} label={{ value: 'MIN LIMIT 24.5V', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="voltage" stroke="#38bdf8" strokeWidth={2.5} dot={{ fill: '#38bdf8', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Transceiver Signal Strength SNR */}
        <div className="glass-panel p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase flex items-center space-x-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>COMMS S-BAND SIGNAL STRENGTH (dBm)</span>
            </span>
            <span className="text-xs font-bold text-amber-400">DEGRADED: -102.4 dBm</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={commsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis domain={[-110, -50]} stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <ReferenceLine y={-90.0} label={{ value: 'LIMIT -90dBm', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="snr" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
