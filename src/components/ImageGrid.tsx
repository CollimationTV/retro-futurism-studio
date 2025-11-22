import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Brain, Check } from "lucide-react";
import { MentalCommandEvent } from "@/lib/multiHeadsetCortexClient";

// Generate 9 placeholder images in 16:9 format
const images = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  url: `https://images.unsplash.com/photo-${1500000000000 + i * 10000000}?w=800&h=450&fit=crop`,
}));

interface ImageGridProps {
  mentalCommand?: MentalCommandEvent | null;
}

export const ImageGrid = ({ mentalCommand }: ImageGridProps) => {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const [focusedImageIndex, setFocusedImageIndex] = useState<number>(0);

  // Handle mental commands to navigate and select
  useEffect(() => {
    if (!mentalCommand) return;

    const { com, pow } = mentalCommand;
    
    // Only respond to commands with sufficient power (>30%)
    if (pow < 0.3) return;

    switch (com) {
      case 'push':
      case 'pull':
        // Select/deselect the currently focused image
        handleImageSelect(images[focusedImageIndex].id);
        break;
      case 'left':
        // Move focus left
        setFocusedImageIndex(prev => Math.max(0, prev - 1));
        break;
      case 'right':
        // Move focus right
        setFocusedImageIndex(prev => Math.min(images.length - 1, prev + 1));
        break;
      case 'lift':
        // Move focus up (3 columns)
        setFocusedImageIndex(prev => Math.max(0, prev - 3));
        break;
      case 'drop':
        // Move focus down (3 columns)
        setFocusedImageIndex(prev => Math.min(images.length - 1, prev + 3));
        break;
    }
  }, [mentalCommand]);

  // Set active image based on focused index
  useEffect(() => {
    setActiveImage(images[focusedImageIndex].id);
  }, [focusedImageIndex]);

  const handleImageSelect = (id: number) => {
    setSelectedImages(prev => 
      prev.includes(id) ? prev.filter(imgId => imgId !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <span className="neon-glow">NEURAL INTERFACE</span>
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Focus on an image to select it using your mental commands. The system detects your intention through EEG signals.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4 p-4 border border-primary/30 bg-card/50 rounded-lg max-w-2xl mx-auto">
          <Brain className="h-5 w-5 text-primary animate-pulse-glow" />
          <div className="text-sm">
            <span className="text-muted-foreground">Command:</span>{" "}
            <span className="text-primary font-bold font-mono">
              {mentalCommand ? mentalCommand.com.toUpperCase() : 'NONE'}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-sm">
            <span className="text-muted-foreground">Power:</span>{" "}
            <span className="text-accent font-bold">
              {mentalCommand ? `${(mentalCommand.pow * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-sm">
            <span className="text-muted-foreground">Selected:</span>{" "}
            <span className="text-accent font-bold">{selectedImages.length}/9</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {images.map((image) => {
            const isSelected = selectedImages.includes(image.id);
            const isActive = activeImage === image.id;
            
            return (
              <Card
                key={image.id}
                className={`
                  relative aspect-video overflow-hidden cursor-pointer
                  border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-primary card-glow-active' 
                    : isActive 
                    ? 'border-accent card-glow' 
                    : 'border-border/50 hover:border-primary/50'
                  }
                `}
                onClick={() => handleImageSelect(image.id)}
                onMouseEnter={() => setActiveImage(image.id)}
                onMouseLeave={() => setActiveImage(null)}
              >
                <img
                  src={image.url}
                  alt={`Image ${image.id}`}
                  className="w-full h-full object-cover"
                />
                
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-primary rounded-full p-3">
                      <Check className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                )}
                
                {isActive && !isSelected && (
                  <div className="absolute inset-0 border-2 border-accent animate-pulse-glow pointer-events-none" />
                )}
                
                <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono">
                  #{image.id.toString().padStart(2, '0')}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
