import { lazy, Suspense } from 'react';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import Letters from './components/Letters';
import Gallery from './components/Gallery';
import Surprise from './components/Surprise';
import MemoriesButton from './components/MemoriesButton';
import Footer from './components/Footer';

function AppLoading() {
  return (
    <div className="app-loading" role="status" aria-label="Loading application">
      <div className="app-loading__spinner" aria-hidden="true">✦</div>
      <p>Loading...</p>
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
        Skip to main content
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
    </div>
  );
}
