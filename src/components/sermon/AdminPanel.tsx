import React, { useState } from 'react';
import { SystemPromptConfig } from '../../../types';

interface AdminPanelProps {
  config: SystemPromptConfig;
  onSave: (config: SystemPromptConfig) => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ config, onSave, onBack }) => {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localConfig);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">AI 人格設定</h2>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          返回
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">啟用自訂人格</label>
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
              <label className="block text-sm font-medium mb-2">倫理立場</label>
              <textarea
                value={localConfig.ethics}
                onChange={(e) => setLocalConfig({ ...localConfig, ethics: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md h-24"
                placeholder="例如：重視社會公義與憐憫"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">語氣風格</label>
              <input
                type="text"
                value={localConfig.tone}
                onChange={(e) => setLocalConfig({ ...localConfig, tone: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
                placeholder="例如：溫和、鼓勵性"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">同理心程度 (0-10)</label>
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
          保存設定
        </button>
      </form>
    </div>
  );
};
