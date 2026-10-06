import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface InteractiveMeshProps {
  interactive?: boolean;
  className?: string;
}

// Inner 3D Surface & Particle Field
const MeshSurface: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  // Mouse coords stored in refs to prevent React state re-renders on pointer movements
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Grid dimensions
  const cols = 40;
  const rows = 28;
  const width = Math.max(viewport.width * 1.5, 24);
  const height = Math.max(viewport.height * 1.5, 18);

  // Generate baseline geometry & memoize
  const { geometry, originalPositions } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, cols, rows);
    const pos = geo.attributes.position;
    const orig = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      orig[i * 3] = pos.getX(i);
      orig[i * 3 + 1] = pos.getY(i);
      orig[i * 3 + 2] = pos.getZ(i);
    }

    return { geometry: geo, originalPositions: orig };
  }, [width, height, cols, rows]);

  // Track global pointer without triggering component re-render
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // Normalize to [-1, 1]
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.current.targetX = nx * (width * 0.45);
      mousePos.current.targetY = ny * (height * 0.45);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [width, height]);

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  // Animation Loop: smooth lerp + physical elevation towards camera
  useFrame(({ clock, camera }) => {
    const time = clock.getElapsedTime();

    // Lerp cursor coordinates for organic, physical feel
    const lerpFactor = 0.06;
    mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * lerpFactor;
    mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * lerpFactor;

    const mx = mousePos.current.x;
    const my = mousePos.current.y;

    // Subtle camera parallax
    if (!reducedMotion) {
      camera.position.x += (mx * 0.08 - camera.position.x) * 0.05;
      camera.position.y += (my * 0.08 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
    }

    // Deform mesh vertices
    if (meshRef.current) {
      const pos = meshRef.current.geometry.attributes.position;
      const count = pos.count;

      for (let i = 0; i < count; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];

        // Idle wave motion
        let z = 0;
        if (!reducedMotion) {
          z = Math.sin(ox * 0.3 + time * 0.7) * Math.cos(oy * 0.3 + time * 0.5) * 0.25;
        }

        // Distance from current interpolated cursor
        const dx = ox - mx;
        const dy = oy - my;
        const distSq = dx * dx + dy * dy;

        // Gaussian bulge projection: rises forward toward user when cursor is near
        const radius = 6.0;
        if (distSq < radius * radius && !reducedMotion) {
          const factor = Math.exp(-distSq / (2 * 4.0));
          // Projects outward toward the screen (positive Z)
          z += factor * 1.6;
        }

        pos.setZ(i, z);
      }

      pos.needsUpdate = true;
    }
  });

  return (
    <group rotation={[-0.35, 0, 0]} position={[0, -1, -2]}>
      {/* Dynamic Wireframe Grid Mesh */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial
          color="#06B6D4"
          wireframe
          transparent
          opacity={0.16}
        />
      </mesh>

      {/* Nodes / Particle Points at vertices */}
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          color="#8B5CF6"
          size={0.065}
          transparent
          opacity={0.55}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

export const InteractiveMesh: React.FC<InteractiveMeshProps> = ({
  className = "w-full h-full"
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(motionQuery.matches);

      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', handler);
      } else {
        motionQuery.addListener(handler);
      }
      return () => {
        if (motionQuery.removeEventListener) {
          motionQuery.removeEventListener('change', handler);
        } else {
          motionQuery.removeListener(handler);
        }
      };
    }
  }, []);

  useEffect(() => {
    // Test WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    // 2D CSS Spatial Fallback (Graceful degradation)
    return (
      <div className={`relative overflow-hidden bg-void ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(6,182,212,0.1)_0%,rgba(139,92,246,0.06)_40%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden pointer-events-none select-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false
        }}
        dpr={[1, 1.5]} // Performance safeguard for high-DPI screens
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('MissionMind: WebGL Context Lost, falling back.');
            setHasWebGL(false);
          }, false);
        }}
      >
        <MeshSurface reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
};
