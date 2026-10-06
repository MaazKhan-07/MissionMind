import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Eye, ShieldAlert, Radio, Activity, Compass } from 'lucide-react';

interface MissionSceneProps {
  onSelectSatellite: () => void;
  status: 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
}

// 3D Animated Satellite Component
const Satellite3D: React.FC<{
  onSelect: () => void;
  status: 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
}> = ({ onSelect, status }) => {
  const satGroupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.4;
    if (satGroupRef.current) {
      satGroupRef.current.position.x = Math.cos(t) * 3.8;
      satGroupRef.current.position.z = Math.sin(t) * 3.8;
      satGroupRef.current.position.y = Math.sin(t * 2) * 0.4;
      satGroupRef.current.rotation.y = t + Math.PI / 2;
    }

    if (pulseRef.current) {
      const pScale = 1 + (clock.getElapsedTime() % 1.5) * 1.2;
      pulseRef.current.scale.set(pScale, pScale, pScale);
      const opacity = Math.max(0, 1 - (clock.getElapsedTime() % 1.5) / 1.5);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.5;
    }
  });

  const satColor = status === 'CRITICAL' ? '#EF4444' : status === 'DEGRADED' ? '#F59E0B' : '#06B6D4';

  return (
    <group ref={satGroupRef}>
      {/* Satellite Main Body */}
      <mesh
        onClick={onSelect}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          setHovered(false);
        }}
      >
        <boxGeometry args={[0.3, 0.3, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Solar Wings */}
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[0.7, 0.02, 0.25]} />
        <meshStandardMaterial color="#1E293B" emissive="#0284C7" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.7, 0.02, 0.25]} />
        <meshStandardMaterial color="#1E293B" emissive="#0284C7" emissiveIntensity={0.5} />
      </mesh>

      {/* Communication Dish Sensor */}
      <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.02, 0.1, 16]} />
        <meshStandardMaterial color={satColor} emissive={satColor} emissiveIntensity={0.8} />
      </mesh>

      {/* Telemetry Pulse Wave */}
      <mesh ref={pulseRef} position={[0, 0, 0.25]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={satColor} transparent opacity={0.3} wireframe />
      </mesh>

      {/* Hover Tooltip Overlay */}
      {hovered && (
        <Html distanceFactor={10} position={[0, 0.6, 0]}>
          <div className="bg-space-950/95 border border-cyan-500/50 p-3 rounded-lg shadow-cyan-glow text-[11px] font-mono whitespace-nowrap backdrop-blur-md pointer-events-none">
            <div className="text-cyan-300 font-bold text-xs flex items-center gap-1.5 border-b border-cyan-500/30 pb-1 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              SAT-01 // MISSION ALPHA
            </div>
            <div className="text-slate-300 space-y-0.5">
              <div>STATUS: <span className="text-amber-400 font-semibold">DEGRADED</span></div>
              <div>ALTITUDE: <span className="text-slate-100">542 KM</span></div>
              <div>LINK: <span className="text-red-400 font-semibold">WEAK (-12 dBm)</span></div>
              <div>LAST UPDATE: <span className="text-cyan-400">14:32:18 UTC</span></div>
            </div>
            <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] text-slate-400 italic">
              Click satellite to open details drawer
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Helper to create high-resolution 3D Earth texture procedurally
const createEarthTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep Ocean Base
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGradient.addColorStop(0, '#0B1528');
    oceanGradient.addColorStop(0.3, '#0E2443');
    oceanGradient.addColorStop(0.5, '#0B1D3A');
    oceanGradient.addColorStop(0.7, '#0E2443');
    oceanGradient.addColorStop(1, '#0B1528');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 2048, 1024);

    // Latitude & Longitude Grid Overlay
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 2048; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }

    // Draw continent landmass polygons
    const drawLand = (points: [number, number][], color = '#1E4D2B') => {
      ctx.fillStyle = color;
      ctx.beginPath();
      points.forEach(([lon, lat], idx) => {
        const px = ((lon + 180) / 360) * 2048;
        const py = ((90 - lat) / 180) * 1024;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
    };

    // North America
    drawLand([[-160,65],[-130,70],[-70,72],[-55,50],[-75,35],[-80,25],[-105,20],[-120,32],[-130,55]], '#1F522F');
    // South America
    drawLand([[-90,18],[-75,10],[-50,-5],[-35,-10],[-40,-25],[-65,-55],[-75,-45],[-80,-10]], '#1B4D2A');
    // Eurasia
    drawLand([[-10,65],[30,72],[90,75],[140,70],[170,60],[140,35],[100,10],[75,25],[40,35],[25,40],[0,50]], '#225B34');
    // Africa
    drawLand([[-18,35],[35,33],[43,12],[50,10],[40,-30],[20,-35],[12,-5],[-15,10]], '#25633A');
    // Australia & NZ
    drawLand([[113,-14],[154,-14],[150,-38],[115,-35]], '#285934');
    // Ice Caps
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(0, 0, 2048, 80);
    ctx.fillRect(0, 940, 2048, 84);

    // Organic Topography Shading
    for (let i = 0; i < 3000; i++) {
      const rx = Math.random() * 2048;
      const ry = Math.random() * 1024;
      const rSize = Math.random() * 12 + 2;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(2, 132, 199, 0.15)';
      ctx.beginPath();
      ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// Realistic 3D Earth Globe Component
const Earth3D: React.FC<{ status: 'NOMINAL' | 'DEGRADED' | 'CRITICAL' }> = ({ status }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const orbitRingRef = useRef<THREE.Mesh>(null);

  const earthTexture = React.useMemo(() => createEarthTexture(), []);

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.0012;
    if (orbitRingRef.current) orbitRingRef.current.rotation.z += 0.0005;
  });

  const ringColor = status === 'CRITICAL' ? '#EF4444' : status === 'DEGRADED' ? '#F59E0B' : '#06B6D4';

  return (
    <group>
      {/* Realistic 3D Earth Globe */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Earth Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[2.08, 32, 32]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.18} />
      </mesh>

      {/* Orbit Ring Path */}
      <mesh ref={orbitRingRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[3.8, 0.015, 16, 100]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.6} />
      </mesh>

      {/* Anomaly Highlight Segment on Orbit */}
      {status !== 'NOMINAL' && (
        <mesh rotation={[Math.PI / 3, 0.5, 0]}>
          <torusGeometry args={[3.8, 0.03, 16, 25, Math.PI / 3]} />
          <meshBasicMaterial color="#EF4444" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

// Realistic 2D/3D Earth Graphic Model for Tactical Radar View
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

      // Save clipping path for sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Deep ocean gradient
      const ocean = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      ocean.addColorStop(0, '#1E3A8A');
      ocean.addColorStop(0.4, '#172554');
      ocean.addColorStop(0.8, '#0F172A');
      ocean.addColorStop(1, '#020617');
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, w, h);

      // Latitude / Longitude grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const yPos = cy + (lat / 90) * r;
        const widthAtLat = Math.sqrt(Math.max(0, r * r - (yPos - cy) * (yPos - cy)));
        ctx.beginPath();
        ctx.ellipse(cx, yPos, widthAtLat, widthAtLat * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw rotating continents
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

      // Polar Ice Caps
      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.ellipse(cx, cy - r * 0.85, r * 0.5, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.85, r * 0.6, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cloud swirl highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(rotation) * r * 0.35, cy + Math.sin(rotation) * r * 0.25, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // 3D Sphere Day/Night Terminator Lighting
      const shadow = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.3, cx, cy, r);
      shadow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      shadow.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
      shadow.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = shadow;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();

      // Atmosphere glow border rim
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

export const MissionScene: React.FC<MissionSceneProps> = ({
  onSelectSatellite,
  status
}) => {
  const [use3D, setUse3D] = useState<boolean>(true);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    // WebGL capability check
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  return (
    <div className="relative w-full h-[400px] bg-space-950 rounded-xl border border-slate-800/80 overflow-hidden radar-overlay group shadow-2xl">
      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-space-900/90 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono backdrop-blur-md">
          <Compass className="w-3.5 h-3.5 text-system animate-spin" style={{ animationDuration: '20s' }} />
          <span className="text-slate-200 font-semibold">ORBITAL VIEW</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">SAT-01 IN-FLIGHT</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          onClick={() => setUse3D(!use3D)}
          className="bg-space-900/90 border border-slate-700/80 hover:border-system/50 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white transition-all backdrop-blur-md flex items-center gap-1.5"
          title="Toggle 3D View / 2D Tactical View"
        >
          <Eye className="w-3.5 h-3.5 text-system" />
          <span>{use3D && hasWebGL ? '2D RADAR' : '3D ORBIT'}</span>
        </button>
      </div>

      {/* Bottom Telemetry Arc Status */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between bg-space-900/85 border border-slate-800/90 px-4 py-2 rounded-lg text-xs font-mono backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ALT:</span>
            <span className="text-slate-100 font-semibold">542.4 KM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">INC:</span>
            <span className="text-slate-100 font-semibold">51.6°</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">COMM:</span>
            <span className="text-amber-400 font-semibold">SVALBARD GS (WEAK)</span>
          </div>
        </div>
        <button
          onClick={onSelectSatellite}
          className="text-system hover:underline font-semibold flex items-center gap-1"
        >
          INSPECT SATELLITE →
        </button>
      </div>

      {/* 3D R3F View */}
      {use3D && hasWebGL ? (
        <Canvas
          camera={{ position: [0, 2, 9], fov: 45 }}
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
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00F0FF" />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          <Earth3D status={status} />
          <Satellite3D onSelect={onSelectSatellite} status={status} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 3} />
        </Canvas>
      ) : (
        /* 2D Tactical SVG Radar Fallback */
        <div className="w-full h-full flex items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-space-900 via-space-950 to-black">
          {/* Radar Circles */}
          <svg className="w-full h-full absolute inset-0 opacity-40" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="160" fill="none" stroke="#06B6D4" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="110" fill="none" stroke="#334155" strokeWidth="1" />
            <circle cx="200" cy="200" r="60" fill="none" stroke="#06B6D4" strokeWidth="1" />
            <line x1="200" y1="20" x2="200" y2="380" stroke="#334155" strokeWidth="1" />
            <line x1="20" y1="200" x2="380" y2="200" stroke="#334155" strokeWidth="1" />
          </svg>

          {/* Central Real Earth Graphic Model */}
          <RealisticEarthGraphic size={130} />

          {/* Satellite Tactical Node */}
          <div
            onClick={onSelectSatellite}
            className="absolute top-28 right-36 cursor-pointer z-20 group"
          >
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-amber-500/30 animate-ping" />
              <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-amber-glow">
                <Radio className="w-3 h-3 text-black" />
              </div>
            </div>
            <div className="mt-2 bg-space-950/90 border border-amber-500/40 px-2 py-1 rounded text-[10px] font-mono text-amber-300 whitespace-nowrap shadow-lg">
              SAT-01 (DEGRADED)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
