import { create } from 'zustand';
import axiosInstance from '@/lib/axios';
import { API_CONFIG } from '@/lib/config';
import { useChatStore } from '@/stores/chat-store';
import { disconnectWebPubSub, initializeWebPubSub } from '@/services/webpubsub-service';
import { fetchChatHistory } from '@/services/chat-service';
import { getLocationInfo } from '@/services/location-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import type { PatientInfo } from '@/app/prescription-refill/_patient-info';
import type { Prescription } from '@/app/prescription-refill/_medications';

/*
 * Refill context the caller can attach to create-incognito-user. The id +
 * name identify *what* is being refilled, and the prescription fields are
 * the doctor-on-file specifics (including dose). All optional so non-refill
 * incognito tenants don't have to provide them.
 */
export type RefillContext = {
  id: string;
  name: string;
  prescription?: Prescription;
};

type IncognitoState = {
  isIncognitoMode: boolean;
  incognitoToken: string | null;
  incognitoPhone: string | null;
  incognitoUserId: string | null;
  incognitoTenant: string | null;
  expiresAt: string | null;
  // Catalog id of the medication this incognito session is refilling.
  // The chat sidebar reads this to render the medication card + the mock
  // prescription details. Persisted alongside the rest of the session blob
  // so a refresh on /prescription-refill/chat doesn't lose the selection.
  selectedMedicationId: string | null;
  isLoading: boolean;
  error: string | null;
  showSessionExpiredModal: boolean;

  enterIncognitoMode: (
    tenant?: string,
    patientInfo?: PatientInfo,
    refill?: RefillContext,
  ) => Promise<boolean>;
  exitIncognitoMode: () => Promise<void>;
  handleIncognito401: () => void;
  getIncognitoToken: () => string | null;
  getIncognitoPhone: () => string | null;
  restorePersistedSession: () => boolean;
  clearIncognitoData: (options?: { clearPersisted?: boolean }) => void;
  checkSession: () => Promise<void>;
  dismissSessionExpiredModal: () => void;
  setSelectedMedicationId: (id: string | null) => void;
};

const INCOGNITO_SESSION_STORAGE_KEY = 'august-incognito-session';
const INCOGNITO_SESSION_TTL_MS = 6 * 60 * 60 * 1000;
// Single source of truth for the prescription-refill tenant slug. Used
// both by this store (session persistence is gated on it) and by the
// chat store and refill UI files (which call /auth/<tenant>/... endpoints
// and discriminate the refill flow from the regular august chat).
export const PRESCRIPTION_REFILL_TENANT = 'august-prescriptions';

type PersistedIncognitoSession = {
  incognitoToken: string;
  incognitoPhone: string | null;
  incognitoUserId: string | null;
  incognitoTenant: string;
  expiresAt: string;
  storageExpiresAt: string;
  selectedMedicationId?: string | null;
};

const isExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return true;
  const expiryMs = Date.parse(expiresAt);
  return !Number.isFinite(expiryMs) || expiryMs <= Date.now();
};

const normalizeExpiresAt = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const expiryMs = Date.parse(value);
    return Number.isFinite(expiryMs) ? new Date(expiryMs).toISOString() : null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const expiryMs = value > 10_000_000_000 ? value : value * 1000;
    return new Date(expiryMs).toISOString();
  }

  return null;
};

const getTokenExpiresAt = (token: string): string | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload || typeof atob !== 'function') return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );
    const decoded = JSON.parse(atob(paddedPayload)) as { exp?: unknown };

    if (typeof decoded.exp !== 'number') return null;
    return new Date(decoded.exp * 1000).toISOString();
  } catch {
    return null;
  }
};

const clearPersistedIncognitoSession = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(INCOGNITO_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(INCOGNITO_SESSION_STORAGE_KEY);
  } catch {
  }
};

