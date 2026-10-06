import React from 'react';
import {
  LayoutDashboard,
  Bot,
  AlertTriangle,
  FileSearch,
  GitCommit,
  LineChart,
  ShieldCheck,
  BookOpen,
  Activity,
  History,
  ChevronLeft,
  ChevronRight,
  Radio,
  Sparkles,
  Server,
  UserCheck
} from 'lucide-react';
import { StatusIndicator } from '../common/StatusIndicator';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'fact' | 'critical' | 'system';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  isLiveMode,
  onToggleLiveMode
}) => {

  const commandCenterNav: NavItem[] = [
    { id: 'overview', label: 'Overview', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'copilot', label: 'Copilot', path: '/copilot', icon: <Bot className="w-4 h-4 text-system" />, badge: 'AI' },
    { id: 'anomalies', label: 'Anomalies', path: '/anomalies', icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, badge: '1 CRIT', badgeVariant: 'critical' },
  ];

  const investigationNav: NavItem[] = [
    { id: 'evidence', label: 'Evidence Inspector', path: '/evidence', icon: <FileSearch className="w-4 h-4" /> },
    { id: 'timeline', label: 'Incident Timeline', path: '/timeline', icon: <GitCommit className="w-4 h-4" /> },
    { id: 'telemetry', label: 'Telemetry Intelligence', path: '/telemetry', icon: <LineChart className="w-4 h-4" /> },
    { id: 'incidents', label: 'Incident History', path: '/incidents', icon: <History className="w-4 h-4" /> },
    { id: 'procedures', label: 'Procedures Manual', path: '/procedures', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const governanceNav: NavItem[] = [
    { id: 'audit', label: 'Audit Trail', path: '/audit', icon: <ShieldCheck className="w-4 h-4 text-fact" /> },
    { id: 'health', label: 'System Health', path: '/health', icon: <Activity className="w-4 h-4" /> },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-4">
      {!collapsed && (
        <div className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
          {title}
        </div>
      )}
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.path);
                onCloseMobile();
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-system/15 text-system font-semibold border-l-2 border-system shadow-cyan-glow/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-space-800/80'
              }`}
            >
              <div className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-system' : ''}`}>
                {item.icon}
              </div>
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-semibold ${
                  item.badgeVariant === 'critical'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-system/20 text-system border border-system/30'
                }`}>
                  {item.badge}
                </span>
              )}
              {collapsed && isActive && (
                <div className="absolute right-0 w-1 h-6 bg-system rounded-l" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-space-900/95 backdrop-blur-md border-r border-slate-800/80 text-slate-200 select-none">
      {/* Top Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <img
            src="/logo.jpg"
            alt="MissionMind Logo"
            className="w-8 h-8 rounded-lg object-cover border border-cyan-500/40 shadow-cyan-glow shrink-0"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-tech text-base font-bold tracking-wider text-slate-100 flex items-center gap-1">
                MISSION<span className="text-system">MIND</span>
              </span>
              <span className="font-mono text-[9px] text-cyan-400 tracking-widest uppercase">
                MISSION ALPHA
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-md hover:bg-space-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {renderNavGroup('Command Center', commandCenterNav)}
        {renderNavGroup('Investigation', investigationNav)}
        {renderNavGroup('Governance', governanceNav)}
      </div>

      {/* Bottom Footer Details */}
      <div className="p-3 border-t border-slate-800/80 bg-space-950/60 shrink-0 space-y-3">
        {/* Mode Toggle */}
        <button
          onClick={onToggleLiveMode}
          className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
            isLiveMode
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : 'bg-space-800/60 border-slate-700/60 text-slate-300'
          }`}
          title="Toggle Backend Integration Mode"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Server className={`w-3.5 h-3.5 ${isLiveMode ? 'text-emerald-400' : 'text-cyan-400'}`} />
            {!collapsed && (
              <span className="text-[11px] font-mono font-semibold">
                {isLiveMode ? 'LIVE FASTAPI' : 'MOCK ADAPTER'}
              </span>
            )}
          </div>
          {!collapsed && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
              isLiveMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              {isLiveMode ? 'API ACTIVE' : 'DEMO'}
            </span>
          )}
        </button>

        {!collapsed && (
          <div className="space-y-1.5 px-1 font-mono text-[10px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>MISSION:</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                DEGRADED
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>TELEMETRY:</span>
              <StatusIndicator status="SYNCED" label="SYNCED" size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span>ENGINE:</span>
              <span className="text-system font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-system" />
                GEMINI 3.6
              </span>
            </div>
          </div>
        )}

        {/* Operator Profile */}
        <div className="flex items-center gap-2.5 pt-1 border-t border-slate-800/60">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-200 truncate">Capt. M. Koyande</span>
              <span className="text-[10px] font-mono text-slate-400 truncate">Flight Director</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
