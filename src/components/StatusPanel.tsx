import { Card } from "@/components/ui/card";
import { Wifi, Battery, Activity, Users } from "lucide-react";

interface StatusPanelProps {
  connectedHeadsets?: string[];
  lastCommand?: { com: string; pow: number } | null;
  connectionStatus?: 'disconnected' | 'connecting' | 'ready' | 'error';
}

export const StatusPanel = ({ 
  connectedHeadsets = [], 
  lastCommand = null,
  connectionStatus = 'disconnected' 
}: StatusPanelProps) => {
  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'ready':
        return { text: 'ACTIVE', color: 'text-primary', pulse: true };
      case 'connecting':
        return { text: 'CONNECTING', color: 'text-accent', pulse: true };
      case 'error':
        return { text: 'ERROR', color: 'text-destructive', pulse: false };
      default:
        return { text: 'OFFLINE', color: 'text-muted-foreground', pulse: false };
    }
  };

  const status = getConnectionStatus();
  const signalQuality = lastCommand ? Math.round(lastCommand.pow * 100) : 0;
  const activeUsers = connectedHeadsets.length;

  return (
    <section className="py-20 px-6 bg-card/30">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <Wifi className="h-6 w-6 text-primary" />
              {status.pulse && (
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              )}
            </div>
            <h4 className="text-lg font-bold mb-1 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Connection
            </h4>
            <p className="text-sm text-muted-foreground mb-2">Headset Status</p>
            <div className={`text-2xl font-black ${status.color}`}>{status.text}</div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <Battery className="h-6 w-6 text-primary" />
              <div className="text-xs text-muted-foreground">N/A</div>
            </div>
            <h4 className="text-lg font-bold mb-1 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Power
            </h4>
            <p className="text-sm text-muted-foreground mb-2">Battery Level</p>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-muted-foreground/30 w-full transition-all" />
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <Activity className="h-6 w-6 text-accent" />
              <div className="text-xs text-muted-foreground">
                {connectionStatus === 'ready' ? 'Real-time' : 'Offline'}
              </div>
            </div>
            <h4 className="text-lg font-bold mb-1 uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Signal
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              {lastCommand ? `Last: ${lastCommand.com.toUpperCase()}` : 'EEG Quality'}
            </p>
            <div className={`text-2xl font-black ${signalQuality > 0 ? 'text-accent' : 'text-muted-foreground'}`}>
              {signalQuality}%
            </div>
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
            <div className={`text-2xl font-black ${activeUsers > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
              {activeUsers}/∞
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};