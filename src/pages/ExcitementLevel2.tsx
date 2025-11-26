import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Music, Target } from "lucide-react";
import { excitementLevel2Images } from "@/data/excitementImages";
import { getHeadsetColor } from "@/utils/headsetColors";
import { getSoundtrackByScore } from "@/data/soundtracks";
import type { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";
import { OneEuroFilter, applySensitivityCurve } from "@/utils/OneEuroFilter";

// Selection parameters
const PUSH_POWER_THRESHOLD = 0.3;
const PUSH_HOLD_TIME_MS = 4000;

const ExcitementLevel2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    videoJobId,
    connectedHeadsets,
    mentalCommand,
    motionEvent,
    excitementLevel1Selections
  } = location.state || {};

  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [focusedImages, setFocusedImages] = useState<Map<string, number>>(new Map());
  const [pushProgress, setPushProgress] = useState<Map<string, number>>(new Map());
  const [isPushing, setIsPushing] = useState<Map<string, boolean>>(new Map());
  
  // One Euro Filters for smooth cursor control (one per headset, per axis)
  const pitchFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  const rotationFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  const pushStartTimes = useRef<Map<string, number>>(new Map());
  
  // Cursor position calibration (center reference point)
  const centerPitch = useRef<Map<string, number>>(new Map());
  const centerRotation = useRef<Map<string, number>>(new Map());
  const SENSITIVITY = 15; // Base cursor sensitivity

  // Listen to live motion events from window
  useEffect(() => {
    const handleMotion = ((event: CustomEvent<MotionEvent>) => {
      const motionData = event.detail;
      const headsetId = motionData.headsetId;
      
      // Skip if already selected
      if (selections.has(headsetId)) return;
      
      // Initialize filters for this headset if not exists
      if (!pitchFilters.current.has(headsetId)) {
        pitchFilters.current.set(headsetId, new OneEuroFilter(1.0, 0.007, 1.0));
        rotationFilters.current.set(headsetId, new OneEuroFilter(1.0, 0.007, 1.0));
      }
      
      // Calibrate center position on first motion
      if (!centerPitch.current.has(headsetId)) {
        centerPitch.current.set(headsetId, motionData.pitch);
        centerRotation.current.set(headsetId, motionData.rotation);
        console.log(`🎯 Calibrated center for ${headsetId}: pitch=${motionData.pitch.toFixed(2)}°, rotation=${motionData.rotation.toFixed(2)}°`);
      }
      
      // Calculate relative angles from center
      const relativePitch = motionData.pitch - (centerPitch.current.get(headsetId) || 0);
      const relativeRotation = motionData.rotation - (centerRotation.current.get(headsetId) || 0);
      
      // Apply One Euro Filter for smooth cursor movement
      const smoothPitch = pitchFilters.current.get(headsetId)!.filter(relativePitch, motionData.time);
      const smoothRotation = rotationFilters.current.get(headsetId)!.filter(relativeRotation, motionData.time);
      
      // Apply sensitivity curves for natural mouse feel
      const scaledPitch = applySensitivityCurve(smoothPitch, 1.0, 3.0, 20, 15);
      const scaledRotation = applySensitivityCurve(smoothRotation, 1.0, 3.0, 20, 15);
      
      // Map rotation (X axis) to horizontal image position
      const normalizedX = (scaledRotation * SENSITIVITY) / 180;
      const clampedX = Math.max(-1, Math.min(1, normalizedX));
      
      // Map to grid position (3 columns)
      const gridX = Math.floor((clampedX + 1) / 2 * 3);
      const gridCol = Math.max(0, Math.min(2, gridX));
      
      // Use middle row
      const gridRow = 1;
      
      // Calculate image index
      const imageIndex = gridRow * 3 + gridCol;
      const clampedIndex = Math.max(0, Math.min(excitementLevel2Images.length - 1, imageIndex));
      const imageId = excitementLevel2Images[clampedIndex].id;
      
      // Update focused image
      const currentFocus = focusedImages.get(headsetId);
      if (currentFocus !== imageId) {
        setFocusedImages(prev => {
          const updated = new Map(prev);
          updated.set(headsetId, imageId);
          return updated;
        });
      }
    }) as EventListener;

    window.addEventListener('motion-event', handleMotion);
    return () => window.removeEventListener('motion-event', handleMotion);
  }, []);

  // Listen to live mental command events from window
  useEffect(() => {
    const handleMentalCommand = ((event: CustomEvent<MentalCommandEvent>) => {
      const commandData = event.detail;
      const headsetId = commandData.headsetId;
    
      // Skip if already selected
      if (selections.has(headsetId)) return;
      
      const focusedImageId = focusedImages.get(headsetId);
      if (focusedImageId === undefined) return;
      
      // Detect PUSH command
      if (commandData.com === 'push' && commandData.pow >= PUSH_POWER_THRESHOLD) {
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
    }) as EventListener;

    window.addEventListener('mental-command', handleMentalCommand);
    return () => window.removeEventListener('mental-command', handleMentalCommand);
  }, []);

  // Navigate to Level 3 when all selections complete
  useEffect(() => {
    if (connectedHeadsets && selections.size === connectedHeadsets.length && selections.size > 0) {
      console.log("🎯 All Level 2 selections complete!");
      
      setTimeout(() => {
        navigate("/excitement-level-3", {
          state: {
            videoJobId,
            connectedHeadsets,
            mentalCommand,
            motionEvent,
            excitementLevel1Selections,
            excitementLevel2Selections: selections
          }
        });
      }, 1500);
    }
  }, [selections, connectedHeadsets, navigate, videoJobId, excitementLevel1Selections]);

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
              <Music className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Level 2: Theme Selection
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Tilt your head to navigate • Hold PUSH to select
            </p>
            <div className="text-sm text-muted-foreground/70">
              Choose your visual theme
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
            {excitementLevel2Images.map((image) => {
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

export default ExcitementLevel2;
