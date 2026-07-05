import { lazy, Suspense } from 'react';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import Letters from './components/Letters';
import Gallery from './components/Gallery';
import Surprise from './components/Surprise';
import HeartButton from './components/HeartButton';
import MemoriesButton from './components/MemoriesButton';
import Footer from './components/Footer';
import { content } from './content/page';

function AppLoading() {
  return (
    <div
      className="app-loading"
      role="status"
      aria-label={content.app.loadingLabel}
    >
      <div className="app-loading__spinner" aria-hidden="true">
        ✦
      </div>
      <p>{content.app.loading}</p>
    </div>
  );
}

// Lazy-load the heavier sections
const LazyTrivia = lazy(() => import('./components/Trivia'));
const LazyScratchCard = lazy(() => import('./components/ScratchCard'));
const LazySpinner = lazy(() => import('./components/Spinner'));
const LazyMiniGames = lazy(() => import('./components/MiniGames'));

export default function App() {
  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        {content.app.skipLink}
      </a>

      <main id="main-content">
        <Hero />
        <Timeline />
        <Letters />
        <Gallery />
        <Surprise />

        <Suspense fallback={<AppLoading />}>
          <LazyTrivia />
        </Suspense>

        <Suspense fallback={<AppLoading />}>
          <LazyScratchCard />
        </Suspense>

        <Suspense fallback={<AppLoading />}>
          <LazySpinner />
        </Suspense>

        <Suspense fallback={<AppLoading />}>
          <LazyMiniGames />
        </Suspense>

        <Footer />
      </main>

      <MemoriesButton />
      <HeartButton />
    </div>
  );
}
