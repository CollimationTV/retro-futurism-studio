import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TrainingProgressProps {
  currentStep: 'neutral' | 'push' | 'complete';
  neutralTrained: boolean;
  pushTrained: boolean;
  trainingProgress: number;
  isTraining: boolean;
  pushTrainingRound?: number;
  totalPushRounds?: number;
}

export const TrainingProgress = ({
  currentStep,
  neutralTrained,
  pushTrained,
  trainingProgress,
  isTraining,
  pushTrainingRound = 0,
  totalPushRounds = 4
}: TrainingProgressProps) => {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            neutralTrained ? 'bg-primary border-primary' : currentStep === 'neutral' ? 'border-primary' : 'border-muted'
          }`}>
            {neutralTrained ? (
              <Check className="w-5 h-5 text-primary-foreground" />
            ) : (
              <span className="text-sm font-bold">1</span>
            )}
          </div>
          <span className={`text-sm font-medium ${currentStep === 'neutral' ? 'text-primary' : 'text-muted-foreground'}`}>
            Neutral
          </span>
        </div>
        
        <div className="w-12 h-px bg-border" />
        
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            pushTrained ? 'bg-primary border-primary' : currentStep === 'push' ? 'border-primary' : 'border-muted'
          }`}>
            {pushTrained ? (
              <Check className="w-5 h-5 text-primary-foreground" />
            ) : (
              <span className="text-sm font-bold">2</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${currentStep === 'push' ? 'text-primary' : 'text-muted-foreground'}`}>
              Push
            </span>
            {currentStep === 'push' && !pushTrained && (
              <div className="flex gap-1 mt-1">
                {Array.from({ length: totalPushRounds }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < pushTrainingRound ? 'bg-primary' : i === pushTrainingRound ? 'bg-primary/50 animate-pulse' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="w-12 h-px bg-border" />
        
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'complete' ? 'bg-primary border-primary' : 'border-muted'
          }`}>
            {currentStep === 'complete' ? (
              <Check className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </div>
          <span className={`text-sm font-medium ${currentStep === 'complete' ? 'text-primary' : 'text-muted-foreground'}`}>
            Complete
          </span>
        </div>
      </div>
      
      {/* Training progress bar */}
      {isTraining && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Training...</span>
            <span className="font-mono">{Math.round(trainingProgress)}%</span>
          </div>
          <Progress value={trainingProgress} className="h-3" />
          <motion.div
            className="text-center text-xs text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Hold steady for 8 seconds
          </motion.div>
        </div>
      )}
    </div>
  );
};
