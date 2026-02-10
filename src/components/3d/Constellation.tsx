import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface ConstellationProps {
  position: [number, number, number];
  color: string;
}

export default function Constellation({ position, color }: ConstellationProps) {
  const ref = useRef<THREE.Group>(null);
  
  const stars = useMemo(() => {
    const points: [number, number, number][] = [];
    const count = 8;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.5 + Math.random();
      points.push([
        Math.cos(angle) * radius + (Math.random() - 0.5),
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * radius + (Math.random() - 0.5)
      ]);
    }
    
    return points;
  }, []);
  
  const lines = useMemo(() => {
    const connections: [[number, number, number], [number, number, number]][] = [];
    for (let i = 0; i < stars.length; i++) {
      connections.push([stars[i], stars[(i + 1) % stars.length]]);
      if (i % 2 === 0) {
        connections.push([stars[i], stars[(i + 3) % stars.length]]);
      }
    }
    return connections;
  }, [stars]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Stars */}
      {stars.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      
      {/* Lines */}
      {lines.map((linePoints, i) => (
        <Line
          key={i}
          points={linePoints}
          color={color}
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
}
