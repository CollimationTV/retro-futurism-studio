import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CollectiveExcitementCore } from "@/components/CollectiveExcitementCore";
import { OrbitalExcitementRing } from "@/components/OrbitalExcitementRing";
import { ArtworkTile } from "@/components/ArtworkTile";
import { excitementLevel3Images } from "@/data/excitementImages";
import { generateSphericalLayout } from "@/utils/sphericalLayout";
import { getHeadsetColor } from "@/utils/headsetColors";
import { PerformanceMetricsEvent, MotionEvent, MentalCommandEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";
import { OperatorPanel, OperatorControls } from "@/components/OperatorPanel";
import { FuturisticGrid } from "@/components/FuturisticGrid";
import { TechnicalReadout } from "@/components/TechnicalReadout";
import { supabase } from "@/integrations/supabase/client";

const ExcitementLevel3 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { metadata, videoJobId, connectedHeadsets, mentalCommand: passedMentalCommand } = location.state || {};
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsEvent | null>(null);
  const [motionEvent, setMotionEvent] = useState<MotionEvent | null>(null);
  const [mentalCommand, setMentalCommand] = useState<MentalCommandEvent | null>(passedMentalCommand || null);
  const [excitementLevels, setExcitementLevels] = useState<Map<string, number>>(new Map());
  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [pushProgress, setPushProgress] = useState<Map<string, { startTime: number; imageId: number }>>(new Map());
  const [focusedImages, setFocusedImages] = useState<Map<string, number>>(new Map()); // headsetId -> imageId
  const [lastPushReleaseTime, setLastPushReleaseTime] = useState<Map<string, number>>(new Map());
  
  // Gyro calibration
  const [gyroMin, setGyroMin] = useState(-1);
  const [gyroMax, setGyroMax] = useState(1);
  
  // Dynamic selection constants (can be overridden by operator controls)
  const [PUSH_POWER_THRESHOLD, setPushPowerThreshold] = useState(0.30);
  const [PUSH_HOLD_TIME_MS] = useState(4000);
  const [POST_PUSH_DELAY_MS] = useState(3000);
  
  // Session ID for operator controls
  const sessionId = videoJobId || `session-${Date.now()}`;
  
  const positions = generateSphericalLayout();
  
  // Calculate average excitement across all headsets
  const averageExcitement = Array.from(excitementLevels.values()).reduce((sum, val) => sum + val, 0) / Math.max(excitementLevels.size, 1);
  
  // Handle operator controls updates
  const handleOperatorControlsChange = (controls: OperatorControls) => {
    console.log('🎛️ Operator controls updated:', controls);
    setPushPowerThreshold(controls.pushSensitivity);
    
    // Handle manual selection
    if (controls.manualSelection.headsetId && 
        controls.manualSelection.imageId !== null && 
        controls.manualSelection.level === 3) {
      console.log(`🎯 Operator forcing selection for ${controls.manualSelection.headsetId}: image ${controls.manualSelection.imageId}`);
      setSelections(prev => new Map(prev).set(
        controls.manualSelection.headsetId!,
        controls.manualSelection.imageId!
      ));
    }
  };
  
  // Subscribe to operator controls on mount
  useEffect(() => {
    const initControls = async () => {
      const { data } = await supabase
        .from('operator_controls')
        .select('*')
        .eq('session_id', sessionId)
        .single();
        
      if (data) {
        if (data.push_sensitivity !== null) {
          setPushPowerThreshold(data.push_sensitivity);
        }
      }
    };
    
    initControls();
  }, [sessionId]);
  
  // Listen to window events for real-time performance metrics, motion, and mental commands
  useEffect(() => {
    const handlePerformanceMetrics = ((event: CustomEvent<PerformanceMetricsEvent>) => {
      console.log('📊 Level3 received performance metrics event:', event.detail);
      setPerformanceMetrics(event.detail);
    }) as EventListener;
    
    const handleMotion = ((event: CustomEvent<MotionEvent>) => {
      setMotionEvent(event.detail);
    }) as EventListener;
    
    const handleMentalCommand = ((event: CustomEvent<MentalCommandEvent>) => {
      setMentalCommand(event.detail);
    }) as EventListener;
    
    window.addEventListener('performance-metrics', handlePerformanceMetrics);
    window.addEventListener('motion-event', handleMotion);
    window.addEventListener('mental-command', handleMentalCommand);
    
    console.log('✅ Level3 event listeners registered');
    
    return () => {
      window.removeEventListener('performance-metrics', handlePerformanceMetrics);
      window.removeEventListener('motion-event', handleMotion);
      window.removeEventListener('mental-command', handleMentalCommand);
    };
  }, []);
  
  // Initialize focused images for each headset
  useEffect(() => {
    if (connectedHeadsets && connectedHeadsets.length > 0 && focusedImages.size === 0) {
      const initialFocus = new Map();
      connectedHeadsets.forEach((headsetId: string) => {
        initialFocus.set(headsetId, excitementLevel3Images[0].id);
      });
      setFocusedImages(initialFocus);
    }
  }, [connectedHeadsets, focusedImages.size]);
  
  // GYRO-BASED CURSOR NAVIGATION (replaces auto-cycling)
  useEffect(() => {
    if (!motionEvent || !connectedHeadsets || connectedHeadsets.length === 0) return;
    
    const { gyroY, headsetId } = motionEvent;
    
    // Skip if this headset already completed selection or is pushing
    if (selections.has(headsetId) || pushProgress.has(headsetId)) return;
    
    console.log(`🎮 Gyro navigation for ${headsetId}: gyroY=${gyroY}`);
    
    // Auto-calibrate gyro range
    setGyroMin(prev => Math.min(prev, gyroY));
    setGyroMax(prev => Math.max(prev, gyroY));
    
    // Normalize gyroY to 0-1 range
    const range = gyroMax - gyroMin;
    const normalized = range > 0 ? (gyroY - gyroMin) / range : 0.5;
    
    // Map to image index (0-14)
    const imageIndex = Math.floor(normalized * 15) % 15;
    const targetImageId = excitementLevel3Images[imageIndex].id;
    
    console.log(`  → Normalized: ${normalized.toFixed(2)}, Index: ${imageIndex}, ImageID: ${targetImageId}`);
    
    // Update focused image if changed
    setFocusedImages(prev => {
      const current = prev.get(headsetId);
      if (current !== targetImageId) {
        const updated = new Map(prev);
        updated.set(headsetId, targetImageId);
        console.log(`  ✨ Focus changed to image ${targetImageId}`);
        return updated;
      }
      return prev;
    });
  }, [motionEvent, connectedHeadsets, selections, pushProgress, gyroMin, gyroMax]);
  
  // Handle PUSH command hold-to-select
  useEffect(() => {
    if (!mentalCommand) return;

    const { com, headsetId, pow } = mentalCommand;
    
    if (selections.has(headsetId)) return;

    const focusedImageId = focusedImages.get(headsetId);
    if (!focusedImageId) return;

    if (com === 'push' && pow >= PUSH_POWER_THRESHOLD) {
      const now = Date.now();
      const existing = pushProgress.get(headsetId);
      
      console.log(`🔵 PUSH detected: ${headsetId}, power=${pow.toFixed(2)}, focused=${focusedImageId}`);
      
      // Start or update hold timer for this headset on the currently focused image
      if (!existing || existing.imageId !== focusedImageId) {
        setPushProgress(prev => new Map(prev).set(headsetId, { startTime: now, imageId: focusedImageId }));
        console.log(`  → Started PUSH hold on image ${focusedImageId}`);
      }
    } else {
      // Push released or below threshold - reset hold progress and record release time
      if (pushProgress.has(headsetId)) {
        console.log(`  ⭕ PUSH released: ${headsetId}`);
        setLastPushReleaseTime(prev => new Map(prev).set(headsetId, Date.now()));
      }
      setPushProgress(prev => {
        const next = new Map(prev);
        next.delete(headsetId);
        return next;
      });
    }
  }, [mentalCommand, focusedImages, selections, pushProgress, PUSH_POWER_THRESHOLD]);
  
  // Monitor push progress and lock selection after hold duration
  useEffect(() => {
    if (pushProgress.size === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();

      pushProgress.forEach((progress, headsetId) => {
        const duration = now - progress.startTime;
        if (duration >= PUSH_HOLD_TIME_MS) {
          // Hold time reached - lock selection
          if (!selections.has(headsetId)) {
            console.log(`✨ Headset ${headsetId} selected artwork ${progress.imageId} via PUSH!`);
            setSelections(prev => new Map(prev).set(headsetId, progress.imageId));
          }
          // Clear push progress
          setPushProgress(prev => {
            const next = new Map(prev);
            next.delete(headsetId);
            return next;
          });
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, [pushProgress, selections, PUSH_HOLD_TIME_MS]);
  
  // Update excitement levels with DEBUG LOGGING
  useEffect(() => {
    if (!performanceMetrics) return;
    const { excitement, headsetId } = performanceMetrics;
    
    console.log(`📊 EXCITEMENT UPDATE: ${headsetId} = ${excitement.toFixed(3)}`);
    
    setExcitementLevels(prev => {
      const updated = new Map(prev).set(headsetId, excitement);
      console.log(`  → All excitement levels:`, Array.from(updated.entries()));
      console.log(`  → Average: ${(Array.from(updated.values()).reduce((a,b) => a+b, 0) / updated.size).toFixed(3)}`);
      return updated;
    });
  }, [performanceMetrics]);
  
  // Check if all selections complete
  useEffect(() => {
    if (connectedHeadsets && connectedHeadsets.length > 0 && selections.size === connectedHeadsets.length) {
      console.log("🎉 All excitement selections complete!");
      
      // Calculate collective excitement score (0-100)
      const collectiveScore = Math.round(averageExcitement * 100);
      
      // Navigate to audio emotion page
      setTimeout(() => {
        navigate("/audio-emotion", {
          state: {
            videoJobId,
            metadata,
            connectedHeadsets,
            mentalCommand,
            performanceMetrics,
            level3Selections: Array.from(selections.entries()),
            collectiveScore
          }
        });
      }, 2000);
    }
  }, [selections, connectedHeadsets, navigate, metadata, averageExcitement]);
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dense grid background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Animated Brain Background */}
      <Brain3D excitement={averageExcitement} className="opacity-15 z-0" />
      
      {/* Futuristic grid overlay */}
      <FuturisticGrid className="opacity-30" />
      
      <Header />
      
      {/* Operator Panel */}
      <OperatorPanel 
        sessionId={sessionId}
        connectedHeadsets={connectedHeadsets || []}
        currentLevel={3}
        onControlsChange={handleOperatorControlsChange}
      />
      
      {/* Technical Readout */}
      <TechnicalReadout
        connectedHeadsets={connectedHeadsets?.length || 0}
        averageExcitement={averageExcitement}
        selectionsComplete={selections.size}
        totalSelections={connectedHeadsets?.length || 0}
      />
      
      {/* DEBUG PANEL */}
      <div className="fixed top-20 right-4 z-50 bg-background/90 border border-primary/30 rounded p-4 text-xs font-mono max-w-xs">
        <div className="text-primary font-bold mb-2">DEBUG: EXCITEMENT METRICS</div>
        <div className="space-y-1 text-foreground/70">
          <div>Stream: {performanceMetrics ? '🟢 ACTIVE' : '🔴 NO DATA'}</div>
          <div>Avg Excitement: {(averageExcitement * 100).toFixed(1)}%</div>
          <div className="border-t border-primary/20 my-2 pt-2">
            <div className="font-semibold mb-1">Per Headset:</div>
            {connectedHeadsets?.map((hId: string) => (
              <div key={hId} className="flex justify-between">
                <span>{hId.slice(0, 8)}:</span>
                <span className="text-accent">{((excitementLevels.get(hId) || 0) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="border-t border-primary/20 my-2 pt-2">
            <div>Last Update: {performanceMetrics ? new Date().toLocaleTimeString() : 'Never'}</div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-8 relative z-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <h1 
            className="text-6xl font-bold uppercase tracking-[0.3em] neon-glow mb-4 relative"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <span className="text-xs text-primary/60 absolute -top-6 left-1/2 transform -translate-x-1/2 font-mono">
              [ LEVEL 03 ]
            </span>
            RESONANCE_SPHERE
          </h1>
          <div className="glass-panel inline-block px-8 py-4 mt-6 tech-border">
            <p className="text-lg text-foreground font-mono uppercase tracking-wider">
              → USE HEAD MOTION TO NAVIGATE • PUSH TO SELECT
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-sm font-mono">
              <span className="text-primary/80">STATUS:</span>
              <span className="text-accent">{selections.size}</span>
              <span className="text-primary/60">/</span>
              <span className="text-primary">{connectedHeadsets?.length || 0}</span>
              <span className="text-primary/60">COMPLETE</span>
            </div>
          </div>
        </div>
        
        {/* Main visualization container */}
        <div className="relative w-full" style={{ height: '80vh' }}>
          {/* Central collective excitement core */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <CollectiveExcitementCore averageExcitement={averageExcitement} size={300} />
          </div>
          
          {/* Orbital rings for each headset */}
          {connectedHeadsets?.map((headsetId: string, index: number) => {
            const excitement = excitementLevels.get(headsetId) || 0;
            const color = getHeadsetColor(headsetId);
            const radius = 250 + (index * 50);
            const speed = 15 + (index * 5);
            
            return (
              <OrbitalExcitementRing
                key={headsetId}
                excitement={excitement}
                color={color}
                radius={radius}
                speed={speed}
                headsetId={headsetId}
              />
            );
          })}
          
          {/* Artwork tiles in circular layout */}
          <div className="absolute inset-0">
            {excitementLevel3Images.map((image, index) => {
              const position = positions[index];
              const focusedByHeadsets = Array.from(focusedImages.entries())
                .filter(([_, imgId]) => imgId === image.id)
                .map(([headsetId]) => headsetId)
                .filter(hId => !selections.has(hId));
              
              const focusColors = focusedByHeadsets.map(hId => getHeadsetColor(hId));
              const isFocusedByAny = focusColors.length > 0;
              
              // Calculate push progress
              let maxPushProgress = 0;
              focusedByHeadsets.forEach(headsetId => {
                const progress = pushProgress.get(headsetId);
                if (progress && progress.imageId === image.id) {
                  const elapsed = Date.now() - progress.startTime;
                  maxPushProgress = Math.max(maxPushProgress, Math.min(elapsed / PUSH_HOLD_TIME_MS, 1));
                }
              });
              
              const isSelected = Array.from(selections.values()).includes(image.id);
              
              return (
                <ArtworkTile
                  key={image.id}
                  id={image.id}
                  url={image.url}
                  title={image.title}
                  position={{ x: position.x, y: position.y }}
                  scale={position.scale}
                  zIndex={position.zIndex}
                  excitementProgress={maxPushProgress}
                  threshold={1}
                  isSelected={isSelected}
                  isFocusedByAny={isFocusedByAny}
                  focusColors={focusColors}
                />
              );
            })}
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            {selections.size} / {connectedHeadsets?.length || 0} selections complete
          </p>
        </div>
      </div>
      
      {/* Manual navigation buttons for testing */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          ← Level 1
        </button>
        <button
          onClick={() => navigate("/level2", { state: { level1Selections: new Map(), connectedHeadsets, mentalCommand, motionEvent } })}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          ← Level 2
        </button>
        <button
          onClick={() => navigate("/audio-emotion", { state: { connectedHeadsets, level3Selections: selections } })}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          → Audio
        </button>
        <button
          onClick={() => navigate("/video-output")}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          → Video
        </button>
      </div>
    </div>
  );
};

export default ExcitementLevel3;
