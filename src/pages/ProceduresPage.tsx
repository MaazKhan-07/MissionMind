import React, { useState } from 'react';
import { OperationalProcedure } from '../types';
import { ProcedureViewer } from '../components/procedures/ProcedureViewer';
import { BookOpen } from 'lucide-react';

interface ProceduresPageProps {
  procedures: OperationalProcedure[];
}

export const ProceduresPage: React.FC<ProceduresPageProps> = ({ procedures }) => {
  const [selectedId, setSelectedId] = useState<string>(procedures[0]?.id || 'COMMS-04');

  const selectedProc = procedures.find((p) => p.id === selectedId) || procedures[0];

  return (
    <div className="space-y-6 pb-12 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-tech text-2xl font-bold text-slate-100 uppercase tracking-wider">
              OPERATIONAL PROCEDURES MANUAL
            </h1>
            <span className="font-mono text-xs text-blue-400">
              APPROVED FLIGHT STANDARDS & SOP CHECKLISTS
            </span>
          </div>
        </div>

        {/* Procedure Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {procedures.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedId === p.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-cyan-glow/20'
                  : 'bg-space-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {p.id}: {p.subsystem}
            </button>
          ))}
        </div>
      </div>

      {selectedProc && <ProcedureViewer procedure={selectedProc} />}
    </div>
  );
};
