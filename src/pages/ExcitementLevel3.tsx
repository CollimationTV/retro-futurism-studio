import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CollectiveExcitementCore } from "@/components/CollectiveExcitementCore";
import { OrbitalExcitementRing } from "@/components/OrbitalExcitementRing";
import { ArtworkTile } from "@/components/ArtworkTile";
import { excitementLevel3Images } from "@/data/excitementImages";
import { generateSphericalLayout } from "@/utils/sphericalLayout";
import { getHeadsetColor } from "@/utils/headsetColors";
import { PerformanceMetricsEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";

const ExcitementLevel3 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { metadata, videoJobId, connectedHeadsets } = location.state || {};
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsEvent | null>(null);
  const [motionEvent, setMotionEvent] = useState<MotionEvent | null>(null);
  const [excitementLevels, setExcitementLevels] = useState<Map<string, number>>(new Map());
  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [excitementDuration, setExcitementDuration] = useState<Map<string, { imageId: number; startTime: number; excitement: number }>>(new Map());
  const [focusedImages, setFocusedImages] = useState<Map<string, number>>(new Map()); // headsetId -> imageId
  const [cursorPosition, setCursorPosition] = useState<Map<string, number>>(new Map()); // headsetId -> 0-1 normalized position
  
  // Cursor movement constants (same as PerHeadsetImageGrid for consistency)
  const CURSOR_MOVEMENT_SPEED = 0.0002;
  const CURSOR_DEAD_ZONE = 0.05;
  const CURSOR_MAX_STEP = 0.01;
  
  const positions = generateSphericalLayout();
  
  // Calculate average excitement across all headsets
  const averageExcitement = Array.from(excitementLevels.values()).reduce((sum, val) => sum + val, 0) / Math.max(excitementLevels.size, 1);
  
  // Listen to performance metrics and motion events from parent state
  useEffect(() => {
    const metrics = location.state?.performanceMetrics;
    const motion = location.state?.motionEvent;
    if (metrics) setPerformanceMetrics(metrics);
    if (motion) setMotionEvent(motion);
  }, [location.state]);
  
  // Initialize cursor positions and focused images
  useEffect(() => {
    if (connectedHeadsets && connectedHeadsets.length > 0 && cursorPosition.size === 0) {
      const initialPositions = new Map();
      const initialFocus = new Map();
      connectedHeadsets.forEach((headsetId: string) => {
        initialPositions.set(headsetId, 0.0); // Start at first artwork
        initialFocus.set(headsetId, excitementLevel3Images[0].id);
      });
      setCursorPosition(initialPositions);
      setFocusedImages(initialFocus);
    }
  }, [connectedHeadsets, cursorPosition.size]);
  
  // Handle head motion for smooth cursor-like navigation
  useEffect(() => {
    if (!motionEvent) return;
    const { gyroY, headsetId } = motionEvent;
    
    // Skip if already selected
    if (selections.has(headsetId)) return;
    
    // Skip if excitement hold is active (frozen during selection)
    if (excitementDuration.has(headsetId)) {
      return;
    }
    
    // Get current cursor position (0-1 normalized)
    const currentPosition = cursorPosition.get(headsetId) ?? 0.0;
    
    // Only update if movement exceeds dead zone
    if (Math.abs(gyroY) < CURSOR_DEAD_ZONE) return;
    
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
    
    // Map cursor position to artwork index (0-1 -> 0-14)
    const artworkIndex = Math.floor(newPosition * excitementLevel3Images.length);
    const focusedImageId = excitementLevel3Images[artworkIndex].id;
    
    // Update focused image if changed
    const currentFocusedId = focusedImages.get(headsetId);
    if (focusedImageId !== currentFocusedId) {
      console.log(`🎯 Headset ${headsetId} cursor moved to artwork ${artworkIndex} (position: ${newPosition.toFixed(3)})`);
      setFocusedImages(prev => new Map(prev).set(headsetId, focusedImageId));
    }
  }, [motionEvent, focusedImages, selections, excitementDuration, cursorPosition]);
  
  // Handle performance metrics for excitement-based selection
  useEffect(() => {
    if (!performanceMetrics) return;
    
    const { excitement, headsetId } = performanceMetrics;
    
    // Update excitement level for this headset
    setExcitementLevels(prev => new Map(prev).set(headsetId, excitement));
    
    // Skip if already selected
    if (selections.has(headsetId)) return;
    
    // Get focused image from state
    const focusedImageId = focusedImages.get(headsetId);
    const focusedImage = excitementLevel3Images.find(img => img.id === focusedImageId);
    
    if (!focusedImage) return;
    
    // Check if excitement exceeds threshold
    if (excitement >= focusedImage.excitementThreshold) {
      const duration = excitementDuration.get(headsetId);
      
      if (!duration || duration.imageId !== focusedImage.id) {
        // Start tracking
        setExcitementDuration(prev => new Map(prev).set(headsetId, {
          imageId: focusedImage.id,
          startTime: Date.now(),
          excitement: excitement
        }));
      } else {
        // Update excitement level
        setExcitementDuration(prev => new Map(prev).set(headsetId, {
          ...duration,
          excitement: excitement
        }));
        
        // Check if 5 seconds have passed (increased from 3s for lower sensitivity)
        if (Date.now() - duration.startTime >= 5000) {
          // AUTO-SELECT!
          console.log(`✨ Headset ${headsetId} selected artwork ${focusedImage.id} via excitement!`);
          setSelections(prev => new Map(prev).set(headsetId, focusedImage.id));
          setExcitementDuration(prev => {
            const newMap = new Map(prev);
            newMap.delete(headsetId);
            return newMap;
          });
        }
      }
    } else {
      // Below threshold, reset duration tracking
      setExcitementDuration(prev => {
        const newMap = new Map(prev);
        newMap.delete(headsetId);
        return newMap;
      });
    }
  }, [performanceMetrics, focusedImages, selections, excitementDuration, excitementLevel3Images]);
  
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
            Your collective energy shapes the earth
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Average Excitement: {Math.round(averageExcitement * 100)}%
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
              
              // Calculate excitement progress for focused headsets
              let maxExcitementProgress = 0;
              focusedByHeadsets.forEach(headsetId => {
                const excitement = excitementLevels.get(headsetId) || 0;
                if (excitement >= image.excitementThreshold) {
                  const duration = excitementDuration.get(headsetId);
                  if (duration && duration.imageId === image.id) {
                    const elapsed = Date.now() - duration.startTime;
                    maxExcitementProgress = Math.max(maxExcitementProgress, Math.min(elapsed / 5000, 1) * image.excitementThreshold);
                  }
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
                  excitementProgress={maxExcitementProgress}
                  threshold={image.excitementThreshold}
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
