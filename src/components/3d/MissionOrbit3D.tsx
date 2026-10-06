import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { PlanetModel } from './PlanetModel';
import { OrbitPath } from './OrbitPath';
import { MissionObject, MissionObjectData } from './MissionObject';
import { Compass, Eye, X, Activity, Radio, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAudio } from '../../contexts/AudioContext';

const DEFAULT_MISSION_OBJECTS: MissionObjectData[] = [
  {
    id: 'mission-alpha',
    name: 'SAT-01 // MISSION ALPHA',
    type: 'spacecraft',
    status: 'DEGRADED',
    orbitRadiusX: 4.2,
    orbitRadiusZ: 4.2,
    orbitSpeed: 0.18,
    inclination: 0.35,
    phase: 0,
    altitudeKm: 542.4,
    velocityKmS: 7.66,
    signalPercent: 68.4,
    lastTelemetry: '14:32:18 UTC'
  },
  {
    id: 'cubesat-beta',
    name: 'CUBESAT-02 // POLAROBS',
    type: 'satellite',
    status: 'NOMINAL',
    orbitRadiusX: 5.5,
    orbitRadiusZ: 4.8,
    orbitSpeed: 0.12,
    inclination: -0.5,
    phase: Math.PI / 2,
    altitudeKm: 680.1,
    velocityKmS: 7.52,
    signalPercent: 98.9,
    lastTelemetry: '14:35:01 UTC'
  },
  {
    id: 'probe-gamma',
    name: 'PROBE-03 // DEEP SPACE',
    type: 'probe',
    status: 'NOMINAL',
    orbitRadiusX: 6.8,
    orbitRadiusZ: 6.2,
    orbitSpeed: 0.08,
    inclination: 0.2,
    phase: Math.PI,
    altitudeKm: 1200.0,
    velocityKmS: 6.89,
    signalPercent: 94.2,
    lastTelemetry: '14:34:40 UTC'
  }
];

