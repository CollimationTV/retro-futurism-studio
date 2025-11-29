import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SensitivityControlsProps {
  rotationThreshold: number;
  pitchThreshold: number;
  rollThreshold: number;
  maxAngle: number;
  smoothingFactor: number;
  onRotationChange: (value: number) => void;
  onPitchChange: (value: number) => void;
  onRollChange: (value: number) => void;
  onMaxAngleChange: (value: number) => void;
  onSmoothingChange: (value: number) => void;
}

export const SensitivityControls = ({
  rotationThreshold,
  pitchThreshold,
  rollThreshold,
  maxAngle,
  smoothingFactor,
  onRotationChange,
  onPitchChange,
  onRollChange,
  onMaxAngleChange,
  onSmoothingChange,
}: SensitivityControlsProps) => {
  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-background/95 backdrop-blur-sm border-2 w-80 z-50">
      <h3 className="text-lg font-bold mb-4 text-primary">Sensitivity Controls</h3>
      
      <div className="space-y-4">
        {/* Rotation (Yaw) - Left/Right head turn */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Rotation (Yaw) - Horizontal</Label>
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{rotationThreshold.toFixed(1)}°</span>
          </div>
          <Slider
            value={[rotationThreshold]}
            onValueChange={([value]) => onRotationChange(value)}
            min={0.1}
            max={10}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Pitch - Up/Down head tilt */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Pitch - Vertical</Label>
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{pitchThreshold.toFixed(1)}°</span>
          </div>
          <Slider
            value={[pitchThreshold]}
            onValueChange={([value]) => onPitchChange(value)}
            min={0.1}
            max={10}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Roll - Head tilt left/right */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Roll - Tilt (L/R)</Label>
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{rollThreshold.toFixed(1)}°</span>
          </div>
          <Slider
            value={[rollThreshold]}
            onValueChange={([value]) => onRollChange(value)}
            min={0.1}
            max={10}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Cursor Speed (maxAngle) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Cursor Speed (Max Angle)</Label>
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{maxAngle.toFixed(0)}°</span>
          </div>
          <Slider
            value={[maxAngle]}
            onValueChange={([value]) => onMaxAngleChange(value)}
            min={1}
            max={60}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Lower = faster cursor</p>
        </div>

        {/* Smoothing Factor */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Smoothing</Label>
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{smoothingFactor.toFixed(2)}</span>
          </div>
          <Slider
            value={[smoothingFactor]}
            onValueChange={([value]) => onSmoothingChange(value)}
            min={0.1}
            max={0.9}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Higher = smoother/slower</p>
        </div>
      </div>
    </Card>
  );
};
