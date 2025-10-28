import React from 'react';
import { useTranslation } from 'react-i18next';
import { GameProvider } from './contexts/GameContext';
import Header from './Header';
import GameMap from './GameMap';

interface BibleGameProps {
  onBack: () => void;
}

const BibleGame: React.FC<BibleGameProps> = ({ onBack }) => {
  const { t } = useTranslation(['common', 'bible']);

  return (
    <GameProvider>
      <div className="fixed inset-0 bg-cover bg-center text-stone-900 font-serif" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/old-wall.png')"}}>
        <div className="bg-stone-800 bg-opacity-60 h-full overflow-auto">
          <Header />
          <button
            onClick={onBack}
            className="absolute top-4 left-4 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-md transition-colors z-50"
          >
            {t('common:button.backToMenu')}
          </button>
          <main className="p-4 sm:p-6 md:p-8">
            <GameMap />
          </main>
        </div>
      </div>
    </GameProvider>
  );
};

export default BibleGame;
