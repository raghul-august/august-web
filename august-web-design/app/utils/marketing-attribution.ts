const SESSION_KEY = 'session_source_medium';

function referrerSource(): string | null {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).hostname;
  } catch {
    return null;
  }
}

function referrerMedium(): string | null {
  return document.referrer ? 'referral' : null;
}

export function captureSourceMedium(): void {
  if (typeof window === 'undefined') return;
  if (sessionStorage.getItem(SESSION_KEY)) return;

  const url = new URL(window.location.href);
  const source = url.searchParams.get('utm_source') || referrerSource() || '(direct)';
  const medium = url.searchParams.get('utm_medium') || referrerMedium() || '(none)';
  sessionStorage.setItem(SESSION_KEY, `${source} / ${medium}`);
}

export function getSourceMedium(): string {
  if (typeof window === 'undefined') return '(direct) / (none)';
  return sessionStorage.getItem(SESSION_KEY) ?? '(direct) / (none)';
}

export function getUtmAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const channel = params.get('utm_channel') ?? params.get('channel');
  if (source) out.source = source;
  if (medium) out.medium = medium;
  if (channel) out.channel = channel;
  return out;
}
