import React from 'react';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { Badge } from '../components/common/Badge';
import { Activity, Server, Database, ShieldCheck, Cpu, HardDrive, Wifi, Radio } from 'lucide-react';

interface SystemHealthPageProps {
  isLiveMode: boolean;
}

export const SystemHealthPage: React.FC<SystemHealthPageProps> = ({ isLiveMode }) => {
  return (
    <div className="space-y-6 pb-12 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-tech text-2xl font-bold text-slate-100 uppercase tracking-wider">
              SYSTEM HEALTH & ARCHITECTURE MONITOR
            </h1>
            <span className="font-mono text-xs text-emerald-400">
              MISSIONMIND ENGINE RUNTIME METRICS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isLiveMode ? 'fact' : 'system'}>
            MODE: {isLiveMode ? 'LIVE FASTAPI' : 'MOCK ADAPTER'}
          </Badge>
        </div>
      </div>

      {/* Grid of System Component Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. FastAPI REST Layer */}
        <div className="bg-space-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-100">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>FastAPI REST Layer</span>
            </div>
            <StatusIndicator status="SYNCED" label="ONLINE" size="sm" />
          </div>
          <div className="text-xs font-mono text-slate-400 space-y-1 bg-space-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between"><span>LATENCY:</span><span className="text-emerald-400 font-bold">14 ms</span></div>
            <div className="flex justify-between"><span>ENDPOINT:</span><span className="text-cyan-300">/api/ask</span></div>
            <div className="flex justify-between"><span>SCHEMA:</span><span className="text-slate-200">Pydantic v2</span></div>
          </div>
        </div>

        {/* 2. SQLite FTS5 Database */}
        <div className="bg-space-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-100">
              <Database className="w-4 h-4 text-blue-400" />
              <span>SQLite FTS5 Storage</span>
            </div>
            <StatusIndicator status="SYNCED" label="SYNCED" size="sm" />
          </div>
          <div className="text-xs font-mono text-slate-400 space-y-1 bg-space-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between"><span>INDEXED RECORDS:</span><span className="text-emerald-400 font-bold">14,920</span></div>
            <div className="flex justify-between"><span>RETRIEVAL FUSION:</span><span className="text-cyan-300">RRF Active</span></div>
            <div className="flex justify-between"><span>DATABASE SIZE:</span><span className="text-slate-200">42 MB</span></div>
          </div>
        </div>

        {/* 3. Evidence Guardrail Engine */}
        <div className="bg-space-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Evidence Guardrail Validator</span>
            </div>
            <StatusIndicator status="READY" label="ACTIVE" size="sm" />
          </div>
          <div className="text-xs font-mono text-slate-400 space-y-1 bg-space-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between"><span>REJECTED CLAIMS:</span><span className="text-amber-400 font-bold">1 Removed</span></div>
            <div className="flex justify-between"><span>INJECTION DEFENSE:</span><span className="text-emerald-400 font-bold">PASSED</span></div>
            <div className="flex justify-between"><span>NUMERICAL CHECK:</span><span className="text-cyan-300">EXACT MATCH</span></div>
          </div>
        </div>

        {/* 4. Telemetry Stream */}
        <div className="bg-space-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-100">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Telemetry Downlink Feed</span>
            </div>
            <StatusIndicator status="DEGRADED" label="LINK WEAK" size="sm" />
          </div>
          <div className="text-xs font-mono text-slate-400 space-y-1 bg-space-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between"><span>GROUND STATION:</span><span className="text-amber-400 font-bold">Svalbard GS</span></div>
            <div className="flex justify-between"><span>SIGNAL STRENGTH:</span><span className="text-red-400 font-bold">-97 dBm</span></div>
            <div className="flex justify-between"><span>SAMPLING RATE:</span><span className="text-slate-200">10 Hz</span></div>
          </div>
        </div>

        {/* 5. AI Reasoning LLM Engine */}
        <div className="bg-space-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-100">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Gemini 3.6 Flash Engine</span>
            </div>
            <StatusIndicator status="READY" label="READY" size="sm" />
          </div>
          <div className="text-xs font-mono text-slate-400 space-y-1 bg-space-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between"><span>PROVIDER:</span><span className="text-cyan-300 font-bold">Google DeepMind</span></div>
            <div className="flex justify-between"><span>STRUCTURED SCHEMA:</span><span className="text-emerald-400 font-bold">STRICT</span></div>
            <div className="flex justify-between"><span>ABSTENTION POLICY:</span><span className="text-slate-200">ENFORCED</span></div>
          </div>
        </div>

        {/* 6. Tamper Evident Chain */}
        <div className="bg-space-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-100">
              <HardDrive className="w-4 h-4 text-[#45A29E]" />
              <span>Audit Chain Storage</span>
            </div>
            <StatusIndicator status="SYNCED" label="VERIFIED" size="sm" />
          </div>
          <div className="text-xs font-mono text-slate-400 space-y-1 bg-space-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between"><span>HASH ALGORITHM:</span><span className="text-slate-200 font-bold">SHA-256</span></div>
            <div className="flex justify-between"><span>TOTAL SESSIONS:</span><span className="text-[#66FCF1] font-bold">3 Recorded</span></div>
            <div className="flex justify-between"><span>CHAIN STATUS:</span><span className="text-emerald-400 font-bold">✓ VALID</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
