import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SystemPromptConfig } from '../../../types';

interface AdminPanelProps {
  config: SystemPromptConfig;
  onSave: (config: SystemPromptConfig) => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ config, onSave, onBack }) => {
  const { t } = useTranslation('sermon');
  const [localConfig, setLocalConfig] = useState(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localConfig);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t('admin.title')}</h2>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          {t('admin.back')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">{t('admin.enableCustomPersonality')}</label>
          <input
            type="checkbox"
            checked={localConfig.enabled}
            onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        {localConfig.enabled && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">{t('admin.ethicalStance')}</label>
              <textarea
                value={localConfig.ethics}
                onChange={(e) => setLocalConfig({ ...localConfig, ethics: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md h-24"
                placeholder={t('admin.ethicalPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('admin.tonalStyle')}</label>
              <input
                type="text"
                value={localConfig.tone}
                onChange={(e) => setLocalConfig({ ...localConfig, tone: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
                placeholder={t('admin.tonalPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('admin.empathyLevel')}</label>
              <input
                type="range"
                min="0"
                max="10"
                value={localConfig.empathy}
                onChange={(e) => setLocalConfig({ ...localConfig, empathy: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-gray-400">{localConfig.empathy}</div>
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold"
        >
          {t('admin.save')}
        </button>
      </form>
    </div>
  );
};
