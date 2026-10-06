import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { FloatingNavbar } from './components/navigation/FloatingNavbar';
import { CommandPalette } from './components/layout/CommandPalette';
import { SatelliteDetailDrawer } from './components/mission/SatelliteDetailDrawer';
import { IntroExperience } from './components/intro/IntroExperience';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/profile/ProfileModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { CopilotPage } from './pages/CopilotPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { EvidencePage } from './pages/EvidencePage';
import { TimelinePage } from './pages/TimelinePage';
import { TelemetryPage } from './pages/TelemetryPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { ProceduresPage } from './pages/ProceduresPage';
import { AuditPage } from './pages/AuditPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { SettingsPage } from './pages/SettingsPage';

// Contexts & Hooks
import { useAuth } from './contexts/AuthContext';
import { useToast } from './contexts/ToastContext';

// Types & Services & Mocks
import {
  CopilotAnswer,
  EvidenceRecord,
  AnomalyItem,
  AuditEntry
} from './types';
import { api, getLiveMode, setLiveMode } from './services/api';
import {
  MOCK_EVIDENCE_RECORDS,
  MOCK_MISSION_HEALTH,
  MOCK_ANOMALIES,
  MOCK_TIMELINE,
  MOCK_TELEMETRY_SERIES,
  MOCK_INCIDENTS,
  MOCK_PROCEDURES,
  MOCK_AUDIT_ENTRIES
} from './data/mockData';

