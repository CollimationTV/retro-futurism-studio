import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, RotateCcw, Music, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VideoOutput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState({
    pollAttempts: 0,
    maxAttempts: 60,
    soraStatus: 'pending',
    promptUsed: '',
    elapsedSeconds: 0,
  });
  const [showDebug, setShowDebug] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [soraJobId, setSoraJobId] = useState<string | null>(null);

  const { metadata, collectiveScore, soundtrack, level3Selections } = location.state || {};

  useEffect(() => {
    const metadataFromState = metadata || location.state?.metadata;
    
    if (!metadataFromState || metadataFromState.length === 0) {
      toast({
        title: "No Selection Data",
        description: "Please complete the selection process first.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    const startTime = Date.now();
    let elapsedInterval: NodeJS.Timeout;

    const generateVideo = async () => {
      try {
        // Start elapsed time counter
        elapsedInterval = setInterval(() => {
          setProgressData(prev => ({
            ...prev,
            elapsedSeconds: Math.floor((Date.now() - startTime) / 1000),
          }));
        }, 1000);

        // Get API key from localStorage
        const apiKey = localStorage.getItem('openai_api_key');

        // Start video generation and get job ID
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sora-video`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ 
              metadata: metadataFromState,
              apiKey,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || `Failed to start video generation (${response.status})`);
          setIsGenerating(false);
          clearInterval(elapsedInterval);
          return;
        }

        const data = await response.json();
        const newJobId = data.jobId;
        setJobId(newJobId);

        if (!newJobId) {
          setError("No job ID returned from API");
          setIsGenerating(false);
          clearInterval(elapsedInterval);
          return;
        }

        // Poll for job completion with progress updates
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-video-status`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({ jobId: newJobId }),
              }
            );

            if (!statusResponse.ok) {
              clearInterval(pollInterval);
              clearInterval(elapsedInterval);
              setError("Failed to check video status");
              setIsGenerating(false);
              return;
            }

            const jobData = await statusResponse.json();

            // Update progress data
            setProgressData({
              pollAttempts: jobData.poll_attempts || 0,
              maxAttempts: jobData.max_attempts || 60,
              soraStatus: jobData.sora_status || jobData.status,
              promptUsed: jobData.prompt_used || '',
              elapsedSeconds: Math.floor((Date.now() - startTime) / 1000),
            });

            if (jobData.sora_job_id) {
              setSoraJobId(jobData.sora_job_id);
            }

            if (jobData.status === 'completed' && jobData.video_url) {
              clearInterval(pollInterval);
              clearInterval(elapsedInterval);
              setVideoUrl(jobData.video_url);
              setIsGenerating(false);
            } else if (jobData.status === 'failed') {
              clearInterval(pollInterval);
              clearInterval(elapsedInterval);
              setError(jobData.error_message || "Video generation failed");
              setIsGenerating(false);
            }
          } catch (err) {
            clearInterval(pollInterval);
            clearInterval(elapsedInterval);
            setError(err instanceof Error ? err.message : "Unknown error occurred");
            setIsGenerating(false);
          }
        }, 3000); // Poll every 3 seconds

        // Cleanup on unmount
        return () => {
          clearInterval(pollInterval);
          clearInterval(elapsedInterval);
        };

      } catch (err) {
        console.error("❌ Unexpected error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setIsGenerating(false);
        if (elapsedInterval) clearInterval(elapsedInterval);
      }
    };

    generateVideo();
  }, [location.state, navigate, toast, metadata]);

  const handleStartOver = () => {
    navigate("/");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getProgressPercentage = () => {
    if (progressData.maxAttempts === 0) return 0;
    return Math.min((progressData.pollAttempts / progressData.maxAttempts) * 100, 100);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="p-8 max-w-2xl w-full">
          <div className="flex flex-col items-center gap-6">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <h1 className="text-3xl font-bold text-foreground">Generation Error</h1>
            <p className="text-muted-foreground text-center">{error}</p>
            <Button onClick={handleStartOver} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Start Over
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="p-8 max-w-6xl w-full">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <Loader2 className="w-20 h-20 animate-spin text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Generating Your Vision...</h1>
            
            {/* Progress Bar */}
            <div className="w-full max-w-2xl space-y-3">
              <Progress value={getProgressPercentage()} className="h-3" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {progressData.pollAttempts > 0 
                    ? `${Math.round(getProgressPercentage())}% (${progressData.pollAttempts}/${progressData.maxAttempts} checks)`
                    : 'Starting...'}
                </span>
                <span className="text-muted-foreground font-mono">
                  {formatTime(progressData.elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* Status Display */}
            <div className="mt-4 space-y-2 text-center max-w-2xl w-full">
              <div className="flex items-center justify-center gap-2">
                <div className="text-sm font-semibold text-primary">
                  Sora Status:
                </div>
                <div className="text-sm text-foreground capitalize px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                  {progressData.soraStatus || 'initializing'}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground animate-pulse">
                This typically takes 2-5 minutes
              </div>
            </div>

            {/* Metadata Display */}
            {metadata && metadata.length > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border w-full max-w-2xl">
                <div className="text-sm font-semibold text-foreground mb-2">Metadata Tags:</div>
                <div className="flex flex-wrap gap-2">
                  {metadata.map((tag: string, idx: number) => (
                    <span 
                      key={idx}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Display */}
            {progressData.promptUsed && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border w-full max-w-2xl">
                <div className="text-sm font-semibold text-foreground mb-2">Prompt Sent to Sora:</div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {progressData.promptUsed}
                </div>
              </div>
            )}

            {/* Debug Panel Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="mt-4 gap-2"
            >
              {showDebug ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showDebug ? 'Hide' : 'Show'} Debug Info
            </Button>

            {/* Debug Panel */}
            {showDebug && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border w-full max-w-2xl font-mono text-xs">
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">Job ID:</span>{' '}
                    <span className="text-foreground">{jobId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sora Job ID:</span>{' '}
                    <span className="text-foreground">{soraJobId || 'Pending...'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Poll Attempts:</span>{' '}
                    <span className="text-foreground">{progressData.pollAttempts}/{progressData.maxAttempts}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    <span className="text-foreground">{progressData.soraStatus}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Elapsed:</span>{' '}
                    <span className="text-foreground">{formatTime(progressData.elapsedSeconds)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Your Generated Video</h1>
              <p className="text-muted-foreground text-lg mb-2">
                Created from your mind-controlled selections
              </p>
              {level3Selections && level3Selections.length > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  Earth formed by {level3Selections.length} emotional resonance{level3Selections.length !== 1 ? 's' : ''}
                </p>
              )}
              {soundtrack && collectiveScore !== undefined && (
                <div className="inline-flex flex-col items-center gap-2 px-6 py-3 bg-primary/10 rounded-lg border border-primary/20 mt-4">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">Soundtrack: {soundtrack.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{soundtrack.description}</p>
                  <p className="text-xs text-muted-foreground">Collective Excitement Score: {collectiveScore}/100</p>
                </div>
              )}
            </div>
            
            <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
              {videoUrl ? (
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Video player loading...</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleStartOver} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Create Another
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VideoOutput;
