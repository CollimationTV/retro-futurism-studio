interface FuturisticGridProps {
  className?: string;
}

export const FuturisticGrid = ({ className = "" }: FuturisticGridProps) => {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      {/* Main dense grid overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Secondary larger grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--accent) / 0.08) 2px, transparent 2px),
            linear-gradient(to bottom, hsl(var(--accent) / 0.08) 2px, transparent 2px)
          `,
          backgroundSize: '120px 120px'
        }}
      />
      
      {/* Crosshair center marker */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="w-12 h-12 border-2 border-primary/30 rounded-full animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 w-24 h-0.5 bg-primary/20 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-0.5 h-24 bg-primary/20 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Corner brackets - larger and more prominent */}
      <div className="absolute top-4 left-4 w-20 h-20 border-t-2 border-l-2 border-primary/50" />
      <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-primary/50" />
      <div className="absolute bottom-4 left-4 w-20 h-20 border-b-2 border-l-2 border-primary/50" />
      <div className="absolute bottom-4 right-4 w-20 h-20 border-b-2 border-r-2 border-primary/50" />
      
      {/* Corner accent dots */}
      <div className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full" style={{ boxShadow: '0 0 10px hsl(var(--primary))' }} />
      <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" style={{ boxShadow: '0 0 10px hsl(var(--primary))' }} />
      <div className="absolute bottom-4 left-4 w-2 h-2 bg-primary rounded-full" style={{ boxShadow: '0 0 10px hsl(var(--primary))' }} />
      <div className="absolute bottom-4 right-4 w-2 h-2 bg-primary rounded-full" style={{ boxShadow: '0 0 10px hsl(var(--primary))' }} />

      {/* Multiple scan line effects at different speeds */}
      <div 
        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        style={{ 
          top: '0',
          animation: 'scan-line 8s linear infinite'
        }}
      />
      <div 
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
        style={{ 
          top: '0',
          animation: 'scan-line 12s linear infinite',
          animationDelay: '2s'
        }}
      />
    </div>
  );
};
