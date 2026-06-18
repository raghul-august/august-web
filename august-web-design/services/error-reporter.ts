const alertsEnabled =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_ENABLE_SLACK_ALERTS === 'true';

const MIN_ALERT_INTERVAL_MS = 10000;
let lastAlertSignature: string | null = null;
let lastAlertTimestamp = 0;

export interface ErrorContext {
  user?: string;
  details?: Record<string, unknown> | string;
}

export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  return {
    message: 'Unknown error',
    raw: error,
  };
}

export async function notifyError(
  message: string,
  context: ErrorContext = {}
): Promise<void> {
  if (!alertsEnabled || typeof window === 'undefined') {
    return;
  }

  const signature = `${message}-${JSON.stringify(context.details || {})}`;
  const now = Date.now();
  if (
    signature === lastAlertSignature &&
    now - lastAlertTimestamp < MIN_ALERT_INTERVAL_MS
  ) {
    return;
  }
  lastAlertSignature = signature;
  lastAlertTimestamp = now;

  try {
    await fetch('/api/slack/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context,
        pathname: window.location.pathname,
      }),
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorReporter] Failed to notify Slack:', err);
    }
  }
}
