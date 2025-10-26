import React from 'react';
import { GeneratedPresentation, SavedPresentation } from '../../../types';

interface ResultDisplayProps {
  presentation: GeneratedPresentation | SavedPresentation;
  topic: string;
  onReset: () => void;
  onSave: (presentation: GeneratedPresentation) => void;
  isSaved: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  presentation,
  topic,
  onReset,
  onSave,
  isSaved
}) => {
  return (
    <div className="w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{topic}</h2>
        <div className="flex gap-4">
          {!isSaved && (
            <button
              onClick={() => onSave(presentation as GeneratedPresentation)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md"
            >
              保存
            </button>
          )}
          <button
            onClick={onReset}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            返回
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">摘要</h3>
        <p className="text-gray-300">{presentation.summary}</p>
      </div>

      <div className="space-y-6">
        {presentation.slides.map((slide, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">{slide.title}</h3>
            {slide.backgroundUrl && (
              <img src={slide.backgroundUrl} alt={slide.title} className="w-full h-48 object-cover rounded mb-4" />
            )}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-400">要點：</h4>
              <ul className="list-disc list-inside text-gray-300">
                {slide.talkingPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-400">講者筆記：</h4>
              <p className="text-gray-300 mt-2">{slide.speakerNotes}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h3 className="text-xl font-bold mb-4">完整講稿</h3>
        <div className="text-gray-300 whitespace-pre-wrap">{presentation.fullScript}</div>
      </div>
    </div>
  );
};
