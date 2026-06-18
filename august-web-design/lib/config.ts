export const BACKEND_URLS = {
  US_CANADA: process.env.NEXT_PUBLIC_API_URL_US || 'https://gatekeeper-prod-us.getbeyondhealth.com',
  DEFAULT: process.env.NEXT_PUBLIC_API_URL_DEFAULT || 'https://api.getbeyondhealth.com',
} as const;

export const PROXY_PATHS = {
  US_CANADA: '/api/proxy-us',
  DEFAULT: '/api/proxy',
} as const;

export const API_CONFIG = {
  BASE_URL: typeof window !== 'undefined' ? PROXY_PATHS.DEFAULT : BACKEND_URLS.DEFAULT,
  TENANT: process.env.NEXT_PUBLIC_TENANT || 'august',
} as const;

export function getProxyPathForBackend(backendUrl: string): string {
  if (backendUrl.includes('prod-us')) {
    return PROXY_PATHS.US_CANADA;
  }
  return PROXY_PATHS.DEFAULT;
}

// Cookie configuration
// Note: refresh_token is handled by backend as HttpOnly cookie (gk_session)
export const COOKIE_CONFIG = {
  ACCESS_TOKEN: 'access_token',
  // Short-term cookie for access token
  ACCESS_TOKEN_OPTIONS: {
    path: '/',
    sameSite: 'lax' as const,
    secure: false
  },
} as const;

// Message source for web
export const MESSAGE_SOURCE = 'WEB_APP';
export const CONSULT_PRICE_USD = Number.parseInt(
  process.env.NEXT_PUBLIC_CONSULT_PRICE_USD || '39',
  10,
);
export const CONSULT_PRICE_LABEL = `$${
  Number.isFinite(CONSULT_PRICE_USD) ? CONSULT_PRICE_USD : 39
}`;
