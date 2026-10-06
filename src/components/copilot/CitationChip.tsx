import React from 'react';
import { FileCode } from 'lucide-react';

interface CitationChipProps {
  citation: string;
  onClick: (citation: string) => void;
  active?: boolean;
}

export const CitationChip: React.FC<CitationChipProps> = ({
  citation,
  onClick,
  active = false
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(citation);
      }}
      className={`citation-chip ${active ? 'bg-system/30 border-system text-white shadow-cyan-glow' : ''}`}
      title={`Inspect evidence record ${citation}`}
    >
      <FileCode className="w-3 h-3 text-cyan-400 inline" />
      <span>[{citation}]</span>
    </button>
  );
};
