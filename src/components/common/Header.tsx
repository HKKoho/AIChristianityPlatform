import React from 'react';
import { AiEngine } from '../../../types';

interface HeaderProps {
  aiEngine: AiEngine;
  onShowAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ aiEngine, onShowAdmin }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-400">AI 神學平台</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            引擎: {aiEngine === AiEngine.GEMINI ? 'Gemini' : 'Local LLM'}
          </span>
          <button
            onClick={onShowAdmin}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
          >
            設定
          </button>
        </div>
      </div>
    </header>
  );
};
