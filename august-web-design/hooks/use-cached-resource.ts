'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

// useLayoutEffect during SSR warns; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Stale-while-revalidate cache backed by sessionStorage. Returns the cached
// value synchronously (no "Loading…" flicker on remounts within the same
// tab session) while a background fetch refreshes it. If the fetch fails,
// we keep the cached value visible — the UI doesn't get blocked by a
// flaky backend.
//
// Cache scope is tab-bounded (sessionStorage) which gives us:
//   - resilience to remounts and full page refreshes within a tab
//   - automatic invalidation when the tab closes (no risk of cross-day stale)
//   - no cross-tab leakage of in-progress consult state
//
// Use only for "read-once-per-step" resources (e.g. encounter row, patient
// row). Don't use for things that change live (chat logs — those come from
// WebPubSub) or for things you're about to mutate.

interface CacheEntry<T> {
  value: T;
  ts: number;
}

const CACHE_PREFIX = 'consult-cache:';

function readCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    return entry?.value ?? null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = { value, ts: Date.now() };
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage quota / private mode — silently ignore.
  }
}

export function clearCachedResource(key: string) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // ignore
  }
}

export function peekCachedResource<T>(key: string): T | null {
  return readCache<T>(key);
}

export function setCachedResource<T>(key: string, value: T) {
  writeCache(key, value);
}

export interface CachedResourceState<T> {
  value: T | null;
  /** True only on the very first paint when we have nothing cached. */
  isLoading: boolean;
  isFresh: boolean;
  error: Error | null;
  /** Force a re-fetch, bypassing the cache. Returns the fresh value. */
  refresh: () => Promise<T | null>;
}

/**
 * Returns cached value immediately (if any) and revalidates in the
 * background. Cache is keyed by `key`; pass `null` to opt out of fetching
 * (useful when the key isn't ready yet — e.g. waiting on patient_id).
 */
export function useCachedResource<T>(
  key: string | null,
  fetcher: () => Promise<T>,
): CachedResourceState<T> {
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(key !== null);
  const [isFresh, setIsFresh] = useState<boolean>(false);

  useIsomorphicLayoutEffect(() => {
    if (!key) return;
    const cached = readCache<T>(key);
    if (cached !== null) {
      setValue(cached);
      setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (!key) {
      setValue(null);
      setIsLoading(false);
      setIsFresh(true);
      return;
    }
    // Reset freshness on key change so the next caller (e.g. a remount
    // with a different patient) doesn't trust the cached value as
    // server-confirmed until our own background fetch lands.
    setIsFresh(false);

    let cancelled = false;
    fetcher()
      .then((next) => {
        if (cancelled) return;
        setValue(next);
        setError(null);
        setIsLoading(false);
        setIsFresh(true);
        writeCache(key, next);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err?.message || err)));
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refresh = async (): Promise<T | null> => {
    if (!key) return null;
    try {
      const next = await fetcher();
      setValue(next);
      setError(null);
      setIsFresh(true);
      writeCache(key, next);
      return next;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err?.message || err)));
      return null;
    }
  };

  return { value, isLoading, isFresh, error, refresh };
}
