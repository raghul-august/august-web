'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { useAuthStore } from '@/stores/auth-store';
import { useChatStore } from '@/stores/chat-store';
import { initializeAuth, migrateMemory, createAnonymousSession } from '@/services/auth-service';
import { fetchChatHistory, sendMessage } from '@/services/chat-service';
import { sendMessageStreaming } from '@/services/streaming-service';
import { initializeWebPubSub, disconnectWebPubSub } from '@/services/webpubsub-service';
import { ChatSkeleton } from './chat-skeleton';
import { DownloadPromptModal, PromptMilestone } from './download-prompt-modal';
import { downloadPromptConfigs, MESSAGE_THRESHOLDS, APP_DOWNLOAD_URL_ANON } from './download-prompt-config';
import { IncognitoEmptyState } from './incognito-empty-state';
import { IncognitoExitConfirmModal } from './incognito-exit-confirm-modal';
import { IncognitoSessionExpiredModal } from './incognito-session-expired-modal';
import { useIncognitoStore } from '@/stores/incognito-store';
import { track } from '@/services/analytics-service';
import { getTelehealthBaseParams } from '@/services/telehealth-analytics';
import { trackClevertap } from '@/utils/clevertap';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { Navbar, Sidebar } from '@/components/layout';
import { BookmarkBanner } from '@/components/pwa/bookmark-banner';
import { useTabNotification } from '@/hooks/use-tab-notification';
import { useI18n } from '@/components/providers';
import { t } from 'i18next';
import { TextSize } from '@/types';
import { ANON_ALLOWED_KEY } from '@/lib/anon-access';

const AUTH_TIMEOUT_MS = 40000;
const CHAT_HISTORY_TIMEOUT_MS = 15000;
const WEB_PUBSUB_TIMEOUT_MS = 10000;
const MEMORY_STORAGE_KEY = 'health_memory_transfer';
const PENDING_MSG_KEY = 'august_pending_msg';

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new TimeoutError(errorMessage));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}


let lastProcessedQueryParamMsg: string | null = null;

interface ChatContainerProps {
  showDisabledSendWhenEmpty?: boolean;
}

