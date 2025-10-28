import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

interface LandingPageProps {
  onNavigate: (destination: 'sermon' | 'bible-game' | 'theology-search' | 'biblical-language' | 'theological-journey' | 'theological-dialogue') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation(['common', 'landing']);

  const capabilities = [
    {
      id: 'bible-game',
      title: t('landing:capabilities.bibleGame.title'),
      description: t('landing:capabilities.bibleGame.description'),
      icon: t('landing:capabilities.bibleGame.icon')
    },
    {
      id: 'biblical-language',
      title: t('landing:capabilities.biblicalLanguage.title'),
      description: t('landing:capabilities.biblicalLanguage.description'),
      icon: t('landing:capabilities.biblicalLanguage.icon')
    },
    {
      id: 'theology-search',
      title: t('landing:capabilities.theologySearch.title'),
      description: t('landing:capabilities.theologySearch.description'),
      icon: t('landing:capabilities.theologySearch.icon')
    },
    {
      id: 'theological-dialogue',
      title: t('landing:capabilities.theologicalDialogue.title'),
      description: t('landing:capabilities.theologicalDialogue.description'),
      icon: t('landing:capabilities.theologicalDialogue.icon')
    },
    {
      id: 'sermon',
      title: t('landing:capabilities.sermon.title'),
      description: t('landing:capabilities.sermon.description'),
      icon: t('landing:capabilities.sermon.icon')
    },
    {
      id: 'theological-journey',
      title: t('landing:capabilities.theologicalJourney.title'),
      description: t('landing:capabilities.theologicalJourney.description'),
      icon: t('landing:capabilities.theologicalJourney.icon')
    },
  ];

  const images = [
    '/TheologyOxford.jpeg',
    '/BibleTheology.jpg',
    '/SermonBible.jpeg',
    '/BibleTextualStudy.jpg',
    '/TheologianJournal.jpeg',
    '/TheologianDialogue.jpg',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        <h1 className="text-4xl font-bold text-center mb-2">{t('common:appTitle')}</h1>
        <p className="text-lg text-center text-gray-300 mb-8">{t('common:appSubtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto mb-8">
          {capabilities.map((cap) => (
            <button
              key={cap.id}
              onClick={() => onNavigate(cap.id as any)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 transition-all transform hover:scale-105 hover:shadow-xl"
            >
              <div className="text-4xl mb-2">{cap.icon}</div>
              <h3 className="text-xl font-bold mb-1">{cap.title}</h3>
              <p className="text-sm text-gray-400">{cap.description}</p>
            </button>
          ))}
        </div>

        {/* Slideshow Section */}
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-2xl">
            {images.map((image, index) => (
              <div
                key={image}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {/* Slide indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-8'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
