import React, { useCallback } from 'react';
import { DialoguePersona, TheologicalDenomination, MbtiType, AVAILABLE_VOICES, VoiceName } from '../../../types';
import { DENOMINATION_DESCRIPTIONS, MBTI_DESCRIPTIONS, getSystemPromptForDenomination } from './constants';
import { RobotIcon } from './icons/RobotIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface PersonaCreatorProps {
  persona: DialoguePersona;
  onPersonaChange: (updatedPersona: DialoguePersona) => void;
  isDebateActive: boolean;
}

export const PersonaCreator: React.FC<PersonaCreatorProps> = ({ persona, onPersonaChange, isDebateActive }) => {
    
  const handleDenominationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDenomination = e.target.value as TheologicalDenomination;
    onPersonaChange({
      ...persona,
      denomination: newDenomination,
    });
  }, [persona, onPersonaChange]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    onPersonaChange({
      ...persona,
      name: newName,
    });
  }, [persona, onPersonaChange]);

  const handleMbtiChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMbti = e.target.value as MbtiType;
    onPersonaChange({
      ...persona,
      mbti: newMbti,
    });
  }, [persona, onPersonaChange]);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onPersonaChange({
      ...persona,
      color: e.target.value,
    });
  }, [persona, onPersonaChange]);

  const handleVoiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onPersonaChange({
      ...persona,
      voiceName: e.target.value as VoiceName,
    });
  }, [persona, onPersonaChange]);
  
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPersonaChange({
      ...persona,
      systemPrompt: e.target.value,
    });
  }, [persona, onPersonaChange]);

  const handleRegeneratePrompt = useCallback(() => {
    const newSystemPrompt = getSystemPromptForDenomination(persona.denomination, persona.name, persona.mbti);
    onPersonaChange({
        ...persona,
        systemPrompt: newSystemPrompt,
    });
  }, [persona, onPersonaChange]);

  return (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-4 transition-opacity ${isDebateActive ? 'opacity-60' : 'opacity-100'}`}>
      <h3 className="text-xl font-bold flex items-center" style={{ color: persona.color }}>
        <RobotIcon className="mr-2 h-6 w-6" />
        Persona: {persona.name}
      </h3>
       <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <label htmlFor={`name-${persona.id}`} className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            id={`name-${persona.id}`}
            value={persona.name}
            onChange={handleNameChange}
            disabled={isDebateActive}
            className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-sky-500 focus:border-sky-500 shadow-sm px-3 py-2 disabled:cursor-not-allowed"
          />
        </div>
        <div className="col-span-2">
            <label htmlFor={`color-${persona.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                Color
            </label>
            <input
                type="color"
                id={`color-${persona.id}`}
                value={persona.color}
                onChange={handleColorChange}
                disabled={isDebateActive}
                className="w-full h-[42px] bg-gray-700 rounded-md border-gray-600 disabled:cursor-not-allowed p-1 cursor-pointer"
            />
        </div>
      </div>
      <div>
        <label htmlFor={`denomination-${persona.id}`} className="block text-sm font-medium mb-1" style={{ color: persona.color }}>
          Theological Denomination
        </label>
        <select
          id={`denomination-${persona.id}`}
          value={persona.denomination}
          onChange={handleDenominationChange}
          disabled={isDebateActive}
          className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-sky-500 focus:border-sky-500 shadow-sm px-3 py-2 disabled:cursor-not-allowed"
        >
          {Object.values(TheologicalDenomination).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
         <p className="text-xs text-gray-400 mt-1">{DENOMINATION_DESCRIPTIONS[persona.denomination]}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor={`mbti-${persona.id}`} className="block text-sm font-medium mb-1" style={{ color: persona.color }}>
            MBTI Type
            </label>
            <select
            id={`mbti-${persona.id}`}
            value={persona.mbti}
            onChange={handleMbtiChange}
            disabled={isDebateActive}
            className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-sky-500 focus:border-sky-500 shadow-sm px-3 py-2 disabled:cursor-not-allowed"
            >
            {Object.values(MbtiType).map((type) => (
                <option key={type} value={type}>
                {type}
                </option>
            ))}
            </select>
            <p className="text-xs text-gray-400 mt-1 h-10">{MBTI_DESCRIPTIONS[persona.mbti]}</p>
        </div>
        <div>
            <label htmlFor={`voice-${persona.id}`} className="block text-sm font-medium mb-1" style={{ color: persona.color }}>
                Voice
            </label>
            <select
                id={`voice-${persona.id}`}
                value={persona.voiceName}
                onChange={handleVoiceChange}
                disabled={isDebateActive}
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-sky-500 focus:border-sky-500 shadow-sm px-3 py-2 disabled:cursor-not-allowed"
            >
                {AVAILABLE_VOICES.map((voice) => (
                    <option key={voice} value={voice}>
                        {voice}
                    </option>
                ))}
            </select>
            <p className="text-xs text-gray-400 mt-1 h-10">Assign a unique voice.</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={`prompt-${persona.id}`} className="block text-sm font-medium" style={{ color: persona.color }}>
            System Prompt
          </label>
          <button
              onClick={handleRegeneratePrompt}
              disabled={isDebateActive}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Regenerate prompt based on current settings"
            >
              <RefreshIcon className="h-4 w-4" />
          </button>
        </div>
        <textarea
          id={`prompt-${persona.id}`}
          value={persona.systemPrompt}
          onChange={handlePromptChange}
          rows={4}
          disabled={isDebateActive}
          className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-sky-500 focus:border-sky-500 shadow-sm px-3 py-2 text-sm disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};