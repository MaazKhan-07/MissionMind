import React from 'react';
import { CopilotChat } from '../components/copilot/CopilotChat';
import { CopilotAnswer, EvidenceRecord } from '../types';

interface CopilotPageProps {
  answer: CopilotAnswer | null;
  loading: boolean;
  onSendQuery: (query: string) => void;
  selectedEvidence: EvidenceRecord | null;
  onCitationClick: (citation: string) => void;
  onCloseEvidence: () => void;
  onProcedureClick: (procedureId: string) => void;
  onViewEvidenceTab: () => void;
}

export const CopilotPage: React.FC<CopilotPageProps> = (props) => {
  return (
    <div className="space-y-4">
      <CopilotChat {...props} />
    </div>
  );
};
