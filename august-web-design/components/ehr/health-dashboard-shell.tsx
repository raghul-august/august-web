'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  Loader2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { useAuthStore, useAuthHasHydrated } from '@/stores/auth-store';
import { useLoginModalStore } from '@/stores/login-modal-store';
import { useEhrStore } from '@/stores/ehr-store';
import {
  getFastenBootstrap,
  getFastenStatus,
  postFastenConnection,
  disconnectFastenProvider,
} from '@/services/ehr-service';
import { createPerson } from '@/services/person-service';
import {
  isFastenStatusProcessing,
  isFastenStatusSuccessful,
  isFastenStatusFailed,
} from '@/utils/fasten-status';
import {
  FastenConnectWidget,
  ProviderSheet,
  AddPersonModal,
  BackgroundUploadRunner,
  UploadStatusChip,
  ToastRack,
  ReportLibrarySection,
  UploadReportsModal,
} from '@/components/ehr';
import { useProfileGate } from '@/hooks/use-profile-gate';
import {
  backgroundUploadFilesRef,
  retryBackgroundUploadJob,
} from '@/utils/background-upload-files';
import { OnboardingWizard } from './onboarding/onboarding-wizard';
import type { FastenBootstrap, FastenConnectionEvent } from '@/types/ehr';
import { track } from '@/services/analytics-service';
import { useTrackOnce } from '@/services/ehr-analytics';
import { MarketingHero } from './landing/marketing-hero';
import { PlainEnglishSection } from './landing/plain-english-section';
import { FamilySection } from './landing/family-section';
import { ClosingCta } from './landing/closing-cta';
import { EmptyPersonPrompt } from './landing/empty-person-prompt';
import { EHR_SECTIONS, EHR_SECTION_PATHS, sectionFromPath, type EhrWorkspaceSection } from './health-dashboard/sections';
import { EhrPageHeader } from './health-dashboard/page-header';
import { PatientProfileRow } from './health-dashboard/patient-profile-row';
import { FloatingAddMenu } from './health-dashboard/floating-add-menu';
import { InFlightUploadList } from './health-dashboard/in-flight-upload-list';
import { EhrSkeleton } from './ehr-skeleton';
import { useEhrConnectAvailability } from '@/hooks/use-ehr-connect-availability';

type ViewState = 'landing' | 'connecting' | 'syncing' | 'detail' | 'error';

type HealthDashboardContextValue = {
  selectedPersonId: string;
  onUploadReport: () => void;
  goToSection: (section: EhrWorkspaceSection) => void;
};

const HealthDashboardContext = createContext<HealthDashboardContextValue | null>(null);

export function useHealthDashboard() {
  const value = useContext(HealthDashboardContext);
  if (!value) {
    throw new Error('useHealthDashboard must be used inside HealthDashboardShell');
  }
  return value;
}

const POLL_INTERVAL = 15000;
const POLL_TIMEOUT = 5 * 60 * 1000;

const OVERVIEW_SUBTITLE = 'Here are the things that are the most important for your health';

/** The page heading: a personal greeting on Overview, the section name on every
 *  other page (the greeting is intentionally not repeated elsewhere). */
function ehrPageHeading(section: EhrWorkspaceSection): { title: string; subtitle: string } {
  const cfg = EHR_SECTIONS.find(s => s.id === section) ?? EHR_SECTIONS[0];
  if (section === 'overview') {
    return { title: cfg.label, subtitle: OVERVIEW_SUBTITLE };
  }
  return { title: cfg.label, subtitle: cfg.description };
}

