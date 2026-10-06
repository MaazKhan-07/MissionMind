import React, { useState, useEffect } from 'react';
import {
  Search,
  Bot,
  AlertTriangle,
  GitCommit,
  FileSearch,
  LineChart,
  History,
  BookOpen,
  ShieldCheck,
  Server,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string, query?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
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

  const commands = [
    {
      id: 'ask-copilot',
      label: 'Ask MissionMind Copilot',
      sublabel: 'Query AI about anomalies, telemetry, or procedures',
      icon: <Bot className="w-4 h-4 text-system" />,
      action: () => onNavigate('/copilot', query || 'Why did the comms subsystem fail at 14:32?')
    },
    {
      id: 'anomalies',
      label: 'Open Active Anomalies',
      sublabel: 'View 1 Critical Communication Subsystem Anomaly',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      action: () => onNavigate('/anomalies')
    },
    {
      id: 'timeline',
      label: 'View Incident Timeline',
      sublabel: 'Deterministic event sequence around 14:32 UTC',
      icon: <GitCommit className="w-4 h-4 text-cyan-400" />,
      action: () => onNavigate('/timeline')
    },
    {
      id: 'evidence',
      label: 'Search Evidence Records',
      sublabel: 'Inspect telemetry CSVs, flight logs, and raw records',
      icon: <FileSearch className="w-4 h-4 text-blue-400" />,
      action: () => onNavigate('/evidence')
    },
    {
      id: 'telemetry',
      label: 'View Telemetry Charts',
      sublabel: 'Battery voltage, current draw, thermal, signal strength',
      icon: <LineChart className="w-4 h-4 text-fact" />,
      action: () => onNavigate('/telemetry')
    },
    {
      id: 'incidents',
      label: 'Open Incident History',
      sublabel: 'Analyze similar historical incident INC-047 (92% match)',
      icon: <History className="w-4 h-4 text-[#45A29E]" />,
      action: () => onNavigate('/incidents')
    },
    {
      id: 'procedures',
      label: 'Open Procedures Manual',
      sublabel: 'COMMS-04 Communications & EPS Safety Procedure',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      action: () => onNavigate('/procedures')
    },
    {
      id: 'audit',
      label: 'Open Governance & Audit Trail',
      sublabel: 'Inspect hash chain validation and dropped claims',
      icon: <ShieldCheck className="w-4 h-4 text-system" />,
      action: () => onNavigate('/audit')
    }
  ];

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.sublabel.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-space-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-10">
        {/* Search Header Input */}
        <div className="p-4 bg-space-950 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-system shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, query, or jump to section..."
            className="w-full bg-transparent text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtered.length > 0) {
                filtered[0].action();
                onClose();
              }
            }}
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-space-800/90 text-left transition-colors group"
              >
                <div className="p-2 rounded-lg bg-space-950 border border-slate-800 group-hover:border-system/40">
                  {item.icon}
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-system transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate font-mono">
                    {item.sublabel}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-space-950 px-2 py-1 rounded border border-slate-800">
                  Select
                </span>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              No matching commands found. Press Enter to ask Copilot: "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-space-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>MISSIONMIND COMMAND v1.0</span>
        </div>
      </div>
    </div>
  );
};
