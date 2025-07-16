export class AIService {
  async summarizePDF(text: string): Promise<string> {
    // Simple client-side summarization using text processing
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    
    // Get first few sentences and key information
    const summary = sentences.slice(0, 5).join('. ') + '.';
    
    return `Document Summary:\n\nThis document contains approximately ${words.length} words across ${sentences.length} sentences.\n\n${summary}\n\nNote: This is a basic text-based summary. For AI-powered analysis, please use a service that supports API integration.`;
  }

  async answerQuestion(text: string, question: string): Promise<string> {
    // Simple keyword-based search in the document
    const lowerText = text.toLowerCase();
    const lowerQuestion = question.toLowerCase();
    
    // Extract key words from the question
    const questionWords = lowerQuestion.split(/\s+/).filter(word => 
      word.length > 3 && !['what', 'where', 'when', 'why', 'how', 'does', 'have', 'will', 'can', 'the'].includes(word)
    );
    
    // Find sentences containing question keywords
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const relevantSentences = sentences.filter(sentence => 
      questionWords.some(word => sentence.toLowerCase().includes(word))
    );
    
    if (relevantSentences.length > 0) {
      return `Based on the document content, here are the relevant sections:\n\n${relevantSentences.slice(0, 3).join('. ')}.`;
    } else {
      return `I couldn't find specific information related to "${question}" in the document. Please try rephrasing your question or check if the information exists in the document.`;
    }
  }

  hasApiKey(): boolean {
    return true; // Always return true since we don't need API keys
  }

  setApiKey(apiKey: string) {
    // No-op since we don't use API keys
  }
}

export const aiService = new AIService();