import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import type { Persona, DialogueTurn, LLMSettings, UserInputAnalysis, TheologianResponse, Source, VoiceName } from '../types';
import { ANALYZER_SYSTEM_PROMPT, THEOLOGIAN_PERSONAS } from "../constants";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  sources: Source[];
}

export const generateDebateResponse = async (
  persona: Persona,
  settings: LLMSettings,
  history: DialogueTurn[]
): Promise<DebateResponse> => {
  try {
    // Constructing a string representation of the history for the prompt
    const historyText = history.map(turn => `${turn.personaName}: ${turn.text}`).join('\n\n');

    let prompt: string;
    if (history.length === 0) {
        prompt = `The debate topic is: "${settings.topic}". Please provide your opening statement and supporting sources.`;
    } else {
        prompt = `It's your turn, ${persona.name}. The debate topic is "${settings.topic}".
Here is the debate so far:
---
${historyText}
---
Please provide your response to the last statement, along with your supporting sources.`;
    }

    const response = await ai.models.generateContent({
      model: settings.model,
      // FIX: Simplified `contents` to be a string for a text-based prompt, as per @google/genai guidelines.
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

  } catch (error) {
    console.error("Error generating debate response from Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      responseText: `I encountered an error: ${errorMessage}`,
      sources: [{ title: "Error Information", description: "Could not fetch a valid response from the API."}]
    };
  }
};

export const generateSpeech = async (text: string, voiceName: VoiceName): Promise<string | null> => {
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


export const generateAnalysisAndResponses = async (userInput: string, settings: LLMSettings): Promise<{ analysis: UserInputAnalysis, responses: TheologianResponse[] }> => {
    
    const analysisPromise = ai.models.generateContent({
        model: settings.model,
        // FIX: Simplified `contents` to be a string for a text-based prompt, as per @google/genai guidelines.
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

    const theologianPromises = THEOLOGIAN_PERSONAS.slice(0, 4).map(persona => ai.models.generateContent({ // Limit to first 4 for analysis mode
        model: settings.model,
        // FIX: Simplified `contents` to be a string for a text-based prompt, as per @google/genai guidelines.
        contents: `Please respond to the following user statement: "${userInput}"`,
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
    
    let analysis: UserInputAnalysis = { viewpoint: 'Error analyzing input.', sources: []};
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
                responseText: 'Failed to generate a response for this theologian.', 
                sources: [], 
                personaName: persona.name, 
                denomination: persona.denomination, 
                color: persona.color 
            };
        }
    });

    return { analysis, responses };
};