import React, { useCallback, useState } from 'react';
import { DialogueSettings } from '../../../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { MBTI_DESCRIPTIONS } from './constants';

interface LLMConfigFormProps {
  settings: DialogueSettings;
  setSettings: (settings: DialogueSettings) => void;
  disabled: boolean;
}

export const LLMConfigForm: React.FC<LLMConfigFormProps> = ({ settings, setSettings, disabled }) => {
  const [showMbtiInfo, setShowMbtiInfo] = useState(false);

  const handleTopicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, topic: e.target.value });
  }, [settings, setSettings]);

  const handleDebatersChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, numDebaters: parseInt(e.target.value, 10) });
  }, [settings, setSettings]);

  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ ...settings, model: e.target.value });
  }, [settings, setSettings]);
  
  const handleParticipationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, userIsParticipant: e.target.checked });
  }, [settings, setSettings]);


  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center">
          <SparklesIcon className="mr-2 h-6 w-6 text-indigo-400" />
          辯論設定
        </h3>
        <button
            onClick={() => setShowMbtiInfo(!showMbtiInfo)}
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1 rounded-md hover:bg-gray-700"
        >
            {showMbtiInfo ? '隱藏 MBTI 資訊' : '什麼是 MBTI？'}
        </button>
      </div>
      
      {showMbtiInfo && (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
            <h4 className="text-md font-semibold text-gray-200 mb-2">MBTI 性格類型</h4>
            <ul className="space-y-2 text-sm">
                {Object.entries(MBTI_DESCRIPTIONS).map(([type, desc]) => (
                    <li key={type} className="flex flex-col sm:flex-row">
                        <strong className="text-gray-300 w-16 flex-shrink-0">{type}:</strong>
                        <span className="text-gray-400">{desc}</span>
                    </li>
                ))}
            </ul>
        </div>
      )}

      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">
          辯論主題
        </label>
        <input
          type="text"
          id="topic"
          value={settings.topic}
          onChange={handleTopicChange}
          disabled={disabled}
          className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm px-3 py-2 disabled:opacity-50"
        />
      </div>
       <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-1">
          語言模型
        </label>
        <select
          id="model"
          value={settings.model}
          onChange={handleModelChange}
          disabled={disabled}
          className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm px-3 py-2 disabled:opacity-50"
        >
          <optgroup label="☁️ Ollama Cloud - Large Models (Preview)">
            <option value="kimi-k2:1t-cloud">Kimi K2 1T Cloud 🏆 (1 Trillion)</option>
            <option value="deepseek-v3.1:671b-cloud">DeepSeek V3.1 671B Cloud 🏆</option>
            <option value="qwen3-coder:480b-cloud">Qwen3 Coder 480B Cloud 🏆</option>
            <option value="gpt-oss:120b-cloud">GPT-OSS 120B Cloud 🏆</option>
            <option value="gpt-oss:20b-cloud">GPT-OSS 20B Cloud</option>
            <option value="glm-4.6:cloud">GLM 4.6 Cloud</option>
          </optgroup>
          <optgroup label="☁️ Ollama Cloud - Standard Models">
            <option value="llama3:8b">Llama 3 8B</option>
            <option value="llama3.2:3b">Llama 3.2 3B</option>
            <option value="qwen2.5:3b">Qwen 2.5 3B</option>
            <option value="qwen2.5-coder:3b">Qwen 2.5 Coder 3B</option>
            <option value="gemma3:4b">Gemma 3 4B</option>
            <option value="phi3.5:latest">Phi 3.5</option>
          </optgroup>
          <optgroup label="🌟 Google Gemini">
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (快速)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro (進階)</option>
            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Experimental</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          </optgroup>
          <optgroup label="🤖 OpenAI">
            <option value="gpt-4o">GPT-4o (最新)</option>
            <option value="gpt-4o-mini">GPT-4o Mini (經濟)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </optgroup>
          <optgroup label="💻 Ollama Local (不適用於Vercel)">
            <option value="llama3.2-vision:90b">Llama 3.2 Vision 90B 🏆</option>
            <option value="qwen2.5:72b">Qwen 2.5 72B 🏆</option>
            <option value="deepseek-r1:70b">DeepSeek R1 70B 🏆</option>
            <option value="llama3.3:latest">Llama 3.3 70B 🏆</option>
            <option value="gemma3:27b">Gemma 3 27B</option>
            <option value="mistral-small3.1:24b">Mistral Small 3.1 24B</option>
            <option value="llama3.2-vision:latest">Llama 3.2 Vision 11B</option>
          </optgroup>
        </select>
        <p className="text-xs text-gray-400 mt-1">
          {settings.model.startsWith('gemini-2.5') ?
            '🌟 推薦：最佳性能與推理能力' :
            settings.model.startsWith('gpt-4') ?
            '🤖 OpenAI：強大的推理能力' :
            settings.model.includes(':') ?
            '☁️ Ollama：輕量快速模型' :
            '🌟 快速且可靠'
          }
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
            神學家數量
            </label>
            <div className="flex items-center space-x-6">
            {[2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center">
                <input
                    type="radio"
                    id={`numDebaters-${num}`}
                    name="numDebaters"
                    value={num}
                    checked={settings.numDebaters === num}
                    onChange={handleDebatersChange}
                    disabled={disabled}
                    className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                />
                <label htmlFor={`numDebaters-${num}`} className="ml-2 block text-sm text-gray-300">
                    {num}
                </label>
                </div>
            ))}
            </div>
        </div>
        <div className="flex items-center justify-self-start md:justify-self-end mt-4 md:mt-0">
            <input
                type="checkbox"
                id="user-participant"
                checked={settings.userIsParticipant}
                onChange={handleParticipationChange}
                disabled={disabled}
                className="h-4 w-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
            />
            <label htmlFor="user-participant" className="ml-2 block text-sm text-gray-300">
                使用者參與辯論
            </label>
        </div>
      </div>
    </div>
  );
};