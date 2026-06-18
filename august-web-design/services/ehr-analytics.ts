'use client';

import { useCallback, useRef } from 'react';
import { track } from '@/services/analytics-service';

type Params = Record<string, string | number | boolean>;

/**
 * Component-local "fire once per key" guard for state-derived analytics.
 *
 * Use this when one logical event can be observed across many renders, but
 * remounting the component should start a fresh episode. Examples: page views,
 * onboarding modal opens, and inline upload terminal states.
 *
 * Invariant: this remembers only the last key for this mounted component.
 * Call `reset()` when the episode ends so the same key can be tracked again in
 * a later episode.
 */
export function useTrackOnce() {
  const lastKey = useRef<string | null>(null);

  const trackOnce = useCallback((key: string, event: string, params?: Params) => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    track(event, params);
  }, []);

  const reset = useCallback(() => {
    lastKey.current = null;
  }, []);

  return { track: trackOnce, reset };
}

const firedKeys = new Set<string>();

/**
 * Browser-process "fire once per key" guard for entity-level analytics.
 *
 * Use this only when remounting must not re-track the same entity, such as a
 * background upload batch completion that can be observed by different
 * components over time.
 *
 * Invariant: keys stay remembered until the page is fully reloaded.
 */
export function trackKeyedOnce(key: string, event: string, params?: Params) {
  const keyedEvent = `${event}:${key}`;
  if (firedKeys.has(keyedEvent)) return;
  firedKeys.add(keyedEvent);
  track(event, params);
}
