/**
 * Multi-Provider Chat Service with Automatic Fallback
 *
 * Provider Priority Chain:
 * 1. Ollama kimi-k2:1t-cloud (Primary)
 * 2. Ollama qwen-coder:480b-cloud (Secondary)
 * 3. Google Gemini 2.0 Flash (Tertiary)
 * 4. OpenAI GPT-4o (Quaternary)
 *
 * Features:
 * - Automatic provider failover via HTTP API endpoints
 * - Feature-optimized routing (e.g., Gemini for web search)
 * - Conversation continuity across provider switches
 * - Detailed logging for debugging
 *
 * NOTE: This service makes HTTP requests to /api/unified/chat endpoint
 * It does NOT directly import provider SDKs (which would break client-side builds)
 */

import { AIProvider } from '../types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

export interface ChatResponse {
  text: string;
  sources?: SearchResult[];
  provider?: AIProvider;
  model?: string;
}

/**
 * Chat class with automatic multi-provider fallback
 */
export class Chat {
  private messages: ChatMessage[] = [];
  private systemInstruction?: string;
  private temperature: number;
  private topP: number;
  private lastSuccessfulProvider?: AIProvider;

  constructor(
    systemInstruction?: string,
    options?: {
      temperature?: number;
      topP?: number;
    }
  ) {
    this.systemInstruction = systemInstruction;
    this.temperature = options?.temperature ?? 0.7;
    this.topP = options?.topP ?? 0.9;

    console.log('🤖 Multi-Provider Chat initialized');
    console.log(`📊 Temperature: ${this.temperature}, Top-P: ${this.topP}`);
  }

