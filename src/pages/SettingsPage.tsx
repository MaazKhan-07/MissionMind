import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import {
  Settings,
  Bell,
  Sliders,
  Cpu,
  Compass,
  Keyboard,
  Shield,
  Info,
  Check,
  Save,
  RotateCcw
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'notifications' | 'ai' | 'mission' | 'shortcuts' | 'security' | 'about'>('notifications');

  // Notification states
  const [notifyCritical, setNotifyCritical] = useState<boolean>(() => {
    return localStorage.getItem('missionmind_notify_critical') !== 'false';
  });
  const [audioAlerts, setAudioAlerts] = useState<boolean>(() => {
    return localStorage.getItem('missionmind_audio_alerts') === 'true';
  });
  const [notifyDropped, setNotifyDropped] = useState<boolean>(() => {
    return localStorage.getItem('missionmind_notify_dropped') !== 'false';
  });

  // AI Preferences state
  const [aiModel, setAiModel] = useState<string>(() => {
    return localStorage.getItem('missionmind_ai_model') || 'gemini-3.6-flash';
  });
  const [abstentionThreshold, setAbstentionThreshold] = useState<number>(() => {
    return Number(localStorage.getItem('missionmind_abstain_threshold')) || 3;
  });

  // Mission Preferences
  const [defaultGroundStation, setDefaultGroundStation] = useState<string>(() => {
    return localStorage.getItem('missionmind_ground_station') || 'Svalbard GS';
  });

  const handleSave = () => {
    localStorage.setItem('missionmind_notify_critical', String(notifyCritical));
    localStorage.setItem('missionmind_audio_alerts', String(audioAlerts));
    localStorage.setItem('missionmind_notify_dropped', String(notifyDropped));
    localStorage.setItem('missionmind_ai_model', aiModel);
    localStorage.setItem('missionmind_abstain_threshold', String(abstentionThreshold));
    localStorage.setItem('missionmind_ground_station', defaultGroundStation);

    showToast('Settings successfully updated and persisted.', 'success');
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Preferences', icon: <Cpu className="w-4 h-4" /> },
    { id: 'mission', label: 'Mission Preferences', icon: <Compass className="w-4 h-4" /> },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Audit', icon: <Shield className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-tech text-2xl font-bold text-slate-100 uppercase tracking-wider">
              OPERATIONAL SETTINGS
            </h1>
            <span className="font-mono text-xs text-cyan-400">
              MISSIONMIND WORKSTATION PREFERENCES
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-tech font-bold text-xs tracking-wider uppercase rounded-xl shadow-cyan-glow transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Navigation Tabs */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1 bg-space-900 border border-slate-800 rounded-xl p-3 h-fit">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition-all text-left ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30 shadow-cyan-glow/20'
                    : 'text-slate-400 hover:text-white hover:bg-space-800'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content */}
        <div className="md:col-span-8 lg:col-span-9 bg-space-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
          {/* TAB 1: NOTIFICATIONS */}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase">
                  Alert Subscriptions
                </h3>
                <p className="text-xs text-slate-400">Configure audible and visual anomaly notifications.</p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-space-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">Critical Anomaly Broadcasts</div>
                    <div className="text-[10px] text-slate-500">Alert on subsystem critical deviations</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyCritical}
                    onChange={(e) => setNotifyCritical(e.target.checked)}
                    className="w-4 h-4 text-cyan-500"
                  />
                </div>

                <div className="p-3 bg-space-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">Acoustic Telemetry Chime</div>
                    <div className="text-[10px] text-slate-500">Play subtle aerospace ping on new telemetry anomalies</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioAlerts}
                    onChange={(e) => setAudioAlerts(e.target.checked)}
                    className="w-4 h-4 text-cyan-500"
                  />
                </div>

                <div className="p-3 bg-space-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">Dropped Claim Interception Alerts</div>
                    <div className="text-[10px] text-slate-500">Notify when guardrail intercepts unevidenced LLM claims</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyDropped}
                    onChange={(e) => setNotifyDropped(e.target.checked)}
                    className="w-4 h-4 text-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI PREFERENCES */}
          {activeTab === 'ai' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase">
                  Cognitive Reasoning Engine
                </h3>
                <p className="text-xs text-slate-400">Configure LLM provider and guardrail thresholds.</p>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">MODEL RUNTIME</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-space-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash (High Throughput / Low Latency)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Aerospace Reference)</option>
                  <option value="local-deepseek-r1">Local DeepSeek-R1 (Air-Gapped Copilot)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-slate-300 font-bold block">
                  MAX DROPPED CLAIMS BEFORE FULL ABSTENTION: <span className="text-cyan-400">{abstentionThreshold}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={abstentionThreshold}
                  onChange={(e) => setAbstentionThreshold(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-[10px] text-slate-500 block">
                  Triggers full abstention if hallucinations exceed this count (ST-10 safety rule).
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: MISSION PREFERENCES */}
          {activeTab === 'mission' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase">
                  Mission & Ground Station Network
                </h3>
                <p className="text-xs text-slate-400">Configure telemetry tracking and coordinates.</p>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">PRIMARY GROUND STATION DOWNLINK</label>
                <select
                  value={defaultGroundStation}
                  onChange={(e) => setDefaultGroundStation(e.target.value)}
                  className="w-full bg-space-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Svalbard GS">Svalbard Ground Station (78.2° N) - Polar Orbit</option>
                  <option value="TrollSat GS">Troll Satellite Station (72.0° S) - Antarctic</option>
                  <option value="Kiruna GS">Kiruna Station (67.8° N) - European Space Agency</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: KEYBOARD SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase">
                  Command Station Keybindings
                </h3>
                <p className="text-xs text-slate-400">Quick shortcuts for rapid mission operations.</p>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-space-950">
                <div className="p-3 flex justify-between items-center">
                  <span className="text-slate-300">Open Command Palette / Search</span>
                  <kbd className="px-2 py-1 bg-space-900 border border-slate-700 rounded text-cyan-400">Ctrl + K / ⌘K</kbd>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="text-slate-300">Close Slide-over Modal / Drawer</span>
                  <kbd className="px-2 py-1 bg-space-900 border border-slate-700 rounded text-cyan-400">ESC</kbd>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="text-slate-300">Focus Copilot Query Bar</span>
                  <kbd className="px-2 py-1 bg-space-900 border border-slate-700 rounded text-cyan-400">/</kbd>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY & AUDIT */}
          {activeTab === 'security' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <h3 className="font-tech text-base font-bold text-slate-100 uppercase">
                  Cryptographic Governance
                </h3>
                <p className="text-xs text-slate-400">Verification parameters and chain hashes.</p>
              </div>

              <div className="p-4 bg-space-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">AUDIT HASH STANDARD:</span>
                  <span className="text-emerald-400 font-bold">SHA-256 BLOCKCHAIN ENFORCED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">PROMPT INJECTION SHIELD:</span>
                  <span className="text-cyan-400 font-bold">RAW DELIMITER NEUTRALIZATION</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">CURRENT CHAIN INTEGRITY:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">100% VERIFIED</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40" />
                <div>
                  <h3 className="font-tech text-lg font-bold text-slate-100">
                    MISSIONMIND
                  </h3>
                  <span className="text-cyan-400 text-[11px]">VERSION 1.0.0 // PRODUCTION BUILD</span>
                </div>
              </div>

              <div className="space-y-2 bg-space-950 p-4 rounded-xl border border-slate-800">
                <div><strong>Problem ID:</strong> ST-10 (Space Technology / Mission Operations)</div>
                <div><strong>Domain:</strong> Aerospace Flight Operations & Telemetry Copilot</div>
                <div><strong>Architecture:</strong> Evidence-Grounded Hybrid Retrieval (SQL + FTS5 + Vector)</div>
                <div><strong>Design System:</strong> Void Black Aerospace Workstation</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
