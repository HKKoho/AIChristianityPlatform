import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-TW' ? 'en' : 'zh-TW';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
      title={i18n.language === 'zh-TW' ? 'Switch to English' : '切換至繁體中文'}
    >
      <span className="text-lg">🌐</span>
      <span>{i18n.language === 'zh-TW' ? '中文' : 'EN'}</span>
    </button>
  );
};
