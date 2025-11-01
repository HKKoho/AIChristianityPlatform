import { useTranslation } from 'react-i18next';
import type { Location, Quest, Level } from '../biblTypes';

export const useGameData = () => {
  const { t } = useTranslation('bibleGame');

  const quests: Quest[] = [
    {
      id: 'q1',
      character: t('quests.q1.character'),
      characterImage: 'https://picsum.photos/seed/abraham/100',
      question: t('quests.q1.question'),
      options: t('quests.q1.options', { returnObjects: true }) as string[],
      correctAnswerIndex: 1,
      explanation: t('quests.q1.explanation'),
      journalPrompt: {
        title: t('quests.q1.journalTitle'),
        content: t('quests.q1.journalContent')
      },
      deepDive: {
        title: t('quests.q1.deepDiveTitle'),
        content: t('quests.q1.deepDiveContent'),
        sources: t('quests.q1.deepDiveSources', { returnObjects: true }) as Array<{ text: string; url: string }>
      }
    },
    {
      id: 'q2',
      character: t('quests.q2.character'),
      characterImage: 'https://picsum.photos/seed/moses/100',
      question: t('quests.q2.question'),
      options: t('quests.q2.options', { returnObjects: true }) as string[],
      correctAnswerIndex: 2,
      explanation: t('quests.q2.explanation'),
      journalPrompt: {
        title: t('quests.q2.journalTitle'),
        content: t('quests.q2.journalContent')
      },
      deepDive: {
        title: t('quests.q2.deepDiveTitle'),
        content: t('quests.q2.deepDiveContent'),
        sources: t('quests.q2.deepDiveSources', { returnObjects: true }) as Array<{ text: string; url: string }>
      }
    },
    {
      id: 'q5',
      character: t('quests.q5.character'),
      characterImage: 'https://picsum.photos/seed/ezekiel/100',
      question: t('quests.q5.question'),
      options: t('quests.q5.options', { returnObjects: true }) as string[],
      correctAnswerIndex: 2,
      explanation: t('quests.q5.explanation'),
      journalPrompt: {
        title: t('quests.q5.journalTitle'),
        content: t('quests.q5.journalContent')
      },
      deepDive: {
        title: t('quests.q5.deepDiveTitle'),
        content: t('quests.q5.deepDiveContent'),
        sources: t('quests.q5.deepDiveSources', { returnObjects: true }) as Array<{ text: string; url: string }>
      }
    },
    {
      id: 'q3',
      character: t('quests.q3.character'),
      characterImage: 'https://picsum.photos/seed/john/100',
      question: t('quests.q3.question'),
      options: t('quests.q3.options', { returnObjects: true }) as string[],
      correctAnswerIndex: 0,
      explanation: t('quests.q3.explanation'),
      journalPrompt: {
        title: t('quests.q3.journalTitle'),
        content: t('quests.q3.journalContent')
      },
      deepDive: {
        title: t('quests.q3.deepDiveTitle'),
        content: t('quests.q3.deepDiveContent'),
        sources: t('quests.q3.deepDiveSources', { returnObjects: true }) as Array<{ text: string; url: string }>
      }
    },
    {
      id: 'q4',
      character: t('quests.q4.character'),
      characterImage: 'https://picsum.photos/seed/peter/100',
      question: t('quests.q4.question'),
      options: t('quests.q4.options', { returnObjects: true }) as string[],
      correctAnswerIndex: 2,
      explanation: t('quests.q4.explanation'),
      journalPrompt: {
        title: t('quests.q4.journalTitle'),
        content: t('quests.q4.journalContent')
      },
      deepDive: {
        title: t('quests.q4.deepDiveTitle'),
        content: t('quests.q4.deepDiveContent'),
        sources: t('quests.q4.deepDiveSources', { returnObjects: true }) as Array<{ text: string; url: string }>
      }
    },
    {
      id: 'q6',
      character: t('quests.q6.character'),
      characterImage: 'https://picsum.photos/seed/paul/100',
      question: t('quests.q6.question'),
      options: t('quests.q6.options', { returnObjects: true }) as string[],
      correctAnswerIndex: 1,
      explanation: t('quests.q6.explanation'),
      journalPrompt: {
        title: t('quests.q6.journalTitle'),
        content: t('quests.q6.journalContent')
      },
      deepDive: {
        title: t('quests.q6.deepDiveTitle'),
        content: t('quests.q6.deepDiveContent'),
        sources: t('quests.q6.deepDiveSources', { returnObjects: true }) as Array<{ text: string; url: string }>
      }
    }
  ];

  const locations: Location[] = [
    {
      id: 'l1',
      name: t('locations.l1.name'),
      era: t('locations.l1.era'),
      position: { top: '75%', left: '70%' },
      questId: 'q1'
    },
    {
      id: 'l2',
      name: t('locations.l2.name'),
      era: t('locations.l2.era'),
      position: { top: '55%', left: '45%' },
      questId: 'q2',
      dependency: 'l1'
    },
    {
      id: 'l5',
      name: t('locations.l5.name'),
      era: t('locations.l5.era'),
      position: { top: '60%', left: '65%' },
      questId: 'q5',
      dependency: 'l2'
    },
    {
      id: 'l3',
      name: t('locations.l3.name'),
      era: t('locations.l3.era'),
      position: { top: '40%', left: '50%' },
      questId: 'q3',
      dependency: 'l5'
    },
    {
      id: 'l4',
      name: t('locations.l4.name'),
      era: t('locations.l4.era'),
      position: { top: '42%', left: '48%' },
      questId: 'q4',
      dependency: 'l3'
    },
    {
      id: 'l6',
      name: t('locations.l6.name'),
      era: t('locations.l6.era'),
      position: { top: '30%', left: '35%' },
      questId: 'q6',
      dependency: 'l4'
    }
  ];

  const levels: Level[] = [
    {
      id: 'level1',
      name: t('levels.level1.name'),
      locationIds: ['l1', 'l2'],
      discussionPrompts: t('levels.level1.discussionPrompts', { returnObjects: true }) as string[]
    },
    {
      id: 'level2',
      name: t('levels.level2.name'),
      locationIds: ['l5', 'l3'],
      discussionPrompts: t('levels.level2.discussionPrompts', { returnObjects: true }) as string[]
    },
    {
      id: 'level3',
      name: t('levels.level3.name'),
      locationIds: ['l4', 'l6'],
      discussionPrompts: t('levels.level3.discussionPrompts', { returnObjects: true }) as string[]
    }
  ];

  return { quests, locations, levels };
};
