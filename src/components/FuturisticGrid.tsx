interface FuturisticGridProps {
  className?: string;
}

export const FuturisticGrid = ({ className = "" }: FuturisticGridProps) => {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      {/* Main grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Crosshair center marker */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 border-2 border-primary/40 rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-primary/30 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-0.5 h-16 bg-primary/30 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-primary/40" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-primary/40" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-primary/40" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-primary/40" />

      {/* Scan line effect */}
      <div 
        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line"
        style={{ top: '0' }}
      />
    </div>
  );
};
