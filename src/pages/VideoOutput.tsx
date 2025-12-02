import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Brain3D } from "@/components/Brain3D";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VideoOutput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { videoJobId, metadata } = location.state || {};
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [retrievalCode, setRetrievalCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'waiting' | 'revealed'>('waiting');
  const [progress, setProgress] = useState({ current: 0, max: 180, soraStatus: '', promptUsed: '' });
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [email, setEmail] = useState('');
  const [isResuming, setIsResuming] = useState(false);
  
  const startTimeRef = useRef<number>(Date.now());
  const lastProgressRef = useRef<{ attempts: number, timestamp: number }>({ attempts: 0, timestamp: Date.now() });

  // Poll for job status with auto-resume on stall
  useEffect(() => {
    if (!videoJobId) {
      setError('No video job ID provided');
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-video-status', {
          body: { jobId: videoJobId }
        });

        if (error) throw error;

        const currentAttempts = data.poll_attempts || 0;
        const now = Date.now();

        // Update progress
        setProgress({
          current: currentAttempts,
          max: data.max_attempts || 180,
          soraStatus: data.sora_status || '',
          promptUsed: data.prompt_used || ''
        });

        // Detect stalled job: processing but no progress for 30+ seconds
        const timeSinceLastProgress = now - lastProgressRef.current.timestamp;
        const isStalled = 
          data.status === 'processing' && 
          currentAttempts === lastProgressRef.current.attempts &&
          timeSinceLastProgress > 30000 && // 30 seconds
          !isResuming;

        if (isStalled) {
          console.log('🔄 Job stalled, triggering resume...');
          setIsResuming(true);
          
          // Get API key from localStorage for resume
          const apiKey = localStorage.getItem('openai_api_key');
          
          if (apiKey) {
            // Call resume function with API key
            const { error: resumeError } = await supabase.functions.invoke('resume-video-job', {
              body: { jobId: videoJobId, apiKey }
            });

            if (resumeError) {
              console.error('Resume error:', resumeError);
            }
          } else {
            console.error('No API key found for resume');
          }
          
          // Reset resuming flag after 10 seconds to allow re-triggering if needed
          setTimeout(() => setIsResuming(false), 10000);
        }

        // Update last progress tracker if attempts changed
        if (currentAttempts > lastProgressRef.current.attempts) {
          lastProgressRef.current = { attempts: currentAttempts, timestamp: now };
        }

        if (data.status === 'completed' && data.video_url) {
          setVideoUrl(data.video_url);
          setRetrievalCode(data.retrieval_code);
          setStatus('revealed');
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          setError(data.error_message || 'Video generation failed');
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setError(err.message);
        clearInterval(pollInterval);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [videoJobId, isResuming]);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `${retrievalCode || 'video'}.mp4`;
      a.click();
    }
  };

  const sendEmail = async () => {
    if (!email || !videoUrl) return;
    
    toast({ 
      title: "Email feature", 
      description: "Email delivery coming soon! Use download or save your code for now." 
    });
  };

  if (error || !videoJobId) {
    return (
      <div className="min-h-screen relative bg-background">
        <Brain3D excitement={0} className="opacity-10" />
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-destructive mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {error || 'No Video Job ID'}
            </h1>
            <p className="text-muted-foreground mb-4">
              {error 
                ? error 
                : "It looks like you navigated here directly without completing the experience flow."}
            </p>
            {!videoJobId && (
              <p className="text-sm text-muted-foreground mb-8">
                Please start from the beginning and complete all selection levels to generate your video.
              </p>
            )}
            <Button onClick={() => { navigate('/'); window.location.reload(); }} variant="outline">
              Start New Experience
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'waiting') {
    const progressPercent = (progress.current / progress.max) * 100;
    
    return (
      <div className="min-h-screen relative bg-background">
        <Brain3D excitement={0.3} className="opacity-15" />
        <Header />
        
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Crafting Your Vision
            </h1>
            <p className="text-xl text-muted-foreground mb-12">
              {isResuming ? '🔄 Resuming generation...' : 'Your AI-generated video is being created...'}
            </p>
            
            {/* Progress Ring */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="8"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-primary">{Math.round(progressPercent)}%</div>
                <div className="text-sm text-muted-foreground mt-2">{formatTime(elapsedTime)}</div>
              </div>
            </div>
            
            {/* Status Info */}
            <div className="bg-background/50 backdrop-blur border border-primary/30 rounded-lg p-6 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-primary font-mono">{progress.soraStatus || 'Processing'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Attempts:</span>
                <span className="text-accent">{progress.current} / {progress.max}</span>
              </div>
              <div className="space-y-2">
                <span className="text-muted-foreground">Prompt Sent to Sora:</span>
                <p className="text-foreground text-sm italic">"{progress.promptUsed || 'Generating prompt...'}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // status === 'revealed'
  return (
    <div className="min-h-screen relative bg-background">
      <Brain3D excitement={0.8} className="opacity-15" />
      <Header />
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-12" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            🎉 Your Creation Awaits
          </h1>
          
          {/* Video Player */}
          <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary/50 shadow-2xl mb-8">
            <video
              src={videoUrl || ''}
              controls
              autoPlay
              loop
              className="w-full h-full"
            />
          </div>
          
          {/* Retrieval Code & Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-background/50 backdrop-blur border border-primary/30 rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Your Video Code</div>
              <div className="text-3xl font-bold text-primary font-mono mb-4">{retrievalCode}</div>
              <div className="text-xs text-muted-foreground mb-4">
                Save this code to find your video later
              </div>
            </div>
            
            <div className="bg-background/50 backdrop-blur border border-border rounded-lg p-6 space-y-4">
              <Button onClick={downloadVideo} className="w-full gap-2">
                <Download className="h-4 w-4" /> Download Video
              </Button>
              
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter email to receive link"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={sendEmail} variant="outline" className="w-full gap-2">
                  <Mail className="h-4 w-4" /> Email Video Link
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/')} size="lg">
              Create Another Experience
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoOutput;
