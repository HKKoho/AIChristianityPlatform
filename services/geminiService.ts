
import { GoogleGenAI } from '@google/genai';
import type { Word } from '../types';
import { Language } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getPronunciationFeedback = async (
  word: Word,
  language: Language,
  audioBase64: string,
  mimeType: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `You are a friendly and encouraging biblical language pronunciation coach. The user is trying to pronounce the ${language} word "${word.word}". Please listen to the audio and provide brief, clear, and positive feedback on their pronunciation in 1-2 sentences. If they are correct, praise them. If they are slightly off, gently guide them on the correct sound. For reference, the word is transliterated as "${word.transliteration}" and means "${word.meaning}".`;

    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [textPart, audioPart] },
    });

    return response.text;
  } catch (error) {
    console.error('Error getting feedback from Gemini:', error);
    return 'Sorry, I encountered an error trying to analyze your pronunciation. Please try again.';
  }
};

// Theological Journey functions
export const refineTheologicalText = async (text: string, context: string): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const prompt = `請協助改進以下神學文本（主題：${context}）。保持原意，但提升語言流暢度、邏輯連貫性，並加強神學深度。\n\n原文：\n${text}`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] }
  });

  return response.text;
};

export const generateCitations = async (text: string): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const prompt = `請為以下神學文本提供相關的聖經經文引用和神學文獻參考（使用繁體中文）：\n\n${text}`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] }
  });

  return response.text;
};

export const generateSocraticResponse = async (history: any[], perspective: string, userMessage: string): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const prompt = `你是一位${perspective}風格的神學對話者。請回應使用者的問題，引導他們深入思考。\n\n使用者問題：${userMessage}`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] }
  });

  return response.text;
};

export const generateMindMapFromText = async (text: string): Promise<any> => {
  const model = 'gemini-2.5-flash';
  const prompt = `請分析以下神學文本，提取關鍵概念並生成心智圖結構（JSON格式，包含nodes和links）：\n\n${text}`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] }
  });

  try {
    return JSON.parse(response.text);
  } catch {
    return { nodes: [], links: [] };
  }
};
