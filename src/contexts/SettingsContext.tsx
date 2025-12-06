import { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  tiltThreshold: number;
  setTiltThreshold: (value: number) => void;
  framesToTrigger: number;
  setFramesToTrigger: (value: number) => void;
  decaySpeed: number;
  setDecaySpeed: (value: number) => void;
  manualSelectionMode: boolean;
  setManualSelectionMode: (value: boolean) => void;
  showDebugPanel: boolean;
  setShowDebugPanel: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [tiltThreshold, setTiltThreshold] = useState(10);
  const [framesToTrigger, setFramesToTrigger] = useState(21);
  const [decaySpeed, setDecaySpeed] = useState(75);
  const [manualSelectionMode, setManualSelectionMode] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <SettingsContext.Provider
      value={{
        tiltThreshold,
        setTiltThreshold,
        framesToTrigger,
        setFramesToTrigger,
        decaySpeed,
        setDecaySpeed,
        manualSelectionMode,
        setManualSelectionMode,
        showDebugPanel,
        setShowDebugPanel,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
