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
  const [cursorPositions, setCursorPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [focusedImages, setFocusedImages] = useState<Map<string, number>>(new Map());
  const [pushProgress, setPushProgress] = useState<Map<string, number>>(new Map());
  const [isPushing, setIsPushing] = useState<Map<string, boolean>>(new Map());
  
  const pitchFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  const rotationFilters = useRef<Map<string, OneEuroFilter>>(new Map());
  const pushStartTimes = useRef<Map<string, number>>(new Map());
  const centerPitch = useRef<Map<string, number>>(new Map());
  const centerRotation = useRef<Map<string, number>>(new Map());
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  
  const SENSITIVITY = 2.5;

  useEffect(() => {
    const handleMotion = ((event: CustomEvent<MotionEvent>) => {
      const motionData = event.detail;
      const headsetId = motionData.headsetId;
      
      if (selections.has(headsetId)) return;
      if (isPushing.get(headsetId)) return;
      
      if (!pitchFilters.current.has(headsetId)) {
        pitchFilters.current.set(headsetId, new OneEuroFilter(1.0, 0.007, 1.0));
        rotationFilters.current.set(headsetId, new OneEuroFilter(1.0, 0.007, 1.0));
      }
      
      if (!centerPitch.current.has(headsetId)) {
        centerPitch.current.set(headsetId, motionData.pitch);
        centerRotation.current.set(headsetId, motionData.rotation);
      }
      
      const relativePitch = motionData.pitch - (centerPitch.current.get(headsetId) || 0);
      const relativeRotation = motionData.rotation - (centerRotation.current.get(headsetId) || 0);
      
      const smoothPitch = pitchFilters.current.get(headsetId)!.filter(relativePitch, motionData.time);
      const smoothRotation = rotationFilters.current.get(headsetId)!.filter(relativeRotation, motionData.time);
      
      const scaledPitch = applySensitivityCurve(smoothPitch, 1.0, 3.0, 20, 15);
      const scaledRotation = applySensitivityCurve(smoothRotation, 1.0, 3.0, 20, 15);
      
      const cursorX = 50 + (scaledRotation * SENSITIVITY);
      const cursorY = 50 + (scaledPitch * SENSITIVITY);
      const clampedX = Math.max(0, Math.min(100, cursorX));
      const clampedY = Math.max(0, Math.min(100, cursorY));
      
      setCursorPositions(prev => new Map(prev).set(headsetId, { x: clampedX, y: clampedY }));
      
      let hoveredImageId: number | undefined;
      for (const [imageId, element] of imageRefs.current.entries()) {
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        const cursorScreenX = (clampedX / 100) * window.innerWidth;
        const cursorScreenY = (clampedY / 100) * window.innerHeight;
        
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
      
      const currentFocus = focusedImages.get(headsetId);
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
  }, [selections, isPushing]);

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
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Music className="h-12 w-12 text-primary animate-pulse" />
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

      {/* Cursor dots */}
      {Array.from(cursorPositions.entries()).map(([headsetId, pos]) => {
        if (selections.has(headsetId)) return null;
        const color = getHeadsetColor(headsetId);
        return (
          <div
            key={`cursor-${headsetId}`}
            className="fixed pointer-events-none z-50 transition-all duration-75"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="w-8 h-8 rounded-full border-4"
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
