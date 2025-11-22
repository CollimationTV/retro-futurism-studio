import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PerHeadsetImageGrid } from "@/components/PerHeadsetImageGrid";
import { StatusPanel } from "@/components/StatusPanel";
import { Features } from "@/components/Features";
import { MultiHeadsetConnection } from "@/components/MultiHeadsetConnection";
import { MentalCommandEvent, MotionEvent } from "@/lib/multiHeadsetCortexClient";
import { level1Images } from "@/data/imageData";

const Index = () => {
  const navigate = useNavigate();
  const [mentalCommand, setMentalCommand] = useState<MentalCommandEvent | null>(null);
  const [motionEvent, setMotionEvent] = useState<MotionEvent | null>(null);
  const [connectedHeadsets, setConnectedHeadsets] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'ready' | 'error'>('disconnected');

  const handleMentalCommand = (command: MentalCommandEvent) => {
    setMentalCommand(command);
  };

  const handleMotion = (motion: MotionEvent) => {
    setMotionEvent(motion);
  };

  const handleHeadsetsChange = (headsetIds: string[]) => {
    setConnectedHeadsets(headsetIds);
  };

  const handleConnectionStatus = (status: 'disconnected' | 'connecting' | 'initializing' | 'ready' | 'error') => {
    setConnectionStatus(status === 'initializing' ? 'connecting' : status as any);
  };

  const handleAllSelected = (selections: Map<string, number>) => {
    navigate("/level2", {
      state: {
        level1Selections: selections,
        connectedHeadsets,
        mentalCommand,
        motionEvent
      }
    });
  };

  return (
    <div className="min-h-screen">
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
      
      <PerHeadsetImageGrid
        images={level1Images}
        mentalCommand={mentalCommand}
        motionEvent={motionEvent}
        connectedHeadsets={connectedHeadsets}
        onAllSelected={handleAllSelected}
        title="Select Your Image - Level 1"
        description="Each user selects one image using mind control"
      />
      
      <Features />
      
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default Index;