  /**
   * Send a message with automatic provider fallback
   */
  async sendMessage(userMessage: string): Promise<string> {
    console.log(`💬 Sending message (${this.messages.length} messages in history)`);

    this.messages.push({
      role: 'user',
      content: userMessage,
    });

    try {
      const requestMessages: ChatMessage[] = [];

      if (this.systemInstruction) {
        requestMessages.push({
          role: 'system',
          content: this.systemInstruction,
        });
      }

      requestMessages.push(...this.messages);

      // Make HTTP request to unified API endpoint
      const response = await fetch('/api/unified/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: requestMessages,
          temperature: this.temperature,
          topP: this.topP,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.lastSuccessfulProvider = data.provider as AIProvider;

      this.messages.push({
        role: 'assistant',
        content: data.content,
      });

      console.log(`✅ Response received from ${data.provider} (${data.model})`);

      return data.content;
    } catch (error) {
      console.error('❌ All providers failed:', error);
      // Remove the user message since it failed
      this.messages.pop();
      throw error;
    }
  }

  /**
   * Analyze an image with automatic provider fallback
   * Priority: Gemini (best vision) → GPT-4o → Ollama (llava)
   */
  async analyzeImage(
    imageBase64: string,
    prompt: string
  ): Promise<string> {
    console.log('🖼️ Analyzing image with multi-provider fallback');

    try {
      // Make HTTP request to unified API endpoint
      const response = await fetch('/api/unified/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
              imageUrl: imageBase64,
            },
          ],
          temperature: this.temperature,
          topP: this.topP,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Image analyzed by ${data.provider} (${data.model})`);

      return data.content;
    } catch (error) {
      console.error('❌ Image analysis failed on all providers:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.messages = [];
    console.log('🗑️ Conversation history cleared');
  }

  /**
   * Get the last successful provider
   */
  getLastProvider(): AIProvider | undefined {
    return this.lastSuccessfulProvider;
  }
}

/**
 * Perform a web search with automatic fallback
 * Prioritizes Gemini (has built-in web search with sources)
 */
export async function performSearch(
  query: string,
  options?: {
    temperature?: number;
    topP?: number;
    maxLength?: number;
  }
): Promise<ChatResponse> {
  const maxLength = options?.maxLength || 500;

  console.log('🔍 Performing search with multi-provider fallback');
  console.log(`📏 Max length: ${maxLength} words`);

  // Try Gemini first (has web search capability)
  try {
    console.log('🔄 Trying Gemini with web search (优先选择)');
    const response = await performSearchWithGemini(query, maxLength, options);
    console.log('✅ Success with Gemini web search');
    return response;
  } catch (error) {
    console.log('⚠️ Gemini search failed, falling back to Ollama');
  }

  // Fallback to Ollama (knowledge-based, no web search)
  try {
    console.log('🔄 Trying Ollama (knowledge-based)');
    const response = await performSearchWithOllama(query, maxLength, options);
    console.log('✅ Success with Ollama');
    return response;
  } catch (error) {
    console.log('⚠️ Ollama failed, trying GPT-4o');
  }

  // Final fallback to GPT-4o
  try {
    console.log('🔄 Trying GPT-4o');
    const response = await performSearchWithOpenAI(query, maxLength, options);
    console.log('✅ Success with GPT-4o');
    return response;
  } catch (error) {
    throw new Error('Search failed on all providers');
  }
}

/**
 * Search with Gemini (has web search)
 * NOTE: This function is currently disabled client-side
 * The client should call /api/unified/chat directly instead
 */
async function performSearchWithGemini(
  query: string,
  maxLength: number,
  options?: { temperature?: number; topP?: number }
): Promise<ChatResponse> {
  // Use unified API endpoint instead of direct SDK import
  const enhancedQuery = `請回答以下問題（限制在 ${maxLength} 字以內）：

${query}

請提供準確、簡潔的回答，並在適當時引用來源。`;

  const response = await fetch('/api/unified/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: enhancedQuery }],
      temperature: options?.temperature ?? 0.7,
      topP: options?.topP ?? 0.9,
      enableWebSearch: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    text: data.content,
    sources: data.groundingSources,
    provider: AIProvider.GEMINI,
    model: data.model,
  };
}

/**
 * Search with Ollama (knowledge-based, no web search)
 */
async function performSearchWithOllama(
  query: string,
  maxLength: number,
  options?: { temperature?: number; topP?: number }
): Promise<ChatResponse> {
  const enhancedQuery = `請回答以下問題（限制在 ${maxLength} 字以內）：

${query}

注意：請基於你的知識提供準確的回答。如果不確定，請明確說明。`;

  const response = await fetch('/api/unified/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: enhancedQuery }],
      temperature: options?.temperature ?? 0.7,
      topP: options?.topP ?? 0.9,
      model: 'kimi-k2:1t-cloud',
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    text: data.content,
    provider: data.provider as AIProvider,
    model: data.model,
  };
}

/**
 * Search with OpenAI GPT-4o
 */
async function performSearchWithOpenAI(
  query: string,
  maxLength: number,
  options?: { temperature?: number; topP?: number }
): Promise<ChatResponse> {
  const enhancedQuery = `請回答以下問題（限制在 ${maxLength} 字以內）：

${query}

請提供準確、簡潔的回答。`;

  const response = await fetch('/api/unified/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: enhancedQuery }],
      temperature: options?.temperature ?? 0.7,
      topP: options?.topP ?? 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    text: data.content,
    provider: data.provider as AIProvider,
    model: data.model,
  };
}

/**
 * Analyze text with automatic fallback
 */
export async function analyzeText(
  prompt: string,
  options?: {
    temperature?: number;
    topP?: number;
    systemInstruction?: string;
  }
): Promise<ChatResponse> {
  console.log('📝 Analyzing text with multi-provider fallback');

  try {
    const messages: ChatMessage[] = [];

    if (options?.systemInstruction) {
      messages.push({
        role: 'system',
        content: options.systemInstruction,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const response = await fetch('/api/unified/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        temperature: options?.temperature ?? 0.7,
        topP: options?.topP ?? 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    console.log(`✅ Text analyzed by ${data.provider} (${data.model})`);

    return {
      text: data.content,
      provider: data.provider as AIProvider,
      model: data.model,
    };
  } catch (error) {
    console.error('❌ Text analysis failed on all providers:', error);
    throw error;
  }
}

/**
 * Analyze an image (standalone function)
 */
export async function analyzeImage(
  imageBase64: string,
  prompt: string,
  options?: {
    temperature?: number;
    topP?: number;
  }
): Promise<ChatResponse> {
  console.log('🖼️ Analyzing image (standalone)');

  try {
    const response = await fetch('/api/unified/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
            imageUrl: imageBase64,
          },
        ],
        temperature: options?.temperature ?? 0.7,
        topP: options?.topP ?? 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      text: data.content,
      provider: data.provider as AIProvider,
      model: data.model,
    };
  } catch (error) {
    console.error('❌ Image analysis failed:', error);
    throw error;
  }
}

/**
 * Check which providers are currently available
 */
export async function checkAvailableProviders(): Promise<{
  ollama: boolean;
  gemini: boolean;
  openai: boolean;
}> {
  // Simple check - returns whether API keys are configured
  return {
    ollama: Boolean(process.env.OLLAMA_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
  };
}

/**
 * Get provider status with detailed information
 */
export async function getProviderStatus(): Promise<{
  primary: { name: string; available: boolean; model: string };
  secondary: { name: string; available: boolean; model: string };
  tertiary: { name: string; available: boolean; model: string };
  quaternary: { name: string; available: boolean; model: string };
}> {
  const available = await checkAvailableProviders();

  return {
    primary: {
      name: 'Ollama (Kimi K2)',
      available: available.ollama,
      model: 'kimi-k2:1t-cloud',
    },
    secondary: {
      name: 'Ollama (Qwen Coder)',
      available: available.ollama,
      model: 'qwen-coder:480b-cloud',
    },
    tertiary: {
      name: 'Google Gemini',
      available: available.gemini,
      model: 'gemini-2.0-flash-exp',
    },
    quaternary: {
      name: 'OpenAI GPT-4o',
      available: available.openai,
      model: 'gpt-4o',
    },
  };
}

// Export default for backward compatibility
export default {
  Chat,
  performSearch,
  analyzeText,
  analyzeImage,
  checkAvailableProviders,
  getProviderStatus,
};
