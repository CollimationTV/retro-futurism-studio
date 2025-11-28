import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MentalCommandEvent, MotionEvent, HeadsetInfo, PerformanceMetricsEvent } from "@/lib/multiHeadsetCortexClient";
import { Brain, Power, AlertCircle, CheckCircle, Loader2, Headphones } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useCortex } from "@/contexts/CortexContext";

interface MultiHeadsetConnectionProps {
  onMentalCommand?: (command: MentalCommandEvent) => void;
  onMotion?: (motion: MotionEvent) => void;
  onPerformanceMetrics?: (metrics: PerformanceMetricsEvent) => void;
  onHeadsetsChange?: (headsetIds: string[]) => void;
  onConnectionStatus?: (status: 'disconnected' | 'connecting' | 'initializing' | 'ready' | 'error') => void;
}

export const MultiHeadsetConnection = ({ onMentalCommand, onMotion, onPerformanceMetrics, onHeadsetsChange, onConnectionStatus }: MultiHeadsetConnectionProps) => {
  const { toast } = useToast();
  const cortexContext = useCortex();
  const [clientId, setClientId] = useState(() => localStorage.getItem("emotiv_client_id") || "");
  const [clientSecret, setClientSecret] = useState(() => localStorage.getItem("emotiv_client_secret") || "");
  const [error, setError] = useState<string | null>(null);
  
  // Headset management
  const [availableHeadsets, setAvailableHeadsets] = useState<HeadsetInfo[]>([]);
  const [headsetStatuses, setHeadsetStatuses] = useState<Map<string, string>>(new Map());
  const [lastCommands, setLastCommands] = useState<Map<string, MentalCommandEvent>>(new Map());

  // Auto-load credentials on mount
  useEffect(() => {
    const savedClientId = localStorage.getItem("emotiv_client_id");
    const savedClientSecret = localStorage.getItem("emotiv_client_secret");
    if (savedClientId) setClientId(savedClientId);
    if (savedClientSecret) setClientSecret(savedClientSecret);
  }, []);

  const handleInitialize = async () => {
    const trimmedClientId = clientId.trim();
    const trimmedClientSecret = clientSecret.trim();
    
    if (!trimmedClientId || !trimmedClientSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your Emotiv Client ID and Client Secret",
        variant: "destructive",
      });
      return;
    }

    // Save credentials to localStorage
    localStorage.setItem("emotiv_client_id", trimmedClientId);
    localStorage.setItem("emotiv_client_secret", trimmedClientSecret);

    setError(null);

    try {
      const client = await cortexContext.connect(trimmedClientId, trimmedClientSecret);
      
      toast({
        title: "Connected!",
        description: "Successfully connected to Emotiv Cortex. Now scanning for headsets...",
      });
      
      // Use the returned client directly (no need to wait for React state)
      console.log('🔍 Loading available headsets with returned client');
      loadAvailableHeadsets(client);

    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Cortex');
      toast({
        title: "Connection Failed",
        description: "Make sure Emotiv Launcher is running and your credentials are correct",
        variant: "destructive",
      });
    }
  };

  const loadAvailableHeadsets = async (client: any) => {
    try {
      console.log('🔍 Calling client.getAvailableHeadsets()...');
      const headsets = await client.getAvailableHeadsets();
      setAvailableHeadsets(headsets);
      console.log(`✅ Found ${headsets.length} headset(s):`, headsets);
      
      if (headsets.length === 0) {
        toast({
          title: "No Headsets Found",
          description: "Please turn on your Emotiv headset(s)",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('❌ Failed to query headsets:', err);
    }
  };

  // Safety net: Load headsets if they weren't loaded during connect()
  useEffect(() => {
    if (cortexContext.status === 'ready' && cortexContext.client && availableHeadsets.length === 0) {
      console.log('🛡️ Safety net triggered: Loading headsets from useEffect');
      loadAvailableHeadsets(cortexContext.client);
    }
  }, [cortexContext.status, cortexContext.client]);

  const handleConnectHeadset = async (headsetId: string) => {
    if (!cortexContext.client) return;

    try {
      await cortexContext.client.initializeHeadset(headsetId);
      toast({
        title: "Headset Connected",
        description: `Successfully connected to headset ${headsetId.substring(0, 8)}...`,
      });
    } catch (err) {
      console.error(`Failed to connect headset ${headsetId}:`, err);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to headset ${headsetId.substring(0, 8)}...`,
        variant: "destructive",
      });
    }
  };

  // Update connected headsets when statuses change
  useEffect(() => {
    const connectedIds = Array.from(headsetStatuses.entries())
      .filter(([_, status]) => status === 'ready')
      .map(([id, _]) => id);
    onHeadsetsChangeRef.current?.(connectedIds);
  }, [headsetStatuses]);

  const handleDisconnectHeadset = async (headsetId: string) => {
    if (!cortexContext.client) return;
    
    await cortexContext.client.disconnectHeadset(headsetId);
    setHeadsetStatuses(prev => {
      const next = new Map(prev);
      next.delete(headsetId);
      return next;
    });
    setLastCommands(prev => {
      const next = new Map(prev);
      next.delete(headsetId);
      return next;
    });
    
    toast({
      title: "Headset Disconnected",
      description: `Disconnected from headset ${headsetId.substring(0, 8)}...`,
    });
  };

  const handleDisconnect = () => {
    cortexContext.disconnect();
    setAvailableHeadsets([]);
    setHeadsetStatuses(new Map());
    setLastCommands(new Map());
    toast({
      title: "Disconnected",
      description: "Disconnected from Emotiv Cortex",
    });
  };

  const handleRefreshHeadsets = async () => {
    if (cortexContext.client) {
      await loadAvailableHeadsets(cortexContext.client);
      toast({
        title: "Refreshed",
        description: "Scanned for available headsets",
      });
    }
  };

  // Store callback refs to avoid recreating event listeners
  const onMentalCommandRef = useRef(onMentalCommand);
  const onMotionRef = useRef(onMotion);
  const onPerformanceMetricsRef = useRef(onPerformanceMetrics);
  const onHeadsetsChangeRef = useRef(onHeadsetsChange);
  const onConnectionStatusRef = useRef(onConnectionStatus);

  // Update refs when props change (no re-subscription needed)
  useEffect(() => {
    onMentalCommandRef.current = onMentalCommand;
    onMotionRef.current = onMotion;
    onPerformanceMetricsRef.current = onPerformanceMetrics;
    onHeadsetsChangeRef.current = onHeadsetsChange;
    onConnectionStatusRef.current = onConnectionStatus;
  });

  // Listen to window events from CortexContext - NEVER RE-SUBSCRIBE
  useEffect(() => {
    const handleMentalCommandEvent = (e: CustomEvent) => {
      const event = e.detail as MentalCommandEvent;
      setLastCommands(prev => new Map(prev).set(event.headsetId, event));
      onMentalCommandRef.current?.(event);
    };

    const handleMotionEvent = (e: CustomEvent) => {
      const event = e.detail as MotionEvent;
      onMotionRef.current?.(event);
    };

    const handlePerformanceMetricsEvent = (e: CustomEvent) => {
      const event = e.detail as PerformanceMetricsEvent;
      onPerformanceMetricsRef.current?.(event);
    };

    const handleHeadsetStatusEvent = (e: CustomEvent) => {
      const { headsetId, status: headsetStatus } = e.detail;
      setHeadsetStatuses(prev => new Map(prev).set(headsetId, headsetStatus));
    };

    window.addEventListener('mental-command' as any, handleMentalCommandEvent);
    window.addEventListener('motion-event' as any, handleMotionEvent);
    window.addEventListener('performance-metrics' as any, handlePerformanceMetricsEvent);

    return () => {
      window.removeEventListener('mental-command' as any, handleMentalCommandEvent);
      window.removeEventListener('motion-event' as any, handleMotionEvent);
      window.removeEventListener('performance-metrics' as any, handlePerformanceMetricsEvent);
    };
  }, []); // Empty deps - never re-subscribe!

  // Sync status from context - only trigger when STATUS changes
  useEffect(() => {
    onConnectionStatusRef.current?.(cortexContext.status);
  }, [cortexContext.status]);

  // Update connected headsets - only trigger when HEADSETS change
  useEffect(() => {
    onHeadsetsChangeRef.current?.(cortexContext.connectedHeadsets);
  }, [cortexContext.connectedHeadsets]);

  const getStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-primary animate-pulse-glow" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Power className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getHeadsetStatus = (headsetId: string): string => {
    return headsetStatuses.get(headsetId) || 'disconnected';
  };

  const getHeadsetBadgeVariant = (headsetStatus: string) => {
    switch (headsetStatus) {
      case 'ready':
        return 'default';
      case 'connecting':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="p-6 border-primary/30 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          Multi-Headset Control
        </h3>
      </div>

      <Alert className="mb-6 border-primary/30 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-muted-foreground">
          <strong>Run locally required:</strong> You must run this app on your computer 
          (not Lovable preview) because Cortex uses wss://localhost:6868.
          Get credentials from{" "}
          <a 
            href="https://www.emotiv.com/my-account/cortex-apps/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Emotiv Developer Portal
          </a>
          {". Make sure Emotiv Launcher is running."}
        </AlertDescription>
      </Alert>

      {cortexContext.status === 'disconnected' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="clientId" className="text-sm uppercase tracking-wider">
              Client ID
            </Label>
            <Input
              id="clientId"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value.trim())}
              placeholder="Enter your Emotiv Client ID"
              className="mt-2 font-mono"
            />
          </div>

          <div>
            <Label htmlFor="clientSecret" className="text-sm uppercase tracking-wider">
              Client Secret
            </Label>
            <Input
              id="clientSecret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value.trim())}
              placeholder="Enter your Emotiv Client Secret"
              className="mt-2 font-mono"
            />
          </div>

          <Button
            onClick={handleInitialize}
            className="w-full bg-primary hover:bg-primary/90 font-bold uppercase tracking-wider"
          >
            Initialize Cortex
          </Button>
        </div>
      )}

      {(cortexContext.status === 'connecting' || cortexContext.status === 'initializing') && (
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              {cortexContext.status === 'connecting' ? 'Connecting to Cortex...' : 'Authenticating...'}
            </p>
          </div>
        </div>
      )}

      {cortexContext.status === 'ready' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary animate-pulse-glow" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Cortex Connected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefreshHeadsets}
                variant="outline"
                size="sm"
                className="border-primary/50"
              >
                Refresh
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                Disconnect
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Available Headsets ({availableHeadsets.length})
            </h4>
            
            {availableHeadsets.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  No headsets found. Please turn on your Emotiv headset(s) and click Refresh.
                </AlertDescription>
              </Alert>
            )}

            {availableHeadsets.map((headset) => {
              const headsetStatus = getHeadsetStatus(headset.id);
              const isConnected = headsetStatus === 'ready';
              const isConnecting = headsetStatus === 'connecting';
              const lastCommand = lastCommands.get(headset.id);

              return (
                <Card key={headset.id} className="p-4 border-border/50 bg-background/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Headphones className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-mono truncate">
                            {headset.id}
                          </span>
                          <Badge variant={getHeadsetBadgeVariant(headsetStatus)}>
                            {headsetStatus}
                          </Badge>
                        </div>
                        
                        {headset.firmware && (
                          <p className="text-xs text-muted-foreground">
                            Firmware: {headset.firmware}
                          </p>
                        )}
                        
                        {isConnected && lastCommand && (
                          <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-1">Last Command:</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-primary font-bold">
                                {lastCommand.com.toUpperCase()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Power: {(lastCommand.pow * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(headsetStatus)}
                      {!isConnected && !isConnecting && (
                        <Button
                          onClick={() => handleConnectHeadset(headset.id)}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          Connect
                        </Button>
                      )}
                      {isConnecting && (
                        <Button size="sm" disabled>
                          Connecting...
                        </Button>
                      )}
                      {isConnected && (
                        <Button
                          onClick={() => handleDisconnectHeadset(headset.id)}
                          size="sm"
                          variant="outline"
                          className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                          Disconnect
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </Card>
  );
};