export function ChatContainer({ showDisabledSendWhenEmpty = false }: ChatContainerProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [downloadPromptMilestone, setDownloadPromptMilestone] = useState<PromptMilestone | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isTransferringMemory, setIsTransferringMemory] = useState(false);
  const [inputPrefillText, setInputPrefillText] = useState<string | undefined>();
  const { user, isLoading: authLoading, isAnonymous, isAuthenticated } = useAuthStore();
  const { messages, clearMessages } = useChatStore();
  const {
    isIncognitoMode,
    showSessionExpiredModal,
    dismissSessionExpiredModal,
    enterIncognitoMode,
    exitIncognitoMode,
    clearIncognitoData,
    checkSession,
  } = useIncognitoStore();
  const prevIncognitoModeRef = useRef(isIncognitoMode);
  const searchParams = useSearchParams();
  const router = useRouter();
  const prevAuthState = useRef({
    isAnonymous,
    isAuthenticated,
  });
  const webPubSubInitAttempts = useRef(0);
  const webPubSubRetryTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasStartedWebPubSub = useRef(false);
  const shownPromptsThisSession = useRef<Set<PromptMilestone>>(new Set());
  const prevUserMessageCount = useRef<number | null>(null); // null until initialized
  const { t } = useI18n();

  // Anon chat is only allowed once the user has arrived via a tool/widget CTA
  // (URL carries ?msg=, ?src=, or ?anon_telehealth=true) at least once. The flag is
  // persisted in localStorage by LoginModalWatcher.
  const anonChatBackendEnabled = process.env.NEXT_PUBLIC_ENABLE_ANONCHAT === 'true';
  const [anonFromWidget, setAnonFromWidget] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setAnonFromWidget(localStorage.getItem(ANON_ALLOWED_KEY) === '1');
    } catch {
      setAnonFromWidget(false);
    }
  }, [searchParams]);

  const anonChatEnabled = anonChatBackendEnabled && anonFromWidget;

  const botMessageCount = messages.filter((m) => m.sender === 'bot').length;
  // Drives the tab-notification "unread while modal is up" logic. The modal
  // itself is rendered by LoginModalWatcher in the (webapp) layout — this flag
  // is ONLY used for `useTabNotification` behavior here.
  const showSignUpModal = !isAuthenticated && !anonChatEnabled;
  useTabNotification({ botMessageCount, showSignUpModal });

  const loadChatHistory = useCallback(() => {
    return withTimeout(
      fetchChatHistory(),
      CHAT_HISTORY_TIMEOUT_MS,
      'Chat history request timed out'
    );
  }, []);

  const replayPendingQueryMessage = useCallback(async () => {
    let text: string | null = null;
    try {
      text = sessionStorage.getItem(PENDING_MSG_KEY);
    } catch {
      return;
    }
    if (!text || !text.trim()) return;
    if (!useAuthStore.getState().getAccessToken()) return;
    try {
      sessionStorage.removeItem(PENDING_MSG_KEY);
    } catch {
      // ignore
    }
    try {
      track('send_message', { context: 'auto_query_param_deferred', is_anon: false });
      trackClevertap('Sent Message', { type: 'text', hasText: true });
      await sendMessage(text.trim());
    } catch (error) {
      logger.error('Failed to replay pending query-param message after login', serializeError(error));
    }
  }, []);

  // Real-time chat needs a real backend session. `user` is only non-null
  // after initializeAuth has minted (or restored) a session — anon OR named.
  // A fresh visitor with only the default `isAnonymous: true` flag has no
  // token yet, so we key off user.
  const hasSession = !!user;

  const startWebPubSub = useCallback(async () => {
    if (!hasSession) {
      return;
    }
    if (hasStartedWebPubSub.current) {
      return;
    }
    if (webPubSubInitAttempts.current >= 2) {
      return;
    }

    const attemptNumber = webPubSubInitAttempts.current + 1;
    webPubSubInitAttempts.current = attemptNumber;

    try {
      await withTimeout(
        initializeWebPubSub(),
        WEB_PUBSUB_TIMEOUT_MS,
        'WebPubSub initialization timed out'
      );
      hasStartedWebPubSub.current = true;
    } catch (error) {
      logger.error('WebPubSub initialization attempt failed', serializeError(error));
      if (attemptNumber < 2 && hasSession) {
        if (webPubSubRetryTimeout.current) {
          clearTimeout(webPubSubRetryTimeout.current);
        }
        webPubSubRetryTimeout.current = setTimeout(() => {
          startWebPubSub();
        }, 2000);
      }
    }
  }, [hasSession]);

  useEffect(() => {
    if (!hasSession) {
      hasStartedWebPubSub.current = false;
      webPubSubInitAttempts.current = 0;
      if (webPubSubRetryTimeout.current) {
        clearTimeout(webPubSubRetryTimeout.current);
        webPubSubRetryTimeout.current = null;
      }
    }
  }, [hasSession]);

  useEffect(() => {
    const prev = prevAuthState.current;
    const becameAuthenticated = !prev.isAuthenticated && isAuthenticated;
    const exitedAnonymous = prev.isAnonymous && !isAnonymous;

    if ((becameAuthenticated || exitedAnonymous) && !isInitializing && !authLoading) {
      loadChatHistory()
        .catch((error) => {
          logger.error('Failed to refresh chat history after auth change', serializeError(error));
        })
        .finally(() => {
          void replayPendingQueryMessage();
        });
      void startWebPubSub();
    }

    prevAuthState.current = { isAnonymous, isAuthenticated };
  }, [isAnonymous, isAuthenticated, isInitializing, authLoading, loadChatHistory, startWebPubSub, replayPendingQueryMessage]);

  useEffect(() => {
    track('chat_page_viewed', {
      is_anon: isAnonymous,
      anon_chat_enabled: anonChatEnabled,
    });
    trackClevertap('Screen View', { name: 'Chat' });
  }, []);

  useEffect(() => {
    if (isInitializing || authLoading) return;
    // Memory transfer is only relevant to signed-in users
    if (!isAuthenticated) return;

    const handlePendingMemoryTransfer = async () => {
      try {
        const memory = sessionStorage.getItem(MEMORY_STORAGE_KEY);
        if (memory) {
          setIsTransferringMemory(true);
          try {
            await migrateMemory({ memory });
            sessionStorage.removeItem(MEMORY_STORAGE_KEY);
            setInputPrefillText(t('auth.signup.memoryTransferSuccess'));
          } catch (transferError) {
            logger.error('Memory transfer failed', serializeError(transferError));
          } finally {
            setIsTransferringMemory(false);
          }
        }
      } catch {
      }
    };

    handlePendingMemoryTransfer();
  }, [isInitializing, authLoading, isAuthenticated, isAnonymous]);

  useEffect(() => {
    const memoryParam = searchParams.get('memory');
    if (memoryParam && memoryParam.trim()) {
      try {
        sessionStorage.setItem(MEMORY_STORAGE_KEY, memoryParam.trim());
        router.replace('/chat', { scroll: false });
      } catch (error) {
        logger.error('Failed to store memory param in sessionStorage', serializeError(error));
      }
    }
  }, [searchParams, router]);

  // Initialize auth and services on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setIsInitializing(true);
        setErrorKey(null);

        // Check if we had an existing token before auth
        const hadExistingToken = !!useAuthStore.getState().getAccessToken();

        // Initialize anonymous auth
        const authResponse = await withTimeout(
          initializeAuth(),
          AUTH_TIMEOUT_MS,
          'Auth initialization timed out'
        );

        if (!mounted) return;

        if (!authResponse || !authResponse.success) {
          setErrorKey('chat.initFailed');
          return;
        }

        // Only fetch history if restoring an existing session or authenticated
        // Fresh anonymous users have no server-side history — skip the round
        // trip, but still run the empty-history store transitions so
        // applyConditionalOnboardingMessage seeds the "Hey there, I'm August!"
        // bubble. Without this the chat renders the anonymous EmptyState
        // instead of the onboarding chat (chat-store.ts:79-90 require
        // hasMoreMessages=false + setMessages call before the bubble attaches).
        if (hadExistingToken || !authResponse.isAnonymous) {
          await loadChatHistory();
        } else {
          const store = useChatStore.getState();
          store.setHasMoreMessages(false);
          store.setMessages([]);
        }

      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        const errorMessage = err instanceof Error ? err.message : String(err);

        if (!mounted) return;

        // 401 here means the axios interceptor already called evictSession().
        if (status === 401) {
          const store = useAuthStore.getState();
          if (store.isAnonymous) {
            // Anonymous user whose tokens went stale — silently start fresh.
            try {
              const retry = await createAnonymousSession();
              if (mounted && retry.success) {
                return;
              }
            } catch (retryErr) {
              logger.error(
                'Anonymous session retry failed after 401',
                serializeError(retryErr)
              );
            }
          } else {
            // Evicted signed-in user — let showSignUpModal render. No error screen.
            return;
          }
        }

        let errorKey = 'chat.genericError';
        let logContext = 'unknown';

        if (err instanceof TimeoutError) {
          setIsConnectionError(true);
          logContext = 'timeout';
        } else if (
          errorMessage.includes('Turnstile') ||
          errorMessage.includes('challenge failed') ||
          errorMessage.includes('challenge expired')
        ) {
          errorKey = 'chat.verificationFailed';
          logContext = 'turnstile_verification';
        } else if (errorMessage.includes('auth') || errorMessage.includes('session')) {
          logContext = 'auth_initialization';
        } else if (errorMessage.includes('chat') || errorMessage.includes('history')) {
          logContext = 'chat_history';
        }

        if (status !== 401) {
          logger.error(`Chat initialization failed [${logContext}]`, {
            error: serializeError(err),
            status,
            errorMessage,
          });
        }
        setErrorKey(errorKey);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      mounted = false;
      disconnectWebPubSub();
      if (webPubSubRetryTimeout.current) {
        clearTimeout(webPubSubRetryTimeout.current);
        webPubSubRetryTimeout.current = null;
      }
    };
  }, [loadChatHistory, retryCount]);
  useEffect(() => {
    if (hasSession && !isInitializing) {
      void startWebPubSub();
    }
  }, [hasSession, isInitializing, startWebPubSub]);

  // Handle query param auto-send message
  useEffect(() => {
    // Only process after initialization is complete
    if (isInitializing || authLoading) {
      return;
    }

    // Clear transient params (src, slug) from the URL
    const url = new URL(window.location.href);
    if (url.searchParams.has('src') || url.searchParams.has('slug')) {
      url.searchParams.delete('src');
      url.searchParams.delete('slug');
      window.history.replaceState({}, '', url.pathname + url.search);
    }

    const msgParam = searchParams.get('msg');

    // Skip if no message, or if we already processed this exact message
    if (!msgParam || !msgParam.trim() || msgParam === lastProcessedQueryParamMsg) {
      return;
    }
    lastProcessedQueryParamMsg = msgParam;

    const text = msgParam.trim();
    const msgUrl = new URL(window.location.href);
    msgUrl.searchParams.delete('msg');
    window.history.replaceState({}, '', msgUrl.pathname + msgUrl.search);

    if (!useAuthStore.getState().getAccessToken()) {
      try {
        sessionStorage.setItem(PENDING_MSG_KEY, text);
      } catch (error) {
        logger.error('Failed to stash deferred query-param message', serializeError(error));
      }
      return;
    }

    const sendAutoMessage = async () => {
      try {
        track('send_message', {
          ...getTelehealthBaseParams(),
          source: isAuthenticated ? 'telehealth_loggeinuser_chat' : 'telehealth_anon_chat',
          context: 'auto_query_param',
          is_anon: !isAuthenticated,
        });
        trackClevertap('Sent Message', { type: 'text', hasText: true });
        await sendMessage(text);
      } catch (error) {
        logger.error('Failed to send auto message from query param', serializeError(error));
      }
    };

    sendAutoMessage();
  }, [isInitializing, authLoading, isAnonymous, isAuthenticated, searchParams]);


  useEffect(() => {
    // Skip the 5/10/15-message download prompts for users who entered anon
    // chat via the telehealth widget (?anon_telehealth=true)
    if (!anonChatEnabled || !isAnonymous || isInitializing || authLoading || anonFromWidget) {
      return;
    }

    const userMessageCount = messages.filter((m) => m.sender === 'user').length;
    if (prevUserMessageCount.current === null) {
      prevUserMessageCount.current = userMessageCount;
      return;
    }
    if (userMessageCount > prevUserMessageCount.current) {
      for (const threshold of MESSAGE_THRESHOLDS) {
        const milestone = `messages_${threshold}` as PromptMilestone;
        if (
          userMessageCount >= threshold &&
          prevUserMessageCount.current < threshold &&
          !shownPromptsThisSession.current.has(milestone)
        ) {
          shownPromptsThisSession.current.add(milestone);
          setDownloadPromptMilestone(milestone);
          break;
        }
      }
    }

    prevUserMessageCount.current = userMessageCount;
  }, [messages, anonChatEnabled, isAnonymous, isInitializing, authLoading, anonFromWidget]);

  // Incognito: track analytics when entering incognito mode
  useEffect(() => {
    if (isIncognitoMode && !prevIncognitoModeRef.current) {
      track('Incognito Mode Entered');
      trackClevertap('Incognito Button clicked', { page: 'chat' });
    }
    prevIncognitoModeRef.current = isIncognitoMode;
  }, [isIncognitoMode]);

  // Incognito: session polling every 5 minutes (matching mobile)
  useEffect(() => {
    if (!isIncognitoMode) return;
    const POLLING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      await checkSession();
      if (useIncognitoStore.getState().isIncognitoMode) {
        timeoutId = setTimeout(poll, POLLING_INTERVAL_MS);
      }
    };

    // Web equivalent of AppState: use document.visibilitychange
    const handleVisibilityChange = () => {
      if (!document.hidden && useIncognitoStore.getState().isIncognitoMode) {
        if (timeoutId) clearTimeout(timeoutId);
        poll();
      } else if (document.hidden) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    timeoutId = setTimeout(poll, POLLING_INTERVAL_MS);
    logger.info('[Incognito] Started session polling');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
        logger.info('[Incognito] Stopped session polling');
      }
    };
  }, [isIncognitoMode, checkSession]);

  const handleIncognitoEnter = useCallback(async () => {
    const success = await enterIncognitoMode();
    if (!success) {
      logger.error('Failed to enter incognito mode');
    }
  }, [enterIncognitoMode]);

  const handleConfirmExitIncognito = useCallback(async () => {
    setShowExitConfirm(false);
    track('Incognito Mode Closed', {
      hasMessages: messages.length > 0,
    });
    trackClevertap('Incognito Mode Closed', { page: 'chat', hasMessages: messages.length > 0 });
    clearMessages();
    await exitIncognitoMode();
  }, [exitIncognitoMode, clearMessages, messages.length]);

  // Clear incognito on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (useIncognitoStore.getState().isIncognitoMode) {
        clearIncognitoData();
        clearMessages();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [clearIncognitoData, clearMessages]);

  const handleDownloadPromptPrimary = () => {
    setDownloadPromptMilestone(null);
    window.open(APP_DOWNLOAD_URL_ANON, '_blank');
  };

  const handleDownloadPromptSecondary = () => {
    if (downloadPromptMilestone === 'messages_15') {
      setDownloadPromptMilestone(null);
      router.push('/chat');
    } else {
      setDownloadPromptMilestone(null);
    }
  };

  const handlePrefillConsumed = useCallback(() => setInputPrefillText(undefined), []);

  // Show loading state with skeleton
  if (isInitializing || authLoading) {
    return <ChatSkeleton />;
  }

  const handleRetry = () => {
    setIsConnectionError(false);
    setErrorKey(null);
    setRetryCount((c) => c + 1);
  };

  if (isConnectionError) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-700 font-medium">{t('chat.connectionError.title')}</p>
          <p className="mt-1 text-sm text-gray-500">{t('chat.connectionError.subtitle')}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-6 py-2 bg-[#206E55] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('chat.connectionError.retry')}
          </button>
        </div>
      </div>
    );
  }
  if (isTransferringMemory) {
    return <ChatSkeleton message="Loading your memory..." />;
  }

  // Show error state
  const localizedError = errorKey ? t(errorKey) : null;

  if (localizedError) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive font-medium">{localizedError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-[#206E55] hover:underline"
          >
            {t('common.refreshPage')}
          </button>
        </div>
      </div>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full w-full flex overflow-hidden bg-background">
      {/* SignUpModal is rendered by LoginModalWatcher in the (webapp) layout
          (and per-route wrappers for non-tracked chat-app routes) so it
          works on every chat-app route, not just /chat. */}

      {/* Download Prompt Modal for anon users */}
      {downloadPromptMilestone && anonChatEnabled && isAnonymous && (
        <DownloadPromptModal
          config={downloadPromptConfigs[downloadPromptMilestone]}
          milestone={downloadPromptMilestone}
          onPrimaryClick={handleDownloadPromptPrimary}
          onSecondaryClick={handleDownloadPromptSecondary}
        />
      )}

      {/* Incognito Modals */}
      <IncognitoExitConfirmModal
        open={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirm={handleConfirmExitIncognito}
      />
      <IncognitoSessionExpiredModal
        open={showSessionExpiredModal}
        onClose={dismissSessionExpiredModal}
      />

      {/* Sidebar - CSS handles desktop (persistent) vs mobile (sheet) */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} textSize={textSize} onTextSizeChange={setTextSize} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Navbar */}
        <Navbar
          onMenuClick={() => {
            track('side_menu_open');
            trackClevertap('Menu button clicked', { page: 'chat' });
            setSidebarOpen(true);
          }}
          textSize={textSize}
          onTextSizeChange={setTextSize}
          onIncognitoEnter={handleIncognitoEnter}
        onIncognitoExit={() => setShowExitConfirm(true)}
      />

        {/* Desktop-only bookmark nudge */}
        {!isAnonymous && <BookmarkBanner />}

        {/* Chat area - takes remaining height */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {isIncognitoMode && !hasMessages ? (
            <div className="flex-1 flex flex-col min-h-0 w-full max-w-3xl mx-auto">
              <IncognitoEmptyState />
              <MessageInput textSize={textSize} showDisabledSendWhenEmpty={showDisabledSendWhenEmpty} />
            </div>
          ) : hasMessages ? (
            <>
              {/* Message list - scrollable, full width with centered content */}
              <MessageList textSize={textSize} />
              {/* Bottom area - centered */}
              <div className="w-full max-w-3xl mx-auto">
                {/* Quota indicator - anchored above input (only for anonymous users, hidden in incognito) */}
                {!isIncognitoMode && isAnonymous && !anonFromWidget && messages.length > 1 && <QuotaIndicator messageCount={messages.filter(m => m.sender === 'user').length} />}
                {/* Message input - fixed at bottom */}
                <MessageInput textSize={textSize} prefillText={inputPrefillText} onPrefillConsumed={handlePrefillConsumed} showDisabledSendWhenEmpty={showDisabledSendWhenEmpty} />
              </div>
            </>
          ) : isAuthenticated ? (
            <div className="flex-1 flex flex-col min-h-0 w-full max-w-3xl mx-auto">
              <div className="flex-1" />
              <MessageInput textSize={textSize} prefillText={inputPrefillText} onPrefillConsumed={handlePrefillConsumed} showDisabledSendWhenEmpty={showDisabledSendWhenEmpty} />
            </div>
          ) : (
            <EmptyState textSize={textSize} prefillText={inputPrefillText} onPrefillConsumed={handlePrefillConsumed} showDisabledSendWhenEmpty={showDisabledSendWhenEmpty} />
          )}
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  textSize?: TextSize;
  prefillText?: string;
  onPrefillConsumed?: () => void;
  showDisabledSendWhenEmpty?: boolean;
}

