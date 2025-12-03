import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getHeadsetColor } from "@/utils/headsetColors";
import type { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";
import { level2Images as localLevel2Images } from "@/data/imageData";
import { RemoteOperatorPanel } from "@/components/RemoteOperatorPanel";
import { useSettings } from "@/contexts/SettingsContext";

interface Level2Image {
  id: number;
  position: number;
  url: string;
  metadata: string;
}

const PUSH_POWER_THRESHOLD = 0.3;
const PUSH_HOLD_TIME_MS = 8000;
const GRID_COLS = 4;
const GRID_ROWS = 2;

const ExcitementLevel2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tiltThreshold, framesToTrigger, manualSelectionMode } = useSettings();
  
  const { 
    videoJobId,
    connectedHeadsets,
    mentalCommand,
    motionEvent,
    excitementLevel1Selections,
    level1Metadata
  } = location.state || {};

  // Use local imports for proper Vite bundling
  const level2Images: Level2Image[] = localLevel2Images.map((img, idx) => ({
    id: img.id,
    position: idx,
    url: img.url,
    metadata: img.metadata
  }));

  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [focusedImages, setFocusedImages] = useState<Map<string, number>>(new Map());
  const [pushProgress, setPushProgress] = useState<Map<string, number>>(new Map());
  const [isPushing, setIsPushing] = useState<Map<string, boolean>>(new Map());
  
  // Discrete navigation state
  const tiltCounters = useRef<Map<string, { left: number; right: number; up: number; down: number }>>(new Map());
  const pushStartTimes = useRef<Map<string, number>>(new Map());
  const centerPitch = useRef<Map<string, number>>(new Map());
  const centerRotation = useRef<Map<string, number>>(new Map());
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  
  const selectionsRef = useRef(selections);
  const isPushingRef = useRef(isPushing);
  const focusedImagesRef = useRef(focusedImages);
  
  useEffect(() => { selectionsRef.current = selections; }, [selections]);
  useEffect(() => { isPushingRef.current = isPushing; }, [isPushing]);
  useEffect(() => { focusedImagesRef.current = focusedImages; }, [focusedImages]);

  // Initialize focused images for each headset
  useEffect(() => {
    if (connectedHeadsets && connectedHeadsets.length > 0) {
      const initialFocus = new Map<string, number>();
      connectedHeadsets.forEach((headsetId: string) => {
        if (!focusedImages.has(headsetId)) {
          initialFocus.set(headsetId, 0); // Start at first image
        }
      });
      if (initialFocus.size > 0) {
        setFocusedImages(prev => new Map([...prev, ...initialFocus]));
      }
    }
  }, [connectedHeadsets]);

  // Discrete tilt-step motion handling
  useEffect(() => {
    const handleMotion = ((event: CustomEvent<MotionEvent>) => {
      const motionData = event.detail;
      const headsetId = motionData.headsetId;
    
      // Skip if already selected or currently pushing
      if (selectionsRef.current.has(headsetId)) return;
      if (isPushingRef.current.get(headsetId)) return;
      
      // Initialize center calibration on first motion
      if (!centerPitch.current.has(headsetId)) {
        centerPitch.current.set(headsetId, motionData.pitch);
        centerRotation.current.set(headsetId, motionData.rotation);
      }
      
      // Initialize tilt counters
      if (!tiltCounters.current.has(headsetId)) {
        tiltCounters.current.set(headsetId, { left: 0, right: 0, up: 0, down: 0 });
      }
      
      const relativePitch = motionData.pitch - (centerPitch.current.get(headsetId) || 0);
      const relativeRotation = motionData.rotation - (centerRotation.current.get(headsetId) || 0);
      
      const counters = tiltCounters.current.get(headsetId)!;
      const currentFocus = focusedImagesRef.current.get(headsetId) ?? 0;
      const currentCol = currentFocus % GRID_COLS;
      const currentRow = Math.floor(currentFocus / GRID_COLS);
      
      let newFocus = currentFocus;
      
      // Horizontal navigation (pitch = left/right head tilt)
      if (relativePitch < -tiltThreshold) {
        // Tilting left
        counters.left++;
        counters.right = 0;
        if (counters.left >= framesToTrigger) {
          // Move left with row wrapping
          if (currentCol === 0) {
            // Wrap to end of previous row
            if (currentRow > 0) {
              newFocus = (currentRow - 1) * GRID_COLS + (GRID_COLS - 1);
            } else {
              // Wrap to end of last row
              newFocus = (GRID_ROWS - 1) * GRID_COLS + (GRID_COLS - 1);
            }
          } else {
            newFocus = currentFocus - 1;
          }
          counters.left = 0;
        }
      } else if (relativePitch > tiltThreshold) {
        // Tilting right
        counters.right++;
        counters.left = 0;
        if (counters.right >= framesToTrigger) {
          // Move right with row wrapping
          if (currentCol === GRID_COLS - 1) {
            // Wrap to start of next row
            if (currentRow < GRID_ROWS - 1) {
              newFocus = (currentRow + 1) * GRID_COLS;
            } else {
              // Wrap to start of first row
              newFocus = 0;
            }
          } else {
            newFocus = currentFocus + 1;
          }
          counters.right = 0;
        }
      } else {
        // Neutral - reset horizontal counters
        counters.left = 0;
        counters.right = 0;
      }
      
      // Vertical navigation (rotation = up/down head tilt)
      if (relativeRotation < -tiltThreshold) {
        // Tilting up
        counters.up++;
        counters.down = 0;
        if (counters.up >= framesToTrigger) {
          // Move up
          if (currentRow > 0) {
            newFocus = (currentRow - 1) * GRID_COLS + currentCol;
          } else {
            // Wrap to bottom row
            newFocus = (GRID_ROWS - 1) * GRID_COLS + currentCol;
          }
          counters.up = 0;
        }
      } else if (relativeRotation > tiltThreshold) {
        // Tilting down
        counters.down++;
        counters.up = 0;
        if (counters.down >= framesToTrigger) {
          // Move down
          if (currentRow < GRID_ROWS - 1) {
            newFocus = (currentRow + 1) * GRID_COLS + currentCol;
          } else {
            // Wrap to top row
            newFocus = currentCol;
          }
          counters.down = 0;
        }
      } else {
        // Neutral - reset vertical counters
        counters.up = 0;
        counters.down = 0;
      }
      
      // Clamp to valid range
      newFocus = Math.max(0, Math.min(level2Images.length - 1, newFocus));
      
      // Update focus if changed
      if (newFocus !== currentFocus) {
        setFocusedImages(prev => new Map(prev).set(headsetId, newFocus));
      }
    }) as EventListener;

    window.addEventListener('motion-event', handleMotion);
    return () => window.removeEventListener('motion-event', handleMotion);
  }, [tiltThreshold, framesToTrigger, level2Images.length]);

  // Mental command handling
  useEffect(() => {
    const handleMentalCommand = ((event: CustomEvent<MentalCommandEvent>) => {
      const commandData = event.detail;
      const headsetId = commandData.headsetId;
    
      if (selections.has(headsetId)) return;
      
      const focusedImageId = focusedImages.get(headsetId);
      if (focusedImageId === undefined) return;
      
      if (commandData.com === 'push' && commandData.pow >= PUSH_POWER_THRESHOLD) {
        if (!pushStartTimes.current.has(headsetId)) {
          pushStartTimes.current.set(headsetId, Date.now());
        }
        
        setIsPushing(prev => new Map(prev).set(headsetId, true));
        
        const startTime = pushStartTimes.current.get(headsetId)!;
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / PUSH_HOLD_TIME_MS) * 100);
        
        setPushProgress(prev => new Map(prev).set(headsetId, progress));
        
        if (elapsed >= PUSH_HOLD_TIME_MS) {
          setSelections(prev => new Map(prev).set(headsetId, focusedImageId));
          pushStartTimes.current.delete(headsetId);
          setIsPushing(prev => {
            const updated = new Map(prev);
            updated.delete(headsetId);
            return updated;
          });
        }
      } else {
        if (pushStartTimes.current.has(headsetId)) {
          pushStartTimes.current.delete(headsetId);
        }
        setIsPushing(prev => new Map(prev).set(headsetId, false));
        setPushProgress(prev => new Map(prev).set(headsetId, 0));
      }
    }) as EventListener;

    window.addEventListener('mental-command', handleMentalCommand);
    return () => window.removeEventListener('mental-command', handleMentalCommand);
  }, [focusedImages, selections]);

  // Navigate to Level 3 once all headsets have selected
  useEffect(() => {
    if (connectedHeadsets && selections.size === connectedHeadsets.length && selections.size > 0) {
      const level2Metadata: string[] = [];
      selections.forEach((imageId) => {
        const image = level2Images.find((img) => img.position === imageId);
        if (image) {
          level2Metadata.push(image.metadata);
        }
      });

      const allMetadata = [...(level1Metadata || []), ...level2Metadata];

      setTimeout(() => {
        navigate("/excitement-level-3", {
          state: {
            videoJobId,
            connectedHeadsets,
            mentalCommand,
            motionEvent,
            excitementLevel1Selections,
            excitementLevel2Selections: selections,
            metadata: allMetadata
          }
        });
      }, 1500);
    }
  }, [selections, connectedHeadsets, navigate, videoJobId, excitementLevel1Selections, level1Metadata, level2Images]);

  // Manual click selection handler
  const handleManualSelect = (headsetId: string, imagePosition: number) => {
    if (!manualSelectionMode) return;
    if (selections.has(headsetId)) return;
    setSelections(prev => new Map(prev).set(headsetId, imagePosition));
  };

  return (
    <div className="min-h-screen relative">
      <Brain3D excitement={0.5} className="opacity-20 z-0" />
      <Header />
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Level 2: Elements
            </h1>
            <p className="text-lg text-muted-foreground">
              Tilt your head to navigate • Hold PUSH to select
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-12">
            {level2Images.map((image) => {
              const focusedByHeadsets = Array.from(focusedImages.entries())
                .filter(([_, imageId]) => imageId === image.position)
                .map(([headsetId]) => headsetId);
              
              const selectedByHeadsets = Array.from(selections.entries())
                .filter(([_, imageId]) => imageId === image.position)
                .map(([headsetId]) => headsetId);
              
              const isFocused = focusedByHeadsets.length > 0;
              const isSelected = selectedByHeadsets.length > 0;

              return (
                <div 
                  key={image.id}
                  ref={(el) => { if (el) imageRefs.current.set(image.position, el); }}
                  className="relative"
                  onClick={() => {
                    if (manualSelectionMode && connectedHeadsets?.length > 0) {
                      // In manual mode, select for first headset that hasn't selected
                      const headsetToSelect = connectedHeadsets.find((h: string) => !selections.has(h));
                      if (headsetToSelect) {
                        handleManualSelect(headsetToSelect, image.position);
                      }
                    }
                  }}
                  style={{ cursor: manualSelectionMode ? 'pointer' : 'default' }}
                >
                  <Card 
                    className="relative overflow-hidden transition-all duration-200"
                    style={{
                      opacity: isSelected ? 0.5 : 1,
                      transform: isFocused ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isFocused ? '0 0 30px hsl(var(--primary) / 0.5)' : 'none'
                    }}
                  >
                    <div className="aspect-video relative">
                      {image.url.endsWith('.mp4') ? (
                        <video
                          src={image.url}
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={{
                            filter: isFocused ? 'brightness(1.2)' : 'brightness(1)'
                          }}
                        />
                      ) : (
                        <img
                          src={image.url}
                          alt={image.metadata}
                          className="w-full h-full object-cover"
                          style={{
                            filter: isFocused ? 'brightness(1.2)' : 'brightness(1)'
                          }}
                        />
                      )}

                      {focusedByHeadsets.map(headsetId => {
                        const color = getHeadsetColor(headsetId);
                        return (
                          <div
                            key={headsetId}
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              border: `4px solid ${color}`,
                              boxShadow: `0 0 20px ${color}`
                            }}
                          />
                        );
                      })}

                      {selectedByHeadsets.length > 0 && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <div className="text-6xl">✓</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-card">
                      <div className="flex flex-wrap gap-1 justify-center">
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">{image.metadata}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border p-4 z-40">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-6">
            {connectedHeadsets?.map((headsetId: string) => {
              const color = getHeadsetColor(headsetId);
              const progress = pushProgress.get(headsetId) || 0;
              const hasSelected = selections.has(headsetId);
              const pushing = isPushing.get(headsetId) || false;
              const currentFocus = focusedImages.get(headsetId);
              
              return (
                <div key={headsetId} className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono" style={{ color }}>
                      {hasSelected ? '✓ Selected' : pushing ? 'Pushing...' : `Image ${(currentFocus ?? 0) + 1}`}
                    </span>
                    <span className="text-sm font-mono" style={{ color }}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2"
                    style={{
                      '--progress-color': color
                    } as React.CSSProperties}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <RemoteOperatorPanel
        connectedHeadsets={connectedHeadsets}
        currentLevel={2}
        onForceSelection={(headsetId, imageId) => {
          setSelections(prev => new Map(prev).set(headsetId, imageId));
        }}
      />
    </div>
  );
};

export default ExcitementLevel2;
