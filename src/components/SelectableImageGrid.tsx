import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Focus } from "lucide-react";
import { MentalCommandEvent } from "@/lib/multiHeadsetCortexClient";
import { ImageData } from "@/data/imageData";

interface SelectableImageGridProps {
  images: ImageData[];
  mentalCommand?: MentalCommandEvent | null;
  selectedImages: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  maxSelections: number;
  title: string;
  description: string;
}

export const SelectableImageGrid = ({
  images,
  mentalCommand,
  selectedImages,
  onSelectionChange,
  maxSelections,
  title,
  description
}: SelectableImageGridProps) => {
  const [focusedImageIndex, setFocusedImageIndex] = useState(0);
  const [activeImage, setActiveImage] = useState(images[0]);

  useEffect(() => {
    if (!mentalCommand) return;

    const { com } = mentalCommand;

    switch (com) {
      case 'right':
        setFocusedImageIndex((prev) => (prev + 1) % images.length);
        break;
      case 'left':
        setFocusedImageIndex((prev) => (prev - 1 + images.length) % images.length);
        break;
      case 'push':
      case 'pull':
        handleImageSelect(images[focusedImageIndex].id);
        break;
      case 'lift':
        setFocusedImageIndex((prev) => Math.max(0, prev - 3));
        break;
      case 'drop':
        setFocusedImageIndex((prev) => Math.min(images.length - 1, prev + 3));
        break;
    }
  }, [mentalCommand, focusedImageIndex, images]);

  useEffect(() => {
    setActiveImage(images[focusedImageIndex]);
  }, [focusedImageIndex, images]);

  const handleImageSelect = (id: number) => {
    if (selectedImages.includes(id)) {
      onSelectionChange(selectedImages.filter((imgId) => imgId !== id));
    } else if (selectedImages.length < maxSelections) {
      onSelectionChange([...selectedImages, id]);
    }
  };

  return (
    <section className="py-12 px-6 bg-background/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {title}
          </h2>
          <p className="text-muted-foreground mb-4">{description}</p>
          
          <div className="flex items-center justify-center gap-6 p-4 rounded-lg border border-primary/30 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Focus className="h-5 w-5 text-primary" />
              <span className="text-sm font-mono">
                Command: <span className="text-primary font-bold">{mentalCommand?.com || 'NEUTRAL'}</span>
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-mono">
                Selected: <span className="text-primary font-bold">{selectedImages.length}/{maxSelections}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => {
            const isSelected = selectedImages.includes(image.id);
            const isFocused = index === focusedImageIndex;

            return (
              <Card
                key={image.id}
                className={`
                  relative overflow-hidden cursor-pointer transition-all duration-300
                  ${isSelected ? 'border-primary border-2 shadow-lg shadow-primary/20' : 'border-border'}
                  ${isFocused && !isSelected ? 'border-accent border-2 shadow-lg shadow-accent/20' : ''}
                  hover:scale-105 hover:shadow-xl
                `}
                onClick={() => handleImageSelect(image.id)}
                onMouseEnter={() => setActiveImage(image)}
                onMouseLeave={() => setActiveImage(images[focusedImageIndex])}
              >
                <div className="aspect-video relative">
                  <img
                    src={image.url}
                    alt={`Image ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                      <CheckCircle2 className="h-12 w-12 text-primary drop-shadow-lg animate-pulse-glow" />
                    </div>
                  )}
                  
                  {isFocused && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-accent text-accent-foreground font-bold">
                        FOCUSED
                      </Badge>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary text-primary-foreground font-bold">
                        ✓ SELECTED
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
