import { useCallback, useRef, useEffect } from "react";

export function useAutoAdvance(callback: () => void, delayMs = 350) {
  const cb = useRef(callback);
  cb.current = callback;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => cb.current(), delayMs);
  }, [delayMs]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return trigger;
}
