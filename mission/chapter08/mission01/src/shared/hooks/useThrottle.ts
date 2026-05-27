import { useEffect, useRef, useState } from "react";

export const useThrottle = <T>(value: T, interval: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRun = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const remaining = interval - (now - lastRun.current);

    if (remaining <= 0) {
      lastRun.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastRun.current = Date.now();
        setThrottledValue(value);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
};
