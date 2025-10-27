import React from 'react';

interface LandingPageProps {
  onNavigate: (destination: 'sermon' | 'bible-game' | 'theology-search' | 'biblical-language' | 'theological-journey' | 'theological-dialogue') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const capabilities = [
    { id: 'bible-game', title: '聖經研讀', description: '互動式聖經遊戲學習', icon: '📖' },
    { id: 'biblical-language', title: '原文研讀', description: '希伯來文與希臘文學習', icon: '✍️' },
    { id: 'theology-search', title: '神學研究', description: 'AI 神學助手與文獻搜索', icon: '🎓' },
    { id: 'theological-dialogue', title: '神學對話', description: 'AI 神學家辯論與分析', icon: '💬' },
    { id: 'sermon', title: '講道生成', description: '自動生成完整講道稿', icon: '🎤' },
    { id: 'theological-journey', title: '神學家日誌', description: '思想路線圖與對話', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-4">AI 神學平台</h1>
        <p className="text-xl text-center text-gray-300 mb-16">六大核心功能，全方位神學學習</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {capabilities.map((cap) => (
            <button
              key={cap.id}
              onClick={() => onNavigate(cap.id as any)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-8 transition-all transform hover:scale-105 hover:shadow-xl"
            >
              <div className="text-6xl mb-4">{cap.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{cap.title}</h3>
              <p className="text-gray-400">{cap.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
