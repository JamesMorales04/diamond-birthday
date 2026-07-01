export interface Letter {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  signature?: string;
}

export const letters: Letter[] = [
  {
    id: 'first-met',
    title: 'The Day I Found You',
    date: 'March 20, 2017',
    excerpt: 'I remember every detail of the moment our eyes first met.',
    content: `I remember it as if it were yesterday — the soft golden light of that March afternoon, the way you laughed at something someone said, and the moment our eyes met across the room. In that instant, something shifted in the universe. I didn't know it then, but my heart had just found its home.

You were wearing that deep red scarf, and your eyes held a warmth I had never seen before. When you smiled, the world seemed to slow down, and everything else faded into a soft blur.

That day, I didn't just meet someone new. I met the person who would become my everything. The person who would teach me what love truly means.`,
    signature: 'Yours, from that very first moment',
  },
  {
    id: 'first-kiss',
    title: 'The First Kiss',
    date: 'April 8, 2017',
    excerpt: 'Under the stars, everything changed.',
    content: `It was a cool spring evening, and we were sitting on that old wooden bench in the park. The stars were just beginning to appear, one by one, like tiny diamonds scattered across velvet. We had been talking for hours — about everything and nothing — and I found myself lost in the sound of your voice.

Then there was a quiet pause, and in that silence, I heard my heart more clearly than I had ever heard anything. I leaned in, and so did you. And when our lips met, it was as if the entire universe held its breath.

That kiss was not just a kiss. It was a promise. A promise of everything we would become.`,
    signature: 'Forever changed by you',
  },
  {
    id: 'through-years',
    title: 'Through All the Years',
    date: 'Anniversary 2025',
    excerpt: 'Every season with you has been a treasure.',
    content: `Eight years. Eight beautiful, challenging, wonderful years. We have built a life together — not a perfect one, but a real one. We have laughed until we could not breathe, held each other through tears, danced in the kitchen at midnight, and built a home that exists not in walls but in the space between us.

I have watched you grow, and you have watched me stumble and rise. We have celebrated triumphs and weathered storms. And through it all, my love for you has only deepened, like a fine wine growing richer with every passing year.

You are my best friend, my confidante, my greatest adventure. Every day with you is a gift I never take for granted.`,
    signature: 'Always and forever yours',
  },
  {
    id: 'birthday-wish',
    title: 'On Your Diamond Birthday',
    date: 'July 15, 2026',
    excerpt: 'Today, we celebrate the most precious gem in my life — you.',
    content: `My dearest love,

On this day, the world celebrates your birth — and I celebrate the light you bring into my life. A diamond birthday marks a milestone, a moment to reflect on the incredible person you are and the beautiful journey that has brought us here.

You are, and have always been, the diamond in my life. Not because of this birthday, but because of who you are: brilliant, resilient, multi-faceted, and utterly irreplaceable. You reflect light in ways that no one else can, turning even the darkest days into something beautiful.

I have prepared this little corner of the internet just for you — a collection of our memories, our love, and a few surprises. May it bring you even half the joy you have brought me.

Happy Diamond Birthday, my love. Here is to forever.`,
    signature: 'With all my heart, always',
  },
];
