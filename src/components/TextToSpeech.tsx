
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Audio, Play, Pause, Settings } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import AudioWaveform from "./AudioWaveform";
import { defaultVoices, getApiKey, generateSpeech } from "@/utils/speechUtils";

interface TextToSpeechProps {
  onApiKeyRequest: () => void;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ onApiKeyRequest }) => {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(defaultVoices[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
  };

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to convert to speech",
        variant: "destructive"
      });
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      onApiKeyRequest();
      return;
    }

    try {
      setIsGenerating(true);
      const url = await generateSpeech(text, selectedVoice, apiKey);
      
      setAudioUrl(url);
      
      toast({
        title: "Speech Generated",
        description: "Your text has been converted to speech"
      });
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.load();
      }
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

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      void audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Audio className="h-5 w-5 text-primary" /> 
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
            <Select value={selectedVoice} onValueChange={handleVoiceChange} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {defaultVoices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name} - {voice.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={onApiKeyRequest} variant="outline" size="sm" className="w-full sm:w-auto">
            <Settings className="h-4 w-4 mr-2" /> API Key
          </Button>
        </div>
        
        {audioUrl && (
          <>
            <AudioWaveform isActive={isPlaying} />
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={handleAudioEnded} 
              className="hidden"
            />
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={handleGenerateSpeech} 
          disabled={isGenerating || !text.trim()} 
          className="w-full sm:w-auto"
        >
          {isGenerating ? "Generating..." : "Generate Speech"}
        </Button>
        
        {audioUrl && (
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TextToSpeech;
