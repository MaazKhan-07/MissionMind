import React, { useState } from 'react';
import { EvidenceRecord } from '../types';
import { EvidencePanel } from '../components/evidence/EvidencePanel';
import { Badge } from '../components/common/Badge';
import { FileSearch, Search, Filter, Database, Check } from 'lucide-react';

interface EvidencePageProps {
  records: Record<string, EvidenceRecord>;
}

export const EvidencePage: React.FC<EvidencePageProps> = ({ records }) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>('T-19281');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const recordList = Object.values(records);

  const filtered = recordList.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subsystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.raw_content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.type.toUpperCase() === typeFilter.toUpperCase();
    return matchesSearch && matchesType;
  });

  const activeRecord = records[selectedRecordId] || recordList[0];

  return (
    <div className="space-y-6 pb-12 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <FileSearch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-tech text-2xl font-bold text-slate-100 uppercase tracking-wider">
              EVIDENCE EXPLORER
            </h1>
            <span className="font-mono text-xs text-cyan-400">
              TRACED TELEMETRY & FLIGHT REPOS ({recordList.length} RECORDS AVAILABLE)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Table / List Column */}
        <div className="lg:col-span-7 bg-space-900 border border-slate-800 rounded-xl p-4 space-y-4">
          {/* Search Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search record ID, parameter, or raw log..."
                className="w-full bg-space-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-system"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-space-950 border border-slate-800 text-xs font-mono text-slate-300 rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="ALL">ALL TYPES</option>
              <option value="TELEMETRY">TELEMETRY</option>
              <option value="LOG">LOG</option>
              <option value="INCIDENT">INCIDENT</option>
              <option value="PROCEDURE">PROCEDURE</option>
            </select>
          </div>

          {/* Records List Table */}
          <div className="divide-y divide-slate-800/80 border border-slate-800/80 rounded-lg overflow-hidden max-h-[550px] overflow-y-auto">
            {filtered.map((rec) => {
              const isSelected = selectedRecordId === rec.id;
              return (
                <button
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`w-full p-3 text-left flex items-center justify-between gap-3 transition-colors ${
                    isSelected ? 'bg-cyan-950/40 text-cyan-300 font-bold border-l-2 border-cyan-400' : 'bg-space-950/60 hover:bg-space-850 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-slate-100">[{rec.id}]</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{rec.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate font-mono">
                      {rec.parameter || rec.type} = <strong className="text-amber-300">{rec.value || 'N/A'}</strong>
                    </div>
                  </div>
                  <Badge variant={rec.type === 'Telemetry' ? 'fact' : rec.type === 'Incident' ? 'inference' : 'system'}>
                    {rec.subsystem}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Panel Column */}
        <div className="lg:col-span-5 bg-space-900 border border-slate-800 rounded-xl overflow-hidden">
          <EvidencePanel
            record={activeRecord}
            onClose={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
