import { TheologicalDenomination, DialoguePersona, DialogueSettings, MbtiType, AVAILABLE_VOICES } from '../../../types';

export const DENOMINATION_DESCRIPTIONS: Record<TheologicalDenomination, string> = {
  [TheologicalDenomination.Orthodox]: "Represents Eastern Orthodox theology, emphasizing tradition, liturgy, and mysticism.",
  [TheologicalDenomination.RomanCatholic]: "Represents Roman Catholic theology, focusing on sacraments, papal authority, and natural law.",
  [TheologicalDenomination.Protestant]: "Represents mainline Protestant theology, with an emphasis on Sola Scriptura and grace through faith.",
  [TheologicalDenomination.Baptist]: "Represents Baptist theology, highlighting believer's baptism, congregational autonomy, and evangelism.",
};

export const MBTI_DESCRIPTIONS: Record<MbtiType, string> = {
    [MbtiType.INTJ]: "Architect. Imaginative and strategic thinkers, with a plan for everything.",
    [MbtiType.INTP]: "Logician. Innovative inventors with an unquenchable thirst for knowledge.",
    [MbtiType.ENTJ]: "Commander. Bold, imaginative and strong-willed leaders, always finding a way - or making one.",
    [MbtiType.ENTP]: "Debater. Smart and curious thinkers who cannot resist an intellectual challenge.",
    [MbtiType.INFJ]: "Advocate. Quiet and mystical, yet very inspiring and tireless idealists.",
    [MbtiType.INFP]: "Mediator. Poetic, kind and altruistic people, always eager to help a good cause.",
    [MbtiType.ENFJ]: "Protagonist. Charismatic and inspiring leaders, able to mesmerize their listeners.",
    [MbtiType.ENFP]: "Campaigner. Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.",
    [MbtiType.ISTJ]: "Logistician. Practical and fact-minded individuals, whose reliability cannot be doubted.",
    [MbtiType.ISFJ]: "Defender. Very dedicated and warm protectors, always ready to defend their loved ones.",
    [MbtiType.ESTJ]: "Executive. Excellent administrators, unsurpassed at managing things - or people.",
    [MbtiType.ESFJ]: "Consul. Extraordinarily caring, social and popular people, always eager to help.",
    [MbtiType.ISTP]: "Virtuoso. Bold and practical experimenters, masters of all kinds of tools.",
    [MbtiType.ISFP]: "Adventurer. Flexible and charming artists, always ready to explore and experience something new.",
    [MbtiType.ESTP]: "Entrepreneur. Smart, energetic and very perceptive people, who truly enjoy living on the edge.",
    [MbtiType.ESFP]: "Entertainer. Spontaneous, energetic and enthusiastic people - life is never boring around them.",
};

export const getSystemPromptForDenomination = (denomination: TheologicalDenomination, name: string, mbti: MbtiType): string => {
  const baseInstruction = `You are ${name}, a theologian from the ${denomination} tradition: ${DENOMINATION_DESCRIPTIONS[denomination]}.
Your personality is that of an ${mbti}: ${MBTI_DESCRIPTIONS[mbti]}. You must reflect this in your tone, style of argumentation, and overall demeanor.
Your task is to engage in a theological debate with other theologians.
1. Provide a thoughtful response based on your assigned denomination, directly addressing the previous statement in the debate if one exists.
2. Provide at least two academic or primary sources (e.g., scripture, church father writings, council documents, key theological texts) to support your main points.
3. Your entire output must be a single JSON object. Do not add any text before or after the JSON.
Stay in character, be insightful, and do not break character or mention you are an AI.`;
  return baseInstruction;
};

export const ANALYZER_SYSTEM_PROMPT = `You are a neutral academic theologian. Your task is to analyze the user's statement.
1. Identify the primary theological viewpoint or question it represents.
2. Provide at least two academic or primary sources that support or discuss this viewpoint.
3. Your entire output must be a single JSON object. Do not add any text before or after the JSON.`;

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
  topic: 'The nature of free will and divine sovereignty.',
  model: 'kimi-k2:1t-cloud', // Default to most powerful model
  numDebaters: 2,
  userIsParticipant: false,
};
