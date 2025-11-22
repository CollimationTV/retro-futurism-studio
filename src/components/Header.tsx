import { Brain, Zap } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary animate-pulse-glow" />
              <Zap className="absolute -top-1 -right-1 h-4 w-4 text-accent" />
            </div>
            <h1 className="text-2xl font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="neon-glow">NEURO</span>
              <span className="neon-glow-magenta">VISION</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">System Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
