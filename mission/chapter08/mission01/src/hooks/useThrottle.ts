import { useEffect, useRef, useState } from "react";

export const useThrottle = <T>(value: T, interval: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRun = useRef(0); // 마지막 실행 시각

  useEffect(() => {
    const now = Date.now();
    const remaining = interval - (now - lastRun.current); // 남은 시간

    if (remaining <= 0) {
      // interval이 이미 지남 -> 바로 실행하기
      lastRun.current = now;
      setThrottledValue(value);
    } else {
      // 아직 interval 안 지남 -> 남은 시간 후 실행하기
      const timer = setTimeout(() => {
        lastRun.current = Date.now();
        setThrottledValue(value);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
};
