import React from 'react';
import {
  LayoutDashboard, AlertOctagon, Bot, Activity, Clock, BookOpen,
  ShieldAlert, FileText, Lock
} from 'lucide-react';

export type NavTab = 
  | 'command-center'
  | 'anomaly-workflow'
  | 'copilot'
  | 'telemetry'
  | 'timeline'
  | 'procedures'
  | 'audit'
  | 'security'
  | 'brief';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAnomalyCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeAnomalyCount = 2
}) => {
  const navItems = [
    { id: 'command-center' as NavTab, label: 'Command Center', icon: LayoutDashboard, badge: null },
    { id: 'anomaly-workflow' as NavTab, label: 'Anomaly Workflow', icon: AlertOctagon, badge: activeAnomalyCount },
    { id: 'copilot' as NavTab, label: 'Mission Copilot', icon: Bot, badge: 'AI' },
    { id: 'telemetry' as NavTab, label: 'Telemetry Intelligence', icon: Activity, badge: null },
    { id: 'timeline' as NavTab, label: 'Incident Timeline', icon: Clock, badge: null },
    { id: 'procedures' as NavTab, label: 'Procedure Guidance', icon: BookOpen, badge: null },
    { id: 'audit' as NavTab, label: 'Audit & Hash Chain', icon: Lock, badge: 'HASH' },
    { id: 'security' as NavTab, label: 'Security Shield', icon: ShieldAlert, badge: 'DEMO' },
    { id: 'brief' as NavTab, label: 'Mission Brief', icon: FileText, badge: null },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between p-4 shrink-0 font-mono">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          NAVIGATION CONTROL
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  typeof item.badge === 'number'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-900 text-[10px] text-slate-500 text-center space-y-1">
        <div>MISSIONMIND v1.0.0</div>
        <div>EVIDENCE GROUNDED RAG</div>
      </div>
    </aside>
  );
};
