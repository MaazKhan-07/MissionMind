import React, { useState, useEffect } from 'react';
import { Search, X, FileSearch, Database, BookOpen, AlertTriangle } from 'lucide-react';
import { getEvidenceRecord } from '../services/api';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (recordId: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onSelectRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mockSearchResults = [
    { id: 'T-19281', title: 'EPS Battery Bus Voltage (23.8 V LOW)', type: 'Telemetry', sub: 'EPS' },
    { id: 'T-19282', title: 'Comms Transceiver RF Signal (-102.4 dBm DEGRADED)', type: 'Telemetry', sub: 'COMMS' },
    { id: 'INC-047', title: 'Power Bus Dip Transceiver Power Backoff', type: 'Incident', sub: 'EPS/COMMS' },
    { id: 'COMMS-04', title: 'Communications Degradation Procedure', type: 'Procedure', sub: 'COMMS' },
    { id: 'LOG-99999', title: 'Payload Receive Buffer Log', type: 'Log', sub: 'PAYLOAD' },
  ].filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sub.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md font-mono">
      <div className="w-full max-w-xl glass-panel-glow rounded-2xl p-4 shadow-2xl border-cyan-500/30 space-y-4">
        {/* Search Input */}
        <div className="flex items-center space-x-3 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            placeholder="Search records, telemetry, incidents, procedures... (e.g. T-19281)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
          {mockSearchResults.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching mission records found for &quot;{searchTerm}&quot;
            </div>
          ) : (
            mockSearchResults.map((res) => (
              <div
                key={res.id}
                onClick={() => {
                  onSelectRecord(res.id);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/30 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-cyan-400 font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {res.id}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{res.title}</h4>
                    <span className="text-[10px] text-slate-500">SUBSYSTEM: {res.sub}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {res.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
