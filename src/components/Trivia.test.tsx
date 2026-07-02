import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Trivia from './Trivia';
import { content } from '../content/page';
import { triviaQuestions } from '../data/trivia';
import { tpl } from '../utils/tpl';

// Mock shuffle to return questions in deterministic order
vi.mock('../utils/shuffle', () => ({
  shuffle: <T,>(arr: T[]): T[] => arr,
}));

// Trivia component calls getShuffledTrivia(6). With identity shuffle,
// the first 8 questions from triviaQuestions are available; component
// requests 6, so 6 questions are rendered.
const questionCount = Math.min(6, triviaQuestions.length);

describe('Trivia', () => {
  it('renders the trivia section title from centralized content', () => {
    render(<Trivia />);
    expect(screen.getByText(content.trivia.title)).toBeInTheDocument();
  });

  it('renders the trivia subtitle from centralized content', () => {
    render(<Trivia />);
    expect(screen.getByText(content.trivia.subtitle)).toBeInTheDocument();
  });

  it('renders the first question text from trivia data', () => {
    render(<Trivia />);
    expect(screen.getByText(triviaQuestions[0].question)).toBeInTheDocument();
  });

  it('renders answer options for the first question from trivia data', () => {
    render(<Trivia />);
    for (const option of triviaQuestions[0].options) {
      expect(screen.getByText(option)).toBeInTheDocument();
    }
  });

  it('renders the progress counter from the centralized template', () => {
    render(<Trivia />);
    const expected = tpl(content.trivia.ofTemplate, { current: 1, total: questionCount });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('renders the radiogroup with the centralized label', () => {
    render(<Trivia />);
    expect(screen.getByLabelText(content.trivia.progressLabel)).toBeInTheDocument();
  });

  it('shows the next question button after answering', async () => {
    const user = userEvent.setup();
    render(<Trivia />);

    await user.click(screen.getAllByRole('radio')[0]);

    expect(screen.getByText(content.trivia.nextQuestion)).toBeInTheDocument();
  });

  it('shows explanation after answering using data from trivia', async () => {
    const user = userEvent.setup();
    render(<Trivia />);

    await user.click(screen.getAllByRole('radio')[0]);

    // First question's explanation from trivia data
    expect(
      screen.getByText(triviaQuestions[0].explanation!),
    ).toBeInTheDocument();
  });

  it('navigates to the next question', async () => {
    const user = userEvent.setup();
    render(<Trivia />);

    await user.click(screen.getAllByRole('radio')[0]);
    await user.click(screen.getByText(content.trivia.nextQuestion));

    // Second question should now be visible
    expect(screen.getByText(triviaQuestions[1].question)).toBeInTheDocument();
  });

  it('shows the "See Results" button after answering the last question', async () => {
    const user = userEvent.setup();
    render(<Trivia />);

    // Answer all questionCount questions
    for (let i = 0; i < questionCount; i++) {
      await user.click(screen.getAllByRole('radio')[0]);
      const seeResultsBtn = screen.queryByText(content.trivia.seeResults);
      if (seeResultsBtn) break;
      await user.click(screen.getByText(content.trivia.nextQuestion));
    }

    expect(screen.getByText(content.trivia.seeResults)).toBeInTheDocument();
  });

  it('shows the results screen with play-again after finishing all questions', async () => {
    const user = userEvent.setup();
    render(<Trivia />);

    // Answer all questionCount questions and advance to results
    for (let i = 0; i < questionCount; i++) {
      await user.click(screen.getAllByRole('radio')[0]);
      const seeResultsBtn = screen.queryByText(content.trivia.seeResults);
      if (seeResultsBtn) {
        await user.click(seeResultsBtn);
        break;
      }
      await user.click(screen.getByText(content.trivia.nextQuestion));
    }

    expect(screen.getByText(content.trivia.playAgain)).toBeInTheDocument();
  });
});
