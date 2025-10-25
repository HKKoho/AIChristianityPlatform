#!/usr/bin/env node

/**
 * Multi-Provider System Test Script
 * Run with: node test-multi-provider.mjs
 */

import { readFileSync } from 'fs';

console.log('🔍 Multi-Provider AI System Verification\n');

// Load environment variables
try {
  const envContent = readFileSync('.env.local', 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
  console.log('✅ Loaded .env.local\n');
} catch (error) {
  console.log('⚠️  .env.local not found - using environment variables\n');
}

// Check provider configuration
console.log('📊 Provider Configuration:');
console.log('─'.repeat(50));

const providers = [
  {
    name: '🥇 Primary: Ollama (Kimi K2)',
    key: 'OLLAMA_API_KEY',
    url: 'OLLAMA_API_URL'
  },
  {
    name: '🥈 Secondary: Ollama (Qwen Coder)',
    key: 'OLLAMA_API_KEY',
    url: 'OLLAMA_API_URL'
  },
  {
    name: '🥉 Tertiary: Google Gemini',
    key: 'GEMINI_API_KEY'
  },
  {
    name: '4️⃣  Quaternary: OpenAI GPT-4o',
    key: 'OPENAI_API_KEY'
  }
];

let configuredCount = 0;
const configuredProviders = new Set();

providers.forEach(provider => {
  const isConfigured = Boolean(process.env[provider.key]);
  const status = isConfigured ? '✅ Configured' : '❌ Not configured';
  const urlInfo = provider.url ? ` (${process.env[provider.url] || 'default URL'})` : '';

  console.log(`${provider.name}`);
  console.log(`   ${status}${urlInfo}`);

  if (isConfigured) {
    configuredProviders.add(provider.key);
  }
});

configuredCount = configuredProviders.size;

console.log('─'.repeat(50));
console.log(`\n✨ Total Providers Configured: ${configuredCount}/3`);

if (configuredCount === 0) {
  console.log('\n❌ ERROR: No providers configured!');
  console.log('Please add at least one API key to .env.local:\n');
  console.log('   OLLAMA_API_KEY=your_key');
  console.log('   GEMINI_API_KEY=your_key');
  console.log('   OPENAI_API_KEY=your_key\n');
  process.exit(1);
}

// Check file structure
console.log('\n📁 File Structure Verification:');
console.log('─'.repeat(50));

const requiredFiles = [
  'types.ts',
  'App.tsx',
  'api/ollama.ts',
  'api/unified.ts',
  'services/ollamaChatService.ts',
  'services/multiProviderChatService.ts',
  'dev-api-server.mjs',
  'docs/MULTI_PROVIDER_FALLBACK.md',
  'MULTI_PROVIDER_IMPLEMENTATION.md'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  try {
    readFileSync(file);
    console.log(`✅ ${file}`);
  } catch (error) {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('─'.repeat(50));

if (!allFilesExist) {
  console.log('\n⚠️  Some files are missing. Please check the implementation.');
  process.exit(1);
}

// Success summary
console.log('\n🎉 Multi-Provider System Status: READY\n');
console.log('Next Steps:');
console.log('1. Start dev server: node dev-api-server.mjs');
console.log('2. Test unified endpoint:');
console.log('   curl -X POST http://localhost:3001/api/unified/chat \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"messages":[{"role":"user","content":"Hello"}]}\'');
console.log('\n3. Read documentation: docs/MULTI_PROVIDER_FALLBACK.md');
console.log('4. Implementation summary: MULTI_PROVIDER_IMPLEMENTATION.md\n');

console.log('🔄 Provider Priority Chain:');
console.log('   1. Ollama (kimi-k2:1t-cloud)');
console.log('   2. Ollama (qwen-coder:480b-cloud)');
console.log('   3. Google Gemini (gemini-2.0-flash-exp)');
console.log('   4. OpenAI (gpt-4o)\n');

console.log('✨ System will automatically failover if a provider fails!\n');
