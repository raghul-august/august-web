import { create } from 'zustand';
import {
  getFastenData,
  getConditionsPage,
  getMedicationsPage,
  getEncountersPage,
  getLabReportsPage,
  getProceduresPage,
  getAllergiesPage,
  getImmunizationsPage,
  listReportUploads,
  type ReportUploadStatus,
  type ReportLibraryItem,
} from '@/services/ehr-service';
import { getPersons } from '@/services/person-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import type {
  EhrData,
  PersonInfo,
  EhrConditionPageItem,
  EhrMedicationPageItem,
  EhrEncounterPageItem,
  EhrLabReportPageItem,
  EhrProcedurePageItem,
  EhrAllergyPageItem,
  EhrImmunizationPageItem,
} from '@/types/ehr';

const EMPTY_EHR: EhrData = {
  patient_profiles: [],
  encounters: [],
  conditions: [],
  medications: [],
  allergies: [],
  procedures: [],
  observations: { laboratory: [], 'vital-signs': [], 'social-history': [], uncategorized: [] },
  diagnostic_reports: [],
  immunizations: [],
  care_plans: [],
  clinical_notes: [],
  connections: [],
  export_jobs: [],
};

const EHR_ARRAY_KEYS = Object.keys(EMPTY_EHR) as (keyof EhrData)[];


// ── Inflight request dedup ────────────────────────────────────
// React Strict Mode in dev (and concurrent renders in general) can fire the
// page-section effects twice. Both calls miss the store cache because the
// cache is populated only after the `await` resolves. Without dedup, every
// page renders with two HTTP requests in flight. We track the in-progress
// Promise per (page, personId) so a second invocation joins the first.

type PageBucket =
  | 'conditions'
  | 'medications'
  | 'encounters'
  | 'labReports'
  | 'procedures'
  | 'allergies'
  | 'immunizations'
  | 'reportLibrary';

const inflight: Record<PageBucket, Record<string, Promise<unknown> | undefined>> = {
  conditions: {},
  medications: {},
  encounters: {},
  labReports: {},
  procedures: {},
  allergies: {},
  immunizations: {},
  reportLibrary: {},
};

function withDedup<T>(
  bucket: PageBucket,
  personId: string,
  start: () => Promise<T>,
): Promise<T> {
  const existing = inflight[bucket][personId] as Promise<T> | undefined;
  if (existing) return existing;

  const p = start().finally(() => {
    delete inflight[bucket][personId];
  });
  inflight[bucket][personId] = p;
  return p;
}


export interface EhrProvider {
  jobId: string;
  platformType: string;
  personId: string;
  orgConnectionId?: string;
}

/** Per-person cache entry for page endpoint data. Stores the flat item
 *  array; provenance per item is no longer carried — see contract conventions
 *  in `src/types/ehr.ts`. */
interface PageCache<T> {
  data: T[];
  fetchedAt: number;
}

/**
 * Per-file state in an in-flight upload batch. Kept in the store so the upload
 * card can survive a page-tree change (landing -> detail) without losing the
 * user's progress.
 */
export interface PendingUploadFile {
  /** Local id for React keys; not the same as the server's request_id. */
  localId: string;
  file: File;
  status: 'queued' | 'uploading' | 'submitted' | 'rejected' | 'errored';
  /** Set once /ehr/report-uploads returns. */
  requestId?: string;
  /** User-facing error reason when status is 'rejected' or 'errored'. */
  error?: string;
}

export interface UploadSession {
  files: PendingUploadFile[];
  status: ReportUploadStatus | null;
  phase: 'idle' | 'polling' | 'ready' | 'timeout';
  /**
   * Person the user explicitly chose for THIS upload batch from the
   * picker above the dropzone. Local to the batch — does not mutate
   * the globally-selected person. Defaults to the active personId on
   * the page, set on first file enqueue.
   */
  targetPersonId?: string;
  /**
   * Per-request_id record of user decisions on the post-extraction
   * mismatch card ('keep_here' | 'reassign:<person_id>' | 'dismiss').
   * Persists across reopens of the upload UI so we don't keep
   * pestering after the user has answered.
   */
  mismatchDecisions?: Record<string, string>;
}

export const EMPTY_UPLOAD_SESSION: UploadSession = {
  files: [],
  status: null,
  phase: 'idle',
};

