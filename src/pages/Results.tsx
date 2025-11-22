import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, CheckCircle2 } from "lucide-react";
import { level1Images, level2Images } from "@/data/imageData";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { level1Selections, level2Selections } = location.state || { level1Selections: [], level2Selections: [] };

  const selectedLevel1Images = level1Images.filter(img => level1Selections.includes(img.id));
  const selectedLevel2Images = level2Images.filter(img => level2Selections.includes(img.id));

  const handleStartOver = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-12 w-12 text-primary animate-pulse-glow" />
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Selection Complete
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              You've successfully selected {level1Selections.length + level2Selections.length} images across both levels
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleStartOver}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Start Over
              </Button>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4" />
                Export Selections
              </Button>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-6 flex items-center gap-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </span>
                Level 1 Selections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedLevel1Images.map((image) => (
                  <Card key={image.id} className="overflow-hidden border-primary/30">
                    <div className="aspect-video relative">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 bg-card">
                      <p className="text-sm font-semibold text-center">{image.title}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-6 flex items-center gap-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </span>
                Level 2 Selections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedLevel2Images.map((image) => (
                  <Card key={image.id} className="overflow-hidden border-primary/30">
                    <div className="aspect-video relative">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 bg-card">
                      <p className="text-sm font-semibold text-center">{image.title}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default Results;
