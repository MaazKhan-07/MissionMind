import React, { useState } from 'react';
import { HistoricalIncident } from '../types';
import { IncidentCard } from '../components/incidents/IncidentCard';
import { History, Search, Layers } from 'lucide-react';

interface IncidentsPageProps {
  incidents: HistoricalIncident[];
  onViewIncident: (id: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  onViewIncident
}) => {
  const [search, setSearch] = useState('');

  const filtered = incidents.filter(
    (inc) =>
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.id.toLowerCase().includes(search.toLowerCase()) ||
      inc.subsystems.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#66FCF1]/10 text-[#66FCF1] border border-[#66FCF1]/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-tech text-2xl font-bold text-slate-100 uppercase tracking-wider">
              HISTORICAL INCIDENT LIBRARY
            </h1>
            <span className="font-mono text-xs text-[#45A29E]">
              SIMILARITY MATCH ENGINE ({incidents.length} HISTORICAL RECORDS)
            </span>
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incident ID or root cause..."
            className="w-full bg-space-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-system"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((inc) => (
          <IncidentCard
            key={inc.id}
            incident={inc}
            onView={onViewIncident}
          />
        ))}
      </div>
    </div>
  );
};
