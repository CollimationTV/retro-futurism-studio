import { useEffect, useState } from "react";

interface OrbitalExcitementRingProps {
  excitement: number; // 0-1
  color: string;
  radius: number; // Base radius in pixels
  speed: number; // Rotation speed in seconds per revolution
  headsetId: string;
}

export const OrbitalExcitementRing = ({
  excitement,
  color,
  radius,
  speed,
  headsetId
}: OrbitalExcitementRingProps) => {
  const [rotation, setRotation] = useState(0);
  
  // Continuous rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 360 / (speed * 20)) % 360); // 50ms interval = 20 fps
    }, 50);
    return () => clearInterval(interval);
  }, [speed]);
  
  const size = radius * 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Calculate indicator position based on excitement
  const indicatorAngle = excitement * 360;
  const indicatorX = centerX + (radius - 10) * Math.cos((indicatorAngle - 90) * Math.PI / 180);
  const indicatorY = centerY + (radius - 10) * Math.sin((indicatorAngle - 90) * Math.PI / 180);
  
  const opacity = 0.3 + (excitement * 0.7);
  const brightness = excitement * 100;
  
  return (
    <div 
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.05s linear'
      }}
    >
      <svg width={size} height={size}>
        <defs>
          <filter id={`glow-${headsetId}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Orbital ring */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={radius - 10}
          ry={radius - 10}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity={opacity}
          filter={`url(#glow-${headsetId})`}
          style={{
            filter: `brightness(${100 + brightness}%)`
          }}
        />
        
        {/* Particle trail */}
        {[0, 1, 2, 3, 4].map((i) => {
          const trailAngle = indicatorAngle - (i * 15);
          const trailX = centerX + (radius - 10) * Math.cos((trailAngle - 90) * Math.PI / 180);
          const trailY = centerY + (radius - 10) * Math.sin((trailAngle - 90) * Math.PI / 180);
          const trailOpacity = (1 - i * 0.2) * excitement;
          
          return (
            <circle
              key={i}
              cx={trailX}
              cy={trailY}
              r={2 - i * 0.3}
              fill={color}
              opacity={trailOpacity}
            />
          );
        })}
        
        {/* Indicator dot */}
        <circle
          cx={indicatorX}
          cy={indicatorY}
          r={5 + excitement * 3}
          fill={color}
          filter={`url(#glow-${headsetId})`}
          style={{
            animation: excitement > 0.7 ? 'pulse 0.5s ease-in-out infinite' : undefined
          }}
        />
      </svg>
      
      {/* Headset label */}
      <div 
        className="absolute text-xs font-mono font-bold"
        style={{
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(-${rotation}deg)`,
          color: color,
          opacity: 0.8
        }}
      >
        {headsetId.substring(0, 4)}
      </div>
    </div>
  );
};
