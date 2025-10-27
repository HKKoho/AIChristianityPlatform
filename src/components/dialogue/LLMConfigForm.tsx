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
          Debate Configuration
        </h3>
        <button
            onClick={() => setShowMbtiInfo(!showMbtiInfo)}
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1 rounded-md hover:bg-gray-700"
        >
            {showMbtiInfo ? 'Hide MBTI Info' : 'What is MBTI?'}
        </button>
      </div>
      
      {showMbtiInfo && (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
            <h4 className="text-md font-semibold text-gray-200 mb-2">MBTI Personality Types</h4>
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
          Debate Topic
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
          Language Model
        </label>
        <select
          id="model"
          value={settings.model}
          onChange={handleModelChange}
          disabled={disabled}
          className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm px-3 py-2 disabled:opacity-50"
        >
          <optgroup label="🥇 Ollama Cloud (Primary)">
            <option value="kimi-k2:1t-cloud">Kimi K2 1T Cloud ☁️ (最強)</option>
            <option value="qwen-coder:480b-cloud">Qwen Coder 480B Cloud ☁️</option>
            <option value="deepseek-v3.1:671b">DeepSeek V3.1 671B Cloud ☁️</option>
            <option value="gpt-oss:120b">GPT-OSS 120B Cloud ☁️</option>
            <option value="qwen3-coder:480b">Qwen3 Coder 480B Cloud ☁️</option>
            <option value="gpt-oss:20b">GPT-OSS 20B Cloud ☁️</option>
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
          <optgroup label="💻 Ollama Local">
            <option value="qwen2.5vl:32b">Qwen 2.5 VL 32B (本地)</option>
            <option value="llama4:scout">Llama 4 Scout (本地)</option>
            <option value="llama3.3:latest">Llama 3.3 (本地)</option>
            <option value="mistral-small:24b">Mistral Small 24B (本地)</option>
            <option value="llava:34b">LLaVA 34B (本地)</option>
            <option value="deepseek-r1:32b">DeepSeek R1 32B (本地)</option>
            <option value="llama3.2-vision:latest">Llama 3.2 Vision (本地)</option>
          </optgroup>
        </select>
        <p className="text-xs text-gray-400 mt-1">
          {settings.model.includes('cloud') || settings.model.includes(':') ?
            '☁️ Cloud models provide superior theological reasoning capabilities' :
            '🌟 Fast and reliable for general debates'
          }
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
            Number of Theologians
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
                User Participate in the debate
            </label>
        </div>
      </div>
    </div>
  );
};