/**
 * Trivia utility — shuffles and returns a subset of trivia questions.
 *
 * Data (triviaQuestions) lives in src/content/page.ts as the canonical source.
 * This file re-exports the data and provides the shuffled-selection helper.
 */
import { shuffle } from '../utils/shuffle';
import { triviaQuestions } from '../content/page';
import type { TriviaQuestion } from '../content/page';

export type { TriviaQuestion } from '../content/page';
export { triviaQuestions } from '../content/page';

export function getShuffledTrivia(count: number = 5): TriviaQuestion[] {
  return shuffle(triviaQuestions).slice(0, Math.min(count, triviaQuestions.length));
}
