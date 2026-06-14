import { useEffect, useRef, useState } from 'react';

interface Options {
  threshold?: number;
  once?:      boolean;
}

/**
 * Returns a [ref, isVisible] tuple.
 * `isVisible` flips to true once the element enters the viewport.
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  { threshold = 0.4, once = true }: Options = {}
): [React.RefObject<T | null>, boolean] {
  const ref        = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, visible];
}
