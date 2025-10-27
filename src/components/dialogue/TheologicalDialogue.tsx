import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DialoguePersona, DialogueTurn, DialogueSettings, UserInputAnalysis, TheologianResponse } from '../../../types';
import { DEFAULT_DIALOGUE_SETTINGS, THEOLOGIAN_PERSONAS } from './constants';
import { PersonaCreator } from './PersonaCreator';
import { LLMConfigForm } from './LLMConfigForm';
import { DialogueWindow } from './DialogueWindow';
import { AnalysisResultDisplay } from './AnalysisResultDisplay';
import { generateDebateResponse, generateAnalysisAndResponses, generateSpeech } from '../../../services/dialogueService';
import { decode, decodeAudioData } from './utils/audioUtils';

type AppMode = 'dialogue' | 'analysis';

interface TheologicalDialogueProps {
  onBack: () => void;
}

const TheologicalDialogue: React.FC<TheologicalDialogueProps> = ({ onBack }) => {
  // Shared state
  const [mode, setMode] = useState<AppMode>('dialogue');
  const [settings, setSettings] = useState<DialogueSettings>(DEFAULT_DIALOGUE_SETTINGS);

  // Dialogue Mode State
  const [personas, setPersonas] = useState<DialoguePersona[]>(THEOLOGIAN_PERSONAS.slice(0, DEFAULT_DIALOGUE_SETTINGS.numDebaters));
  const [dialogue, setDialogue] = useState<DialogueTurn[]>([]);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);

  // Analysis Mode State
  const [analysisInput, setAnalysisInput] = useState<string>('Examine the concept of Theosis (deification) in Eastern Orthodox theology compared to the Western view of sanctification.');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<UserInputAnalysis | null>(null);
  const [theologianResponses, setTheologianResponses] = useState<TheologianResponse[]>([]);

  // TTS State
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [currentlyPlayingTurnId, setCurrentlyPlayingTurnId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

  // Derived state for dialogue mode
  const totalParticipants = settings.userIsParticipant ? personas.length + 1 : personas.length;
  const isUserTurn = settings.userIsParticipant && currentTurnIndex === personas.length;
  const currentTurnTakerName = isUserTurn ? "Your Turn" : personas[currentTurnIndex]?.name || '...';

  // --- Audio Logic ---
  useEffect(() => {
    if (isTtsEnabled && !audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  }, [isTtsEnabled]);

  const stopAllAudio = useCallback(() => {
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    if (audioContextRef.current) {
      nextStartTimeRef.current = audioContextRef.current.currentTime;
    }
    setCurrentlyPlayingTurnId(null);
  }, []);

  const playAudioBuffer = useCallback((buffer: AudioBuffer, turnId: string) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
        audioSourcesRef.current.delete(source);
        if (currentlyPlayingTurnId === turnId) {
           setCurrentlyPlayingTurnId(null);
        }
    };

    const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;

    audioSourcesRef.current.add(source);
    setCurrentlyPlayingTurnId(turnId);
  }, [currentlyPlayingTurnId]);

  const handlePlaySpecificTurn = useCallback(async (turnId: string) => {
    if (!isTtsEnabled) return;
    stopAllAudio();

    const turn = dialogue.find(t => t.id === turnId);
    if (!turn || turn.speaker === 'Human') return;

    if (turn.audioBuffer) {
        playAudioBuffer(turn.audioBuffer, turn.id);
    } else {
        const persona = personas.find(p => p.name === turn.personaName);
        if (!persona) return;

        const base64Audio = await generateSpeech(turn.text, persona.voiceName);
        if (base64Audio && audioContextRef.current) {
            const audioData = decode(base64Audio);
            const buffer = await decodeAudioData(audioData, audioContextRef.current);

            setDialogue(prev => prev.map(d => d.id === turnId ? { ...d, audioBuffer: buffer } : d));
            playAudioBuffer(buffer, turn.id);
        }
    }
  }, [dialogue, isTtsEnabled, personas, playAudioBuffer, stopAllAudio]);
  // --- End Audio Logic ---

  // Sync personas with settings
  useEffect(() => {
    const currentPersonas = [...personas];
    const newPersonas = [];
    for (let i = 0; i < settings.numDebaters; i++) {
        newPersonas.push(currentPersonas[i] || THEOLOGIAN_PERSONAS[i % THEOLOGIAN_PERSONAS.length]);
    }
    setPersonas(newPersonas);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.numDebaters]);


  const handlePersonaChange = (index: number, updatedPersona: DialoguePersona) => {
    const newPersonas = [...personas];
    newPersonas[index] = updatedPersona;
    setPersonas(newPersonas);
  };

  const runAiTurn = useCallback(async (aiIndex: number, currentHistory: DialogueTurn[]) => {
    setIsLoading(true);
    setCurrentTurnIndex(aiIndex);

    const personaForTurn = personas[aiIndex];
    const { responseText, sources } = await generateDebateResponse(personaForTurn, settings, currentHistory);

    let finalTurn: DialogueTurn = {
      id: crypto.randomUUID(),
      speaker: 'AI',
      personaName: personaForTurn.name,
      text: responseText,
      sources,
    };

    if (isTtsEnabled && responseText && !responseText.startsWith('I encountered an error')) {
      const base64Audio = await generateSpeech(responseText, personaForTurn.voiceName);
      if (base64Audio && audioContextRef.current) {
        try {
          const audioData = decode(base64Audio);
          const buffer = await decodeAudioData(audioData, audioContextRef.current);
          finalTurn.audioBuffer = buffer;
          playAudioBuffer(buffer, finalTurn.id);
        } catch (error) {
          console.error("Failed to decode or play audio:", error);
        }
      }
    }

    setDialogue(prev => [...prev, finalTurn]);
    setCurrentTurnIndex((aiIndex + 1) % totalParticipants);
    setIsLoading(false);
}, [personas, settings, totalParticipants, isTtsEnabled, playAudioBuffer]);

  const handleNextAiTurnClick = useCallback(() => {
    if (!isUserTurn) {
        runAiTurn(currentTurnIndex, dialogue);
    }
  }, [isUserTurn, runAiTurn, currentTurnIndex, dialogue]);

  const handleUserTurnSubmit = useCallback(async (userInput: string) => {
    const userTurn: DialogueTurn = {
        id: crypto.randomUUID(),
        speaker: 'Human',
        personaName: 'You',
        text: userInput,
        sources: [],
    };
    const newHistory = [...dialogue, userTurn];
    setDialogue(newHistory);
    stopAllAudio();

    const nextAiIndex = 0;
    setCurrentTurnIndex(nextAiIndex);
    await runAiTurn(nextAiIndex, newHistory);

  }, [dialogue, runAiTurn, stopAllAudio]);


  const startDialogue = useCallback(() => {
    setIsStarted(true);
    setDialogue([]);
    setCurrentTurnIndex(0);
    stopAllAudio();
    runAiTurn(0, []);
  }, [runAiTurn, stopAllAudio]);


  const endDialogue = () => {
    setIsStarted(false);
    setIsLoading(false);
    stopAllAudio();
  };

  const handleAnalysisSubmit = useCallback(async () => {
    if (!analysisInput.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTheologianResponses([]);
    const { analysis, responses } = await generateAnalysisAndResponses(analysisInput, settings);
    setAnalysisResult(analysis);
    setTheologianResponses(responses);
    setIsAnalyzing(false);
  }, [analysisInput, settings]);

  const resetAll = () => {
    endDialogue();
    setDialogue([]);
    setSettings(DEFAULT_DIALOGUE_SETTINGS);
    setPersonas(THEOLOGIAN_PERSONAS.slice(0, DEFAULT_DIALOGUE_SETTINGS.numDebaters));
    setAnalysisInput('Examine the concept of Theosis (deification) in Eastern Orthodox theology compared to the Western view of sanctification.');
    setAnalysisResult(null);
    setTheologianResponses([]);
    setIsAnalyzing(false);
  }

  const renderDialogueMode = () => (
    <main className="flex-grow flex flex-col gap-8">
        <div className="w-full">
            <LLMConfigForm settings={settings} setSettings={setSettings} disabled={isStarted} />
             <div className="flex flex-col sm:flex-row gap-4 mt-4">
                {!isStarted ? (
                    <button onClick={startDialogue} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex-1">
                        Start Debate
                    </button>
                ) : (
                    <button onClick={endDialogue} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md flex-1">
                        End Debate
                    </button>
                )}
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6 place-content-start">
                {personas.map((p, i) => (
                    <PersonaCreator
                        key={p.id + i}
                        persona={p}
                        onPersonaChange={(updatedPersona) => handlePersonaChange(i, updatedPersona)}
                        isDebateActive={isStarted}
                    />
                ))}
            </div>
            <div className="w-full lg:w-1/2 flex flex-col">
                <DialogueWindow
                    dialogue={dialogue}
                    personas={personas}
                    isLoading={isLoading}
                    onNextAiTurn={handleNextAiTurnClick}
                    onUserSubmit={handleUserTurnSubmit}
                    isStarted={isStarted}
                    isUserTurn={isUserTurn}
                    currentTurnTakerName={currentTurnTakerName}
                    onPlayTurnAudio={handlePlaySpecificTurn}
                    currentlyPlayingTurnId={currentlyPlayingTurnId}
                />
            </div>
        </div>
    </main>
  );

  const renderAnalysisMode = () => (
    <main className="flex-grow flex flex-col gap-8">
        <div className="w-full lg:w-2/3 mx-auto">
             <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 space-y-3">
                <label htmlFor="analysis-input" className="block text-sm font-medium text-gray-300">
                    Enter Theological Topic for Analysis
                </label>
                <textarea
                    id="analysis-input"
                    value={analysisInput}
                    onChange={(e) => setAnalysisInput(e.target.value)}
                    rows={4}
                    disabled={isAnalyzing}
                    className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm px-3 py-2 disabled:opacity-50"
                    placeholder="e.g., Compare and contrast the Catholic and Protestant views on justification."
                />
                 <button onClick={handleAnalysisSubmit} disabled={isAnalyzing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {isAnalyzing ? 'Analyzing...' : 'Analyze & Discuss'}
                </button>
             </div>
        </div>
        <div className="w-full">
            <AnalysisResultDisplay analysis={analysisResult} responses={theologianResponses} isLoading={isAnalyzing} />
        </div>
    </main>
  );

  return (
    <div className="fixed inset-0 bg-gray-900 text-white overflow-auto">
      <div className="min-h-screen font-sans flex flex-col p-4 md:p-8">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors z-50"
        >
          ← 返回主選單
        </button>

        <header className="text-center mb-8 mt-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Theological <span className="text-sky-400">Dialogue</span> Simulator
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
              Engage with AI theologians through structured dialogue or multi-perspective analysis.
          </p>
        </header>

        <div className="flex justify-center items-center gap-4 mb-8">
            <div className="bg-gray-800 p-1 rounded-lg flex gap-1 border border-gray-700">
                <button onClick={() => setMode('dialogue')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'dialogue' ? 'bg-sky-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                    Debate Mode
                </button>
                <button onClick={() => setMode('analysis')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'analysis' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                    Analysis Mode
                </button>
            </div>
            {mode === 'dialogue' && (
              <div className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
                  <label htmlFor="tts-toggle" className="text-sm font-medium text-gray-300">
                      Enable Audio
                  </label>
                  <button
                      id="tts-toggle"
                      onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                      className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                      style={{ backgroundColor: isTtsEnabled ? '#0ea5e9' : '#4b5563' }}
                      aria-label="Enable text-to-speech"
                  >
                      <span className="sr-only">Enable Audio</span>
                      <span
                          className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                          style={{ transform: isTtsEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                      />
                  </button>
              </div>
            )}
             <button onClick={resetAll} disabled={isLoading || isAnalyzing} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                Reset All
              </button>
        </div>

        {mode === 'dialogue' ? renderDialogueMode() : renderAnalysisMode()}
      </div>
    </div>
  );
};

export default TheologicalDialogue;
