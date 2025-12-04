import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const VideoPopout = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [videoUrl, setVideoUrl] = useState<string | null>(searchParams.get('url'));
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>(videoUrl ? 'playing' : 'loading');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Poll for video if we have a jobId but no URL yet
  useEffect(() => {
    if (videoUrl || !jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-video-status', {
          body: { jobId }
        });

        if (error) throw error;

        if (data.status === 'completed' && data.video_url) {
          setVideoUrl(data.video_url);
          setStatus('playing');
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          setStatus('error');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [jobId, videoUrl]);

  // Listen for new video URL updates via BroadcastChannel - this is the key for continuous updates
  useEffect(() => {
    const channel = new BroadcastChannel('bravewave-video');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'NEW_VIDEO' && event.data.videoUrl) {
        console.log('Received new video:', event.data.videoUrl);
        setVideoUrl(event.data.videoUrl);
        setStatus('playing');
        
        // Force video to reload and play
        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.play();
        }
      }
    };

    return () => channel.close();
  }, []);

  // Auto-play when video URL changes
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(console.error);
    }
  }, [videoUrl]);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-6 animate-pulse">🎬</div>
          <p className="text-2xl font-mono mb-2">Generating Video...</p>
          <p className="text-sm text-gray-400">Video will appear here when ready</p>
          <p className="text-xs text-gray-500 mt-4">This window will auto-update</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div className="text-6xl mb-6">❌</div>
          <p className="text-2xl">Video generation failed</p>
          <p className="text-sm text-gray-400 mt-2">Window will update when new video arrives</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={videoUrl || ''}
        autoPlay
        loop
        muted={false}
        playsInline
        className="max-w-full max-h-full w-full h-full object-contain"
      />
    </div>
  );
};

export default VideoPopout;
