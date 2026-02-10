import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitRingProps {
  radius: number;
  color: string;
  speed?: number;
  tilt?: number;
  particleCount?: number;
}

export default function OrbitRing({ 
  radius, 
  color, 
  speed = 1, 
  tilt = 0,
  particleCount = 200 
}: OrbitRingProps) {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const i3 = i * 3;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = Math.sin(angle) * radius;
    }
    
    return positions;
  }, [radius, particleCount]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  return (
    <group rotation={[tilt, 0, 0]}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={color}
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
