import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { excitementLevel1Images } from "@/data/excitementImages";
import { getHeadsetColor } from "@/utils/headsetColors";
import type { MentalCommandEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";

const ExcitementLevel1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    videoJobId,
    connectedHeadsets,
    mentalCommand 
  } = location.state || {};

  const [excitementLevels, setExcitementLevels] = useState<Map<string, number>>(new Map());
  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [currentFocus, setCurrentFocus] = useState<Map<string, number>>(new Map());

  // Monitor excitement levels from performance metrics
  useEffect(() => {
    if (!mentalCommand) return;

    // Emotiv headsets provide excitement metric through performance metrics
    // For now, we'll use mental command power as a proxy for excitement
    const event = mentalCommand as MentalCommandEvent;
    const excitementValue = event.pow; // 0-1 range
    
    setExcitementLevels(prev => {
      const newLevels = new Map(prev);
      newLevels.set(event.headsetId, excitementValue);
      return newLevels;
    });

    // Check if excitement exceeds threshold for focused image
    const focusedImageId = currentFocus.get(event.headsetId);
    if (focusedImageId !== undefined) {
      const image = excitementLevel1Images.find(img => img.id === focusedImageId);
      if (image && excitementValue >= image.excitementThreshold) {
        handleSelection(event.headsetId, focusedImageId);
      }
    }
  }, [mentalCommand]);

  const handleSelection = (headsetId: string, imageId: number) => {
    if (selections.has(headsetId)) return; // Already selected
    
    console.log(`✨ Excitement selection by ${headsetId}:`, imageId);
    setSelections(prev => new Map(prev).set(headsetId, imageId));
  };

  // Auto-advance when all headsets have made selections
  useEffect(() => {
    if (connectedHeadsets && selections.size === connectedHeadsets.length && selections.size > 0) {
      console.log("🎯 All excitement level 1 selections complete!");
      
      setTimeout(() => {
        navigate("/excitement-level-2", {
          state: {
            videoJobId,
            connectedHeadsets,
            mentalCommand,
            excitementLevel1Selections: selections,
            excitementLevel1Scores: excitementLevels
          }
        });
      }, 1500);
    }
  }, [selections, connectedHeadsets, navigate, videoJobId, excitementLevels, mentalCommand]);

  const getExcitementColor = (level: number): string => {
    if (level < 0.3) return 'hsl(142, 76%, 36%)'; // Green
    if (level < 0.6) return 'hsl(48, 96%, 53%)'; // Yellow
    return 'hsl(25, 95%, 53%)'; // Orange/Red
  };

  // Calculate average excitement for brain visualization
  const averageExcitement = Array.from(excitementLevels.values()).reduce((sum, val) => sum + val, 0) / Math.max(excitementLevels.size, 1);

  return (
    <div className="min-h-screen relative">
      {/* Animated Brain Background */}
      <Brain3D excitement={averageExcitement} className="opacity-20 z-0" />
      
      <Header />
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Zap className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Excitement Level 1
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Your video is generating... Let your excitement guide your selections!
            </p>
            <div className="text-sm text-muted-foreground/70">
              Focus on an image and let your excitement levels rise to make a selection
            </div>
          </div>

          {/* Excitement Meters */}
          <div className="flex justify-center gap-4 mb-8">
            {connectedHeadsets?.map((headsetId: string) => {
              const level = excitementLevels.get(headsetId) || 0;
              const color = getHeadsetColor(headsetId);
              const hasSelected = selections.has(headsetId);
              
              return (
                <div key={headsetId} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center border-4 font-mono text-xs font-bold transition-all"
                    style={{
                      borderColor: color,
                      backgroundColor: hasSelected ? `${color}40` : 'transparent',
                      transform: hasSelected ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {(level * 100).toFixed(0)}%
                  </div>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${level * 100}%`,
                        backgroundColor: getExcitementColor(level)
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-3 gap-6">
            {excitementLevel1Images.map((image) => {
              const focusedByHeadsets = Array.from(currentFocus.entries())
                .filter(([_, imageId]) => imageId === image.id)
                .map(([headsetId]) => headsetId);
              
              const selectedByHeadsets = Array.from(selections.entries())
                .filter(([_, imageId]) => imageId === image.id)
                .map(([headsetId]) => headsetId);

              return (
                <Card 
                  key={image.id}
                  className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                  style={{
                    opacity: selectedByHeadsets.length > 0 ? 0.5 : 1
                  }}
                >
                  <div className="aspect-video relative">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Excitement threshold indicator */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs">
                      {(image.excitementThreshold * 100).toFixed(0)}% needed
                    </div>

                    {/* Headset indicators */}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {focusedByHeadsets.map(headsetId => {
                        const color = getHeadsetColor(headsetId);
                        const level = excitementLevels.get(headsetId) || 0;
                        
                        return (
                          <div
                            key={headsetId}
                            className="w-8 h-8 rounded-full border-2 flex items-center justify-center backdrop-blur-sm"
                            style={{
                              borderColor: color,
                              backgroundColor: `${color}40`,
                              boxShadow: level >= image.excitementThreshold ? `0 0 20px ${color}` : 'none'
                            }}
                          >
                            <Zap 
                              className="w-4 h-4" 
                              style={{ color }}
                            />
                          </div>
                        );
                      })}
                      
                      {selectedByHeadsets.map(headsetId => {
                        const color = getHeadsetColor(headsetId);
                        return (
                          <div
                            key={`selected-${headsetId}`}
                            className="w-8 h-8 rounded-full border-2 flex items-center justify-center backdrop-blur-sm animate-pulse-glow"
                            style={{
                              borderColor: color,
                              backgroundColor: color
                            }}
                          >
                            ✓
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-card">
                    <p className="text-sm font-semibold text-center">{image.title}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default ExcitementLevel1;
