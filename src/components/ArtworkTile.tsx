import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ArtworkTileProps {
  id: number;
  url: string;
  title: string;
  position: { x: number; y: number };
  scale: number;
  zIndex: number;
  excitementProgress: number; // 0-1, progress toward selection
  threshold: number;
  isSelected: boolean;
  isFocusedByAny: boolean;
  focusColors: string[]; // Array of colors for headsets focusing this tile
}

export const ArtworkTile = ({
  url,
  title,
  position,
  scale,
  zIndex,
  excitementProgress,
  threshold,
  isSelected,
  isFocusedByAny,
  focusColors
}: ArtworkTileProps) => {
  const [showBurst, setShowBurst] = useState(false);
  
  useEffect(() => {
    if (isSelected) {
      setShowBurst(true);
    }
  }, [isSelected]);
  
  const safeThreshold = threshold > 0 ? threshold : 1;
  const progressPercentage = excitementProgress * 100 / safeThreshold;
  const isActivating = excitementProgress > 0;
  
  return (
    <div
      className="absolute transition-all duration-500"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        zIndex: isActivating ? zIndex + 100 : zIndex,
      }}
    >
      <Card 
        className={`
          overflow-hidden transition-all duration-500 w-48 h-48
          ${isFocusedByAny ? 'border-2' : 'border'}
          ${isSelected ? 'opacity-0 scale-150' : 'opacity-100'}
        `}
        style={{
          borderColor: focusColors.length > 0 ? focusColors[0] : 'hsl(var(--border))',
          boxShadow: isFocusedByAny 
            ? `0 0 30px ${focusColors[0]}60, 0 0 60px ${focusColors[0]}30`
            : undefined,
          transform: isActivating ? `scale(${1 + excitementProgress * 0.1})` : undefined
        }}
      >
        <div className="relative w-full h-full">
          {/* Artwork image */}
          <img
            src={url}
            alt={title}
            className="w-full h-full object-cover"
          />
          
          {/* Threshold and progress indicator bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
            <div className="flex items-center gap-2">
              <div className="text-xs text-white/80 whitespace-nowrap">
                {Math.round(safeThreshold * 100)}% req.
              </div>
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 transition-all duration-200"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Activation progress ring */}
          {isActivating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-full h-full absolute" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke={focusColors[0] || 'hsl(var(--primary))'}
                  strokeWidth="4"
                  strokeDasharray={`${progressPercentage * 3.01} 301`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-300"
                  style={{
                    filter: 'drop-shadow(0 0 8px currentColor)'
                  }}
                />
              </svg>
              
              {/* Countdown text */}
              <div 
                className="text-4xl font-bold z-10"
                style={{ 
                  color: focusColors[0] || 'hsl(var(--primary))',
                  textShadow: '0 0 20px currentColor'
                }}
              >
                 {Math.ceil((1 - excitementProgress / safeThreshold) * 5)}
              </div>
            </div>
          )}
          
          {/* Title overlay */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-2">
            <p className="text-xs text-white font-semibold text-center">
              {title}
            </p>
          </div>
        </div>
      </Card>
      
      {/* Particle burst effect on selection */}
      {showBurst && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: focusColors[0] || 'hsl(var(--primary))',
                left: '50%',
                top: '50%',
                animation: `particle-burst 1s ease-out forwards`,
                animationDelay: `${i * 0.05}s`,
                transform: `rotate(${i * 30}deg) translateX(0)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
