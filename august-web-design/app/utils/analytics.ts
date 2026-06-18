import { sendGAEvent } from '@next/third-parties/google'
import { getLocationVariant } from './checkCountry'

export function track(
  eventName: string,
  params: Record<string, string | number | boolean> = {}
): void {
  // Inject location variant automatically if not provided
  const extendedParams = {
    location: getLocationVariant(),
    ...params,
  };

  sendGAEvent('event', eventName, extendedParams);

  // Meta Pixel tracking for US visitors
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, extendedParams);
  }
}

export function trackIdle(event: string, payload?: Record<string, unknown>) {
  const fire = () => track(event, payload as Record<string, string | number | boolean>);
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(fire);
  } else {
    setTimeout(fire, 0);
  }
}

export type ToolEventType =
  | "viewed"
  | "started"
  | "question_answered"
  | "section_completed"
  | "completed"
  | "regenerated"
  | "cta_clicked";

// Emitted name = `${toolId}_${eventType}`. Existing wire names unchanged.
export function trackToolEvent(
  toolId: string,
  eventType: ToolEventType,
  payload: Record<string, unknown> = {},
  opts: { idle?: boolean } = {}
) {
  const event = `${toolId}_${eventType}`;
  if (opts.idle) trackIdle(event, payload);
  else track(event, payload as Record<string, string | number | boolean>);
}