export function HealthDashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const authHasHydrated = useAuthHasHydrated();
  const userId = (user?.id ?? (user as Record<string, unknown>)?.userId) as string | undefined;
  const {
    ehr, providers, selectedProvider, selectProvider,
    persons, selectedPersonId, selectPerson, fetchPersons,
    loading: ehrLoading, fetchEhr, hardReload, resetEhr, invalidatePersonPages,
    getProvidersForPerson,
    fetchConditionsPage, fetchMedicationsPage, fetchLabReportsPage, fetchProceduresPage,
  } = useEhrStore();
  const uploadJobs = useEhrStore(s => s.uploadJobs);
  const removeUploadJob = useEhrStore(s => s.removeUploadJob);

  const [viewState, setViewState] = useState<ViewState | null>(null);
  const [bootstrap, setBootstrap] = useState<FastenBootstrap | null>(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState<Array<{ worker_status: string; org_connection_id: string; person_id?: string }>>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [connectionEvent, setConnectionEvent] = useState<FastenConnectionEvent | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showProviderSheet, setShowProviderSheet] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  // Server-authoritative onboarding signal, read reactively from the store
  // (populated by fetchPersons before viewState leaves the loading gate).
  // Drives the hero swap: marketing → empty-person prompt.
  const onboardingSeen = useEhrStore(s => s.ehrOnboardingComplete);
  const { awaitProfile, gate: profileGateElement } = useProfileGate();
  const { canConnectRecords } = useEhrConnectAvailability();
  const activeWorkspaceSection = sectionFromPath(pathname);

  // Anon users can browse the EHR landing, but every action requires a signed-in account. Intercept
  // here and open the dismissible login modal instead of running the action.
  const requireAuth = useCallback((): boolean => {
    if (!isAuthenticated) {
      useLoginModalStore.getState().open();
      return false;
    }
    return true;
  }, [isAuthenticated]);
  const awaitProfileGuarded = useCallback(async (): Promise<boolean> => {
    if (!requireAuth()) return false;
    return awaitProfile();
  }, [requireAuth, awaitProfile]);
  const openAddPerson = useCallback(() => {
    if (requireAuth()) {
      track('ehr_add_family_clicked', {
        source: 'dashboard',
        section: activeWorkspaceSection,
      });
      setShowAddPerson(true);
    }
  }, [activeWorkspaceSection, requireAuth]);
  const openOnboarding = useCallback(() => {
    if (requireAuth()) {
      track('ehr_onboarding_cta_clicked', {
        source: 'landing',
        can_connect_records: canConnectRecords,
      });
      setShowOnboardingWizard(true);
    }
  }, [canConnectRecords, requireAuth]);

  const goToSection = useCallback((section: EhrWorkspaceSection) => {
    router.push(EHR_SECTION_PATHS[section]);
  }, [router]);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartTimeRef = useRef<number>(0);
  const currentConnectionIdRef = useRef<string | null>(null);
  const startStatusPollingRef = useRef<(() => void) | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const viewStateRef = useRef<ViewState | null>(viewState);
  const isPollingRef = useRef<boolean>(false);
  const initializedForUserRef = useRef<string | undefined>(undefined);
  const { track: trackPageView } = useTrackOnce();

  // Keep viewStateRef in sync
  useEffect(() => {
    viewStateRef.current = viewState;
  }, [viewState]);

  // Helper to get/set sync start times from localStorage (persists across navigation)
  const getSyncStartTime = useCallback((connectionId: string | null): number => {
    if (typeof window === 'undefined') return Date.now();
    const stored = localStorage.getItem('ehr_sync_starts');
    if (stored) {
      try {
        const data = JSON.parse(stored) as Record<string, number>;
        if (connectionId && data[connectionId]) {
          return data[connectionId];
        }
        const times = Object.values(data);
        if (times.length > 0) {
          return Math.max(...times);
        }
      } catch {
        // Invalid data, ignore
      }
    }
    return Date.now();
  }, []);

  const setSyncStartTime = useCallback((connectionId: string, startTime: number) => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('ehr_sync_starts');
    let data: Record<string, number> = {};
    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch {
        // Invalid data, reset
      }
    }
    data[connectionId] = startTime;
    localStorage.setItem('ehr_sync_starts', JSON.stringify(data));
  }, []);

  const clearSyncStartTime = useCallback((connectionId?: string) => {
    if (typeof window === 'undefined') return;
    if (connectionId) {
      const stored = localStorage.getItem('ehr_sync_starts');
      if (stored) {
        try {
          const data = JSON.parse(stored) as Record<string, number>;
          delete data[connectionId];
          if (Object.keys(data).length > 0) {
            localStorage.setItem('ehr_sync_starts', JSON.stringify(data));
          } else {
            localStorage.removeItem('ehr_sync_starts');
          }
        } catch {
          localStorage.removeItem('ehr_sync_starts');
        }
      }
    } else {
      localStorage.removeItem('ehr_sync_starts');
    }
  }, []);

  const beginSyncingConnection = useCallback((evt?: FastenConnectionEvent & { event_type?: string }) => {
    const connectionId = evt?.org_connection_id || null;
    currentConnectionIdRef.current = connectionId;
    if (evt) setConnectionEvent(evt);

    setViewState('syncing');
    setDisplayProgress(0);

    const startTime = Date.now();
    if (connectionId) {
      setSyncStartTime(connectionId, startTime);
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const targetDuration = 60000;
      const calculatedProgress = Math.min((elapsed / targetDuration) * 100, 99);
      setDisplayProgress(calculatedProgress);
    }, 500);

    // Kick off the /fasten/status poll loop so the syncing view
    // actually advances to 'detail' on completion (without this the
    // progress bar fills cosmetically but the user stays stuck at 99%
    // forever). Module-level dedup inside startStatusPolling makes a
    // second call from `handleFastenEvent` a no-op.
    startStatusPollingRef.current?.();
  }, [setSyncStartTime]);

  // Check if selected person has EHR data
  const personProviders = selectedPersonId ? getProvidersForPerson(selectedPersonId) : [];
  const hasEhrData = providers.length > 0;

  // Upload jobs scoped to the currently-selected person. The landing
  // progress card and the "stay open until Done" behavior on the upload
  // modal trigger off these, and only for the person the user is looking
  // at — otherwise uploads kicked off for Person A would hijack Person B's
  // landing when the user switches profiles. Cross-person work is
  // reachable by switching profiles.
  const manualJobs = selectedPersonId
    ? uploadJobs.filter(j => j.personId === selectedPersonId)
    : [];
  const hasManualJobs = manualJobs.length > 0;
  const manualInFlight = manualJobs.some(
    j => j.status !== 'done' && j.status !== 'failed',
  );
  const manualAllTerminal = hasManualJobs && !manualInFlight;
  const manualDoneCount = manualJobs.filter(j => j.status === 'done').length;
  const manualFailedCount = manualJobs.filter(j => j.status === 'failed').length;
  const selectedPersonType = selectedPersonId
    ? (selectedPersonId === userId ? 'self' : 'family')
    : 'none';
  // A person "has data" when they have provider connections OR when they
  // completed a report upload in this session. The session flag is needed
  // because a freshly-completed `report_upload` export job can take a moment
  // to become visible to the providers list, and we don't want to strand the
  // user on the landing view in that window.
  const recentlyUploadedFor = useEhrStore(s => s.recentlyUploadedFor);
  const selectedPersonHasData =
    personProviders.length > 0 ||
    (!!selectedPersonId && !!recentlyUploadedFor[selectedPersonId]);

  const openUploadModal = useCallback((source: string) => {
    track('ehr_upload_opened', {
      source,
      section: activeWorkspaceSection,
      person_type: selectedPersonType,
    });
    setShowUploadModal(true);
  }, [activeWorkspaceSection, selectedPersonType]);

  const handleSelectPerson = useCallback((personId: string) => {
    track('ehr_person_switched', {
      section: activeWorkspaceSection,
      person_type: personId === userId ? 'self' : 'family',
    });
    selectPerson(personId);
  }, [activeWorkspaceSection, selectPerson, userId]);

  useEffect(() => {
    if (!selectedPersonId) return;
    if (viewState !== 'detail' && viewState !== 'landing') return;

    const key = `${activeWorkspaceSection}:${selectedPersonId}:${viewState}:${selectedPersonHasData}`;
    trackPageView(key, 'ehr_page_viewed', {
      section: activeWorkspaceSection,
      view_state: viewState,
      person_type: selectedPersonType,
      has_data: selectedPersonHasData,
      onboarding_complete: onboardingSeen,
    });
  }, [
    activeWorkspaceSection,
    trackPageView,
    onboardingSeen,
    selectedPersonHasData,
    selectedPersonId,
    selectedPersonType,
    viewState,
  ]);

  // Connection counts from status (filtered to selected person, ignore null worker_status)
  const personStatuses = selectedPersonId
    ? connectionStatuses.filter(s => s.worker_status !== null && (!s.person_id || s.person_id === selectedPersonId))
    : connectionStatuses.filter(s => s.worker_status !== null);
  const totalConnections = personStatuses.length;
  const completedConnections = personStatuses.filter(
    (s) => isFastenStatusSuccessful(s.worker_status)
  ).length;
  const hasAnyInProgress = personStatuses.some(
    (s) => isFastenStatusProcessing(s.worker_status)
  );

  // Fetch connection status
  const fetchConnectionStatus = useCallback(async () => {
    try {
      const res = await getFastenStatus();
      if (res?.data?.statuses) {
        setConnectionStatuses(res.data.statuses);
        return res.data.statuses;
      }
      setConnectionStatuses([]);
      return [];
    } catch {
      console.log('[EHR] Failed to fetch connection status');
      setConnectionStatuses([]);
      return [];
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  // Initialize once the persisted auth slice has rehydrated. Unauthenticated
  // visitors can browse the read-only landing — we skip fetching and drop them
  // straight onto the landing view (the actions themselves are gated behind a
  // dismissible login modal). Without this they'd sit on the skeleton forever
  // since the skeleton shows while viewState is null / isLoadingStatus is true.
  useEffect(() => {
    if (!authHasHydrated) return;

    if (!isAuthenticated || !userId) {
      setIsLoadingStatus(false);
      if (!isAuthenticated) {
        setViewState('landing');
      }
      return;
    }

    // Re-initialize whenever the authenticated user changes (e.g. logout →
    // login as a different account in the same tab). The in-memory EHR store
    // is not user-keyed, so without this the init guard would pin the prior
    // account's persons / onboarding flag for the new session. Re-running init
    // calls fetchPersons, which rewrites ehrOnboardingComplete + selectedPersonId
    // from the server for the current user.
    if (initializedForUserRef.current === userId) {
      return;
    }
    initializedForUserRef.current = userId;

    const initializeEhr = async () => {
      // First fetch connection status
      const statuses = await fetchConnectionStatus();

      // Check connection states
      const hasInProgress = statuses.some(
        (s: { worker_status: string }) => isFastenStatusProcessing(s.worker_status)
      );
      const hasCompleted = statuses.some(
        (s: { worker_status: string }) => isFastenStatusSuccessful(s.worker_status)
      );

      if (hasInProgress && !isPollingRef.current) {
        // Start background polling for status updates (but don't show syncing view)
        const inProgressStatus = statuses.find(
          (s: { worker_status: string; org_connection_id: string }) =>
            isFastenStatusProcessing(s.worker_status)
        );
        const connectionId = inProgressStatus?.org_connection_id || null;
        currentConnectionIdRef.current = connectionId;

        // Start polling in background
        setTimeout(() => startStatusPollingRef.current?.(), 0);
      }

      // If we have completed connections, force reload EHR data to ensure it's fresh
      if (hasCompleted) {
        await hardReload(userId);
        await fetchPersons(userId);
        const { providers: currentProviders } = useEhrStore.getState();
        if (currentProviders.length > 0) {
          setViewState('detail');
        } else {
          // Completed connections but no data yet - might still be processing
          setViewState('detail');
        }
      } else {
        // No completed connections - fetch normally and show landing if empty
        await fetchEhr(userId);
        await fetchPersons(userId);
        const { providers: currentProviders } = useEhrStore.getState();
        if (currentProviders.length > 0) {
          setViewState('detail');
        } else {
          setViewState('landing');
        }
      }
    };

    initializeEhr();
  }, [authHasHydrated, isAuthenticated, userId, fetchEhr, fetchPersons, router, fetchConnectionStatus, getSyncStartTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Reset refs so re-initialization works when navigating back
      isPollingRef.current = false;
      initializedForUserRef.current = undefined;
    };
  }, []);

  // Eagerly populate the per-section page caches when the workspace renders
  // so the nav cards show real counts immediately instead of stale 0s.
  useEffect(() => {
    if (!selectedPersonId) return;
    fetchConditionsPage(selectedPersonId).catch(() => undefined);
    fetchMedicationsPage(selectedPersonId).catch(() => undefined);
    fetchLabReportsPage(selectedPersonId).catch(() => undefined);
    fetchProceduresPage(selectedPersonId).catch(() => undefined);
  }, [selectedPersonId, fetchConditionsPage, fetchMedicationsPage, fetchLabReportsPage, fetchProceduresPage]);

  // Load bootstrap config — scoped to selected person
  const loadBootstrap = useCallback(async () => {
    if (!canConnectRecords) {
      setBootstrapError('Provider connections are currently available only in the United States. You can still upload reports.');
      return;
    }
    setBootstrapLoading(true);
    setBootstrapError(null);
    try {
      const personId = selectedPersonId !== userId ? selectedPersonId || undefined : undefined;
      // Allow QA to force Fasten's test sandbox via /ehr?mode=test; anything
      // else (incl. absent) falls through to the backend's 'live' default.
      const apiMode = new URLSearchParams(window.location.search).get('mode') === 'test' ? 'test' : undefined;
      const config = await getFastenBootstrap(personId, apiMode);
      setBootstrap(config);
      setViewState('connecting');
      track('ehr_connect_started', {
        source: activeWorkspaceSection,
        person_type: selectedPersonType,
      });
    } catch (err) {
      setBootstrapError('Failed to initialize connection. Please try again.');
      console.error('[EHR] Bootstrap error:', err);
    } finally {
      setBootstrapLoading(false);
    }
  }, [activeWorkspaceSection, canConnectRecords, selectedPersonId, selectedPersonType, userId]);

  // Handle Fasten widget events
  const handleFastenEvent = useCallback(async (event: unknown) => {
    const evt = event as FastenConnectionEvent & { event_type?: string };
    console.log('[EHR] Fasten event:', evt.event_type || evt.type);

    if (evt.event_type === 'patient.connection_success' || evt.type === 'patient.connection_success') {
      const connectionId = evt.org_connection_id || null;
      beginSyncingConnection(evt);

      try {
        await postFastenConnection({ ...evt, person_id: bootstrap?.personId || undefined });
        resetEhr();
        track('ehr_connection_success', {
          section: activeWorkspaceSection,
          person_type: selectedPersonType,
        });
      } catch (err) {
        console.error('[EHR] Post connection error:', err);
        clearSyncStartTime(connectionId || undefined);
        setErrorMessage('Failed to save connection. Please try again.');
        setViewState('error');
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    } else if (evt.event_type === 'widget.close' || evt.type === 'widget.close') {
      if (viewState === 'connecting') {
        setViewState(hasEhrData ? 'detail' : 'landing');
      }
    }
  }, [activeWorkspaceSection, viewState, hasEhrData, bootstrap, resetEhr, clearSyncStartTime, beginSyncingConnection, selectedPersonType]);

  // Status polling
  const startStatusPolling = useCallback(() => {
    // Don't start if already polling
    if (isPollingRef.current) {
      return;
    }

    isPollingRef.current = true;
    pollStartTimeRef.current = Date.now();

    const stopPolling = () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      isPollingRef.current = false;
    };

    const poll = async () => {
      try {
        const elapsed = Date.now() - pollStartTimeRef.current;

        // Timeout check - just go back to landing page
        if (elapsed >= POLL_TIMEOUT) {
          stopPolling();
          clearSyncStartTime(currentConnectionIdRef.current || undefined);
          // Refresh connection statuses and go to landing
          await fetchConnectionStatus();
          if (viewStateRef.current === 'syncing') {
            setViewState('landing');
          }
          return;
        }

        const response = await getFastenStatus();
        const statuses = response.data?.statuses || [];

        setConnectionStatuses(statuses);

        const relevantStatus = currentConnectionIdRef.current
          ? statuses.find((s) => s.org_connection_id === currentConnectionIdRef.current)
          : statuses[0];

        if (!relevantStatus) {
          return;
        }

        const workerStatus = relevantStatus.worker_status;

        if (isFastenStatusSuccessful(workerStatus)) {
          stopPolling();
          clearSyncStartTime(currentConnectionIdRef.current || undefined);
          setDisplayProgress(100);
          if (userId) {
            await hardReload(userId);
            await fetchPersons(userId);
          }
          await fetchConnectionStatus();
          if (viewStateRef.current === 'syncing') {
            setViewState('detail');
          }
          track('ehr_sync_complete', {
            person_type: selectedPersonType,
          });
        } else if (isFastenStatusFailed(workerStatus)) {
          stopPolling();
          clearSyncStartTime(currentConnectionIdRef.current || undefined);
          setDisplayProgress(0);
          await fetchConnectionStatus();
          if (viewStateRef.current === 'syncing') {
            setErrorMessage(relevantStatus.failure_detail || 'Failed to sync records. Please try again.');
            setViewState('error');
          }
          track('ehr_sync_failed', {
            person_type: selectedPersonType,
            reason: relevantStatus.failure_code || 'unknown',
          });
        }
      } catch (err) {
        console.error('[EHR] Status poll error:', err);
      }
    };

    poll();
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL);
  }, [userId, hardReload, clearSyncStartTime, fetchConnectionStatus, selectedPersonType]);

  // Store ref to startStatusPolling for use in initialization effect
  useEffect(() => {
    startStatusPollingRef.current = startStatusPolling;
  }, [startStatusPolling]);

  // Handle add person — auto-select the new person so the next connect attaches to them
  const handleAddPerson = useCallback(async (input: {
    name: string;
    relationship?: string;
    age?: string | number | null;
    sex?: string | null;
  }) => {
    const result = await createPerson(input);
    if (userId) await fetchPersons(userId);
    if (result.personId) {
      selectPerson(result.personId);
      track('ehr_person_created', {
        source: 'dashboard_modal',
        person_type: 'family',
      });
    }
  }, [userId, fetchPersons, selectPerson]);

  // Disconnect provider — targets the selected provider if it belongs to this
  // person, otherwise falls back to the first provider for the person.
  const handleDisconnect = useCallback(async () => {
    if (personProviders.length === 0) return;

    const targetJobId = personProviders.find(p => p.jobId === selectedProvider)?.jobId
      ?? personProviders[0].jobId;

    setDisconnecting(true);
    try {
      await disconnectFastenProvider(targetJobId);
      resetEhr();
      if (userId) await fetchEhr(userId);
      const { providers: currentProviders } = useEhrStore.getState();
      const stillHasData = currentProviders.some(p => p.personId === selectedPersonId);
      setViewState(stillHasData ? 'detail' : 'landing');
      setShowDisconnectConfirm(false);
      track('ehr_disconnected');
    } catch (err) {
      console.error('[EHR] Disconnect error:', err);
    } finally {
      setDisconnecting(false);
    }
  }, [personProviders, selectedProvider, selectedPersonId, resetEhr, userId, fetchEhr]);

  // Render loading state — also shown before init sets viewState. Render the
  // persistent chrome (greeting + section header) around the skeleton so
  // navigating in from /ehr/records — which remounts this shell — matches the
  // in-app page-to-page transitions, where the greeting stays put and only the
  // content area loads. The greeting needs the selected person's name, already
  // in the store on a warm nav; on a truly cold load we show just the section
  // header + skeleton (no fake greeting).
  if ((isLoadingStatus || ehrLoading || viewState === null) && viewState !== 'syncing') {
    // Only render the section header during loading when we already know the
    // user belongs on a *headered* page — i.e. the detail view, which only
    // shows when there's data. So gate purely on hasEhrData: on a warm nav the
    // store is already populated (true → header stays, chrome is continuous);
    // on a cold load it's empty (false → skeleton only). We deliberately do NOT
    // include onboardingSeen here — an onboarded user with no records lands on
    // the EmptyPersonPrompt (landing branch, no header), so showing "Overview"
    // for them would flash the wrong title once fetchPersons flips the flag,
    // just before viewState resolves to 'landing'.
    const showSectionHeader = hasEhrData;
    const loadingHeading = ehrPageHeading(activeWorkspaceSection);
    return (
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-6 pb-12">
          {showSectionHeader && (
            <EhrPageHeader title={loadingHeading.title} subtitle={loadingHeading.subtitle} />
          )}
          <div className="mt-4">
            <EhrSkeleton rows={5} />
          </div>
        </div>
      </div>
    );
  }

  // Upload modal — shared across landing + detail branches so the chip
  // click works regardless of viewState. The component owns all of its
  // staged-files + progress UI; the shell only decides when to mount
  // it and what Done should do (flip to detail + hard reload).
  const selectedPersonName = selectedPersonId
    ? (persons.find(p => p.person_id === selectedPersonId)?.name
        || persons.find(p => p.person_id === selectedPersonId)?.relationship
        || 'this profile')
    : 'this profile';
  const uploadModalJsx = selectedPersonId ? (
    <UploadReportsModal
      key={selectedPersonId}
      open={showUploadModal}
      onClose={() => setShowUploadModal(false)}
      personId={selectedPersonId}
      personName={selectedPersonName}
      userId={userId}
      onBeforeAccept={awaitProfile}
      onViewAllReports={() => {
        track('ehr_report_library_opened', {
          source: 'upload_modal',
          section: activeWorkspaceSection,
          person_type: selectedPersonType,
        });
        setShowLibraryModal(true);
      }}
      onDone={() => {
        // Clicking Done is the explicit signal to leave the
        // landing/processing state and see the records. fetchEhr
        // early-returns once it's been called, so hardReload is
        // required to actually repopulate providers; setViewState pulls
        // the shell out of the landing branch so the route children
        // (Overview, Lab reports, ...) start rendering. invalidate the
        // person's page caches so the Manage Records library (and the
        // section pages) refetch and show the just-uploaded reports.
        setViewState('detail');
        if (selectedPersonId) invalidatePersonPages(selectedPersonId);
        if (userId) void hardReload(userId);
      }}
    />
  ) : null;

  // Library modal — same shared-local pattern as uploadModalJsx so the
  // chip click flow can swap from "Add reports" to "View all reports"
  // without duplicating the modal mount per viewState branch.
  const libraryModalJsx = showLibraryModal && selectedPersonId ? (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto"
      onClick={() => setShowLibraryModal(false)}
    >
      <div
        className="bg-white rounded-2xl p-5 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="font-semibold text-[#141515] text-base">Uploaded reports</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowLibraryModal(false);
                openUploadModal('report_library_modal');
              }}
              className="text-[12px] font-semibold text-[#206E55] hover:text-[#1a5a46]"
            >
              Add report
            </button>
            <button
              onClick={() => setShowLibraryModal(false)}
              className="text-[#6B7370] hover:text-[#1A1E1C] p-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <ReportLibrarySection
          personId={selectedPersonId}
          onUploadReport={() => {
            setShowLibraryModal(false);
            openUploadModal('report_library_empty_state');
          }}
        />
      </div>
    </div>
  ) : null;

  // Manage Records is reachable in every data state — uploading reports is
  // what you do *before* you have EHR data, so it bypasses the landing/no-data
  // gating that the other sections sit behind. The global connecting/syncing/
  // error flows still take over (their branches run below for those states).
  if (activeWorkspaceSection === 'manage-records' && (viewState === 'landing' || viewState === 'detail')) {
    const recordsHeading = ehrPageHeading('manage-records');
    return (
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-6 pb-12">
          <EhrPageHeader
            title={recordsHeading.title}
            subtitle={recordsHeading.subtitle}
            rightSlot={
              persons.length > 0 && selectedPersonId ? (
                <div className="flex items-center gap-2">
                  <UploadStatusChip onClick={() => openUploadModal('upload_status_chip')} />
                  <PatientProfileRow
                    persons={persons}
                    selectedPersonId={selectedPersonId}
                    onSelectPerson={handleSelectPerson}
                    onAddPerson={() => openAddPerson()}
                  />
                </div>
              ) : undefined
            }
          />

          {persons.length === 0 || !selectedPersonId ? (
            <div className="py-16 text-center">
              <p className="text-[15px] text-[#1A1E1C] mb-2">No reports yet</p>
              <p className="mx-auto mb-4 max-w-sm text-[13px] text-[#6B7370]">
                Add yourself or a family member to start uploading reports.
              </p>
              <button
                onClick={() => router.push('/ehr')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#206E55] text-white text-sm font-semibold hover:bg-[#1a5a46] transition-colors"
              >
                Get started
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <HealthDashboardContext.Provider
                value={{
                  selectedPersonId,
                  onUploadReport: async () => { if (await awaitProfileGuarded()) openUploadModal('section_context'); },
                  goToSection,
                }}
              >
                {children}
              </HealthDashboardContext.Provider>
            </div>
          )}
        </div>

        <FloatingAddMenu
          onAddReport={async () => { if (await awaitProfileGuarded()) openUploadModal('floating_add_menu'); }}
          onAddProvider={async () => { if (await awaitProfileGuarded()) void loadBootstrap(); }}
          canAddProvider={canConnectRecords}
          loadingProvider={bootstrapLoading}
        />

        {uploadModalJsx}
        {libraryModalJsx}

        <AddPersonModal
          open={showAddPerson}
          onClose={() => setShowAddPerson(false)}
          onSubmit={handleAddPerson}
        />

        {profileGateElement}

        <BackgroundUploadRunner
          fileMap={backgroundUploadFilesRef}
          onJobDone={async () => {
            if (selectedPersonId) invalidatePersonPages(selectedPersonId);
            if (userId) await fetchEhr(userId);
          }}
        />
        <ToastRack />
      </div>
    );
  }

  // Render landing/onboarding
  if (viewState === 'landing' || (viewState === 'detail' && !selectedPersonHasData)) {
    return (
      <div className="h-full flex flex-col bg-[#FAFBFA] overflow-hidden">
        {/* Connection status banner */}
        {totalConnections > 0 && (
          <div className="bg-[#206E55] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              {hasAnyInProgress && (
                <Loader2 className="h-4 w-4 animate-spin text-white/80" />
              )}
              <span className="text-sm font-medium text-white">
                {completedConnections}/{totalConnections} provider{totalConnections > 1 ? 's' : ''} connected
              </span>
            </div>
            {completedConnections > 0 && (
              <button
                onClick={() => setViewState('detail')}
                className="px-4 py-1.5 bg-white text-[#206E55] text-sm font-semibold rounded-full hover:bg-white/90 transition-colors"
              >
                View Records
              </button>
            )}
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-6 pb-12 w-full">
            {/* Person selector + background upload chip — shown above
                the empty-person prompt + processing card, but NOT on
                the marketing hero (first-time user has nothing to
                switch between yet; picker just adds noise). */}
            {persons.length > 0 && selectedPersonId && (hasManualJobs || hasEhrData || onboardingSeen) && (
              <div className="mb-6 flex items-center justify-end gap-2 flex-wrap">
                <UploadStatusChip onClick={() => openUploadModal('upload_status_chip')} />
                <PatientProfileRow
                  persons={persons}
                  selectedPersonId={selectedPersonId}
                  onSelectPerson={handleSelectPerson}
                  onAddPerson={() => openAddPerson()}
                />
              </div>
            )}

            {hasManualJobs ? (
              /* Manual upload in flight — collapse the rest, center the
                 progress card. */
              <div className="max-w-xl mx-auto py-10 lg:py-16">
                <h2 className="text-[22px] sm:text-[28px] font-semibold text-[#1A1E1C] text-center tracking-[-0.02em]">
                  Processing your reports
                </h2>
                <p className="mt-2 text-[13px] text-[#6B7370] text-center max-w-md mx-auto">
                  We&apos;ll keep going in the background — feel free to wait or come back later.
                </p>
                <div className="mt-6">
                  <InFlightUploadList
                    jobs={manualJobs}
                    onDismissJob={removeUploadJob}
                    onRetryJob={retryBackgroundUploadJob}
                  />
                </div>
                {manualAllTerminal && (
                  <p className="mt-4 text-[13px] text-[#1A1E1C] text-center">
                    {manualFailedCount === 0
                      ? `All ${manualDoneCount} report${manualDoneCount === 1 ? '' : 's'} added to your record.`
                      : `${manualDoneCount} added, ${manualFailedCount} failed.`}
                  </p>
                )}
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={async () => { if (await awaitProfileGuarded()) openUploadModal('manual_upload_progress'); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#206E55] text-[#206E55] text-[13px] font-semibold hover:bg-[#F0F7F4] transition-colors"
                  >
                    Add more reports
                  </button>
                </div>
              </div>
            ) : (hasEhrData || onboardingSeen) ? (
              /* Either:
                  - household already has records but the selected person
                    doesn't (freshly-added family profile), OR
                  - user has completed onboarding but no data yet (first
                    open after the wizard).
                 Both surface the same focused prompt for the selected
                 person with direct Connect / Upload CTAs (no wizard). */
              <>
                <EmptyPersonPrompt
                  personName={persons.find(p => p.person_id === selectedPersonId)?.name || ''}
                  onConnect={async () => { if (await awaitProfileGuarded()) void loadBootstrap(); }}
                  onUpload={async () => { if (await awaitProfileGuarded()) openUploadModal('empty_person_prompt'); }}
                  canConnectRecords={canConnectRecords}
                  connecting={bootstrapLoading || isLoadingStatus}
                />
                {bootstrapError && (
                  <p className="text-red-500 text-sm text-center mt-3">{bootstrapError}</p>
                )}
              </>
            ) : (
              /* No FHIR data anywhere AND user hasn't seen onboarding —
                 the marketing landing. Get started funnels into the
                 onboarding wizard which owns Connect / Upload from
                 there. */
              <>
                <MarketingHero onGetStarted={() => openOnboarding()} />
                <PlainEnglishSection />
                <FamilySection />
                <ClosingCta
                  onGetStarted={() => openOnboarding()}
                  canConnectRecords={canConnectRecords}
                />
              </>
            )}
          </div>
        </div>

        <AddPersonModal
          open={showAddPerson}
          onClose={() => setShowAddPerson(false)}
          onSubmit={handleAddPerson}
        />

        {profileGateElement}

        {uploadModalJsx}
        {libraryModalJsx}

        {/* Mount the wizard only while open so any in-flight drafts /
            step / subScreen state is reset between sessions instead of
            leaking across opens. */}
        {showOnboardingWizard && <OnboardingWizard
          open
          onClose={() => {
            setShowOnboardingWizard(false);
          }}
          onComplete={({ pendingSyncEvent }) => {
            setShowOnboardingWizard(false);
            // If the wizard kicked off a Fasten connection, hand off to
            // the existing syncing view + status-polling loop. Sync
            // takes ~60s; without this the user would land in an empty
            // workspace mid-sync with no progress indicator. The shell
            // already owns the syncing UI + poll loop — wizard just
            // surfaces the event and we resume from there.
            if (pendingSyncEvent) {
              beginSyncingConnection(pendingSyncEvent);
              return;
            }
            // Otherwise: refresh data and land in detail view. The
            // EmptyPersonPrompt will show for any profile without
            // records.
            setViewState('detail');
            if (userId) void hardReload(userId);
          }}
        />}

        {/* Background upload pipeline — runs file uploads + status polling
            for jobs in the store. Toast rack pops a success/error toast on
            each terminal transition. */}
        <BackgroundUploadRunner
          fileMap={backgroundUploadFilesRef}
          onJobDone={async () => {
            if (userId) await fetchEhr(userId);
            // landing → detail transition is now driven by the user
            // clicking the explicit "View Records" CTA in the landing
            // progress card once the whole manual batch is terminal,
            // not by the first job to complete. Auto-flipping here would
            // tear down the progress UI mid-batch and also reveal any
            // upload modal the user opened from the landing chip.
          }}
        />
        <ToastRack />

        {/* Animations */}
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    );
  }

  // Render Fasten connect widget as modal overlay
  if (viewState === 'connecting' && bootstrap) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setViewState(hasEhrData ? 'detail' : 'landing')}
        />

        {/* Modal container */}
        <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-[0_12px_32px_rgba(24,28,26,0.10)] overflow-hidden flex flex-col animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#ECEEED]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#206E55] flex items-center justify-center shrink-0">
                <Shield className="h-[18px] w-[18px] text-white" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1A1E1C] leading-tight">Secure connection</p>
                <p className="text-[12px] text-[#6B7370]">via Fasten Health</p>
              </div>
            </div>
            <button
              onClick={() => setViewState(hasEhrData ? 'detail' : 'landing')}
              className="w-9 h-9 rounded-full hover:bg-[#F3F5F4] flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-[18px] h-[18px] text-[#6B7370]" />
            </button>
          </div>

          {/* Widget container */}
          <div className="flex-1 relative">
            <FastenConnectWidget
              publicId={bootstrap.customerPublicId}
              externalId={bootstrap.externalId}
              externalState={bootstrap.externalState}
              onEventBus={handleFastenEvent}
            />
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[#ECEEED] bg-[#FAFBFA] flex items-center justify-center gap-2">
            <Lock className="h-3.5 w-3.5 text-[#9AA39F]" />
            <span className="text-[12px] text-[#6B7370]">Your credentials are never shared with August</span>
          </div>
        </div>
      </div>
    );
  }

  // Render syncing state
  if (viewState === 'syncing') {
    const percentage = Math.round(displayProgress);
    const currentStep = percentage < 25 ? 0 : percentage < 50 ? 1 : percentage < 75 ? 2 : percentage < 100 ? 3 : 4;
    const steps = [
      { name: 'Connecting', desc: 'Establishing secure connection' },
      { name: 'Authenticating', desc: 'Verifying your identity' },
      { name: 'Downloading', desc: 'Retrieving your records' },
      { name: 'Organizing', desc: 'Processing your data' },
    ];

    return (
      <div className="flex-1 overflow-auto bg-[#FAFBFA] flex flex-col">
        {/* Keep the person switcher + upload chip visible during sync so the
            page still reads as part of the EHR workspace, not a takeover. */}
        {selectedPersonId && (
          <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 pt-6 shrink-0 flex items-center justify-end gap-2">
            <UploadStatusChip onClick={() => openUploadModal('upload_status_chip')} />
            <PatientProfileRow
              persons={persons}
              selectedPersonId={selectedPersonId}
              onSelectPerson={handleSelectPerson}
              onAddPerson={() => openAddPerson()}
            />
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg">
          {/* Header with calm lock halo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 mb-6 rounded-full bg-[#F0F7F4] flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#206E55] flex items-center justify-center">
                <Lock className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Title and description */}
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-[#1A1E1C] text-center mb-1.5">
              Syncing your records
            </h2>
            <p className="text-[13px] text-[#6B7370] text-center max-w-xs">
              This usually takes about a minute. You can safely navigate away.
            </p>
          </div>

          {/* Provider info inline */}
          {connectionEvent?.brand_name && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-7 h-7 rounded-lg bg-[#206E55] flex items-center justify-center">
                <span className="text-[12px] font-semibold text-white">
                  {connectionEvent.brand_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-[13px] font-medium text-[#1A1E1C]">{connectionEvent.brand_name}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#206E55] animate-pulse" />
            </div>
          )}

          {/* Vertical stage list */}
          <div className="space-y-2.5 mb-8">
            {steps.map((step, i) => {
              const isCompleted = i < currentStep;
              const isActive = i === currentStep;

              return (
                <div
                  key={step.name}
                  className={`flex items-center gap-3.5 rounded-[14px] p-4 border transition-colors duration-300 ${
                    isActive
                      ? 'bg-[#F0F7F4] border-[#206E55]/30'
                      : isCompleted
                      ? 'bg-white border-[#ECEEED]'
                      : 'bg-white border-[#ECEEED] opacity-60'
                  }`}
                >
                  {/* Step number or check */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive
                        ? 'bg-[#206E55]'
                        : isCompleted
                        ? 'bg-[#206E55]'
                        : 'bg-[#F3F5F4]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
                    ) : (
                      <span className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-[#9AA39F]'}`}>
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[13px] ${isActive ? 'text-[#206E55]' : 'text-[#1A1E1C]'}`}>
                      {step.name}
                    </p>
                    {isActive && (
                      <p className="text-[12px] text-[#6B7370] mt-0.5">{step.desc}</p>
                    )}
                  </div>

                  {/* Status indicator */}
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-[#206E55] animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <button
            disabled={percentage < 100}
            onClick={() => setViewState('detail')}
            className={`w-full py-3.5 rounded-2xl text-[14px] font-semibold transition-colors ${
              percentage >= 100
                ? 'bg-[#206E55] text-white hover:bg-[#1a5a46]'
                : 'bg-[#F3F5F4] text-[#9AA39F] cursor-not-allowed'
            }`}
          >
            {percentage >= 100 ? 'View your records' : 'Syncing…'}
          </button>

          {/* Security footer */}
          <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-[#9AA39F]">
            <Shield className="h-3 w-3" />
            <span>HIPAA compliant &amp; end-to-end encrypted</span>
          </div>
          </div>
        </div>
        {uploadModalJsx}
        <AddPersonModal
          open={showAddPerson}
          onClose={() => setShowAddPerson(false)}
          onSubmit={handleAddPerson}
        />
      </div>
    );
  }

  // Render error state
  if (viewState === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="max-w-sm w-full px-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[#FBECEC] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-[#C44040]" />
          </div>
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-[#1A1E1C] mb-1.5">Connection failed</h2>
          <p className="text-[13px] text-[#6B7370] mb-6">{errorMessage || 'Something went wrong. Please try again.'}</p>
          <button
            onClick={() => {
              setErrorMessage(null);
              setViewState('landing');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#206E55] text-white text-[14px] font-semibold hover:bg-[#1a5a46] transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Render EHR detail view
  if (viewState === 'detail' && selectedPersonHasData && selectedPersonId) {
    const patient = ehr.patient_profiles?.[0];
    const patientName = patient?.full_name || `${patient?.given_name || ''} ${patient?.family_name || ''}`.trim();
    const healthDashboardContext: HealthDashboardContextValue = {
      selectedPersonId,
      onUploadReport: async () => { if (await awaitProfileGuarded()) openUploadModal('section_context'); },
      goToSection,
    };

    return (
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-6 pb-12">
          {/* One header per page: a personal greeting on Overview, the section
              name on every other page. The profile picker + upload chip ride
              in the header's rightSlot. */}
          {/* Rich page sections when "All" providers selected */}
          {selectedProvider === 'all' && selectedPersonId && (() => {
            const heading = ehrPageHeading(activeWorkspaceSection);
            return (
            <>
              <EhrPageHeader
                title={heading.title}
                subtitle={heading.subtitle}
                rightSlot={
                  <div className="flex items-center gap-2">
                    <UploadStatusChip onClick={() => openUploadModal('upload_status_chip')} />
                    {selectedPersonId && (
                      <PatientProfileRow
                        patientName={patientName}
                        persons={persons}
                        selectedPersonId={selectedPersonId}
                        onSelectPerson={handleSelectPerson}
                        onAddPerson={() => openAddPerson()}
                      />
                    )}
                  </div>
                }
              />

              <div className="mt-4">
                <HealthDashboardContext.Provider value={healthDashboardContext}>
                  {children}
                </HealthDashboardContext.Provider>
              </div>
            </>
            );
          })()}

        </div>

        {/* Floating "+" FAB — expands to Add report / Add provider so the
            two entry points share one corner instead of stealing space in
            the header. */}
        <FloatingAddMenu
          onAddReport={async () => { if (await awaitProfileGuarded()) openUploadModal('floating_add_menu'); }}
          onAddProvider={async () => { if (await awaitProfileGuarded()) void loadBootstrap(); }}
          canAddProvider={canConnectRecords}
          loadingProvider={bootstrapLoading}
        />


        {/* Upload modal — opened by the "+ Add report" pill in the Lab
            Reports header for users who already have uploaded reports. */}
        {uploadModalJsx}
        {libraryModalJsx}

        {/* Provider management sheet */}
        <ProviderSheet
          open={showProviderSheet}
          onClose={() => setShowProviderSheet(false)}
          providers={personProviders}
          selectedProvider={selectedProvider}
          onSelectProvider={selectProvider}
          onAddProvider={async () => { if (await awaitProfileGuarded()) void loadBootstrap(); }}
          canAddProvider={canConnectRecords}
          addProviderLoading={bootstrapLoading}
          onDisconnect={() => { setShowProviderSheet(false); setShowDisconnectConfirm(true); }}
        />

        {/* Disconnect confirmation modal */}
        {showDisconnectConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-semibold text-[#141515] mb-2">Disconnect Provider?</h3>
              <p className="text-gray-500 text-sm mb-6">
                This will remove the health records for this provider. You can reconnect at any time.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {disconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}

        <AddPersonModal
          open={showAddPerson}
          onClose={() => setShowAddPerson(false)}
          onSubmit={handleAddPerson}
        />

        {/* Profile gate — same state as the landing branch's mount, the
            hook just renders an inert element when closed. */}
        {profileGateElement}

        {/* Background upload pipeline + toast rack. Same wiring as the
            landing branch — runner reads jobs from the store, toast rack
            pops on terminal transitions. */}
        <BackgroundUploadRunner
          fileMap={backgroundUploadFilesRef}
          onJobDone={async () => {
            if (userId) await fetchEhr(userId);
          }}
        />
        <ToastRack />
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-[#206E55]" />
    </div>
  );
}
