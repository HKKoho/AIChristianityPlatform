import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English translations
import enCommon from '../locales/en/common.json';
import enLanding from '../locales/en/landing.json';
import enBible from '../locales/en/bible.json';
import enBibleGame from '../locales/en/bibleGame.json';
import enLanguage from '../locales/en/language.json';
import enTheology from '../locales/en/theology.json';
import enJourney from '../locales/en/journey.json';
import enDialogue from '../locales/en/dialogue.json';
import enSermon from '../locales/en/sermon.json';

// Import Traditional Chinese translations
import zhCommon from '../locales/zh-TW/common.json';
import zhLanding from '../locales/zh-TW/landing.json';
import zhBible from '../locales/zh-TW/bible.json';
import zhBibleGame from '../locales/zh-TW/bibleGame.json';
import zhLanguage from '../locales/zh-TW/language.json';
import zhTheology from '../locales/zh-TW/theology.json';
import zhJourney from '../locales/zh-TW/journey.json';
import zhDialogue from '../locales/zh-TW/dialogue.json';
import zhSermon from '../locales/zh-TW/sermon.json';

const resources = {
  en: {
    common: enCommon,
    landing: enLanding,
    bible: enBible,
    bibleGame: enBibleGame,
    language: enLanguage,
    theology: enTheology,
    journey: enJourney,
    dialogue: enDialogue,
    sermon: enSermon,
  },
  'zh-TW': {
    common: zhCommon,
    landing: zhLanding,
    bible: zhBible,
    bibleGame: zhBibleGame,
    language: zhLanguage,
    theology: zhTheology,
    journey: zhJourney,
    dialogue: zhDialogue,
    sermon: zhSermon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-TW', // Default to Traditional Chinese
    debug: false,

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Default namespace
    defaultNS: 'common',
    ns: ['common', 'landing', 'bible', 'bibleGame', 'language', 'theology', 'journey', 'dialogue', 'sermon'],
  });

export default i18n;
