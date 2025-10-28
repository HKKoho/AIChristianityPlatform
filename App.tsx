import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Header,
  InputForm,
  LoadingScreen,
  ResultDisplay,
  SavedPresentations,
  AdminPanel,
  LandingPage,
  BibleGame,
  TheologyAssistant,
  BiblicalLanguage,
  TheologicalJourney,
  TheologicalDialogue
} from './src/components';
// Sermon generation services - TO BE IMPLEMENTED
// import { generatePresentation as generateWithGemini } from './services/geminiService';
// import { generatePresentation as generateWithLocalLLM } from './services/localLLMService';
import type { GeneratedPresentation, SavedPresentation, SystemPromptConfig, SermonBasis, SermonLength } from './types';
import { AppState, AiEngine, DEFAULT_SYSTEM_PROMPT_CONFIG } from './types';

const App: React.FC = () => {
  const { t } = useTranslation(['common']);
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  // Default to Local LLM (multi-provider system with automatic fallback)
  const [aiEngine, setAiEngine] = useState<AiEngine>(AiEngine.LOCAL_LLM);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedPresentation | SavedPresentation | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [savedPresentations, setSavedPresentations] = useState<SavedPresentation[]>([]);
  const [systemPromptConfig, setSystemPromptConfig] = useState<SystemPromptConfig>(DEFAULT_SYSTEM_PROMPT_CONFIG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-insights-presentations');
      if (saved) {
        setSavedPresentations(JSON.parse(saved));
      }
      const savedConfig = localStorage.getItem('ai-insights-prompt-config');
      if (savedConfig) {
        setSystemPromptConfig(JSON.parse(savedConfig));
      }
    } catch (e) {
      console.error("Failed to load data from local storage", e);
    }
  }, []);

  const handleGenerate = useCallback(async (
    topic: string,
    keyPoints: string[],
    sermonBasis: SermonBasis,
    sermonLength: SermonLength,
    localLLMConfig?: { model: string; temperature: number; topP: number }
  ) => {
    setAppState(AppState.LOADING);
    setError(null);
    setGeneratedContent(null);
    setCurrentTopic(topic);

    try {
      // Sermon generation - TO BE IMPLEMENTED
      // For now, show a placeholder message
      throw new Error(t('common:error.sermonGenerationNotImplemented'));

      // TODO: Implement sermon generation services
      // let presentation: GeneratedPresentation;
      // if (aiEngine === AiEngine.GEMINI) {
      //   presentation = await generateWithGemini(topic, keyPoints, sermonBasis, sermonLength, setLoadingMessage);
      // } else if (aiEngine === AiEngine.LOCAL_LLM && localLLMConfig) {
      //   presentation = await generateWithLocalLLM(topic, keyPoints, sermonBasis, sermonLength, setLoadingMessage, localLLMConfig);
      // } else {
      //   throw new Error('Please select an AI engine');
      // }
      // setGeneratedContent(presentation);
      // setAppState(AppState.RESULT);
    } catch (err) {
      console.error('Generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(t('common:error.generationFailedWithMessage', { message: errorMessage }));
      setAppState(AppState.ERROR);
    }
  }, [aiEngine]);

  const handleReset = () => {
    setAppState(AppState.INPUT);
    setGeneratedContent(null);
    setError(null);
    setCurrentTopic('');
  };

  const handleBackToLanding = () => {
    setAppState(AppState.LANDING);
    setGeneratedContent(null);
    setError(null);
    setCurrentTopic('');
  };

  const handleNavigateFromLanding = (destination: 'sermon' | 'bible-game' | 'theology-search' | 'biblical-language' | 'theological-journey' | 'theological-dialogue') => {
    switch (destination) {
      case 'sermon':
        setAppState(AppState.INPUT);
        break;
      case 'bible-game':
        setAppState(AppState.BIBLE);
        break;
      case 'theology-search':
        setAppState(AppState.THEOLOGY_SEARCH);
        break;
      case 'biblical-language':
        setAppState(AppState.BIBLICAL_LANGUAGE);
        break;
      case 'theological-journey':
        setAppState(AppState.THEOLOGICAL_JOURNEY);
        break;
      case 'theological-dialogue':
        setAppState(AppState.THEOLOGICAL_DIALOGUE);
        break;
    }
  };

  const handleSavePresentation = (updatedContent: GeneratedPresentation) => {
    if (!currentTopic) return;

    const newSave: SavedPresentation = {
      ...updatedContent,
      id: new Date().toISOString(),
      topic: currentTopic,
      savedAt: new Date().toISOString(),
    };

    const updatedSaves = [...savedPresentations, newSave];
    setSavedPresentations(updatedSaves);
    localStorage.setItem('ai-insights-presentations', JSON.stringify(updatedSaves));
    setGeneratedContent(newSave); // Update content to reflect it's now saved
  };

  const handleLoadPresentation = (presentation: SavedPresentation) => {
    setGeneratedContent(presentation);
    setCurrentTopic(presentation.topic);
    setAppState(AppState.RESULT);
  };
  
  const handleDeletePresentation = (id: string) => {
    const updatedSaves = savedPresentations.filter(p => p.id !== id);
    setSavedPresentations(updatedSaves);
    localStorage.setItem('ai-insights-presentations', JSON.stringify(updatedSaves));
  };

  const handleSaveConfig = (config: SystemPromptConfig) => {
    setSystemPromptConfig(config);
    localStorage.setItem('ai-insights-prompt-config', JSON.stringify(config));
    setAppState(AppState.INPUT); // Go back to the main screen after saving
  }

  const renderContent = () => {
    switch (appState) {
      case AppState.LANDING:
        return <LandingPage onNavigate={handleNavigateFromLanding} />;
      case AppState.BIBLE:
        return <BibleGame onBack={handleBackToLanding} />;
      case AppState.THEOLOGY_SEARCH:
        return <TheologyAssistant onBack={handleBackToLanding} />;
      case AppState.BIBLICAL_LANGUAGE:
        return <BiblicalLanguage onBack={handleBackToLanding} />;
      case AppState.THEOLOGICAL_JOURNEY:
        return <TheologicalJourney onBack={handleBackToLanding} />;
      case AppState.THEOLOGICAL_DIALOGUE:
        return <TheologicalDialogue onBack={handleBackToLanding} />;
      case AppState.LOADING:
        return <LoadingScreen message={loadingMessage} />;
      case AppState.RESULT:
        return generatedContent && <ResultDisplay presentation={generatedContent} topic={currentTopic} onReset={handleReset} onSave={handleSavePresentation} isSaved={'id' in generatedContent} />;
      case AppState.ERROR:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-500 mb-4">{t('common:error.generationFailed')}</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold transition-colors"
            >
              {t('common:button.retryAgain')}
            </button>
          </div>
        );
      case AppState.SAVED:
        return <SavedPresentations
                  presentations={savedPresentations}
                  onLoad={handleLoadPresentation}
                  onDelete={handleDeletePresentation}
                  onBack={handleReset}
               />;
      case AppState.ADMIN:
        return <AdminPanel
                  config={systemPromptConfig}
                  onSave={handleSaveConfig}
                  onBack={handleReset}
               />
      case AppState.INPUT:
      default:
        return <InputForm
                  onGenerate={handleGenerate}
                  selectedEngine={aiEngine}
                  onEngineChange={setAiEngine}
                  onShowSaved={() => setAppState(AppState.SAVED)}
                  onBackToLanding={handleBackToLanding}
                  hasSavedPresentations={savedPresentations.length > 0}
               />;
    }
  };

  const showHeader = appState !== AppState.LANDING && appState !== AppState.BIBLE && appState !== AppState.THEOLOGY_SEARCH && appState !== AppState.BIBLICAL_LANGUAGE && appState !== AppState.THEOLOGICAL_JOURNEY && appState !== AppState.THEOLOGICAL_DIALOGUE;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {showHeader && <Header aiEngine={aiEngine} onShowAdmin={() => setAppState(AppState.ADMIN)} />}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;