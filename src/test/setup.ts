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
