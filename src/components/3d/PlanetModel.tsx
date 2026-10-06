import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural 2048x1024 photorealistic Earth texture generator
const createEarthTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep Ocean Radial & Linear Base
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGradient.addColorStop(0, '#0B1528');
    oceanGradient.addColorStop(0.3, '#0E2443');
    oceanGradient.addColorStop(0.5, '#0B1D3A');
    oceanGradient.addColorStop(0.7, '#0E2443');
    oceanGradient.addColorStop(1, '#0B1528');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 2048, 1024);

    // Subtle Tactical Grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
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

    // Landmass Polygons
    const drawLand = (points: [number, number][], color = '#1E522F') => {
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

    drawLand([[-160,65],[-130,70],[-70,72],[-55,50],[-75,35],[-80,25],[-105,20],[-120,32],[-130,55]], '#1F522F');
    drawLand([[-90,18],[-75,10],[-50,-5],[-35,-10],[-40,-25],[-65,-55],[-75,-45],[-80,-10]], '#1B4D2A');
    drawLand([[-10,65],[30,72],[90,75],[140,70],[170,60],[140,35],[100,10],[75,25],[40,35],[25,40],[0,50]], '#225B34');
    drawLand([[-18,35],[35,33],[43,12],[50,10],[40,-30],[20,-35],[12,-5],[-15,10]], '#25633A');
    drawLand([[113,-14],[154,-14],[150,-38],[115,-35]], '#285934');

    // Ice Caps
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 2048, 80);
    ctx.fillRect(0, 940, 2048, 84);

    // Topography Details
    for (let i = 0; i < 2500; i++) {
      const rx = Math.random() * 2048;
      const ry = Math.random() * 1024;
      const rSize = Math.random() * 10 + 2;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(2, 132, 199, 0.15)';
      ctx.beginPath();
      ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

export const PlanetModel: React.FC<{ radius?: number }> = ({ radius = 2.2 }) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  const earthTexture = useMemo(() => createEarthTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (planetRef.current) {
      planetRef.current.rotation.y = t * 0.05;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = t * 0.065;
    }
  });

  return (
    <group>
      {/* 3D Planet Globe */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>

      {/* Outer Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.04, 32, 32]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.15} />
      </mesh>

      {/* Cloud Swirl Atmosphere Mesh */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[radius * 1.02, 32, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
