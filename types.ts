export enum AppState {
  LANDING = 'LANDING',
  INPUT = 'INPUT',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
  SAVED = 'SAVED',
  ADMIN = 'ADMIN',
  BIBLE = 'BIBLE',
  THEOLOGY_SEARCH = 'THEOLOGY_SEARCH',
  JAPANESE_BIBLICAL = 'JAPANESE_BIBLICAL',
  BIBLICAL_LANGUAGE = 'BIBLICAL_LANGUAGE',
  THEOLOGICAL_JOURNEY = 'THEOLOGICAL_JOURNEY',
  THEOLOGICAL_DIALOGUE = 'THEOLOGICAL_DIALOGUE',
}

export enum AiEngine {
  GEMINI = 'Google Gemini',
  LOCAL_LLM = 'Local LLM',
}

export enum SermonBasis {
  BIBLICAL_STUDY = '聖經研究',
  CHURCH_HISTORY = '教會歷史',
  SYSTEMATIC_THEOLOGY = '系統神學',
}

export enum SermonLength {
  THREE_MIN = '3',
  FIVE_MIN = '5',
  TEN_MIN = '10'
}

export const SERMON_LENGTH_OPTIONS: SermonLength[] = [
  SermonLength.THREE_MIN,
  SermonLength.FIVE_MIN,
  SermonLength.TEN_MIN
];

export interface SlideContent {
  title: string;
  talkingPoints: string[];
  speakerNotes: string;
  imagePrompt: string;
}

export interface GeneratedSlide extends SlideContent {
  backgroundUrl: string;
}

export interface GeneratedPresentation {
  slides: GeneratedSlide[];
  speakerImageUrl: string;
  audienceImageUrl: string;
  fullScript: string;
  summary: string;
}

export interface SavedPresentation extends GeneratedPresentation {
  id: string;
  topic: string;
  savedAt: string;
}

export interface SystemPromptConfig {
  personaEnabled: boolean;
  ethics: 'principled' | 'pragmatic' | 'neutral';
  politicalStand: 'neutral' | 'centrist' | 'left-leaning' | 'right-leaning';
  powerfulness: 'subtle' | 'direct' | 'authoritative';
  sentiment: 'optimistic' | 'neutral' | 'realistic' | 'pessimistic';
  personality: string;
  empathy: 'low' | 'medium' | 'high';
}

export const DEFAULT_SYSTEM_PROMPT_CONFIG: SystemPromptConfig = {
  personaEnabled: true,
  ethics: 'principled',
  politicalStand: 'neutral',
  powerfulness: 'direct',
  sentiment: 'optimistic',
  personality: 'An insightful and engaging AI assistant, expert in theology and communication.',
  empathy: 'medium',
};

// Bible Game Types
export enum BibleVersion {
  NIV = "NIV",
  ESV = "ESV",
  KJV = "KJV",
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
}

export interface Quest {
  id: string;
  character: string;
  characterImage: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  journalPrompt: {
    title: string;
    content: string;
  };
  deepDive: {
    title: string;
    content: string;
    sources: {
      text: string;
      url: string;
    }[];
  };
}

export interface BibleLocation {
  id: string;
  name: string;
  era: string;
  position: { top: string; left: string };
  questId: string;
  dependency?: string;
}

export interface Level {
  id: string;
  name: string;
  locationIds: string[];
  discussionPrompts: string[];
}

export interface GameContextType {
  completedQuests: Set<string>;
  unlockedLocations: Set<string>;
  journalEntries: JournalEntry[];
  bibleVersion: BibleVersion;
  isFreeChoiceMode: boolean;
  completeQuest: (questId: string, journalEntry: JournalEntry) => void;
  setBibleVersion: (version: BibleVersion) => void;
  setIsFreeChoiceMode: (mode: boolean) => void;
}

// Theology Assistant Types
export enum TheologyAssistantMode {
  THEOLOGY_CHAT = 'Theology Chat',
  READING_QA = 'Reading Q&A',
  ASSIGNMENT_ASSISTANT = 'Assignment Assistant',
  RESOURCE_SEARCH = 'Resource Search'
}

export enum AssignmentStage {
  INPUT = 'input',
  PLANNING = 'planning',
  DRAFTING = 'drafting',
  CRITIQUING = 'critiquing',
  REVISING = 'revising'
}

export enum AcademicLevel {
  UNDERGRADUATE = 'undergraduate',
  GRADUATE = 'graduate',
  DOCTORAL = 'doctoral',
  GENERAL = 'general'
}

export interface AssignmentPlan {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
}

export interface AssignmentDraft {
  id: string;
  topic: string;
  content: string;
  stage: AssignmentStage;
  revisionNumber: number;
  createdAt: string;
}

export interface AssignmentCritique {
  content: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

export interface DocumentSummary {
  content: string;
  keyPoints: string[];
  themes: string[];
}

export interface UploadedDocument {
  name: string;
  content: string;
  type: 'pdf' | 'docx' | 'txt' | 'md';
  summary?: DocumentSummary;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LocalLLMModel {
  id: string;
  name: string;
  size: string;
  description: string;
  hasVision?: boolean;
}

export interface TheologyAssistantState {
  mode: TheologyAssistantMode;
  messages: ChatMessage[];
  documents: UploadedDocument[];
  documentSummary?: DocumentSummary;

  // Assignment Assistant specific
  assignmentTopic: string;
  theologyArea: string;
  academicLevel: AcademicLevel;
  assignmentLength: number;
  assignmentTone: string;
  assignmentStage: AssignmentStage;
  currentPlan?: AssignmentPlan;
  currentDraft?: AssignmentDraft;
  currentCritique?: AssignmentCritique;
  revisionNumber: number;
  maxRevisions: number;

