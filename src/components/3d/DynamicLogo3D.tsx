import { useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sparkles, Edges, useTexture, Float, MeshTransmissionMaterial, Environment, Line } from '@react-three/drei';
import * as THREE from 'three';

// ═══════════════════════════════════════════
// 1. ASSETS & UTILS
// ═══════════════════════════════════════════

function DNAHelix() {
  const points = useMemo(() => {
    const p1: THREE.Vector3[] = [];
    const p2: THREE.Vector3[] = [];
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 4;
      const y = (i / 40 - 0.5) * 4.5;
      p1.push(new THREE.Vector3(Math.cos(angle) * 0.7, y, Math.sin(angle) * 0.7));
      p2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * 0.7, y, Math.sin(angle + Math.PI) * 0.7));
    }
    return { p1, p2 };
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
  });

  return (
    <group ref={groupRef} scale={1.8}>
      {/* Primary strand 1 (Gold) */}
      {points.p1.map((p, i) => (
        <mesh key={`p1-${i}`} position={p}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={4} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Primary strand 2 (Cyan) */}
      {points.p2.map((p, i) => (
        <mesh key={`p2-${i}`} position={p}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={4} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Connector rungs */}
      {Array.from({ length: 25 }).map((_, i) => {
        const y = (i / 25 - 0.5) * 4.5;
        const angle = (i / 25) * Math.PI * 2;
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[0, angle, 0]}>
            <boxGeometry args={[1.5, 0.03, 0.03]} />
            <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={2} transparent opacity={0.4} />
          </mesh>
        );
      })}
      <Sparkles count={120} scale={2} size={2} speed={0.8} color="#fbbf24" />
    </group>
  );
}

function InternalDataSnippet({ position, text, color = "#38bdf8", size = 0.12 }: { position: [number, number, number], text: string, color?: string, size?: number }) {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text position={position} fontSize={size} color={color} fillOpacity={0.4}>
        {text}
      </Text>
    </Float>
  );
}

function GlobalConstellations() {
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 20; i++) {
      p.push(new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 30 - 20));
    }
    return p;
  }, []);

  return (
    <group>
      {points.map((p, i) => (
        <group key={i}>
          <mesh position={p}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
          </mesh>
          {i < points.length - 1 && (
            <Line
              points={[p, points[i + 1]]}
              color="#38bdf8"
              lineWidth={0.5}
              transparent
              opacity={0.1}
            />
          )}
        </group>
      ))}
    </group>
  );
}

function LogicGate({ position, type = 'AND' }: { position: [number, number, number], type?: 'AND' | 'OR' }) {
  return (
    <group position={position} scale={0.5}>
      <Text fontSize={0.8} color="#38bdf8" fillOpacity={0.3}>
        {type === 'AND' ? '[D-]' : '[>-]'}
      </Text>
      <group position={[0.8, 0, 0]}>
         <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]} color="#38bdf8" lineWidth={1} transparent opacity={0.2} />
      </group>
      <group position={[-1.8, 0.2, 0]}>
         <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]} color="#38bdf8" lineWidth={1} transparent opacity={0.2} />
      </group>
      <group position={[-1.8, -0.2, 0]}>
         <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]} color="#38bdf8" lineWidth={1} transparent opacity={0.2} />
      </group>
    </group>
  );
}

function FloatingCode() {
  const snippets = [
    { pos: [-25, 15, -15], text: "<script>\n  func calculate() {\n    if (condition) {\n      return condition();\n    }\n  }\n</script>" },
    { pos: [22, -12, -10], text: "git commit -m \"IT\"\n\n{\"Metrics\": {\n  \"Latency\": \"1.5ms\",\n  \"Accessed\": \"true\"\n}}" },
    { pos: [-20, -18, -12], text: "<script>\n  higher_abst_logic = ...\n  {\n    use_data\n    data_packets\n  }\n</script>" },
  ];

  return (
    <group>
      {snippets.map((s, i) => (
        <Text
          key={i}
          position={s.pos as [number, number, number]}
          fontSize={1.2}
          color="#38bdf8"
          fillOpacity={0.3}
          textAlign="left"
           anchorX="left"
        >
          {s.text}
        </Text>
      ))}
      <LogicGate position={[15, 18, -10]} type="AND" />
      <LogicGate position={[18, -5, -8]} type="OR" />
      <GlobalConstellations />
    </group>
  );
}

// ═══════════════════════════════════════════
// 2. MAIN CRYSTAL LOGO
// ═══════════════════════════════════════════

