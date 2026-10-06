import React from 'react';

interface StatusIndicatorProps {
  status: 'NOMINAL' | 'SYNCED' | 'READY' | 'WARNING' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  sublabel,
  size = 'md'
}) => {
  const getColors = () => {
    switch (status) {
      case 'NOMINAL':
      case 'SYNCED':
      case 'READY':
        return { dot: 'bg-emerald-400', ring: 'bg-emerald-500/20', text: 'text-emerald-400' };
      case 'WARNING':
      case 'DEGRADED':
        return { dot: 'bg-amber-400', ring: 'bg-amber-500/20', text: 'text-amber-400' };
      case 'CRITICAL':
        return { dot: 'bg-red-500', ring: 'bg-red-500/30', text: 'text-red-400' };
      case 'OFFLINE':
      default:
        return { dot: 'bg-slate-500', ring: 'bg-slate-500/20', text: 'text-slate-400' };
    }
  };

  const { dot, ring, text } = getColors();

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';
  const ringSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="inline-flex items-center gap-2 font-mono">
      <div className={`relative flex items-center justify-center ${ringSize}`}>
        <span className={`absolute inline-flex ${ringSize} rounded-full animate-ping opacity-75 ${dot}`} />
        <span className={`relative inline-flex ${dotSize} rounded-full ${dot}`} />
      </div>
      {(label || sublabel) && (
        <div className="flex flex-col leading-tight">
          {label && <span className={`text-xs font-semibold ${text}`}>{label}</span>}
          {sublabel && <span className="text-[10px] text-slate-400">{sublabel}</span>}
        </div>
      )}
    </div>
  );
};
