import React from 'react';
import { MissionHealthData } from '../../types';
import { Sparkline } from '../common/Sparkline';
import { Badge } from '../common/Badge';
import { Zap, Radio, Thermometer, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MissionHealthProps {
  data: MissionHealthData;
  onCardClick?: (subsystem: string) => void;
}

export const MissionHealth: React.FC<MissionHealthProps> = ({
  data,
  onCardClick
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. MISSION HEALTH CARD */}
      <div
        onClick={() => onCardClick?.('OVERALL')}
        className="mission-card p-4 cursor-pointer hover:scale-[1.02] transition-transform"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              MISSION HEALTH
            </span>
          </div>
          <Badge variant="nominal">NOMINAL</Badge>
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <div className="flex items-baseline gap-1 font-telemetry">
            <span className="text-2xl font-bold text-slate-100">{data.health_percentage}</span>
            <span className="text-xs text-slate-400">%</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>+0.2% 24h</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-mono text-slate-400">
          <span>LIMIT: &gt;90%</span>
          <span>14:32:18 UTC</span>
        </div>
      </div>

      {/* 2. POWER CARD */}
      <div
        onClick={() => onCardClick?.('EPS')}
        className="mission-card p-4 cursor-pointer hover:scale-[1.02] transition-transform border-amber-500/40"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              POWER (EPS)
            </span>
          </div>
          <Badge variant="inference">WARNING</Badge>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1 font-telemetry">
              <span className="text-2xl font-bold text-amber-400">{data.power.voltage}</span>
              <span className="text-xs text-slate-400">{data.power.unit}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
              <ArrowDownRight className="w-3 h-3" />
              <span>-4.6V dip</span>
            </div>
          </div>
          <Sparkline data={data.power.sparkline} color="#F59E0B" />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-mono text-slate-400">
          <span>LIMIT: {data.power.limit}</span>
          <span>14:31:42 UTC</span>
        </div>
      </div>

      {/* 3. COMMUNICATION CARD */}
      <div
        onClick={() => onCardClick?.('COMMS')}
        className="mission-card p-4 cursor-pointer hover:scale-[1.02] transition-transform border-red-500/40"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
              <Radio className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              COMMUNICATION
            </span>
          </div>
          <Badge variant="critical">DEGRADED</Badge>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1 font-telemetry">
              <span className="text-2xl font-bold text-red-400">{data.comms.signal_strength}</span>
              <span className="text-xs text-slate-400">{data.comms.unit}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-red-400">
              <ArrowDownRight className="w-3 h-3" />
              <span>-12 dBm</span>
            </div>
          </div>
          <Sparkline data={data.comms.sparkline} color="#EF4444" />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-mono text-slate-400">
          <span>LIMIT: {data.comms.limit}</span>
          <span>14:32:18 UTC</span>
        </div>
      </div>

      {/* 4. THERMAL CARD */}
      <div
        onClick={() => onCardClick?.('TCS')}
        className="mission-card p-4 cursor-pointer hover:scale-[1.02] transition-transform"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Thermometer className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              THERMAL (TCS)
            </span>
          </div>
          <Badge variant="fact">NORMAL</Badge>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1 font-telemetry">
              <span className="text-2xl font-bold text-slate-100">{data.thermal.temp}</span>
              <span className="text-xs text-slate-400">{data.thermal.unit}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400">
              <ArrowUpRight className="w-3 h-3" />
              <span>+4.2°C PA</span>
            </div>
          </div>
          <Sparkline data={data.thermal.sparkline} color="#06B6D4" />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-mono text-slate-400">
          <span>LIMIT: {data.thermal.limit}</span>
          <span>14:29:17 UTC</span>
        </div>
      </div>
    </div>
  );
};
