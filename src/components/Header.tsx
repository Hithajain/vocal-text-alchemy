
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Speech, Text, FileSearch } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="w-full flex flex-col items-center justify-center py-8 gap-4">
      <div className="flex items-center gap-2">
        <Speech className="h-8 w-8 text-accent" />
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Vocal Text Alchemy
        </h1>
        <Text className="h-8 w-8 text-primary" />
      </div>
      
      <p className="text-center text-muted-foreground max-w-md">
        Transform your voice into text and your text into speech with our powerful conversion tools
      </p>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full max-w-md mt-4"
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="text-to-speech" className="flex items-center gap-2">
            <Text className="h-4 w-4" />
            <span>Text to Speech</span>
          </TabsTrigger>
          <TabsTrigger value="speech-to-text" className="flex items-center gap-2">
            <Speech className="h-4 w-4" />
            <span>Speech to Text</span>
          </TabsTrigger>
          <TabsTrigger value="pdf-analyzer" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            <span>PDF Analyzer</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  );
};

export default Header;
