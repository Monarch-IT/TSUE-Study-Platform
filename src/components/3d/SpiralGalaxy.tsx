import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpiralGalaxyProps {
  color: string;
  position: [number, number, number];
  scale?: number;
}

export default function SpiralGalaxy({ color, position, scale = 1 }: SpiralGalaxyProps) {
  const ref = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const count = 15000;

  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const mainColor = new THREE.Color(color);
    const secondaryColor = new THREE.Color('#ffffff');
    const branches = 5;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = Math.pow(Math.random(), 1.5) * 10 * scale; // More spread out
      const spinAngle = radius * 0.6;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;

      // Add randomness to make it look less like perfect lines
      const randomX = (Math.random() - 0.5) * 0.8 * (radius / 10);
      const randomY = (Math.random() - 0.5) * 0.2 * (radius / 10);
      const randomZ = (Math.random() - 0.5) * 0.8 * (radius / 10);

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = mainColor.clone();
      mixedColor.lerp(secondaryColor, Math.random() * 0.6);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 0.5 + 0.1;
      if (radius < 2) sizes[i] *= 1.5; // Brighten core
    }

    return [positions, colors, sizes];
  }, [color, scale]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = time * 0.03;
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(time * 1.5) * 0.15;
      coreRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      {/* Super-Intense Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.5 * scale, 64, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.2 * scale, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
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
