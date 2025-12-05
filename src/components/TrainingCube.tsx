import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CubeProps {
  isActive: boolean;
  pushIntensity: number;
}

function Cube({ isActive, pushIntensity }: CubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetScale = 1 + pushIntensity * 0.5;
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Gentle idle rotation
    meshRef.current.rotation.x += delta * 0.3;
    meshRef.current.rotation.y += delta * 0.4;
    
    // Push effect - scale and move forward
    if (isActive) {
      const currentScale = meshRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3);
      meshRef.current.scale.setScalar(newScale);
      
      // Glow intensity based on push
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = THREE.MathUtils.lerp(
        material.emissiveIntensity,
        0.3 + pushIntensity * 0.7,
        delta * 5
      );
    } else {
      // Return to normal
      const currentScale = meshRef.current.scale.x;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(currentScale, 1, delta * 2));
      
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0.1, delta * 3);
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial
        color="#60a5fa"
        emissive="#3b82f6"
        emissiveIntensity={0.1}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
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
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <Cube isActive={isActive} pushIntensity={pushIntensity} />
        <ParticleRing isActive={isActive} progress={progress} />
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};
