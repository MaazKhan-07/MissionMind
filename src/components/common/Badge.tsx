import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'fact' | 'inference' | 'recommendation' | 'critical' | 'system' | 'nominal' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'system',
  size = 'md',
  className = '',
  icon
}) => {
  const baseStyle = "inline-flex items-center gap-1.5 font-mono font-semibold rounded-md transition-all";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };

  const variantStyles = {
    fact: "bg-fact-bg text-fact border border-fact-border shadow-green-glow/20",
    inference: "bg-inference-bg text-inference border border-inference-border shadow-amber-glow/20",
    recommendation: "bg-recommendation-bg text-recommendation border border-recommendation-border",
    critical: "bg-critical-bg text-critical border border-critical-border animate-pulse-subtle",
    system: "bg-system-bg text-system border border-system-border",
    nominal: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    info: "bg-slate-800 text-slate-300 border border-slate-700"
  };

  return (
    <span className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
