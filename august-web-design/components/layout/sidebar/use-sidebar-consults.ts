'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useNewConsultModalStore } from '@/stores/new-consult-modal-store';
import { useRecentConsultStore } from '@/stores/recent-consult-store';
import { listEncounters, type EncounterRecord } from '@/services/consultations-service';
import { peekCachedResource, setCachedResource, clearCachedResource } from '@/hooks/use-cached-resource';
import {
  CONSULT_CACHE_UPDATED_EVENT,
  getLatestCachedMessageTimestamp,
} from '@/utils/consult-chat-cache';
import {
  prefetchConsults,
  seedEncounterDetailsFromList,
} from '@/utils/encounter-prefetch';
import { BULK_PREFETCH_LIMIT, SIDEBAR_ENCOUNTERS_CACHE_KEY } from './constants';

/**
 * Shared consults state for every sidebar variant. Owns the encounter list,
 * its caching/prefetching, the live unread/status event wiring, and the sorted
 * view used by the dropdown.
 */
export function useSidebarConsults() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const hideSidebarConsultAction = useNewConsultModalStore((s) => s.hideSidebarAction);
  const lastOpenedConsultId = useRecentConsultStore((s) => s.lastOpenedConsultId);

  // Recent paid consults for the sub-list under the Consults nav item.
  const [consults, setConsults] = useState<EncounterRecord[]>(
    () => peekCachedResource<EncounterRecord[]>(SIDEBAR_ENCOUNTERS_CACHE_KEY) ?? []
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setConsults([]);
      clearCachedResource(SIDEBAR_ENCOUNTERS_CACHE_KEY);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await listEncounters();
        if (cancelled) return;
        setConsults(list);
        setCachedResource(SIDEBAR_ENCOUNTERS_CACHE_KEY, list);
        // Pre-warm the per-encounter caches so opening a consult never
        // shows the BeautifulLoader spinner. Seed every row from the
        // lightweight EncounterRecord (free), and full-fetch the top N
        // recent ones so message skeletons are skipped too.
        seedEncounterDetailsFromList(list);
        prefetchConsults(list.slice(0, BULK_PREFETCH_LIMIT));
      } catch {
        // Silently ignore — sidebar should never break the page.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (consults.length > 0) {
      hideSidebarConsultAction();
    }
  }, [consults.length, hideSidebarConsultAction]);

  // Keep the consult list live without a full refetch:
  //   consultations.encounter.assigned → fill in the clinician + status.
  //   consultations.encounter.status   → update the encounter status.
  //   consultations.message.created    → flip has_unread = true when a
  //     clinician/support message arrives.
  //   consults.unread.changed          → chat-pane just marked an encounter
  //     read; clear the dot locally.
  // Server stays authoritative — next list fetch reconciles.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onConsultEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        type?: string;
        encounter_id?: string;
        message?: { role?: string };
        clinician?: { first_name?: string; last_name?: string; suffix?: string };
        status?: string;
      };
      if (!detail?.type || !detail.encounter_id) return;

      if (detail.type === 'consultations.encounter.assigned') {
        const c = detail.clinician || {};
        setConsults((prev) =>
          prev.map((row) =>
            row.id === detail.encounter_id
              ? {
                  ...row,
                  status: 'assigned',
                  clinician_first_name: c.first_name || row.clinician_first_name,
                  clinician_last_name: c.last_name || row.clinician_last_name,
                  clinician_suffix: c.suffix || row.clinician_suffix,
                }
              : row
          )
        );
        return;
      }

      if (detail.type === 'consultations.encounter.status' && detail.status) {
        const next = detail.status;
        setConsults((prev) =>
          prev.map((row) => (row.id === detail.encounter_id ? { ...row, status: next } : row))
        );
        return;
      }

      if (detail.type === 'consultations.message.created') {
        const role = detail.message?.role;
        if (role !== 'clinician' && role !== 'support') return;
        setConsults((prev) => {
          const next = prev.map((c) =>
            c.id === detail.encounter_id ? { ...c, has_unread: true } : c,
          );
          setCachedResource(SIDEBAR_ENCOUNTERS_CACHE_KEY, next);
          return next;
        });
      }
    };
    const onReadChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail as { encounterId?: string; has_unread?: boolean };
      if (!detail?.encounterId) return;
      setConsults((prev) => {
        const next = prev.map((c) =>
          c.id === detail.encounterId ? { ...c, has_unread: !!detail.has_unread } : c,
        );
        setCachedResource(SIDEBAR_ENCOUNTERS_CACHE_KEY, next);
        return next;
      });
    };
    window.addEventListener('consultations.event', onConsultEvent as EventListener);
    window.addEventListener('consults.unread.changed', onReadChanged as EventListener);
    return () => {
      window.removeEventListener('consultations.event', onConsultEvent as EventListener);
      window.removeEventListener('consults.unread.changed', onReadChanged as EventListener);
    };
  }, []);

  const activeConsultId = pathname?.match(/^\/consults\/(?:e|d)\/([^/?#]+)/)?.[1]
    ?? pathname?.match(/^\/consults\/([^/?#]+)/)?.[1]
    ?? null;

  const [consultCacheVersion, setConsultCacheVersion] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setConsultCacheVersion((v) => v + 1);
    window.addEventListener(CONSULT_CACHE_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CONSULT_CACHE_UPDATED_EVENT, handler);
  }, []);

  const sortedConsults = useMemo(() => {
    const ts = (c: EncounterRecord) =>
      getLatestCachedMessageTimestamp(c.id) ?? 0;
    const sorted = [...consults].sort((a, b) => {
      if (!!a.has_unread !== !!b.has_unread) return a.has_unread ? -1 : 1;
      return ts(b) - ts(a);
    });
    if (lastOpenedConsultId) {
      const idx = sorted.findIndex((c) => c.id === lastOpenedConsultId);
      if (idx > 0) sorted.unshift(sorted.splice(idx, 1)[0]);
    }
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consults, consultCacheVersion, lastOpenedConsultId]);

  return {
    consults,
    sortedConsults,
    activeConsultId,
  };
}
