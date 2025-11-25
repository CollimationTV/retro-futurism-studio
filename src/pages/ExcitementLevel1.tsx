import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Zap, Target } from "lucide-react";
import { excitementLevel1Images } from "@/data/excitementImages";
import { getHeadsetColor } from "@/utils/headsetColors";
import type { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";

// Selection parameters
const PUSH_POWER_THRESHOLD = 0.3;
const PUSH_HOLD_TIME_MS = 8000;

const ExcitementLevel1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    videoJobId,
    connectedHeadsets,
    mentalCommand,
    motionEvent
  } = location.state || {};

  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [focusedImages, setFocusedImages] = useState<Map<string, number>>(new Map());
  const [pushProgress, setPushProgress] = useState<Map<string, number>>(new Map());
  const [isPushing, setIsPushing] = useState<Map<string, boolean>>(new Map());
  
  // Gyro calibration per headset
  const gyroRanges = useRef<Map<string, { min: number; max: number }>>(new Map());
  const pushStartTimes = useRef<Map<string, number>>(new Map());

  // Gyro-based cursor navigation
  useEffect(() => {
    if (!motionEvent) return;
    
    const event = motionEvent as MotionEvent;
    const headsetId = event.headsetId;
    
    // Skip if already selected
    if (selections.has(headsetId)) return;
    
    // Auto-calibrate gyro range
    const currentRange = gyroRanges.current.get(headsetId) || { min: event.gyroY, max: event.gyroY };
    currentRange.min = Math.min(currentRange.min, event.gyroY);
    currentRange.max = Math.max(currentRange.max, event.gyroY);
    gyroRanges.current.set(headsetId, currentRange);
    
    // Normalize gyroY to 0-1 range with smoothing
    const range = currentRange.max - currentRange.min;
    const normalized = range > 0.1 
      ? Math.max(0, Math.min(1, (event.gyroY - currentRange.min) / range))
      : 0.5;
    
    // Map to image index (0-8 for 3x3 grid)
    const imageIndex = Math.floor(normalized * excitementLevel1Images.length);
    const clampedIndex = Math.max(0, Math.min(excitementLevel1Images.length - 1, imageIndex));
    const imageId = excitementLevel1Images[clampedIndex].id;
    
    // Update focused image
    setFocusedImages(prev => {
      const updated = new Map(prev);
      updated.set(headsetId, imageId);
      return updated;
    });
    
    console.log(`🎯 Gyro navigation ${headsetId}: gyroY=${event.gyroY.toFixed(3)}, normalized=${normalized.toFixed(2)}, focus=${imageId}`);
  }, [motionEvent, selections]);

  // Handle PUSH command for selections
  useEffect(() => {
    if (!mentalCommand) return;
    
    const event = mentalCommand as MentalCommandEvent;
    const headsetId = event.headsetId;
    
    // Skip if already selected
    if (selections.has(headsetId)) return;
    
    const focusedImageId = focusedImages.get(headsetId);
    if (focusedImageId === undefined) return;
    
    // Detect PUSH command
    if (event.com === 'push' && event.pow >= PUSH_POWER_THRESHOLD) {
      // Start or continue PUSH hold
      if (!pushStartTimes.current.has(headsetId)) {
        pushStartTimes.current.set(headsetId, Date.now());
        console.log(`🟢 PUSH started by ${headsetId} on image ${focusedImageId}`);
      }
      
      setIsPushing(prev => new Map(prev).set(headsetId, true));
      
      // Calculate progress
      const startTime = pushStartTimes.current.get(headsetId)!;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / PUSH_HOLD_TIME_MS) * 100);
      
      setPushProgress(prev => new Map(prev).set(headsetId, progress));
      
      // Complete selection after hold duration
      if (elapsed >= PUSH_HOLD_TIME_MS) {
        console.log(`✅ Selection confirmed by ${headsetId}: image ${focusedImageId}`);
        setSelections(prev => new Map(prev).set(headsetId, focusedImageId));
        pushStartTimes.current.delete(headsetId);
        setIsPushing(prev => {
          const updated = new Map(prev);
          updated.delete(headsetId);
          return updated;
        });
      }
    } else {
      // PUSH released or below threshold - cancel
      if (pushStartTimes.current.has(headsetId)) {
        console.log(`🔴 PUSH cancelled by ${headsetId}`);
        pushStartTimes.current.delete(headsetId);
      }
      setIsPushing(prev => new Map(prev).set(headsetId, false));
      setPushProgress(prev => new Map(prev).set(headsetId, 0));
    }
  }, [mentalCommand, focusedImages, selections]);

  // Auto-advance when all headsets have made selections
  useEffect(() => {
    if (connectedHeadsets && selections.size === connectedHeadsets.length && selections.size > 0) {
      console.log("🎯 All Level 1 selections complete!");
      
      setTimeout(() => {
        navigate("/excitement-level-2", {
          state: {
            videoJobId,
            connectedHeadsets,
            mentalCommand,
            motionEvent,
            excitementLevel1Selections: selections
          }
        });
      }, 1500);
    }
  }, [selections, connectedHeadsets, navigate, videoJobId, mentalCommand, motionEvent]);

  return (
    <div className="min-h-screen relative">
      {/* Animated Brain Background */}
      <Brain3D excitement={0.5} className="opacity-20 z-0" />
      
      <Header />
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Target className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Level 1: Image Selection
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Tilt your head to navigate • Hold PUSH to select
            </p>
            <div className="text-sm text-muted-foreground/70">
              Your video is generating in the background...
            </div>
          </div>

          {/* Headset Status Indicators */}
          <div className="flex justify-center gap-4 mb-8">
            {connectedHeadsets?.map((headsetId: string) => {
              const color = getHeadsetColor(headsetId);
              const hasSelected = selections.has(headsetId);
              const progress = pushProgress.get(headsetId) || 0;
              const pushing = isPushing.get(headsetId) || false;
              
              return (
                <div key={headsetId} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center border-4 font-mono text-sm font-bold transition-all relative"
                    style={{
                      borderColor: color,
                      backgroundColor: hasSelected ? color : pushing ? `${color}20` : 'transparent',
                      transform: hasSelected ? 'scale(1.15)' : pushing ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: pushing ? `0 0 20px ${color}` : 'none'
                    }}
                  >
                    {hasSelected ? '✓' : pushing ? `${progress.toFixed(0)}%` : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {hasSelected ? 'Selected' : pushing ? 'Pushing...' : 'Ready'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-3 gap-6">
            {excitementLevel1Images.map((image) => {
              const focusedByHeadsets = Array.from(focusedImages.entries())
                .filter(([_, imageId]) => imageId === image.id)
                .map(([headsetId]) => headsetId);
              
              const selectedByHeadsets = Array.from(selections.entries())
                .filter(([_, imageId]) => imageId === image.id)
                .map(([headsetId]) => headsetId);
              
              const isFocused = focusedByHeadsets.length > 0;
              const isSelected = selectedByHeadsets.length > 0;

              return (
                <Card 
                  key={image.id}
                  className="relative overflow-hidden transition-all duration-200"
                  style={{
                    opacity: isSelected ? 0.5 : 1,
                    transform: isFocused ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isFocused ? '0 0 30px rgba(255, 255, 255, 0.3)' : 'none'
                  }}
                >
                  <div className="aspect-video relative">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-all duration-200"
                      style={{
                        filter: isFocused ? 'brightness(1.2)' : 'brightness(1)'
                      }}
                    />

                    {/* Focus indicators */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {focusedByHeadsets.map(headsetId => {
                        const color = getHeadsetColor(headsetId);
                        const progress = pushProgress.get(headsetId) || 0;
                        const pushing = isPushing.get(headsetId);
                        
                        return (
                          <div key={headsetId} className="relative">
                            <div
                              className="w-10 h-10 rounded-full border-3 flex items-center justify-center backdrop-blur-sm transition-all"
                              style={{
                                borderColor: color,
                                backgroundColor: pushing ? `${color}60` : `${color}30`,
                                boxShadow: pushing ? `0 0 20px ${color}` : `0 0 10px ${color}`
                              }}
                            >
                              <Target 
                                className="w-5 h-5" 
                                style={{ color }}
                              />
                            </div>
                            {pushing && (
                              <svg className="absolute inset-0 w-10 h-10 -rotate-90">
                                <circle
                                  cx="20"
                                  cy="20"
                                  r="18"
                                  fill="none"
                                  stroke={color}
                                  strokeWidth="3"
                                  strokeDasharray={`${(progress / 100) * 113} 113`}
                                  style={{ transition: 'stroke-dasharray 0.1s linear' }}
                                />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Selection indicators */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {selectedByHeadsets.map(headsetId => {
                        const color = getHeadsetColor(headsetId);
                        return (
                          <div
                            key={`selected-${headsetId}`}
                            className="w-10 h-10 rounded-full border-3 flex items-center justify-center backdrop-blur-sm"
                            style={{
                              borderColor: color,
                              backgroundColor: color,
                              boxShadow: `0 0 20px ${color}`
                            }}
                          >
                            <span className="text-lg">✓</span>
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

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default ExcitementLevel1;
