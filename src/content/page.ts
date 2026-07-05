/**
 * Canonical content wrapper backed by src/content/page.json.
 * Keep the JSON as the source of truth; this file preserves the existing API.
 */

import page from './page.json';
import type { GameId } from '../data/gameRegistry';

export interface Letter {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  signature?: string;
}

export interface TimelineEntry {
  year: string;
  month?: string;
  title: string;
  description: string;
  icon?: 'heart' | 'star' | 'diamond' | 'flower' | 'ring';
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

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

export interface WifeInfo {
  name: string;
  petName: string;
  age: number;
  birthday: string;
  birthstone: string;
  favoriteColor: string;
  yearsTogether: number;
  anniversary: string;
  specialMessage: string;
}

export interface AppContent {
  loading: string;
  loadingLabel: string;
  skipLink: string;
}

export interface HeroContent {
  greetingLabel: string;
  title: string;
  ageTemplate: string;
  scrollHint: string;
}

export interface SimpleSectionContent {
  title: string;
  subtitle: string;
}

export interface GalleryContent {
  title: string;
  subtitle: string;
  tablistLabel: string;
  allTab: string;
  emptyCategory: string;
  errorTitle: string;
  errorDesc: string;
  openPhotoTemplate: string;
}

export interface GalleryModalContent {
  closeViewer: string;
  prevPhoto: string;
  nextPhoto: string;
  ofTemplate: string;
  photoAriaLabel: string;
  loadError: string;
}

export interface SurpriseContent {
  title: string;
  prompt: string;
  revealButton: string;
  headline: string;
  message1: string;
  message2: string;
  signature: string;
}

export interface MemoriesButtonContent {
  buttonLabel: string;
  buttonText: string;
  overlayLabel: string;
  closeLabel: string;
}

export interface FooterContent {
  line1: string;
  line2: string;
}

export interface TriviaContent {
  title: string;
  subtitle: string;
  progressLabel: string;
  nextQuestion: string;
  seeResults: string;
  playAgain: string;
  perfect: string;
  good: string;
  tryAgain: string;
  noQuestions: string;
  scoreTemplate: string;
  ofTemplate: string;
}

export interface SpinnerOption {
  label: string;
}

export interface SpinnerContent {
  title: string;
  subtitle: string;
  spinning: string;
  spinButton: string;
  resultTemplate: string;
  ariaSpinning: string;
  ariaResultTemplate: string;
  ariaDefault: string;
  options: readonly SpinnerOption[];
}

export interface MiniGameEntry {
  id: GameId;
  name: string;
  desc: string;
}

export interface MiniGamesContent {
  title: string;
  subtitle: string;
  playTemplate: string;
  loading: string;
  loadingLabel: string;
  games: readonly MiniGameEntry[];
}

export interface GamesContent {
  backText: string;
}

export interface ScratchCardContent {
  title: string;
  subtitle: string;
  scratchHere: string;
  scratchHint: string;
  hiddenMessage: string;
  ariaHiddenLabel: string;
}

export interface GameMemoryMatchContent {
  title: string;
  backLabel: string;
  hiddenCardLabel: string;
  revealedCardLabel: string;
  matchedCardLabel: string;
  restartLabel: string;
  hint: string;
  movesLabel: string;
  matchedLabel: string;
  bestLabel: string;
  bestDash: string;
  winTitle: string;
  winText: string;
  playAgain: string;
  gridLabel: string;
}

export interface GameFlappyContent {
  title: string;
  backLabel: string;
  ariaLabel: string;
  canvasGameOver: string;
  canvasScoreTemplate: string;
  canvasTapRestart: string;
  canvasBestTemplate: string;
  hint: {
    idle: string;
    playing: string;
    over: string;
  };
}

export interface GameLaneRunnerContent {
  title: string;
  backLabel: string;
  ariaLabel: string;
  moveLeft: string;
  moveRight: string;
  moveUp: string;
  moveDown: string;
  controlsHint: string;
  hint: string;
  canvasStart: string;
  canvasGameOver: string;
  canvasScoreTemplate: string;
  canvasRestart: string;
  canvasBestTemplate: string;
  canvasJumpHint: string;
  canvasSlideHint: string;
  pauseLabel: string;
  canvasPaused: string;
  canvasResumeHint: string;
}

export interface ContentData {
  app: AppContent;
  hero: HeroContent;
  timeline: SimpleSectionContent;
  letters: SimpleSectionContent;
  gallery: GalleryContent;
  galleryModal: GalleryModalContent;
  surprise: SurpriseContent;
  memoriesButton: MemoriesButtonContent;
  footer: FooterContent;
  trivia: TriviaContent;
  spinner: SpinnerContent;
  miniGames: MiniGamesContent;
  games: GamesContent;
  scratchCard: ScratchCardContent;
  gameMemoryMatch: GameMemoryMatchContent;
  gameFlappy: GameFlappyContent;
  gameLaneRunner: GameLaneRunnerContent;
}

type PageData = {
  letters: Letter[];
  timeline: TimelineEntry[];
  triviaQuestions: TriviaQuestion[];
  galleryCategories: GalleryCategory[];
  galleryImages: GalleryImage[];
  wife: WifeInfo;
  content: ContentData;
};

const data = page as PageData;

export const letters = data.letters ?? [];
export const timeline = data.timeline ?? [];
export const triviaQuestions = data.triviaQuestions ?? [];
export const galleryCategories = data.galleryCategories ?? [];
export const galleryImages = data.galleryImages ?? [];
export const wife = data.wife;
export const content = data.content;

export type Content = ContentData;
