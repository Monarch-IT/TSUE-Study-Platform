import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NebulaCloudProps {
  position: [number, number, number];
  color: string;
  size?: number;
  opacity?: number;
}

export default function NebulaCloud({
  position,
  color,
  size = 4,
  opacity = 0.4
}: NebulaCloudProps) {
  const groupRef = useRef<THREE.Group>(null);

  const cloudLayers = useMemo(() => {
    return [
      { count: 1500, size: 0.15, speed: 0.02, opacity: opacity * 0.9 },
      { count: 1000, size: 0.3, speed: -0.015, opacity: opacity * 0.6 },
      { count: 500, size: 0.8, speed: 0.03, opacity: opacity * 0.4 },
      { count: 300, size: 1.5, speed: -0.02, opacity: opacity * 0.2 },
    ].map((layer, idx) => {
      const positions = new Float32Array(layer.count * 3);
      const colors = new Float32Array(layer.count * 3);
      const baseColor = new THREE.Color(color);
      const variantColor = new THREE.Color(color).offsetHSL(0.1, 0, 0);

      for (let i = 0; i < layer.count; i++) {
        const i3 = i * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        // Radial distribution with some "clumping"
        const r = (Math.random() + Math.random()) * size * 0.5 * (1 + idx * 0.2);

        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        const mixed = baseColor.clone().lerp(variantColor, Math.random());
        colors[i3] = mixed.r;
        colors[i3 + 1] = mixed.g;
        colors[i3 + 2] = mixed.b;
      }
      return { ...layer, positions, colors };
    });
  }, [size, opacity, color]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {cloudLayers.map((layer, i) => (
        <points key={i}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={layer.count} array={layer.positions} itemSize={3} />
            <bufferAttribute attach="attributes-color" count={layer.count} array={layer.colors} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            size={layer.size}
            vertexColors
            transparent
            opacity={layer.opacity}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </group>
  );
}
