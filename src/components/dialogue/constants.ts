import { TheologicalDenomination, DialoguePersona, DialogueSettings, MbtiType, AVAILABLE_VOICES } from '../../../types';
import i18n from '../../config/i18n';

// Helper function to get translated denomination description
export const getDenominationDescription = (denomination: TheologicalDenomination): string => {
  return i18n.t(`dialogue:denomination.${denomination}`);
};

// Helper function to get translated MBTI description
export const getMbtiDescription = (mbti: MbtiType): string => {
  return i18n.t(`dialogue:mbti.${mbti}`);
};

// Legacy exports for backwards compatibility (dynamically fetched)
export const DENOMINATION_DESCRIPTIONS: Record<TheologicalDenomination, string> = new Proxy({} as Record<TheologicalDenomination, string>, {
  get: (target, prop: string) => getDenominationDescription(prop as TheologicalDenomination)
});

export const MBTI_DESCRIPTIONS: Record<MbtiType, string> = new Proxy({} as Record<MbtiType, string>, {
  get: (target, prop: string) => getMbtiDescription(prop as MbtiType)
});

export const getSystemPromptForDenomination = (denomination: TheologicalDenomination, name: string, mbti: MbtiType): string => {
  const description = getDenominationDescription(denomination);
  const mbtiDescription = getMbtiDescription(mbti);

  return i18n.t('dialogue:systemPrompt.baseInstruction', {
    name,
    denomination,
    description,
    mbti,
    mbtiDescription
  });
};

export const ANALYZER_SYSTEM_PROMPT = (): string => {
  return i18n.t('dialogue:systemPrompt.analyzerPrompt');
};

export const DEFAULT_PERSONA: DialoguePersona = {
  id: 'dialogueAI',
  name: 'AugustineAI',
  denomination: TheologicalDenomination.RomanCatholic,
  mbti: MbtiType.INFJ,
  systemPrompt: getSystemPromptForDenomination(TheologicalDenomination.RomanCatholic, 'AugustineAI', MbtiType.INFJ),
  color: '#0284C7',
  voiceName: 'Zephyr',
};

export const THEOLOGIAN_PERSONAS: DialoguePersona[] = [
    { id: 'orthodox', name: 'AthanasiusAI', denomination: TheologicalDenomination.Orthodox, mbti: MbtiType.INFJ, systemPrompt: getSystemPromptForDenomination(TheologicalDenomination.Orthodox, 'AthanasiusAI', MbtiType.INFJ), color: '#D97706', voiceName: 'Kore' },
    { id: 'catholic', name: 'AquinasAI', denomination: TheologicalDenomination.RomanCatholic, mbti: MbtiType.INTJ, systemPrompt: getSystemPromptForDenomination(TheologicalDenomination.RomanCatholic, 'AquinasAI', MbtiType.INTJ), color: '#0284C7', voiceName: 'Charon' },
    { id: 'protestant', name: 'CalvinAI', denomination: TheologicalDenomination.Protestant, mbti: MbtiType.ENTJ, systemPrompt: getSystemPromptForDenomination(TheologicalDenomination.Protestant, 'CalvinAI', MbtiType.ENTJ), color: '#9333EA', voiceName: 'Fenrir' },
    { id: 'baptist', name: 'SpurgeonAI', denomination: TheologicalDenomination.Baptist, mbti: MbtiType.ENFP, systemPrompt: getSystemPromptForDenomination(TheologicalDenomination.Baptist, 'SpurgeonAI', MbtiType.ENFP), color: '#059669', voiceName: 'Puck' },
    { id: 'lutheran', name: 'LutherAI', denomination: TheologicalDenomination.Protestant, mbti: MbtiType.ENTP, systemPrompt: getSystemPromptForDenomination(TheologicalDenomination.Protestant, 'LutherAI', MbtiType.ENTP), color: '#E11D48', voiceName: 'Zephyr' },
];

export const DEFAULT_DIALOGUE_SETTINGS: DialogueSettings = {
  topic: '自由意志與神的主權之本質',
  model: 'kimi-k2:1t-cloud', // Default to most powerful Ollama Cloud model (1T parameters)
  numDebaters: 2,
  userIsParticipant: false,
};
