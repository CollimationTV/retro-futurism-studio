import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CortexProvider } from "./contexts/CortexContext";
import Index from "./pages/Index";
import SecondSelection from "./pages/SecondSelection";
import Results from "./pages/Results";
import ExcitementLevel3 from "./pages/ExcitementLevel3";
import VideoOutput from "./pages/VideoOutput";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CortexProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/level2" element={<SecondSelection />} />
            <Route path="/results" element={<Results />} />
            <Route path="/excitement-level-3" element={<ExcitementLevel3 />} />
            <Route path="/video-output" element={<VideoOutput />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CortexProvider>
  </QueryClientProvider>
);

export default App;
