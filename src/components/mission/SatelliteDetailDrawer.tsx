import React from 'react';
import { Radio, X, Cpu, BatteryCharging, Wifi, AlertOctagon } from 'lucide-react';
import { Badge } from '../common/Badge';

interface SatelliteDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateCopilot: () => void;
}

export const SatelliteDetailDrawer: React.FC<SatelliteDetailDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateCopilot
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-md bg-space-900 border-l border-slate-800 h-full overflow-y-auto p-6 z-10 shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-tech text-lg font-bold text-slate-100 tracking-wider">
                  SAT-01 METADATA
                </h3>
                <span className="font-mono text-xs text-cyan-400">MISSION ALPHA // LEO ORBIT</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Status Pill */}
          <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-amber-400 font-bold uppercase">STATE: DEGRADED</div>
              <p className="text-[11px] text-slate-300 mt-0.5">Communication link attenuation under high power draw.</p>
            </div>
            <Badge variant="inference">DEGRADED</Badge>
          </div>

          {/* Telemetry Breakdown */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              Subsystem Live Telemetry
            </h4>

            <div className="p-3 bg-space-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-amber-400" /> EPS Battery Voltage
                </span>
                <span className="text-amber-400 font-bold">23.8 V</span>
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Threshold: 24.5 - 29.0V</span>
                <span>STATUS: LOW</span>
              </div>
            </div>

            <div className="p-3 bg-space-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-red-400" /> S-Band RF Signal
                </span>
                <span className="text-red-400 font-bold">-97 dBm</span>
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Threshold: &gt;-85 dBm</span>
                <span>STATUS: LINK DROP</span>
              </div>
            </div>

            <div className="p-3 bg-space-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" /> Flight Computer OBT
                </span>
                <span className="text-emerald-400 font-bold">NOMINAL</span>
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>CPU Load: 38%</span>
                <span>STATUS: OK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              onClose();
              onNavigateCopilot();
            }}
            className="w-full py-2.5 bg-system hover:bg-system-bright text-black font-bold font-mono text-xs rounded-lg shadow-cyan-glow flex items-center justify-center gap-2 transition-all"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>INVESTIGATE ANOMALY IN COPILOT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
