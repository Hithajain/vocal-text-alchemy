
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Header from "@/components/Header";
import TextToSpeech from "@/components/TextToSpeech";
import SpeechToText from "@/components/SpeechToText";
import PdfAnalyzer from "@/components/PdfAnalyzer";

const Index = () => {
  const [activeTab, setActiveTab] = useState("text-to-speech");

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow flex items-start justify-center w-full py-8">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="text-to-speech">Text to Speech</TabsTrigger>
            <TabsTrigger value="speech-to-text">Speech to Text</TabsTrigger>
            <TabsTrigger value="pdf-analyzer">PDF Analyzer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text-to-speech" className="w-full mt-0">
            <TextToSpeech />
          </TabsContent>
          
          <TabsContent value="speech-to-text" className="w-full mt-0">
            <SpeechToText />
          </TabsContent>
          
          <TabsContent value="pdf-analyzer" className="w-full mt-0">
            <PdfAnalyzer />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="text-center text-sm text-muted-foreground py-4">
        <p>Vocal Text Alchemy - Transform your text and speech</p>
      </footer>
    </div>
  );
};

export default Index;
