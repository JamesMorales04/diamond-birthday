import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * jsdom does not implement window.matchMedia, which is used by useReducedMotion.
 * Provide a stub that returns the default (no-preference) media query state.
 */
window.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})) as unknown as typeof window.matchMedia;

/**
 * jsdom does not implement IntersectionObserver, which is used by the
 * useIntersectionObserver hook. Provide a minimal stub so components
 * render during tests without crashing.
 */
if (typeof window.IntersectionObserver === 'undefined') {
  class MockIntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '0px';
    readonly thresholds: ReadonlyArray<number> = [0];
    constructor(
      private callback: IntersectionObserverCallback,
      _options?: IntersectionObserverInit,
    ) {
      // noop
    }
    observe(_target: Element) {
      // Immediately mark as intersecting so lazy content renders
      this.callback([{ isIntersecting: true, target: _target } as IntersectionObserverEntry], this);
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    value: MockIntersectionObserver,
    writable: true,
    configurable: true,
  });
}

/**
 * jsdom does not provide localStorage in some Node versions.
 * Provide a minimal working implementation.
 */
if (typeof window.localStorage === 'undefined') {
  const createStorageMock = () => {
    let store: Record<string, string> = {};
    return {
      get length() {
        return Object.keys(store).length;
      },
      clear: () => {
        store = {};
      },
      getItem: (key: string) => store[key] ?? null,
      key: (index: number) => Object.keys(store)[index] ?? null,
      removeItem: (key: string) => {
        delete store[key];
      },
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
    } as Storage;
  };
  Object.defineProperty(window, 'localStorage', {
    value: createStorageMock(),
    writable: true,
    configurable: true,
  });
}
