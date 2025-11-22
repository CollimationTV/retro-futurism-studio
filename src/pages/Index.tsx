import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ImageGrid } from "@/components/ImageGrid";
import { StatusPanel } from "@/components/StatusPanel";
import { Features } from "@/components/Features";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <StatusPanel />
      <ImageGrid />
      <Features />
      
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
      </div>
    </div>
  );
};

export default Index;
