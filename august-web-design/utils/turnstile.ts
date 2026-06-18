import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type TurnstileWidgetId = string;

interface TurnstileRenderOptions {
  sitekey: string;
  size?: 'normal' | 'compact' | 'flexible';
  action?: string;
  callback?: (token: string) => void;
  appearance?: 'always' | 'execute' | 'interaction-only';
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
}

interface TurnstileExecuteOptions {
  action?: string;
}

interface TurnstileInstance {
  render(
    container: Element | string,
    options: TurnstileRenderOptions
  ): TurnstileWidgetId;
  execute(widgetId: TurnstileWidgetId, options?: TurnstileExecuteOptions): void;
  reset(widgetId?: TurnstileWidgetId): void;
  remove(widgetId?: TurnstileWidgetId): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
  }
}

interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
  'error-codes'?: string[];
}

function waitForTurnstile(timeoutMs = 5000): Promise<TurnstileInstance> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
        return;
      }

      if (Date.now() - start > timeoutMs) {
        reject(new Error('Turnstile script did not load in time'));
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });
}

export async function getTurnstileToken(action?: string): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Turnstile can only run in the browser');
  }

  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!sitekey) {
    throw new Error('Turnstile site key is not configured');
  }

  const turnstile = await waitForTurnstile();

  const container = document.getElementById('cf-turnstile-root');

  if (!(container instanceof HTMLElement)) {
    throw new Error('Turnstile container not found');
  }

  return new Promise<string>((resolve, reject) => {
    let widgetId: TurnstileWidgetId | null = null;
    let done = false;

    const cleanup = () => {
      if (widgetId) {
        turnstile.remove(widgetId);
      }
      container.innerHTML = '';
    };

    widgetId = turnstile.render(container, {
      sitekey,
      appearance: 'interaction-only',
      action,
      callback: (token) => {
        if (done) return;
        done = true;
        cleanup();
        resolve(token);
      },
      'error-callback': () => {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error('Turnstile challenge failed'));
      },
      'expired-callback': () => {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error('Turnstile challenge expired'));
      },
    });

    try {
      turnstile.execute(widgetId, { action });
    } catch (err) {
      cleanup();
      reject(err instanceof Error ? err : new Error('Turnstile execute failed'));
    }
  });
}


// --- Prewarmed token (sessionStorage) ----------------------------------------
//
// The telehealth landing page hard-navigates to /chat (full page load), which
// wipes in-memory state. To reuse a token minted on the landing page we persist
// it in sessionStorage (survives same-tab navigation, clears on tab close).
// Turnstile tokens are single-use and valid ~300s, so we stamp them with a
// timestamp, treat anything older than the safety margin as stale, and clear
// the stored token the moment it is consumed.
const TURNSTILE_PREWARM_KEY = 'august_turnstile_token';
const TURNSTILE_PREWARM_TTL_MS = 240_000; // 4 min, under Cloudflare's 300s limit

interface StoredTurnstileToken {
  token: string;
  action: string;
  ts: number;
}

// Module-level guard so repeated focus events don't spawn parallel challenges.
let prewarmInFlight = false;

function readStoredToken(): StoredTurnstileToken | null {
  try {
    const raw = sessionStorage.getItem(TURNSTILE_PREWARM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTurnstileToken;
    if (!parsed || typeof parsed.token !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

function isFresh(stored: StoredTurnstileToken, action: string): boolean {
  return stored.action === action && Date.now() - stored.ts < TURNSTILE_PREWARM_TTL_MS;
}

/**
 * Best-effort: mint a Turnstile token ahead of time and stash it in
 * sessionStorage so a later createAnonymousSession (post hard-navigation) can
 * skip the challenge latency. No-op if not in the browser, if a fresh token is
 * already stored, or if a generation is already in flight. Errors are
 * swallowed/logged — the consumer falls back to fresh generation.
 */
export function prewarmTurnstileToken(action: string): void {
  if (typeof window === 'undefined') return;
  if (prewarmInFlight) return;

  const existing = readStoredToken();
  if (existing && isFresh(existing, action)) return;

  prewarmInFlight = true;
  getTurnstileToken(action)
    .then((token) => {
      try {
        const payload: StoredTurnstileToken = { token, action, ts: Date.now() };
        sessionStorage.setItem(TURNSTILE_PREWARM_KEY, JSON.stringify(payload));
      } catch {
        // sessionStorage unavailable — ignore, consumer mints fresh.
      }
    })
    .catch((error) => {
      logger.warn('Turnstile prewarm failed', serializeError(error));
    })
    .finally(() => {
      prewarmInFlight = false;
    });
}

/**
 * Returns a previously prewarmed token if one is stored, fresh, and matches the
 * given action — otherwise null. Always clears the stored token (single-use)
 * before returning so a spent token is never reused on retry.
 */
export function consumeStoredTurnstileToken(action: string): string | null {
  if (typeof window === 'undefined') return null;
  const stored = readStoredToken();
  try {
    sessionStorage.removeItem(TURNSTILE_PREWARM_KEY);
  } catch {
    // ignore
  }
  if (!stored || !isFresh(stored, action)) return null;
  return stored.token;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerifyResponse> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    logger.error('Turnstile secret key is not configured');
    throw new Error('Turnstile secret key is not configured');
  }

  const formData = new URLSearchParams();
  formData.append('secret', secret);
  formData.append('response', token);
  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  logger.info('Verifying Turnstile token', { token, remoteIp });

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    logger.error('Failed to verify Turnstile token');
    throw new Error('Failed to verify Turnstile token');
  }

  logger.info('Turnstile token successfully verified');

  return response.json();
}

export type { TurnstileVerifyResponse };
