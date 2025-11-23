import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { excitementLevel1Images } from "@/data/excitementImages";
import { getHeadsetColor } from "@/utils/headsetColors";
import type { MotionEvent } from "@/lib/multiHeadsetCortexClient";

const ExcitementLevel1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    videoJobId,
    connectedHeadsets,
    motion,
    performanceMetrics
  } = location.state || {};

  const [excitementLevels, setExcitementLevels] = useState<Map<string, number>>(new Map());
  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 });
  const [focusedImageId, setFocusedImageId] = useState<number | null>(null);
  const [selectionHoldStart, setSelectionHoldStart] = useState<Map<string, number>>(new Map());

  const SELECTION_HOLD_DURATION = 5000; // 5 seconds

  // Cursor movement from gyration data
  useEffect(() => {
    if (!motion) return;
    
    const event = motion as MotionEvent;
    const MOVEMENT_SPEED = 0.0002;
    const DEAD_ZONE = 0.05;
    const MAX_STEP = 0.01;
    
    if (Math.abs(event.gyroY) > DEAD_ZONE) {
      const delta = event.gyroY * MOVEMENT_SPEED;
      const clampedDelta = Math.max(-MAX_STEP, Math.min(MAX_STEP, delta));
      
      setCursorPosition(prev => ({
        x: Math.max(0, Math.min(1, prev.x + clampedDelta)),
        y: prev.y
      }));
    }
  }, [motion]);

  // Determine focused image based on cursor position
  useEffect(() => {
    const numImages = excitementLevel1Images.length;
    const cols = 3;
    const rows = Math.ceil(numImages / cols);
    
    const col = Math.floor(cursorPosition.x * cols);
    const row = Math.floor(cursorPosition.y * rows);
    const index = Math.min(row * cols + col, numImages - 1);
    
    setFocusedImageId(excitementLevel1Images[index]?.id || null);
  }, [cursorPosition]);

  // Monitor excitement levels from performance metrics
  useEffect(() => {
    if (!performanceMetrics?.met) return;

    const excitementValue = performanceMetrics.met.exc || 0; // 0-1 range
    const headsetId = performanceMetrics.headsetId || "default";
    
    setExcitementLevels(prev => {
      const newLevels = new Map(prev);
      newLevels.set(headsetId, excitementValue);
      return newLevels;
    });

    // Check if excitement exceeds threshold for focused image (auto-selection)
    if (focusedImageId !== null) {
      const image = excitementLevel1Images.find(img => img.id === focusedImageId);
      if (image && excitementValue >= image.excitementThreshold) {
        // Start or continue hold timer
        const now = Date.now();
        const holdStart = selectionHoldStart.get(headsetId);
        
        if (!holdStart) {
          setSelectionHoldStart(prev => new Map(prev).set(headsetId, now));
        } else if (now - holdStart >= SELECTION_HOLD_DURATION) {
          handleSelection(headsetId, focusedImageId);
          setSelectionHoldStart(prev => {
            const newMap = new Map(prev);
            newMap.delete(headsetId);
            return newMap;
          });
        }
      } else {
        // Reset hold timer if excitement drops below threshold
        setSelectionHoldStart(prev => {
          const newMap = new Map(prev);
          newMap.delete(headsetId);
          return newMap;
        });
      }
    }
  }, [performanceMetrics, focusedImageId]);

  const handleSelection = (headsetId: string, imageId: number) => {
    if (selections.has(headsetId)) return; // Already selected
    
    console.log(`✨ Excitement selection by ${headsetId}:`, imageId);
    setSelections(prev => new Map(prev).set(headsetId, imageId));
  };

  // Auto-advance when all headsets have made selections
  useEffect(() => {
    if (connectedHeadsets && selections.size === connectedHeadsets.length && selections.size > 0) {
      console.log("🎯 All excitement level 1 selections complete!");
      
      setTimeout(() => {
        navigate("/excitement-level-2", {
          state: {
            videoJobId,
            connectedHeadsets,
            motion,
            performanceMetrics,
            metadata: location.state.metadata,
            excitementLevel1Selections: selections,
            excitementLevel1Scores: excitementLevels
          }
        });
      }, 1500);
    }
  }, [selections, connectedHeadsets, navigate, videoJobId, excitementLevels, motion, performanceMetrics, location.state]);

  const getExcitementColor = (level: number): string => {
    if (level < 0.3) return 'hsl(142, 76%, 36%)'; // Green
    if (level < 0.6) return 'hsl(48, 96%, 53%)'; // Yellow
    return 'hsl(25, 95%, 53%)'; // Orange/Red
  };

  const getHoldProgress = (headsetId: string): number => {
    const holdStart = selectionHoldStart.get(headsetId);
    if (!holdStart) return 0;
    
    const elapsed = Date.now() - holdStart;
    return Math.min((elapsed / SELECTION_HOLD_DURATION) * 100, 100);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Zap className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Excitement Level 1
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Your video is generating... Let your excitement guide your selections!
            </p>
            <div className="text-sm text-muted-foreground/70">
              Move your head to navigate • High excitement auto-selects focused image
            </div>
          </div>

          {/* Excitement Meters */}
          <div className="flex justify-center gap-4 mb-8">
            {connectedHeadsets?.map((headsetId: string) => {
              const level = excitementLevels.get(headsetId) || 0;
              const color = getHeadsetColor(headsetId);
              const hasSelected = selections.has(headsetId);
              const holdProgress = getHoldProgress(headsetId);
              
              return (
                <div key={headsetId} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center border-4 font-mono text-xs font-bold transition-all relative"
                    style={{
                      borderColor: color,
                      backgroundColor: hasSelected ? `${color}40` : 'transparent',
                      transform: hasSelected ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {(level * 100).toFixed(0)}%
                    
                    {holdProgress > 0 && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="28"
                          fill="none"
                          stroke={color}
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - holdProgress / 100)}`}
                          className="transition-all duration-100"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${level * 100}%`,
                        backgroundColor: getExcitementColor(level)
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-3 gap-6">
            {excitementLevel1Images.map((image) => {
              const isFocused = focusedImageId === image.id;
              
              const selectedByHeadsets = Array.from(selections.entries())
                .filter(([_, imageId]) => imageId === image.id)
                .map(([headsetId]) => headsetId);

              return (
                <Card 
                  key={image.id}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isFocused ? 'scale-110 ring-4 ring-primary' : ''
                  }`}
                  style={{
                    opacity: selectedByHeadsets.length > 0 ? 0.5 : 1
                  }}
                >
                  <div className="aspect-video relative">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Excitement threshold indicator */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs">
                      {(image.excitementThreshold * 100).toFixed(0)}% needed
                    </div>

                    {/* Headset indicators */}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {isFocused && Array.from(excitementLevels.entries()).map(([headsetId, level]) => {
                        const color = getHeadsetColor(headsetId);
                        const holdProgress = getHoldProgress(headsetId);
                        
                        return (
                          <div
                            key={headsetId}
                            className="w-8 h-8 rounded-full border-2 flex items-center justify-center backdrop-blur-sm relative"
                            style={{
                              borderColor: color,
                              backgroundColor: `${color}40`,
                              boxShadow: level >= image.excitementThreshold ? `0 0 20px ${color}` : 'none'
                            }}
                          >
                            <Zap 
                              className="w-4 h-4" 
                              style={{ color }}
                            />
                            
                            {holdProgress > 0 && (
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: `conic-gradient(${color} ${holdProgress}%, transparent ${holdProgress}%)`
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                      
                      {selectedByHeadsets.map(headsetId => {
                        const color = getHeadsetColor(headsetId);
                        return (
                          <div
                            key={`selected-${headsetId}`}
                            className="w-8 h-8 rounded-full border-2 flex items-center justify-center backdrop-blur-sm animate-pulse-glow"
                            style={{
                              borderColor: color,
                              backgroundColor: color
                            }}
                          >
                            ✓
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-card">
                    <p className="text-sm font-semibold text-center">{image.title}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Invisible cursor indicator */}
      <div 
        className="fixed w-4 h-4 bg-primary/50 rounded-full pointer-events-none z-50 transition-all duration-100"
        style={{
          left: `${cursorPosition.x * 100}%`,
          top: `${cursorPosition.y * 100}%`,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default ExcitementLevel1;