import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PerHeadsetImageGrid } from "@/components/PerHeadsetImageGrid";
import { StatusPanel } from "@/components/StatusPanel";
import { Features } from "@/components/Features";
import { CortexConnection } from "@/components/CortexConnection";
import { useCortex } from "@/contexts/CortexContext";
import { level1Images } from "@/data/imageData";

const Index = () => {
  const navigate = useNavigate();
  const { mentalCommand, motionEvent, connectionStatus } = useCortex();
  const [isConnected, setIsConnected] = useState(false);

  const handleAllSelected = (selections: Map<string, number>) => {
    navigate("/level2", {
      state: {
        level1Selections: selections,
      }
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      <section className="py-12 px-6" data-connection-panel>
        <div className="container mx-auto max-w-4xl">
          <CortexConnection 
            onMentalCommand={(cmd) => setIsConnected(true)}
          />
        </div>
      </section>
      
      {isConnected && (
        <>
          <StatusPanel 
            connectedHeadsets={[]}
            lastCommand={mentalCommand ? { com: mentalCommand.com, pow: mentalCommand.pow } : null}
            connectionStatus={connectionStatus}
          />
          
          <PerHeadsetImageGrid
            images={level1Images}
            mentalCommand={mentalCommand}
            motionEvent={motionEvent}
            connectedHeadsets={[]}
            onAllSelected={handleAllSelected}
            title="Select Your Image - Level 1"
            description="Each user selects one image using mind control"
          />
        </>
      )}
      
      <Features />
      
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default Index;
