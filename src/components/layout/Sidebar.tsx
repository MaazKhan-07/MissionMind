import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Menu,
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
  Settings,
  Server,
  Sparkles,
  User,
  X
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
  onOpenProfile: () => void;
  onOpenSettings: () => void;
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
  onToggleLiveMode,
  onOpenProfile,
  onOpenSettings
}) => {
  const { user } = useAuth();

  const commandCenterNav: NavItem[] = [
    { id: 'overview', label: 'Mission Control', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'copilot', label: 'Copilot', path: '/copilot', icon: <Bot className="w-4 h-4 text-cyan-400" />, badge: 'AI' },
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
    { id: 'audit', label: 'Audit Trail', path: '/audit', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { id: 'health', label: 'System Health', path: '/health', icon: <Activity className="w-4 h-4" /> },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-3">
      {!collapsed && (
        <div className="px-3 mb-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold transition-opacity duration-200">
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
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'justify-start px-3'} py-2 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 font-semibold border-l-2 border-cyan-400 shadow-cyan-glow/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-space-800/80'
              }`}
            >
              <div className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-cyan-400' : ''}`}>
                {item.icon}
              </div>

              {/* Show label ONLY when NOT collapsed */}
              {!collapsed && (
                <span className="truncate flex-1 text-left ml-3 transition-opacity duration-200">
                  {item.label}
                </span>
              )}

              {/* Badge (only when expanded) */}
              {!collapsed && item.badge && (
                <span className={`px-1.5 py-0.2 text-[9px] font-mono rounded font-semibold ${
                  item.badgeVariant === 'critical'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Active Pip for Collapsed State */}
              {collapsed && isActive && (
                <div className="absolute right-0 w-1 h-5 bg-cyan-400 rounded-l" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-space-900/95 backdrop-blur-xl border-r border-slate-800/80 text-slate-200 select-none">
      {/* Top Header with 3-Line Menu Icon ☰ */}
      <div className="h-16 px-3 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Three-line Menu Button ☰ */}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-space-800 text-slate-400 hover:text-white transition-colors"
            title={collapsed ? "Expand sidebar (☰)" : "Collapse sidebar (☰)"}
          >
            <Menu className="w-5 h-5 text-cyan-400" />
          </button>

          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden transition-all duration-200">
              <img
                src="/logo.jpg"
                alt="MissionMind"
                className="w-7 h-7 rounded-lg object-cover border border-cyan-500/40 shadow-cyan-glow shrink-0"
              />
              <div className="flex flex-col truncate">
                <span className="font-tech text-sm font-bold tracking-wider text-slate-100 flex items-center gap-0.5">
                  MISSION<span className="text-cyan-400">MIND</span>
                </span>
                <span className="font-mono text-[9px] text-cyan-400 tracking-widest uppercase">
                  ORBITAL-01
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {renderNavGroup('Command Center', commandCenterNav)}
        {renderNavGroup('Investigation', investigationNav)}
        {renderNavGroup('Governance', governanceNav)}
      </div>

      {/* Bottom Pinned Section: Mode, Settings & User Profile (margin-top: auto) */}
      <div className="mt-auto p-2 border-t border-slate-800/80 bg-space-950/70 shrink-0 space-y-1.5">
        {/* Mode Toggle Button */}
        <button
          onClick={onToggleLiveMode}
          className={`w-full flex items-center ${collapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5'} rounded-lg border text-xs font-mono transition-all ${
            isLiveMode
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : 'bg-space-800/60 border-slate-700/60 text-slate-300'
          }`}
          title={isLiveMode ? "Backend Mode: Live FastAPI" : "Backend Mode: Mock Adapter"}
        >
          <div className="flex items-center gap-2">
            <Server className={`w-3.5 h-3.5 ${isLiveMode ? 'text-emerald-400' : 'text-cyan-400'}`} />
            {!collapsed && (
              <span className="text-[11px] font-semibold">
                {isLiveMode ? 'LIVE FASTAPI' : 'MOCK ADAPTER'}
              </span>
            )}
          </div>
          {!collapsed && (
            <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
              isLiveMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              {isLiveMode ? 'ACTIVE' : 'DEMO'}
            </span>
          )}
        </button>

        {/* Settings Item */}
        <button
          onClick={() => {
            onNavigate('/settings');
            onCloseMobile();
          }}
          className={`w-full flex items-center ${collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} rounded-lg text-xs font-medium transition-all ${
            currentPath === '/settings'
              ? 'bg-cyan-500/15 text-cyan-400 font-semibold border-l-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-100 hover:bg-space-800/80'
          }`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <span className="truncate flex-1 text-left">Settings</span>
          )}
        </button>

        {/* User Profile Item (Bottom) */}
        <button
          onClick={onOpenProfile}
          className={`w-full flex items-center ${collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'} rounded-lg hover:bg-space-800/80 text-left transition-all group`}
          title={collapsed ? `${user?.name || 'Operator'} (${user?.callsign || 'OP'})` : undefined}
        >
          <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-cyan-glow/20">
            {user?.callsign || 'MK'}
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                {user?.name || 'Mrigesh Koyande'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 truncate">
                {user?.role || 'Mission Operator'}
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Minimal Sidebar with smooth transition */}
      <aside
        className={`hidden md:block fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-out ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
