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
            linear-gradient(to right, hsl(var(--primary) / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Secondary larger grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.05) 2px, transparent 2px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.05) 2px, transparent 2px)
          `,
          backgroundSize: '120px 120px'
        }}
      />
      
      {/* Corner brackets - subtle white */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t border-l border-primary/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t border-r border-primary/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b border-l border-primary/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b border-r border-primary/30" />
    </div>
  );
};
