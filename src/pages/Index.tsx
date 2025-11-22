import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SelectableImageGrid } from "@/components/SelectableImageGrid";
import { StatusPanel } from "@/components/StatusPanel";
import { Features } from "@/components/Features";
import { MultiHeadsetConnection } from "@/components/MultiHeadsetConnection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MentalCommandEvent } from "@/lib/multiHeadsetCortexClient";
import { level1Images } from "@/data/imageData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentalCommand, setMentalCommand] = useState<MentalCommandEvent | null>(null);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);

  const handleMentalCommand = (command: MentalCommandEvent) => {
    setMentalCommand(command);
  };

  const handleProceedToLevel2 = () => {
    if (selectedImages.length === 5) {
      navigate("/level2", {
        state: {
          mentalCommand,
          level1Selections: selectedImages
        }
      });
    } else {
      toast({
        title: "Incomplete Selection",
        description: "Please select exactly 5 images to continue to Level 2",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <MultiHeadsetConnection onMentalCommand={handleMentalCommand} />
        </div>
      </section>
      
      <StatusPanel />
      
      <SelectableImageGrid
        images={level1Images}
        mentalCommand={mentalCommand}
        selectedImages={selectedImages}
        onSelectionChange={setSelectedImages}
        maxSelections={5}
        title="Select 5 Images - Level 1"
        description="Use your mind control or click to select 5 images from the collection below"
      />

      <div className="py-8 px-6 text-center">
        <Button
          onClick={handleProceedToLevel2}
          disabled={selectedImages.length !== 5}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/90 font-bold uppercase tracking-wider"
        >
          Proceed to Level 2
          <ArrowRight className="h-5 w-5" />
        </Button>
        {selectedImages.length !== 5 && (
          <p className="text-sm text-muted-foreground mt-4">
            Select {5 - selectedImages.length} more image{5 - selectedImages.length !== 1 ? 's' : ''} to continue
          </p>
        )}
      </div>
      
      <Features />
      
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default Index;
