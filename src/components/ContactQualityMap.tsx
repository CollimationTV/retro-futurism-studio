import { useState, useEffect } from 'react';
import { Battery, Wifi, X } from 'lucide-react';
import { DeviceInfoEvent } from '@/lib/multiHeadsetCortexClient';
import { getHeadsetColor } from '@/utils/headsetColors';

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
    case 0: return 'hsl(0 0% 40%)';     // No contact - gray
    case 1: return 'hsl(0 70% 50%)';     // Poor - red
    case 2: return 'hsl(30 80% 50%)';    // Fair - orange
    case 3: return 'hsl(50 80% 50%)';    // Good - yellow
    case 4: return 'hsl(120 70% 45%)';   // Excellent - green
    default: return 'hsl(0 0% 30%)';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-[500px] max-w-[95vw] bg-card border border-border rounded-xl p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-4">EEG Contact Quality</h2>

        {/* Headset selector */}
        {connectedHeadsets.length > 1 && (
          <div className="mb-4">
            <select
              value={selectedHeadset}
              onChange={(e) => setSelectedHeadset(e.target.value)}
              className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
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
        <div className="flex items-center justify-between mb-6 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {currentDeviceInfo ? `${currentDeviceInfo.batteryPercent}%` : '--'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-muted-foreground" />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className="w-2 h-3 rounded-sm transition-colors"
                  style={{
                    backgroundColor: currentDeviceInfo && currentDeviceInfo.signal >= level
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted))'
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Overall:</span>
            <span 
              className="text-sm font-bold"
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
        <div className="relative w-full aspect-square max-h-[300px] mx-auto">
          {/* Head outline */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Head shape */}
            <ellipse
              cx="50"
              cy="50"
              rx="45"
              ry="48"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
            />
            {/* Ears */}
            <ellipse cx="5" cy="50" rx="4" ry="8" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
            <ellipse cx="95" cy="50" rx="4" ry="8" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
            {/* Nose indicator */}
            <path
              d="M 50 2 L 47 8 L 53 8 Z"
              fill="hsl(var(--border))"
            />
          </svg>

          {/* Sensor nodes */}
          {Object.entries(sensors).map(([sensorName, position]) => {
            const quality = currentDeviceInfo?.contactQuality[sensorName] ?? 0;
            const color = getQualityColor(quality);
            
            return (
              <div
                key={sensorName}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
              >
                {/* Sensor dot */}
                <div
                  className="w-6 h-6 rounded-full border-2 transition-all duration-300 cursor-pointer hover:scale-125"
                  style={{
                    backgroundColor: color,
                    borderColor: quality >= 3 ? color : 'hsl(var(--border))',
                    boxShadow: quality >= 3 ? `0 0 10px ${color}` : 'none',
                  }}
                />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="font-bold text-foreground">{position.label}</div>
                  <div className="text-muted-foreground">{getQualityLabel(quality)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getQualityColor(level) }}
              />
              <span className="text-xs text-muted-foreground">{getQualityLabel(level)}</span>
            </div>
          ))}
        </div>

        {/* Headset indicator */}
        {selectedHeadset && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: headsetColor }}
            />
            <span className="text-sm text-muted-foreground">{selectedHeadset}</span>
          </div>
        )}
      </div>
    </div>
  );
};
