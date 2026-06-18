'use client';

import { useEffect, useState } from 'react';

export interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  domain: string;
}

type CacheEntry = LinkPreviewData | null;

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

async function fetchPreview(url: string): Promise<CacheEntry> {
  try {
    const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as LinkPreviewData;
    if (!data.title && !data.description && !data.image) return null;
    return data;
  } catch {
    return null;
  }
}

export interface UseLinkPreviewResult {
  data: LinkPreviewData | null;
  isLoading: boolean;
}

export function useLinkPreview(url: string | null): UseLinkPreviewResult {
  const [data, setData] = useState<CacheEntry | undefined>(() =>
    url && cache.has(url) ? cache.get(url)! : undefined,
  );

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }
    if (cache.has(url)) {
      setData(cache.get(url)!);
      return;
    }

    let cancelled = false;
    setData(undefined);

    let promise = inflight.get(url);
    if (!promise) {
      promise = fetchPreview(url).then((d) => {
        cache.set(url, d);
        inflight.delete(url);
        return d;
      });
      inflight.set(url, promise);
    }
    promise.then((d) => {
      if (!cancelled) setData(d);
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return {
    data: data ?? null,
    isLoading: data === undefined,
  };
}
