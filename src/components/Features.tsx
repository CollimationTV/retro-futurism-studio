import { Card } from "@/components/ui/card";
import { Brain, Zap, Shield, Cpu } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "EEG Detection",
    description: "Advanced neural signal processing using Emotiv headsets for accurate mental command recognition",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description: "Instant response to mental commands with < 100ms latency through Cortex SDK integration",
  },
  {
    icon: Shield,
    title: "Multi-User Support",
    description: "Seamless profile management allowing unlimited users with individual training data",
  },
  {
    icon: Cpu,
    title: "Cloud Sync",
    description: "Automatic synchronization of mental command profiles across devices via EmotivID",
  },
];

export const Features = () => {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4 tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <span className="neon-glow">CORE FEATURES</span>
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built on cutting-edge BCI technology to deliver seamless mind-controlled interactions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 border-border/50 bg-card/50 hover:border-primary/50 hover:card-glow transition-all group"
            >
              <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10 border border-primary/30 group-hover:border-primary/50 transition-all">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-lg font-bold mb-2 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {feature.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
