import { BACKEND_URLS } from '@/lib/config';

const NORTH_AMERICA_CODES = new Set(['US', 'CA']);
const COUNTRY_COOKIE = 'august_country_code';

function getCookieValue(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;

  for (const cookie of cookieHeader.split(';')) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return undefined;
}

function getHeaderCountry(request: Request): string | undefined {
  return (
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    undefined
  );
}

export function resolveBackendUrl(request: Request, explicitCountry?: string): string {
  const cookieCountry = getCookieValue(request, COUNTRY_COOKIE);
  const headerCountry = getHeaderCountry(request);

  const sourceCountry =
    explicitCountry ||
    cookieCountry ||
    headerCountry ||
    '';

  const normalized = sourceCountry.trim().toUpperCase();
  if (normalized && NORTH_AMERICA_CODES.has(normalized)) {
    return BACKEND_URLS.US_CANADA;
  }

  return BACKEND_URLS.DEFAULT;
}

export function getAlternateBackendUrl(currentBackendUrl: string): string {
  if (currentBackendUrl === BACKEND_URLS.US_CANADA) {
    return BACKEND_URLS.DEFAULT;
  }
  return BACKEND_URLS.US_CANADA;
}

export function buildForwardHeaders(request: Request): Headers {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === 'content-type' ||
      lower === 'accept' ||
      lower === 'authorization' ||
      lower === 'cookie' ||
      lower === 'x-device-id'
    ) {
      headers.set(lower, value);
    }
  });

  return headers;
}
