
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Copy, Text } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AudioWaveform from "./AudioWaveform";
import { SpeechRecognitionService } from "@/utils/speechUtils";

const SpeechToText: React.FC = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionService, setRecognitionService] = useState<SpeechRecognitionService | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition service
    const service = new SpeechRecognitionService();
    setRecognitionService(service);

    return () => {
      // Cleanup
      if (service && service.isListening) {
        service.stop();
      }
    };
  }, []);

  const handleListen = () => {
    if (!recognitionService) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionService.stop();
      setIsListening(false);
      toast({
        title: "Listening Stopped",
        description: "Speech recognition has been stopped"
      });
    } else {
      const success = recognitionService.start(
        (text, isFinal) => {
          if (isFinal) {
            setTranscript(prev => prev + (prev ? ' ' : '') + text);
          }
        },
        (error) => {
          console.error("Speech recognition error:", error);
          toast({
            title: "Recognition Error",
            description: error.message,
            variant: "destructive"
          });
          setIsListening(false);
        }
      );

      if (success) {
        setIsListening(true);
        toast({
          title: "Listening",
          description: "Speak now. Your speech will be converted to text."
        });
      }
    }
  };

  const handleClear = () => {
    setTranscript("");
  };

  const handleCopy = () => {
    if (!transcript) return;
    
    navigator.clipboard.writeText(transcript).then(
      () => {
        toast({
          title: "Copied",
          description: "Transcript copied to clipboard"
        });
      },
      () => {
        toast({
          title: "Copy Failed",
          description: "Failed to copy transcript to clipboard",
          variant: "destructive"
        });
      }
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Text className="h-5 w-5 text-primary" /> 
          Speech to Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative">
            <Button
              onClick={handleListen}
              size="lg"
              variant={isListening ? "default" : "outline"}
              className={`rounded-full h-20 w-20 flex items-center justify-center ${isListening ? 'bg-accent hover:bg-accent/90' : ''}`}
            >
              {isListening ? (
                <MicOff className="h-10 w-10" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </Button>
            <div className={`mic-ripple ${isListening ? 'active bg-accent/30' : ''}`}></div>
          </div>
        </div>
        
        <AudioWaveform isActive={isListening} />
        
        <div className="space-y-2">
          <Textarea
            placeholder="Your speech will appear here..."
            className="min-h-[200px] resize-none"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            readOnly={false}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleClear} variant="outline" disabled={!transcript}>
          Clear
        </Button>
        <Button onClick={handleCopy} disabled={!transcript}>
          <Copy className="h-4 w-4 mr-2" /> Copy Text
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpeechToText;