function FacetedCrystal({ mouse }: { mouse: React.MutableRefObject<THREE.Vector2> }) {
  const groupRef = useRef<THREE.Group>(null);
  const textures = useTexture({
    circuitry: '/textures/circuitry.png',
  });

  useFrame(() => {
    if (groupRef.current) {
      const targetRotationX = -mouse.current.y * 0.35;
      const targetRotationY = mouse.current.x * 0.35;
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1;
    }
  });

  const dataSnippets = [
    { pos: [1, 1, 0.5], text: "0x7F 00" },
    { pos: [-1.2, -0.8, -0.6], text: "MOV EAX" },
    { pos: [0.8, -1.5, 0.2], text: "PUSH" },
    { pos: [-0.5, 2, -1], text: "RET" },
  ];

  return (
    <group ref={groupRef}>
      {/* 1. OUTER TRANSMISSION SHELL */}
      <mesh>
        <dodecahedronGeometry args={[3.4, 0]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          metalness={0.1}
          roughness={0.1}
          transmission={1.0}
          thickness={0.8}
          ior={1.45}
          reflectivity={0.5}
          iridescence={0.5}
          iridescenceIOR={1.4}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.8}
          envMapIntensity={1.5}
          map={textures.circuitry}
        />
      </mesh>

      {/* 2. INNER GLOWING CORE (GOLDEN) */}
      <mesh scale={0.92}>
        <dodecahedronGeometry args={[3.4, 0]} />
        <meshStandardMaterial 
          color="#f59e0b" 
          transparent 
          opacity={0.15} 
          metalness={1} 
          roughness={0} 
          emissive="#f59e0b"
          emissiveIntensity={0.5}
        />
        <Edges threshold={1} color="#fbbf24" />
      </mesh>

      {/* SHARP BLUE EDGES (OUTER) */}
      <mesh scale={1.01}>
        <dodecahedronGeometry args={[3.4, 0]} />
        <Edges threshold={1} color="#0ea5e9" />
      </mesh>

      {/* 3. INTERNAL CONTENT */}
      <DNAHelix />
      {dataSnippets.map((d, i) => (
        <InternalDataSnippet key={i} position={d.pos as [number, number, number]} text={d.text} />
      ))}

      {/* 4. PREMIUM FRONT BRANDING (MASSIVE 1:1) */}
      <group position={[0, 0, 4.2]} scale={1.8}>
        <Float speed={2.5} rotationIntensity={0.05} floatIntensity={0.1}>
          {/* Glowing Backboard (Circuitry/Hex) */}
          <mesh position={[0, 0, -0.2]} scale={1.2}>
            <planeGeometry args={[4, 2]} />
            <meshBasicMaterial 
              map={textures.circuitry} 
              transparent 
              opacity={0.4} 
              blending={THREE.AdditiveBlending} 
              color="#fbbf24" 
            />
          </mesh>
          
          {/* MAIN TEXT: Gold Base with Cyan Depth (Exact 1:1) */}
          <Text
            fontSize={1.2}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            position={[0, 0, 0.1]}
            letterSpacing={-0.02}
          >
            TSUE
          </Text>
          {/* Depth/Glow Layer */}
          <Text
            fontSize={1.21}
            color="#38bdf8"
            fillOpacity={0.8}
            anchorX="center"
            anchorY="middle"
            position={[0, 0, 0]}
          >
            TSUE
          </Text>
          {/* Specular/Reflection Layer */}
          <Text
            fontSize={1.2}
            color="#ffffff"
            fillOpacity={0.3}
            anchorX="center"
            anchorY="middle"
            position={[0, 0.02, 0.12]}
          >
            TSUE
          </Text>
        </Float>
        
        {/* Underline Bar */}
        <mesh position={[0, -0.75, 0.1]}>
          <planeGeometry args={[3.4, 0.04]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════
// 3. SATELLITE SYSTEM & BACKGROUND
// ═══════════════════════════════════════════

function SatelliteLeft({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.position.y += Math.sin(state.clock.elapsedTime) * 0.005;
    }
  });

  return (
    <group position={position} scale={1.8} ref={ref}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
        <Edges threshold={15} color="#38bdf8" />
      </mesh>
      {/* Detail Segments (Server Racks) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
          <mesh position={[0, 0, 1]}>
            <boxGeometry args={[0.3, 0.4, 0.2]} />
            <meshStandardMaterial color="#1e293b" />
            <mesh position={[0, 0, 0.11]}>
               <planeGeometry args={[0.2, 0.3]} />
               <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
            </mesh>
          </mesh>
        </group>
      ))}
      <group position={[0, 1.8, 0]} rotation={[-0.4, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.9, 16, 16, 0, Math.PI * 2, 0, 1.1]} />
          <meshStandardMaterial color="#64748b" side={THREE.DoubleSide} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2]} />
          <meshStandardMaterial color="#cbd5e1" metalness={1} />
        </mesh>
      </group>
      {/* Small orbiting ring */}
      <mesh rotation={[1.2, 0, 0]}>
        <torusGeometry args={[2.2, 0.015, 8, 100]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function SatelliteBottomRight({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = -state.clock.elapsedTime * 0.6;
  });

  return (
    <group position={position} scale={1.8}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={2} transparent opacity={0.6} />
      </mesh>
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.02, 8, 50]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>
    </group>
  );
}

function SatelliteTopRight({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = -state.clock.elapsedTime * 0.3;
  });

  return (
    <group position={position} scale={2.2}>
      <group ref={ref}>
        <mesh>
          <icosahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#1e1b4b" emissive="#38bdf8" emissiveIntensity={5} />
          <Edges threshold={1} color="#bae6fd" />
        </mesh>
        {/* Shard Cluster */}
        {Array.from({ length: 16 }).map((_, i) => {
            const phi = Math.acos(-1 + (2 * i) / 16);
            const theta = Math.sqrt(16 * Math.PI) * phi;
            const r = 1.6 + Math.random() * 0.4;
            return (
              <mesh 
                key={i} 
                position={[
                  Math.sin(phi) * Math.cos(theta) * r, 
                  Math.sin(phi) * Math.sin(theta) * r, 
                  Math.cos(phi) * r
                ]} 
                rotation={[Math.random(), Math.random(), Math.random()]}
              >
                <octahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={3} />
              </mesh>
            );
        })}
      </group>
    </group>
  );
}

function GlobalOrbits({ mouse }: { mouse: React.MutableRefObject<THREE.Vector2> }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = -mouse.current.y * 0.05;
      groupRef.current.rotation.y = mouse.current.x * 0.05;
    }
  });

  const textInner = "ТОШКЕНТ ДАВЛАТ ИҚТИСОДИЁТ УНИВЕРСИТЕТИ • ".split("");
  const textOuter = "TSUE STUDY PLATFORM • ".split("");

  return (
    <group ref={groupRef}>
      {/* 1. INNER CYRILLIC RING */}
      <group rotation={[Math.PI / 2.1, 0, 0]}>
        {textInner.map((char, i) => {
          const angle = (i / textInner.length) * Math.PI * 2;
          const radius = 9.5;
          return (
            <Text
              key={i}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
              rotation={[0, 0, angle + Math.PI / 2]}
              fontSize={0.42}
              fontWeight="black"
              color="#38bdf8"
            >
              {char}
            </Text>
          );
        })}
        <mesh>
          <torusGeometry args={[9.5, 0.04, 16, 120]} />
          <meshStandardMaterial 
            color="#38bdf8" 
            emissive="#38bdf8" 
            emissiveIntensity={3} 
            transparent 
            opacity={0.2} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* 2. OUTER ENGLISH RING */}
      <group rotation={[Math.PI / 1.9, 0, 0.2]}>
        {textOuter.map((char, i) => {
          const angle = (i / textOuter.length) * Math.PI * 2;
          const radius = 11.5;
          return (
            <Text
              key={i}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
              rotation={[0, 0, angle + Math.PI / 2]}
              fontSize={0.48}
              fontWeight="black"
              color="#bae6fd"
            >
              {char}
            </Text>
          );
        })}
        <mesh>
          <torusGeometry args={[11.5, 0.03, 16, 100]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// ═══════════════════════════════════════════
// 4. MAIN SCENE
// ═══════════════════════════════════════════

export default function DynamicLogo3D() {
  const mouse = useRef(new THREE.Vector2(0, 0));
  console.log("3D Scene Initialized");

  useEffect(() => {
    const handleMove = (x: number, y: number) => {
      mouse.current.x = (x / window.innerWidth) * 2 - 1;
      mouse.current.y = -(y / window.innerHeight) * 2 + 1;
    };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 35], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#00030a']} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={1.5} color="#f59e0b" />
          
          <group>
            <FacetedCrystal mouse={mouse} />
            <GlobalOrbits mouse={mouse} />
            <FloatingCode />
          </group>
          
          <Sparkles count={500} scale={40} size={1} speed={0.4} opacity={0.4} color="#bae6fd" />
          <Sparkles count={200} scale={15} size={3} speed={0.6} opacity={0.6} color="#fbbf24" />
        </Suspense>
      </Canvas>
    </div>
  );
}
