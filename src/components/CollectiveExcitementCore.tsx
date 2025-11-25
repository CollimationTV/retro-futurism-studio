import { useEffect, useState } from "react";

interface CollectiveExcitementCoreProps {
  averageExcitement: number; // 0-1
  size?: number;
}

export const CollectiveExcitementCore = ({ 
  averageExcitement, 
  size = 400 
}: CollectiveExcitementCoreProps) => {
  const [rotation, setRotation] = useState(0);
  
  // Continuous rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  // White glow that intensifies with excitement
  const getColor = () => {
    const opacity = 0.5 + (averageExcitement * 0.5); // 0.5 to 1.0
    const white = `rgba(255, 255, 255, ${opacity})`;
    const lightGray = `rgba(242, 242, 242, ${opacity})`;
    return { from: white, to: lightGray };
  };
  
  const colors = getColor();
  const percentage = Math.round(averageExcitement * 100);
  const pulseScale = 1 + (averageExcitement * 0.1);
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div 
        className="absolute inset-0 rounded-full blur-xl transition-all duration-500"
        style={{
          background: `radial-gradient(circle, ${colors.from}40, transparent 70%)`,
          transform: `scale(${pulseScale})`,
          animation: 'pulse 2s ease-in-out infinite'
        }}
      />
      
      {/* Main radial meter */}
      <svg width={size} height={size} className="absolute">
        <defs>
          <linearGradient id="plasmaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: colors.from, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: colors.to, stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 20}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          opacity="0.3"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 20}
          fill="none"
          stroke="url(#plasmaGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${averageExcitement * (2 * Math.PI * (size / 2 - 20))} ${2 * Math.PI * (size / 2 - 20)}`}
          transform={`rotate(-90 ${size / 2} ${size / 2}) rotate(${rotation} ${size / 2} ${size / 2})`}
          filter="url(#glow)"
          className="transition-all duration-300"
        />
        
        {/* Particle effect circles */}
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            cx={size / 2 + Math.cos((rotation + i * 90) * Math.PI / 180) * (size / 2 - 30)}
            cy={size / 2 + Math.sin((rotation + i * 90) * Math.PI / 180) * (size / 2 - 30)}
            r={3}
            fill={colors.from}
            opacity={averageExcitement * 0.6}
          />
        ))}
      </svg>
      
      {/* Center content */}
      <div className="relative z-10 text-center">
        <div className="text-6xl font-bold" style={{ color: colors.from }}>
          {percentage}%
        </div>
        <div className="text-sm uppercase tracking-wider text-muted-foreground mt-2">
          Collective Energy
        </div>
      </div>
    </div>
  );
};
