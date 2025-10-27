import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { DialoguePersona, DialogueTurn, DialogueSettings, UserInputAnalysis, TheologianResponse, DialogueSource, VoiceName } from '../types';
import { ANALYZER_SYSTEM_PROMPT, THEOLOGIAN_PERSONAS } from "../src/components/dialogue/constants";

const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

// Helper function to determine provider from model name
function getProviderFromModel(model: string): 'gemini' | 'ollama' | 'openai' {
  if (model.startsWith('gpt-')) return 'openai';
  if (model.includes(':') || model.includes('cloud')) return 'ollama';
  return 'gemini';
}

// Initialize Gemini AI (for Gemini models and TTS)
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const sourceSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ["title", "description"],
};

export interface DebateResponse {
  responseText: string;
  sources: DialogueSource[];
}

// Generate debate response using Ollama/OpenAI via unified API
async function generateWithUnifiedAPI(
  persona: DialoguePersona,
  settings: DialogueSettings,
  history: DialogueTurn[],
  prompt: string
): Promise<DebateResponse> {
  const messages = [
    { role: 'system' as const, content: persona.systemPrompt },
    ...history.map(turn => ({
      role: (turn.speaker === 'Human' ? 'user' : 'assistant') as const,
      content: turn.text
    })),
    { role: 'user' as const, content: prompt }
  ];

  const response = await fetch('/api/unified/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model: settings.model,
      temperature: 0.7,
      topP: 0.9,
      requireJson: true
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  const responseText = data.content || data.text || data.response || '';

  // Try to parse JSON response
  try {
    const parsed = JSON.parse(responseText);
    if (parsed.responseText && parsed.sources) {
      return parsed as DebateResponse;
    }
  } catch (e) {
    // If not JSON, treat as plain text response
  }

  // Fallback: create structured response
  return {
    responseText: responseText,
    sources: [
      { title: "AI 生成回應", description: `使用 ${data.model || settings.model} (${data.provider || 'AI'}) 生成的回應` }
    ]
  };
}

export const generateDebateResponse = async (
  persona: DialoguePersona,
  settings: DialogueSettings,
  history: DialogueTurn[]
): Promise<DebateResponse> => {
  try {
    // Constructing a string representation of the history for the prompt
    const historyText = history.map(turn => `${turn.personaName}: ${turn.text}`).join('\n\n');

    let prompt: string;
    if (history.length === 0) {
        prompt = `辯論主題是：「${settings.topic}」。請提供你的開場陳述和支持來源。將回應格式化為 JSON，包含 'responseText' 和 'sources' 欄位。`;
    } else {
        prompt = `輪到你了，${persona.name}。辯論主題是「${settings.topic}」。
到目前為止的辯論內容如下：
---
${historyText}
---
請對最後一個陳述提供你的回應，以及你的支持來源。將回應格式化為 JSON，包含 'responseText' 和 'sources' 欄位，其中 sources 是包含 'title' 和 'description' 的物件陣列。`;
    }

    const provider = getProviderFromModel(settings.model);

    // Use Gemini native SDK for Gemini models
    if (provider === 'gemini' && ai) {
      const response = await ai.models.generateContent({
        model: settings.model,
        contents: prompt,
        config: {
          systemInstruction: persona.systemPrompt,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              responseText: { type: Type.STRING, description: "The AI theologian's response to the previous turn." },
              sources: {
                  type: Type.ARRAY,
                  description: "An array of at least two sources to support the response.",
                  items: sourceSchema,
              }
            },
            required: ["responseText", "sources"],
          },
        }
      });

      const jsonText = response.text.trim();
      const parsedResponse = JSON.parse(jsonText);

      if (!parsedResponse.sources || parsedResponse.sources.length === 0) {
        throw new Error("Model did not return the required sources.");
      }

      return parsedResponse as DebateResponse;
    }

    // Use unified API for Ollama and OpenAI models
    return await generateWithUnifiedAPI(persona, settings, history, prompt);

  } catch (error) {
    console.error("Error generating debate response:", error);
    const errorMessage = error instanceof Error ? error.message : "發生未知錯誤。";
    return {
      responseText: `我遇到了一個錯誤：${errorMessage}。請嘗試不同的模型或檢查你的 API 設定。`,
      sources: [{ title: "錯誤資訊", description: "無法從 API 取得有效回應。"}]
    };
  }
};

