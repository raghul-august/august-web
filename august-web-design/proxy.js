import { NextResponse } from "next/server";
import { languages } from "./app/lib/i18n/config";
import { handleDeletedArticle } from "./app/utils/goneHandler";

// US-only versions of legal pages. US visitors get redirected here from the
// generic /privacy and /terms routes; other visitors keep the default content.
const US_LEGAL_REDIRECT_MAP = {
  '/privacy': '/privacy/us',
  '/terms': '/terms/us',
};

const DEFAULT_PRESCRIPTION_REFILL_HOSTS = ['sandbox.meetaugust.ai'];

const US_REDIRECT_MAP = {
  '/privacy': '/privacy/us',
  '/terms': '/terms/us',
};

// Paths where we want to strip a trailing dot (inherited from chat-app).
const CHAT_APP_TRAILING_DOT_PATHS = [
  '/chat',
  '/tool/appeal-assistant',
  '/tool/bill-analyser',
  '/tool/cost-estimator',
  '/tool/future-self',
  '/explore',
  '/share',
  '/join',
  '/redirect',
  '/delete-account',
];

function shouldStripTrailingDot(pathname) {
  if (!pathname.endsWith('.')) return false;
  const clean = pathname.slice(0, -1);
  return CHAT_APP_TRAILING_DOT_PATHS.some(
    (p) => clean === p || clean.startsWith(p + '/')
  );
}

function getPrescriptionRefillHosts() {
  const configuredHosts = process.env.PRESCRIPTION_REFILL_HOSTS;
  if (!configuredHosts) return DEFAULT_PRESCRIPTION_REFILL_HOSTS;

  return configuredHosts
    .split(',')
    .map((host) => normalizeHostname(host))
    .filter(Boolean);
}

function normalizeHostname(hostname) {
  return hostname
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '');
}

function getRequestHostname(request) {
  return normalizeHostname(
    request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      request.nextUrl.hostname
  );
}

function isPrescriptionRefillPath(pathname) {
  return (
    pathname === '/prescription-refill' ||
    pathname.startsWith('/prescription-refill/')
  );
}

function isChatPath(pathname) {
  return pathname === '/chat' || pathname.startsWith('/chat/');
}

function isLocalDevelopmentHost(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;

  // US visitors on /privacy or /terms get the August AI versions
  const usTarget = US_LEGAL_REDIRECT_MAP[pathname];
  if (usTarget) {
    const country =
      request.headers.get('x-vercel-ip-country') ??
      request.headers.get('cf-ipcountry') ??
      '';
    if (country === 'US') {
      const url = request.nextUrl.clone();
      url.pathname = usTarget;
      return NextResponse.redirect(url, 307);
    }
  }
  const hostname = getRequestHostname(request);
  const isPrescriptionRefillHost =
    getPrescriptionRefillHosts().includes(hostname);
  const canAccessPrescriptionRefill =
    isPrescriptionRefillHost || isLocalDevelopmentHost(hostname);

  if (isPrescriptionRefillPath(pathname) && !canAccessPrescriptionRefill) {
    return new NextResponse(null, { status: 404 });
  }

  if (isChatPath(pathname) && isPrescriptionRefillHost) {
    return new NextResponse(null, { status: 404 });
  }

  const usRedirectTarget = US_REDIRECT_MAP[pathname];
  if (usRedirectTarget) {
    const country =
      request.headers.get('x-vercel-ip-country') ??
      request.headers.get('cf-ipcountry') ??
      '';

    if (country === 'US') {
      const url = request.nextUrl.clone();
      url.pathname = usRedirectTarget;
      return NextResponse.redirect(url, 307);
    }
  }

  // Chat-app: strip trailing dots on specific user-facing routes
  // (e.g. /chat. -> /chat, /tool/appeal-assistant. -> /tool/appeal-assistant)
  if (shouldStripTrailingDot(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1) || '/';
    return NextResponse.redirect(url, 301);
  }

  // Fix malformed external URLs caused by database content with extra quotes
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch (e) {
    return new NextResponse('Bad Request', { status: 400 });
  }
  const externalUrlMatch = decodedPath.match(/["']*(https?:)\/?\/?([\w.-]+\.[a-z]{2,}.*?)["']*$/i);

  if (externalUrlMatch) {
    const protocol = externalUrlMatch[1];
    const urlRest = externalUrlMatch[2];
    const cleanUrl = `${protocol}//${urlRest}`.replace(/["']+$/, '');
    return NextResponse.redirect(cleanUrl, 301);
  }

  // Redirect bare /<lang> to /<lang>/library (no page exists at /<lang>)
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  if (segments.length === 1 && languages[segments[0]]) {
    return NextResponse.redirect(new URL(`/${segments[0]}/library`, request.url), 301);
  }

  // Return 410 for deleted articles
  const goneResponse = await handleDeletedArticle(request);
  if (goneResponse) return goneResponse;

  // Extract lang from URL path and forward via request header so root layout can set <html lang>
  const langSegment = pathname.split('/')[1];
  const requestHeaders = new Headers(request.headers);
  if (langSegment && languages[langSegment]) {
    requestHeaders.set('x-lang', langSegment);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    // Only run middleware on navigation requests (skip _next, api, static files)
    '/((?!_next|api|favicon.ico|.*\\..*).*)',
  ],
};
