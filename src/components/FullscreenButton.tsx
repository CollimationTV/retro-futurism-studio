import { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FullscreenButton = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFullscreen}
      className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? (
        <Minimize className="h-4 w-4" />
      ) : (
        <Maximize className="h-4 w-4" />
      )}
    </Button>
  );
};
