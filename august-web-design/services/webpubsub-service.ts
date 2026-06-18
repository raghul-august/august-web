import { WebPubSubClient } from '@azure/web-pubsub-client';
import type { AxiosError } from 'axios';
import { getNegotiateToken } from './auth-service';
import { useChatStore } from '@/stores/chat-store';
import { useAuthStore } from '@/stores/auth-store';
import { useIncognitoStore } from '@/stores/incognito-store';
import { WebPubSubMessage } from '@/types';
import { notifyError, serializeError } from './error-reporter';
import logger from '@/utils/logger';
import { trackClevertap } from '@/utils/clevertap';
import { trackTelehealth } from './telehealth-analytics';

let client: WebPubSubClient | null = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const MAX_NEGOTIATE_ATTEMPTS = 5;
let negotiateAttempts = 0;
let lastNegotiateSuccess = 0;
// Flag to suppress auto-reconnection during intentional disconnect (e.g., incognito transitions)
let intentionalDisconnect = false;
let pendingDisconnect: Promise<void> | null = null;
let pendingInit: Promise<void> | null = null;

/**
 * Initialize WebPubSub client and connect. Concurrent callers (page mount
 * effects, the reconnect timer, the connection heartbeat) share a single
 * in-flight attempt instead of racing to create duplicate clients.
 */
export function initializeWebPubSub(): Promise<void> {
  if (pendingInit) {
    return pendingInit;
  }
  pendingInit = doInitializeWebPubSub().finally(() => {
    pendingInit = null;
  });
  return pendingInit;
}

async function doInitializeWebPubSub(): Promise<void> {
  // Need a real backend session — `user` is populated only after an anon or
  // named session has been minted. Incognito mode is its own bypass.
  const { isIncognitoMode } = useIncognitoStore.getState();
  const hasSession = !!useAuthStore.getState().user;
  if (!hasSession && !isIncognitoMode) {
    return;
  }

  // Clean up existing client
  if (client) {
    await disconnectWebPubSub();
  }
  negotiateAttempts = 0;

  try {
    client = new WebPubSubClient({
      getClientAccessUrl: async () => {
        const now = Date.now();
        if (now - lastNegotiateSuccess > 60000) {
          if (negotiateAttempts >= MAX_NEGOTIATE_ATTEMPTS) {
            logger.warn('Max negotiate attempts reached, stopping WebPubSub token refresh');
            throw new Error('Max negotiate attempts exceeded');
          }
          negotiateAttempts++;
        }

        try {
          const result = await getNegotiateToken();
          negotiateAttempts = 0;
          lastNegotiateSuccess = Date.now();
          return result.url;
        } catch (error) {
          const status = (error as AxiosError)?.response?.status;
          if (status === 401) {
            logger.warn(`Negotiate token failed with 401 (attempt ${negotiateAttempts}/${MAX_NEGOTIATE_ATTEMPTS})`);
          }
          throw error;
        }
      },
    });

    setupEventListeners(client);

    await client.start();
    isConnected = true;
    reconnectAttempts = 0;

  } catch (error) {
    const serialized = serializeError(error);
    if (!isUnauthorized(error, serialized)) {
      logger.error('Failed to initialize WebPubSub', serialized);
      void notifyError('WebPubSub initialization failed', {
        details: serialized,
      });
    }
    throw error;
  }
}

/**
 * Set up WebPubSub event listeners
 */
