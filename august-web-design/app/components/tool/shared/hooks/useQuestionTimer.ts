import { useRef, useCallback } from "react";

export function useQuestionTimer() {
  const startedAt = useRef<number>(Date.now());

  const reset = useCallback(() => {
    startedAt.current = Date.now();
  }, []);

  const getElapsedSeconds = useCallback(() => {
    return Math.round((Date.now() - startedAt.current) / 1000);
  }, []);

  return { reset, getElapsedSeconds };
}
