// src/content/marketingHooks.ts

export interface TikTokHook {
  id: string;
  category: 'discipline' | 'gamification' | 'habit';
  hookText: string;
  carouselSlides: string[];
  hashtagStack: string[];
}

export const PEAKPACT_TIKTOK_HOOKS: TikTokHook[] = [
  {
    id: 'hook-1',
    category: 'gamification',
    hookText: 'How I turned my boring daily routine into a real-life RPG stat sheet.',
    carouselSlides: [
      'Slide 1: Stop treating habits like chores.',
      'Slide 2: Treat your life like a character build.',
      'Slide 3: Risk your points or lose your streak.',
      'Slide 4: Welcome to PeakPact.'
    ],
    hashtagStack: ['#peakpact', '#gamifyyourlife', '#litrpg', '#habittracker', '#selfimprovement']
  },
  {
    id: 'hook-2',
    category: 'discipline',
    hookText: 'The 75/75 rule that separates high performers from everyone else.',
    carouselSlides: [
      'Slide 1: Discipline isn\'t about motivation.',
      'Slide 2: It\'s about automated progression loops.',
      'Slide 3: Lock in your daily non-negotiables.',
      'Slide 4: Level up your operator rank.'
    ],
    hashtagStack: ['#peakpact', '#discipline', '#deepwork', '#systemsthinking', '#operator']
  }
];