// ── Background upload jobs ─────────────────────────────────────
// Flat list of in-flight upload jobs across the whole app. Each file gets
// its own job so the header chip can show a per-file pipeline state and the
// toasts can fire on individual transitions. The session-based flow
// (uploadSessions) still drives the in-modal progress card; this slice
// drives the page-level chip + toast rack.

export type UploadJobStatus =
  | 'uploading'   // running uploadMedia + submitReportUpload
  | 'extracting'  // submitted, backend is parsing the document
  | 'indexing'    // parsed, FHIR build in progress
  | 'done'
  | 'failed';

export interface UploadJob {
  id: string;
  fileName: string;
  /** The person this upload is attached to. Used to invalidate the right
   *  page cache + fetchEhr when the job hits done. */
  personId: string;
  /** Optional person_id query param; omitted for self uploads per backend
   *  contract. Mirrors the apiPersonId in ReportUploadSection. */
  apiPersonId?: string;
  status: UploadJobStatus;
  errorMessage?: string;
  /** Server request id once submitReportUpload returns. Used by the polling
   *  loop to map status rows back onto this job. */
  requestId?: string;
  startedAt: number;
}

// ── Toast notifications ────────────────────────────────────────

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  body?: string;
}

interface EhrStore {
  // Person state
  persons: PersonInfo[];
  selectedPersonId: string | null; // null until initialized, then userId (self) or a person_id
  personsLoading: boolean;
  /** Server-authoritative, cross-device "user has finished EHR onboarding"
   *  signal, sourced from get-persons. Drives whether the onboarding
   *  wizard/marketing hero is shown. Monotonic per user. */
  ehrOnboardingComplete: boolean;

  // Provider/EHR state
  providers: EhrProvider[];
  providerData: Record<string, EhrData>;
  ehr: EhrData;
  selectedProvider: string;
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  // Page data cache keyed by personId
  conditionsCache: Record<string, PageCache<EhrConditionPageItem>>;
  medicationsCache: Record<string, PageCache<EhrMedicationPageItem>>;
  encountersCache: Record<string, PageCache<EhrEncounterPageItem>>;
  labReportsCache: Record<string, PageCache<EhrLabReportPageItem>>;
  proceduresCache: Record<string, PageCache<EhrProcedurePageItem>>;
  allergiesCache: Record<string, PageCache<EhrAllergyPageItem>>;
  immunizationsCache: Record<string, PageCache<EhrImmunizationPageItem>>;
  /** Per-person cache of the raw uploaded-report library. Keyed by
   *  `${personId}|${includeRemoved ? 'all' : 'active'}` so toggling the
   *  show-removed switch doesn't blow away the default-view cache. */
  reportLibraryCache: Record<string, PageCache<ReportLibraryItem>>;

  /**
   * Per-person refresh sequence number. Page section components include this
   * in their useEffect deps; bumping it (via invalidatePersonPages) drops the
   * cache entries and forces currently-mounted sections to refetch. Used after
   * a report upload completes so the user sees fresh EHR data without
   * remounting the page.
   */
  pageRefreshSeq: Record<string, number>;

  /**
   * Per-person flag set when a report upload batch finishes processing in the
   * current session. The EHR detail-view gate (selectedPersonHasData) reads
   * provider rows, but `report_upload` export jobs may not be visible to the
   * frontend immediately after `ehr_complete_count` ticks up — there's a
   * backend window before the export job row is queryable. This flag bridges
   * that window so the user isn't stuck on the landing view after a successful
   * upload. Cleared on full reset (page reload, sign out).
   */
  recentlyUploadedFor: Record<string, true>;

  /**
   * Per-person upload session — files plus polling status. Lifted out of the
   * component so the upload card can render in two view positions (landing
   * and detail) without losing in-flight session state when the page
   * transitions between them. Keyed by personId.
   */
  uploadSessions: Record<string, UploadSession>;

  /**
   * Background upload jobs across all persons. The header chip aggregates
   * over this list and the toast rack fires on terminal transitions. Each
   * file dropped on the EHR page creates one job here. Done and failed jobs
   * persist until the user dismisses them (per-row X, the modal's "Done"
   * action) or the page reloads — this list is in-memory only.
   */
  uploadJobs: UploadJob[];

