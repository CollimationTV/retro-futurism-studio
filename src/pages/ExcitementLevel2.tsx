import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Music, Play, Pause } from "lucide-react";
import { getHeadsetColor } from "@/utils/headsetColors";
import { soundtracks, getSoundtrackByExcitementScores } from "@/data/soundtracks";
import type { MotionEvent } from "@/lib/multiHeadsetCortexClient";

const SNIPPET_DURATION = 20000; // 20 seconds

const ExcitementLevel2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    videoJobId,
    connectedHeadsets,
    motion,
    performanceMetrics
  } = location.state || {};

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [excitementScores, setExcitementScores] = useState<Map<number, number[]>>(new Map());
  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 });
  const [focusedSongId, setFocusedSongId] = useState<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cursor movement from gyration data
  useEffect(() => {
    if (!motion) return;
    
    const event = motion as MotionEvent;
    const MOVEMENT_SPEED = 0.0002;
    const DEAD_ZONE = 0.05;
    const MAX_STEP = 0.01;
    
    if (Math.abs(event.gyroY) > DEAD_ZONE) {
      const delta = event.gyroY * MOVEMENT_SPEED;
      const clampedDelta = Math.max(-MAX_STEP, Math.min(MAX_STEP, delta));
      
      setCursorPosition(prev => ({
        x: Math.max(0, Math.min(1, prev.x + clampedDelta)),
        y: prev.y
      }));
    }
  }, [motion]);

  // Determine focused song based on cursor position
  useEffect(() => {
    const numSongs = soundtracks.length;
    const sectionWidth = 1 / numSongs;
    const focusedIndex = Math.floor(cursorPosition.x / sectionWidth);
    const focusedSong = soundtracks[Math.min(focusedIndex, numSongs - 1)];
    setFocusedSongId(focusedSong.id);
  }, [cursorPosition]);

  // Record excitement during playback
  useEffect(() => {
    if (!isPlaying || !performanceMetrics) return;

    const currentSong = soundtracks[currentSongIndex];
    const excitementValue = performanceMetrics.met?.exc || 0; // Excitement metric from Emotiv
    
    setExcitementScores(prev => {
      const newScores = new Map(prev);
      const songScores = newScores.get(currentSong.id) || [];
      songScores.push(excitementValue);
      newScores.set(currentSong.id, songScores);
      return newScores;
    });
  }, [performanceMetrics, isPlaying, currentSongIndex]);

  // Auto-play snippet and advance
  useEffect(() => {
    if (currentSongIndex >= soundtracks.length) {
      // All songs played, calculate winner
      calculateWinnerAndNavigate();
      return;
    }

    const currentSong = soundtracks[currentSongIndex];
    console.log(`🎵 Playing snippet ${currentSongIndex + 1}/${soundtracks.length}: ${currentSong.name}`);
    
    // Auto-start playing
    if (audioRef.current) {
      audioRef.current.src = currentSong.previewUrl;
      audioRef.current.play();
      setIsPlaying(true);
      startTimeRef.current = Date.now();
    }

    // Progress tracker
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressPercent = (elapsed / SNIPPET_DURATION) * 100;
      setProgress(progressPercent);

      if (elapsed >= SNIPPET_DURATION) {
        // Move to next song
        setIsPlaying(false);
        setProgress(0);
        setCurrentSongIndex(prev => prev + 1);
      }
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentSongIndex]);

  const calculateWinnerAndNavigate = () => {
    console.log("🎯 All songs played! Calculating winner...");
    
    // Calculate average excitement for each song
    const averageScores = new Map<number, number>();
    excitementScores.forEach((scores, songId) => {
      const average = scores.reduce((sum, val) => sum + val, 0) / scores.length;
      averageScores.set(songId, average);
      console.log(`🎶 Song ${songId} average excitement: ${(average * 100).toFixed(1)}%`);
    });
    
    const selectedSoundtrack = getSoundtrackByExcitementScores(averageScores);
    const collectiveScore = Math.round((averageScores.get(selectedSoundtrack.id) || 0) * 100);
    
    console.log(`✨ Winner: ${selectedSoundtrack.name} with ${collectiveScore}% excitement`);
    
    setTimeout(() => {
      navigate("/video-output", {
        state: {
          videoJobId,
          metadata: location.state.metadata,
          collectiveScore,
          soundtrack: selectedSoundtrack
        }
      });
    }, 2000);
  };

  const currentSong = soundtracks[currentSongIndex];

  return (
    <div className="min-h-screen">
      <Header />
      
      <audio ref={audioRef} />
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Music className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Soundtrack Selection
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Listen to each 20-second snippet. Your excitement will choose the winner!
            </p>
            <div className="text-sm text-muted-foreground/70">
              Playing {currentSongIndex + 1} of {soundtracks.length}
            </div>
          </div>

          {/* Current song display */}
          {currentSong && (
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="p-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  {isPlaying ? (
                    <Pause className="h-16 w-16 text-primary animate-pulse" />
                  ) : (
                    <Play className="h-16 w-16 text-primary" />
                  )}
                </div>
                
                <h2 className="text-3xl font-bold text-center mb-2">
                  {currentSong.name}
                </h2>
                <p className="text-center text-muted-foreground mb-6">
                  {currentSong.description}
                </p>

                {/* Progress bar */}
                <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 transition-all duration-100"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {Math.round((progress / 100) * 20)}s / 20s
                  </div>
                </div>

                {/* Real-time excitement */}
                <div className="mt-6">
                  <div className="text-sm text-muted-foreground text-center mb-2">
                    Current Excitement
                  </div>
                  <div className="flex justify-center gap-4">
                    {connectedHeadsets?.map((headsetId: string) => {
                      const color = getHeadsetColor(headsetId);
                      const excitement = performanceMetrics?.met?.exc || 0;
                      
                      return (
                        <div key={headsetId} className="flex flex-col items-center gap-2">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center border-4 font-mono text-xs font-bold"
                            style={{
                              borderColor: color,
                              backgroundColor: `${color}20`
                            }}
                          >
                            {(excitement * 100).toFixed(0)}%
                          </div>
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-300 bg-primary"
                              style={{ width: `${excitement * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* All songs preview grid */}
          <div className="grid grid-cols-4 gap-4">
            {soundtracks.map((song, index) => {
              const isCurrent = index === currentSongIndex;
              const isFocused = song.id === focusedSongId;
              const hasPlayed = index < currentSongIndex;
              const avgExcitement = excitementScores.get(song.id);
              const avgScore = avgExcitement 
                ? avgExcitement.reduce((sum, val) => sum + val, 0) / avgExcitement.length 
                : 0;

              return (
                <Card 
                  key={song.id}
                  className={`p-4 transition-all duration-300 ${
                    isCurrent ? 'ring-4 ring-primary scale-105' : ''
                  } ${isFocused ? 'ring-2 ring-accent' : ''}`}
                  style={{ opacity: hasPlayed ? 0.6 : 1 }}
                >
                  <div className="text-center">
                    <Music className={`h-8 w-8 mx-auto mb-2 ${isCurrent ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                    <h3 className="font-bold text-sm mb-1">{song.name}</h3>
                    {hasPlayed && (
                      <div className="text-xs text-muted-foreground">
                        Excitement: {(avgScore * 100).toFixed(0)}%
                      </div>
                    )}
                    {isCurrent && (
                      <div className="text-xs text-primary font-bold mt-1">
                        NOW PLAYING
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Invisible cursor indicator */}
      <div 
        className="fixed w-4 h-4 bg-primary/50 rounded-full pointer-events-none z-50 transition-all duration-100"
        style={{
          left: `${cursorPosition.x * 100}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default ExcitementLevel2;