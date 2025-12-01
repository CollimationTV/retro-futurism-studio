import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Brain3D } from "@/components/Brain3D";
import { artworkAudioPairs } from "@/data/artworkAudioPairs";
import { PerformanceMetricsEvent } from "@/lib/multiHeadsetCortexClient";
import { getHeadsetColor } from "@/utils/headsetColors";
import { CollectiveExcitementCore } from "@/components/CollectiveExcitementCore";

interface ArtworkScore {
  artworkId: number;
  totalExcitement: number;
  sampleCount: number;
  averageExcitement: number;
}

const ExcitementLevel3 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { metadata, videoJobId, connectedHeadsets } = location.state || {};
  
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsEvent | null>(null);
  const [artworkScores, setArtworkScores] = useState<Map<number, ArtworkScore>>(new Map());
  const [isComplete, setIsComplete] = useState(false);
  const [excitementLevels, setExcitementLevels] = useState<Map<string, number>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const currentArtwork = artworkAudioPairs[currentArtworkIndex];
  const averageExcitement = Array.from(excitementLevels.values()).reduce((sum, val) => sum + val, 0) / Math.max(excitementLevels.size, 1);
  
  // Listen to window events for real-time performance metrics
  useEffect(() => {
    const handlePerformanceMetrics = ((event: CustomEvent<PerformanceMetricsEvent>) => {
      setPerformanceMetrics(event.detail);
      
      // Update individual headset excitement levels
      const { excitement, interest, focus, headsetId } = event.detail;
      const combinedScore = (excitement + interest + focus) / 3;
      setExcitementLevels(prev => new Map(prev).set(headsetId, combinedScore));
    }) as EventListener;
    
    window.addEventListener('performance-metrics', handlePerformanceMetrics);
    
    return () => {
      window.removeEventListener('performance-metrics', handlePerformanceMetrics);
    };
  }, []);
  
  // Record excitement scores for current artwork
  useEffect(() => {
    if (!performanceMetrics || isComplete) return;
    
    const artworkId = currentArtwork.id;
    const excitement = averageExcitement;
    
    setArtworkScores(prev => {
      const existing = prev.get(artworkId) || { 
        artworkId, 
        totalExcitement: 0, 
        sampleCount: 0,
        averageExcitement: 0 
      };
      
      const updated = {
        artworkId,
        totalExcitement: existing.totalExcitement + excitement,
        sampleCount: existing.sampleCount + 1,
        averageExcitement: (existing.totalExcitement + excitement) / (existing.sampleCount + 1)
      };
      
      // console.log(`📊 Recording excitement for artwork ${artworkId}: ${excitement.toFixed(3)} (avg: ${updated.averageExcitement.toFixed(3)})`);
      
      return new Map(prev).set(artworkId, updated);
    });
  }, [performanceMetrics, currentArtwork, isComplete]);
  
  // Auto-rotate to next artwork every 7 seconds and manage audio/video
  useEffect(() => {
    if (isComplete) return;
    
    // Play audio/video for current artwork
    if (currentArtwork.type === 'video' && videoRef.current) {
      videoRef.current.play();
    } else if (currentArtwork.audioUrl && audioRef.current) {
      audioRef.current.play();
    }
    
    const timer = setTimeout(() => {
      // Pause current media before switching
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      
      if (currentArtworkIndex < artworkAudioPairs.length - 1) {
        setCurrentArtworkIndex(prev => prev + 1);
      } else {
        setIsComplete(true);
      }
    }, 7000);
    
    return () => {
      clearTimeout(timer);
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
    };
  }, [currentArtworkIndex, isComplete, currentArtwork]);
  
  // Navigate directly to video output when complete
  useEffect(() => {
    if (!isComplete) return;
    
    // Sort artworks by average excitement and select top 5
    const sortedArtworks = Array.from(artworkScores.values())
      .sort((a, b) => b.averageExcitement - a.averageExcitement)
      .slice(0, 5);
    
    const top5Ids = sortedArtworks.map(score => score.artworkId);
    const top5Artworks = artworkAudioPairs.filter(pair => top5Ids.includes(pair.id));
    
    setTimeout(() => {
      navigate("/video-output", {
        state: {
          videoJobId,
          metadata,
          connectedHeadsets,
          level3Selections: top5Artworks
        }
      });
    }, 2000);
  }, [isComplete, artworkScores, navigate, videoJobId, metadata, connectedHeadsets]);
  
  const progress = ((currentArtworkIndex + 1) / artworkAudioPairs.length) * 100;
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Animated Brain Background */}
      <Brain3D excitement={averageExcitement || 0.5} className="opacity-15 z-0" />
      
      <Header />
      
      {/* Main content */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 
            className="text-5xl font-bold uppercase tracking-[0.3em] mb-4"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <span className="text-xs text-primary/60 block mb-2 font-mono">
              [ LEVEL 03 ]
            </span>
            EMOTIONAL RESONANCE
          </h1>
          <p className="text-lg text-muted-foreground font-mono uppercase tracking-wider">
            → EXPERIENCING ARTWORK & MUSIC
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between text-sm font-mono mb-2">
            <span className="text-primary">Progress</span>
            <span className="text-accent">{currentArtworkIndex + 1} / {artworkAudioPairs.length}</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Collective Excitement Visualization */}
        <div className="flex justify-center mb-8">
          <CollectiveExcitementCore 
            averageExcitement={averageExcitement || 0} 
            size={250}
          />
        </div>

        {/* Artwork display */}
        <div className="relative w-full max-w-6xl mx-auto aspect-video rounded-lg overflow-hidden border-2 border-primary/30 shadow-2xl">
          {currentArtwork.type === 'video' ? (
            <video
              ref={videoRef}
              src={currentArtwork.artworkUrl}
              autoPlay
              loop
              playsInline
              className="w-full h-full object-cover animate-fade-in"
              key={currentArtwork.id}
            />
          ) : (
            <>
              <img
                src={currentArtwork.artworkUrl}
                alt={`Artwork ${currentArtwork.id}`}
                className="w-full h-full object-cover animate-fade-in"
                key={currentArtwork.id}
              />
              {currentArtwork.audioUrl && (
                <audio ref={audioRef} src={currentArtwork.audioUrl} autoPlay loop />
              )}
            </>
          )}
          
          {/* Metadata overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-6">
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-primary/20 border border-primary/50 rounded text-sm font-mono">
                {currentArtwork.metadata}
              </span>
            </div>
          </div>
          
        </div>

        {/* Individual Headset Excitement Meters */}
        <div className="flex justify-center gap-6 mt-8">
          {connectedHeadsets?.map((headsetId: string) => {
            const level = excitementLevels.get(headsetId) || 0;
            const color = getHeadsetColor(headsetId);
            
            return (
              <div key={headsetId} className="flex flex-col items-center gap-2">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center border-4 font-mono text-sm font-bold transition-all"
                  style={{
                    borderColor: color,
                    backgroundColor: `${color}20`,
                    transform: `scale(${1 + level * 0.2})`
                  }}
                >
                  {(level * 100).toFixed(0)}%
                </div>
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${level * 100}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {headsetId.substring(0, 8)}...
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Debug panel */}
        <div className="fixed top-20 right-4 z-50 bg-background/90 border border-primary/30 rounded p-4 text-xs font-mono max-w-xs">
          <div className="text-primary font-bold mb-2">DEBUG: ARTWORK SCORES</div>
          <div className="space-y-1 text-foreground/70">
            <div>Current: Artwork {currentArtwork.id}</div>
            <div>Excitement: {(averageExcitement * 100).toFixed(1)}%</div>
            <div className="border-t border-primary/20 my-2 pt-2">
              <div className="font-semibold mb-1">Recorded Scores:</div>
              {Array.from(artworkScores.entries()).map(([id, score]) => (
                <div key={id} className="flex justify-between">
                  <span>Art {id}:</span>
                  <span className="text-accent">{(score.averageExcitement * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Manual navigation for testing */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          ← Level 1
        </button>
        <button
          onClick={() => navigate("/video-output", { state: { videoJobId, metadata, connectedHeadsets } })}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          → Video Output
        </button>
      </div>
    </div>
  );
};

export default ExcitementLevel3;
