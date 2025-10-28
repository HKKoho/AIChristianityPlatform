import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stage } from '../types';

interface EditorProps {
  text: string;
  onTextChange: (text: string) => void;
  stage: Stage;
  onRefine: () => void;
  onGetCitations: () => void;
  onGenerateMindMap: () => void;
  isProcessing: boolean;
}

const Editor: React.FC<EditorProps> = ({
  text,
  onTextChange,
  stage,
  onRefine,
  onGetCitations,
  onGenerateMindMap,
  isProcessing,
}) => {
  const { t } = useTranslation(['common', 'journey']);

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-xl font-bold text-teal-300 mb-2">{t('journey:heading.theologicalJournal')}</h3>
      <p className="text-sm text-slate-400 mb-4 italic">
        {t('journey:label.hint')}{stage.promptHint}
      </p>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        className="flex-grow w-full p-3 bg-slate-900 border border-slate-700 rounded-md resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none"
        placeholder={t('journey:placeholder.startRecording')}
      />
      <div className="mt-4 flex items-center space-x-3">
        <button
          onClick={onRefine}
          disabled={isProcessing || !text.trim()}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors duration-200"
        >
          {t('journey:button.refineText')}
        </button>
        <button
          onClick={onGetCitations}
          disabled={isProcessing || !text.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors duration-200"
        >
          {t('journey:button.getCitations')}
        </button>
        <button
          onClick={onGenerateMindMap}
          disabled={isProcessing || !text.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors duration-200"
        >
          {t('journey:button.generateMindMap')}
        </button>
      </div>
    </div>
  );
};

export default Editor;
