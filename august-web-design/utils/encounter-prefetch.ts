'use client';

// Pre-warms the caches the consult detail page reads from
// (consult-cache:enc:* / consult-cache:pat:* in sessionStorage and
// consult-storage in localStorage) so opening a consult never paints a
// loading spinner.
//
// Two layers:
//   1. seedEncounterDetailsFromList() — synthesizes a partial EncounterDetail
//      from the lightweight EncounterRecord rows the sidebar / list page
//      already fetch. Zero extra requests. Skips encounters that already
//      have a richer (real getEncounter) entry cached.
//   2. prefetchConsult() / prefetchConsults() — best-effort background
//      fetches of getEncounter + getPatient + listEncounterMessages so the
//      detail page renders fully resolved on first click. Module-scope
//      deduped so hovering the same item twice (or remounting the sidebar)
//      doesn't refetch.

import { peekCachedResource, setCachedResource } from '@/hooks/use-cached-resource';
import { writeCachedChatLogs } from '@/utils/consult-chat-cache';
import {
  getEncounter,
  getPatient,
  listEncounterMessages,
  type EncounterDetail,
  type EncounterRecord,
} from '@/services/consultations-service';

const inFlight = new Set<string>();
const completedDetail = new Set<string>();
const completedLogs = new Set<string>();

function recordToPartialDetail(r: EncounterRecord): EncounterDetail {
  return {
    id: r.id,
    status: r.status,
    outcome: r.outcome,
    episode_id: r.episode_id,
    patient_id: r.patient_id,
    clinician_id: r.clinician_id,
    provider_encounter_id: r.provider_encounter_id,
    created_at: r.created_at,
    expires_at: null,
    visit_reason: r.visit_reason,
    summary: null,
    soap_note: null,
    possible_diagnosis: null,
    clinician: r.clinician_id
      ? {
          id: r.clinician_id,
          first_name: r.clinician_first_name,
          last_name: r.clinician_last_name,
          suffix: r.clinician_suffix,
          speciality: r.clinician_speciality,
          photo_url: r.clinician_photo_url,
          email: null,
          phone_number: null,
          bio: null,
          npi: null,
          dea: null,
          practice_areas: null,
        }
      : null,
  };
}

export function seedEncounterDetailsFromList(records: EncounterRecord[]): void {
  for (const r of records) {
    const key = `enc:${r.id}`;
    // Only seed if nothing better is cached. A real getEncounter() response
    // has summary/soap_note/full clinician — never clobber that with the
    // record-level synthesis.
    if (peekCachedResource(key) !== null) continue;
    setCachedResource(key, recordToPartialDetail(r));
  }
}

export function prefetchConsult(r: EncounterRecord): void {
  if (typeof window === 'undefined') return;

  const encFlight = `enc:${r.id}`;
  if (!completedDetail.has(r.id) && !inFlight.has(encFlight)) {
    inFlight.add(encFlight);
    getEncounter(r.id)
      .then((detail) => {
        setCachedResource(`enc:${r.id}`, detail);
        completedDetail.add(r.id);
      })
      .catch(() => {
        // Detail page does its own background fetch on mount — a failed
        // prefetch just loses the warm-cache optimization, never breaks
        // anything.
      })
      .finally(() => {
        inFlight.delete(encFlight);
      });
  }

  if (r.patient_id) {
    const patKey = `pat:${r.patient_id}`;
    if (peekCachedResource(patKey) === null && !inFlight.has(patKey)) {
      inFlight.add(patKey);
      getPatient(r.patient_id)
        .then((p) => setCachedResource(patKey, p))
        .catch(() => {})
        .finally(() => inFlight.delete(patKey));
    }
  }

  const logsFlight = `logs:${r.id}`;
  if (!completedLogs.has(r.id) && !inFlight.has(logsFlight)) {
    inFlight.add(logsFlight);
    listEncounterMessages(r.id)
      .then((logs) => {
        writeCachedChatLogs(r.id, logs);
        completedLogs.add(r.id);
      })
      .catch(() => {})
      .finally(() => {
        inFlight.delete(logsFlight);
      });
  }
}

export function prefetchConsults(records: EncounterRecord[]): void {
  for (const r of records) prefetchConsult(r);
}
