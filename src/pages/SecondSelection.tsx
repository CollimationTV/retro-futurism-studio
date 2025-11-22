import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { SelectableImageGrid } from "@/components/SelectableImageGrid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MentalCommandEvent } from "@/lib/multiHeadsetCortexClient";
import { level2Images } from "@/data/imageData";
import { useToast } from "@/hooks/use-toast";

const SecondSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  
  // Get state from first selection
  const { mentalCommand, level1Selections } = location.state || {};

  useEffect(() => {
    if (!level1Selections || level1Selections.length !== 5) {
      toast({
        title: "Invalid Navigation",
        description: "Please complete the first selection step",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [level1Selections, navigate, toast]);

  const handleComplete = () => {
    if (selectedImages.length === 5) {
      navigate("/results", {
        state: {
          level1Selections,
          level2Selections: selectedImages
        }
      });
    } else {
      toast({
        title: "Incomplete Selection",
        description: "Please select exactly 5 images to continue",
        variant: "destructive",
      });
    }
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

            <Button
              onClick={handleComplete}
              disabled={selectedImages.length !== 5}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              Complete
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <SelectableImageGrid
        images={level2Images}
        mentalCommand={mentalCommand}
        selectedImages={selectedImages}
        onSelectionChange={setSelectedImages}
        maxSelections={5}
        title="Select 5 More Images"
        description="Use your mind control or click to select 5 images from this collection"
      />

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default SecondSelection;
