import { useCallback, useEffect, useRef } from "react";
import { trackToolEvent } from "@/app/utils/analytics";

type ToolPayload = Record<string, unknown>;

export function useCalculatorAnalytics(toolId: string) {
  const hasViewedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const lastCompletedSigRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent(toolId, "viewed");
  }, [toolId]);

  const markStarted = useCallback(
    (payload: ToolPayload = {}) => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      trackToolEvent(toolId, "started", payload);
    },
    [toolId],
  );

  const markCompleted = useCallback(
    (sig: string, payload: ToolPayload = {}) => {
      if (sig === lastCompletedSigRef.current) return;
      lastCompletedSigRef.current = sig;
      trackToolEvent(toolId, "completed", payload);
    },
    [toolId],
  );

  const resetCompleted = useCallback(() => {
    lastCompletedSigRef.current = "";
  }, []);

  return { markStarted, markCompleted, resetCompleted };
}
