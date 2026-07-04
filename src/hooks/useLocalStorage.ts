import { useState, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      const parsed = JSON.parse(item) as T;
      // Shallow-merge with defaultValue for plain objects so that
      // upgraded users retain any keys added to the default shape.
      return typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed)
        ? { ...defaultValue, ...parsed }
        : parsed;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // localStorage may be blocked in private browsing
        }
        return nextValue;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
