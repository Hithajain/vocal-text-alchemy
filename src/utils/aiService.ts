const AI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class AIService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = localStorage.getItem('openai_api_key');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async summarizePDF(text: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise and informative summaries of documents. Provide a clear, well-structured summary that captures the main points and key information.'
          },
          {
            role: 'user',
            content: `Please provide a comprehensive summary of the following document:\n\n${text}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No summary generated';
  }

  async answerQuestion(text: string, question: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions based on the provided document. Only answer questions that can be answered from the document content. If the information is not in the document, say so clearly.'
          },
          {
            role: 'user',
            content: `Based on the following document, please answer the question.\n\nDocument:\n${text}\n\nQuestion: ${question}`
          }
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No answer generated';
  }
}

export const aiService = new AIService();