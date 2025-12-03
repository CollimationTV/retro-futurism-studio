import { useState } from "react";
import { Settings, ChevronDown, ChevronUp, Users, Zap, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";

interface RemoteOperatorPanelProps {
  connectedHeadsets?: string[];
  onForceSelection?: (headsetId: string, imageId: number) => void;
  currentLevel?: number;
}

export const RemoteOperatorPanel = ({ 
  connectedHeadsets = [],
  onForceSelection,
  currentLevel = 1
}: RemoteOperatorPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    tiltThreshold, 
    setTiltThreshold, 
    framesToTrigger, 
    setFramesToTrigger,
    decaySpeed,
    setDecaySpeed,
    manualSelectionMode,
    setManualSelectionMode
  } = useSettings();

  const [selectedHeadset, setSelectedHeadset] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);

  const handleForceSelection = () => {
    if (selectedHeadset && onForceSelection) {
      onForceSelection(selectedHeadset, selectedImage);
    }
  };

  return (
    <div className="fixed bottom-28 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-background/90 backdrop-blur-sm border-primary/50 gap-2"
      >
        <Settings className="h-4 w-4" />
        Operator Controls
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </Button>
      
      {isOpen && (
        <Card className="absolute bottom-12 right-0 w-80 p-4 bg-background/95 backdrop-blur-md border-primary/30 shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider">Operator Panel</h3>
              <span className="text-xs text-muted-foreground">Level {currentLevel}</span>
            </div>

            {/* Cursor Sensitivity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Cursor Sensitivity</Label>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tilt Threshold</span>
                  <span>{tiltThreshold.toFixed(2)}</span>
                </div>
                <Slider
                  value={[tiltThreshold]}
                  onValueChange={([val]) => setTiltThreshold(val)}
                  min={0.1}
                  max={2.0}
                  step={0.05}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Frames to Trigger</span>
                  <span>{framesToTrigger}</span>
                </div>
                <Slider
                  value={[framesToTrigger]}
                  onValueChange={([val]) => setFramesToTrigger(val)}
                  min={1}
                  max={60}
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Decay Speed</span>
                  <span>{decaySpeed}%</span>
                </div>
                <Slider
                  value={[decaySpeed]}
                  onValueChange={([val]) => setDecaySpeed(val)}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>
            </div>

            {/* Manual Selection Mode */}
            <div className="space-y-3 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">Manual Mode</Label>
                </div>
                <Switch
                  checked={manualSelectionMode}
                  onCheckedChange={setManualSelectionMode}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enable to allow click-based selection for stuck users
              </p>
            </div>

            {/* Force Selection */}
            {connectedHeadsets.length > 0 && onForceSelection && (
              <div className="space-y-3 border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">Force Selection</Label>
                </div>
                
                <select
                  value={selectedHeadset || ''}
                  onChange={(e) => setSelectedHeadset(e.target.value || null)}
                  className="w-full p-2 text-sm bg-background border border-border rounded"
                >
                  <option value="">Select headset...</option>
                  {connectedHeadsets.map((id) => (
                    <option key={id} value={id}>{id.slice(0, 8)}...</option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selectedImage}
                    onChange={(e) => setSelectedImage(parseInt(e.target.value) || 0)}
                    min={0}
                    max={7}
                    className="flex-1 p-2 text-sm bg-background border border-border rounded"
                    placeholder="Image ID (0-7)"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleForceSelection}
                    disabled={!selectedHeadset}
                  >
                    Force
                  </Button>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="text-xs text-muted-foreground border-t border-border pt-3">
              <div className="flex justify-between">
                <span>Connected Headsets:</span>
                <span className="text-primary">{connectedHeadsets.length}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
