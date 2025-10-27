/**
 * Local Development API Server
 * Runs the /api/chat endpoint locally on port 3001
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
  console.log('✓ Loaded environment variables from .env.local');
} catch (error) {
  console.warn('⚠ Could not load .env.local file');
}

const PORT = 3001;

const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle multiple endpoints
  const isApiChat = req.url === '/api/chat';
  const isUnifiedChat = req.url === '/api/unified/chat';
  const isOllamaChat = req.url === '/api/ollama/chat';

  if (!isApiChat && !isUnifiedChat && !isOllamaChat) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Parse request body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const requestData = JSON.parse(body);

      // Handle unified endpoint with automatic fallback
      if (isUnifiedChat) {
        const result = await handleUnifiedChat(requestData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      // Handle Ollama-specific endpoint
      if (isOllamaChat) {
        const result = await handleOllamaChat(requestData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
      }

      // Original /api/chat endpoint logic
      const { provider, model, messages, temperature, topP, maxTokens } = requestData;

      let apiUrl;
      let headers;
      let requestBody;

      switch (provider) {
        case 'ollama':
          // Fixed: Use correct Ollama Cloud API URL
          apiUrl = `${process.env.OLLAMA_API_URL || 'https://api.ollama.cloud'}/api/chat`;
          headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`
          };
          requestBody = {
            model,
            messages,
            stream: false,
            options: {
              temperature,
              top_p: topP,
              num_predict: maxTokens || 4096
            }
          };
          break;

        case 'openai':
          apiUrl = 'https://api.openai.com/v1/chat/completions';
          headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          };
          requestBody = {
            model,
            messages,
            temperature,
            top_p: topP,
            max_tokens: maxTokens || 2000
          };
          break;

        case 'gemini':
          // Gemini has different endpoint structure
          const geminiMessages = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            }));

          const systemMessage = messages.find(m => m.role === 'system');

          apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
          headers = {
            'Content-Type': 'application/json'
          };
          requestBody = {
            contents: geminiMessages,
            systemInstruction: systemMessage ? {
              parts: [{ text: systemMessage.content }]
            } : undefined,
            generationConfig: {
              temperature,
              topP,
              maxOutputTokens: maxTokens || 2000
            }
          };
          break;

        default:
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid provider' }));
          return;
      }

      // Make the API request
      console.log(`→ Calling ${provider} API (model: ${model})...`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`✗ ${provider} API error (${response.status}):`, errorText);
        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: `API error (${response.status}): ${errorText}`
        }));
        return;
      }

      const data = await response.json();

      // Normalize response format
      let content;
      if (provider === 'gemini') {
        content = data.candidates?.[0]?.content?.parts
          ?.map(part => part.text)
          ?.join('') || '';
      } else {
        content = data.choices?.[0]?.message?.content || '';
      }

      console.log(`✓ ${provider} API response received (${content.length} chars)`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        content,
        model,
        provider,
        usage: data.usage
      }));

    } catch (error) {
      console.error('✗ Proxy error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: error.message || 'Internal server error'
      }));
    }
  });
});

/**
 * Unified chat handler with automatic provider fallback
 * Priority: Ollama (kimi-k2:1t-cloud) → Ollama (qwen-coder:480b-cloud) → Gemini → GPT-4o
 */
