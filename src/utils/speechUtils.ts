
// Default voices to use with ElevenLabs
export const defaultVoices = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Warm and natural feminine voice" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", description: "Deep and confident masculine voice" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Professional and clear feminine voice" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Friendly and conversational male voice" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", description: "Warm British female voice" }
];

// Save API key to localStorage
export const saveApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('elevenLabsApiKey', key);
  }
};

// Get API key from localStorage
export const getApiKey = (): string => {
  return localStorage.getItem('elevenLabsApiKey') || '';
};

// Generate speech using ElevenLabs API
export const generateSpeech = async (text: string, voiceId: string, apiKey: string): Promise<string> => {
  try {
    if (!apiKey) throw new Error("API key is required");
    if (!text.trim()) throw new Error("Text is required");

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail?.message || 'Failed to generate speech');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

// Define the types for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Using browser's Web Speech API for speech recognition
export class SpeechRecognitionService {
  recognition: any = null;
  isListening: boolean = false;
  
  constructor() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
  }

  start(onResult: (text: string, isFinal: boolean) => void, onError: (error: Error) => void) {
    if (!this.recognition) {
      onError(new Error("Speech recognition not supported in this browser"));
      return false;
    }
    
    try {
      this.recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        onResult(transcript, isFinal);
      };
      
      this.recognition.onerror = (event: any) => {
        onError(new Error(`Speech recognition error: ${event.error}`));
      };
      
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      onError(error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }
  
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      return true;
    }
    return false;
  }
}
