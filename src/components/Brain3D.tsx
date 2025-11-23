import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface BrainNodeProps {
  position: [number, number, number];
  excitement: number;
}

const BrainNode = ({ position, excitement }: BrainNodeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.5 + 0.5;
      meshRef.current.scale.setScalar(0.5 + excitement * 0.5 + pulse * 0.2);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.05, 16, 16]} position={position}>
      <meshStandardMaterial
        color={`hsl(180, 100%, ${50 + excitement * 30}%)`}
        emissive={`hsl(180, 100%, ${40 + excitement * 40}%)`}
        emissiveIntensity={0.5 + excitement * 1.5}
      />
    </Sphere>
  );
};

interface BrainProps {
  excitement: number;
}

const Brain = ({ excitement }: BrainProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate brain-like node positions
  const nodes = useMemo(() => {
    const positions: [number, number, number][] = [];
    const radius = 2;
    
    // Create nodes in a brain-like shape
    for (let i = 0; i < 80; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      // Slightly flatten to make it more brain-like
      const r = radius * (0.7 + Math.random() * 0.3);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.8; // Flatten Y
      const z = r * Math.cos(phi) * 0.9;
      
      positions.push([x, y, z]);
    }
    return positions;
  }, []);

  // Generate connections between nearby nodes
  const connections = useMemo(() => {
    const conns: [number, number][] = [];
    const maxDistance = 1.2;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const [x1, y1, z1] = nodes[i];
        const [x2, y2, z2] = nodes[j];
        const distance = Math.sqrt(
          Math.pow(x2 - x1, 2) + 
          Math.pow(y2 - y1, 2) + 
          Math.pow(z2 - z1, 2)
        );
        
        if (distance < maxDistance) {
          conns.push([i, j]);
        }
      }
    }
    return conns;
  }, [nodes]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Brain nodes */}
      {nodes.map((pos, i) => (
        <BrainNode key={i} position={pos} excitement={excitement} />
      ))}
      
      {/* Neural connections */}
      {connections.map(([i, j], idx) => (
        <Line
          key={idx}
          points={[nodes[i], nodes[j]]}
          color={`hsl(180, 100%, ${30 + excitement * 40}%)`}
          lineWidth={1}
          opacity={0.2 + excitement * 0.5}
          transparent
        />
      ))}
      
      {/* Ambient light for glow */}
      <pointLight
        position={[0, 0, 0]}
        intensity={excitement * 2}
        color="#00ffff"
        distance={10}
      />
    </group>
  );
};

interface Brain3DProps {
  excitement?: number;
  className?: string;
}

export const Brain3D = ({ excitement = 0, className = '' }: Brain3DProps) => {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Brain excitement={excitement} />
      </Canvas>
    </div>
  );
};