export const generateSpeech = async (text: string, voiceName: VoiceName): Promise<string | null> => {
    if (!ai) {
        console.warn("Gemini API not available for TTS");
        return null;
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech from Gemini API:", error);
        return null;
    }
};


export const generateAnalysisAndResponses = async (userInput: string, settings: DialogueSettings): Promise<{ analysis: UserInputAnalysis, responses: TheologianResponse[] }> => {
    const provider = getProviderFromModel(settings.model);

    // Use Gemini native SDK for Gemini models
    if (provider === 'gemini' && ai) {
        const analysisPromise = ai.models.generateContent({
            model: settings.model,
            contents: userInput,
            config: {
                systemInstruction: ANALYZER_SYSTEM_PROMPT,
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        viewpoint: { type: Type.STRING, description: "The identified theological viewpoint." },
                        sources: { type: Type.ARRAY, description: "An array of at least two sources.", items: sourceSchema },
                    },
                    required: ["viewpoint", "sources"],
                }
            }
        });

        const theologianPromises = THEOLOGIAN_PERSONAS.slice(0, 4).map(persona => ai.models.generateContent({
            model: settings.model,
            contents: `請回應以下使用者陳述：「${userInput}」`,
            config: {
                systemInstruction: persona.systemPrompt,
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        responseText: { type: Type.STRING, description: "The theologian's response." },
                        sources: { type: Type.ARRAY, description: "An array of at least two sources.", items: sourceSchema },
                    },
                    required: ["responseText", "sources"],
                }
            }
        }));

        const [analysisResult, ...theologianResults] = await Promise.allSettled([analysisPromise, ...theologianPromises]);

        let analysis: UserInputAnalysis = { viewpoint: '分析輸入時發生錯誤。', sources: []};
        if (analysisResult.status === 'fulfilled') {
            analysis = JSON.parse(analysisResult.value.text.trim());
        }

        const responses: TheologianResponse[] = theologianResults.map((result, index) => {
            const persona = THEOLOGIAN_PERSONAS[index];
            if (result.status === 'fulfilled') {
                const parsed = JSON.parse(result.value.text.trim());
                return { ...parsed, personaName: persona.name, denomination: persona.denomination, color: persona.color };
            } else {
                return {
                    responseText: '無法為此神學家生成回應。',
                    sources: [],
                    personaName: persona.name,
                    denomination: persona.denomination,
                    color: persona.color
                };
            }
        });

        return { analysis, responses };
    }

    // For non-Gemini models, use unified API (Ollama/OpenAI)
    const analysisPrompt = `${ANALYZER_SYSTEM_PROMPT}\n\n使用者陳述：${userInput}\n\n請以 JSON 格式提供你的分析，包含 'viewpoint' 和 'sources' 欄位。`;
    const analysisResponse = await fetch('/api/unified/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [{ role: 'user', content: analysisPrompt }],
            model: settings.model,
            temperature: 0.2,
            topP: 0.9,
            requireJson: true
        })
    });

    let analysis: UserInputAnalysis = { viewpoint: '分析不可用。', sources: [] };
    if (analysisResponse.ok) {
        try {
            const data = await analysisResponse.json();
            const responseText = data.content || data.text || data.response || '{}';
            const parsed = JSON.parse(responseText);
            if (parsed.viewpoint) {
                analysis = parsed;
            }
        } catch (e) {
            console.error('Failed to parse analysis:', e);
        }
    }

    // Generate responses from each theologian
    const responsePromises = THEOLOGIAN_PERSONAS.slice(0, 4).map(async (persona) => {
        try {
            const response = await fetch('/api/unified/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: persona.systemPrompt },
                        { role: 'user', content: `請回應以下使用者陳述：「${userInput}」。以 JSON 格式回應，包含 'responseText' 和 'sources' 欄位。` }
                    ],
                    model: settings.model,
                    temperature: 0.7,
                    topP: 0.9,
                    requireJson: true
                })
            });

            const data = await response.json();
            const responseText = data.content || data.text || data.response || '{}';
            const parsed = JSON.parse(responseText);

            return {
                responseText: parsed.responseText || responseText || '未生成回應。',
                sources: parsed.sources || [],
                personaName: persona.name,
                denomination: persona.denomination,
                color: persona.color
            };
        } catch (error) {
            return {
                responseText: '無法生成回應。',
                sources: [],
                personaName: persona.name,
                denomination: persona.denomination,
                color: persona.color
            };
        }
    });

    const responses = await Promise.all(responsePromises);
    return { analysis, responses };
};
