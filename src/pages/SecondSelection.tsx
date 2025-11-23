import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PerHeadsetImageGrid } from "@/components/PerHeadsetImageGrid";
import { StatusPanel } from "@/components/StatusPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { level2Images } from "@/data/imageData";
import { useToast } from "@/hooks/use-toast";
import { Brain3D } from "@/components/Brain3D";
import type { MentalCommandEvent } from "@/lib/multiHeadsetCortexClient";

const SecondSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const imageGridRef = useRef<HTMLDivElement>(null);
  const [excitementLevel, setExcitementLevel] = useState(0);
  
  // Get state from first selection (reuse existing connection)
  const { 
    level1Selections, 
    connectedHeadsets, 
    mentalCommand, 
    motionEvent 
  } = location.state || {};

  // Track excitement from mental commands
  useEffect(() => {
    if (mentalCommand) {
      const cmd = mentalCommand as MentalCommandEvent;
      setExcitementLevel(cmd.pow || 0);
    }
  }, [mentalCommand]);

  useEffect(() => {
    if (!level1Selections || !connectedHeadsets) {
      toast({
        title: "Invalid Navigation",
        description: "Please complete the first selection step",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [level1Selections, connectedHeadsets, navigate, toast]);

  // Auto-scroll to image grid on mount
  useEffect(() => {
    if (imageGridRef.current) {
      setTimeout(() => {
        imageGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, []);

  const handleAllSelected = (selections: Map<string, number>) => {
    navigate("/results", {
      state: {
        level1Selections,
        level2Selections: selections,
        connectedHeadsets
      }
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Brain Background */}
      <Brain3D excitement={excitementLevel} className="opacity-20 z-0" />
      
      <Header />
      
      <div className="py-8 px-6 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Level 1
            </Button>
            
            <div className="text-center">
              <div className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
                Selection Progress
              </div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Level 2 of 2
              </div>
            </div>

            <div className="w-24" /> {/* Spacer for symmetry */}
          </div>
      </div>
    </div>

    <StatusPanel 
      connectedHeadsets={connectedHeadsets || []}
      lastCommand={mentalCommand ? { com: mentalCommand.com, pow: mentalCommand.pow } : null}
      connectionStatus="ready"
    />

    <div ref={imageGridRef}>
      <PerHeadsetImageGrid
        images={level2Images}
        mentalCommand={mentalCommand}
        motionEvent={motionEvent}
        connectedHeadsets={connectedHeadsets || []}
        onAllSelected={handleAllSelected}
        title="Select Your Image - Level 2"
        description="Each user selects one more image using mind control"
      />
    </div>

      {/* Manual navigation buttons for testing */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          ← Level 1
        </button>
        <button
          onClick={() => navigate("/excitement-level-3", { state: { connectedHeadsets, mentalCommand, motionEvent } })}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          → Level 3
        </button>
        <button
          onClick={() => navigate("/video-output")}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          → Video
        </button>
      </div>

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default SecondSelection;
