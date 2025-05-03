import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveApiKey } from "@/utils/speechUtils";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onClose }) => {
  const [key, setKey] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!key.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key",
        variant: "destructive"
      });
      return;
    }
    
    saveApiKey(key);
    toast({
      title: "API Key Saved",
      description: "Your ElevenLabs API key has been saved"
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ElevenLabs API Key</DialogTitle>
          <DialogDescription>
            An API key is required to use the text-to-speech functionality.
            Get your API key from <a href="https://elevenlabs.io/speech-synthesis" 
            target="_blank" rel="noopener noreferrer" 
            className="text-primary underline">ElevenLabs</a>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              placeholder="Enter your ElevenLabs API key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full"
              type="password"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Your API key is stored locally in your browser and is not transmitted to our servers.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
