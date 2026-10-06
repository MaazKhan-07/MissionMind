import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface MissionObjectData {
  id: string;
  name: string;
  type: 'spacecraft' | 'satellite' | 'probe';
  status: 'NOMINAL' | 'WARNING' | 'ANOMALY' | 'CRITICAL' | 'OFFLINE' | 'DEGRADED';
  orbitRadiusX: number;
  orbitRadiusZ: number;
  orbitSpeed: number;
  inclination: number;
  phase: number;
  altitudeKm: number;
  velocityKmS: number;
  signalPercent: number;
  lastTelemetry: string;
}

interface MissionObjectProps {
  data: MissionObjectData;
  onSelect: (object: MissionObjectData) => void;
}

export const MissionObject: React.FC<MissionObjectProps> = ({ data, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Compute smooth high-performance 60 FPS orbital motion without React state
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * data.orbitSpeed + data.phase;
    if (groupRef.current) {
      const x = Math.cos(t) * data.orbitRadiusX;
      const z = Math.sin(t) * data.orbitRadiusZ;
      const y = Math.sin(t * 1.5) * (data.inclination * 1.8);

      groupRef.current.position.set(x, y, z);
      groupRef.current.rotation.y = t + Math.PI / 2;
    }

    if (pulseRef.current) {
      const pScale = 1 + (clock.getElapsedTime() % 1.5) * 1.2;
      pulseRef.current.scale.set(pScale, pScale, pScale);
      const opacity = Math.max(0, 1 - (clock.getElapsedTime() % 1.5) / 1.5);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.5;
    }
  });

  const getStatusColor = (status: MissionObjectData['status']) => {
    switch (status) {
      case 'CRITICAL': return '#EF4444';
      case 'ANOMALY': return '#8B5CF6';
      case 'WARNING': return '#F59E0B';
      case 'OFFLINE': return '#94A3B8';
      case 'NOMINAL':
      default: return '#06B6D4';
    }
  };

  const statusColor = getStatusColor(data.status);

  return (
    <group ref={groupRef}>
      {/* Clickable Satellite / Spacecraft Mesh */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          setHovered(false);
        }}
        scale={hovered ? 1.25 : 1.0}
      >
        <boxGeometry args={[0.35, 0.35, 0.45]} />
        <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Solar Wings */}
      <mesh position={[0.55, 0, 0]}>
        <boxGeometry args={[0.75, 0.02, 0.28]} />
        <meshStandardMaterial color="#0F172A" emissive="#0284C7" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.55, 0, 0]}>
        <boxGeometry args={[0.75, 0.02, 0.28]} />
        <meshStandardMaterial color="#0F172A" emissive="#0284C7" emissiveIntensity={0.6} />
      </mesh>

      {/* Telemetry Sensor Antenna Dish */}
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.02, 0.12, 16]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.9} />
      </mesh>

      {/* Pulse Wave Visualizer */}
      <mesh ref={pulseRef} position={[0, 0, 0.3]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshBasicMaterial color={statusColor} transparent opacity={0.3} wireframe />
      </mesh>

      {/* Hover Tooltip Overlay */}
      {hovered && (
        <Html distanceFactor={10} position={[0, 0.7, 0]}>
          <div className="bg-space-950/95 border border-cyan-500/60 p-3 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] text-[11px] font-mono whitespace-nowrap backdrop-blur-md pointer-events-none select-none">
            <div className="text-cyan-300 font-bold text-xs flex items-center gap-2 border-b border-cyan-500/30 pb-1 mb-1.5 uppercase">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
              {data.name}
            </div>
            <div className="text-slate-300 space-y-0.5 text-[10px]">
              <div>TYPE: <span className="text-slate-100 uppercase">{data.type}</span></div>
              <div>STATUS: <span className="font-semibold" style={{ color: statusColor }}>{data.status}</span></div>
              <div>ALTITUDE: <span className="text-slate-100">{data.altitudeKm} KM</span></div>
              <div>SIGNAL: <span className="text-cyan-400 font-semibold">{data.signalPercent}%</span></div>
            </div>
            <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] text-cyan-400 italic">
              Click asset for mission telemetry
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
