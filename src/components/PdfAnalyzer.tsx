import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Upload, Mic, MicOff, MessageSquare, FileSearch, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPdf } from "@/utils/pdfUtils";
import { aiService } from "@/utils/aiService";
import { SpeechRecognitionService } from "@/utils/speechUtils";
import ApiKeyModal from "./ApiKeyModal";

const PdfAnalyzer: React.FC = () => {
  const [pdfText, setPdfText] = useState("");
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isAnsweringQuestion, setIsAnsweringQuestion] = useState(false);
  const [isListeningQuestion, setIsListeningQuestion] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [recognitionService] = useState(() => new SpeechRecognitionService());
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);

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
      setPdfText(extractedText);
      setSummary("");
      setAnswer("");
      
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
      e.target.value = '';
    }
  };

  const handleSummarize = async () => {
    if (!pdfText) {
      toast({
        title: "No PDF Content",
        description: "Please upload a PDF file first",
        variant: "destructive"
      });
      return;
    }

    if (!aiService.hasApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    setIsGeneratingSummary(true);
    
    try {
      const generatedSummary = await aiService.summarizePDF(pdfText);
      setSummary(generatedSummary);
      
      toast({
        title: "Summary Generated",
        description: "PDF summary has been created successfully"
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Summary Failed",
        description: error instanceof Error ? error.message : "Failed to generate summary",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!pdfText) {
      toast({
        title: "No PDF Content",
        description: "Please upload a PDF file first",
        variant: "destructive"
      });
      return;
    }

    if (!question.trim()) {
      toast({
        title: "No Question",
        description: "Please enter a question",
        variant: "destructive"
      });
      return;
    }

    if (!aiService.hasApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    setIsAnsweringQuestion(true);
    
    try {
      const generatedAnswer = await aiService.answerQuestion(pdfText, question);
      setAnswer(generatedAnswer);
      
      toast({
        title: "Question Answered",
        description: "Answer has been generated successfully"
      });
    } catch (error) {
      console.error("Error answering question:", error);
      toast({
        title: "Answer Failed",
        description: error instanceof Error ? error.message : "Failed to answer question",
        variant: "destructive"
      });
    } finally {
      setIsAnsweringQuestion(false);
    }
  };

  const handleVoiceQuestion = () => {
    if (isListeningQuestion) {
      recognitionService.stop();
      setIsListeningQuestion(false);
      toast({
        title: "Voice Input Stopped",
        description: "Voice recognition has been stopped"
      });
    } else {
      const success = recognitionService.start(
        (text, isFinal) => {
          if (isFinal) {
            setQuestion(prev => prev + (prev ? ' ' : '') + text);
          }
        },
        (error) => {
          console.error("Speech recognition error:", error);
          toast({
            title: "Voice Input Error",
            description: error.message,
            variant: "destructive"
          });
          setIsListeningQuestion(false);
        }
      );

      if (success) {
        setIsListeningQuestion(true);
        toast({
          title: "Listening for Question",
          description: "Speak your question now"
        });
      }
    }
  };

  const handleApiKeySubmit = (apiKey: string) => {
    aiService.setApiKey(apiKey);
    toast({
      title: "API Key Set",
      description: "You can now use AI features"
    });
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            PDF Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PDF Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => document.getElementById('pdf-upload-analyzer')?.click()}
                disabled={isProcessingFile}
              >
                <Upload className="h-4 w-4" />
                {selectedFile ? `${selectedFile.name}` : "Upload PDF"}
              </Button>
              <input 
                id="pdf-upload-analyzer"
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessingFile}
              />
              {isProcessingFile && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing PDF...</span>
                </div>
              )}
            </div>

            {pdfText && (
              <Textarea
                placeholder="PDF content will appear here..."
                className="min-h-[150px] resize-none"
                value={pdfText}
                readOnly
              />
            )}
          </div>

          {/* Summary Section */}
          {pdfText && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleSummarize}
                  disabled={isGeneratingSummary || !pdfText}
                  className="flex items-center gap-2"
                >
                  {isGeneratingSummary ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {isGeneratingSummary ? "Generating..." : "Generate Summary"}
                </Button>
              </div>

              {summary && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Summary:</h3>
                  <Textarea
                    value={summary}
                    readOnly
                    className="min-h-[120px] bg-muted/50"
                  />
                </div>
              )}
            </div>
          )}

          {/* Q&A Section */}
          {pdfText && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ask a question about the PDF..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAskQuestion()}
                  className="flex-1"
                />
                <Button
                  onClick={handleVoiceQuestion}
                  size="sm"
                  variant={isListeningQuestion ? "default" : "outline"}
                  className={isListeningQuestion ? 'bg-accent hover:bg-accent/90' : ''}
                >
                  {isListeningQuestion ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleAskQuestion}
                  disabled={isAnsweringQuestion || !question.trim()}
                  className="flex items-center gap-2"
                >
                  {isAnsweringQuestion ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  {isAnsweringQuestion ? "Thinking..." : "Ask"}
                </Button>
              </div>

              {answer && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Answer:</h3>
                  <Textarea
                    value={answer}
                    readOnly
                    className="min-h-[100px] bg-muted/50"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!aiService.hasApiKey() && (
            <p className="text-sm text-muted-foreground">
              OpenAI API key required for AI features. Click any AI button to set it up.
            </p>
          )}
        </CardFooter>
      </Card>

      <ApiKeyModal
        open={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onApiKeySubmit={handleApiKeySubmit}
      />
    </>
  );
};

export default PdfAnalyzer;