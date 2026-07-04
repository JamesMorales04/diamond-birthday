import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Creates a minimal localStorage mock.
 * Vitest + jsdom already provides localStorage, but we replace it
 * with a controllable mock to verify read/write calls explicitly.
 */
function createMockStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
}

let mockStorage: ReturnType<typeof createMockStorage>;

beforeEach(() => {
  mockStorage = createMockStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    mockStorage.clear();
    vi.clearAllMocks();
  });

  it('returns default value when key does not exist in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('reads an existing value from localStorage', () => {
    mockStorage.getItem.mockReturnValueOnce('"stored-value"');
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'fallback'),
    );
    expect(result.current[0]).toBe('stored-value');
    expect(mockStorage.getItem).toHaveBeenCalledWith('test-key');
  });

  it('stores a value and persists it to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('persist-key', 0));
    act(() => {
      result.current[1](42);
    });
    expect(result.current[0]).toBe(42);
    expect(mockStorage.setItem).toHaveBeenCalledWith('persist-key', '42');
  });

  it('supports a function updater', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    act(() => {
      result.current[1](10);
    });
    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });
    expect(result.current[0]).toBe(11);
  });

  it('preserves value across re-renders', () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage('sticky', 'initial'),
    );
    act(() => {
      result.current[1]('updated');
    });
    rerender();
    expect(result.current[0]).toBe('updated');
  });

  it('falls back to default when JSON.parse fails on stored value', () => {
    mockStorage.getItem.mockReturnValueOnce('not-valid-json');
    const { result } = renderHook(() =>
      useLocalStorage('bad', { fallback: true }),
    );
    expect(result.current[0]).toEqual({ fallback: true });
  });

  it('uses distinct keys independently', () => {
    const { result: a } = renderHook(() => useLocalStorage('key-a', 'A'));
    const { result: b } = renderHook(() => useLocalStorage('key-b', 'B'));

    expect(a.current[0]).toBe('A');
    expect(b.current[0]).toBe('B');

    act(() => {
      a.current[1]('A-updated');
    });
    expect(a.current[0]).toBe('A-updated');
    expect(b.current[0]).toBe('B'); // unchanged
  });

  /* ---------- error handling ---------- */

  it('still updates in-memory value when localStorage.setItem throws', () => {
    // Simulate a write failure (e.g. private browsing, quota exceeded)
    mockStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage write blocked');
    });

    const { result } = renderHook(() => useLocalStorage('fails', 'initial'));
    act(() => {
      result.current[1]('new-value');
    });

    // The hook should keep the in-memory value even if the write to storage fails
    expect(result.current[0]).toBe('new-value');
    expect(mockStorage.setItem).toHaveBeenCalledWith('fails', '"new-value"');
  });
});