async function handleUnifiedChat(requestData) {
  const { model, messages, temperature = 0.7, topP = 0.9, maxTokens = 4096 } = requestData;
  const errors = [];

  // If specific model requested, try that first
  if (model) {
    console.log(`🎯 Specific model requested: ${model}`);

    // Determine provider from model name
    if (model.startsWith('gpt-')) {
      // OpenAI model
      if (process.env.OPENAI_API_KEY) {
        try {
          console.log(`🔄 Trying OpenAI with ${model}...`);
          const result = await callOpenAI(model, messages, temperature, topP, maxTokens);
          console.log(`✅ Success with OpenAI (${model})`);
          return result;
        } catch (error) {
          console.log(`⚠️ OpenAI (${model}) failed: ${error.message}`);
          errors.push({ provider: 'openai', model, error: error.message });
        }
      }
    } else if (model.includes(':') || model.includes('cloud') || model.includes('deepseek') || model.includes('qwen') || model.includes('kimi') || model.includes('llama')) {
      // Ollama model
      if (process.env.OLLAMA_API_KEY) {
        try {
          console.log(`🔄 Trying Ollama with ${model}...`);
          const result = await callOllama(model, messages, temperature, topP, maxTokens);
          console.log(`✅ Success with Ollama (${model})`);
          return result;
        } catch (error) {
          console.log(`⚠️ Ollama (${model}) failed: ${error.message}`);
          errors.push({ provider: 'ollama', model, error: error.message });
        }
      }
    } else if (model.startsWith('gemini-')) {
      // Gemini model
      if (process.env.GEMINI_API_KEY) {
        try {
          console.log(`🔄 Trying Gemini with ${model}...`);
          const result = await callGemini(model, messages, temperature, topP, maxTokens);
          console.log(`✅ Success with Gemini (${model})`);
          return result;
        } catch (error) {
          console.log(`⚠️ Gemini (${model}) failed: ${error.message}`);
          errors.push({ provider: 'gemini', model, error: error.message });
        }
      }
    }
  }

  // Fallback to default priority chain
  console.log('🔄 Falling back to default priority chain...');

  // Ollama model priority (using real available models)
  const ollamaModels = ['llama3:8b', 'qwen2.5:3b', 'gemma3:4b'];

  // Try Ollama with multiple models
  if (process.env.OLLAMA_API_KEY) {
    for (const fallbackModel of ollamaModels) {
      try {
        console.log(`🔄 Trying Ollama with ${fallbackModel}...`);
        const result = await callOllama(fallbackModel, messages, temperature, topP, maxTokens);
        console.log(`✅ Success with Ollama (${fallbackModel})`);
        return result;
      } catch (error) {
        console.log(`⚠️ Ollama (${fallbackModel}) failed: ${error.message}`);
        errors.push({ provider: 'ollama', model: fallbackModel, error: error.message });
      }
    }
  } else {
    console.log('⏭️ Skipping Ollama (no API key)');
  }

  // Try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('🔄 Trying Gemini (Tertiary)...');
      const result = await callGemini('gemini-2.0-flash-exp', messages, temperature, topP, maxTokens);
      console.log('✅ Success with Gemini');
      return result;
    } catch (error) {
      console.log(`⚠️ Gemini failed: ${error.message}`);
      errors.push({ provider: 'gemini', error: error.message });
    }
  } else {
    console.log('⏭️ Skipping Gemini (no API key)');
  }

  // Try OpenAI GPT-4o
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('🔄 Trying OpenAI GPT-4o (Quaternary)...');
      const result = await callOpenAI('gpt-4o', messages, temperature, topP, maxTokens);
      console.log('✅ Success with OpenAI');
      return result;
    } catch (error) {
      console.log(`⚠️ OpenAI failed: ${error.message}`);
      errors.push({ provider: 'openai', error: error.message });
    }
  } else {
    console.log('⏭️ Skipping OpenAI (no API key)');
  }

  // All providers failed
  throw new Error(`All providers failed:\n${errors.map(e => `${e.provider}${e.model ? ` (${e.model})` : ''}: ${e.error}`).join('\n')}`);
}

/**
 * Handle Ollama-specific chat request
 */
async function handleOllamaChat(requestData) {
  const { model = 'kimi-k2:1t-cloud', messages, temperature = 0.7, topP = 0.9, maxTokens = 4096 } = requestData;
  console.log(`🤖 Ollama direct request with ${model}`);
  return await callOllama(model, messages, temperature, topP, maxTokens);
}

/**
 * Call Ollama API
 */
// Helper: Check if local Ollama has the model
async function isLocalOllamaAvailable(model) {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) return false;
    const data = await response.json();
    return data.models.some(m => m.name === model || m.model === model);
  } catch (error) {
    return false;
  }
}

async function callOllama(model, messages, temperature, topP, maxTokens) {
  // Check if model is available locally first
  const isLocal = await isLocalOllamaAvailable(model);

  const apiUrl = isLocal
    ? 'http://localhost:11434/api/chat'
    : `${process.env.OLLAMA_API_URL || 'https://api.ollama.cloud'}/api/chat`;

  const headers = isLocal
    ? { 'Content-Type': 'application/json' }
    : {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`
      };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature,
        top_p: topP,
        num_predict: maxTokens
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.message.content,
    provider: isLocal ? 'ollama-local' : 'ollama-cloud',
    model,
    usage: {
      promptTokens: data.prompt_eval_count || 0,
      completionTokens: data.eval_count || 0,
      totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
    }
  };
}

/**
 * Call Gemini API
 */
async function callGemini(model, messages, temperature, topP, maxTokens) {
  const geminiMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const systemMessage = messages.find(m => m.role === 'system');

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: geminiMessages,
      systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
      generationConfig: {
        temperature,
        topP,
        maxOutputTokens: maxTokens
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.map(part => part.text)?.join('') || '';

  return {
    content,
    provider: 'gemini',
    model,
    usage: data.usageMetadata ? {
      promptTokens: data.usageMetadata.promptTokenCount || 0,
      completionTokens: data.usageMetadata.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata.totalTokenCount || 0
    } : undefined
  };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(model, messages, temperature, topP, maxTokens) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'openai',
    model,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    } : undefined
  };
}

server.listen(PORT, () => {
  console.log('\n🚀 Local API Server Running');
  console.log(`   http://localhost:${PORT}`);
  console.log('\nAvailable Endpoints:');
  console.log('   POST /api/chat          - Single provider');
  console.log('   POST /api/unified/chat  - Multi-provider with automatic fallback');
  console.log('   POST /api/ollama/chat   - Ollama-specific\n');
  console.log('Provider Configuration:');
  console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`   OLLAMA_API_KEY: ${process.env.OLLAMA_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`   OLLAMA_API_URL: ${process.env.OLLAMA_API_URL || 'https://api.ollama.cloud'}\n`);
  console.log('Priority Chain:');
  console.log('   1️⃣ Ollama (llama3:8b)');
  console.log('   2️⃣ Ollama (qwen2.5:3b)');
  console.log('   3️⃣ Google Gemini (gemini-2.0-flash-exp)');
  console.log('   4️⃣ OpenAI (gpt-4o)\n');
});
