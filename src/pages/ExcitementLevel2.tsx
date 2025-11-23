import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Music, Zap } from "lucide-react";
import { excitementLevel2Images } from "@/data/excitementImages";
import { getHeadsetColor } from "@/utils/headsetColors";
import { getSoundtrackByScore } from "@/data/soundtracks";
import type { MentalCommandEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain3D } from "@/components/Brain3D";

const ExcitementLevel2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    videoJobId,
    connectedHeadsets,
    mentalCommand,
    excitementLevel1Selections,
    excitementLevel1Scores
  } = location.state || {};

  const [excitementLevels, setExcitementLevels] = useState<Map<string, number>>(new Map(excitementLevel1Scores));
  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [currentFocus, setCurrentFocus] = useState<Map<string, number>>(new Map());

  // Monitor excitement levels
  useEffect(() => {
    if (!mentalCommand) return;

    const event = mentalCommand as MentalCommandEvent;
    const excitementValue = event.pow;
    
    setExcitementLevels(prev => {
      const newLevels = new Map(prev);
      newLevels.set(event.headsetId, excitementValue);
      return newLevels;
    });

    // Check if excitement exceeds threshold
    const focusedImageId = currentFocus.get(event.headsetId);
    if (focusedImageId !== undefined) {
      const image = excitementLevel2Images.find(img => img.id === focusedImageId);
      if (image && excitementValue >= image.excitementThreshold) {
        handleSelection(event.headsetId, focusedImageId);
      }
    }
  }, [mentalCommand]);

  const handleSelection = (headsetId: string, imageId: number) => {
    if (selections.has(headsetId)) return;
    
    console.log(`✨ Excitement level 2 selection by ${headsetId}:`, imageId);
    setSelections(prev => new Map(prev).set(headsetId, imageId));
  };

  // Calculate collective excitement score and navigate to video output
  useEffect(() => {
    if (connectedHeadsets && selections.size === connectedHeadsets.length && selections.size > 0) {
      console.log("🎯 All excitement selections complete! Calculating collective score...");
      
      // Calculate average excitement score across all headsets and both levels
      const allScores: number[] = [];
      excitementLevels.forEach(score => allScores.push(score));
      
      const averageExcitement = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
      const collectiveScore = Math.round(averageExcitement * 100); // Convert to 0-100 scale
      
      console.log(`🎵 Collective excitement score: ${collectiveScore}`);
      
      const selectedSoundtrack = getSoundtrackByScore(collectiveScore);
      console.log(`🎶 Selected soundtrack: ${selectedSoundtrack.name}`);
      
      setTimeout(() => {
        navigate("/video-output", {
          state: {
            videoJobId,
            metadata: location.state.metadata, // Pass through original metadata
            collectiveScore,
            soundtrack: selectedSoundtrack,
            excitementLevel1Selections,
            excitementLevel2Selections: selections
          }
        });
      }, 2000);
    }
  }, [selections, connectedHeadsets, navigate, videoJobId, excitementLevels]);

  const getExcitementColor = (level: number): string => {
    if (level < 0.3) return 'hsl(142, 76%, 36%)';
    if (level < 0.6) return 'hsl(48, 96%, 53%)';
    return 'hsl(25, 95%, 53%)';
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
              <Music className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Excitement Level 2: Soundtrack
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Your collective energy will choose the soundtrack!
            </p>
            <div className="text-sm text-muted-foreground/70">
              Let your excitement flow as you explore musical themes
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
            {excitementLevel2Images.map((image) => {
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

export default ExcitementLevel2;
