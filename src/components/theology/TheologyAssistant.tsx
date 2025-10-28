import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Chat } from '../../../services/multiProviderChatService';
import { TheologyAssistantMode, OLLAMA_MODELS } from '../../../types';

interface TheologyAssistantProps {
  onBack: () => void;
}

export const TheologyAssistant: React.FC<TheologyAssistantProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation(['common', 'theology']);
  const [mode, setMode] = useState<TheologyAssistantMode>(TheologyAssistantMode.CHAT);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('kimi-k2:1t-cloud');
  const [temperature, setTemperature] = useState(0.7);
  const chatRef = useRef<Chat | null>(null);

  const initializeChat = () => {
    if (!chatRef.current) {
      // Use language-aware system prompt
      const systemPrompt = i18n.language === 'en'
        ? 'You are a professional theology assistant, proficient in Biblical studies, church history, and systematic theology. Please answer questions and provide accurate Biblical citations.'
        : '你是一位專業的神學助手，精通聖經研究、教會歷史和系統神學。請用繁體中文回答問題，並提供準確的聖經引用。';

      chatRef.current = new Chat(
        systemPrompt,
        { temperature, topP: 0.9 }
      );
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      initializeChat();
      const response = await chatRef.current!.sendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: t('common:error.chatError')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    if (chatRef.current) {
      chatRef.current.clearHistory();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              {t('common:button.back')}
            </button>
            <h1 className="text-2xl font-bold">{t('theology:heading.theologyAssistant')}</h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMode(TheologyAssistantMode.CHAT)}
              className={`px-4 py-2 rounded-md ${mode === TheologyAssistantMode.CHAT ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {t('theology:tab.chat')}
            </button>
            <button
              onClick={() => setMode(TheologyAssistantMode.CHURCH_HISTORY)}
              className={`px-4 py-2 rounded-md ${mode === TheologyAssistantMode.CHURCH_HISTORY ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {t('theology:tab.churchHistory')}
            </button>
            <button
              onClick={() => setMode(TheologyAssistantMode.SYSTEMATIC_THEOLOGY)}
              className={`px-4 py-2 rounded-md ${mode === TheologyAssistantMode.SYSTEMATIC_THEOLOGY ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {t('theology:tab.systematicTheology')}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4 flex gap-4 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-lg overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                <h3 className="text-xl mb-4">
                  {mode === TheologyAssistantMode.CHURCH_HISTORY && t('theology:placeholder.exploreChurchHistory')}
                  {mode === TheologyAssistantMode.SYSTEMATIC_THEOLOGY && t('theology:placeholder.learnSystematicTheology')}
                  {mode === TheologyAssistantMode.CHAT && t('theology:placeholder.startChat')}
                </h3>
                <p className="text-sm">{t('theology:placeholder.enterQuestion')}</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('theology:placeholder.enterQuestion')}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                {t('common:send')}
              </button>
              <button
                onClick={handleClearChat}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                {t('common:clear')}
              </button>
            </div>
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="w-64 bg-gray-800 rounded-lg p-4 space-y-4">
          <h3 className="font-bold text-lg">{t('theology:heading.settings')}</h3>

          <div>
            <label className="block text-sm mb-2">{t('theology:label.model')}</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm"
            >
              {OLLAMA_MODELS.slice(0, 5).map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Temperature: {temperature.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h4 className="font-semibold mb-2">{t('theology:heading.quickQuestions')}</h4>
            <div className="space-y-2">
              {mode === TheologyAssistantMode.CHURCH_HISTORY && (
                <>
                  <button
                    onClick={() => setInput(t('theology:quickQuestion.reformationOrigin'))}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    {t('theology:quickQuestion.reformationOriginLabel')}
                  </button>
                  <button
                    onClick={() => setInput(t('theology:quickQuestion.earlyChurchDevelopment'))}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    {t('theology:quickQuestion.earlyChurchDevelopmentLabel')}
                  </button>
                </>
              )}
              {mode === TheologyAssistantMode.SYSTEMATIC_THEOLOGY && (
                <>
                  <button
                    onClick={() => setInput(t('theology:quickQuestion.trinityExplanation'))}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    {t('theology:quickQuestion.trinityLabel')}
                  </button>
                  <button
                    onClick={() => setInput(t('theology:quickQuestion.predestination'))}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    {t('theology:quickQuestion.predestinationLabel')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
