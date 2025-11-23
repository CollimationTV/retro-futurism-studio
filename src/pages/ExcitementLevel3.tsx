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
  const [cursorPosition, setCursorPosition] = useState<Map<string, number>>(new Map()); // headsetId -> 0-1 normalized position
  
  // Selection constants (same as PerHeadsetImageGrid for consistency)
  const PUSH_POWER_THRESHOLD = 0.25; // Slightly more sensitive PUSH detection
  const PUSH_HOLD_TIME_MS = 8000; // 8 seconds hold time
  const AUTO_CYCLE_INTERVAL_MS = 4000;
  
  const positions = generateSphericalLayout();
  
  // Calculate average excitement across all headsets
  const averageExcitement = Array.from(excitementLevels.values()).reduce((sum, val) => sum + val, 0) / Math.max(excitementLevels.size, 1);
  
  // Listen to performance metrics, motion, and mental command events from parent state
  useEffect(() => {
    const metrics = location.state?.performanceMetrics;
    const motion = location.state?.motionEvent;
    const command = location.state?.mentalCommand;
    if (metrics) setPerformanceMetrics(metrics);
    if (motion) setMotionEvent(motion);
    if (command) setMentalCommand(command);
  }, [location.state]);
  
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
  
  // Auto-cycle focused image for each headset at a slow, constant pace
  useEffect(() => {
    if (!connectedHeadsets || connectedHeadsets.length === 0 || excitementLevel3Images.length === 0) return;

    const interval = setInterval(() => {
      setFocusedImages(prev => {
        const updated = new Map(prev);
        connectedHeadsets.forEach((headsetId: string) => {
          const isPushing = pushProgress.has(headsetId);
          if (selections.has(headsetId) || isPushing) return; // skip completed or pushing
          
          const currentImageId = prev.get(headsetId);
          const currentIndex = excitementLevel3Images.findIndex(img => img.id === currentImageId);
          const nextIndex = (currentIndex + 1) % excitementLevel3Images.length;
          updated.set(headsetId, excitementLevel3Images[nextIndex].id);
        });
        return updated;
      });
    }, AUTO_CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [connectedHeadsets, excitementLevel3Images.length, pushProgress, selections, AUTO_CYCLE_INTERVAL_MS]);
  
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
      
      // Start or update hold timer for this headset on the currently focused image
      if (!existing || existing.imageId !== focusedImageId) {
        setPushProgress(prev => new Map(prev).set(headsetId, { startTime: now, imageId: focusedImageId }));
      }
    } else {
      // Push released or below threshold - reset hold progress
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
      let changed = false;

      pushProgress.forEach((progress, headsetId) => {
        const duration = now - progress.startTime;
        if (duration >= PUSH_HOLD_TIME_MS) {
          // Hold time reached - lock selection
          if (!selections.has(headsetId)) {
            console.log(`✨ Headset ${headsetId} selected artwork ${progress.imageId} via PUSH!`);
            setSelections(prev => new Map(prev).set(headsetId, progress.imageId));
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
    }, 100);

    return () => clearInterval(interval);
  }, [pushProgress, selections, PUSH_HOLD_TIME_MS]);
  
  // Update excitement levels for visual feedback
  useEffect(() => {
    if (!performanceMetrics) return;
    const { excitement, headsetId } = performanceMetrics;
    setExcitementLevels(prev => new Map(prev).set(headsetId, excitement));
  }, [performanceMetrics]);
  
  // Check if all selections complete
  useEffect(() => {
    if (connectedHeadsets && connectedHeadsets.length > 0 && selections.size === connectedHeadsets.length) {
      console.log("🎉 All excitement selections complete!");
      
      // Calculate collective excitement score (0-100)
      const collectiveScore = Math.round(averageExcitement * 100);
      
      // Navigate to video output
      setTimeout(() => {
        navigate("/video-output", {
          state: {
            metadata,
            collectiveScore,
            level3Selections: Array.from(selections.entries()),
            soundtrack: {
              name: collectiveScore > 70 ? "High Energy" : collectiveScore > 40 ? "Balanced" : "Calm",
              description: "Selected based on collective excitement"
            }
          }
        });
      }, 2000);
    }
  }, [selections, connectedHeadsets, navigate, metadata, averageExcitement]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative">
      {/* Animated Brain Background */}
      <Brain3D excitement={averageExcitement} className="opacity-20 z-0" />
      
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 
            className="text-5xl font-bold uppercase tracking-wider neon-glow mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Emotional Resonance Sphere
          </h1>
          <p className="text-xl text-muted-foreground">
            Hold PUSH to select your artwork
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {selections.size} / {connectedHeadsets?.length || 0} selections complete
          </p>
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
            const radius = 250 + (index * 50); // Staggered orbits
            const speed = 15 + (index * 5); // Different speeds
            
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
          
          {/* Artwork tiles in spherical layout */}
          <div className="absolute inset-0">
            {excitementLevel3Images.map((image, index) => {
              const position = positions[index];
              const focusedByHeadsets = Array.from(focusedImages.entries())
                .filter(([_, imgId]) => imgId === image.id)
                .map(([headsetId]) => headsetId)
                .filter(hId => !selections.has(hId)); // Exclude headsets that already selected
              
              const focusColors = focusedByHeadsets.map(hId => getHeadsetColor(hId));
              const isFocusedByAny = focusColors.length > 0;
              
              // Calculate push progress for focused headsets (no excitement threshold needed)
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
                  threshold={1} // Normalized 0-1 progress
                  isSelected={isSelected}
                  isFocusedByAny={isFocusedByAny}
                  focusColors={focusColors}
                />
              );
            })}
          </div>
          
          {/* Rotating earth animation */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              animation: 'rotateEarth 120s linear infinite',
              transformStyle: 'preserve-3d'
            }}
          />
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
          onClick={() => navigate("/video-output")}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          → Video
        </button>
      </div>
      
      {/* Animated starfield background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ExcitementLevel3;
