import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  status?: 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
}

export const ThreeMissionView: React.FC<Props> = ({ status = 'DEGRADED' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 280;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Color theme based on status
    const statusColor = status === 'CRITICAL' ? 0xef4444 : status === 'DEGRADED' ? 0xf59e0b : 0x10b981;

    // Earth Sphere (Wireframe & Glowing core)
    const earthGeo = new THREE.SphereGeometry(2, 32, 32);
    const earthMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // Inner Earth Solid Core
    const coreGeo = new THREE.SphereGeometry(1.95, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Orbit Ring
    const orbitCurve = new THREE.EllipseCurve(0, 0, 4.5, 3.2, 0, 2 * Math.PI, false, 0);
    const points = orbitCurve.getPoints(100);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitMat = new THREE.LineBasicMaterial({
      color: statusColor,
      transparent: true,
      opacity: 0.6,
    });
    const orbit = new THREE.Line(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI * 0.15;
    scene.add(orbit);

    // Spacecraft Body
    const satGroup = new THREE.Group();
    const satBodyGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const satBodyMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const satBody = new THREE.Mesh(satBodyGeo, satBodyMat);
    satGroup.add(satBody);

    // Solar Arrays
    const panelGeo = new THREE.BoxGeometry(1.2, 0.04, 0.3);
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const panelLeft = new THREE.Mesh(panelGeo, panelMat);
    panelLeft.position.set(-0.8, 0, 0);
    const panelRight = new THREE.Mesh(panelGeo, panelMat);
    panelRight.position.set(0.8, 0, 0);
    satGroup.add(panelLeft);
    satGroup.add(panelRight);

    // Antenna Vector / Beam
    const beamGeo = new THREE.CylinderGeometry(0.02, 0.1, 3, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: statusColor,
      transparent: true,
      opacity: 0.5,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, -1.5, 0);
    satGroup.add(beam);

    scene.add(satGroup);

    // Starfield Particles
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 200;
    const starPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 30;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.08 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Animation Loop
    let angle = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      earth.rotation.y += 0.002;
      angle += 0.01;

      // Move Satellite along orbital path
      const satX = 4.5 * Math.cos(angle);
      const satZ = 3.2 * Math.sin(angle);
      const satY = Math.sin(angle) * 0.8;

      satGroup.position.set(satX, satY, satZ);
      satGroup.rotation.y = -angle + Math.PI / 2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [status]);

  return (
    <div className="relative w-full h-[280px] rounded-xl overflow-hidden glass-panel flex flex-col justify-between p-4">
      {/* Top Overlay Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${status === 'CRITICAL' ? 'bg-red-500 animate-ping' : status === 'DEGRADED' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 uppercase">
            ORBITAL TELEMETRY MESH • ST-10 PASS 1432
          </span>
        </div>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
          status === 'CRITICAL' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
          status === 'DEGRADED' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' :
          'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
        }`}>
          {status}
        </span>
      </div>

      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Bottom Telemetry Metrics Overlay */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 bg-slate-950/60 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800/80">
        <div>ALTITUDE: <span className="text-cyan-400">540 KM</span></div>
        <div>INCLINATION: <span className="text-cyan-400">97.8°</span></div>
        <div>PERIOD: <span className="text-cyan-400">95.4 MIN</span></div>
        <div>RF LINK: <span className={status === 'NOMINAL' ? 'text-emerald-400' : 'text-amber-400'}>{status === 'NOMINAL' ? 'STABLE' : 'ATTENUATED'}</span></div>
      </div>
    </div>
  );
};
