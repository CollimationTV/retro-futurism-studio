import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface EarthProps {
  isActive: boolean;
  pushIntensity: number;
}

function HolographicEarth({ isActive, pushIntensity }: EarthProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const targetScale = 1 + pushIntensity * 0.3;
  
  // Create continent-like pattern vertices
  const continentLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    // Simplified continent outlines as latitude/longitude paths
    const addLatitude = (lat: number, segments: number = 64) => {
      const line: THREE.Vector3[] = [];
      const phi = (90 - lat) * (Math.PI / 180);
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        line.push(new THREE.Vector3(x, y, z));
      }
      lines.push(line);
    };
    
    const addLongitude = (lng: number, segments: number = 32) => {
      const line: THREE.Vector3[] = [];
      const theta = lng * (Math.PI / 180);
      for (let i = 0; i <= segments; i++) {
        const phi = (i / segments) * Math.PI;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        line.push(new THREE.Vector3(x, y, z));
      }
      lines.push(line);
    };
    
    // Add latitude lines
    [-60, -30, 0, 30, 60].forEach(lat => addLatitude(lat));
    // Add longitude lines
    [0, 30, 60, 90, 120, 150, 180, -150, -120, -90, -60, -30].forEach(lng => addLongitude(lng));
    
    return lines;
  }, []);
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Gentle idle rotation
    groupRef.current.rotation.y += delta * 0.2;
    
    // Push effect - scale
    if (isActive) {
      const currentScale = groupRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3);
      groupRef.current.scale.setScalar(newScale);
    } else {
      const currentScale = groupRef.current.scale.x;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(currentScale, 1, delta * 2));
    }
    
    // Hologram flicker effect
    if (wireframeRef.current) {
      const material = wireframeRef.current.material as THREE.MeshBasicMaterial;
      const flicker = 0.6 + Math.sin(state.clock.elapsedTime * 10) * 0.1 + Math.random() * 0.05;
      material.opacity = isActive ? Math.min(1, flicker + pushIntensity * 0.3) : flicker;
    }
    
    // Glow pulse
    if (glowRef.current) {
      const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;
      const pulse = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowMaterial.opacity = isActive ? pulse + pushIntensity * 0.2 : pulse;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner glow sphere */}
      <mesh ref={glowRef} scale={0.95}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Main wireframe sphere */}
      <mesh ref={wireframeRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#00ffff"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Grid lines for hologram effect */}
      {continentLines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={line.length}
              array={new Float32Array(line.flatMap(v => [v.x, v.y, v.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ff88" transparent opacity={0.4} />
        </line>
      ))}
      
      {/* Outer glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.15, 64]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Scan line effect */}
      <mesh>
        <sphereGeometry args={[1.02, 32, 32]} />
        <shaderMaterial
          transparent
          uniforms={{
            time: { value: 0 },
            color: { value: new THREE.Color("#00ffff") }
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            uniform vec3 color;
            varying vec2 vUv;
            void main() {
              float scanLine = step(0.98, fract(vUv.y * 20.0 + time * 0.5));
              gl_FragColor = vec4(color, scanLine * 0.3);
            }
          `}
        />
      </mesh>
    </group>
  );
}

function ParticleRing({ isActive, progress }: { isActive: boolean; progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = 32;
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * 0.5;
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 2 + (isActive ? progress / 100 * 0.5 : 0);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isLit = isActive && (i / particleCount) * 100 <= progress;
        
        return (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={isLit ? "#22c55e" : "#374151"}
              emissive={isLit ? "#22c55e" : "#000000"}
              emissiveIntensity={isLit ? 0.8 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

interface TrainingCubeProps {
  isActive: boolean;
  progress: number;
  pushIntensity?: number;
}

export const TrainingCube = ({ isActive, progress, pushIntensity = 0 }: TrainingCubeProps) => {
  return (
    <div className="w-64 h-64 mx-auto">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00ff88" />
        
        <HolographicEarth isActive={isActive} pushIntensity={pushIntensity} />
        <ParticleRing isActive={isActive} progress={progress} />
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};