const readPersistedIncognitoSession = (): PersistedIncognitoSession | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw =
      localStorage.getItem(INCOGNITO_SESSION_STORAGE_KEY) ||
      sessionStorage.getItem(INCOGNITO_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as Partial<PersistedIncognitoSession>;
    if (typeof session.incognitoToken !== 'string') {
      clearPersistedIncognitoSession();
      return null;
    }
    if (session.incognitoTenant && session.incognitoTenant !== PRESCRIPTION_REFILL_TENANT) {
      clearPersistedIncognitoSession();
      return null;
    }

    const storageExpiresAt = normalizeExpiresAt(session.storageExpiresAt);
    if (!storageExpiresAt || isExpired(storageExpiresAt)) {
      clearPersistedIncognitoSession();
      return null;
    }

    const expiresAt = normalizeExpiresAt(session.expiresAt) || getTokenExpiresAt(session.incognitoToken) || storageExpiresAt;
    if (isExpired(expiresAt)) {
      clearPersistedIncognitoSession();
      return null;
    }

    return {
      incognitoToken: session.incognitoToken,
      incognitoPhone: session.incognitoPhone ?? null,
      incognitoUserId: session.incognitoUserId ?? null,
      incognitoTenant: session.incognitoTenant || PRESCRIPTION_REFILL_TENANT,
      expiresAt,
      storageExpiresAt,
      selectedMedicationId:
        typeof session.selectedMedicationId === 'string'
          ? session.selectedMedicationId
          : null,
    };
  } catch {
    clearPersistedIncognitoSession();
    return null;
  }
};

const writePersistedIncognitoSession = (session: PersistedIncognitoSession) => {
  if (typeof window === 'undefined') return;
  if (session.incognitoTenant !== PRESCRIPTION_REFILL_TENANT) return;
  try {
    localStorage.setItem(INCOGNITO_SESSION_STORAGE_KEY, JSON.stringify(session));
    sessionStorage.removeItem(INCOGNITO_SESSION_STORAGE_KEY);
  } catch {
  }
};

const restoredIncognitoSession = readPersistedIncognitoSession();

