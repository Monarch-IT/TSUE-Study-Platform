import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GalaxyParticlesProps {
  scrollProgress: number;
}

export default function GalaxyParticles({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Points>(null);
  const count = 12000;
  const coreCount = 2000;

  // Main Galaxy Structure
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const colorInside = new THREE.Color('#ff3e00');
    const colorOutside = new THREE.Color('#3b82f6');
    const colorThird = new THREE.Color('#7c3aed');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const radius = Math.random() * 25 + 2;
      const spinAngle = radius * 0.8;
      const branchAngle = ((i % 3) / 3) * Math.PI * 2;

      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * radius * 0.2;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * radius * 0.1;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * radius * 0.2;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = colorInside.clone();
      if (radius < 10) {
        mixedColor.lerp(colorThird, radius / 10);
      } else {
        mixedColor.lerp(colorOutside, (radius - 10) / 15);
      }

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      sizes[i] = (Math.random() * 0.4 + 0.05) * (1 + (1 / radius));
    }

    return [positions, colors, sizes];
  }, []);

  // Bright Core Particles
  const [corePositions, coreColors] = useMemo(() => {
    const pos = new Float32Array(coreCount * 3);
    const col = new Float32Array(coreCount * 3);
    const color = new THREE.Color('#ffffff');

    for (let i = 0; i < coreCount; i++) {
      const i3 = i * 3;
      const radius = Math.pow(Math.random(), 2) * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.2;
      pos[i3 + 2] = radius * Math.cos(phi);

      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const scrollProgress = scrollRef.current;
    if (ref.current) {
      ref.current.rotation.y = time * 0.02 + scrollProgress * 0.5;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = -time * 0.05 - scrollProgress * 0.2;
    }
  });

  return (
    <group>
      {/* Main Galaxy Body */}
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Intense Center Core */}
      <points ref={coreRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={coreCount} array={corePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={coreCount} array={coreColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

