import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Music } from "lucide-react";
import { excitementLevel2Images } from "@/data/excitementImages";
import { getHeadsetColor } from "@/utils/headsetColors";
import type { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";
import { OneEuroFilter, applySensitivityCurve } from "@/utils/OneEuroFilter";

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
  
  // Store state in refs to avoid useEffect re-creation
  const selectionsRef = useRef(selections);
  const isPushingRef = useRef(isPushing);
  const focusedImagesRef = useRef(focusedImages);
  
  useEffect(() => { selectionsRef.current = selections; }, [selections]);
  useEffect(() => { isPushingRef.current = isPushing; }, [isPushing]);
  useEffect(() => { focusedImagesRef.current = focusedImages; }, [focusedImages]);
  
  const pitchFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  const rotationFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  const pushStartTimes = useRef<Map<string, number>>(new Map());
  const centerPitch = useRef<Map<string, number>>(new Map());
  const centerRotation = useRef<Map<string, number>>(new Map());
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const cursorRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // ULTRA LOW-LATENCY: Direct cursor position storage (no React state for cursor updates)
  const cursorScreenPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // DEBUG STATE
  const [debugInfo, setDebugInfo] = useState<Map<string, any>>(new Map());
  const lastMotionTime = useRef<Map<string, number>>(new Map());
  const motionEventCount = useRef<Map<string, number>>(new Map());

  // ULTRA LOW-LATENCY: Process motion immediately with direct DOM updates
  useEffect(() => {
    const handleRecalibrate = () => {
      connectedHeadsets?.forEach((headsetId: string) => {
        centerPitch.current.delete(headsetId);
        centerRotation.current.delete(headsetId);
      });
    };
    
    window.addEventListener('recalibrate-center', handleRecalibrate);
    
    const handleMotion = ((event: CustomEvent<MotionEvent>) => {
      const motionData = event.detail;
      const headsetId = motionData.headsetId;
      
      // DEBUG: Track timing
      const now = performance.now();
      const lastTime = lastMotionTime.current.get(headsetId) || now;
      const deltaTime = now - lastTime;
      lastMotionTime.current.set(headsetId, now);
      motionEventCount.current.set(headsetId, (motionEventCount.current.get(headsetId) || 0) + 1);
      
      if (selectionsRef.current.has(headsetId)) return;
      if (isPushingRef.current.get(headsetId)) return;
      
      // MORE AGGRESSIVE FILTERS for even lower latency
      if (!pitchFilters.current.has(headsetId)) {
        pitchFilters.current.set(headsetId, new OneEuroFilter(3.0, 0.001, 1.0));
        rotationFilters.current.set(headsetId, new OneEuroFilter(3.0, 0.001, 1.0));
      }
      
      if (!centerPitch.current.has(headsetId)) {
        centerPitch.current.set(headsetId, motionData.pitch);
        centerRotation.current.set(headsetId, motionData.rotation);
      }
      
      const relativePitch = motionData.pitch - (centerPitch.current.get(headsetId) || 0);
      const relativeRotation = motionData.rotation - (centerRotation.current.get(headsetId) || 0);
      
      // IMMEDIATE filtering - use performance.now() for high precision
      const smoothPitch = pitchFilters.current.get(headsetId)!.filter(relativePitch, now);
      const smoothRotation = rotationFilters.current.get(headsetId)!.filter(relativeRotation, now);
      
      // DIRECT POSITION MAPPING (not velocity) for instant response
      const maxAngle = 15; // Reduced from 30° for faster, more responsive cursor movement
      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;
      
      let cursorScreenX = screenCenterX + (smoothRotation / maxAngle) * screenCenterX;
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

      // DEBUG: Update debug info every 10 frames to avoid overwhelming React
      if ((motionEventCount.current.get(headsetId) || 0) % 10 === 0) {
        setDebugInfo(prev => new Map(prev).set(headsetId, {
          rawPitch: motionData.pitch.toFixed(2),
          rawRotation: motionData.rotation.toFixed(2),
          relativePitch: relativePitch.toFixed(2),
          relativeRotation: relativeRotation.toFixed(2),
          smoothPitch: smoothPitch.toFixed(2),
          smoothRotation: smoothRotation.toFixed(2),
          cursorX: cursorScreenX.toFixed(0),
          cursorY: cursorScreenY.toFixed(0),
          focusedImage: hoveredImageId || 'none',
          deltaTime: deltaTime.toFixed(1),
          fps: (1000 / deltaTime).toFixed(1),
          eventCount: motionEventCount.current.get(headsetId) || 0
        }));
      }
    }) as EventListener;

    window.addEventListener('motion-event', handleMotion);
    return () => {
      window.removeEventListener('motion-event', handleMotion);
      window.removeEventListener('recalibrate-center', handleRecalibrate);
    };
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

  useEffect(() => {
    if (connectedHeadsets && selections.size === connectedHeadsets.length && selections.size > 0) {
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
      <Brain3D excitement={0.5} className="opacity-20 z-0" />
      <Header />

      {/* DEBUG HUD */}
      {connectedHeadsets?.map((headsetId: string) => {
        const info = debugInfo.get(headsetId);
        if (!info) return null;
        const color = getHeadsetColor(headsetId);
        
        return (
          <div 
            key={`debug-${headsetId}`}
            className="fixed top-20 right-4 z-50 bg-black/90 text-white p-4 rounded-lg font-mono text-xs border-2"
            style={{ borderColor: color, maxWidth: '300px' }}
          >
            <div className="font-bold mb-2" style={{ color }}>DEBUG: {headsetId}</div>
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <div>Raw Pitch:</div><div className="text-right">{info.rawPitch}°</div>
                <div>Raw Rotation:</div><div className="text-right">{info.rawRotation}°</div>
                <div>Rel Pitch:</div><div className="text-right text-cyan-400">{info.relativePitch}°</div>
                <div>Rel Rotation:</div><div className="text-right text-cyan-400">{info.relativeRotation}°</div>
                <div>Smooth Pitch:</div><div className="text-right text-green-400">{info.smoothPitch}°</div>
                <div>Smooth Rot:</div><div className="text-right text-green-400">{info.smoothRotation}°</div>
                <div className="col-span-2 border-t border-gray-700 my-1"></div>
                <div>Cursor X:</div><div className="text-right text-yellow-400">{info.cursorX}px</div>
                <div>Cursor Y:</div><div className="text-right text-yellow-400">{info.cursorY}px</div>
                <div>Focused:</div><div className="text-right text-purple-400">#{info.focusedImage}</div>
                <div className="col-span-2 border-t border-gray-700 my-1"></div>
                <div>Delta Time:</div><div className="text-right">{info.deltaTime}ms</div>
                <div>FPS:</div><div className="text-right text-green-400">{info.fps}</div>
                <div>Events:</div><div className="text-right text-gray-400">{info.eventCount}</div>
              </div>
            </div>
          </div>
        );
      })}
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Music className="h-12 w-12 text-primary animate-pulse" />
              <button
                onClick={() => {
                  connectedHeadsets?.forEach((headsetId: string) => {
                    const lastMotion = lastMotionTime.current.get(headsetId);
                    if (lastMotion) {
                      // Recalibrate center to current head position
                      window.dispatchEvent(new CustomEvent('recalibrate-center'));
                    }
                  });
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                📍 Recalibrate Center
              </button>
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Level 2: Theme Selection
            </h1>
            <p className="text-lg text-muted-foreground">
              Move your cursor with head tilt • Hold PUSH to select
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
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
                <div 
                  key={image.id}
                  ref={(el) => { if (el) imageRefs.current.set(image.id, el); }}
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
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        style={{
                          filter: isFocused ? 'brightness(1.2)' : 'brightness(1)'
                        }}
                      />

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
                      <p className="text-sm font-semibold text-center">{image.title}</p>
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

      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default ExcitementLevel2;
