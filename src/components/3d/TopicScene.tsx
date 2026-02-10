import { useMemo } from 'react';
import { TopicData } from '@/data/topics';
import OrbitRing from './OrbitRing';
import NebulaCloud from './NebulaCloud';
import BlackHole from './BlackHole';
import SpiralGalaxy from './SpiralGalaxy';
import Constellation from './Constellation';
import Wormhole from './Wormhole';

interface TopicSceneProps {
  topic: TopicData;
  isActive: boolean;
  opacity: number;
}

export default function TopicScene({ topic, isActive, opacity }: TopicSceneProps) {
  const scene = useMemo(() => {
    switch (topic.sceneType) {
      case 'orbit':
        return (
          <group>
            <OrbitRing radius={2} color={topic.color} speed={1} tilt={0.3} />
            <OrbitRing radius={3} color={topic.glowColor} speed={-0.5} tilt={-0.2} />
            <OrbitRing radius={4} color={topic.color} speed={0.3} tilt={0.5} />
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshBasicMaterial color={topic.color} transparent opacity={0.8} />
            </mesh>
          </group>
        );

      case 'nebula':
        return (
          <group>
            <NebulaCloud position={[0, 0, 0]} color={topic.color} size={4} opacity={0.4} />
            <NebulaCloud position={[1, 0.5, 1]} color={topic.glowColor} size={2} opacity={0.3} />
          </group>
        );

      case 'blackhole':
        return <BlackHole position={[0, 0, 0]} size={2} />;

      case 'spiral':
        return <SpiralGalaxy position={[0, 0, 0]} color={topic.color} scale={1.5} />;

      case 'constellation':
        return <Constellation position={[0, 0, 0]} color={topic.color} />;

      case 'wormhole':
        return <Wormhole position={[0, 0, 0]} color={topic.color} />;

      default:
        return null;
    }
  }, [topic]);

  return (
    <group>
      {scene}
    </group>
  );
}
