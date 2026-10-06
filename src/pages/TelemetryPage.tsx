import React from 'react';
import { TelemetryPoint } from '../types';
import { TelemetryChart } from '../components/telemetry/TelemetryChart';

interface TelemetryPageProps {
  data: TelemetryPoint[];
}

export const TelemetryPage: React.FC<TelemetryPageProps> = ({ data }) => {
  return (
    <div className="space-y-6 pb-12">
      <TelemetryChart data={data} />
    </div>
  );
};