  /**
   * Transient top-right notification stack. The runner pushes a toast on
   * Done/Failed transitions; the toast rack auto-dismisses success toasts
   * after a few seconds.
   */
  toasts: Toast[];

  // Person actions
  fetchPersons: (userId: string) => Promise<void>;
  selectPerson: (personId: string) => void;
  /** Optimistically flip onboarding to complete (e.g. on wizard Done)
   *  for instant UX; the next get-persons confirms it server-side. */
  markEhrOnboardingComplete: () => void;

  // EHR actions
  fetchEhr: (userId: string) => Promise<void>;
  hardReload: (userId: string) => Promise<void>;
  selectProvider: (id: string) => void;
  resetEhr: () => void;
  reset: () => void;

  // Page data actions — returns cached items or fetches fresh
  fetchConditionsPage: (personId: string) => Promise<EhrConditionPageItem[]>;
  fetchMedicationsPage: (personId: string) => Promise<EhrMedicationPageItem[]>;
  fetchEncountersPage: (personId: string) => Promise<EhrEncounterPageItem[]>;
  fetchLabReportsPage: (personId: string) => Promise<EhrLabReportPageItem[]>;
  fetchProceduresPage: (personId: string) => Promise<EhrProcedurePageItem[]>;
  fetchAllergiesPage: (personId: string) => Promise<EhrAllergyPageItem[]>;
  fetchImmunizationsPage: (personId: string) => Promise<EhrImmunizationPageItem[]>;
  fetchReportLibrary: (personId: string, opts?: { includeRemoved?: boolean }) => Promise<ReportLibraryItem[]>;
  /** Optimistic helper used by the report-library delete flow. Marks the
   *  matching row's `removed` flag locally so the row swaps to the
   *  "removed" state instantly; the network DELETE catches up after. */
  markReportRemoved: (personId: string, requestId: string) => void;

  // Cache invalidation
  invalidatePersonPages: (personId: string) => void;
  markRecentlyUploaded: (personId: string) => void;

  // Upload session
  setUploadSession: (
    personId: string,
    update: Partial<UploadSession> | ((prev: UploadSession) => Partial<UploadSession>),
  ) => void;

  // Background upload jobs
  addUploadJob: (job: UploadJob) => void;
  updateUploadJob: (id: string, patch: Partial<UploadJob>) => void;
  removeUploadJob: (id: string) => void;
  clearFinishedUploadJobs: () => void;

  // Toasts
  pushToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;

  // Derived helpers
  getProvidersForPerson: (personId: string) => EhrProvider[];
  getEhrForPerson: (personId: string) => EhrData;
}

const OBSERVATIONS_CATEGORIES = ['laboratory', 'vital-signs', 'social-history', 'uncategorized'] as const;

function mergeProviderData(providerData: Record<string, EhrData>, providerIds: string[]): EhrData {
  const merged: EhrData = {
    patient_profiles: [],
    encounters: [],
    conditions: [],
    medications: [],
    allergies: [],
    procedures: [],
    observations: { laboratory: [], 'vital-signs': [], 'social-history': [], uncategorized: [] },
    diagnostic_reports: [],
    immunizations: [],
    care_plans: [],
    clinical_notes: [],
    connections: [],
    export_jobs: [],
  };

  for (const id of providerIds) {
    const data = providerData[id];
    if (!data) continue;
    for (const key of EHR_ARRAY_KEYS) {
      if (key === 'observations') {
        const obs = data[key] as EhrData['observations'];
        if (obs && typeof obs === 'object') {
          for (const cat of OBSERVATIONS_CATEGORIES) {
            if (Array.isArray(obs[cat])) {
              merged.observations[cat].push(...obs[cat]);
            }
          }
        }
      } else {
        const arr = data[key];
        if (Array.isArray(arr)) {
          (merged[key] as unknown[]).push(...arr);
        }
      }
    }
  }
  return merged;
}

