import { useState, useEffect } from "react";

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
  id,
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
      <div 
        className={`
          relative overflow-hidden transition-all duration-500 w-64 h-64
          ${isSelected ? 'opacity-0 scale-150' : 'opacity-100'}
        `}
        style={{
          transform: isActivating ? `scale(${1 + excitementProgress * 0.15})` : undefined
        }}
      >
        {/* Main image container with grid overlay */}
        <div className="relative w-full h-full">
          {/* Artwork image */}
          <img
            src={url}
            alt={title}
            className="w-full h-full object-cover"
            style={{
              filter: isActivating ? 'brightness(1.3) saturate(1.2)' : 'brightness(0.8)'
            }}
          />
          
          {/* Grid overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 255, 255, 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 255, 255, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              opacity: isFocusedByAny ? 1 : 0.3
            }}
          />
          
          {/* Scanline effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(transparent 50%, rgba(0, 255, 255, 0.03) 50%)',
              backgroundSize: '100% 4px'
            }}
          />
          
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary" />
          
          {/* Focus indicator glow */}
          {isFocusedByAny && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `
                  inset 0 0 40px ${focusColors[0]}40,
                  0 0 40px ${focusColors[0]}60,
                  0 0 80px ${focusColors[0]}40
                `,
                border: `2px solid ${focusColors[0]}`
              }}
            />
          )}
          
          {/* Technical data overlay - top */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start font-mono text-[10px] text-primary pointer-events-none">
            <div className="bg-black/70 px-2 py-1 backdrop-blur-sm">
              <div className="text-primary/80">IMG_{String(id).padStart(3, '0')}</div>
            </div>
            <div className="bg-black/70 px-2 py-1 backdrop-blur-sm">
              <div className="text-primary/80">Z:{zIndex}</div>
            </div>
          </div>
          
          {/* Title and progress - bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pointer-events-none">
            <div className="font-mono">
              <div className="text-xs text-primary/90 mb-1 uppercase tracking-wider">
                {title}
              </div>
              
              {/* Progress bar */}
              {isActivating && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-primary/70">
                    <span>LOCK</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200"
                      style={{ 
                        width: `${Math.min(progressPercentage, 100)}%`,
                        boxShadow: `0 0 8px ${focusColors[0] || 'hsl(var(--primary))'}`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Center lock indicator when activating */}
          {isActivating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Outer ring */}
                <svg className="w-32 h-32 absolute" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={focusColors[0] || 'hsl(var(--primary))'}
                    strokeWidth="2"
                    strokeDasharray={`${progressPercentage * 2.83} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-300"
                    style={{
                      filter: `drop-shadow(0 0 12px ${focusColors[0] || 'hsl(var(--primary))'})`
                    }}
                  />
                </svg>
                
                {/* Center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-primary transform -translate-x-1/2" />
                    <div className="absolute bottom-0 left-1/2 w-0.5 h-4 bg-primary transform -translate-x-1/2" />
                    <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-primary transform -translate-y-1/2" />
                    <div className="absolute right-0 top-1/2 w-4 h-0.5 bg-primary transform -translate-y-1/2" />
                  </div>
                </div>
                
                {/* Timer */}
                <div 
                  className="text-2xl font-bold absolute inset-0 flex items-center justify-center font-mono"
                  style={{ 
                    color: focusColors[0] || 'hsl(var(--primary))',
                    textShadow: `0 0 20px ${focusColors[0] || 'hsl(var(--primary))'}`
                  }}
                >
                  {Math.ceil((1 - excitementProgress / safeThreshold) * 8)}s
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Particle burst effect on selection */}
      {showBurst && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: focusColors[0] || 'hsl(var(--primary))',
                left: '50%',
                top: '50%',
                animation: `particle-burst 1.5s ease-out forwards`,
                animationDelay: `${i * 0.03}s`,
                transform: `rotate(${i * 18}deg) translateX(0)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
