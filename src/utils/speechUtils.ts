
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
