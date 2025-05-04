
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioWaveform as AudioIcon, Play, Pause, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AudioWaveform from "./AudioWaveform";

interface Voice {
  id: string;
  name: string;
  language: string;
}

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  // Initialize available voices
  useEffect(() => {
    const initVoices = () => {
      const speechSynthesis = window.speechSynthesis;
      const availableVoices = speechSynthesis.getVoices();
      
      if (availableVoices.length > 0) {
        const formattedVoices = availableVoices.map(voice => ({
          id: voice.voiceURI,
          name: voice.name,
          language: voice.lang
        }));
        
        setVoices(formattedVoices);
        
        // Set a default voice
        if (formattedVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(formattedVoices[0].id);
        }
      }
    };

    // Get voices on load
    initVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = initVoices;
    }

    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
  };

  const handleGenerateSpeech = () => {
    if (!text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to convert to speech",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      // Create a new speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set the selected voice
      const synVoices = window.speechSynthesis.getVoices();
      const selectedSynVoice = synVoices.find(voice => voice.voiceURI === selectedVoice);
      if (selectedSynVoice) {
        utterance.voice = selectedSynVoice;
      }
      
      // Set voice properties
      utterance.rate = 1; // Normal speed
      utterance.pitch = 1; // Normal pitch
      
      // Events
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsSpeaking(false);
        toast({
          title: "Speech Error",
          description: `Error during speech synthesis: ${event.error}`,
          variant: "destructive"
        });
      };
      
      // Speak
      window.speechSynthesis.speak(utterance);
      
      toast({
        title: "Speaking",
        description: "Your text is being spoken"
      });
    } catch (error) {
      console.error("Failed to generate speech:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate speech",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    
    toast({
      title: "Speech Stopped",
      description: "Text-to-speech has been stopped"
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AudioIcon className="h-5 w-5 text-primary" /> 
          Text to Speech
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Enter text to convert to speech..."
            className="min-h-[200px] resize-none"
            value={text}
            onChange={handleTextChange}
            disabled={isGenerating}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-1/2">
            <Select 
              value={selectedVoice} 
              onValueChange={handleVoiceChange} 
              disabled={isGenerating || voices.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name} - {voice.language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Volume2 className="h-4 w-4 mr-2" /> Adjust Voice
          </Button>
        </div>
        
        {isSpeaking && <AudioWaveform isActive={isSpeaking} />}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isSpeaking ? (
          <Button 
            onClick={handleGenerateSpeech} 
            disabled={isGenerating || !text.trim() || voices.length === 0} 
            className="w-full sm:w-auto"
          >
            {isGenerating ? "Generating..." : "Speak Text"}
          </Button>
        ) : (
          <Button 
            onClick={handleStopSpeech}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Stop Speaking
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TextToSpeech;
