import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MultiHeadsetCortexClient, MentalCommandEvent, MotionEvent, PerformanceMetricsEvent } from "@/lib/multiHeadsetCortexClient";

interface CortexContextType {
  cortexClient: MultiHeadsetCortexClient | null;
  setCortexClient: (client: MultiHeadsetCortexClient | null) => void;
  mentalCommand: MentalCommandEvent | null;
  motionEvent: MotionEvent | null;
  performanceMetrics: PerformanceMetricsEvent | null;
  connectedHeadsets: string[];
  connectionStatus: 'disconnected' | 'connecting' | 'ready' | 'error';
}

const CortexContext = createContext<CortexContextType | undefined>(undefined);

export const CortexProvider = ({ children }: { children: ReactNode }) => {
  const [cortexClient, setCortexClient] = useState<MultiHeadsetCortexClient | null>(null);
  const [mentalCommand, setMentalCommand] = useState<MentalCommandEvent | null>(null);
  const [motionEvent, setMotionEvent] = useState<MotionEvent | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsEvent | null>(null);
  const [connectedHeadsets, setConnectedHeadsets] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'ready' | 'error'>('disconnected');

  // Set up event handlers when cortex client changes
  useEffect(() => {
    if (!cortexClient) return;

    cortexClient.onMentalCommand = (event) => {
      setMentalCommand(event);
    };

    cortexClient.onMotion = (event) => {
      setMotionEvent(event);
    };

    cortexClient.onPerformanceMetrics = (event) => {
      setPerformanceMetrics(event);
    };

    cortexClient.onConnectionStatus = (status) => {
      setConnectionStatus(status as 'disconnected' | 'connecting' | 'ready' | 'error');
    };

    // Cleanup
    return () => {
      if (cortexClient) {
        cortexClient.onMentalCommand = null;
        cortexClient.onMotion = null;
        cortexClient.onPerformanceMetrics = null;
        cortexClient.onConnectionStatus = null;
      }
    };
  }, [cortexClient]);

  return (
    <CortexContext.Provider
      value={{
        cortexClient,
        setCortexClient,
        mentalCommand,
        motionEvent,
        performanceMetrics,
        connectedHeadsets,
        connectionStatus,
      }}
    >
      {children}
    </CortexContext.Provider>
  );
};

export const useCortex = () => {
  const context = useContext(CortexContext);
  if (context === undefined) {
    throw new Error("useCortex must be used within a CortexProvider");
  }
  return context;
};
