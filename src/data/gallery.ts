export interface GalleryImage {
  id: string;
  src: string;
  thumb: string;
  alt: string;
  caption?: string;
  category: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  description: string;
}

export const galleryCategories: GalleryCategory[] = [
  {
    id: 'journey',
    name: 'Our Journey',
    description: 'The places we have been and the memories we have made.',
  },
  {
    id: 'moments',
    name: 'Sweet Moments',
    description: 'Everyday magic — the small moments that mean everything.',
  },
  {
    id: 'forever',
    name: 'Forever Yours',
    description: 'Symbols of our love and commitment to each other.',
  },
];

export const galleryImages: GalleryImage[] = [
  // Journey
  {
    id: 'journey-1',
    src: '/photos/journey-1.svg',
    thumb: '/photos/journey-1.svg',
    alt: 'A sunset over rolling hills, representing our travels together',
    caption: 'Watching the sunset on our first trip — the world felt like it was ours.',
    category: 'journey',
  },
  {
    id: 'journey-2',
    src: '/photos/journey-2.svg',
    thumb: '/photos/journey-2.svg',
    alt: 'A cozy cabin in the mountains',
    caption: 'Our mountain getaway — hot cocoa, warm blankets, and endless conversations.',
    category: 'journey',
  },
  {
    id: 'journey-3',
    src: '/photos/journey-3.svg',
    thumb: '/photos/journey-3.svg',
    alt: 'A beach at golden hour',
    caption: 'Walking hand in hand along the shore, writing our names in the sand.',
    category: 'journey',
  },
  {
    id: 'journey-4',
    src: '/photos/journey-4.svg',
    thumb: '/photos/journey-4.svg',
    alt: 'A vibrant city street at night',
    caption: 'Getting lost in the city lights — our favorite kind of adventure.',
    category: 'journey',
  },
  // Moments
  {
    id: 'moments-1',
    src: '/photos/moments-1.svg',
    thumb: '/photos/moments-1.svg',
    alt: 'A candlelit dinner setting',
    caption: 'That perfect dinner where we talked until the restaurant closed.',
    category: 'moments',
  },
  {
    id: 'moments-2',
    src: '/photos/moments-2.svg',
    thumb: '/photos/moments-2.svg',
    alt: 'Two cups of coffee on a rainy window sill',
    caption: 'Rainy Sundays with you are my favorite days.',
    category: 'moments',
  },
  {
    id: 'moments-3',
    src: '/photos/moments-3.svg',
    thumb: '/photos/moments-3.svg',
    alt: 'A bouquet of wildflowers',
    caption: 'Wildflowers picked just for you — because you deserve all the beauty.',
    category: 'moments',
  },
  {
    id: 'moments-4',
    src: '/photos/moments-4.svg',
    thumb: '/photos/moments-4.svg',
    alt: 'A cozy reading nook with fairy lights',
    caption: 'Our little sanctuary — books, tea, and each other.',
    category: 'moments',
  },
  // Forever
  {
    id: 'forever-1',
    src: '/photos/forever-1.svg',
    thumb: '/photos/forever-1.svg',
    alt: 'Two intertwined rings',
    caption: 'Two hearts, one journey, forever intertwined.',
    category: 'forever',
  },
  {
    id: 'forever-2',
    src: '/photos/forever-2.svg',
    thumb: '/photos/forever-2.svg',
    alt: 'A diamond sparkling in warm light',
    caption: 'Like a diamond, our love grows more brilliant with every passing year.',
    category: 'forever',
  },
  {
    id: 'forever-3',
    src: '/photos/forever-3.svg',
    thumb: '/photos/forever-3.svg',
    alt: 'A heart-shaped lock on a bridge',
    caption: 'Locking our love to the world — a promise that will never be broken.',
    category: 'forever',
  },
  {
    id: 'forever-4',
    src: '/photos/forever-4.svg',
    thumb: '/photos/forever-4.svg',
    alt: 'Silhouette of a couple embracing at sunset',
    caption: 'In your arms is where I belong. Always.',
    category: 'forever',
  },
];
