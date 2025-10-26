import React, { useState, useRef } from 'react';
import { Chat } from '../../../services/multiProviderChatService';
import { TheologyAssistantMode, OLLAMA_MODELS } from '../../../types';

interface TheologyAssistantProps {
  onBack: () => void;
}

export const TheologyAssistant: React.FC<TheologyAssistantProps> = ({ onBack }) => {
  const [mode, setMode] = useState<TheologyAssistantMode>(TheologyAssistantMode.CHAT);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('kimi-k2:1t-cloud');
  const [temperature, setTemperature] = useState(0.7);
  const chatRef = useRef<Chat | null>(null);

  const initializeChat = () => {
    if (!chatRef.current) {
      chatRef.current = new Chat(
        '你是一位專業的神學助手，精通聖經研究、教會歷史和系統神學。請用繁體中文回答問題，並提供準確的聖經引用。',
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
        content: '抱歉，發生錯誤。請稍後再試。'
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
              ← 返回
            </button>
            <h1 className="text-2xl font-bold">神學研究助手</h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMode(TheologyAssistantMode.CHAT)}
              className={`px-4 py-2 rounded-md ${mode === TheologyAssistantMode.CHAT ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              對話
            </button>
            <button
              onClick={() => setMode(TheologyAssistantMode.CHURCH_HISTORY)}
              className={`px-4 py-2 rounded-md ${mode === TheologyAssistantMode.CHURCH_HISTORY ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              教會歷史
            </button>
            <button
              onClick={() => setMode(TheologyAssistantMode.SYSTEMATIC_THEOLOGY)}
              className={`px-4 py-2 rounded-md ${mode === TheologyAssistantMode.SYSTEMATIC_THEOLOGY ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              系統神學
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
                  {mode === TheologyAssistantMode.CHURCH_HISTORY && '探索教會歷史'}
                  {mode === TheologyAssistantMode.SYSTEMATIC_THEOLOGY && '學習系統神學'}
                  {mode === TheologyAssistantMode.CHAT && '開始對話'}
                </h3>
                <p className="text-sm">請輸入您的問題...</p>
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
                placeholder="輸入您的問題..."
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                發送
              </button>
              <button
                onClick={handleClearChat}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                清除
              </button>
            </div>
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="w-64 bg-gray-800 rounded-lg p-4 space-y-4">
          <h3 className="font-bold text-lg">設定</h3>

          <div>
            <label className="block text-sm mb-2">模型</label>
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
            <h4 className="font-semibold mb-2">快速問題</h4>
            <div className="space-y-2">
              {mode === TheologyAssistantMode.CHURCH_HISTORY && (
                <>
                  <button
                    onClick={() => setInput('介紹宗教改革的起源')}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    宗教改革起源
                  </button>
                  <button
                    onClick={() => setInput('說明早期教會的發展')}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    早期教會發展
                  </button>
                </>
              )}
              {mode === TheologyAssistantMode.SYSTEMATIC_THEOLOGY && (
                <>
                  <button
                    onClick={() => setInput('解釋三位一體的教義')}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    三位一體
                  </button>
                  <button
                    onClick={() => setInput('什麼是預定論？')}
                    className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    預定論
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
