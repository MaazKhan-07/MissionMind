import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { CommandPalette } from './components/layout/CommandPalette';
import { SatelliteDetailDrawer } from './components/mission/SatelliteDetailDrawer';

// Pages
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

// Types & Services & Mocks
import {
  CopilotAnswer,
  EvidenceRecord,
  MissionHealthData,
  AnomalyItem,
  TimelineEvent,
  TelemetryPoint,
  HistoricalIncident,
  OperationalProcedure,
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
  // Navigation State
  const [currentPath, setCurrentPath] = useState<string>('/');

  // Sidebar Collapsed State (persisted in localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('missionmind_sidebar_collapsed') === 'true';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
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

  const handleToggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('missionmind_sidebar_collapsed', next ? 'true' : 'false');
  };

  const handleToggleLiveMode = () => {
    const next = !isLiveMode;
    setIsLiveModeState(next);
    setLiveMode(next);
  };

  const handleSendCopilotQuery = async (query: string) => {
    setCurrentPath('/copilot');
    setCopilotLoading(true);
    try {
      const res = await api.askCopilot(query);
      setCopilotAnswer(res);
    } catch (err) {
      console.error("Error executing query", err);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleCitationClick = async (citationId: string) => {
    const record = await api.getEvidence(citationId);
    if (record) {
      setSelectedEvidence(record);
      // If on timeline, highlight node
      setSelectedTimelineSourceId(citationId);
    }
  };

  const handleInvestigateAnomaly = (anomaly: AnomalyItem) => {
    handleSendCopilotQuery(anomaly.suggested_query);
  };

  const handleProcedureClick = (procedureId: string) => {
    setCurrentPath('/procedures');
  };

  const handleReplayAuditAnswer = (entry: AuditEntry) => {
    handleSendCopilotQuery(entry.query);
  };

  const handleNavigate = (path: string, query?: string) => {
    setCurrentPath(path);
    if (query) {
      handleSendCopilotQuery(query);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPath) {
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
            onProcedureClick={handleProcedureClick}
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
            onReplayAnswer={handleReplayAuditAnswer}
          />
        );
      case '/health':
        return (
          <SystemHealthPage
            isLiveMode={isLiveMode}
          />
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

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans">
      {/* Global Sidebar Shell */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isLiveMode={isLiveMode}
        onToggleLiveMode={handleToggleLiveMode}
      />

      {/* Main Right Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
      }`}>
        {/* Top Command Bar */}
        <TopBar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          isLiveMode={isLiveMode}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Global Command Palette Modal (Ctrl/Cmd + K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Satellite Orbital Detail Drawer */}
      <SatelliteDetailDrawer
        isOpen={satelliteDrawerOpen}
        onClose={() => setSatelliteDrawerOpen(false)}
        onNavigateCopilot={() => handleNavigate('/copilot', 'Why did the comms subsystem fail at 14:32?')}
      />
    </div>
  );
};
