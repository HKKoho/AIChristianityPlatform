import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiEngine } from '../../../types';

interface HeaderProps {
  aiEngine: AiEngine;
  onShowAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ aiEngine, onShowAdmin }) => {
  const { t } = useTranslation(['common']);

  return (
    <header className="bg-gray-800 border-b border-gray-700 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-400">{t('common:header.appTitle')}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {t('common:header.engine')} {aiEngine === AiEngine.GEMINI ? 'Gemini' : 'Local LLM'}
          </span>
          <button
            onClick={onShowAdmin}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
          >
            {t('common:settings')}
          </button>
        </div>
      </div>
    </header>
  );
};
