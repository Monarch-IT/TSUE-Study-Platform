import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WormholeProps {
  position: [number, number, number];
  color: string;
}

export default function Wormhole({ position, color }: WormholeProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const count = 5000;

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const mainColor = new THREE.Color(color);
    const endColor = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = Math.random();
      // Spiral tunnel geometry
      const angle = t * Math.PI * 20;
      const radius = 0.1 + t * 3.5;
      const z = (t - 0.5) * 15;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = z;

      const mixedColor = mainColor.clone().lerp(endColor, 1 - t);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    return [positions, colors];
  }, [color]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (pointsRef.current) {
      pointsRef.current.rotation.z = time * 0.8;
      // Pulsing tunnel effect
      pointsRef.current.position.z = Math.sin(time * 2) * 0.5;
    }
    if (ringRef.current) {
      const s = 1 + Math.sin(time * 3) * 0.1;
      ringRef.current.scale.set(s, s, s);
      ringRef.current.rotation.z = time * 0.2;
    }
  });

  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* Multi-layered Entrance Rings */}
      <mesh ref={ringRef} position={[0, 0, -7.5]}>
        <torusGeometry args={[0.8, 0.08, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0, -7.5]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.0, 0.03, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, -7.5]} rotation={[0, 0, -Math.PI / 4]}>
        <torusGeometry args={[1.2, 0.01, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
