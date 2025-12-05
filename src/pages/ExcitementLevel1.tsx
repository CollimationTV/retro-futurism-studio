import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getHeadsetColor } from "@/utils/headsetColors";
import type { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";
import { level1Images as localLevel1Images } from "@/data/imageData";
import { RemoteOperatorPanel } from "@/components/RemoteOperatorPanel";
import { useSettings } from "@/contexts/SettingsContext";

interface Level1Image {
  id: number;
  position: number;
  url: string;
  metadata: string;
}

const PUSH_POWER_THRESHOLD = 0.3;
const PUSH_HOLD_TIME_MS = 5000;
const DECAY_RATE = 2; // Progress decay per frame when not pushing
const AUTO_CONTINUE_THRESHOLD = 15; // Once past this %, auto-continue to 100%
const AUTO_FILL_RATE = 1.5; // Progress increase per frame during auto-fill

const ExcitementLevel1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tiltThreshold } = useSettings();
  
  const { 
    connectedHeadsets: stateHeadsets,
  } = location.state || {};

  const [activeHeadsets, setActiveHeadsets] = useState<string[]>(stateHeadsets || []);
  const activeHeadsetsRef = useRef<string[]>(stateHeadsets || []);

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
  const [motionDebug, setMotionDebug] = useState<Map<string, { pitch: number; rotation: number; relPitch: number; relRotation: number }>>(new Map());
  
  const pushStartTimes = useRef<Map<string, number>>(new Map());
  const centerPitch = useRef<Map<string, number>>(new Map());
  const centerRotation = useRef<Map<string, number>>(new Map());
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const cursorRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const selectionsRef = useRef(selections);
  const isPushingRef = useRef(isPushing);
  const focusedImagesRef = useRef(focusedImages);
  const tiltThresholdRef = useRef(tiltThreshold);
  
  useEffect(() => { selectionsRef.current = selections; }, [selections]);
  useEffect(() => { isPushingRef.current = isPushing; }, [isPushing]);
  useEffect(() => { focusedImagesRef.current = focusedImages; }, [focusedImages]);
  useEffect(() => { tiltThresholdRef.current = tiltThreshold; }, [tiltThreshold]);

  useEffect(() => {
    console.log('Level 1 Motion listener registered, activeHeadsets:', activeHeadsets);
    
    const handleMotion = ((event: CustomEvent<MotionEvent>) => {
      const motionData = event.detail;
      const headsetId = motionData.headsetId;
      
      console.log('Level 1 Motion event received:', headsetId, motionData.pitch, motionData.rotation);
      
      if (!activeHeadsetsRef.current.includes(headsetId)) {
        activeHeadsetsRef.current = [...activeHeadsetsRef.current, headsetId];
        setActiveHeadsets([...activeHeadsetsRef.current]);
      }
    
      if (selectionsRef.current.has(headsetId)) return;
      if (isPushingRef.current.get(headsetId)) return;

      if (!cursorRefs.current.has(headsetId)) {
        const cursorContainer = document.createElement('div');
        cursorContainer.className = 'fixed pointer-events-none z-50';
        cursorContainer.style.left = '0';
        cursorContainer.style.top = '0';
        cursorContainer.style.willChange = 'transform';
        cursorContainer.style.transform = 'translate(0px, 0px)';
        
        const cursorDot = document.createElement('div');
        const color = getHeadsetColor(headsetId);
        cursorDot.className = 'w-8 h-8 -ml-4 -mt-4 rounded-full border-4';
        cursorDot.style.borderColor = color;
        cursorDot.style.backgroundColor = `${color}40`;
        cursorDot.style.boxShadow = `0 0 20px ${color}`;
        
        cursorContainer.appendChild(cursorDot);
        document.body.appendChild(cursorContainer);
        cursorRefs.current.set(headsetId, cursorContainer);
      }
      
      if (!centerPitch.current.has(headsetId)) {
        centerPitch.current.set(headsetId, motionData.pitch);
        centerRotation.current.set(headsetId, motionData.rotation);
      }
      
      const relativePitch = motionData.pitch - (centerPitch.current.get(headsetId) || 0);
      const relativeRotation = motionData.rotation - (centerRotation.current.get(headsetId) || 0);

      // Update motion debug display
      setMotionDebug(prev => new Map(prev).set(headsetId, {
        pitch: motionData.pitch,
        rotation: motionData.rotation,
        relPitch: relativePitch,
        relRotation: relativeRotation
      }));

      const COLS = 4;
      const ROWS = 2;
      const TOTAL_BOXES = 8;
      
      if (!focusedImagesRef.current.has(headsetId)) {
        focusedImagesRef.current.set(headsetId, 0);
      }
      
      const currentIndex = focusedImagesRef.current.get(headsetId) || 0;
      const currentRow = Math.floor(currentIndex / COLS);
      const currentCol = currentIndex % COLS;
      
      // Use settings threshold for movement
      const MOVE_THRESHOLD = tiltThresholdRef.current;
      
      let newCol = currentCol;
      let newRow = currentRow;
      
      if (relativeRotation < -MOVE_THRESHOLD && currentCol < COLS - 1) {
        newCol = currentCol + 1;
      } else if (relativeRotation > MOVE_THRESHOLD && currentCol > 0) {
        newCol = currentCol - 1;
      }
      
      if (relativePitch < -MOVE_THRESHOLD && currentRow < ROWS - 1) {
        newRow = currentRow + 1;
      } else if (relativePitch > MOVE_THRESHOLD && currentRow > 0) {
        newRow = currentRow - 1;
      }
      
      const newIndex = newRow * COLS + newCol;
      const hoveredImageId = Math.min(newIndex, TOTAL_BOXES - 1);
      
      const targetElement = imageRefs.current.get(hoveredImageId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const snapX = rect.left + rect.width / 2;
        const snapY = rect.top + rect.height / 2;
        
        const cursorElement = cursorRefs.current.get(headsetId);
        if (cursorElement) {
          cursorElement.style.transform = `translate(${snapX}px, ${snapY}px)`;
        }
      }
      
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
  }, []);

  useEffect(() => {
    const handleMentalCommand = ((event: CustomEvent<MentalCommandEvent>) => {
      const commandData = event.detail;
      const headsetId = commandData.headsetId;
    
      if (selections.has(headsetId)) return;
      
      const focusedImageId = focusedImages.get(headsetId);
      if (focusedImageId === undefined) return;
      
      // Get current progress
      const currentProgress = pushProgress.get(headsetId) || 0;
      
      if (commandData.com === 'push' && commandData.pow >= PUSH_POWER_THRESHOLD) {
        // Active push above threshold - progress increases
        if (!pushStartTimes.current.has(headsetId)) {
          pushStartTimes.current.set(headsetId, Date.now());
        }
        
        setIsPushing(prev => new Map(prev).set(headsetId, true));
        
        const startTime = pushStartTimes.current.get(headsetId)!;
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / PUSH_HOLD_TIME_MS) * 100);
        
        setPushProgress(prev => new Map(prev).set(headsetId, progress));
        
        // Selection completes at 100%
        if (progress >= 100) {
          setSelections(prev => new Map(prev).set(headsetId, focusedImageId));
          pushStartTimes.current.delete(headsetId);
          setIsPushing(prev => {
            const updated = new Map(prev);
            updated.delete(headsetId);
            return updated;
          });
          setPushProgress(prev => new Map(prev).set(headsetId, 0));
        }
      } else if (currentProgress >= AUTO_CONTINUE_THRESHOLD) {
        // Auto-continue: past threshold, keep filling even without active push
        setIsPushing(prev => new Map(prev).set(headsetId, true));
        
        const newProgress = Math.min(100, currentProgress + AUTO_FILL_RATE);
        setPushProgress(prev => new Map(prev).set(headsetId, newProgress));
        
        // Selection completes at 100%
        if (newProgress >= 100) {
          setSelections(prev => new Map(prev).set(headsetId, focusedImageId));
          pushStartTimes.current.delete(headsetId);
          setIsPushing(prev => {
            const updated = new Map(prev);
            updated.delete(headsetId);
            return updated;
          });
          setPushProgress(prev => new Map(prev).set(headsetId, 0));
        }
      } else {
        // Not pushing and below threshold - progress decays
        pushStartTimes.current.delete(headsetId);
        setIsPushing(prev => new Map(prev).set(headsetId, false));
        
        // Decay progress
        setPushProgress(prev => {
          const current = prev.get(headsetId) || 0;
          const decayed = Math.max(0, current - DECAY_RATE);
          return new Map(prev).set(headsetId, decayed);
        });
      }
    }) as EventListener;

    window.addEventListener('mental-command', handleMentalCommand);
    return () => window.removeEventListener('mental-command', handleMentalCommand);
  }, [focusedImages, selections, pushProgress]);

  // Navigate to Level 2 once all headsets have selected
  useEffect(() => {
    if (activeHeadsets.length > 0 && selections.size === activeHeadsets.length && selections.size > 0) {
      const selectedMetadata: string[] = [];
      selections.forEach((imageId) => {
        const image = level1Images.find((img) => img.position === imageId);
        if (image) {
          selectedMetadata.push(image.metadata);
        }
      });

      setTimeout(() => {
        navigate("/excitement-level-2", {
          state: {
            level1Metadata: selectedMetadata,
            connectedHeadsets: activeHeadsets
          }
        });
      }, 1500);
    }
  }, [selections, activeHeadsets, navigate, level1Images]);

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
            <button
              onClick={() => {
                centerPitch.current.clear();
                centerRotation.current.clear();
              }}
              className="mt-4 px-6 py-2 bg-primary/20 border border-primary/50 rounded-lg text-primary hover:bg-primary/30 transition-colors"
            >
              Orient Front
            </button>
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

      {activeHeadsets.map((headsetId: string) => {
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

      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border p-4 z-40">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-6">
            {activeHeadsets.map((headsetId: string) => {
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
        connectedHeadsets={activeHeadsets}
        currentLevel={1}
        onForceSelection={(headsetId, imageId) => {
          setSelections(prev => new Map(prev).set(headsetId, imageId));
        }}
      />
    </div>
  );
};

export default ExcitementLevel1;