function setupEventListeners(webPubSubClient: WebPubSubClient): void {
  webPubSubClient.on('connected', () => {
    isConnected = true;
    reconnectAttempts = 0;
  });

  webPubSubClient.on('disconnected', (event) => {
    isConnected = false;
    logger.warn('[WebPubSub] Disconnected', {
      reason: (event as { message?: string })?.message,
      intentional: intentionalDisconnect,
    });

    // Don't auto-reconnect if this was an intentional disconnect (e.g., switching to/from incognito)
    if (intentionalDisconnect) {
      return;
    }

    // Attempt reconnection if still has any session or in incognito
    if (useAuthStore.getState().user || useIncognitoStore.getState().isIncognitoMode) {
      attemptReconnection();
    }
  });

  webPubSubClient.on('server-message', (event) => {
    const logPayload =
      event.message?.data && typeof event.message.data === 'object'
        ? (event.message.data as Record<string, unknown>)
        : { value: event.message?.data };
    console.log('[WebPubSub] Received message', logPayload);
    try {
      const messageData: WebPubSubMessage =
        typeof event.message.data === 'string'
          ? JSON.parse(event.message.data)
          : event.message.data;

      // Bridge consultations.* events from the backend (case_assigned_to_clinician,
      // message.created from MDI webhook) to a window event the consult chat
      // pane subscribes to. Runs BEFORE phone-number filtering because consult
      // events are addressed by user_id (no phoneNumber field) — the phone
      // filter would otherwise risk dropping them in any future code path.
      if (
        typeof messageData.type === 'string' &&
        messageData.type.startsWith('consultations.') &&
        typeof window !== 'undefined'
      ) {
        logger.info('[WebPubSub] Dispatching consultations event', {
          type: messageData.type,
          encounterId: (messageData as Record<string, unknown>).encounter_id,
        });
        if (messageData.type === 'consultations.encounter.assigned') {
          trackTelehealth('clinician_assigned');
        } else if (messageData.type === 'consultations.prescribed_products') {
          trackTelehealth('prescription_received');
        } else if (messageData.type === 'consultations.message.created') {
          trackTelehealth('message_received', { source: 'telehealth_doctor_chat' });
        }
        try {
          window.dispatchEvent(new CustomEvent('consultations.event', { detail: messageData }));
        } catch (dispatchErr) {
          logger.warn('[WebPubSub] Failed to dispatch consultations.event', { err: serializeError(dispatchErr) });
        }
        return;
      }

      // Phone number filtering (matches mobile behavior)
      // Reject messages addressed to a different phone number
      const messagePhone = (messageData as Record<string, unknown>).phoneNumber as string | undefined;
      if (messagePhone) {
        const incognitoState = useIncognitoStore.getState();
        const expectedPhone = incognitoState.isIncognitoMode && incognitoState.incognitoPhone
          ? incognitoState.incognitoPhone
          : useAuthStore.getState().user?.phone;

        if (expectedPhone && messagePhone !== expectedPhone) {
          logger.warn('[WebPubSub] Ignoring message with mismatched phone number', {
            messagePhone,
            expectedPhone,
            isIncognitoMode: incognitoState.isIncognitoMode,
          });
          return;
        }
      }

      if (messageData.type === 'server') {
        trackClevertap('Message Received', { type: messageData.type, messageType: messageData.message_type || '', messageLength: typeof messageData.text === 'string' ? messageData.text.length : 0 });
        trackTelehealth('message_received', {
          source: useAuthStore.getState().isAuthenticated ? 'telehealth_loggeinuser_chat' : 'telehealth_anon_chat',
        });
      } else {
        trackClevertap('WebPubSub Message Received', { type: messageData.type || '' });
      }

      useChatStore.getState().handleWebPubSubMessage(messageData);
    } catch (error) {
      const serialized = serializeError(error);
      if (!isUnauthorized(error, serialized)) {
        logger.error('Error handling WebPubSub message', serialized);
        void notifyError('WebPubSub message handling error', {
          details: serialized,
        });
      }
    }
  });

  webPubSubClient.on('stopped', () => {
    isConnected = false;
  });
}

/**
 * Attempt to reconnect with exponential backoff
 */
async function attemptReconnection(): Promise<void> {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    return;
  }

  const hasSessionOrIncognito = !!useAuthStore.getState().user || useIncognitoStore.getState().isIncognitoMode;
  if (!hasSessionOrIncognito) {
    return;
  }

  if (isConnected) {
    return;
  }

  reconnectAttempts++;
  const delay = 1000 * Math.pow(2, reconnectAttempts - 1); // 1s, 2s, 4s, 8s, 16s

  setTimeout(async () => {
    try {
      const stillEligible = !!useAuthStore.getState().user || useIncognitoStore.getState().isIncognitoMode;
      if (!isConnected && stillEligible) {
        await initializeWebPubSub();
      }
    } catch (error) {
      const serialized = serializeError(error);
      if (!isUnauthorized(error, serialized)) {
        logger.error('Reconnection attempt failed', serialized);
        void notifyError('WebPubSub reconnection failed', {
          details: serialized,
        });
      }
      attemptReconnection();
    }
  }, delay);
}

/**
 * Disconnect WebPubSub client
 */
export async function disconnectWebPubSub(): Promise<void> {
  const run = async (): Promise<void> => {
    // Mark as intentional so the 'disconnected' event handler won't auto-reconnect
    intentionalDisconnect = true;
    if (client) {
      try {
        await client.stop();
      } catch (error) {
        const serialized = serializeError(error);
        if (!isUnauthorized(error, serialized)) {
          logger.error('Error stopping WebPubSub client', serialized);
          void notifyError('WebPubSub disconnect failed', {
            details: serialized,
          });
        }
      }
      client = null;
      isConnected = false;
    }
    // Reset the flag after disconnect is complete
    intentionalDisconnect = false;
  };

  pendingDisconnect = run().finally(() => {
    pendingDisconnect = null;
  });
  return pendingDisconnect;
}

/**
 * Connect if not already connected. Unlike calling initializeWebPubSub()
 * directly, this waits out any in-flight disconnect before checking — during
 * route transitions the leaving page's disconnect cleanup and the entering
 * page's connect effect run in the same commit, so a bare
 * isWebPubSubConnected() check would see the stale "connected" state, skip
 * init, and the user would be left with no connection. Concurrent callers
 * share a single init.
 */
export async function ensureWebPubSubConnected(): Promise<void> {
  if (pendingDisconnect) {
    await pendingDisconnect;
  }
  if (client && isConnected) {
    return;
  }
  return initializeWebPubSub();
}

/**
 * Check if WebPubSub is connected
 */
export function isWebPubSubConnected(): boolean {
  return isConnected;
}
const isUnauthorized = (error: unknown, serialized: { message?: string }): boolean => {
  const status = (error as AxiosError)?.response?.status;
  if (status === 401) return true;
  if (serialized.message?.includes('status code 401')) return true;
  return false;
};
