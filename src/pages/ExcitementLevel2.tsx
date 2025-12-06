import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getHeadsetColor } from "@/utils/headsetColors";
import type { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";
import { level1NewImages } from "@/data/level1NewImages";
import { RemoteOperatorPanel } from "@/components/RemoteOperatorPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { ContactQualityButton } from "@/components/ContactQualityButton";

interface Level2Image {
  id: number;
  position: number;
  url: string;
  metadata: string;
}

const PUSH_POWER_THRESHOLD = 0.3;
const PUSH_HOLD_TIME_MS = 5000;
const DECAY_RATE = 2;
const AUTO_CONTINUE_THRESHOLD = 15; // Once past this %, auto-continue to 100%
const AUTO_FILL_RATE = 1.5; // Progress increase per frame during auto-fill

const ExcitementLevel2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tiltThreshold } = useSettings();
  
  const { 
    connectedHeadsets: stateHeadsets,
    mentalCommand,
    motionEvent,
    level1Metadata
  } = location.state || {};

  const [activeHeadsets, setActiveHeadsets] = useState<string[]>(stateHeadsets || []);
  const activeHeadsetsRef = useRef<string[]>(stateHeadsets || []);

  const level2Images: Level2Image[] = level1NewImages.map((img, idx) => ({
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

  // ULTRA LOW-LATENCY: Process motion immediately with direct DOM updates
  useEffect(() => {
    console.log('Motion listener registered, activeHeadsets:', activeHeadsets);
    
    const handleMotion = ((event: CustomEvent<MotionEvent>) => {
      const motionData = event.detail;
      const headsetId = motionData.headsetId;
      
      console.log('Motion event received:', headsetId, motionData.pitch, motionData.rotation);
      
      // Dynamically add headset if not already tracked (for cursor rendering)
      if (!activeHeadsetsRef.current.includes(headsetId)) {
        activeHeadsetsRef.current = [...activeHeadsetsRef.current, headsetId];
        setActiveHeadsets([...activeHeadsetsRef.current]);
      }
    
      if (selectionsRef.current.has(headsetId)) return;
      if (isPushingRef.current.get(headsetId)) return; // Freeze cursor during push

      // Create cursor element dynamically if it doesn't exist yet
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
        console.log('Created cursor for headset:', headsetId);
      }
      
      // Calculate relative head position from calibrated center
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
      
      // Horizontal: rotation controls left/right
      if (relativeRotation < -MOVE_THRESHOLD && currentCol < COLS - 1) {
        newCol = currentCol + 1; // Tilt right -> move right
      } else if (relativeRotation > MOVE_THRESHOLD && currentCol > 0) {
        newCol = currentCol - 1; // Tilt left -> move left
      }
      
      // Vertical: pitch controls up/down
      if (relativePitch < -MOVE_THRESHOLD && currentRow < ROWS - 1) {
        newRow = currentRow + 1; // Tilt down -> move down
      } else if (relativePitch > MOVE_THRESHOLD && currentRow > 0) {
        newRow = currentRow - 1; // Tilt up -> move up
      }
      
      const newIndex = newRow * COLS + newCol;
      const hoveredImageId = Math.min(newIndex, TOTAL_BOXES - 1);
      
      // Get the target box element and snap cursor to its center
      const targetElement = imageRefs.current.get(hoveredImageId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const snapX = rect.left + rect.width / 2;
        const snapY = rect.top + rect.height / 2;
        
        // DIRECT DOM MANIPULATION - snap cursor to box center
        const cursorElement = cursorRefs.current.get(headsetId);
        if (cursorElement) {
          cursorElement.style.transform = `translate(${snapX}px, ${snapY}px)`;
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

  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Navigate to VideoOutput once all headsets have selected - trigger Sora generation
  useEffect(() => {
    if (activeHeadsets.length > 0 && selections.size === activeHeadsets.length && selections.size > 0 && !isGenerating) {
      // Aggregate metadata from Level 2 selections
      const level2Metadata: string[] = [];
      selections.forEach((imageId) => {
        const image = level2Images.find((img) => img.position === imageId);
        if (image) {
          level2Metadata.push(image.metadata);
        }
      });
      
      // Combine Level 1 and Level 2 metadata
      const allMetadata = [...(level1Metadata || []), ...level2Metadata];

      // Trigger Sora video generation
      const generateVideo = async () => {
        setIsGenerating(true);
        
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
          toast({
            title: "API Key Required",
            description: "Please set your OpenAI API key in settings first.",
            variant: "destructive"
          });
          setIsGenerating(false);
          return;
        }

        try {
          // Auto-open popout window before generation starts
          const popoutWindow = window.open('/video-popout', 'bravewave-video', 'width=1280,height=720');
          
          const { data, error } = await supabase.functions.invoke('generate-sora-video', {
            body: { 
              metadata: allMetadata,
              apiKey 
            }
          });

          if (error) throw error;

          // Update popout with jobId for polling
          if (popoutWindow) {
            popoutWindow.location.href = `/video-popout?jobId=${data.jobId}`;
          }

          // Navigate to Level 3 (Emotion Carousel) with the job ID
          navigate("/excitement-level-3", {
            state: {
              videoJobId: data.jobId,
              metadata: allMetadata,
              connectedHeadsets: activeHeadsets
            }
          });
        } catch (err: any) {
          console.error('Sora generation error:', err);
          toast({
            title: "Generation Error",
            description: err.message || "Failed to start video generation",
            variant: "destructive"
          });
          setIsGenerating(false);
        }
      };

      setTimeout(() => generateVideo(), 1500);
    }
  }, [selections, activeHeadsets, navigate, level2Images, isGenerating, toast]);

  return (
    <div className="min-h-screen relative">
      <Brain3D excitement={0.5} className="opacity-20 z-0" />
      <Header />
      <ContactQualityButton connectedHeadsets={activeHeadsets} />
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Level 2: Vision
            </h1>
            <p className="text-lg text-muted-foreground">
              Move your cursor with head tilt • Hold PUSH to select
            </p>
            <button
              onClick={() => {
                // Reset all headset calibrations to current position
                centerPitch.current.clear();
                centerRotation.current.clear();
              }}
              className="mt-4 px-6 py-2 bg-primary/20 border border-primary/50 rounded-lg text-primary hover:bg-primary/30 transition-colors"
            >
              Orient Front
            </button>
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
                        alt={`Vision ${image.id}`}
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
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ULTRA LOW-LATENCY CURSORS - Direct DOM manipulation via refs */}
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

      {/* Bottom progress bar */}
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
        currentLevel={2}
        onForceSelection={(headsetId, imageId) => {
          setSelections(prev => new Map(prev).set(headsetId, imageId));
        }}
      />
    </div>
  );
};

export default ExcitementLevel2;