export const App: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  // Intro Sequence State (plays on start / browser refresh; internal route change does NOT re-trigger)
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Navigation State
  const [currentPath, setCurrentPath] = useState<string>('/landing');

  // Sidebar Collapsed State (persisted in localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('missionmind_sidebar_collapsed') === 'true';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [satelliteDrawerOpen, setSatelliteDrawerOpen] = useState<boolean>(false);
  const [isLiveMode, setIsLiveModeState] = useState<boolean>(getLiveMode());

  // Data States
  const [copilotAnswer, setCopilotAnswer] = useState<CopilotAnswer | null>(null);
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);
  const [selectedTimelineSourceId, setSelectedTimelineSourceId] = useState<string | null>(null);

  // Load initial default Copilot answer on start
  useEffect(() => {
    const loadInitial = async () => {
      setCopilotLoading(true);
      try {
        const initialAnswer = await api.askCopilot("Why did the comms subsystem fail at 14:32?");
        setCopilotAnswer(initialAnswer);
      } catch (err) {
        console.error("Failed to load initial Copilot response", err);
      } finally {
        setCopilotLoading(false);
      }
    };
    loadInitial();
  }, []);

  // Global Keyboard Shortcuts (Ctrl/Cmd + K, ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setSatelliteDrawerOpen(false);
        setProfileModalOpen(false);
        setSelectedEvidence(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('missionmind_sidebar_collapsed', next ? 'true' : 'false');
  };

  const handleToggleLiveMode = () => {
    const next = !isLiveMode;
    setIsLiveModeState(next);
    setLiveMode(next);
    showToast(`Switched to ${next ? 'Live FastAPI Backend' : 'Local Mock Adapter Engine'}`, 'info');
  };

  const handleSendCopilotQuery = async (query: string) => {
    setCurrentPath('/copilot');
    setCopilotLoading(true);
    try {
      const res = await api.askCopilot(query);
      setCopilotAnswer(res);
    } catch (err) {
      console.error("Error executing query", err);
      showToast('Error querying Copilot engine.', 'error');
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleCitationClick = async (citationId: string) => {
    const record = await api.getEvidence(citationId);
    if (record) {
      setSelectedEvidence(record);
      setSelectedTimelineSourceId(citationId);
    }
  };

  const handleInvestigateAnomaly = (anomaly: AnomalyItem) => {
    handleSendCopilotQuery(anomaly.suggested_query);
  };

  const handleNavigate = (path: string, query?: string) => {
    setCurrentPath(path);
    if (query) {
      handleSendCopilotQuery(query);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/landing':
        return (
          <LandingPage
            onEnterMissionControl={() => setCurrentPath('/')}
            onExploreCopilot={() => setCurrentPath('/copilot')}
            onReplayIntro={() => setShowIntro(true)}
          />
        );
      case '/':
        return (
          <OverviewPage
            healthData={MOCK_MISSION_HEALTH}
            anomalies={MOCK_ANOMALIES}
            onOpenCopilot={(q) => handleNavigate('/copilot', q)}
            onOpenAnomalies={() => setCurrentPath('/anomalies')}
            onSelectSatellite={() => setSatelliteDrawerOpen(true)}
            onInvestigateAnomaly={handleInvestigateAnomaly}
          />
        );
      case '/copilot':
        return (
          <CopilotPage
            answer={copilotAnswer}
            loading={copilotLoading}
            onSendQuery={handleSendCopilotQuery}
            selectedEvidence={selectedEvidence}
            onCitationClick={handleCitationClick}
            onCloseEvidence={() => setSelectedEvidence(null)}
            onProcedureClick={() => setCurrentPath('/procedures')}
            onViewEvidenceTab={() => setCurrentPath('/evidence')}
          />
        );
      case '/anomalies':
        return (
          <AnomaliesPage
            anomalies={MOCK_ANOMALIES}
            onInvestigate={handleInvestigateAnomaly}
          />
        );
      case '/evidence':
        return (
          <EvidencePage
            records={MOCK_EVIDENCE_RECORDS}
          />
        );
      case '/timeline':
        return (
          <TimelinePage
            events={MOCK_TIMELINE}
            onSelectNode={(sourceId) => handleCitationClick(sourceId)}
            selectedSourceId={selectedTimelineSourceId}
          />
        );
      case '/telemetry':
        return (
          <TelemetryPage
            data={MOCK_TELEMETRY_SERIES}
          />
        );
      case '/incidents':
        return (
          <IncidentsPage
            incidents={MOCK_INCIDENTS}
            onViewIncident={(id) => handleCitationClick(id)}
          />
        );
      case '/procedures':
        return (
          <ProceduresPage
            procedures={MOCK_PROCEDURES}
          />
        );
      case '/audit':
        return (
          <AuditPage
            auditEntries={MOCK_AUDIT_ENTRIES}
            onReplayAnswer={(entry: AuditEntry) => handleSendCopilotQuery(entry.query)}
          />
        );
      case '/health':
        return (
          <SystemHealthPage
            isLiveMode={isLiveMode}
          />
        );
      case '/settings':
        return (
          <SettingsPage />
        );
      default:
        return (
          <OverviewPage
            healthData={MOCK_MISSION_HEALTH}
            anomalies={MOCK_ANOMALIES}
            onOpenCopilot={(q) => handleNavigate('/copilot', q)}
            onOpenAnomalies={() => setCurrentPath('/anomalies')}
            onSelectSatellite={() => setSatelliteDrawerOpen(true)}
            onInvestigateAnomaly={handleInvestigateAnomaly}
          />
        );
    }
  };

  const isLandingView = currentPath === '/landing';

  return (
    <div className="min-h-screen bg-void text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Cinematic Intro Video Experience */}
      {showIntro && (
        <IntroExperience
          onComplete={() => {
            setShowIntro(false);
            setCurrentPath('/landing');
          }}
        />
      )}

      {/* 2. Floating Navbar (shown on Landing Page or when floating header is active) */}
      {isLandingView && (
        <FloatingNavbar
          currentPath={currentPath}
          onNavigate={(path) => setCurrentPath(path)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
      )}

      {/* 3. Workstation Layout Shell (when in Mission Control / Apps) */}
      {!isLandingView ? (
        <div className="flex min-h-screen">
          {/* Minimal Collapsible Sidebar */}
          <Sidebar
            currentPath={currentPath}
            onNavigate={(path) => setCurrentPath(path)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            isLiveMode={isLiveMode}
            onToggleLiveMode={handleToggleLiveMode}
            onOpenProfile={() => setProfileModalOpen(true)}
            onOpenSettings={() => setCurrentPath('/settings')}
          />

          {/* Right Main Content Area */}
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ease-out ${
              sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
            }`}
          >
            {/* Top Command Bar */}
            <TopBar
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
              onToggleMobileMenu={() => setMobileMenuOpen(true)}
              onOpenProfile={() => setProfileModalOpen(true)}
              isLiveMode={isLiveMode}
            />

            {/* Dynamic View Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto">
              {renderCurrentPage()}
            </main>
          </div>
        </div>
      ) : (
        /* Fullscreen Landing View */
        <main className="flex-1">
          {renderCurrentPage()}
        </main>
      )}

      {/* 4. Global Modals & Drawers */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      <SatelliteDetailDrawer
        isOpen={satelliteDrawerOpen}
        onClose={() => setSatelliteDrawerOpen(false)}
        onNavigateCopilot={() => handleNavigate('/copilot', 'Why did the comms subsystem fail at 14:32?')}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenSettings={() => {
          setProfileModalOpen(false);
          setCurrentPath('/settings');
        }}
      />

      <AuthModal />
    </div>
  );
};