function parseResponse(resData: Record<string, unknown>, userId: string): {
  providers: EhrProvider[];
  providerData: Record<string, EhrData>;
} {
  const providers: EhrProvider[] = [];
  const providerData: Record<string, EhrData> = {};

  // Unwrap: actual provider map may be under `ehr` key or `enriched_payload` (JSON string)
  let payload = resData;
  if (resData.enriched_payload) {
    const raw = resData.enriched_payload;
    payload = typeof raw === 'string' ? JSON.parse(raw) : raw as Record<string, unknown>;
  } else if (resData.ehr && typeof resData.ehr === 'object') {
    payload = resData.ehr as Record<string, unknown>;
  }

  // Keyed format: keys are ehr_export_job_ids, each with { person_id, platform_type, ehr }
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value !== 'object' || value === null) continue;
    const entry = value as Record<string, unknown>;
    if (entry?.ehr && typeof entry.ehr === 'object') {
      providers.push({
        jobId: key,
        platformType: (entry.platform_type as string) || 'unknown',
        personId: (entry.person_id as string) || userId,
        orgConnectionId: entry.org_connection_id as string | undefined,
      });
      providerData[key] = { ...EMPTY_EHR, ...(entry.ehr as Partial<EhrData>) };
    }
  }

  // Fallback: old flat format where payload has patient_profiles directly
  if (providers.length === 0 && Array.isArray((payload as Record<string, unknown>).patient_profiles)) {
    providers.push({ jobId: 'default', platformType: 'unknown', personId: userId });
    providerData['default'] = { ...EMPTY_EHR, ...(payload as Partial<EhrData>) };
  }

  return { providers, providerData };
}

/** Compute EHR data for the selected person, respecting provider selection */
function computeEhr(state: {
  providers: EhrProvider[];
  providerData: Record<string, EhrData>;
  selectedPersonId: string | null;
  selectedProvider: string;
}): EhrData {
  const { providers, providerData, selectedPersonId, selectedProvider } = state;

  if (selectedProvider !== 'all' && providerData[selectedProvider]) {
    return providerData[selectedProvider];
  }

  // Filter providers for selected person
  const personProviders = selectedPersonId
    ? providers.filter(p => p.personId === selectedPersonId)
    : providers;

  return mergeProviderData(providerData, personProviders.map(p => p.jobId));
}

