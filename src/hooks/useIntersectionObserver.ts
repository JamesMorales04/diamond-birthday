import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
): [React.RefCallback<HTMLElement>, boolean] {
  const { threshold = 0.2, rootMargin = '0px', triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      targetRef.current = node;

      if (node) {
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              if (triggerOnce && observerRef.current) {
                observerRef.current.unobserve(node);
              }
            } else if (!triggerOnce) {
              setIsVisible(false);
            }
          },
          { threshold, rootMargin },
        );
        observerRef.current.observe(node);
      }
    },
    [threshold, rootMargin, triggerOnce],
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [ref, isVisible];
}
