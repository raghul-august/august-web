import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_TITLE = 'August';
const FLASH_INTERVAL_MS = 1700;
const LOGIN_TITLE = 'Login to August';

// Inline blank favicon as a data URL to avoid network requests during flashing
const BLANK_FAVICON_DATA_URL =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"></svg>';

// Cache the default favicon as a data URL after first fetch
let defaultFaviconDataUrl: string | null = null;

const defaultFaviconReady: Promise<void> = typeof window !== 'undefined'
  ? fetch('/favicon.ico')
      .then((res) => res.blob())
      .then((blob) => {
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            defaultFaviconDataUrl = reader.result as string;
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      })
      .catch(() => {
        // Fallback: use the path directly if fetch fails
        defaultFaviconDataUrl = '/favicon.ico';
      })
  : Promise.resolve();

interface TabNotificationOptions {
  botMessageCount: number;
  showSignUpModal: boolean;
}

let faviconLink: HTMLLinkElement | null = null;

function setFavicon(href: string) {
  if (!faviconLink) {
    faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
  }
  if (faviconLink.href !== href) {
    faviconLink.href = href;
  }
}

export function useTabNotification({ botMessageCount, showSignUpModal }: TabNotificationOptions) {
  const countWhenHidden = useRef(botMessageCount);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const showSignUpModalRef = useRef(showSignUpModal);
  const botMessageCountRef = useRef(botMessageCount);

  showSignUpModalRef.current = showSignUpModal;
  botMessageCountRef.current = botMessageCount;

  const stopFlashing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    document.title = DEFAULT_TITLE;
    if (defaultFaviconDataUrl) setFavicon(defaultFaviconDataUrl);
  }, []);

  const startFaviconFlashing = useCallback((title: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    document.title = title;
    setFavicon(BLANK_FAVICON_DATA_URL);

    let showingBlank = true;
    intervalRef.current = setInterval(() => {
      showingBlank = !showingBlank;
      setFavicon(showingBlank ? BLANK_FAVICON_DATA_URL : (defaultFaviconDataUrl ?? BLANK_FAVICON_DATA_URL));
    }, FLASH_INTERVAL_MS);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (showSignUpModalRef.current) {
          startFaviconFlashing(LOGIN_TITLE);
        } else {
          countWhenHidden.current = botMessageCountRef.current;
        }
      } else {
        stopFlashing();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startFaviconFlashing, stopFlashing]);

  // Flash favicon when tab is hidden and new bot messages arrive
  useEffect(() => {
    if (showSignUpModal || !document.hidden) return;

    const unread = botMessageCount - countWhenHidden.current;
    if (unread > 0) {
      const unreadTitle = `(${unread}) Unread Message${unread > 1 ? 's' : ''}`;
      startFaviconFlashing(unreadTitle);
    }
  }, [botMessageCount, showSignUpModal, startFaviconFlashing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
