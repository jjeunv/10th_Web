import { useEffect, useRef, useState } from "react";

export const useThrottle = <T>(value: T, interval: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRun = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const remaining = interval - (now - lastRun.current);
    const delay = remaining <= 0 ? 0 : remaining;

    const timer = setTimeout(() => {
      lastRun.current = Date.now();
      setThrottledValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, interval]);

  return throttledValue;
};