  // Model configuration
  selectedModel: string;
  temperature: number;
  topP: number;
  isProcessing: boolean;
}

// Sermon generation specific LLM models
// Priority Chain: kimi-k2:1t-cloud → qwen-coder:480b-cloud → Gemini → GPT-4o
export const SERMON_LLM_MODELS: LocalLLMModel[] = [
  // PRIMARY: Ollama Cloud - Kimi K2
  {
    id: 'kimi-k2:1t-cloud',
    name: 'Kimi K2 1T Cloud ☁️ (Primary)',
    size: 'Cloud (1T)',
    description: '🥇 主要模型：超大參數模型，極致的理解和生成能力，最適合深度神學分析'
  },
  // SECONDARY: Ollama Cloud - Qwen Coder
  {
    id: 'qwen-coder:480b-cloud',
    name: 'Qwen Coder 480B Cloud ☁️ (Secondary)',
    size: 'Cloud (480B)',
    description: '🥈 備用模型：超大規模編碼模型，適合結構化講道內容生成'
  },
  // Other Ollama Cloud Models
  {
    id: 'gpt-oss:120b',
    name: 'GPT-OSS 120B Cloud ☁️',
    size: 'Cloud (120B)',
    description: '大型雲端模型，適合複雜的神學分析和深入講道'
  },
  {
    id: 'deepseek-v3.1:671b',
    name: 'DeepSeek V3.1 671B Cloud ☁️',
    size: 'Cloud (671B)',
    description: '超大規模模型，頂級推理能力，適合高難度神學論證'
  },
  {
    id: 'qwen3-coder:480b',
    name: 'Qwen3 Coder 480B Cloud ☁️',
    size: 'Cloud (480B)',
    description: '超大規模編碼模型，適合結構化講道內容生成'
  },
  {
    id: 'gpt-oss:20b',
    name: 'GPT-OSS 20B Cloud ☁️',
    size: 'Cloud (20B)',
    description: '雲端模型，平衡效能和速度，適合一般講道生成'
  },
  // Local Models (locally installed)
  {
    id: 'qwen2.5vl:32b',
    name: 'Qwen 2.5 VL 32B (本地)',
    size: '32 GB',
    description: '中英雙語視覺語言模型，適合繁體中文講道',
    hasVision: true
  },
  {
    id: 'llama4:scout',
    name: 'Llama 4 Scout (本地)',
    size: '67 GB',
    description: '最新版本，適合深度神學分析和複雜講道結構'
  },
  {
    id: 'mistral-small:24b',
    name: 'Mistral Small 24B (本地)',
    size: '14 GB',
    description: '高效率小型模型，快速生成講道內容'
  },
  {
    id: 'llama3.3:latest',
    name: 'Llama 3.3 (本地)',
    size: '42 GB',
    description: '高性能通用模型，平衡質量與效率'
  },
  {
    id: 'llava:34b',
    name: 'LLaVA 34B (本地)',
    size: '20 GB',
    description: '多模態模型，支援視覺分析，適合包含圖像的講道內容',
    hasVision: true
  },
  {
    id: 'deepseek-r1:32b',
    name: 'DeepSeek R1 32B (本地)',
    size: '19 GB',
    description: '推理能力強，適合邏輯性神學論證和釋經'
  },
  {
    id: 'llama3.2-vision:latest',
    name: 'Llama 3.2 Vision (本地)',
    size: '7.9 GB',
    description: '輕量級視覺模型，快速處理視覺內容',
    hasVision: true
  }
];

// Alias for backward compatibility
export const OLLAMA_MODELS = SERMON_LLM_MODELS;

export interface SermonGenerationState {
  selectedLLMModel: string;
  temperature: number;
  topP: number;
}

// Local LLM Configuration
export interface LocalLLMConfig {
  model: string;
  temperature: number;
  topP: number;
}

// Multi-Provider System Types
export enum AIProvider {
  OLLAMA = 'ollama',
  GEMINI = 'gemini',
  OPENAI = 'openai'
}

export interface ProviderConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  apiUrl?: string;
}

export interface MultiProviderConfig {
  providers: ProviderConfig[];
  defaultProvider: AIProvider;
}

// Default LocalLLM Config
export const DEFAULT_LOCAL_LLM_CONFIG: LocalLLMConfig = {
  model: 'kimi-k2:1t-cloud', // Primary model
  temperature: 0.7,
  topP: 0.9
};

// Theological Dialogue Types
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

export interface DialoguePersona {
  id: string;
  name: string;
  denomination: TheologicalDenomination;
  mbti: MbtiType;
  systemPrompt: string;
  color: string;
  voiceName: VoiceName;
}

export interface DialogueSource {
  title: string;
  description: string;
}

export interface DialogueTurn {
  id: string;
  speaker: 'AI' | 'Human';
  personaName: string; // AI name or "You" for human
  text: string;
  sources?: DialogueSource[];
  audioBuffer?: AudioBuffer;
}

export interface DialogueSettings {
  topic: string;
  model: string;
  numDebaters: number;
  userIsParticipant: boolean;
}

// For Analysis Mode
export interface UserInputAnalysis {
  viewpoint: string;
  sources: DialogueSource[];
}

export interface TheologianResponse {
  personaName: string;
  denomination: TheologicalDenomination;
  color: string;
  responseText: string;
  sources: DialogueSource[];
}