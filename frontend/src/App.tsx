import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { CommandCenter } from './components/CommandCenter';
import { AnomalyWorkflow } from './components/AnomalyWorkflow';
import { Copilot } from './components/Copilot';
import { TelemetryView } from './components/TelemetryView';
import { TimelineView } from './components/TimelineView';
import { ProcedureGuidance } from './components/ProcedureGuidance';
import { AuditView } from './components/AuditView';
import { SecurityShield } from './components/SecurityShield';
import { MissionBrief } from './components/MissionBrief';
import { EvidenceModal } from './components/EvidenceModal';
import { GlobalSearch } from './components/GlobalSearch';
import { getAnomalies } from './services/api';
import { AnomalyItem } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('command-center');
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);
  const [copilotQuery, setCopilotQuery] = useState<string>('Why did the comms subsystem fail at 14:32?');
  const [copilotAnomalyId, setCopilotAnomalyId] = useState<string | undefined>('ANOM-001');
  const [evidenceRecordId, setEvidenceRecordId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    getAnomalies().then((data) => {
      setAnomalies(data);
      if (data.length > 0) setSelectedAnomaly(data[0]);
    });
  }, []);

  // One-click investigation handler (P0 Feature 3)
  const handleInvestigateAnomaly = (anomaly: AnomalyItem) => {
    setSelectedAnomaly(anomaly);
    setCopilotQuery(anomaly.default_query);
    setCopilotAnomalyId(anomaly.id);
    setActiveTab('copilot');
  };

  const handleStartCopilotQuery = (query: string, anomalyId?: string) => {
    setCopilotQuery(query);
    setCopilotAnomalyId(anomalyId);
    setActiveTab('copilot');
  };

  const handleSelectCitation = (recordId: string) => {
    setEvidenceRecordId(recordId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col grid-background">
      {/* Header Bar */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        demoMode={demoMode}
        onToggleDemoMode={() => setDemoMode(!demoMode)}
        missionStatus="DEGRADED"
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeAnomalyCount={anomalies.length}
        />

        {/* Content View Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'command-center' && (
            <CommandCenter
              onInvestigateAnomaly={handleInvestigateAnomaly}
              onOpenTimeline={() => setActiveTab('timeline')}
              onOpenAudit={() => setActiveTab('audit')}
            />
          )}

          {activeTab === 'anomaly-workflow' && (
            <AnomalyWorkflow
              anomalies={anomalies}
              selectedAnomaly={selectedAnomaly}
              onSelectAnomaly={setSelectedAnomaly}
              onStartCopilotQuery={handleStartCopilotQuery}
              onOpenTimeline={() => setActiveTab('timeline')}
            />
          )}

          {activeTab === 'copilot' && (
            <Copilot
              initialQuery={copilotQuery}
              anomalyId={copilotAnomalyId}
              onSelectCitation={handleSelectCitation}
              onOpenProcedure={() => setActiveTab('procedures')}
            />
          )}

          {activeTab === 'telemetry' && <TelemetryView />}

          {activeTab === 'timeline' && (
            <TimelineView
              onSelectCitation={handleSelectCitation}
              anomalyId={copilotAnomalyId}
            />
          )}

          {activeTab === 'procedures' && <ProcedureGuidance />}

          {activeTab === 'audit' && <AuditView />}

          {activeTab === 'security' && <SecurityShield />}

          {activeTab === 'brief' && <MissionBrief />}
        </main>
      </div>

      {/* Global Modals */}
      <EvidenceModal
        recordId={evidenceRecordId}
        onClose={() => setEvidenceRecordId(null)}
      />

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRecord={handleSelectCitation}
      />
    </div>
  );
};
export default App;
