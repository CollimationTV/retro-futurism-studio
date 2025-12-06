import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CortexProvider } from "./contexts/CortexContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { FullscreenButton } from "./components/FullscreenButton";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Training from "./pages/Training";
import ExcitementLevel1 from "./pages/ExcitementLevel1";
import ExcitementLevel2 from "./pages/ExcitementLevel2";
import ExcitementLevel3 from "./pages/ExcitementLevel3";
import AudioEmotion from "./pages/AudioEmotion";
import VideoOutput from "./pages/VideoOutput";
import VideoPopout from "./pages/VideoPopout";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Global keyboard shortcut for simulating PUSH command (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar triggers simulated push (only if not in an input field)
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as Element)?.tagName)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('mental-command', {
          detail: {
            headsetId: 'keyboard-test',
            action: 'push',
            power: 0.5
          }
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CortexProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <FullscreenButton />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/training" element={<Training />} />
                <Route path="/excitement-level-1" element={<ExcitementLevel1 />} />
                <Route path="/excitement-level-2" element={<ExcitementLevel2 />} />
                <Route path="/results" element={<Results />} />
                <Route path="/excitement-level-3" element={<ExcitementLevel3 />} />
                <Route path="/audio-emotion" element={<AudioEmotion />} />
                <Route path="/video-output" element={<VideoOutput />} />
                <Route path="/video-popout" element={<VideoPopout />} />
                <Route path="/admin" element={<Admin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SettingsProvider>
      </CortexProvider>
    </QueryClientProvider>
  );
};

export default App;
