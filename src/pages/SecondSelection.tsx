import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PerHeadsetImageGrid } from "@/components/PerHeadsetImageGrid";
import { StatusPanel } from "@/components/StatusPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { level2Images } from "@/data/imageData";
import { useToast } from "@/hooks/use-toast";

const SecondSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get state from first selection (reuse existing connection)
  const { 
    level1Selections, 
    connectedHeadsets, 
    mentalCommand, 
    motionEvent 
  } = location.state || {};

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
    <div className="min-h-screen">
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

    <PerHeadsetImageGrid
      images={level2Images}
      mentalCommand={mentalCommand}
      motionEvent={motionEvent}
      connectedHeadsets={connectedHeadsets || []}
      onAllSelected={handleAllSelected}
      title="Select Your Image - Level 2"
      description="Each user selects one more image using mind control"
    />

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default SecondSelection;
