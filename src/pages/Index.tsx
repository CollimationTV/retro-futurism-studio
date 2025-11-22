import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ImageGrid } from "@/components/ImageGrid";
import { StatusPanel } from "@/components/StatusPanel";
import { Features } from "@/components/Features";
import { MultiHeadsetConnection } from "@/components/MultiHeadsetConnection";
import { MentalCommandEvent } from "@/lib/multiHeadsetCortexClient";

const Index = () => {
  const [mentalCommand, setMentalCommand] = useState<MentalCommandEvent | null>(null);

  const handleMentalCommand = (command: MentalCommandEvent) => {
    setMentalCommand(command);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <MultiHeadsetConnection onMentalCommand={handleMentalCommand} />
        </div>
      </section>
      
      <StatusPanel />
      <ImageGrid mentalCommand={mentalCommand} />
      <Features />
      
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default Index;