export const useIncognitoStore = create<IncognitoState>((set, get) => ({
  isIncognitoMode: !!restoredIncognitoSession,
  incognitoToken: restoredIncognitoSession?.incognitoToken ?? null,
  incognitoPhone: restoredIncognitoSession?.incognitoPhone ?? null,
  incognitoUserId: restoredIncognitoSession?.incognitoUserId ?? null,
  incognitoTenant: restoredIncognitoSession?.incognitoTenant ?? null,
  expiresAt: restoredIncognitoSession?.expiresAt ?? null,
  selectedMedicationId: restoredIncognitoSession?.selectedMedicationId ?? null,
  isLoading: false,
  error: null,
  showSessionExpiredModal: false,

  enterIncognitoMode: async (
    tenant = API_CONFIG.TENANT,
    patientInfo?: PatientInfo,
    refill?: RefillContext,
  ) => {
    const endpoint = `/auth/${tenant}/create-incognito-user`;

    set({ isLoading: true, error: null });

    try {
      logger.info('[Incognito] Creating incognito user session');

      const locationInfo = getLocationInfo();
      const languageCode = typeof navigator !== 'undefined'
        ? navigator.language.split('-')[0]
        : 'en';
      const platform = 'WEB_APP';

      const requestBody: Record<string, unknown> = {
        languageCode,
        platform,
        source: 'WEB_APP',
      };
      if (locationInfo?.country) requestBody.country = locationInfo.country;
      if (locationInfo?.countryCode) requestBody.countryCode = locationInfo.countryCode;

      // Compose a `user_details` block from the refill-details form +
      // medication context. Each field is opt-in (empty strings drop,
      // age is parsed to a number, prescription is only attached when a
      // medication was forwarded). The whole `user_details` key is only
      // included on the request if at least one field made it in, so
      // non-refill tenants stay byte-identical to today.
      const userDetails: Record<string, unknown> = {};

      if (patientInfo) {
        const first = patientInfo.firstName.trim();
        const last = patientInfo.lastName.trim();
        if (first) userDetails.firstName = first;
        if (last) userDetails.lastName = last;
        if (patientInfo.age) {
          const ageNum = parseInt(patientInfo.age, 10);
          if (Number.isFinite(ageNum) && ageNum > 0) userDetails.age = ageNum;
        }
        if (patientInfo.gender) userDetails.gender = patientInfo.gender;
      }

      if (refill) {
        const prescription: Record<string, unknown> = {
          id: refill.id,
          name: refill.name,
        };
        if (refill.prescription) {
          Object.assign(prescription, refill.prescription);
        }
        userDetails.prescription = prescription;
      }

      if (Object.keys(userDetails).length > 0) {
        requestBody.user_details = userDetails;
      }

      const response = await axiosInstance.post(endpoint, requestBody);

      if (response.data.success) {
        const { accessToken, user } = response.data;
        const storageExpiresAt = new Date(Date.now() + INCOGNITO_SESSION_TTL_MS).toISOString();
        const expiresAt = normalizeExpiresAt(response.data.expiresAt) || getTokenExpiresAt(accessToken) || storageExpiresAt;

        logger.info('[Incognito] Incognito session created successfully', {
          userId: user.userId,
          phone: user.phone,
          expiresAt,
        });

        const nextSession: PersistedIncognitoSession = {
          incognitoToken: accessToken,
          incognitoPhone: user.phone,
          incognitoUserId: user.userId,
          incognitoTenant: tenant,
          expiresAt,
          storageExpiresAt,
          // A brand-new incognito session starts with no medication picked.
          selectedMedicationId: null,
        };

        set({
          isIncognitoMode: true,
          ...nextSession,
          expiresAt,
          isLoading: false,
          error: null,
        });
        writePersistedIncognitoSession(nextSession);

        logger.info('[Incognito] Clearing cached data from stores');
        useChatStore.getState().clearMessages();

        logger.info('[Incognito] Disconnecting existing WebPubSub connection');
        await disconnectWebPubSub();

        // Initialize new WebPubSub connection with incognito token
        logger.info('[Incognito] Initializing WebPubSub with incognito token');
        await initializeWebPubSub();

        return true;
      } else {
        throw new Error('Failed to create incognito session');
      }
    } catch (error: unknown) {
      logger.error('[Incognito] Failed to enter incognito mode:', serializeError(error));
      set({
        isLoading: false,
        error: (error instanceof Error ? error.message : null) || 'Failed to create incognito session',
      });
      return false;
    }
  },

  exitIncognitoMode: async () => {
    logger.info('[Incognito] Exiting incognito mode');

    try {
      logger.info('[Incognito] Disconnecting incognito WebPubSub connection');
      await disconnectWebPubSub();

      set({
        isIncognitoMode: false,
        incognitoToken: null,
        incognitoPhone: null,
        incognitoUserId: null,
        incognitoTenant: null,
        expiresAt: null,
        selectedMedicationId: null,
        isLoading: false,
        error: null,
        showSessionExpiredModal: false,
      });
      clearPersistedIncognitoSession();

      logger.info('[Incognito] Clearing cached data from stores');
      useChatStore.getState().clearMessages();
      useChatStore.getState().setIsWaitingForResponse(false);
      useChatStore.getState().setIsProcessingFile(false);

      logger.info('[Incognito] Re-initializing WebPubSub with regular token');
      await initializeWebPubSub();

      // Fetch chat history after exiting incognito mode
      try {
        await fetchChatHistory();
        logger.info('[Incognito] Fetched chat history after exiting incognito mode');
      } catch (error) {
        logger.error('[Incognito] Failed to fetch chat history after exiting incognito:', serializeError(error));
      }

      logger.info('[Incognito] Successfully exited incognito mode');
    } catch (error) {
      logger.error('[Incognito] Error exiting incognito mode:', serializeError(error));
      set({
        isIncognitoMode: false,
        incognitoToken: null,
        incognitoPhone: null,
        incognitoUserId: null,
        incognitoTenant: null,
        expiresAt: null,
        selectedMedicationId: null,
        isLoading: false,
        error: null,
        showSessionExpiredModal: false,
      });
      clearPersistedIncognitoSession();
      useChatStore.getState().clearMessages();
      useChatStore.getState().setIsWaitingForResponse(false);
      useChatStore.getState().setIsProcessingFile(false);
    }
  },

  handleIncognito401: () => {
    const { isIncognitoMode } = get();

    if (isIncognitoMode) {
      logger.info('[Incognito] Handling 401 error in incognito mode');

      set({
        isIncognitoMode: false,
        incognitoToken: null,
        incognitoPhone: null,
        incognitoUserId: null,
        incognitoTenant: null,
        expiresAt: null,
        selectedMedicationId: null,
        isLoading: false,
        error: null,
        showSessionExpiredModal: true,
      });
      clearPersistedIncognitoSession();

      useChatStore.getState().clearMessages();
      useChatStore.getState().setIsWaitingForResponse(false);
    }
  },

  getIncognitoToken: () => {
    return get().incognitoToken;
  },

  getIncognitoPhone: () => {
    return get().incognitoPhone;
  },

  restorePersistedSession: () => {
    const session = readPersistedIncognitoSession();
    if (!session) return false;

    set({
      isIncognitoMode: true,
      incognitoToken: session.incognitoToken,
      incognitoPhone: session.incognitoPhone,
      incognitoUserId: session.incognitoUserId,
      incognitoTenant: session.incognitoTenant,
      expiresAt: session.expiresAt,
      selectedMedicationId: session.selectedMedicationId ?? null,
      isLoading: false,
      error: null,
      showSessionExpiredModal: false,
    });
    return true;
  },

  clearIncognitoData: (options) => {
    logger.info('[Incognito] Clearing incognito data');
    set({
      isIncognitoMode: false,
      incognitoToken: null,
      incognitoPhone: null,
      incognitoUserId: null,
      incognitoTenant: null,
      expiresAt: null,
      selectedMedicationId: null,
      isLoading: false,
      error: null,
      showSessionExpiredModal: false,
    });
    if (options?.clearPersisted) {
      clearPersistedIncognitoSession();
    }
  },

  setSelectedMedicationId: (id) => {
    set({ selectedMedicationId: id });

    // Mirror the change into the persisted session blob so a hard refresh on
    // /prescription-refill/chat keeps the same medication selected.
    const state = get();
    if (!state.isIncognitoMode || !state.incognitoToken) return;
    if (state.incognitoTenant !== PRESCRIPTION_REFILL_TENANT) return;
    if (!state.expiresAt) return;

    const existing = readPersistedIncognitoSession();
    if (!existing) return;

    writePersistedIncognitoSession({
      ...existing,
      selectedMedicationId: id,
    });
  },

  checkSession: async () => {
    const { isIncognitoMode, incognitoToken, expiresAt, incognitoTenant } = get();

    if (!isIncognitoMode || !incognitoToken) {
      return;
    }

    if (isExpired(expiresAt)) {
      logger.info('[Incognito] Session expired locally');
      get().handleIncognito401();
      return;
    }

    try {
      // Lightweight token validation — just ping the server to check if the session is alive.
      // We do NOT call fetchChatHistory here because incognito messages are purely in-memory
      // and fetching history would overwrite/wipe them via setMessages.
      await axiosInstance.get(`/user/${incognitoTenant || API_CONFIG.TENANT}/get-chats?source=WEB_APP&limit=1`);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        logger.info('[Incognito] Session expired during polling check');
        get().handleIncognito401();
      } else {
        logger.error('[Incognito] Error checking session:', serializeError(error));
      }
    }
  },

  dismissSessionExpiredModal: () => {
    set({ showSessionExpiredModal: false });
  },
}));
