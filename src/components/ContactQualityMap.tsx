import { useState, useEffect } from 'react';
import { Battery, Wifi, X } from 'lucide-react';
import { DeviceInfoEvent } from '@/lib/multiHeadsetCortexClient';
import { getHeadsetColor } from '@/utils/headsetColors';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactQualityMapProps {
  connectedHeadsets: string[];
  onClose: () => void;
}

// Sensor positions for EPOC X/EPOC+ (14 sensors + 2 reference)
const EPOC_SENSORS: Record<string, { x: number; y: number; label: string }> = {
  AF3: { x: 35, y: 20, label: 'AF3' },
  AF4: { x: 65, y: 20, label: 'AF4' },
  F7: { x: 15, y: 35, label: 'F7' },
  F3: { x: 35, y: 35, label: 'F3' },
  F4: { x: 65, y: 35, label: 'F4' },
  F8: { x: 85, y: 35, label: 'F8' },
  FC5: { x: 20, y: 45, label: 'FC5' },
  FC6: { x: 80, y: 45, label: 'FC6' },
  T7: { x: 10, y: 55, label: 'T7' },
  T8: { x: 90, y: 55, label: 'T8' },
  P7: { x: 25, y: 70, label: 'P7' },
  P8: { x: 75, y: 70, label: 'P8' },
  O1: { x: 40, y: 85, label: 'O1' },
  O2: { x: 60, y: 85, label: 'O2' },
  CMS: { x: 50, y: 55, label: 'CMS' },
  DRL: { x: 50, y: 65, label: 'DRL' },
};

// INSIGHT sensors (5 sensors)
const INSIGHT_SENSORS: Record<string, { x: number; y: number; label: string }> = {
  AF3: { x: 30, y: 25, label: 'AF3' },
  AF4: { x: 70, y: 25, label: 'AF4' },
  T7: { x: 15, y: 55, label: 'T7' },
  T8: { x: 85, y: 55, label: 'T8' },
  Pz: { x: 50, y: 75, label: 'Pz' },
};

const getQualityColor = (quality: number): string => {
  switch (quality) {
    case 0: return 'hsl(0 0% 35%)';     // No contact - dark gray
    case 1: return 'hsl(0 70% 50%)';     // Poor - red
    case 2: return 'hsl(35 90% 55%)';    // Fair - orange
    case 3: return 'hsl(50 90% 55%)';    // Good - yellow
    case 4: return 'hsl(140 70% 50%)';   // Excellent - green
    default: return 'hsl(0 0% 25%)';
  }
};

const getQualityGlow = (quality: number): string => {
  switch (quality) {
    case 3: return '0 0 12px hsl(50 90% 55% / 0.6)';
    case 4: return '0 0 15px hsl(140 70% 50% / 0.7), 0 0 25px hsl(140 70% 50% / 0.4)';
    default: return 'none';
  }
};

const getQualityLabel = (quality: number): string => {
  switch (quality) {
    case 0: return 'No Contact';
    case 1: return 'Poor';
    case 2: return 'Fair';
    case 3: return 'Good';
    case 4: return 'Excellent';
    default: return 'Unknown';
  }
};

