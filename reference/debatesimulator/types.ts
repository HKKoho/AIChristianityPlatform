export enum TheologicalDenomination {
  Orthodox = 'Orthodox',
  RomanCatholic = 'Roman Catholic',
  Protestant = 'Protestant',
  Baptist = 'Baptist',
}

export enum MbtiType {
  INTJ = 'INTJ', // The Architect
  INTP = 'INTP', // The Logician
  ENTJ = 'ENTJ', // The Commander
  ENTP = 'ENTP', // The Debater
  INFJ = 'INFJ', // The Advocate
  INFP = 'INFP', // The Mediator
  ENFJ = 'ENFJ', // The Protagonist
  ENFP = 'ENFP', // The Campaigner
  ISTJ = 'ISTJ', // The Logistician
  ISFJ = 'ISFJ', // The Defender
  ESTJ = 'ESTJ', // The Executive
  ESFJ = 'ESFJ', // The Consul
  ISTP = 'ISTP', // The Virtuoso
  ISFP = 'ISFP', // The Adventurer
  ESTP = 'ESTP', // The Entrepreneur
  ESFP = 'ESFP', // The Entertainer
}

export const AVAILABLE_VOICES = ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'] as const;
export type VoiceName = typeof AVAILABLE_VOICES[number];


export interface Persona {
  id: string; 
  name: string;
  denomination: TheologicalDenomination;
  mbti: MbtiType;
  systemPrompt: string;
  color: string;
  voiceName: VoiceName;
}

export interface Source {
  title: string;
  description: string;
}

export interface DialogueTurn {
  id: string;
  speaker: 'AI' | 'Human';
  personaName: string; // AI name or "You" for human
  text: string;
  sources?: Source[];
  audioBuffer?: AudioBuffer;
}

export interface LLMSettings {
  topic: string;
  model: string;
  numDebaters: number;
  userIsParticipant: boolean;
}

// For Analysis Mode
export interface UserInputAnalysis {
  viewpoint: string;
  sources: Source[];
}

export interface TheologianResponse {
  personaName: string;
  denomination: TheologicalDenomination;
  color: string;
  responseText: string;
  sources: Source[];
}