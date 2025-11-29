import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Focus, Sparkles, Activity } from "lucide-react";
import { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { ImageData } from "@/data/imageData";
import { ParticleDissolve } from "./ParticleDissolve";
import { OneEuroFilter } from "@/utils/OneEuroFilter";

interface HeadsetSelection {
  headsetId: string;
  imageId: number | null;
  focusedIndex: number;
}

interface PerHeadsetImageGridProps {
  images: ImageData[];
  mentalCommand?: MentalCommandEvent | null;
  motionEvent?: MotionEvent | null;
  connectedHeadsets: string[];
  onAllSelected: (selections: Map<string, number>) => void;
  title: string;
  description: string;
}

export const PerHeadsetImageGrid = ({
  images,
  mentalCommand,
  motionEvent,
  connectedHeadsets,
  onAllSelected,
  title,
  description
}: PerHeadsetImageGridProps) => {
  const [headsetSelections, setHeadsetSelections] = useState<Map<string, HeadsetSelection>>(new Map());
  const [triggerParticle, setTriggerParticle] = useState<number | null>(null);
  const [allSelectionsComplete, setAllSelectionsComplete] = useState(false);
  const [lastCommandReceived, setLastCommandReceived] = useState<{ com: string; pow: number; headsetId: string } | null>(null);
  const [pushFlash, setPushFlash] = useState(false);
  const [pushProgress, setPushProgress] = useState<Map<string, { startTime: number; imageId: number }>>(new Map());
  const [lastPushReleaseTime, setLastPushReleaseTime] = useState<Map<string, number>>(new Map());

  // Use refs for real-time motion data (no React state delays)
  const latestMotionData = useRef<Map<string, { rotation: number; pitch: number; roll: number; timestamp: number }>>(new Map());
  const animationFrameId = useRef<number | null>(null);
  
  // Refs for continuous cursor control
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const cursorRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const cursorScreenPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  
  // Calibration refs (neutral head position)
  const centerPitch = useRef<Map<string, number>>(new Map());
  const centerRotation = useRef<Map<string, number>>(new Map());
  const centerRoll = useRef<Map<string, number>>(new Map());
  const isCalibrated = useRef<Map<string, boolean>>(new Map());
  
  // OneEuroFilter instances per headset
  const pitchFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  const rotationFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  const rollFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  
  // Refs to avoid effect dependency loops
  const headsetSelectionsRef = useRef<Map<string, HeadsetSelection>>(new Map());
  const pushProgressRef = useRef<Map<string, { startTime: number; imageId: number }>>(new Map());
  
  // Keep refs in sync with state
  useEffect(() => {
    headsetSelectionsRef.current = headsetSelections;
  }, [headsetSelections]);

  useEffect(() => {
    pushProgressRef.current = pushProgress;
  }, [pushProgress]);

  // Sensitivity controls - adjustable via UI
  const [maxAngle, setMaxAngle] = useState(3); // degrees - how much head movement = full screen travel
  const [manualSelectionMode, setManualSelectionMode] = useState(false); // Operator override for stuck players
  const PUSH_POWER_THRESHOLD = 0.3; // Moderate PUSH sensitivity
  const PUSH_HOLD_TIME_MS = 3000; // 3 seconds hold time for deliberate selection
  const AUTO_CYCLE_INTERVAL_MS = 6000; // 6 seconds between image advances
  const POST_PUSH_DELAY_MS = 3000; // 3 second cooldown after releasing push

  // Initialize headset selections
  useEffect(() => {
    setHeadsetSelections(prev => {
      const updated = new Map(prev);

      // Add new headsets with default state
      connectedHeadsets.forEach(headsetId => {
        if (!updated.has(headsetId)) {
          updated.set(headsetId, {
            headsetId,
            imageId: null,
            focusedIndex: 4, // start at center cell
          });
        }
      });

      // Remove headsets that are no longer connected
      Array.from(updated.keys()).forEach(headsetId => {
        if (!connectedHeadsets.includes(headsetId)) {
          updated.delete(headsetId);
        }
      });

      return updated;
    });
  }, [connectedHeadsets]);

  // Store incoming motion data (no processing yet)
  useEffect(() => {
    if (!motionEvent) return;
    
    const { rotation, pitch, roll, headsetId } = motionEvent;
    latestMotionData.current.set(headsetId, {
      rotation,
      pitch,
      roll: roll || 0,
      timestamp: performance.now()
    });
  }, [motionEvent]);

  // 60fps animation loop for continuous cursor control
  useEffect(() => {
    const gridContainer = document.querySelector('.image-grid-container');
    if (!gridContainer) return;

    const animate = () => {
      connectedHeadsets.forEach(headsetId => {
        const motion = latestMotionData.current.get(headsetId);
        if (!motion) return;

        const currentSelection = headsetSelections.get(headsetId);
        if (!currentSelection || currentSelection.imageId !== null) return;

        // FREEZE navigation if this headset is actively pushing
        if (pushProgress.has(headsetId)) return;

        // Initialize filters if needed
        if (!pitchFilters.current.has(headsetId)) {
          pitchFilters.current.set(headsetId, new OneEuroFilter(1.0, 0.007, 1.0));
          rotationFilters.current.set(headsetId, new OneEuroFilter(1.0, 0.007, 1.0));
          rollFilters.current.set(headsetId, new OneEuroFilter(1.0, 0.007, 1.0));
        }

        // Auto-calibrate on first motion event
        if (!isCalibrated.current.get(headsetId)) {
          centerPitch.current.set(headsetId, motion.pitch);
          centerRotation.current.set(headsetId, motion.rotation);
          centerRoll.current.set(headsetId, motion.roll);
          isCalibrated.current.set(headsetId, true);
          
          // Initialize cursor position at center
          const rect = gridContainer.getBoundingClientRect();
          cursorScreenPositions.current.set(headsetId, {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          });
          return;
        }

        // Get calibrated relative angles
        const relativePitch = motion.pitch - (centerPitch.current.get(headsetId) || 0);
        const relativeRotation = motion.rotation - (centerRotation.current.get(headsetId) || 0);

        // Apply OneEuroFilter smoothing
        const pitchFilter = pitchFilters.current.get(headsetId)!;
        const rotationFilter = rotationFilters.current.get(headsetId)!;
        
        const smoothPitch = pitchFilter.filter(relativePitch, motion.timestamp);
        const smoothRotation = rotationFilter.filter(relativeRotation, motion.timestamp);

        // Map angles to screen coordinates
        const gridRect = gridContainer.getBoundingClientRect();
        const centerX = gridRect.left + gridRect.width / 2;
        const centerY = gridRect.top + gridRect.height / 2;

        // pitch controls X (left/right), rotation controls Y (up/down)
        let cursorX = centerX + (smoothPitch / maxAngle) * (gridRect.width / 2);
        let cursorY = centerY + (smoothRotation / maxAngle) * (gridRect.height / 2);

        // Constrain cursor to grid bounds
        cursorX = Math.max(gridRect.left, Math.min(gridRect.right, cursorX));
        cursorY = Math.max(gridRect.top, Math.min(gridRect.bottom, cursorY));

        // Store position
        cursorScreenPositions.current.set(headsetId, { x: cursorX, y: cursorY });

        // Direct DOM manipulation for cursor (zero latency)
        const cursorEl = cursorRefs.current.get(headsetId);
        if (cursorEl) {
          cursorEl.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        }

        // Hover detection - find which image the cursor overlaps
        let hoveredIndex = -1;
        imageRefs.current.forEach((imgEl, imageId) => {
          const imgRect = imgEl.getBoundingClientRect();
          if (
            cursorX >= imgRect.left &&
            cursorX <= imgRect.right &&
            cursorY >= imgRect.top &&
            cursorY <= imgRect.bottom
          ) {
            // Find index in images array
            hoveredIndex = images.findIndex(img => img.id === imageId);
          }
        });

        // Update focused image if changed
        if (hoveredIndex !== -1 && hoveredIndex !== currentSelection.focusedIndex) {
          setHeadsetSelections(prev => {
            const newSelections = new Map(prev);
            const current = newSelections.get(headsetId);
            if (current && current.imageId === null) {
              newSelections.set(headsetId, {
                ...current,
                focusedIndex: hoveredIndex
              });
            }
            return newSelections;
          });
        }
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [connectedHeadsets, headsetSelections, pushProgress, images, maxAngle]);
  
  // Auto-cycle focused image for each headset at a slow, constant pace
  useEffect(() => {
    if (connectedHeadsets.length === 0 || images.length === 0) return;

    // Check if any headset is currently pushing
    const anyHeadsetPushing = pushProgress.size > 0;
    if (anyHeadsetPushing) return;

    // Check if we're in post-push cooldown for any headset
    const now = Date.now();
    const inCooldown = Array.from(lastPushReleaseTime.values()).some(
      releaseTime => now - releaseTime < POST_PUSH_DELAY_MS
    );
    if (inCooldown) return;

    const interval = setInterval(() => {
      setHeadsetSelections(prev => {
        const updated = new Map(prev);
        connectedHeadsets.forEach(headsetId => {
          const current = prev.get(headsetId);
          const isPushing = pushProgress.has(headsetId);
          if (!current || current.imageId !== null || isPushing) return; // skip completed or pushing
          const nextIndex = (current.focusedIndex + 1) % images.length;
          updated.set(headsetId, { ...current, focusedIndex: nextIndex });
        });
        return updated;
      });
    }, AUTO_CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [connectedHeadsets, images.length, pushProgress, lastPushReleaseTime, AUTO_CYCLE_INTERVAL_MS, POST_PUSH_DELAY_MS]);

  // Track all mental commands for visual feedback
  useEffect(() => {
    if (!mentalCommand) return;
    
    console.log('Mental command received:', mentalCommand);
    setLastCommandReceived({
      com: mentalCommand.com,
      pow: mentalCommand.pow,
      headsetId: mentalCommand.headsetId
    });

    // Flash effect for PUSH commands
    if (mentalCommand.com === 'push') {
      setPushFlash(true);
      setTimeout(() => setPushFlash(false), 300);
    }
  }, [mentalCommand]);

  // Handle PUSH command hold-to-select
  useEffect(() => {
    if (!mentalCommand) return;

    const { com, headsetId, pow } = mentalCommand;
    const now = Date.now();

    const currentSelection = headsetSelectionsRef.current.get(headsetId);
    if (!currentSelection || currentSelection.imageId !== null) return;

    const focusedImageId = images[currentSelection.focusedIndex].id;
    const existing = pushProgressRef.current.get(headsetId);

    if (com === "push" && pow >= PUSH_POWER_THRESHOLD) {
      // Start or continue hold on currently focused image
      if (!existing || existing.imageId !== focusedImageId) {
        setPushProgress(prev => new Map(prev).set(headsetId, { startTime: now, imageId: focusedImageId }));
      } else {
        const duration = now - existing.startTime;
        if (duration >= PUSH_HOLD_TIME_MS) {
          // Hold completed - lock selection
          console.log(`✅ SELECTION CONFIRMED: Headset ${headsetId.substring(0,8)} selected image ${focusedImageId}`);
          
          setHeadsetSelections(prev => {
            const updated = new Map(prev);
            const current = updated.get(headsetId);
            if (current && current.imageId === null) {
              updated.set(headsetId, {
                ...current,
                imageId: focusedImageId,
              });
            }
            return updated;
          });

          setTriggerParticle(focusedImageId);

          // Clear push state and start cooldown
          setPushProgress(prev => {
            const next = new Map(prev);
            next.delete(headsetId);
            return next;
          });
          setLastPushReleaseTime(prev => new Map(prev).set(headsetId, now));
        }
      }
    } else {
      // Push released or below threshold - reset
      if (existing) {
        console.log(`🔄 PUSH RELEASED: Headset ${headsetId.substring(0,8)} released at ${((now - existing.startTime) / 1000).toFixed(1)}s`);
        setLastPushReleaseTime(prev => new Map(prev).set(headsetId, now));
      }
      setPushProgress(prev => {
        const next = new Map(prev);
        next.delete(headsetId);
        return next;
      });
    }
  }, [mentalCommand, images, PUSH_POWER_THRESHOLD, PUSH_HOLD_TIME_MS]);

  // Check if all selections are complete
  useEffect(() => {
    if (connectedHeadsets.length === 0) return;

    const allSelected = connectedHeadsets.every(headsetId => {
      const selection = headsetSelections.get(headsetId);
      return selection && selection.imageId !== null;
    });

    if (allSelected && !allSelectionsComplete) {
      setAllSelectionsComplete(true);
      
      // Build selections map
      const selectionsMap = new Map<string, number>();
      connectedHeadsets.forEach(headsetId => {
        const selection = headsetSelections.get(headsetId);
        if (selection && selection.imageId !== null) {
          selectionsMap.set(headsetId, selection.imageId);
        }
      });

      // Delay navigation for cinematic effect
      setTimeout(() => {
        onAllSelected(selectionsMap);
      }, 1500);
    }
  }, [headsetSelections, connectedHeadsets, allSelectionsComplete, onAllSelected]);

  const getImageStatus = (imageId: number): { isSelected: boolean; isFocused: boolean; headsetId?: string; pushProgress?: number } => {
    let isSelected = false;
    let isFocused = false;
    let headsetId: string | undefined;
    let pushProgressValue: number | undefined;

    headsetSelections.forEach((selection, hId) => {
      if (selection.imageId === imageId) {
        isSelected = true;
        headsetId = hId;
      }
      if (images[selection.focusedIndex]?.id === imageId) {
        isFocused = true;
        
        // Check push progress (only show during hold phase, not arming)
        const progress = pushProgress.get(hId);
        if (progress && progress.imageId === imageId) {
          const duration = Date.now() - progress.startTime;
          pushProgressValue = Math.min(duration / PUSH_HOLD_TIME_MS, 1); // 0 to 1 over hold duration
        }
      }
    });

    return { isSelected, isFocused, headsetId, pushProgress: pushProgressValue };
  };

  const getHeadsetColor = (headsetId: string): string => {
    const colors = [
      'hsl(var(--primary))',
      'hsl(142, 76%, 36%)',
      'hsl(217, 91%, 60%)',
      'hsl(280, 67%, 55%)',
      'hsl(25, 95%, 53%)',
    ];
    const index = connectedHeadsets.indexOf(headsetId) % colors.length;
    return colors[index];
  };

  const selectedCount = Array.from(headsetSelections.values()).filter(s => s.imageId !== null).length;

  // Manual selection handler for operator override
  const handleManualSelection = (imageId: number) => {
    if (!manualSelectionMode) return;
    
    // Select this image for the first headset that hasn't selected yet
    const unselectedHeadset = connectedHeadsets.find(headsetId => {
      const selection = headsetSelections.get(headsetId);
      return selection && selection.imageId === null;
    });

    if (unselectedHeadset) {
      console.log(`🖱️ MANUAL SELECTION: Operator selected image ${imageId} for headset ${unselectedHeadset.substring(0,8)}`);
      
      setHeadsetSelections(prev => {
        const updated = new Map(prev);
        const current = updated.get(unselectedHeadset);
        if (current && current.imageId === null) {
          updated.set(unselectedHeadset, {
            ...current,
            imageId: imageId,
          });
        }
        return updated;
      });

      setTriggerParticle(imageId);
    }
  };

  return (
    <section className="py-12 px-6 bg-background/50 relative overflow-hidden">
      {/* Cinematic overlay when all selections complete */}
      {allSelectionsComplete && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40 animate-fade-in">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6 animate-scale-in">
              <Sparkles className="h-16 w-16 text-primary mx-auto animate-pulse-glow" />
              <h2 className="text-4xl font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                All Selections Complete
              </h2>
              <p className="text-lg text-muted-foreground">Proceeding to next level...</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {title}
          </h2>
          <p className="text-muted-foreground mb-4">{description}</p>
          
          <div className="flex flex-col gap-3">
          <div className={`flex items-center justify-center gap-6 p-4 rounded-lg border ${pushFlash ? 'border-primary bg-primary/20 scale-105' : 'border-primary/30 bg-card/50'} backdrop-blur-sm transition-all duration-300`}>
             <div className="flex items-center gap-2">
                <Focus className="h-5 w-5 text-primary" />
                <span className="text-sm font-mono">
                  Tilt head UP/DOWN or LEFT/RIGHT to navigate • Hold <span className="text-primary font-bold">PUSH</span> to select
                </span>
             </div>
             <div className="h-4 w-px bg-border" />
             <div className="flex items-center gap-2">
                 <CheckCircle2 className="h-5 w-5 text-primary" />
                 <span className="text-sm font-mono">
                   Selected: <span className="text-primary font-bold">{selectedCount}/{connectedHeadsets.length}</span>
                 </span>
               </div>
            </div>

            {/* Sensitivity Controls */}
            <div className="flex flex-col gap-2 p-4 rounded-lg border border-primary/30 bg-card/50 backdrop-blur-sm">
              <label className="text-xs font-mono text-muted-foreground">
                Head Sensitivity (Lower = more sensitive)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={maxAngle}
                  onChange={(e) => setMaxAngle(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs font-mono text-primary w-12">{maxAngle.toFixed(1)}°</span>
              </div>
              <p className="text-xs text-muted-foreground">
                How much head movement needed to reach screen edge
              </p>
            </div>

            {/* Manual Selection Mode Toggle */}
            <div className="flex items-center justify-center gap-3 p-3 rounded-lg border border-accent/50 bg-accent/10 backdrop-blur-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualSelectionMode}
                  onChange={(e) => setManualSelectionMode(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-mono text-accent">
                  🖱️ Manual Selection Mode {manualSelectionMode && '(ACTIVE - Click images to select)'}
                </span>
              </label>
            </div>

            {/* Real-time command indicator */}
            {lastCommandReceived && (
              <div className="flex items-center justify-center gap-3 p-3 rounded-lg border border-accent/50 bg-accent/10 backdrop-blur-sm animate-fade-in">
                <Activity className="h-4 w-4 text-accent" />
                <span className="text-xs font-mono text-accent">
                  LAST COMMAND: <span className="font-bold uppercase">{lastCommandReceived.com}</span>
                  {' '}({Math.round(lastCommandReceived.pow * 100)}%)
                  {' '}from {lastCommandReceived.headsetId.substring(0, 8)}...
                </span>
              </div>
            )}
          </div>

          {/* Show connected headsets */}
          {connectedHeadsets.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              {connectedHeadsets.map(headsetId => {
                const selection = headsetSelections.get(headsetId);
                const hasSelected = selection?.imageId !== null;
                return (
                  <Badge
                    key={headsetId}
                    variant={hasSelected ? "default" : "outline"}
                    className="font-mono text-xs"
                    style={{
                      borderColor: getHeadsetColor(headsetId),
                      backgroundColor: hasSelected ? getHeadsetColor(headsetId) : 'transparent',
                    }}
                  >
                    {headsetId.substring(0, 8)}... {hasSelected && '✓'}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Visual cursor dots */}
        {connectedHeadsets.map(headsetId => {
          const selection = headsetSelections.get(headsetId);
          const hasSelected = selection?.imageId !== null;
          if (hasSelected) return null; // Hide cursor after selection
          
          return (
            <div
              key={`cursor-${headsetId}`}
              ref={(el) => {
                if (el) cursorRefs.current.set(headsetId, el);
              }}
              className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: getHeadsetColor(headsetId),
                boxShadow: `0 0 20px ${getHeadsetColor(headsetId)}`,
                left: 0,
                top: 0,
              }}
            />
          );
        })}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 image-grid-container">
          {images.map((image, index) => {
            const { isSelected, isFocused, headsetId, pushProgress: pushProgressValue } = getImageStatus(image.id);
            const headsetColor = headsetId ? getHeadsetColor(headsetId) : 'hsl(var(--primary))';

            return (
              <Card
                key={image.id}
                ref={(el) => {
                  if (el) imageRefs.current.set(image.id, el);
                }}
                onClick={() => handleManualSelection(image.id)}
                className={`
                  relative overflow-hidden cursor-pointer
                  ${isSelected ? 'border-2 shadow-2xl' : 'border-border'}
                  ${isFocused && !isSelected ? 'border-2 shadow-lg' : ''}
                  ${manualSelectionMode && !isSelected ? 'hover:border-accent hover:scale-105' : ''}
                `}
                style={{
                  borderColor: isFocused || isSelected ? headsetColor : undefined,
                  boxShadow: isFocused || isSelected ? `0 20px 40px -15px ${headsetColor}40` : undefined,
                  transform: isFocused && !isSelected ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing
                  cursor: manualSelectionMode && !isSelected ? 'pointer' : 'default',
                }}
              >
                <div className="aspect-video relative">
                  <img
                    src={image.url}
                    alt={image.title || `Image ${image.id}`}
                    className={`w-full h-full object-cover`}
                    style={{
                      opacity: pushProgressValue !== undefined ? 1 - pushProgressValue : 1,
                      filter: pushProgressValue !== undefined ? `blur(${pushProgressValue * 8}px)` : undefined,
                      transform: isFocused && !isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth zoom
                    }}
                  />
                  
                  {/* Particle dissolve effect */}
                  <ParticleDissolve
                    trigger={triggerParticle === image.id}
                    onComplete={() => {
                      if (triggerParticle === image.id) {
                        setTriggerParticle(null);
                      }
                    }}
                  />
                  
                  {/* Cinematic overlay on selection */}
                  {isSelected && (
                    <>
                      <div 
                        className="absolute inset-0 animate-fade-in"
                        style={{
                          background: `radial-gradient(circle at center, ${headsetColor}20 0%, transparent 70%)`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                        <div className="relative">
                          <div 
                            className="absolute inset-0 blur-2xl"
                            style={{ backgroundColor: headsetColor, opacity: 0.3 }}
                          />
                          <CheckCircle2 
                            className="h-16 w-16 relative drop-shadow-2xl animate-pulse-glow" 
                            style={{ color: headsetColor }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {isFocused && !isSelected && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div 
                        className="absolute inset-0 border-4 rounded-lg transition-all"
                        style={{ borderColor: headsetColor }}
                      />
                      {pushProgressValue !== undefined && (
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-background/50">
                          <div 
                            className="h-full transition-all duration-100"
                            style={{ 
                              width: `${pushProgressValue * 100}%`,
                              backgroundColor: headsetColor
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {isSelected && headsetId && (
                    <div className="absolute top-2 left-2 animate-fade-in">
                      <Badge 
                        className="font-bold backdrop-blur-sm border-2"
                        style={{
                          backgroundColor: `${headsetColor}20`,
                          borderColor: headsetColor,
                          color: headsetColor,
                        }}
                      >
                        ✓ {headsetId.substring(0, 8)}...
                      </Badge>
                    </div>
                  )}
                </div>

                {image.title && (
                  <div className="p-3 bg-card/80 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-center">{image.title}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
