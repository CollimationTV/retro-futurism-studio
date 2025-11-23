import { Activity, Zap, Brain, Users } from "lucide-react";

interface TechnicalReadoutProps {
  connectedHeadsets: number;
  averageExcitement: number;
  selectionsComplete: number;
  totalSelections: number;
  className?: string;
}

export const TechnicalReadout = ({
  connectedHeadsets,
  averageExcitement,
  selectionsComplete,
  totalSelections,
  className = ""
}: TechnicalReadoutProps) => {
  return (
    <div className={`fixed top-20 left-4 z-40 ${className}`}>
      <div className="bg-card/80 backdrop-blur-md border border-primary/30 rounded-lg p-4 space-y-3 min-w-[200px]">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-primary uppercase tracking-wider">
            System Status
          </span>
        </div>

        {/* Metrics */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              Headsets
            </span>
            <span className="text-primary font-bold">{connectedHeadsets}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Avg Excitement
            </span>
            <span className="text-accent font-bold">
              {Math.round(averageExcitement * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Progress
            </span>
            <span className="text-primary font-bold">
              {selectionsComplete}/{totalSelections}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-background rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${(selectionsComplete / totalSelections) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
