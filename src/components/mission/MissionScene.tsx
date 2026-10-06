import React from 'react';
import { MissionOrbit3D } from '../3d/MissionOrbit3D';

interface MissionSceneProps {
  onSelectSatellite: () => void;
  status?: 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
}

export const MissionScene: React.FC<MissionSceneProps> = ({
  onSelectSatellite,
  status = 'DEGRADED'
}) => {
  return (
    <MissionOrbit3D
      onSelectSatellite={onSelectSatellite}
      status={status}
    />
  );
};
