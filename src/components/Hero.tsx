import { Button } from "@/components/ui/button";
import { Brain, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/50 mb-8">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground uppercase tracking-wider">Powered by Emotiv Cortex</span>
        </div>
        
        <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          <span className="block neon-glow">MIND-CONTROLLED</span>
          <span className="block text-accent neon-glow-magenta">IMAGE SELECTION</span>
        </h2>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Experience the future of brain-computer interfaces. Select images using only your thoughts 
          through advanced EEG technology and real-time neural processing.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider group relative overflow-hidden"
            onClick={() => {
              const connectionSection = document.querySelector('[data-connection-panel]');
              connectionSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Initialize Session
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary/50 hover:bg-primary/10 font-bold uppercase tracking-wider"
            onClick={() => window.open('https://emotiv.gitbook.io/cortex-api/', '_blank')}
          >
            View Documentation
          </Button>
        </div>
        
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-black text-primary neon-glow mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>9</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Image Grid</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-accent neon-glow-magenta mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>∞</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-primary neon-glow mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>98%</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Accuracy</div>
          </div>
        </div>
      </div>
    </section>
  );
};
