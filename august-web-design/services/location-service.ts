import Cookies from 'js-cookie';
import { getCountryInfoByCode } from '@/lib/country-codes';
import { getCountryCodeFromTimezone } from '@/lib/timezone-country';
import { notifyError, serializeError } from '@/services/error-reporter';
import logger from '@/utils/logger';

const COUNTRY_CODE_COOKIE = 'august_country_code';
const US_CODES = ['US'];

// Backend URLs from environment variables
const BACKEND_URLS = {
  US: process.env.NEXT_PUBLIC_API_URL_US || 'https://gatekeeper-prod-us.getbeyondhealth.com',
  DEFAULT: process.env.NEXT_PUBLIC_API_URL_DEFAULT || 'https://api.getbeyondhealth.com',
};

const TENANT = process.env.NEXT_PUBLIC_TENANT || 'august';
const bypassEmailCache = new Map<string, boolean>();
let cachedIsUS: boolean | null = null;

interface LocationInfo {
  ip: string;
  countryCode: string;
  country: string;
  source: string;
  backendUrl: string;
  timestamp: number;
}

let cachedLocationInfo: LocationInfo | null = null;
function setLocationToUS(source: string): void {
  cachedIsUS = true;
  cachedLocationInfo = {
    ip: cachedLocationInfo?.ip || 'bypass',
    countryCode: 'US',
    country: 'United States',
    source,
    backendUrl: BACKEND_URLS.US,
    timestamp: Date.now(),
  };

  if (typeof window !== 'undefined') {
    Cookies.set(COUNTRY_CODE_COOKIE, 'US', {
      path: '/',
      sameSite: 'lax',
      expires: 3650,
    });
  }
}

export async function checkBypassEmail(email: string): Promise<boolean> {
  if (!email) return false;

  const normalizedEmail = email.toLowerCase();
  if (bypassEmailCache.has(normalizedEmail)) {
    const cached = bypassEmailCache.get(normalizedEmail)!;
    if (cached) {
      setLocationToUS(`bypass:${normalizedEmail}`);
    }
    return cached;
  }

  try {
    const url = `${BACKEND_URLS.US}/auth/${TENANT}/check-bypass-email?email=${encodeURIComponent(normalizedEmail)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      bypassEmailCache.set(normalizedEmail, false);
      return false;
    }

    const data = await response.json();
    const isBypass = data.success && data.bypass === true;
    bypassEmailCache.set(normalizedEmail, isBypass);

    if (isBypass) {
      setLocationToUS(`bypass:${normalizedEmail}`);
    }

    return isBypass;
  } catch (error) {
    return false;
  }
}

export function getBypassEmailCache(): Map<string, boolean> {
  return bypassEmailCache;
}

export function isUserBypassedToUS(email: string | null | undefined): boolean {
  if (!email) return false;
  return bypassEmailCache.get(email.toLowerCase()) === true;
}

let initializationPromise: Promise<string> | null = null;

function getBackendUrlForCountry(countryCode: string): string {
  return US_CODES.includes(countryCode)
    ? BACKEND_URLS.US
    : BACKEND_URLS.DEFAULT;
}

function saveToStorage(info: LocationInfo): void {
  if (typeof window === 'undefined') return;

  try {
    Cookies.set(COUNTRY_CODE_COOKIE, info.countryCode, {
      path: '/',
      sameSite: 'lax',
      expires: 3650, // 10 years
    });
  } catch (error) {
    logger.warn('Failed to save location info to cookie', serializeError(error));
  }
}

interface TimezoneLocationInfo {
  countryCode: string;
  country: string;
  source: string;
}

function getCfCountryFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith('cf_country='));
  if (!match) return null;
  const value = match.split('=')[1]?.trim().toUpperCase();
  return value || null;
}

function getTimezoneLocation(): TimezoneLocationInfo | null {
  if (typeof Intl === 'undefined') return null;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone) return null;

    const countryCode = getCountryCodeFromTimezone(timezone);
    if (!countryCode) return null;

    const countryInfo = getCountryInfoByCode(countryCode);
    return {
      countryCode,
      country: countryInfo?.name || countryCode,
      source: `timezone:${timezone}`,
    };
  } catch (error) {
    logger.warn('Failed to derive timezone location', serializeError(error));
    return {
      countryCode: '',
      country: 'Timezone fallback',
      source: 'timezone:fallback',
    };
  }
}

function cacheLocation(info: LocationInfo): string {
  cachedLocationInfo = info;
  saveToStorage(info);
  return info.backendUrl;
}

function applyTimezoneFallback(reason: string): string | null {
  const timezoneInfo = getTimezoneLocation();
  if (!timezoneInfo) {
    void notifyError('Location detection failed without timezone fallback', {
      details: { reason },
    });
    return null;
  }

  return cacheLocation({
    ip: 'unknown',
    countryCode: timezoneInfo.countryCode,
    country: timezoneInfo.country,
    source: timezoneInfo.source,
    backendUrl: getBackendUrlForCountry(timezoneInfo.countryCode),
    timestamp: Date.now(),
  });
}

/**
 * Initialize location detection and determine the correct backend URL.
 * This should be called once on app startup.
 * Returns the backend URL to use.
 */
export async function initializeLocation(): Promise<string> {
  // If already initializing, return the same promise
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    // Check memory cache first
    if (cachedLocationInfo) {
      return cachedLocationInfo.backendUrl;
    }

    // Using cloudfare to derive country
    const cfCountry = getCfCountryFromCookie();
    if (cfCountry) {
      const countryInfo = getCountryInfoByCode(cfCountry);
      return cacheLocation({
        ip: 'cf-edge',
        countryCode: cfCountry,
        country: countryInfo?.name || cfCountry,
        source: 'cf_country_cookie',
        backendUrl: getBackendUrlForCountry(cfCountry),
        timestamp: Date.now(),
      });
    }

    const timezoneFallback = applyTimezoneFallback('No cf_country cookie');
    if (timezoneFallback) return timezoneFallback;

    void notifyError('Location detection fell back to default backend', {
      details: { reason: 'cf_country_and_timezone_unavailable' },
    });
    return BACKEND_URLS.DEFAULT;
  })();

  return initializationPromise;
}

/**
 * Get the current backend URL synchronously.
 * Checks bypass cache first, then location cache.
 * If location hasn't been initialized, returns the default URL.
 */
export function getBackendUrl(email?: string): string {
  // Check bypass cache first
  if (email && isUserBypassedToUS(email)) {
    return BACKEND_URLS.US;
  }

  if (cachedIsUS === true) {
    return BACKEND_URLS.US;
  }

  if (cachedLocationInfo) {
    return cachedLocationInfo.backendUrl;
  }

  return BACKEND_URLS.DEFAULT;
}

/**
 * Get the cached location info, if available.
 */
export function getLocationInfo(): LocationInfo | null {
  if (cachedLocationInfo) {
    return cachedLocationInfo;
  }

  return null;
}

/**
 * Check if location has been initialized
 */
export function isLocationInitialized(): boolean {
  return cachedLocationInfo !== null;
}

/**
 * Clear the location cache (useful for testing or when user wants to refresh).
 */
export function clearLocationCache(): void {
  cachedLocationInfo = null;
  initializationPromise = null;
  if (typeof window !== 'undefined') {
    Cookies.remove(COUNTRY_CODE_COOKIE, { path: '/' });
  }
}
