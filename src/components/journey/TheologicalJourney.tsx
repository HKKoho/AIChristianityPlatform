import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Timeline from './Timeline';
import Editor from './Editor';
import Dialogue from './Dialogue';
import MindMap from './MindMap';
import { STAGES } from './constants';
import { JourneyStage, TheologicalPerspective, ChatMessage, MindMapData } from './journeyTypes';
import * as geminiService from '../../../services/geminiService';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

interface TheologicalJourneyProps {
  onBack: () => void;
}

const TheologicalJourney: React.FC<TheologicalJourneyProps> = ({ onBack }) => {
  const { t } = useTranslation(['common', 'journey']);
  const [currentStage, setCurrentStage] = useState<JourneyStage>(JourneyStage.InitialConcept);
  const [journalEntries, setJournalEntries] = useState<Record<JourneyStage, string>>({
    [JourneyStage.InitialConcept]: '',
    [JourneyStage.CreedContrast]: '',
    [JourneyStage.BiblicalInterpretation]: '',
    [JourneyStage.DoubtPhase]: '',
    [JourneyStage.Revelation]: '',
  });
  const [dialogueHistory, setDialogueHistory] = useState<ChatMessage[]>([]);
  const [currentPerspective, setCurrentPerspective] = useState<TheologicalPerspective>(TheologicalPerspective.Socratic);
  const [mindMapData, setMindMapData] = useState<MindMapData>({ nodes: [], links: [] });
  const [isDialogueLoading, setIsDialogueLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const activeStage = useMemo(() => STAGES.find(s => s.key === currentStage)!, [currentStage]);
  const activeJournalText = journalEntries[currentStage];

  const handleTextChange = (text: string) => {
    setJournalEntries(prev => ({ ...prev, [currentStage]: text }));
  };

  const handleDialogueSubmit = async (message: string) => {
    const userMessage: ChatMessage = { role: 'user', content: message };
    const historyForApi = [...dialogueHistory];

    setDialogueHistory(prev => [...prev, userMessage]);
    setIsDialogueLoading(true);

    try {
      // Using geminiService for Socratic dialogue
      const response = await geminiService.generateSocraticResponse(historyForApi, currentPerspective, message);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setDialogueHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error fetching dialogue response:", error);
      const errorMessage: ChatMessage = { role: 'model', content: t('common:error.sorry') };
      setDialogueHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsDialogueLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!activeJournalText) return;
    setIsProcessing(true);
    try {
        const refinedText = await geminiService.refineTheologicalText(activeJournalText, activeStage.title);
        handleTextChange(refinedText);
    } catch (error) {
        console.error("Error refining text:", error);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleGetCitations = async () => {
      if (!activeJournalText) return;
      setIsProcessing(true);
      try {
          const result = await geminiService.generateCitations(activeJournalText);
          handleTextChange(activeJournalText + '\n\n--- Citations ---\n' + result);
      } catch (error) {
          console.error("Error getting citations:", error);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleGenerateMindMap = async () => {
    if (!activeJournalText) return;
    setIsProcessing(true);
    try {
        const data = await geminiService.generateMindMapFromText(activeJournalText);
        setMindMapData(data);
    } catch (error) {
        console.error("Error generating mind map:", error);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 text-slate-200 flex flex-col font-sans">
      <header className="p-4 border-b border-slate-700 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
        >
          {t('common:button.backToMenu')}
        </button>
        <h1 className="text-2xl font-bold text-center flex-1">{t('journey:heading.theologistThoughtMap')}</h1>
        <div className="flex-1 flex items-center justify-end gap-4">
          <LanguageSwitcher />
          <span className="text-xs text-slate-400">Powered by Gemini AI</span>
        </div>
      </header>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-12 lg:grid-cols-10 gap-0 overflow-hidden">
        <div className="md:col-span-3 lg:col-span-2 overflow-y-auto">
          <Timeline
            stages={STAGES}
            currentStage={currentStage}
            onSelectStage={setCurrentStage}
          />
        </div>
        <div className="md:col-span-9 lg:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          <div className="overflow-y-auto">
            <Editor
              text={activeJournalText}
              onTextChange={handleTextChange}
              stage={activeStage}
              onRefine={handleRefine}
              onGetCitations={handleGetCitations}
              onGenerateMindMap={handleGenerateMindMap}
              isProcessing={isProcessing}
            />
          </div>
          <div className="grid grid-rows-2 gap-0 overflow-hidden">
            <div className="overflow-y-auto">
                <Dialogue
                    history={dialogueHistory}
                    perspective={currentPerspective}
                    onPerspectiveChange={setCurrentPerspective}
                    onSubmit={handleDialogueSubmit}
                    isLoading={isDialogueLoading}
                />
            </div>
            <div className="overflow-y-auto">
                <MindMap data={mindMapData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheologicalJourney;
