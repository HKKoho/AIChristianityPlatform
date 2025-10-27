import React, { useCallback, useState } from 'react';
import { LLMSettings } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { MBTI_DESCRIPTIONS } from '../constants';

interface LLMConfigFormProps {
  settings: LLMSettings;
  setSettings: (settings: LLMSettings) => void;
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
          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
        </select>
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