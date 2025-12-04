import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StatusPanel } from "@/components/StatusPanel";
import { Features } from "@/components/Features";
import { MultiHeadsetConnection } from "@/components/MultiHeadsetConnection";
import { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain } from "lucide-react";
import { Brain3D } from "@/components/Brain3D";
import { FuturisticGrid } from "@/components/FuturisticGrid";

const Index = () => {
  const navigate = useNavigate();
  const [mentalCommand, setMentalCommand] = useState<MentalCommandEvent | null>(null);
  const [motionEvent, setMotionEvent] = useState<MotionEvent | null>(null);
  const [connectedHeadsets, setConnectedHeadsets] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'ready' | 'error'>('disconnected');

  const handleMentalCommand = useCallback((command: MentalCommandEvent) => {
    setMentalCommand(command);
  }, []);

  const handleMotion = useCallback((motion: MotionEvent) => {
    // High-frequency console.log removed for performance
    setMotionEvent(motion);
  }, []);

  const handleHeadsetsChange = useCallback((headsetIds: string[]) => {
    setConnectedHeadsets(headsetIds);
  }, []);

  const handleConnectionStatus = useCallback((status: 'disconnected' | 'connecting' | 'initializing' | 'ready' | 'error') => {
    setConnectionStatus(status === 'initializing' ? 'connecting' : status as any);
  }, []);

  // Auto-navigate to Level 1 when connection is ready and headsets are connected
  useEffect(() => {
    if (connectionStatus === 'ready' && connectedHeadsets.length > 0) {
      setTimeout(() => {
        navigate("/excitement-level-1", { state: { connectedHeadsets, mentalCommand, motionEvent } });
      }, 500);
    }
  }, [connectionStatus, connectedHeadsets.length, navigate, connectedHeadsets, mentalCommand, motionEvent]);

  return (
    <div className="min-h-screen relative">
      {/* Futuristic Grid Overlay */}
      <FuturisticGrid className="z-0" />
      
      {/* Animated Brain Background */}
      <Brain3D excitement={0.5} className="opacity-30 z-0" />
      
      <Header />
      <Hero />
      
      <section className="py-12 px-6" data-connection-panel>
        <div className="container mx-auto max-w-4xl">
        <MultiHeadsetConnection
          onMentalCommand={handleMentalCommand}
          onMotion={handleMotion}
          onHeadsetsChange={handleHeadsetsChange}
          onConnectionStatus={handleConnectionStatus}
        />
        </div>
      </section>
      
      <StatusPanel 
        connectedHeadsets={connectedHeadsets}
        lastCommand={mentalCommand ? { com: mentalCommand.com, pow: mentalCommand.pow } : null}
        connectionStatus={connectionStatus}
      />
      
      {connectionStatus === 'ready' && connectedHeadsets.length > 0 && (
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="p-8 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
              <Brain className="w-16 h-16 mx-auto mb-4 text-primary/60 animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Launching Experience...</h3>
              <p className="text-muted-foreground">Navigating to Level 1</p>
            </div>
          </div>
        </section>
      )}
      
      {connectionStatus === 'ready' && connectedHeadsets.length === 0 && (
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="p-8 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
              <Brain className="w-16 h-16 mx-auto mb-4 text-primary/60" />
              <h3 className="text-2xl font-bold mb-2">No Headsets Connected</h3>
              <p className="text-muted-foreground">
                Connect and add at least one headset above to begin
              </p>
            </div>
          </div>
        </section>
      )}
      
      {(connectionStatus === 'disconnected' || connectionStatus === 'connecting' || connectionStatus === 'error') && (
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="p-8 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
              <Brain className="w-16 h-16 mx-auto mb-4 text-primary/60" />
              <h3 className="text-2xl font-bold mb-2">Connect Your Headset</h3>
              <p className="text-muted-foreground">
                {connectionStatus === 'connecting'
                  ? 'Authenticating with Emotiv Cortex...' 
                  : 'Connect your Emotiv headset above to begin the BraveWave experience'}
              </p>
            </div>
          </div>
        </section>
      )}
      
      <Features />
      
      {/* Manual navigation buttons for testing */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2">
        <button
          onClick={() => navigate("/excitement-level-1", { state: { connectedHeadsets, mentalCommand, motionEvent } })}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          → Level 1
        </button>
        <button
          onClick={() => navigate("/excitement-level-2", { state: { connectedHeadsets, mentalCommand, motionEvent } })}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          → Level 2
        </button>
        <button
          onClick={() => navigate("/video-output")}
          className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-sm font-mono transition-colors"
        >
          → Video
        </button>
      </div>
      
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default Index;
