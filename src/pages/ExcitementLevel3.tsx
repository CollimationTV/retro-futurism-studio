import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Brain3D } from "@/components/Brain3D";
import { artworkAudioPairs } from "@/data/artworkAudioPairs";
import { PerformanceMetricsEvent } from "@/lib/multiHeadsetCortexClient";

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
  const [showingWinner, setShowingWinner] = useState(false);
  const [winnerArtwork, setWinnerArtwork] = useState<typeof artworkAudioPairs[0] | null>(null);
  const [winnerScore, setWinnerScore] = useState(0);
  
  const currentArtwork = artworkAudioPairs[currentArtworkIndex];
  
  // Calculate average excitement across all headsets
  const calculateAverageExcitement = (): number => {
    if (!performanceMetrics) return 0;
    const { excitement, interest, focus } = performanceMetrics;
    return (excitement + interest + focus) / 3;
  };
  
  // Listen to window events for real-time performance metrics
  useEffect(() => {
    const handlePerformanceMetrics = ((event: CustomEvent<PerformanceMetricsEvent>) => {
      // console.log('📊 Level3 received performance metrics event:', event.detail);
      setPerformanceMetrics(event.detail);
    }) as EventListener;
    
    window.addEventListener('performance-metrics', handlePerformanceMetrics);
    // console.log('✅ Level3 performance metrics listener registered');
    
    return () => {
      window.removeEventListener('performance-metrics', handlePerformanceMetrics);
    };
  }, []);
  
  // Record excitement scores for current artwork
  useEffect(() => {
    if (!performanceMetrics || isComplete) return;
    
    const artworkId = currentArtwork.id;
    const excitement = calculateAverageExcitement();
    
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
  
  // Auto-rotate to next artwork every 7 seconds
  useEffect(() => {
    if (isComplete) return;
    
    const timer = setTimeout(() => {
      if (currentArtworkIndex < artworkAudioPairs.length - 1) {
        // console.log(`⏭️ Advancing to artwork ${currentArtworkIndex + 2}`);
        setCurrentArtworkIndex(prev => prev + 1);
      } else {
        // console.log('🎉 All artworks displayed, calculating top 5');
        setIsComplete(true);
      }
    }, 7000);
    
    return () => clearTimeout(timer);
  }, [currentArtworkIndex, isComplete]);
  
  // Show winner and navigate to video output when complete
  useEffect(() => {
    if (!isComplete) return;
    
    // Sort artworks by average excitement and get winner
    const sortedArtworks = Array.from(artworkScores.values())
      .sort((a, b) => b.averageExcitement - a.averageExcitement);
    
    if (sortedArtworks.length > 0) {
      const winner = sortedArtworks[0];
      const winnerArt = artworkAudioPairs.find(pair => pair.id === winner.artworkId);
      
      if (winnerArt) {
        setWinnerArtwork(winnerArt);
        setWinnerScore(winner.averageExcitement);
        setShowingWinner(true);
        
        // Show winner for 5 seconds, then navigate to video output
        setTimeout(() => {
          navigate("/video-output", {
            state: {
              videoJobId,
              metadata,
              connectedHeadsets,
              winnerArtwork: winnerArt,
              winnerScore: winner.averageExcitement
            }
          });
        }, 5000);
      }
    }
  }, [isComplete, artworkScores, navigate, videoJobId, metadata, connectedHeadsets]);
  
  const averageExcitement = calculateAverageExcitement();
  const progress = ((currentArtworkIndex + 1) / artworkAudioPairs.length) * 100;
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Animated Brain Background */}
      <Brain3D excitement={averageExcitement} className="opacity-15 z-0" />
      
      <Header />
      
      {/* Winner Display Overlay */}
      {showingWinner && winnerArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-lg animate-fade-in">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-6">
            <div className="text-8xl animate-bounce">🏆</div>
            <h1 
              className="text-6xl font-bold uppercase tracking-[0.3em] text-primary"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              WINNER
            </h1>
            
            <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden border-4 border-primary shadow-2xl shadow-primary/50">
              {winnerArtwork.type === 'video' ? (
                <video
                  src={winnerArtwork.artworkUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={winnerArtwork.artworkUrl}
                  alt="Winner artwork"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="space-y-4">
              <div className="text-3xl font-mono text-accent">"{winnerArtwork.metadata}"</div>
              <div className="text-5xl font-bold text-primary">
                EXCITEMENT: {(winnerScore * 100).toFixed(0)}%
              </div>
              <p className="text-lg text-muted-foreground italic max-w-2xl mx-auto">
                "This artwork resonated most with the collective consciousness"
              </p>
            </div>
          </div>
        </div>
      )}
      
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
        
        {/* Artwork display */}
        <div className="relative w-full max-w-6xl mx-auto aspect-video rounded-lg overflow-hidden border-2 border-primary/30 shadow-2xl">
          {currentArtwork.type === 'video' ? (
            <video
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
                <audio src={currentArtwork.audioUrl} autoPlay loop />
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
          
          {/* Excitement meter overlay */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border border-primary/30 rounded-lg p-4">
            <div className="text-xs font-mono text-primary mb-2">COLLECTIVE EXCITEMENT</div>
            <div className="text-3xl font-bold text-accent">
              {(averageExcitement * 100).toFixed(0)}%
            </div>
          </div>
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
          onClick={() => navigate("/video-output", { 
            state: { 
              videoJobId, 
              metadata, 
              connectedHeadsets,
              winnerArtwork: artworkAudioPairs[0],
              winnerScore: 0.5
            } 
          })}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          → Video
        </button>
      </div>
    </div>
  );
};

export default ExcitementLevel3;
