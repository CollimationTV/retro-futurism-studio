import { Card } from "@/components/ui/card";
import { Wifi, Battery, Activity, Users } from "lucide-react";

export const StatusPanel = () => {
  return (
    <section className="py-20 px-6 bg-card/30">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <Wifi className="h-6 w-6 text-primary" />
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            </div>
            <h4 className="text-lg font-bold mb-1 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Connection
            </h4>
            <p className="text-sm text-muted-foreground mb-2">Headset Status</p>
            <div className="text-2xl font-black text-primary">ACTIVE</div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <Battery className="h-6 w-6 text-primary" />
              <div className="text-xs text-muted-foreground">87%</div>
            </div>
            <h4 className="text-lg font-bold mb-1 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Power
            </h4>
            <p className="text-sm text-muted-foreground mb-2">Battery Level</p>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[87%] transition-all" />
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <Activity className="h-6 w-6 text-accent" />
              <div className="text-xs text-muted-foreground">Real-time</div>
            </div>
            <h4 className="text-lg font-bold mb-1 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Signal
            </h4>
            <p className="text-sm text-muted-foreground mb-2">EEG Quality</p>
            <div className="text-2xl font-black text-accent">98.4%</div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <Users className="h-6 w-6 text-primary" />
              <div className="text-xs text-muted-foreground">Multi-user</div>
            </div>
            <h4 className="text-lg font-bold mb-1 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Users
            </h4>
            <p className="text-sm text-muted-foreground mb-2">Active Sessions</p>
            <div className="text-2xl font-black text-primary">1/∞</div>
          </Card>
        </div>
      </div>
    </section>
  );
};
