import { shuffle } from '../utils/shuffle';

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export const triviaQuestions: TriviaQuestion[] = [
  {
    id: 't1',
    question: 'What was I wearing the day we first met?',
    options: ['A blue jacket', 'That deep red scarf', 'A white shirt', 'A black coat'],
    correctIndex: 1,
    explanation:
      'You were wearing that beautiful deep red scarf — I remember thinking it matched the warmth in your eyes.',
  },
  {
    id: 't2',
    question: 'What was the name of the café on our first date?',
    options: ['The Rustic Bean', 'La Petite Rose', 'Golden Cup', 'The Velvet Spoon'],
    correctIndex: 1,
    explanation: 'La Petite Rose — where I knew, even before the first sip of coffee, that I was falling for you.',
  },
  {
    id: 't3',
    question: 'What song was playing when we had our first dance?',
    options: ['"At Last" by Etta James', '"Can\'t Help Falling in Love" by Elvis', '"Lover" by Taylor Swift', '"Perfect" by Ed Sheeran'],
    correctIndex: 1,
    explanation: '"Can\'t Help Falling in Love" — and I really could not help it. You had me from the very first step.',
  },
  {
    id: 't4',
    question: 'What is my favorite thing to cook for you?',
    options: ['Pasta carbonara', 'Your mother\'s recipe', 'Grilled salmon', 'Chocolate soufflé'],
    correctIndex: 1,
    explanation: 'Your mother\'s recipe — because seeing you smile when you taste it makes all the effort worthwhile.',
  },
  {
    id: 't5',
    question: 'Where did we go on our first vacation together?',
    options: ['The mountains', 'A beach town', 'A big city', 'A countryside cottage'],
    correctIndex: 1,
    explanation: 'That beautiful beach town, where we walked barefoot on the sand and promised to come back every year.',
  },
  {
    id: 't6',
    question: 'What is the nickname I call you when you are being stubborn?',
    options: ['My little star', 'My beautiful storm', 'Sweet troublemaker', 'Darling difficult'],
    correctIndex: 1,
    explanation: '"My beautiful storm" — because even when you are stubborn, you take my breath away.',
  },
  {
    id: 't7',
    question: 'What movie made you cry the most (that I teased you about)?',
    options: ['The Notebook', 'Titanic', 'Up', 'A Star is Born'],
    correctIndex: 0,
    explanation: 'The Notebook — and I pretended to tease you, but secretly I was crying too.',
  },
  {
    id: 't8',
    question: 'What is the one thing I always bring you when you are sick?',
    options: ['Chicken soup', 'Tea with honey', 'Your favorite flowers', 'A warm blanket'],
    correctIndex: 2,
    explanation: 'Your favorite flowers — because even when you are not feeling well, you deserve to smile.',
  },
];

export function getShuffledTrivia(count: number = 5): TriviaQuestion[] {
  return shuffle(triviaQuestions).slice(0, Math.min(count, triviaQuestions.length));
}