export const ContactQualityMap = ({ connectedHeadsets, onClose }: ContactQualityMapProps) => {
  const [deviceInfoMap, setDeviceInfoMap] = useState<Record<string, DeviceInfoEvent>>({});
  const [selectedHeadset, setSelectedHeadset] = useState<string>(connectedHeadsets[0] || '');

  useEffect(() => {
    const handleDeviceInfo = (event: CustomEvent<DeviceInfoEvent>) => {
      setDeviceInfoMap(prev => ({
        ...prev,
        [event.detail.headsetId]: event.detail
      }));
    };

    window.addEventListener('device-info' as any, handleDeviceInfo);
    return () => window.removeEventListener('device-info' as any, handleDeviceInfo);
  }, []);

  useEffect(() => {
    if (connectedHeadsets.length > 0 && !connectedHeadsets.includes(selectedHeadset)) {
      setSelectedHeadset(connectedHeadsets[0]);
    }
  }, [connectedHeadsets, selectedHeadset]);

  const currentDeviceInfo = deviceInfoMap[selectedHeadset];
  const headsetColor = getHeadsetColor(selectedHeadset);
  
  // Determine which sensor layout to use based on available sensors
  const sensors = currentDeviceInfo?.contactQuality 
    ? (Object.keys(currentDeviceInfo.contactQuality).includes('Pz') ? INSIGHT_SENSORS : EPOC_SENSORS)
    : EPOC_SENSORS;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
        
        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-[520px] max-w-[95vw] glass-panel rounded-xl p-6 card-glow"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg transition-colors group"
          >
            <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 
              className="text-xl font-bold text-foreground tracking-wide"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              EEG CONTACT QUALITY
            </h2>
            <div className="w-16 h-0.5 bg-primary/50 mt-2" />
          </div>

          {/* Headset selector */}
          {connectedHeadsets.length > 1 && (
            <div className="mb-4">
              <select
                value={selectedHeadset}
                onChange={(e) => setSelectedHeadset(e.target.value)}
                className="w-full p-3 bg-secondary/50 border border-border/50 rounded-lg text-foreground font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {connectedHeadsets.map((headsetId) => (
                  <option key={headsetId} value={headsetId}>
                    {headsetId}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status indicators */}
          <div className="flex items-center justify-between mb-6 p-4 bg-secondary/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-3">
              <Battery className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-mono text-foreground">
                {currentDeviceInfo ? `${currentDeviceInfo.batteryPercent}%` : '--'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-muted-foreground" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className="w-2 rounded-sm transition-all duration-300"
                    style={{
                      height: `${8 + level * 2}px`,
                      backgroundColor: currentDeviceInfo && currentDeviceInfo.signal >= level
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted))',
                      boxShadow: currentDeviceInfo && currentDeviceInfo.signal >= level
                        ? '0 0 6px hsl(var(--primary) / 0.5)'
                        : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Overall</span>
              <span 
                className="text-sm font-bold font-mono"
                style={{ 
                  color: currentDeviceInfo 
                    ? getQualityColor(Math.round(currentDeviceInfo.overallQuality / 25)) 
                    : 'hsl(var(--muted-foreground))'
                }}
              >
                {currentDeviceInfo ? `${currentDeviceInfo.overallQuality}%` : '--'}
              </span>
            </div>
          </div>

          {/* Head diagram with sensors */}
          <div className="relative w-full aspect-square max-h-[280px] mx-auto mb-6">
            {/* Head outline */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Head shape with gradient */}
              <defs>
                <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--border))" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <ellipse
                cx="50"
                cy="50"
                rx="45"
                ry="48"
                fill="none"
                stroke="url(#headGradient)"
                strokeWidth="1.5"
              />
              {/* Ears */}
              <ellipse cx="5" cy="50" rx="4" ry="8" fill="none" stroke="hsl(var(--border) / 0.6)" strokeWidth="1" />
              <ellipse cx="95" cy="50" rx="4" ry="8" fill="none" stroke="hsl(var(--border) / 0.6)" strokeWidth="1" />
              {/* Nose indicator */}
              <path
                d="M 50 2 L 46 10 L 54 10 Z"
                fill="hsl(var(--primary) / 0.6)"
              />
              <text x="50" y="8" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="3" fontFamily="monospace">
                FRONT
              </text>
            </svg>

            {/* Sensor nodes */}
            {Object.entries(sensors).map(([sensorName, position]) => {
              const quality = currentDeviceInfo?.contactQuality[sensorName] ?? 0;
              const color = getQualityColor(quality);
              const glow = getQualityGlow(quality);
              
              return (
                <motion.div
                  key={sensorName}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * Object.keys(sensors).indexOf(sensorName) / Object.keys(sensors).length }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  }}
                >
                  {/* Sensor dot */}
                  <div
                    className="w-7 h-7 rounded-full border-2 transition-all duration-300 hover:scale-125 flex items-center justify-center"
                    style={{
                      backgroundColor: color,
                      borderColor: quality >= 3 ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--border))',
                      boxShadow: glow,
                    }}
                  >
                    {quality >= 4 && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: color }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 glass-panel rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="font-bold text-foreground font-mono">{position.label}</div>
                    <div 
                      className="font-mono"
                      style={{ color }}
                    >
                      {getQualityLabel(quality)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mb-4 p-3 bg-secondary/20 rounded-lg">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: getQualityColor(level),
                    boxShadow: getQualityGlow(level)
                  }}
                />
                <span className="text-xs font-mono text-muted-foreground">{getQualityLabel(level)}</span>
              </div>
            ))}
          </div>

          {/* Headset indicator */}
          {selectedHeadset && (
            <div className="flex items-center justify-center gap-3 pt-2 border-t border-border/30">
              <div
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: headsetColor,
                  boxShadow: `0 0 10px ${headsetColor}`
                }}
              />
              <span className="text-sm font-mono text-muted-foreground">{selectedHeadset}</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
