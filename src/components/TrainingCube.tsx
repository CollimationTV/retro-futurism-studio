import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface EarthProps {
  isActive: boolean;
  pushIntensity: number;
  transformProgress: number; // 0-1, how utopian the Earth is
}

function TransformingEarth({ isActive, pushIntensity, transformProgress }: EarthProps) {
  const groupRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // Colors interpolation
  const dystopianLand = new THREE.Color("#2d1f1f"); // Dark brown/dead
  const dystopianOcean = new THREE.Color("#1a1a2e"); // Dark polluted
  const dystopianAtmosphere = new THREE.Color("#4a3728"); // Smoggy brown
  
  const utopianLand = new THREE.Color("#228B22"); // Forest green
  const utopianOcean = new THREE.Color("#006994"); // Beautiful blue
  const utopianAtmosphere = new THREE.Color("#87CEEB"); // Clear sky blue
  
  // Create procedural Earth shader
  const earthShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      transform: { value: 0 },
      dystopianLand: { value: dystopianLand },
      dystopianOcean: { value: dystopianOcean },
      utopianLand: { value: utopianLand },
      utopianOcean: { value: utopianOcean },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float transform;
      uniform vec3 dystopianLand;
      uniform vec3 dystopianOcean;
      uniform vec3 utopianLand;
      uniform vec3 utopianOcean;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      // Simplex noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
               
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      
      void main() {
        // Create continent pattern
        float continent = snoise(vPosition * 2.0) * 0.5 + 0.5;
        continent += snoise(vPosition * 4.0) * 0.25;
        continent = smoothstep(0.4, 0.6, continent);
        
        // Interpolate colors based on transform progress
        vec3 landColor = mix(dystopianLand, utopianLand, transform);
        vec3 oceanColor = mix(dystopianOcean, utopianOcean, transform);
        
        // Add detail to utopian land (forests, rivers)
        if (transform > 0.0 && continent > 0.5) {
          float forest = snoise(vPosition * 8.0 + time * 0.1) * 0.5 + 0.5;
          float river = smoothstep(0.48, 0.52, snoise(vPosition * 6.0));
          
          vec3 forestGreen = vec3(0.1, 0.5, 0.2);
          vec3 riverBlue = vec3(0.2, 0.6, 0.8);
          
          landColor = mix(landColor, forestGreen, forest * transform * 0.5);
          landColor = mix(landColor, riverBlue, river * transform);
        }
        
        // Add pollution/clearing effect
        float pollution = snoise(vPosition * 3.0 + vec3(0.0, time * 0.05, 0.0));
        float pollutionMask = (1.0 - transform) * smoothstep(-0.2, 0.2, pollution);
        
        vec3 baseColor = mix(oceanColor, landColor, continent);
        
        // Add dystopian effects (fires, dead zones)
        if (transform < 1.0) {
          float fires = smoothstep(0.7, 0.8, snoise(vPosition * 10.0 + time * 0.5));
          vec3 fireColor = vec3(0.8, 0.2, 0.0);
          baseColor = mix(baseColor, fireColor, fires * (1.0 - transform) * continent);
          
          // Pollution haze
          vec3 pollutionColor = vec3(0.3, 0.25, 0.2);
          baseColor = mix(baseColor, pollutionColor, pollutionMask * 0.3);
        }
        
        // Lighting
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(dot(vNormal, lightDir), 0.0);
        float ambient = 0.3;
        
        vec3 finalColor = baseColor * (ambient + diff * 0.7);
        
        // Add bloom for utopian state
        finalColor += vec3(0.1, 0.2, 0.1) * transform * 0.2;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Gentle rotation
    groupRef.current.rotation.y += delta * 0.15;
    
    // Update shader uniforms
    if (earthRef.current) {
      const material = earthRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = state.clock.elapsedTime;
      material.uniforms.transform.value = transformProgress;
    }
    
    // Clouds rotation
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.05;
    }
    
    // Push effect - gentle pulse
    if (isActive) {
      const pulse = 1 + pushIntensity * 0.1;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, pulse, delta * 3));
    } else {
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 1, delta * 2));
    }
    
    // Atmosphere color transition
    if (atmosphereRef.current) {
      const material = atmosphereRef.current.material as THREE.MeshBasicMaterial;
      const currentColor = new THREE.Color().lerpColors(dystopianAtmosphere, utopianAtmosphere, transformProgress);
      material.color = currentColor;
      material.opacity = 0.15 + transformProgress * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          {...earthShader}
        />
      </mesh>
      
      {/* Clouds layer - more visible in utopian state */}
      <mesh ref={cloudsRef} scale={1.02}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1 + transformProgress * 0.2}
          depthWrite={false}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={dystopianAtmosphere}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Outer glow - stronger in utopian */}
      <mesh scale={1.25}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={transformProgress > 0.5 ? "#4da6ff" : "#8B4513"}
          transparent
          opacity={0.05 + transformProgress * 0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function ProgressRing({ progress, totalRounds, currentRound }: { progress: number; totalRounds: number; currentRound: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * 0.3;
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
      {/* Background ring */}
      <mesh>
        <ringGeometry args={[1.4, 1.5, 64]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Progress segments */}
      {Array.from({ length: totalRounds }).map((_, i) => {
        const segmentAngle = (Math.PI * 2) / totalRounds;
        const startAngle = i * segmentAngle - Math.PI / 2;
        const isComplete = i < currentRound;
        const isCurrent = i === currentRound;
        
        return (
          <mesh key={i} rotation={[0, 0, startAngle]}>
            <ringGeometry args={[1.4, 1.5, 16, 1, 0, segmentAngle - 0.05]} />
            <meshBasicMaterial
              color={isComplete ? "#22c55e" : isCurrent ? "#3b82f6" : "#1a1a1a"}
              transparent
              opacity={isComplete ? 0.9 : isCurrent ? 0.6 + Math.sin(Date.now() * 0.005) * 0.2 : 0.2}
              side={THREE.DoubleSide}
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
  pushRound?: number;
  totalRounds?: number;
}

export const TrainingCube = ({ 
  isActive, 
  progress, 
  pushIntensity = 0,
  pushRound = 0,
  totalRounds = 4
}: TrainingCubeProps) => {
  // Calculate transform progress (0-1) based on completed rounds
  const transformProgress = pushRound / totalRounds;
  
  return (
    <div className="w-72 h-72 mx-auto">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={0.8} />
        <pointLight position={[-5, -3, -5]} intensity={0.3} color="#ff6600" />
        
        <TransformingEarth 
          isActive={isActive} 
          pushIntensity={pushIntensity}
          transformProgress={transformProgress}
        />
        <ProgressRing 
          progress={progress} 
          totalRounds={totalRounds}
          currentRound={pushRound}
        />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
};
