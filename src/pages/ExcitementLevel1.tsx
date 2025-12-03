import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { getHeadsetColor } from "@/utils/headsetColors";
import type { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";
import { OneEuroFilter, applySensitivityCurve } from "@/utils/OneEuroFilter";
import { level1Images as localLevel1Images } from "@/data/imageData";
import { RemoteOperatorPanel } from "@/components/RemoteOperatorPanel";

interface Level1Image {
  id: number;
  position: number;
  url: string;
  metadata: string;
}

const PUSH_POWER_THRESHOLD = 0.3;
const PUSH_HOLD_TIME_MS = 8000; // Slower, more deliberate selection

const ExcitementLevel1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    videoJobId,
    connectedHeadsets,
    mentalCommand,
    motionEvent
  } = location.state || {};

  // Use local imports for proper Vite bundling
  const level1Images: Level1Image[] = localLevel1Images.map((img, idx) => ({
    id: img.id,
    position: idx,
    url: img.url,
    metadata: img.metadata
  }));

  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [focusedImages, setFocusedImages] = useState<Map<string, number>>(new Map());
  const [pushProgress, setPushProgress] = useState<Map<string, number>>(new Map());
  const [isPushing, setIsPushing] = useState<Map<string, boolean>>(new Map());
  
  const pitchFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  const rotationFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  const pushStartTimes = useRef<Map<string, number>>(new Map());
  const centerPitch = useRef<Map<string, number>>(new Map());
  const centerRotation = useRef<Map<string, number>>(new Map());
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const cursorRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // ULTRA LOW-LATENCY: Direct cursor position storage (no React state for cursor updates)
  const cursorScreenPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Store state in refs to avoid useEffect re-creation
  const selectionsRef = useRef(selections);
  const isPushingRef = useRef(isPushing);
  const focusedImagesRef = useRef(focusedImages);
  
  useEffect(() => { selectionsRef.current = selections; }, [selections]);
  useEffect(() => { isPushingRef.current = isPushing; }, [isPushing]);
  useEffect(() => { focusedImagesRef.current = focusedImages; }, [focusedImages]);

  // ULTRA LOW-LATENCY: Process motion immediately with direct DOM updates
  useEffect(() => {
    const handleMotion = ((event: CustomEvent<MotionEvent>) => {
      const motionData = event.detail;
      const headsetId = motionData.headsetId;
    
      if (selectionsRef.current.has(headsetId)) return;
      if (isPushingRef.current.get(headsetId)) return; // Freeze cursor during push
      
      // SMOOTHING FILTERS for fluid cursor movement like Emotiv Gyro visualizer
      if (!pitchFilters.current.has(headsetId)) {
        pitchFilters.current.set(headsetId, new OneEuroFilter(1.0, 0.007, 1.0)); // More smoothing for fluid feel
        rotationFilters.current.set(headsetId, new OneEuroFilter(1.0, 0.007, 1.0));
      }
      
      if (!centerPitch.current.has(headsetId)) {
        centerPitch.current.set(headsetId, motionData.pitch);
        centerRotation.current.set(headsetId, motionData.rotation);
      }
      
      const relativePitch = motionData.pitch - (centerPitch.current.get(headsetId) || 0);
      const relativeRotation = motionData.rotation - (centerRotation.current.get(headsetId) || 0);
      
      // IMMEDIATE filtering - use performance.now() for high precision
      const now = performance.now();
      const smoothPitch = pitchFilters.current.get(headsetId)!.filter(relativePitch, now);
      const smoothRotation = rotationFilters.current.get(headsetId)!.filter(relativeRotation, now);
      
      // DIRECT POSITION MAPPING (not velocity) for instant response
      const maxAngle = 30; // Higher angle = slower, more deliberate cursor movement
      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;
      
      // Rotation (yaw/head turn left-right) controls X, Pitch (head tilt up-down) controls Y
      // Negated for correct direction: look right = cursor right, look up = cursor up
      let cursorScreenX = screenCenterX - (smoothRotation / maxAngle) * screenCenterX;
      let cursorScreenY = screenCenterY + (smoothPitch / maxAngle) * screenCenterY;

      // 🔒 Constrain cursor to the 3x3 image grid bounding box
      let minLeft = Infinity;
      let maxRight = -Infinity;
      let minTop = Infinity;
      let maxBottom = -Infinity;

      for (const element of imageRefs.current.values()) {
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        minLeft = Math.min(minLeft, rect.left);
        maxRight = Math.max(maxRight, rect.right);
        minTop = Math.min(minTop, rect.top);
        maxBottom = Math.max(maxBottom, rect.bottom);
      }

      if (minLeft !== Infinity && maxRight !== -Infinity) {
        cursorScreenX = Math.max(minLeft, Math.min(maxRight, cursorScreenX));
        cursorScreenY = Math.max(minTop, Math.min(maxBottom, cursorScreenY));
      } else {
        // Fallback to screen bounds
        cursorScreenX = Math.max(0, Math.min(window.innerWidth, cursorScreenX));
        cursorScreenY = Math.max(0, Math.min(window.innerHeight, cursorScreenY));
      }
      
      // Store cursor position in ref (no React state update for cursor!)
      cursorScreenPositions.current.set(headsetId, { x: cursorScreenX, y: cursorScreenY });
      
      // DIRECT DOM MANIPULATION - bypass React rendering for zero latency
      const cursorElement = cursorRefs.current.get(headsetId);
      if (cursorElement) {
        cursorElement.style.transform = `translate(${cursorScreenX}px, ${cursorScreenY}px)`;
      }
      
      // Check which image the cursor is hovering over
      let hoveredImageId: number | undefined;
      for (const [imageId, element] of imageRefs.current.entries()) {
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        
        if (
          cursorScreenX >= rect.left &&
          cursorScreenX <= rect.right &&
          cursorScreenY >= rect.top &&
          cursorScreenY <= rect.bottom
        ) {
          hoveredImageId = imageId;
          break;
        }
      }
      
      // Only update React state for focus changes (UI feedback only, not cursor position)
      const currentFocus = focusedImagesRef.current.get(headsetId);
      if (hoveredImageId !== undefined && currentFocus !== hoveredImageId) {
        setFocusedImages(prev => new Map(prev).set(headsetId, hoveredImageId));
      } else if (hoveredImageId === undefined && currentFocus !== undefined) {
        setFocusedImages(prev => {
          const updated = new Map(prev);
          updated.delete(headsetId);
          return updated;
        });
      }
    }) as EventListener;

    window.addEventListener('motion-event', handleMotion);
    return () => window.removeEventListener('motion-event', handleMotion);
  }, []); // Empty deps - use refs instead of state

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

  // Navigate to Level 2 once all headsets have selected
  useEffect(() => {
    if (connectedHeadsets && selections.size === connectedHeadsets.length && selections.size > 0) {
      // Aggregate metadata from Level 1 selections
      const level1Metadata: string[] = [];
      selections.forEach((imageId) => {
        const image = level1Images.find((img) => img.position === imageId);
        if (image) {
          level1Metadata.push(image.metadata);
        }
      });

      setTimeout(() => {
        navigate("/excitement-level-2", {
          state: {
            videoJobId,
            connectedHeadsets,
            mentalCommand,
            motionEvent,
            excitementLevel1Selections: selections,
            level1Metadata
          }
        });
      }, 1500);
    }
  }, [selections, connectedHeadsets, navigate, videoJobId, level1Images]);

  return (
    <div className="min-h-screen relative">
      <Brain3D excitement={0.5} className="opacity-20 z-0" />
      <Header />
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Level 1: Landscapes
            </h1>
            <p className="text-lg text-muted-foreground">
              Move your cursor with head tilt • Hold PUSH to select
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-12">
            {level1Images.map((image) => {
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
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ULTRA LOW-LATENCY CURSORS - Direct DOM manipulation via refs */}
      {connectedHeadsets?.map((headsetId: string) => {
        if (selections.has(headsetId)) return null;
        const color = getHeadsetColor(headsetId);
        return (
          <div
            key={`cursor-${headsetId}`}
            ref={(el) => { if (el) cursorRefs.current.set(headsetId, el); }}
            className="fixed pointer-events-none z-50"
            style={{
              left: 0,
              top: 0,
              willChange: 'transform',
              transform: 'translate(0px, 0px)',
            }}
          >
            <div
              className="w-8 h-8 -ml-4 -mt-4 rounded-full border-4"
              style={{
                borderColor: color,
                backgroundColor: `${color}40`,
                boxShadow: `0 0 20px ${color}`
              }}
            />
          </div>
        );
      })}

      {/* Bottom progress bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border p-4 z-40">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-6">
            {connectedHeadsets?.map((headsetId: string) => {
              const color = getHeadsetColor(headsetId);
              const progress = pushProgress.get(headsetId) || 0;
              const hasSelected = selections.has(headsetId);
              const pushing = isPushing.get(headsetId) || false;
              
              return (
                <div key={headsetId} className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono" style={{ color }}>
                      {hasSelected ? '✓ Selected' : pushing ? 'Pushing...' : 'Ready'}
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
        currentLevel={1}
        onForceSelection={(headsetId, imageId) => {
          setSelections(prev => new Map(prev).set(headsetId, imageId));
        }}
      />
    </div>
  );
};

export default ExcitementLevel1;
