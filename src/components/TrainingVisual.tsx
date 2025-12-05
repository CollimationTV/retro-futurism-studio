import { motion } from "framer-motion";
import { Brain, Zap } from "lucide-react";

interface TrainingVisualProps {
  action: 'neutral' | 'push';
  isActive: boolean;
  progress: number;
}

export const TrainingVisual = ({ action, isActive, progress }: TrainingVisualProps) => {
  if (action === 'neutral') {
    return (
      <div className="relative w-64 h-64 mx-auto">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/30"
          animate={isActive ? {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-primary/50"
          animate={isActive ? {
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Brain className="w-24 h-24 text-primary/70" />
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            {isActive ? "Clear your mind..." : "Relax and breathe"}
          </p>
        </div>
      </div>
    );
  }

  // Push visual
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Animated rings pushing outward */}
      {isActive && [0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-primary"
          initial={{ scale: 0.3, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Center push icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center"
          animate={isActive ? {
            scale: [1, 0.8, 1],
            boxShadow: [
              "0 0 20px hsl(var(--primary) / 0.3)",
              "0 0 40px hsl(var(--primary) / 0.6)",
              "0 0 20px hsl(var(--primary) / 0.3)"
            ]
          } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <Zap className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
      
      {/* Arrow indicators */}
      {isActive && (
        <>
          <motion.div
            className="absolute left-1/2 top-0 -translate-x-1/2"
            animate={{ y: [-10, -20, -10], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-transparent border-b-primary" />
          </motion.div>
          <motion.div
            className="absolute left-1/2 bottom-0 -translate-x-1/2 rotate-180"
            animate={{ y: [10, 20, 10], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-transparent border-b-primary" />
          </motion.div>
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90"
            animate={{ x: [-10, -20, -10], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-transparent border-b-primary" />
          </motion.div>
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90"
            animate={{ x: [10, 20, 10], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-transparent border-b-primary" />
          </motion.div>
        </>
      )}
      
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          {isActive ? "Push outward with your mind!" : "Imagine pushing a heavy object"}
        </p>
      </div>
    </div>
  );
};
