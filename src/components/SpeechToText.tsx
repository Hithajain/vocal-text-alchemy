
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Copy, Text, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AudioWaveform from "./AudioWaveform";
import { SpeechRecognitionService } from "@/utils/speechUtils";
import { extractTextFromPdf } from "@/utils/pdfUtils";

const SpeechToText: React.FC = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionService, setRecognitionService] = useState<SpeechRecognitionService | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    setSelectedFile(null);
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
      
      // Update the transcript with the extracted content
      setTranscript(extractedText);
      
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
              disabled={isProcessingFile}
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
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => document.getElementById('pdf-upload-speech')?.click()}
                disabled={isListening || isProcessingFile}
              >
                <FileText className="h-4 w-4" />
                {selectedFile ? `${selectedFile.name}` : "Attach PDF"}
              </Button>
              <input 
                id="pdf-upload-speech"
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isListening || isProcessingFile}
              />
            </div>
            {isProcessingFile && <span className="text-xs animate-pulse">Processing PDF...</span>}
          </div>
          <Textarea
            placeholder="Your speech will appear here or upload a PDF to extract text..."
            className="min-h-[200px] resize-none"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            readOnly={false}
            disabled={isProcessingFile}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleClear} variant="outline" disabled={!transcript || isProcessingFile}>
          Clear
        </Button>
        <Button onClick={handleCopy} disabled={!transcript || isProcessingFile}>
          <Copy className="h-4 w-4 mr-2" /> Copy Text
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpeechToText;
