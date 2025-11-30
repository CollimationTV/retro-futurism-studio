import { useState, useEffect } from "react";
import { Key, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export const ApiKeySettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load API key from localStorage on mount
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key.",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem("openai_api_key", apiKey.trim());
    
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved successfully.",
    });
    
    setIsOpen(false);
  };

  const handleClear = () => {
    setApiKey("");
    localStorage.removeItem("openai_api_key");
    toast({
      title: "API Key Cleared",
      description: "Your OpenAI API key has been removed.",
    });
  };

  const hasKey = !!localStorage.getItem("openai_api_key");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${hasKey ? 'border-primary/50' : 'border-destructive/50'}`}
        >
          <Key className="h-4 w-4" />
          {hasKey ? "API Key Set" : "Set API Key"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>OpenAI API Key Settings</DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to enable Sora 2 Pro video generation. Your key is stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-proj-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="gap-2"
            disabled={!apiKey}
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
          <Button onClick={handleSave}>Save API Key</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