// Realistic 2D/3D Earth Fallback Canvas
const RealisticEarthGraphic: React.FC<{ size?: number }> = ({ size = 130 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;

    const render = () => {
      rotation += 0.004;
      const w = canvas.width;
      const h = canvas.height;
      const r = w / 2 - 6;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      const ocean = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      ocean.addColorStop(0, '#1E3A8A');
      ocean.addColorStop(0.4, '#172554');
      ocean.addColorStop(0.8, '#0F172A');
      ocean.addColorStop(1, '#020617');
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const yPos = cy + (lat / 90) * r;
        const widthAtLat = Math.sqrt(Math.max(0, r * r - (yPos - cy) * (yPos - cy)));
        ctx.beginPath();
        ctx.ellipse(cx, yPos, widthAtLat, widthAtLat * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#166534';
      const continents = [
        { baseLon: 0, points: [[-40, 20], [-20, 50], [20, 40], [30, 20], [10, 10], [-30, 10]] },
        { baseLon: 25, points: [[0, -10], [25, -20], [15, -50], [-10, -40], [-15, -20]] },
        { baseLon: 120, points: [[-30, 40], [40, 50], [60, 20], [40, -30], [10, -30], [-20, 10]] },
        { baseLon: 220, points: [[-20, 30], [30, 40], [40, -10], [20, -40], [-10, -30]] }
      ];

      continents.forEach((cont) => {
        ctx.beginPath();
        cont.points.forEach(([dLon, lat], idx) => {
          let lon = (cont.baseLon + dLon + rotation * 60) % 360;
          if (lon < 0) lon += 360;
          const radLon = ((lon - 180) * Math.PI) / 180;
          const xPos = cx + Math.sin(radLon) * r;
          const yPos = cy - (lat / 90) * r;
          if (idx === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        });
        ctx.closePath();
        ctx.fill();
      });

      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.ellipse(cx, cy - r * 0.85, r * 0.5, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.85, r * 0.6, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(rotation) * r * 0.35, cy + Math.sin(rotation) * r * 0.25, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      const shadow = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.3, cx, cy, r);
      shadow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      shadow.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
      shadow.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = shadow;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 14;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-cyan-400/30"
      />
      <div className="mt-2 px-2.5 py-0.5 bg-space-950/95 border border-cyan-500/50 rounded-full text-[10px] font-mono text-cyan-300 font-bold tracking-widest shadow-cyan-glow">
        EARTH (REAL-TIME)
      </div>
    </div>
  );
};

interface MissionOrbit3DProps {
  onSelectSatellite?: () => void;
  status?: 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
}

export const MissionOrbit3D: React.FC<MissionOrbit3DProps> = ({
  onSelectSatellite,
  status = 'DEGRADED'
}) => {
  const [use3D, setUse3D] = useState<boolean>(true);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<MissionObjectData | null>(null);
  const { playClickSound } = useAudio();

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  const handleSelectObject = (obj: MissionObjectData) => {
    playClickSound();
    setSelectedAsset(obj);
    if (onSelectSatellite) onSelectSatellite();
  };

  return (
    <div className="relative w-full h-[420px] bg-space-950 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl group select-none">
      {/* Top Header Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-space-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono backdrop-blur-md shadow-md">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
          <span className="text-slate-100 font-bold uppercase tracking-wider">ORBITAL INTELLIGENCE</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">REAL-TIME ORBIT 3D</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          onClick={() => {
            playClickSound();
            setUse3D(!use3D);
          }}
          className="bg-space-900/90 border border-slate-700/80 hover:border-cyan-500/50 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>{use3D && hasWebGL ? '2D TACTICAL' : '3D ORBIT'}</span>
        </button>
      </div>

      {/* 3D Canvas */}
      {use3D && hasWebGL ? (
        <Canvas
          camera={{ position: [0, 2.5, 9.5], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false
          }}
          dpr={[1, 1.5]}
          onCreated={({ gl }) => {
            const dom = gl.domElement;
            dom.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);
            dom.addEventListener('webglcontextrestored', () => gl.setSize(dom.clientWidth, dom.clientHeight), false);
          }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.6} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06B6D4" />
          <Stars radius={100} depth={50} count={3500} factor={4} saturation={0} fade speed={1} />

          {/* Realistic Earth Body */}
          <PlanetModel radius={2.2} />

          {/* Orbit Trajectory Paths */}
          <OrbitPath radiusX={4.2} radiusZ={4.2} inclination={0.35} color="#06B6D4" opacity={0.4} />
          <OrbitPath radiusX={5.5} radiusZ={4.8} inclination={-0.5} color="#8B5CF6" opacity={0.3} />
          <OrbitPath radiusX={6.8} radiusZ={6.2} inclination={0.2} color="#10B981" opacity={0.25} />

          {/* Mission Objects / Spacecraft */}
          {DEFAULT_MISSION_OBJECTS.map((obj) => (
            <MissionObject key={obj.id} data={obj} onSelect={handleSelectObject} />
          ))}

          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.4} maxPolarAngle={Math.PI / 1.7} minPolarAngle={Math.PI / 3.2} />
        </Canvas>
      ) : (
        /* 2D Tactical View Fallback */
        <div className="w-full h-full flex items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-space-900 via-space-950 to-black">
          <svg className="w-full h-full absolute inset-0 opacity-30" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="160" fill="none" stroke="#06B6D4" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="110" fill="none" stroke="#334155" strokeWidth="1" />
            <circle cx="200" cy="200" r="60" fill="none" stroke="#06B6D4" strokeWidth="1" />
            <line x1="200" y1="20" x2="200" y2="380" stroke="#334155" strokeWidth="1" />
            <line x1="20" y1="200" x2="380" y2="200" stroke="#334155" strokeWidth="1" />
          </svg>
          <RealisticEarthGraphic size={135} />
        </div>
      )}

      {/* Selected 3D Object Information Glass Panel Overlay */}
      {selectedAsset && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-space-950/95 border border-cyan-500/50 p-4 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-md z-30 font-mono text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="font-bold text-slate-100 text-xs tracking-wider uppercase">{selectedAsset.name}</span>
            </div>
            <button
              onClick={() => setSelectedAsset(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-space-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">OPERATIONAL STATUS:</span>
              <span
                className="px-2 py-0.5 rounded font-bold text-[11px]"
                style={{
                  backgroundColor: selectedAsset.status === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : selectedAsset.status === 'DEGRADED' ? 'rgba(245,158,11,0.2)' : 'rgba(6,182,212,0.2)',
                  color: selectedAsset.status === 'CRITICAL' ? '#EF4444' : selectedAsset.status === 'DEGRADED' ? '#F59E0B' : '#06B6D4'
                }}
              >
                {selectedAsset.status}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">ALTITUDE:</span>
              <span className="text-slate-100 font-semibold">{selectedAsset.altitudeKm} KM</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">VELOCITY:</span>
              <span className="text-slate-100 font-semibold">{selectedAsset.velocityKmS} KM/S</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">TELEMETRY LINK:</span>
              <span className="text-cyan-400 font-semibold">{selectedAsset.signalPercent}%</span>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500">LAST TELEMETRY:</span>
              <span className="text-slate-400">{selectedAsset.lastTelemetry}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
