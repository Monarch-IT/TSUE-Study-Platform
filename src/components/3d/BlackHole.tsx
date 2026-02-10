import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BlackHoleProps {
  position: [number, number, number];
  size?: number;
}

export default function BlackHole({ position, size = 3 }: BlackHoleProps) {
  const ringRef = useRef<THREE.Points>(null);
  const ringRef2 = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const particleCount = 8000;

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const sizeArr = new Float32Array(particleCount);
    const colorInner = new THREE.Color('#ffaa00');
    const colorOuter = new THREE.Color('#ff3e00');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = size * (1.1 + Math.pow(Math.random(), 2) * 4);

      // Accretion disk physics: tighter in the middle
      pos[i3] = Math.cos(angle) * radius;
      pos[i3 + 1] = (Math.random() - 0.5) * 0.05 * (radius / size);
      pos[i3 + 2] = Math.sin(angle) * radius;

      const mixed = colorInner.clone().lerp(colorOuter, (radius - size) / (size * 4));
      cols[i3] = mixed.r;
      cols[i3 + 1] = mixed.g;
      cols[i3 + 2] = mixed.b;

      sizeArr[i] = Math.random() * 0.08;
    }
    return [pos, cols, sizeArr];
  }, [size]);

  const [positions2, colors2] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const colorInner = new THREE.Color('#ffffff');
    const colorOuter = new THREE.Color('#ff8c00');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = size * (1.05 + Math.pow(Math.random(), 2) * 1.5);

      // The vertical "halo" disk (gravitational lensing effect)
      pos[i3] = Math.cos(angle) * radius;
      pos[i3 + 1] = Math.sin(angle) * radius;
      pos[i3 + 2] = (Math.random() - 0.5) * 0.02;

      const mixed = colorInner.clone().lerp(colorOuter, (radius - size) / (size * 1.5));
      cols[i3] = mixed.r;
      cols[i3 + 1] = mixed.g;
      cols[i3 + 2] = mixed.b;
    }
    return [pos, cols];
  }, [size]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.y = time * 0.5;
    if (ringRef2.current) {
      ringRef2.current.rotation.y = time * 0.1;
      ringRef2.current.rotation.x = Math.sin(time * 0.5) * 0.05;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.1;
      const s = size * 0.8 * (1 + Math.sin(time * 2) * 0.02);
      coreRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      {/* Event Horizon (Pure Black) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[size * 0.8, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Main Accretion Disk */}
      <points ref={ringRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>

      {/* Lensed Secondary Disk (Vertical-ish) */}
      <points ref={ringRef2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions2} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={particleCount} array={colors2} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>

      {/* Extreme Core Glow */}
      <mesh>
        <sphereGeometry args={[size * 0.85, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>

      {/* Corona Glow */}
      <mesh>
        <sphereGeometry args={[size * 1.5, 32, 32]} />
        <meshBasicMaterial color="#ff4500" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}
