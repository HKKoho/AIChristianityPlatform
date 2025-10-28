import React from 'react';
import { useTranslation } from 'react-i18next';
import { SavedPresentation } from '../../../types';

interface SavedPresentationsProps {
  presentations: SavedPresentation[];
  onLoad: (presentation: SavedPresentation) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const SavedPresentations: React.FC<SavedPresentationsProps> = ({
  presentations,
  onLoad,
  onDelete,
  onBack
}) => {
  const { t } = useTranslation('sermon');
  return (
    <div className="w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t('saved.title')}</h2>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          {t('saved.back')}
        </button>
      </div>

      {presentations.length === 0 ? (
        <p className="text-gray-400 text-center py-12">{t('saved.noSaved')}</p>
      ) : (
        <div className="space-y-4">
          {presentations.map((presentation) => (
            <div key={presentation.id} className="bg-gray-800 rounded-lg p-6 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{presentation.topic}</h3>
                <p className="text-gray-400 text-sm mb-2">
                  {t('saved.savedAt')} {new Date(presentation.savedAt).toLocaleString('zh-TW')}
                </p>
                <p className="text-gray-300">{presentation.summary.substring(0, 150)}...</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onLoad(presentation)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  {t('saved.view')}
                </button>
                <button
                  onClick={() => onDelete(presentation.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
                >
                  {t('saved.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
