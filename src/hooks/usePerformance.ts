import { useCallback, useRef } from 'react';

/**
 * Custom hook สำหรับ throttling functions
 * ป้องกันการเรียกฟังก์ชันบ่อยเกินไป (เช่น scroll, resize events)
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        // Schedule the next call
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    }) as T,
    [callback, delay]
  );

  return throttledCallback;
}

/**
 * Custom hook สำหรับ intersection observer
 * ใช้สำหรับ lazy loading หรือ infinite scroll
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback((callback: (entries: IntersectionObserverEntry[]) => void) => {
    if (elementRef.current && !observerRef.current) {
      observerRef.current = new IntersectionObserver(callback, {
        threshold: 0.1,
        ...options,
      });
      observerRef.current.observe(elementRef.current);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  return { elementRef, observe, disconnect };
}
