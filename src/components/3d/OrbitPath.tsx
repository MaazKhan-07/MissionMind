import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitPathProps {
  radiusX: number;
  radiusZ: number;
  inclination?: number;
  color?: string;
  opacity?: number;
}

export const OrbitPath: React.FC<OrbitPathProps> = ({
  radiusX,
  radiusZ,
  inclination = 0,
  color = '#06B6D4',
  opacity = 0.35
}) => {
  // Generate smooth elliptical orbit path points
  const points = React.useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * radiusX;
      const z = Math.sin(theta) * radiusZ;
      pts.push(new THREE.Vector3(x, 0, z));
    }
    return pts;
  }, [radiusX, radiusZ]);

  const geometry = React.useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  const lineObject = React.useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: opacity,
      linewidth: 1
    });
    const line = new THREE.Line(geometry, mat);
    line.rotation.x = inclination;
    return line;
  }, [geometry, color, opacity, inclination]);

  useFrame(() => {
    if (lineObject) {
      lineObject.rotation.x = inclination;
    }
  });

  return <primitive object={lineObject} />;
};
