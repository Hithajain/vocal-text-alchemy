
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioWaveform as AudioIcon, Play, Pause, Volume2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AudioWaveform from "./AudioWaveform";
import { extractTextFromPdf } from "@/utils/pdfUtils";

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
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleClearText = () => {
    setText("");
    setSelectedFile(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);

    // Check if the file is a PDF
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingFile(true);
    
    try {
      toast({
        title: "Processing PDF",
        description: "Extracting text from your PDF file..."
      });
      
      const extractedText = await extractTextFromPdf(file);
      
      // Update the text area with the extracted content
      setText(extractedText);
      
      toast({
        title: "PDF Processed",
        description: `Successfully extracted text from ${file.name}`
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process the PDF file",
        variant: "destructive"
      });
    } finally {
      setIsProcessingFile(false);
      // Clear the file input
      e.target.value = '';
    }
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
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => document.getElementById('pdf-upload')?.click()}
                disabled={isProcessingFile}
              >
                <FileText className="h-4 w-4" />
                {selectedFile ? `${selectedFile.name}` : "Attach PDF"}
              </Button>
              <input 
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessingFile}
              />
            </div>
            {isProcessingFile && <span className="text-xs animate-pulse">Processing PDF...</span>}
            {!isProcessingFile && text && (
              <Button variant="ghost" size="sm" onClick={handleClearText}>
                Clear Text
              </Button>
            )}
          </div>
          <Textarea
            placeholder="Enter text to convert to speech or upload a PDF..."
            className="min-h-[200px] resize-none"
            value={text}
            onChange={handleTextChange}
            disabled={isGenerating || isProcessingFile}
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
        </div>
        
        {isSpeaking && <AudioWaveform isActive={isSpeaking} />}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isSpeaking ? (
          <Button 
            onClick={handleGenerateSpeech} 
            disabled={isGenerating || !text.trim() || voices.length === 0 || isProcessingFile} 
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
