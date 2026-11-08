export type Challenge = {
  id: string;
  title: string;
  type: 'guess' | 'conversation' | 'mission' | 'choice';
  prompt: string;
  choices?: string[];
  xp: number;
};

export const chapters = [
  'The Beginning',
  'The Little Things',
  'Love & Affection',
  'Better Together',
  'Heart to Heart',
  'Keeping the Spark',
  'Our Future',
  'Stronger Together',
];

// Hand-authored starter activities. These are demos, not yet the final 100-item content set.
export const firstChapter: Challenge[] = [
  { id: 'c1', title: 'The Perfect Weekend', type: 'guess', prompt: 'What would your partner most enjoy doing this Saturday?', choices: ['A cozy day at home', 'Exploring somewhere new', 'A night out', 'Time outdoors'], xp: 100 },
  { id: 'c2', title: 'Our First Impression', type: 'conversation', prompt: 'What did you notice first about your partner? Share a detail they might not know.', xp: 100 },
  { id: 'c3', title: 'A Little Surprise', type: 'mission', prompt: 'Do one small, thoughtful thing for your partner today. Tell them why you chose it.', xp: 150 },
  { id: 'c4', title: 'This or That', type: 'choice', prompt: 'Pick the date you would most enjoy together.', choices: ['Coffee and a walk', 'Cooking together', 'Live music', 'A movie night'], xp: 100 },
  { id: 'c5', title: 'The Memory Lane', type: 'conversation', prompt: 'Describe a moment with your partner that always makes you smile.', xp: 100 },
];
