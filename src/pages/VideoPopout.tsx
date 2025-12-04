import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const VideoPopout = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [videoUrl, setVideoUrl] = useState<string | null>(searchParams.get('url'));
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>(videoUrl ? 'playing' : 'loading');

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

  // Listen for new video URL updates via BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('bravewave-video');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'NEW_VIDEO' && event.data.videoUrl) {
        setVideoUrl(event.data.videoUrl);
        setStatus('playing');
      }
    };

    return () => channel.close();
  }, []);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-xl font-mono">Generating video...</p>
          <p className="text-sm text-gray-400 mt-2">Video will appear here when ready</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-xl">Video generation failed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <video
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
