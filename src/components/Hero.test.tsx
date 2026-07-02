import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import { content } from '../content/page';
import { wife } from '../data/wife';
import { tpl } from '../utils/tpl';

describe('Hero', () => {
  it('renders the greeting label on the section', () => {
    render(<Hero />);
    expect(screen.getByLabelText(content.hero.greetingLabel)).toBeInTheDocument();
  });

  it('renders the diamond birthday title', () => {
    render(<Hero />);
    expect(screen.getByText(content.hero.title)).toBeInTheDocument();
  });

  it('renders the wife name', () => {
    render(<Hero />);
    expect(screen.getByText(wife.name)).toBeInTheDocument();
  });

  it('renders the age text from the centralized template', () => {
    render(<Hero />);
    const expected = tpl(content.hero.ageTemplate, { age: wife.age });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('renders the scroll hint', () => {
    render(<Hero />);
    expect(screen.getByText(content.hero.scrollHint)).toBeInTheDocument();
  });

  it('renders the special message from wife data', () => {
    render(<Hero />);
    expect(screen.getByText(wife.specialMessage)).toBeInTheDocument();
  });
});
