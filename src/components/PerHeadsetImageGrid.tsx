import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Focus, Sparkles, Activity } from "lucide-react";
import { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { ImageData } from "@/data/imageData";
import { ParticleDissolve } from "./ParticleDissolve";

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
  const [cursorPosition, setCursorPosition] = useState<Map<string, number>>(new Map()); // headsetId -> 0-1 normalized position
  const [lastPushReleaseTime, setLastPushReleaseTime] = useState<Map<string, number>>(new Map());

  // Cursor and selection sensitivity constants
  const CURSOR_MOVEMENT_SPEED = 0.00005;
  const CURSOR_DEAD_ZONE = 0.15;
  const CURSOR_MAX_STEP = 0.005;
  const PUSH_POWER_THRESHOLD = 0.30; // Moderate PUSH sensitivity
  const PUSH_HOLD_TIME_MS = 4000; // 8 seconds hold time
  const AUTO_CYCLE_INTERVAL_MS = 6000; // 6 seconds between image advances
  const POST_PUSH_DELAY_MS = 3000; // 3 second cooldown after releasing push

  // Initialize headset selections and cursor positions
  useEffect(() => {
    const newSelections = new Map<string, HeadsetSelection>();
    const newCursorPositions = new Map<string, number>();
    connectedHeadsets.forEach(headsetId => {
      if (!headsetSelections.has(headsetId)) {
        newSelections.set(headsetId, {
          headsetId,
          imageId: null,
          focusedIndex: 0
        });
        newCursorPositions.set(headsetId, 0.0); // Start at first image
      } else {
        newSelections.set(headsetId, headsetSelections.get(headsetId)!);
        if (!cursorPosition.has(headsetId)) {
          newCursorPositions.set(headsetId, 0.0);
        }
      }
    });
    setHeadsetSelections(newSelections);
    if (newCursorPositions.size > 0) {
      setCursorPosition(prev => new Map([...prev, ...newCursorPositions]));
    }
  }, [connectedHeadsets]);

  // Handle head turning for smooth cursor-like navigation
  useEffect(() => {
    if (!motionEvent) {
      console.log('⚠️ No motion event received');
      return;
    }
    const { gyroY, headsetId } = motionEvent;
    
    console.log(`🎮 Motion: headset=${headsetId.substring(0,8)}, gyroY=${gyroY.toFixed(4)}`);
    
    const currentSelection = headsetSelections.get(headsetId);
    if (!currentSelection || currentSelection.imageId !== null) return;

    // FREEZE navigation if this headset is actively pushing/holding selection
    if (pushProgress.has(headsetId)) {
      console.log(`🚫 Motion frozen - PUSH active for ${headsetId.substring(0,8)}`);
      return;
    }

    // Get current cursor position (0-1 normalized)
    const currentPosition = cursorPosition.get(headsetId) ?? 0.0;
    
    console.log(`📍 Current position: ${currentPosition.toFixed(3)}, gyroY: ${gyroY.toFixed(4)}, dead zone: ${CURSOR_DEAD_ZONE}`);
    
    // Only update if movement exceeds dead zone
    if (Math.abs(gyroY) < CURSOR_DEAD_ZONE) {
      console.log(`💤 gyroY ${gyroY.toFixed(4)} below dead zone ${CURSOR_DEAD_ZONE}`);
      return;
    }
    
    // Calculate delta and clamp to prevent large jumps
    const rawDelta = gyroY * CURSOR_MOVEMENT_SPEED;
    const clampedDelta = Math.max(-CURSOR_MAX_STEP, Math.min(CURSOR_MAX_STEP, rawDelta));
    
    // Calculate new position based on head pan (gyroY)
    // Positive gyroY = head turned right = cursor moves right
    // Negative gyroY = head turned left = cursor moves left
    let newPosition = currentPosition + clampedDelta;
    
    // Clamp position to 0-1 range with wrapping (circular navigation)
    if (newPosition >= 1) newPosition = newPosition - 1;
    if (newPosition < 0) newPosition = 1 + newPosition;
    
    // Update cursor position
    setCursorPosition(prev => new Map(prev).set(headsetId, newPosition));
    
    // Map cursor position to image index (0-1 -> 0-8 for 9 images)
    const imageIndex = Math.floor(newPosition * images.length);
    
    // Update focused image if changed
    if (imageIndex !== currentSelection.focusedIndex) {
      console.log(`🎯 Headset ${headsetId} cursor moved to image ${imageIndex} (position: ${newPosition.toFixed(3)})`);
      const newSelections = new Map(headsetSelections);
      newSelections.set(headsetId, {
        ...currentSelection,
        focusedIndex: imageIndex
      });
      setHeadsetSelections(newSelections);
    }
  }, [motionEvent, images.length, headsetSelections, pushProgress, cursorPosition]);
  
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

  // Handle PUSH command hold-to-select (single-stage: hold for PUSH_HOLD_TIME_MS)
  useEffect(() => {
    if (!mentalCommand) return;

    const { com, headsetId, pow } = mentalCommand;
    const currentSelection = headsetSelections.get(headsetId);
    
    if (!currentSelection || currentSelection.imageId !== null) return;

    const focusedImageId = images[currentSelection.focusedIndex].id;

    if (com === 'push' && pow >= PUSH_POWER_THRESHOLD) {
      const now = Date.now();
      const existing = pushProgress.get(headsetId);
      
      // Start or update hold timer for this headset on the currently focused image
      if (!existing || existing.imageId !== focusedImageId) {
        setPushProgress(prev => new Map(prev).set(headsetId, { startTime: now, imageId: focusedImageId }));
      }
    } else {
      // Push released or below threshold - reset hold progress and record release time
      if (pushProgress.has(headsetId)) {
        setLastPushReleaseTime(prev => new Map(prev).set(headsetId, Date.now()));
      }
      setPushProgress(prev => {
        const next = new Map(prev);
        next.delete(headsetId);
        return next;
      });
    }
  }, [mentalCommand, images, headsetSelections, pushProgress, PUSH_POWER_THRESHOLD]);

  // Monitor push progress and lock selection after hold duration
  useEffect(() => {
    if (pushProgress.size === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const newSelections = new Map(headsetSelections);
      let changed = false;

      pushProgress.forEach((progress, headsetId) => {
        const duration = now - progress.startTime;
        if (duration >= PUSH_HOLD_TIME_MS) {
          // Hold time reached - lock selection
          const currentSelection = headsetSelections.get(headsetId);
          if (currentSelection && currentSelection.imageId === null) {
            newSelections.set(headsetId, {
              ...currentSelection,
              imageId: progress.imageId
            });
            setTriggerParticle(progress.imageId);
            changed = true;
          }
          // Clear push progress
          setPushProgress(prev => {
            const next = new Map(prev);
            next.delete(headsetId);
            return next;
          });
        }
      });

      if (changed) {
        setHeadsetSelections(newSelections);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [pushProgress, headsetSelections, PUSH_HOLD_TIME_MS]);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => {
            const { isSelected, isFocused, headsetId, pushProgress: pushProgressValue } = getImageStatus(image.id);
            const headsetColor = headsetId ? getHeadsetColor(headsetId) : 'hsl(var(--primary))';

            return (
              <Card
                key={image.id}
                className={`
                  relative overflow-hidden cursor-pointer
                  ${isSelected ? 'border-2 shadow-2xl' : 'border-border'}
                  ${isFocused && !isSelected ? 'border-2 shadow-lg' : ''}
                `}
                style={{
                  borderColor: isFocused || isSelected ? headsetColor : undefined,
                  boxShadow: isFocused || isSelected ? `0 20px 40px -15px ${headsetColor}40` : undefined,
                  transform: isFocused && !isSelected ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing
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
