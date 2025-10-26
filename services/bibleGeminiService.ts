/**
 * Bible API Service using Gemini AI for real-time Bible verse analysis
 * Provides Hebrew/Greek original text with English and Chinese translations
 *
 * UPDATED: Now uses multi-provider failover system
 * If Gemini fails (location restriction), automatically falls back to Ollama
 */

import { GoogleGenerativeAI } from '@google/genai';
import { Language } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Helper function to call multi-provider API with automatic failover
 */
async function callMultiProviderAPI(prompt: string): Promise<any> {
  const response = await fetch('/api/unified/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Lower temp for factual Bible content
      topP: 0.9,
      maxTokens: 4096
    })
  });

  if (!response.ok) {
    throw new Error(`Multi-provider API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`📖 Bible data from ${data.provider} (${data.model})`);

  // Try to parse JSON from response
  const jsonMatch = data.content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Could not parse JSON from response');
}

export interface BibleVerseResult {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  translations: {
    english: string;
    traditionalChinese: string;
    original: string; // Hebrew or Greek
  };
  highlightedWords: {
    original: string;
    transliteration: string;
    meaning: string;
    strongsNumber?: string;
    position: number;
  }[];
  language: Language;
}

/**
 * Search and fetch Bible verse with all translations using Gemini AI
 * With automatic failover to Ollama if Gemini is unavailable
 */
export async function fetchBibleVerse(
  reference: string,
  language: Language
): Promise<BibleVerseResult | null> {
  const testament = language === Language.HEBREW ? 'Old Testament' : 'New Testament';
  const originalLanguage = language === Language.HEBREW ? 'Hebrew' : 'Greek';

  const prompt = `You are a biblical scholar. Provide the following information for ${reference} from the ${testament}:

1. The exact ${originalLanguage} original text
2. English translation (ESV or NIV style)
3. Traditional Chinese translation (和合本 style)
4. Identify 3-5 key theological or significant words in the original ${originalLanguage}
5. For each key word provide:
   - Original ${originalLanguage} text
   - Transliteration
   - English meaning
   - Position in the verse (0-based index)

Return as JSON with this exact structure:
{
  "reference": "${reference}",
  "book": "book name",
  "chapter": number,
  "verse": number,
  "translations": {
    "english": "English text",
    "traditionalChinese": "繁體中文",
    "original": "${originalLanguage} text"
  },
  "highlightedWords": [
    {
      "original": "${originalLanguage} word",
      "transliteration": "romanization",
      "meaning": "English meaning",
      "position": 0
    }
  ]
}

Be accurate with the ${originalLanguage} text and ensure the Traditional Chinese uses proper theological terminology.`;

  // Try Gemini first (best for structured JSON)
  try {
    console.log('🔄 Trying Gemini for Bible verse...');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const verseData = JSON.parse(text);

    console.log('✅ Gemini succeeded');
    return {
      ...verseData,
      language
    };
  } catch (error: any) {
    // If Gemini fails (location restriction), use multi-provider fallback
    console.log('⚠️ Gemini failed, trying multi-provider fallback...');
    try {
      const verseData = await callMultiProviderAPI(prompt);
      console.log('✅ Multi-provider fallback succeeded');
      return {
        ...verseData,
        language
      };
    } catch (fallbackError) {
      console.error('❌ All providers failed for Bible verse:', fallbackError);
      return null;
    }
  }
}

/**
 * Search Bible verses by keyword using Gemini AI with multi-provider fallback
 */
export async function searchBibleByKeyword(
  keyword: string,
  language: Language,
  limit: number = 10
): Promise<BibleVerseResult[]> {
  const testament = language === Language.HEBREW ? 'Old Testament' : 'New Testament';
  const originalLanguage = language === Language.HEBREW ? 'Hebrew' : 'Greek';

  const prompt = `Find ${limit} significant verses from the ${testament} that relate to the keyword "${keyword}".

For each verse provide:
1. The reference (e.g., "Genesis 1:1")
2. ${originalLanguage} original text
3. English translation
4. Traditional Chinese translation (和合本)
5. 2-3 key words from the original ${originalLanguage} with transliterations and meanings

Return as JSON array with this structure:
[
  {
    "reference": "Book Chapter:Verse",
    "book": "book name",
    "chapter": number,
    "verse": number,
    "translations": {
      "english": "text",
      "traditionalChinese": "文本",
      "original": "${originalLanguage} text"
    },
    "highlightedWords": [
      {
        "original": "word",
        "transliteration": "romanization",
        "meaning": "meaning",
        "position": 0
      }
    ]
  }
]`;

  // Try Gemini first
  try {
    console.log('🔄 Trying Gemini for Bible search...');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const verses = JSON.parse(text);

    console.log('✅ Gemini succeeded');
    return verses.map((v: any) => ({
      ...v,
      language
    }));
  } catch (error) {
    // Fallback to multi-provider
    console.log('⚠️ Gemini failed, trying multi-provider fallback...');
    try {
      const verses = await callMultiProviderAPI(prompt);
      console.log('✅ Multi-provider fallback succeeded');
      return (Array.isArray(verses) ? verses : []).map((v: any) => ({
        ...v,
        language
      }));
    } catch (fallbackError) {
      console.error('❌ All providers failed for Bible search:', fallbackError);
      return [];
    }
  }
}

/**
 * Get detailed word analysis for Hebrew/Greek words with multi-provider fallback
 */
export async function analyzeWord(
  word: string,
  language: Language
): Promise<{
  original: string;
  transliteration: string;
  meaning: string;
  etymology: string;
  usageExamples: string[];
  relatedWords: string[];
} | null> {
  const languageName = language === Language.HEBREW ? 'Biblical Hebrew' : 'Koine Greek';

  const prompt = `Provide detailed linguistic analysis for the ${languageName} word "${word}":

Return as JSON:
{
  "original": "${word}",
  "transliteration": "romanization",
  "meaning": "primary meaning",
  "etymology": "word origin and root",
  "usageExamples": ["example verse reference 1", "example verse reference 2"],
  "relatedWords": ["related word 1", "related word 2"]
}`;

  // Try Gemini first
  try {
    console.log('🔄 Trying Gemini for word analysis...');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('✅ Gemini succeeded');
    return JSON.parse(text);
  } catch (error) {
    // Fallback to multi-provider
    console.log('⚠️ Gemini failed, trying multi-provider fallback...');
    try {
      const analysis = await callMultiProviderAPI(prompt);
      console.log('✅ Multi-provider fallback succeeded');
      return analysis;
    } catch (fallbackError) {
      console.error('❌ All providers failed for word analysis:', fallbackError);
      return null;
    }
  }
}

/**
 * Get passage with verse-by-verse breakdown with multi-provider fallback
 */
export async function getPassageAnalysis(
  startReference: string,
  endReference: string,
  language: Language
): Promise<BibleVerseResult[]> {
  const originalLanguage = language === Language.HEBREW ? 'Hebrew' : 'Greek';

  const prompt = `Provide verse-by-verse analysis from ${startReference} to ${endReference}.

For each verse include:
- ${originalLanguage} original text
- English translation
- Traditional Chinese translation
- Key theological words with transliterations

Return as JSON array of verses.`;

  // Try Gemini first
  try {
    console.log('🔄 Trying Gemini for passage analysis...');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const verses = JSON.parse(text);

    console.log('✅ Gemini succeeded');
    return verses.map((v: any) => ({
      ...v,
      language
    }));
  } catch (error) {
    // Fallback to multi-provider
    console.log('⚠️ Gemini failed, trying multi-provider fallback...');
    try {
      const verses = await callMultiProviderAPI(prompt);
      console.log('✅ Multi-provider fallback succeeded');
      return (Array.isArray(verses) ? verses : []).map((v: any) => ({
        ...v,
        language
      }));
    } catch (fallbackError) {
      console.error('❌ All providers failed for passage analysis:', fallbackError);
      return [];
    }
  }
}
