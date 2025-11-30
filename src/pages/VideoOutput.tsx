import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Brain3D } from "@/components/Brain3D";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VideoOutput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { videoJobId, metadata } = location.state || {};
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [retrievalCode, setRetrievalCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'waiting' | 'ready' | 'revealed'>('waiting');
  const [progress, setProgress] = useState({ current: 0, max: 180, soraStatus: '' });
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pushProgress, setPushProgress] = useState(0);
  const [email, setEmail] = useState('');
  
  const startTimeRef = useRef<number>(Date.now());
  const pushHoldTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for job status
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

        setProgress({
          current: data.poll_attempts || 0,
          max: data.max_attempts || 180,
          soraStatus: data.sora_status || ''
        });

        if (data.status === 'completed' && data.video_url) {
          setVideoUrl(data.video_url);
          setRetrievalCode(data.retrieval_code);
          setStatus('ready');
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
  }, [videoJobId]);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for PUSH mental commands
  useEffect(() => {
    if (status !== 'ready') return;

    const handleMentalCommand = (event: CustomEvent) => {
      const { action, power } = event.detail;
      
      if (action === 'push' && power > 0.3) {
        // Start push hold timer
        if (!pushHoldTimerRef.current) {
          pushHoldTimerRef.current = setInterval(() => {
            setPushProgress(prev => {
              const next = prev + 10;
              if (next >= 100) {
                clearInterval(pushHoldTimerRef.current!);
                pushHoldTimerRef.current = null;
                setStatus('revealed');
                return 100;
              }
              return next;
            });
          }, 100);
        }
      } else {
        // Release push - clear timer
        if (pushHoldTimerRef.current) {
          clearInterval(pushHoldTimerRef.current);
          pushHoldTimerRef.current = null;
        }
      }
    };

    window.addEventListener('mental-command', handleMentalCommand as EventListener);
    return () => {
      window.removeEventListener('mental-command', handleMentalCommand as EventListener);
      if (pushHoldTimerRef.current) clearInterval(pushHoldTimerRef.current);
    };
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyCode = () => {
    if (retrievalCode) {
      navigator.clipboard.writeText(retrievalCode);
      toast({ title: "Code copied!", description: "Retrieval code copied to clipboard" });
    }
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

  if (error) {
    return (
      <div className="min-h-screen relative bg-background">
        <Brain3D excitement={0} className="opacity-10" />
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-destructive mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Generation Failed
            </h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Start Over
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
              Your AI-generated video is being created...
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tags Used:</span>
                <span className="text-foreground">{metadata?.slice(0, 2).join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="min-h-screen relative bg-background overflow-hidden">
        <Brain3D excitement={0.7} className="opacity-20" />
        <Header />
        
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl font-bold mb-8 animate-pulse" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            🌍 Your Vision is Ready 🌍
          </h1>
          
          {/* Blurred preview */}
          <div className="relative max-w-4xl mx-auto mb-12">
            <video
              src={videoUrl || ''}
              className="w-full rounded-lg blur-xl"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-4">PUSH to Reveal Your Creation</div>
                <div className="relative w-64 h-4 bg-border/50 rounded-full mx-auto overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-primary transition-all duration-100"
                    style={{ width: `${pushProgress}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground mt-2">{pushProgress}%</div>
              </div>
            </div>
          </div>
          
          {/* Retrieval Code */}
          <div className="max-w-md mx-auto bg-primary/10 border border-primary/50 rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Your Video Code</div>
            <div className="text-4xl font-bold text-primary font-mono mb-4">{retrievalCode}</div>
            <Button onClick={copyCode} variant="outline" className="gap-2">
              <Copy className="h-4 w-4" /> Copy Code
            </Button>
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
              <Button onClick={copyCode} variant="outline" className="w-full gap-2">
                <Copy className="h-4 w-4" /> Copy Code
              </Button>
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
