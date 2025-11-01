import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiEngine, SermonBasis, SermonLength, OLLAMA_MODELS } from '../../../types';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

interface InputFormProps {
  onGenerate: (topic: string, keyPoints: string[], basis: SermonBasis, length: SermonLength, config?: { model: string; temperature: number; topP: number }) => void;
  selectedEngine: AiEngine;
  onEngineChange: (engine: AiEngine) => void;
  onShowSaved: () => void;
  onBackToLanding: () => void;
  hasSavedPresentations: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  onGenerate,
  selectedEngine,
  onEngineChange,
  onShowSaved,
  onBackToLanding,
  hasSavedPresentations
}) => {
  const { t } = useTranslation(['common', 'sermon']);
  const [topic, setTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState(['', '', '']);
  const [sermonBasis, setSermonBasis] = useState<SermonBasis>(SermonBasis.BIBLICAL_STUDY);
  const [sermonLength, setSermonLength] = useState<SermonLength>(SermonLength.FIVE_MIN);
  const [llmModel, setLlmModel] = useState('kimi-k2:1t-cloud');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredKeyPoints = keyPoints.filter(p => p.trim());

    if (selectedEngine === AiEngine.LOCAL_LLM) {
      onGenerate(topic, filteredKeyPoints, sermonBasis, sermonLength, {
        model: llmModel,
        temperature,
        topP
      });
    } else {
      onGenerate(topic, filteredKeyPoints, sermonBasis, sermonLength);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBackToLanding} className="text-gray-400 hover:text-gray-200">
          {t('common:button.backToMenu')}
        </button>
        <LanguageSwitcher />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">{t('sermon:inputForm.topic')}</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t('sermon:inputForm.topicPlaceholder')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('sermon:inputForm.keyPoints')}</label>
          {keyPoints.map((point, index) => (
            <input
              key={index}
              type="text"
              value={point}
              onChange={(e) => {
                const newPoints = [...keyPoints];
                newPoints[index] = e.target.value;
                setKeyPoints(newPoints);
              }}
              className="w-full px-4 py-2 mb-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('sermon:inputForm.keyPointPlaceholder', { index: index + 1 })}
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('sermon:inputForm.sermonBasis')}</label>
          <select
            value={sermonBasis}
            onChange={(e) => setSermonBasis(e.target.value as SermonBasis)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={SermonBasis.BIBLICAL_STUDY}>{t('sermon:inputForm.biblicalStudy')}</option>
            <option value={SermonBasis.CHURCH_HISTORY}>{t('sermon:inputForm.churchHistory')}</option>
            <option value={SermonBasis.SYSTEMATIC_THEOLOGY}>{t('sermon:inputForm.systematicTheology')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('sermon:inputForm.sermonLength')}</label>
          <select
            value={sermonLength}
            onChange={(e) => setSermonLength(e.target.value as SermonLength)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={SermonLength.THREE_MIN}>{t('sermon:inputForm.threeMinutes')}</option>
            <option value={SermonLength.FIVE_MIN}>{t('sermon:inputForm.fiveMinutes')}</option>
            <option value={SermonLength.TEN_MIN}>{t('sermon:inputForm.tenMinutes')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('sermon:inputForm.aiEngine')}</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => onEngineChange(AiEngine.GEMINI)}
              className={`flex-1 py-2 px-4 rounded-md ${selectedEngine === AiEngine.GEMINI ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Gemini
            </button>
            <button
              type="button"
              onClick={() => onEngineChange(AiEngine.LOCAL_LLM)}
              className={`flex-1 py-2 px-4 rounded-md ${selectedEngine === AiEngine.LOCAL_LLM ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Local LLM
            </button>
          </div>
        </div>

        {selectedEngine === AiEngine.LOCAL_LLM && (
          <div className="bg-gray-800 p-4 rounded-md space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('sermon:inputForm.llmModel')}</label>
              <select
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
              >
                {OLLAMA_MODELS.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Temperature: {temperature}</label>
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

            <div>
              <label className="block text-sm mb-2">Top-P: {topP}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold transition-colors"
          >
            {t('sermon:inputForm.generate')}
          </button>
          {hasSavedPresentations && (
            <button
              type="button"
              onClick={onShowSaved}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              {t('sermon:inputForm.viewSaved')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
