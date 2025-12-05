import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Brain3D } from "@/components/Brain3D";
import { TrainingCube } from "@/components/TrainingCube";
import { TrainingProgress } from "@/components/TrainingProgress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCortex } from "@/contexts/CortexContext";
import { getHeadsetColor } from "@/utils/headsetColors";
import { Brain, Play, RotateCcw, SkipForward, Check, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrainingEvent {
  detection: string;
  event: string;
  action: string;
  message?: string;
  headsetId: string;
}

const TRAINING_DURATION_MS = 8000;
const PUSH_TRAINING_ROUNDS = 4;

const Training = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { client, connectedHeadsets, connect, status } = useCortex();
  
  const { connectedHeadsets: stateHeadsets } = location.state || {};
  const activeHeadsets = stateHeadsets || connectedHeadsets || [];
  
  const [currentHeadsetIndex, setCurrentHeadsetIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<'intro' | 'neutral' | 'push' | 'complete'>('intro');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [neutralTrained, setNeutralTrained] = useState(false);
  const [pushTrainingRound, setPushTrainingRound] = useState(0); // 0-3 for 4 rounds
  const [pushTrained, setPushTrained] = useState(false);
  const [trainingResult, setTrainingResult] = useState<'success' | 'failed' | null>(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushIntensity, setPushIntensity] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const trainingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxPushDetectedRef = useRef<number>(0); // Track max push power during training
  
  const currentHeadset = activeHeadsets[currentHeadsetIndex];
  const headsetColor = currentHeadset ? getHeadsetColor(currentHeadset) : 'hsl(var(--primary))';

  // Check for existing profile on mount
  useEffect(() => {
    const checkProfile = async () => {
      if (!client) return;
      try {
        const profiles = await client.queryProfile();
        const hasProfile = profiles.some((p: any) => 
          p.name?.includes('BraveWave') || p.includes?.('BraveWave')
        );
        setHasExistingProfile(hasProfile);
      } catch (err) {
        console.log('No existing profiles found');
      }
    };
    checkProfile();
  }, [client]);

  // Listen for training events
  useEffect(() => {
    const handleTrainingEvent = ((event: CustomEvent<TrainingEvent>) => {
      const data = event.detail;
      console.log('Training event:', data);
      
      if (data.event === 'MC_Succeeded') {
        setTrainingResult('success');
        stopTrainingTimer();
      } else if (data.event === 'MC_Failed') {
        setTrainingResult('failed');
        stopTrainingTimer();
      } else if (data.event === 'MC_Completed') {
        // Training session completed
        if (currentStep === 'neutral') {
          setNeutralTrained(true);
        } else if (currentStep === 'push') {
          // Only mark push as complete after all rounds
          if (pushTrainingRound >= PUSH_TRAINING_ROUNDS - 1) {
            setPushTrained(true);
          }
        }
      }
    }) as EventListener;

    window.addEventListener('training-event', handleTrainingEvent);
    return () => window.removeEventListener('training-event', handleTrainingEvent);
  }, [currentStep, pushTrainingRound]);

  // Listen for real-time mental command power during training
  useEffect(() => {
    if (!isTraining || currentStep !== 'push') return;
    
    const handleMentalCommand = ((event: CustomEvent<{com: string; pow: number; headsetId: string}>) => {
      const { com, pow } = event.detail;
      // Update push intensity with real-time power from EEG
      if (com === 'push' || com === 'neutral') {
        // Use push power directly, or show low intensity for neutral
        const intensity = com === 'push' ? pow : pow * 0.1;
        setPushIntensity(intensity);
        // Track max push power detected
        if (com === 'push' && pow > maxPushDetectedRef.current) {
          maxPushDetectedRef.current = pow;
        }
      }
    }) as EventListener;
    
    window.addEventListener('mental-command', handleMentalCommand);
    return () => window.removeEventListener('mental-command', handleMentalCommand);
  }, [isTraining, currentStep]);

  const stopTrainingTimer = () => {
    if (trainingTimerRef.current) {
      clearTimeout(trainingTimerRef.current);
      trainingTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsTraining(false);
  };

  const startTraining = async (action: 'neutral' | 'push') => {
    if (!client || !currentHeadset) {
      setError('No headset connected');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingResult(null);
    setError(null);
    maxPushDetectedRef.current = 0; // Reset max push tracking

    try {
      // Skip profile management - training works with default profile
      // Profile was likely loaded by Emotiv Launcher which blocks our access
      console.log('Starting training with current profile state...');
      
      // Subscribe to sys stream for training events
      await client.subscribeToSysStream(currentHeadset);
      
      // Start the training
      await client.startTraining(currentHeadset, action);
      
      // Progress timer
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / TRAINING_DURATION_MS) * 100);
        setTrainingProgress(progress);
        
        if (progress >= 100) {
          stopTrainingTimer();
        }
      }, 100);
      
      // Auto-timeout after duration
      trainingTimerRef.current = setTimeout(() => {
        stopTrainingTimer();
        // For push training, fail if no push power was detected
        if (action === 'push' && maxPushDetectedRef.current < 0.1) {
          setTrainingResult('failed');
          setError('No push power detected. Focus on pushing with your mind.');
        } else {
          setTrainingResult('success');
        }
      }, TRAINING_DURATION_MS + 1000);
      
    } catch (err: any) {
      console.error('Training error:', err);
      setError(err.message || 'Failed to start training');
      stopTrainingTimer();
    }
  };

  const acceptTraining = async () => {
    if (!client || !currentHeadset) return;
    
    try {
      const action = currentStep === 'neutral' ? 'neutral' : 'push';
      await client.acceptTraining(currentHeadset, action);
      
      if (currentStep === 'neutral') {
        setNeutralTrained(true);
        setCurrentStep('push');
        setPushTrainingRound(0);
      } else if (currentStep === 'push') {
        // Check if we need more rounds
        if (pushTrainingRound < PUSH_TRAINING_ROUNDS - 1) {
          setPushTrainingRound(prev => prev + 1);
        } else {
          setPushTrained(true);
          setCurrentStep('complete');
        }
      }
      
      setTrainingResult(null);
      setTrainingProgress(0);
      setPushIntensity(0);
    } catch (err: any) {
      setError(err.message || 'Failed to accept training');
    }
  };

  const retryTraining = async () => {
    if (!client || !currentHeadset) return;
    
    try {
      const action = currentStep === 'neutral' ? 'neutral' : 'push';
      await client.rejectTraining(currentHeadset, action);
      setTrainingResult(null);
      setTrainingProgress(0);
    } catch (err) {
      console.error('Retry error:', err);
    }
  };

  const saveProfile = async () => {
    if (!client || !currentHeadset) return;
    
    try {
      const profileName = `BraveWave-${currentHeadset.slice(-4)}`;
      // saveProfile will auto-create if profile doesn't exist
      await client.saveProfile(currentHeadset, profileName);
      console.log('Profile saved:', profileName);
    } catch (err) {
      console.error('Failed to save profile:', err);
      // Continue anyway - profile saving is optional
    }
  };

  const skipTraining = () => {
    navigate("/excitement-level-1", { 
      state: { connectedHeadsets: activeHeadsets } 
    });
  };

  // Auto-connect to Cortex and start training
  const handleStartWithAutoConnect = async () => {
    setError(null);
    
    // If already connected, just proceed to neutral training
    if (client && status === 'ready' && activeHeadsets.length > 0) {
      setCurrentStep('neutral');
      return;
    }
    
    // Try to connect
    setIsInitializing(true);
    try {
      // Get stored credentials from localStorage
      const storedClientId = localStorage.getItem('emotiv_client_id');
      const storedClientSecret = localStorage.getItem('emotiv_client_secret');
      
      if (!storedClientId || !storedClientSecret) {
        setError('Emotiv credentials not found. Please configure them on the home page first.');
        setIsInitializing(false);
        return;
      }
      
      const newClient = await connect(storedClientId, storedClientSecret);
      
      // Wait for headset connection
      const headsets = await newClient.queryHeadsets();
      if (headsets.length === 0) {
        setError('No headsets found. Please connect your Emotiv headset.');
        setIsInitializing(false);
        return;
      }
      
      // Connect to first headset
      await newClient.connectHeadset(headsets[0].id);
      await newClient.createSession(headsets[0].id);
      await newClient.subscribeMentalCommands(headsets[0].id);
      
      setIsInitializing(false);
      setCurrentStep('neutral');
    } catch (err: any) {
      console.error('Auto-connect error:', err);
      setError(err.message || 'Failed to connect to Cortex');
      setIsInitializing(false);
    }
  };

  const startExperience = () => {
    // If more headsets need training, move to next
    if (currentHeadsetIndex < activeHeadsets.length - 1) {
      setCurrentHeadsetIndex(prev => prev + 1);
      setCurrentStep('neutral');
      setNeutralTrained(false);
      setPushTrained(false);
      setTrainingResult(null);
      setTrainingProgress(0);
    } else {
      // All headsets trained, proceed to Level 1
      navigate("/excitement-level-1", { 
        state: { connectedHeadsets: activeHeadsets } 
      });
    }
  };

  return (
    <div className="min-h-screen relative">
      <Brain3D excitement={0.5} className="opacity-20 z-0" />
      <Header />
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-3xl">
          {/* Headset indicator */}
          {activeHeadsets.length > 1 && (
            <div className="text-center mb-6">
              <span className="text-sm text-muted-foreground">
                Training headset {currentHeadsetIndex + 1} of {activeHeadsets.length}
              </span>
              <div className="flex justify-center gap-2 mt-2">
                {activeHeadsets.map((id: string, idx: number) => (
                  <div
                    key={id}
                    className={`w-3 h-3 rounded-full ${idx === currentHeadsetIndex ? 'opacity-100' : 'opacity-30'}`}
                    style={{ backgroundColor: getHeadsetColor(id) }}
                  />
                ))}
              </div>
            </div>
          )}

          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
            <AnimatePresence mode="wait">
              {/* Intro Screen */}
              {currentStep === 'intro' && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <Brain className="w-20 h-20 mx-auto mb-6 text-primary" />
                  <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    Mental Command Training
                  </h1>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Train your headset to recognize your mental commands. This will help 
                    the system understand your unique brain patterns for better control.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="p-4 bg-muted/30 rounded-lg text-left">
                      <h3 className="font-medium mb-2">What you'll train:</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <strong>Neutral</strong> - Your relaxed, baseline mental state
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <strong>Push</strong> - Imagine pushing a heavy object away
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button
                      size="lg"
                      onClick={handleStartWithAutoConnect}
                      disabled={isInitializing}
                      className="gap-2"
                    >
                      {isInitializing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Start Training
                        </>
                      )}
                    </Button>
                    {hasExistingProfile && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={skipTraining}
                        disabled={isInitializing}
                        className="gap-2"
                      >
                        <SkipForward className="w-5 h-5" />
                        Skip (Use Existing)
                      </Button>
                    )}
                  </div>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Training Screen */}
              {(currentStep === 'neutral' || currentStep === 'push') && (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    Train: {currentStep === 'neutral' ? 'Neutral State' : `Push Command (${pushTrainingRound + 1}/${PUSH_TRAINING_ROUNDS})`}
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {currentStep === 'neutral' 
                      ? 'Clear your mind and relax. Think of nothing in particular.'
                      : 'Imagine pushing the cube away from you with your mind.'}
                  </p>
                  
                  <div className="mb-8">
                    <TrainingCube 
                      isActive={isTraining}
                      progress={trainingProgress}
                      pushIntensity={pushIntensity}
                      pushRound={pushTrainingRound}
                      totalRounds={PUSH_TRAINING_ROUNDS}
                    />
                  </div>
                  
                  {/* Power Indicator for Push Training - Real-time EEG feedback */}
                  {currentStep === 'push' && isTraining && (
                    <div className="mb-6 max-w-xs mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono text-muted-foreground">PUSH POWER</span>
                        <span className="text-sm font-mono text-primary">
                          {Math.round(pushIntensity * 100)}%
                        </span>
                      </div>
                      <div className="h-4 bg-muted/30 rounded-full overflow-hidden border border-border/50">
                        <div 
                          className="h-full transition-all duration-100 rounded-full"
                          style={{ 
                            width: `${pushIntensity * 100}%`,
                            background: `linear-gradient(90deg, 
                              hsl(var(--primary)) 0%, 
                              ${pushIntensity > 0.5 ? '#22d3ee' : 'hsl(var(--primary))'} 50%,
                              ${pushIntensity > 0.8 ? '#22c55e' : 'hsl(var(--primary))'} 100%
                            )`,
                            boxShadow: pushIntensity > 0.3 
                              ? `0 0 ${pushIntensity * 20}px hsl(var(--primary)), 0 0 ${pushIntensity * 30}px hsl(var(--primary) / 0.5)` 
                              : 'none'
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground/60">Low</span>
                        <span className="text-xs text-muted-foreground/60">High</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <TrainingProgress
                      currentStep={currentStep}
                      neutralTrained={neutralTrained}
                      pushTrained={pushTrained}
                      trainingProgress={trainingProgress}
                      isTraining={isTraining}
                      pushTrainingRound={pushTrainingRound}
                      totalPushRounds={PUSH_TRAINING_ROUNDS}
                    />
                  </div>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}
                  
                  {/* Training result */}
                  {trainingResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`mb-6 p-4 rounded-lg ${
                        trainingResult === 'success' 
                          ? 'bg-primary/10 border border-primary/50' 
                          : 'bg-destructive/10 border border-destructive/50'
                      }`}
                    >
                      {trainingResult === 'success' ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Check className="w-5 h-5" />
                          <span className="font-medium">Training successful!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-destructive">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">Training needs more focus. Try again.</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    {!isTraining && !trainingResult && (
                      <Button
                        size="lg"
                        onClick={() => startTraining(currentStep)}
                        className="gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Start {currentStep === 'neutral' ? 'Neutral' : 'Push'} Training
                      </Button>
                    )}
                    
                    {trainingResult === 'success' && (
                      <Button
                        size="lg"
                        onClick={acceptTraining}
                        className="gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Accept & Continue
                      </Button>
                    )}
                    
                    {trainingResult && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={retryTraining}
                        className="gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Retry
                      </Button>
                    )}
                    
                    <Button
                      size="lg"
                      variant="ghost"
                      onClick={skipTraining}
                    >
                      Skip Training
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Complete Screen */}
              {currentStep === 'complete' && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
                  >
                    <Check className="w-12 h-12 text-primary" />
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    Training Complete!
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {activeHeadsets.length > 1 && currentHeadsetIndex < activeHeadsets.length - 1
                      ? `Headset ${currentHeadsetIndex + 1} trained. Ready for next headset.`
                      : 'Your mental commands have been calibrated. You\'re ready to begin!'}
                  </p>
                  
                  <Button
                    size="lg"
                    onClick={startExperience}
                    className="gap-2"
                  >
                    {activeHeadsets.length > 1 && currentHeadsetIndex < activeHeadsets.length - 1
                      ? 'Train Next Headset'
                      : 'Start Experience'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Training;
