import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Surprise from './Surprise';
import { content } from '../content/page';

describe('Surprise', () => {
  it('renders the surprise section title from centralized content', () => {
    render(<Surprise />);
    expect(screen.getByText(content.surprise.title)).toBeInTheDocument();
  });

  it('renders the prompt text before revealing', () => {
    render(<Surprise />);
    expect(screen.getByText(content.surprise.prompt)).toBeInTheDocument();
  });

  it('renders the reveal button before revealing', () => {
    render(<Surprise />);
    expect(screen.getByText(content.surprise.revealButton)).toBeInTheDocument();
  });

  it('shows the headline after reveal button is clicked', async () => {
    const user = userEvent.setup();
    render(<Surprise />);

    await user.click(screen.getByText(content.surprise.revealButton));

    expect(screen.getByText(content.surprise.headline)).toBeInTheDocument();
  });

  it('shows the first message after reveal', async () => {
    const user = userEvent.setup();
    render(<Surprise />);

    await user.click(screen.getByText(content.surprise.revealButton));

    expect(screen.getByText(content.surprise.message1)).toBeInTheDocument();
  });

  it('shows the second message after reveal', async () => {
    const user = userEvent.setup();
    render(<Surprise />);

    await user.click(screen.getByText(content.surprise.revealButton));

    expect(screen.getByText(content.surprise.message2)).toBeInTheDocument();
  });

  it('shows the signature after reveal', async () => {
    const user = userEvent.setup();
    render(<Surprise />);

    await user.click(screen.getByText(content.surprise.revealButton));

    expect(screen.getByText(content.surprise.signature)).toBeInTheDocument();
  });

  it('hides the prompt after reveal', async () => {
    const user = userEvent.setup();
    render(<Surprise />);

    await user.click(screen.getByText(content.surprise.revealButton));

    expect(screen.queryByText(content.surprise.prompt)).not.toBeInTheDocument();
  });
});
