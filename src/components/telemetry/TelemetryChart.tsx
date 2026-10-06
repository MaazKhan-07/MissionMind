import React, { useState } from 'react';
import { TelemetryPoint } from '../../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Badge } from '../common/Badge';
import { LineChart as ChartIcon, Sliders, AlertCircle, Filter } from 'lucide-react';

interface TelemetryChartProps {
  data: TelemetryPoint[];
}

interface ParamConfig {
  name: string;
  unit: string;
  color: string;
  minThreshold?: number;
  maxThreshold?: number;
  subsystem: string;
  currentVal: string;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ data }) => {
  const [selectedParam, setSelectedParam] = useState<'battery_voltage' | 'comms_current' | 'signal_strength' | 'temperature'>('battery_voltage');
  const [subsystemFilter, setSubsystemFilter] = useState<string>('EPS');

  const paramConfigs: Record<'battery_voltage' | 'comms_current' | 'signal_strength' | 'temperature', ParamConfig> = {
    battery_voltage: {
      name: 'Battery Bus Voltage',
      unit: 'V',
      color: '#F59E0B',
      minThreshold: 24.5,
      maxThreshold: 29.0,
      subsystem: 'EPS',
      currentVal: '23.8 V (LOW)'
    },
    comms_current: {
      name: 'COMMS Current Draw',
      unit: 'A',
      color: '#3B82F6',
      maxThreshold: 7.2,
      subsystem: 'EPS / COMMS',
      currentVal: '8.45 A (+17%)'
    },
    signal_strength: {
      name: 'S-Band Carrier Signal Strength (RSSI)',
      unit: 'dBm',
      color: '#EF4444',
      minThreshold: -85,
      subsystem: 'COMMS',
      currentVal: '-97 dBm (LINK DROP)'
    },
    temperature: {
      name: 'Power Amplifier Junction Temperature',
      unit: '°C',
      color: '#06B6D4',
      maxThreshold: 45.0,
      subsystem: 'TCS',
      currentVal: '32.4 °C (NORMAL)'
    }
  };

  const config = paramConfigs[selectedParam];

  return (
    <div className="bg-space-900 border border-slate-800 rounded-xl p-6 space-y-6 select-none shadow-2xl">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <ChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-tech text-base font-bold text-slate-100 tracking-wider">
              TELEMETRY INTELLIGENCE CONSOLE
            </h3>
            <span className="font-mono text-xs text-cyan-400">HISTORICAL PARAMETER ANALYSIS</span>
          </div>
        </div>

        {/* Parameter Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-space-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setSelectedParam('battery_voltage')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
              selectedParam === 'battery_voltage'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Battery Voltage
          </button>
          <button
            onClick={() => setSelectedParam('comms_current')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
              selectedParam === 'comms_current'
                ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Comms Current
          </button>
          <button
            onClick={() => setSelectedParam('signal_strength')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
              selectedParam === 'signal_strength'
                ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Signal RSSI
          </button>
          <button
            onClick={() => setSelectedParam('temperature')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
              selectedParam === 'temperature'
                ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Temperature
          </button>
        </div>
      </div>

      {/* Metric Info Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">SELECTED PARAMETER</span>
          <span className="font-bold text-slate-100">{config.name}</span>
        </div>
        <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">CURRENT VALUE</span>
          <span className="font-bold text-amber-400">{config.currentVal}</span>
        </div>
        <div className="bg-space-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px]">ANOMALY WINDOW</span>
            <span className="font-bold text-red-400">14:30:00 — 14:33:00 UTC</span>
          </div>
          <Badge variant="critical">HIGHLIGHTED</Badge>
        </div>
      </div>

      {/* Recharts Telemetry Line Chart */}
      <div className="w-full h-80 bg-space-950/60 p-4 rounded-xl border border-slate-800/80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
            <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <YAxis stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B0F19',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#F8FAFC',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px'
              }}
            />

            {/* Highlighted Anomaly Window Shading */}
            <ReferenceArea
              x1="14:30:00"
              x2="14:33:00"
              fill="#EF4444"
              fillOpacity={0.12}
              stroke="#EF4444"
              strokeDasharray="3 3"
              label={{ value: 'ANOMALY WINDOW', fill: '#EF4444', fontSize: 10, position: 'top' }}
            />

            {/* Operational Threshold Lines */}
            {config.minThreshold && (
              <ReferenceLine
                y={config.minThreshold}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{ value: `MIN LIMIT (${config.minThreshold} ${config.unit})`, fill: '#EF4444', fontSize: 10 }}
              />
            )}
            {config.maxThreshold && (
              <ReferenceLine
                y={config.maxThreshold}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{ value: `MAX LIMIT (${config.maxThreshold} ${config.unit})`, fill: '#F59E0B', fontSize: 10 }}
              />
            )}

            <Line
              type="monotone"
              dataKey={selectedParam}
              stroke={config.color}
              strokeWidth={2.5}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.is_anomaly) {
                  return (
                    <circle key={cx} cx={cx} cy={cy} r={5} fill="#EF4444" stroke="#FFFFFF" strokeWidth={1.5} />
                  );
                }
                return <circle key={cx} cx={cx} cy={cy} r={3} fill={config.color} />;
              }}
              activeDot={{ r: 7, stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