function EmptyState({ textSize = 'small', prefillText, onPrefillConsumed, showDisabledSendWhenEmpty = false }: EmptyStateProps) {
  const { t } = useI18n();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
      {/* Logo */}
      <div className="mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="40" viewBox="0 0 44 40" fill="none">
          <path d="M13.1319 40C10.4634 40 8.14599 39.554 6.17972 38.662C4.21344 37.77 2.69192 36.5023 1.61515 34.8592C0.538385 33.169 0 31.2207 0 29.0141C0 26.9014 0.468161 25.0235 1.40448 23.3803C2.3408 21.6901 3.7921 20.2817 5.75837 19.1549C7.72465 18.0282 10.2059 17.23 13.2021 16.7606L25.702 14.7183V21.7606L14.9577 23.5916C13.1319 23.9202 11.7742 24.507 10.8847 25.3521C9.99523 26.1972 9.55047 27.3005 9.55047 28.662C9.55047 29.9765 10.042 31.0329 11.0252 31.831C12.0551 32.5822 13.3192 32.9577 14.8173 32.9577C16.7367 32.9577 18.4221 32.5587 19.8734 31.7606C21.3715 30.9155 22.5185 29.7653 23.3144 28.3099C24.1571 26.8545 24.5784 25.2582 24.5784 23.5211V13.662C24.5784 12.0188 23.923 10.6573 22.6122 9.57747C21.3481 8.45071 19.6627 7.88732 17.556 7.88732C15.5897 7.88732 13.8341 8.42723 12.2892 9.50704C10.7911 10.5399 9.69092 11.9249 8.98868 13.662L1.47471 10C2.22376 7.98122 3.39416 6.24413 4.98591 4.78873C6.62447 3.28639 8.54393 2.11268 10.7443 1.26761C12.9446 0.422535 15.3323 0 17.9071 0C21.0438 0 23.806 0.586855 26.1936 1.76057C28.5812 2.88733 30.4304 4.48357 31.7413 6.5493C33.0989 8.56808 33.7778 10.939 33.7778 13.662V39.1549H25.07V32.6056L27.0363 32.4648C26.0531 34.108 24.8827 35.493 23.5251 36.6197C22.1674 37.6995 20.6225 38.5446 18.8903 39.1549C17.1581 39.7183 15.2386 40 13.1319 40Z" fill="#206E55"/>
          <circle cx="40.001" cy="35.1113" r="4" fill="#206E55"/>
        </svg>
      </div>

      {/* Greeting */}
      <div className="text-center mb-1">
        <h2 className="text-[32px] font-bold leading-[34px] text-[#272A29]">
          {t('chat.emptyStateHeading')}
        </h2>
      </div>

      {/* Chat input*/}
      <div className="w-full max-w-xl">
        <MessageInput centered textSize={textSize} prefillText={prefillText} onPrefillConsumed={onPrefillConsumed} showDisabledSendWhenEmpty={showDisabledSendWhenEmpty} />
      </div>
    </div>
  );
}

const FREE_QUESTION_LIMIT = 15;

function QuotaIndicator({ messageCount }: { messageCount: number }) {
  const remaining = Math.max(0, FREE_QUESTION_LIMIT - messageCount);

  return (
    <div className="flex justify-center py-2">
      <div
        className="inline-flex justify-center items-center"
        style={{
          padding: '6px 20px',
          gap: '10px',
          borderRadius: '74px',
          backgroundColor: 'rgba(59, 169, 125, 0.05)',
        }}
      >
        <span
          style={{
            color: '#3BA97D',
            fontFamily: '"SF Pro", system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: 'normal',
          }}
        >
          {remaining} of {FREE_QUESTION_LIMIT} free questions remaining
        </span>
      </div>
    </div>
  );
}