export const useEhrStore = create<EhrStore>()((set, get) => ({
  // Person state
  persons: [],
  selectedPersonId: null,
  personsLoading: false,
  ehrOnboardingComplete: false,

  // Provider/EHR state
  providers: [],
  providerData: {},
  ehr: EMPTY_EHR,
  selectedProvider: 'all',
  loading: false,
  error: null,
  lastFetchedAt: null,

  // Page data cache
  conditionsCache: {},
  medicationsCache: {},
  encountersCache: {},
  labReportsCache: {},
  proceduresCache: {},
  allergiesCache: {},
  immunizationsCache: {},
  reportLibraryCache: {},
  pageRefreshSeq: {},
  recentlyUploadedFor: {},
  uploadSessions: {},
  uploadJobs: [],
  toasts: [],

  fetchPersons: async (userId: string) => {
    set({ personsLoading: true });
    try {
      const { persons, ehrOnboardingComplete } = await getPersons();
      // Backend auto-creates a self relationship row with its own UUID, but EHR
      // providers resolve person_id as userId for self. Normalize self person_id
      // to userId so pill selection and provider filtering agree.
      const selfIdx = persons.findIndex(p => p.relationship === 'self');
      if (selfIdx >= 0 && userId) {
        persons[selfIdx] = { ...persons[selfIdx], person_id: userId };
      } else if (selfIdx < 0 && userId) {
        persons.unshift({
          person_id: userId,
          name: null,
          relationship: 'self',
          age: null,
          sex: null,
          color: '#206E55',
          icon: 'user',
        });
      }
      const selfPersonId = userId || persons.find(p => p.relationship === 'self')?.person_id;
      // Drop stale selectedPersonId if it doesn't belong to the freshly
      // fetched household — happens when the auth user changed in-tab
      // (account switch) and the in-memory store still holds the prior
      // account's selection.
      const currentSelected = get().selectedPersonId;
      const isSelectedValid = !!currentSelected && persons.some(p => p.person_id === currentSelected);
      set({
        persons,
        selectedPersonId: (isSelectedValid ? currentSelected : null) || selfPersonId || null,
        // Server-authoritative + monotonic, so a direct set is correct and
        // also clears the flag on an in-tab account switch (new user, fresh
        // value) rather than carrying over the prior account's true.
        ehrOnboardingComplete,
      });
    } catch (error) {
      logger.error('[EHR] Failed to fetch persons', serializeError(error));
    } finally {
      set({ personsLoading: false });
    }
  },

  selectPerson: (personId: string) => {
    const state = get();
    const newState = { ...state, selectedPersonId: personId, selectedProvider: 'all' };
    set({
      selectedPersonId: personId,
      selectedProvider: 'all',
      ehr: computeEhr(newState),
    });
  },

  markEhrOnboardingComplete: () => set({ ehrOnboardingComplete: true }),

  fetchEhr: async (userId: string) => {
    if (get().lastFetchedAt !== null) return;

    set({ loading: true, error: null });
    try {
      const res = await getFastenData();
      if (!res?.success || !res.data) throw new Error('EHR fetch failed');

      const { providers, providerData } = parseResponse(res.data as Record<string, unknown>, userId);

      if (providers.length === 0) {
        set({ providers: [], providerData: {}, ehr: EMPTY_EHR, lastFetchedAt: Date.now() });
        return;
      }

      const selectedPersonId = get().selectedPersonId || userId;
      const newState = { providers, providerData, selectedPersonId, selectedProvider: 'all' };
      set({
        providers,
        providerData,
        selectedPersonId: selectedPersonId || null,
        selectedProvider: 'all',
        ehr: computeEhr(newState),
        lastFetchedAt: Date.now(),
      });
    } catch (error) {
      logger.error('[EHR] Failed to fetch fasten data', serializeError(error));
      set({ error: 'Failed to load health records' });
    } finally {
      set({ loading: false });
    }
  },

  hardReload: async (userId: string) => {
    set({
      loading: true,
      error: null,
      // NOTE: uploadJobs / toasts / recentlyUploadedFor are intentionally
      // NOT cleared here. They're session signals that bridge gaps
      // between "we did something" and "the server reflects it" — a
      // hard reload (often triggered immediately after an upload) is
      // exactly the window where those flags matter most. Clearing
      // recentlyUploadedFor here used to flip the shell back to the
      // landing branch in the half-second between the loading=true set
      // and providers actually populating. Only full `reset()` (sign
      // out / account switch) clears these.
      lastFetchedAt: null,
      conditionsCache: {},
      medicationsCache: {},
      encountersCache: {},
      labReportsCache: {},
      proceduresCache: {},
      allergiesCache: {},
      immunizationsCache: {},
      reportLibraryCache: {},
      pageRefreshSeq: {},
      uploadSessions: {},
    });
    try {
      const res = await getFastenData();
      if (!res?.success || !res.data) throw new Error('EHR fetch failed');

      const { providers, providerData } = parseResponse(res.data as Record<string, unknown>, userId);

      if (providers.length === 0) {
        set({ providers: [], providerData: {}, ehr: EMPTY_EHR, lastFetchedAt: Date.now() });
        return;
      }

      const selectedPersonId = get().selectedPersonId || userId;
      const newState = { providers, providerData, selectedPersonId, selectedProvider: 'all' };
      set({
        providers,
        providerData,
        selectedPersonId: selectedPersonId || null,
        selectedProvider: 'all',
        ehr: computeEhr(newState),
        lastFetchedAt: Date.now(),
      });
    } catch (error) {
      logger.error('[EHR] Failed to fetch fasten data (hard reload)', serializeError(error));
      set({ error: 'Failed to load health records' });
    } finally {
      set({ loading: false });
    }
  },

  selectProvider: (id: string) => {
    const state = get();
    const newState = { ...state, selectedProvider: id };
    if (id === 'all') {
      set({ ehr: computeEhr(newState), selectedProvider: 'all' });
    } else if (state.providerData[id]) {
      set({ ehr: state.providerData[id], selectedProvider: id });
    }
  },

  resetEhr: () => {
    set({
      providers: [],
      providerData: {},
      ehr: EMPTY_EHR,
      selectedProvider: 'all',
      loading: false,
      error: null,
      lastFetchedAt: null,
      conditionsCache: {},
      medicationsCache: {},
      encountersCache: {},
      labReportsCache: {},
      proceduresCache: {},
      allergiesCache: {},
      immunizationsCache: {},
      reportLibraryCache: {},
      pageRefreshSeq: {},
      recentlyUploadedFor: {},
      uploadSessions: {},
    });
  },

  reset: () => {
    set({
      persons: [],
      selectedPersonId: null,
      personsLoading: false,
      ehrOnboardingComplete: false,
      providers: [],
      providerData: {},
      ehr: EMPTY_EHR,
      selectedProvider: 'all',
      loading: false,
      error: null,
      lastFetchedAt: null,
      conditionsCache: {},
      medicationsCache: {},
      encountersCache: {},
      labReportsCache: {},
      proceduresCache: {},
      allergiesCache: {},
      immunizationsCache: {},
      reportLibraryCache: {},
      pageRefreshSeq: {},
      recentlyUploadedFor: {},
      uploadSessions: {},
      uploadJobs: [],
      toasts: [],
    });
  },

  fetchConditionsPage: (personId: string) => {
    const cached = get().conditionsCache[personId];
    if (cached) return Promise.resolve(cached.data);

    return withDedup('conditions', personId, async () => {
      const data = await getConditionsPage(personId);
      set(state => ({
        conditionsCache: { ...state.conditionsCache, [personId]: { data, fetchedAt: Date.now() } },
      }));
      return data;
    });
  },

  fetchMedicationsPage: (personId: string) => {
    const cached = get().medicationsCache[personId];
    if (cached) return Promise.resolve(cached.data);

    return withDedup('medications', personId, async () => {
      const data = await getMedicationsPage(personId);
      set(state => ({
        medicationsCache: { ...state.medicationsCache, [personId]: { data, fetchedAt: Date.now() } },
      }));
      return data;
    });
  },

  fetchEncountersPage: (personId: string) => {
    const cached = get().encountersCache[personId];
    if (cached) return Promise.resolve(cached.data);

    return withDedup('encounters', personId, async () => {
      const data = await getEncountersPage(personId);
      set(state => ({
        encountersCache: { ...state.encountersCache, [personId]: { data, fetchedAt: Date.now() } },
      }));
      return data;
    });
  },

  fetchLabReportsPage: (personId: string) => {
    const cached = get().labReportsCache[personId];
    if (cached) return Promise.resolve(cached.data);

    return withDedup('labReports', personId, async () => {
      const data = await getLabReportsPage(personId);
      set(state => ({
        labReportsCache: { ...state.labReportsCache, [personId]: { data, fetchedAt: Date.now() } },
      }));
      return data;
    });
  },

  fetchProceduresPage: (personId: string) => {
    const cached = get().proceduresCache[personId];
    if (cached) return Promise.resolve(cached.data);

    return withDedup('procedures', personId, async () => {
      const data = await getProceduresPage(personId);
      set(state => ({
        proceduresCache: { ...state.proceduresCache, [personId]: { data, fetchedAt: Date.now() } },
      }));
      return data;
    });
  },

  fetchAllergiesPage: (personId: string) => {
    const cached = get().allergiesCache[personId];
    if (cached) return Promise.resolve(cached.data);

    return withDedup('allergies', personId, async () => {
      const data = await getAllergiesPage(personId);
      set(state => ({
        allergiesCache: { ...state.allergiesCache, [personId]: { data, fetchedAt: Date.now() } },
      }));
      return data;
    });
  },

  fetchImmunizationsPage: (personId: string) => {
    const cached = get().immunizationsCache[personId];
    if (cached) return Promise.resolve(cached.data);

    return withDedup('immunizations', personId, async () => {
      const data = await getImmunizationsPage(personId);
      set(state => ({
        immunizationsCache: { ...state.immunizationsCache, [personId]: { data, fetchedAt: Date.now() } },
      }));
      return data;
    });
  },

  fetchReportLibrary: (personId: string, opts?: { includeRemoved?: boolean }) => {
    const cacheKey = `${personId}|${opts?.includeRemoved ? 'all' : 'active'}`;
    const cached = get().reportLibraryCache[cacheKey];
    if (cached) return Promise.resolve(cached.data);

    return withDedup('reportLibrary', cacheKey, async () => {
      const data = await listReportUploads({ personId, includeRemoved: opts?.includeRemoved });
      set(state => ({
        reportLibraryCache: { ...state.reportLibraryCache, [cacheKey]: { data, fetchedAt: Date.now() } },
      }));
      return data;
    });
  },

  markReportRemoved: (personId: string, requestId: string) => {
    set(state => {
      const next: Record<string, PageCache<ReportLibraryItem>> = {};
      let mutated = false;
      for (const [key, entry] of Object.entries(state.reportLibraryCache)) {
        if (!key.startsWith(`${personId}|`)) {
          next[key] = entry;
          continue;
        }
        // The default-view cache (active rows) drops the row entirely;
        // the include-removed cache flips its removed flag so the toggle
        // view shows the new state immediately.
        const isAllView = key.endsWith('|all');
        if (isAllView) {
          const updated = entry.data.map(r =>
            r.request_id === requestId ? { ...r, removed: true, ehr_state: 'removed' as const } : r,
          );
          next[key] = { data: updated, fetchedAt: entry.fetchedAt };
        } else {
          const filtered = entry.data.filter(r => r.request_id !== requestId);
          next[key] = { data: filtered, fetchedAt: entry.fetchedAt };
        }
        mutated = true;
      }
      return mutated ? { reportLibraryCache: next } : state;
    });
  },

  markRecentlyUploaded: (personId: string) => {
    set(state => ({
      recentlyUploadedFor: { ...state.recentlyUploadedFor, [personId]: true },
    }));
  },

  setUploadSession: (personId, update) => {
    set(state => {
      const existing = state.uploadSessions[personId] ?? EMPTY_UPLOAD_SESSION;
      const partial = typeof update === 'function' ? update(existing) : update;
      return {
        uploadSessions: {
          ...state.uploadSessions,
          [personId]: { ...existing, ...partial },
        },
      };
    });
  },

  addUploadJob: (job: UploadJob) => {
    set(state => ({ uploadJobs: [...state.uploadJobs, job] }));
  },

  updateUploadJob: (id: string, patch: Partial<UploadJob>) => {
    set(state => ({
      uploadJobs: state.uploadJobs.map(j => (j.id === id ? { ...j, ...patch } : j)),
    }));
  },

  removeUploadJob: (id: string) => {
    set(state => ({ uploadJobs: state.uploadJobs.filter(j => j.id !== id) }));
  },

  clearFinishedUploadJobs: () => {
    set(state => ({
      uploadJobs: state.uploadJobs.filter(j => j.status !== 'done' && j.status !== 'failed'),
    }));
  },

  pushToast: (toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },

  dismissToast: (id: string) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  invalidatePersonPages: (personId: string) => {
    // Invariant: cache drop and seq bump must happen in the same `set` call.
    // Mounted page sections refetch when `pageRefreshSeq[personId]` changes;
    // they read from the cache inside their fetcher and would otherwise hand
    // back stale data if the bump preceded the drop.
    const drop = <T,>(cache: Record<string, T>): Record<string, T> => {
      if (!(personId in cache)) return cache;
      const { [personId]: _, ...rest } = cache;
      return rest;
    };
    // reportLibraryCache is keyed by `${personId}|${view}` rather than
    // bare personId, so the helper above doesn't match — drop any key
    // that starts with this person's id.
    const dropReportLibrary = (
      cache: Record<string, PageCache<ReportLibraryItem>>,
    ): Record<string, PageCache<ReportLibraryItem>> => {
      const prefix = `${personId}|`;
      let mutated = false;
      const next: Record<string, PageCache<ReportLibraryItem>> = {};
      for (const [key, value] of Object.entries(cache)) {
        if (key.startsWith(prefix)) {
          mutated = true;
          continue;
        }
        next[key] = value;
      }
      return mutated ? next : cache;
    };
    set(state => ({
      conditionsCache: drop(state.conditionsCache),
      medicationsCache: drop(state.medicationsCache),
      encountersCache: drop(state.encountersCache),
      labReportsCache: drop(state.labReportsCache),
      proceduresCache: drop(state.proceduresCache),
      allergiesCache: drop(state.allergiesCache),
      immunizationsCache: drop(state.immunizationsCache),
      reportLibraryCache: dropReportLibrary(state.reportLibraryCache),
      pageRefreshSeq: {
        ...state.pageRefreshSeq,
        [personId]: (state.pageRefreshSeq[personId] ?? 0) + 1,
      },
    }));
  },

  getProvidersForPerson: (personId: string) => {
    return get().providers.filter(p => p.personId === personId);
  },

  getEhrForPerson: (personId: string) => {
    const { providers, providerData } = get();
    const personProviders = providers.filter(p => p.personId === personId);
    return mergeProviderData(providerData, personProviders.map(p => p.jobId));
  },
}));
