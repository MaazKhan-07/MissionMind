import React from 'react';
import { TimelineEvent } from '../types';
import { IncidentTimeline } from '../components/timeline/IncidentTimeline';

interface TimelinePageProps {
  events: TimelineEvent[];
  onSelectNode: (sourceId: string) => void;
  selectedSourceId?: string | null;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  events,
  onSelectNode,
  selectedSourceId
}) => {
  return (
    <div className="space-y-6 pb-12">
      <IncidentTimeline
        events={events}
        onSelectNode={onSelectNode}
        selectedSourceId={selectedSourceId}
      />
    </div>
  );
};
