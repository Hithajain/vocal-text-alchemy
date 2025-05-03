
import React, { useState, useEffect } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { getApiKey } from "@/utils/speechUtils";

import Header from "@/components/Header";
import TextToSpeech from "@/components/TextToSpeech";
import SpeechToText from "@/components/SpeechToText";
import ApiKeyModal from "@/components/ApiKeyModal";

const Index = () => {
  const [activeTab, setActiveTab] = useState("text-to-speech");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Check for API key on initial load
  useEffect(() => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleApiKeyRequest = () => {
    setIsApiKeyModalOpen(true);
  };

  const handleCloseApiKeyModal = () => {
    setIsApiKeyModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow flex items-start justify-center w-full py-8">
        <TabsContent value="text-to-speech" className="w-full mt-0" hidden={activeTab !== "text-to-speech"}>
          <TextToSpeech onApiKeyRequest={handleApiKeyRequest} />
        </TabsContent>
        
        <TabsContent value="speech-to-text" className="w-full mt-0" hidden={activeTab !== "speech-to-text"}>
          <SpeechToText />
        </TabsContent>
      </main>
      
      <footer className="text-center text-sm text-muted-foreground py-4">
        <p>Vocal Text Alchemy - Transform your text and speech</p>
      </footer>
      
      <ApiKeyModal 
        open={isApiKeyModalOpen} 
        onClose={handleCloseApiKeyModal} 
      />
    </div>
  );
};

export default Index;
