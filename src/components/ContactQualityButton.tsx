import { useState } from 'react';
import { Activity } from 'lucide-react';
import { ContactQualityMap } from './ContactQualityMap';
import { motion } from 'framer-motion';

interface ContactQualityButtonProps {
  connectedHeadsets: string[];
}

export const ContactQualityButton = ({ connectedHeadsets }: ContactQualityButtonProps) => {
  const [showMap, setShowMap] = useState(false);

  if (connectedHeadsets.length === 0) return null;

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setShowMap(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 glass-panel rounded-lg hover:bg-secondary/50 transition-all duration-300 group"
        style={{
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.1), 0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Activity className="w-5 h-5 text-primary group-hover:text-foreground transition-colors" />
        <span className="text-sm font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          EEG Quality
        </span>
        
        {/* Subtle pulse indicator */}
        <div className="relative w-2 h-2">
          <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-green-500/50 animate-ping" />
        </div>
      </motion.button>

      {/* Contact Quality Map Modal */}
      {showMap && (
        <ContactQualityMap
          connectedHeadsets={connectedHeadsets}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  );
};
