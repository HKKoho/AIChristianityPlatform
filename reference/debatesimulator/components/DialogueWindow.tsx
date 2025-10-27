import React, { useEffect, useRef, useState } from 'react';
import { DialogueTurn, Persona, Source } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SpeakerOnIcon } from './icons/SpeakerOnIcon';

const SourceDisplay: React.FC<{ sources: Source[] }> = ({ sources }) => (
    <div className="mt-2 border-t border-gray-500/50 pt-2">
      <h4 className="text-xs font-semibold text-gray-300 mb-1 flex items-center">
        <DocumentTextIcon className="h-3 w-3 mr-1" /> Sources
      </h4>
      <ul className="list-none pl-0 space-y-1">
        {sources.map((source, i) => (
          <li key={i} className="text-xs text-gray-400">
            <p className="font-bold text-gray-300">{source.title}</p>
            <p>{source.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );

const DialogueMessage: React.FC<{ 
  turn: DialogueTurn; 
  personaColor: string; 
  onPlayAudio: (turnId: string) => void;
  isCurrentlyPlaying: boolean;
}> = ({ turn, personaColor, onPlayAudio, isCurrentlyPlaying }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = turn.speaker === 'Human';
  const userBgColorClass = 'bg-blue-600';
  const canBePlayed = turn.speaker === 'AI' && turn.audioBuffer;

  const handleCopy = () => {
    if (!turn.text) return;
    navigator.clipboard.writeText(turn.text).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  };

  const handlePlayClick = () => {
    if (canBePlayed) {
      onPlayAudio(turn.id);
    }
  }

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col space-y-2 text-md max-w-lg mx-2`}>
        <div 
          className={`px-4 py-2 rounded-lg inline-block text-white relative group transition-all duration-500 ${isUser ? userBgColorClass : ''} ${isCurrentlyPlaying ? 'shadow-lg shadow-sky-500/50' : ''}`}
          style={!isUser ? { backgroundColor: personaColor || '#4B5563' } : {}}
        >
            {turn.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            
            <div className="absolute top-2 right-2 flex gap-1">
              {canBePlayed && (
                 <button
                  onClick={handlePlayClick}
                  className="p-1.5 rounded-md bg-black/10 text-white/70 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/30"
                  aria-label="Play audio"
                >
                  <SpeakerOnIcon className={`h-4 w-4 ${isCurrentlyPlaying ? 'text-sky-400' : ''}`} />
                 </button>
              )}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md bg-black/10 text-white/70 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/30"
                aria-label="Copy response"
              >
                {isCopied ? (
                    <CheckIcon className="h-4 w-4 text-emerald-400" />
                ) : (
                    <ClipboardIcon className="h-4 w-4" />
                )}
              </button>
            </div>


            {turn.sources && turn.sources.length > 0 && (
                <SourceDisplay sources={turn.sources} />
            )}
        </div>
        <span className={`text-xs text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>{turn.personaName}</span>
      </div>
    </div>
  );
};

interface DialogueWindowProps {
  dialogue: DialogueTurn[];
  personas: Persona[];
  isLoading: boolean;
  onNextAiTurn: () => void;
  onUserSubmit: (text: string) => void;
  isStarted: boolean;
  isUserTurn: boolean;
  currentTurnTakerName: string;
  onPlayTurnAudio: (turnId: string) => void;
  currentlyPlayingTurnId: string | null;
}

const UserInputForm: React.FC<{ onUserSubmit: (text: string) => void, isLoading: boolean }> = ({ onUserSubmit, isLoading }) => {
    const [text, setText] = useState('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && !isLoading) {
            onUserSubmit(text);
            setText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, []);

    return (
        <form onSubmit={handleSubmit} className="border-t border-gray-700 mt-4 pt-4">
            <div className="relative">
                <textarea
                    ref={textAreaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    className="w-full bg-gray-700 text-white rounded-lg border-gray-600 focus:ring-blue-500 focus:border-blue-500 shadow-sm px-4 py-3 pr-12 disabled:opacity-50"
                    placeholder="It's your turn to respond..."
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !text.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                >
                    <PaperAirplaneIcon className="h-5 w-5" />
                </button>
            </div>
        </form>
    )
}

export const DialogueWindow: React.FC<DialogueWindowProps> = ({ dialogue, personas, isLoading, onNextAiTurn, onUserSubmit, isStarted, isUserTurn, currentTurnTakerName, onPlayTurnAudio, currentlyPlayingTurnId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dialogue, isLoading]);

  const personaMap: Map<string, Persona> = new Map(personas.map(p => [p.name, p]));

  return (
    <div className="bg-gray-800/50 flex-1 flex flex-col p-4 rounded-lg shadow-inner border border-gray-700 h-[70vh] lg:h-auto">
      <div id="messages" className="flex flex-col space-y-4 p-3 overflow-y-auto flex-grow">
        {!isStarted && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">The debate will appear here. Configure the theologians and press "Start Debate".</p>
          </div>
        )}
        {dialogue.map((turn) => {
           const personaForTurn = personaMap.get(turn.personaName);
           return (
            <DialogueMessage 
                key={turn.id} 
                turn={turn} 
                personaColor={personaForTurn?.color || '#4B5563'}
                onPlayAudio={onPlayTurnAudio}
                isCurrentlyPlaying={currentlyPlayingTurnId === turn.id}
             />
           );
        })}
        {isLoading && (
            <div className="flex justify-start gap-2">
                <div className="flex flex-col space-y-2 text-md max-w-lg mx-2 items-start">
                    <div>
                      <span 
                        className={`px-4 py-2 rounded-lg inline-block text-white animate-pulse`}
                        style={{ backgroundColor: !isUserTurn ? (personas.find(p => p.name === currentTurnTakerName)?.color || '#4B5563') : '#4B5563' }}
                      >
                        Thinking...
                      </span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isStarted && !isLoading && !isUserTurn && (
         <div className="border-t border-gray-700 mt-4 pt-4 flex justify-center">
            <button
                onClick={onNextAiTurn}
                disabled={isLoading}
                className="w-full max-w-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next Turn: {currentTurnTakerName}
            </button>
         </div>
      )}

      {isStarted && isUserTurn && (
          <UserInputForm onUserSubmit={onUserSubmit} isLoading={isLoading} />
      )}
    </div>
  );
};