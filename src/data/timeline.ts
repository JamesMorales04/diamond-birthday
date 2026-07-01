export interface TimelineEntry {
  year: string;
  month?: string;
  title: string;
  description: string;
  icon?: 'heart' | 'star' | 'diamond' | 'flower' | 'ring';
}

export const timeline: TimelineEntry[] = [
  {
    year: '2017',
    month: 'March',
    title: 'The First Hello',
    description:
      'Our eyes met for the first time, and in that moment, the universe whispered something I would spend the rest of my life understanding.',
    icon: 'heart',
  },
  {
    year: '2017',
    month: 'April',
    title: 'First Kiss',
    description:
      'Under a canopy of stars, everything changed. That kiss was the beginning of our forever.',
    icon: 'star',
  },
  {
    year: '2017',
    month: 'December',
    title: 'First New Year Together',
    description:
      'We welcomed the new year wrapped in each other\'s arms, watching fireworks paint the sky — a promise of all the years to come.',
    icon: 'star',
  },
  {
    year: '2019',
    month: 'Summer',
    title: 'Our First Adventure',
    description:
      'We took our first trip together, discovering not just new places but new parts of ourselves and our love.',
    icon: 'flower',
  },
  {
    year: '2020',
    title: 'Through the Storm',
    description:
      'When the world paused, we grew closer. We built a home, cooked countless meals, and learned that love is not just the grand moments — it is the quiet ones too.',
    icon: 'heart',
  },
  {
    year: '2022',
    month: 'Spring',
    title: 'A New Chapter',
    description:
      'We moved into our dream home, a place where every corner holds a memory and every wall has witnessed our laughter.',
    icon: 'diamond',
  },
  {
    year: '2023',
    month: 'December',
    title: 'Under the Stars',
    description:
      'A magical night camping under the clearest sky, where we made wishes on shooting stars and talked until dawn.',
    icon: 'star',
  },
  {
    year: '2025',
    title: 'Stronger Than Ever',
    description:
      'Eight years in, and my heart still races when you walk into the room. Every day with you is a gift I never take for granted.',
    icon: 'diamond',
  },
  {
    year: '2026',
    month: 'July',
    title: 'Diamond Birthday',
    description:
      'The milestone that celebrates the most precious gem in my life — you. Here is to forever, my love.',
    icon: 'diamond',
  },
];
