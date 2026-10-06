import React from 'react';
import { AuditEntry } from '../types';
import { HashChainViewer } from '../components/audit/HashChainViewer';

interface AuditPageProps {
  auditEntries: AuditEntry[];
  onReplayAnswer: (entry: AuditEntry) => void;
}

export const AuditPage: React.FC<AuditPageProps> = ({
  auditEntries,
  onReplayAnswer
}) => {
  return (
    <div className="space-y-6 pb-12">
      <HashChainViewer
        entries={auditEntries}
        onReplay={onReplayAnswer}
      />
    </div>
  );
};
