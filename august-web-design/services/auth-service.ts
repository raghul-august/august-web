import axios from 'axios';
import { API_CONFIG, MESSAGE_SOURCE } from '@/lib/config';
import { getActiveTenant } from '@/lib/tenant';
import { useAuthStore } from '@/stores/auth-store';
import { useIncognitoStore } from '@/stores/incognito-store';
import { AnonymousSessionResponse } from '@/types';
import { getOrCreateDeviceId } from '@/lib/utils';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { onUserLogin } from '@/utils/clevertap';
import { getLocationInfo, initializeLocation, checkBypassEmail } from '@/services/location-service';
import { getCountryCodeFromTimezone } from '@/lib/timezone-country';
import { getCountryInfoByCode } from '@/lib/country-codes';
import { getTurnstileToken, consumeStoredTurnstileToken } from '@/utils/turnstile';
import { ANON_ALLOWED_KEY, ANON_TELEHEALTH_PARAM, TELEHEALTH_ANON_ROUTE_KEY, TOOL_WIDGET_SOURCES } from '@/lib/anon-access';

interface AnonymousSessionParams {
  languageCode?: string;
  country?: string;
  countryCode?: string;
}

/**
 * Creates or restores an anonymous session
 * This is the primary auth method for web - no login required
 */
export async function createAnonymousSession(
  params: AnonymousSessionParams = {}
): Promise<AnonymousSessionResponse> {
  const { languageCode } = params;
  let resolvedCountry = params.country;
  let resolvedCountryCode = params.countryCode;
  // Get browser language if not provided
  const browserLanguage = typeof navigator !== 'undefined'
    ? navigator.language.split('-')[0]
    : 'en';

  const resolveLocation = (async () => {
    try {
      await initializeLocation();
      return getLocationInfo();
    } catch (error) {
      logger.warn('Unable to resolve location info for anonymous session', serializeError(error));
      return null;
    }
  })();

  const [locationInfo, turnstileToken] = await Promise.all([
    resolveLocation,
    // Prefer a token prewarmed on the telehealth landing page; otherwise mint
    // fresh (direct /chat visitors, stale/spent prewarmed tokens).
    (async () =>
      consumeStoredTurnstileToken('anonymous_session') ??
      (await getTurnstileToken('anonymous_session')))(),
  ]);

  if (locationInfo) {
    resolvedCountryCode = resolvedCountryCode || locationInfo.countryCode;
    resolvedCountry = resolvedCountry || locationInfo.country;
  } else {
    logger.warn('Location not available, proceeding without location');
  }

  const isTelehealthFlow =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get(ANON_TELEHEALTH_PARAM) === 'true' ||
      (() => {
        try {
          return sessionStorage.getItem(TELEHEALTH_ANON_ROUTE_KEY) === '1';
        } catch {
          return false;
        }
      })());

  const url = `/api/auth/${getActiveTenant()}/anonymous-session`;
  const body = {
    source: MESSAGE_SOURCE,
    languageCode: languageCode || browserLanguage,
    country: resolvedCountry,
    countryCode: resolvedCountryCode,
    turnstileToken,
    is_telehealth_flow: isTelehealthFlow,
    };

  const response = await axios.post<AnonymousSessionResponse>(url, body, {
    withCredentials: true,
  });

  if (response.data.success) {
    const { user, accessToken, isAnonymous } = response.data;
    // Store access token in cookie (refresh token is handled by backend as HttpOnly cookie)
    useAuthStore.getState().setAccessToken(accessToken);

    // Verify it was set
    const storedToken = useAuthStore.getState().getAccessToken();
    // Update auth store state
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setIsAnonymous(isAnonymous);
  }

  return response.data;
}

/**
 * Logout and clear session
 */
export async function logout(): Promise<void> {
  try {
    const accessToken = useAuthStore.getState().getAccessToken();

    if (accessToken) {
      await axios.post(
        `${API_CONFIG.BASE_URL}/auth/${getActiveTenant()}/logout`,
        {
          source: MESSAGE_SOURCE, 
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
    }
  } catch (error) {
    // Log but don't throw - we want to clear local state regardless
    logger.error('Logout API call failed', serializeError(error));
  } finally {
    // Always clear local state
    useAuthStore.getState().logout();
    try {
      localStorage.removeItem(ANON_ALLOWED_KEY);
    } catch {
    }
  }
}

/**
 * Get WebPubSub negotiation token for real-time messaging
 * Handles 401 errors with automatic token refresh and retry
 */
export async function getNegotiateToken(): Promise<{ url: string }> {
  const url = `/api/auth/${getActiveTenant()}/negotiate-azure-token`;

  const makeRequest = async () => {
    // Use incognito token when in incognito mode
    const incognitoState = useIncognitoStore.getState();
    const accessToken = incognitoState.isIncognitoMode && incognitoState.incognitoToken
      ? incognitoState.incognitoToken
      : useAuthStore.getState().getAccessToken();

    return axios.get<{ url: string }>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });
  };

  try {
    const response = await makeRequest();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // In incognito mode, don't attempt token refresh — expire the session
      const incognitoState = useIncognitoStore.getState();
      if (incognitoState.isIncognitoMode) {
        incognitoState.handleIncognito401();
        throw error;
      }

      // Attempt to refresh the token
      try {
        const refreshResponse = await axios.post(
          `/api/auth/${getActiveTenant()}/refresh-token`,
          { source: MESSAGE_SOURCE },
          { withCredentials: true }
        );

        if (refreshResponse.data.accessToken) {
          useAuthStore.getState().setAccessToken(refreshResponse.data.accessToken);
          // Retry the original request
          const retryResponse = await makeRequest();
          return retryResponse.data;
        }
      } catch (refreshError) {
        if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
          useAuthStore.getState().logout();
        }
        throw refreshError;
      }
    }
    throw error;
  }
}

function isForceSignupOnChat(): boolean {
  if (typeof window === 'undefined') return false;
  const { pathname, search } = window.location;
  if (pathname !== '/chat' && !pathname.startsWith('/chat/')) return false;
  if (process.env.NEXT_PUBLIC_ENABLE_ANONCHAT !== 'true') return true;

  // Mirror LoginModalWatcher: widget route params grant anon for this visit;
  // localStorage persists it after the watcher consumes them.
  const searchParams = new URLSearchParams(search);
  const src = searchParams.get('src') ?? '';
  if (
    TOOL_WIDGET_SOURCES.has(src) ||
    searchParams.get(ANON_TELEHEALTH_PARAM) === 'true'
  ) {
    return false;
  }
  try {
    return localStorage.getItem(ANON_ALLOWED_KEY) !== '1';
  } catch {
    return true;
  }
}

// Mutex to prevent concurrent auth initialization (e.g., React Strict Mode double-mount)
let initializeAuthPromise: Promise<AnonymousSessionResponse> | null = null;

/**
 * Initialize authentication on app load
 * Attempts to restore existing session or create anonymous one
 */
export async function initializeAuth(): Promise<AnonymousSessionResponse> {
  if (initializeAuthPromise) {
    return initializeAuthPromise;
  }

  const authStore = useAuthStore.getState();

  // Check if we already have tokens
  const existingToken = authStore.getAccessToken();

  if (existingToken && authStore.user) {
    if (authStore.user.email) {
      logger.info(`[initializeAuth] Caching bypass status for ${authStore.user.email}`);
      await checkBypassEmail(authStore.user.email);
    }

    // Already authenticated - return a success response
    return {
      success: true,
      message: 'Already authenticated',
      user: authStore.user,
      accessToken: existingToken,
      refreshToken: '',
      isAnonymous: authStore.isAnonymous,
    };
  }

  const emptyAnonResponse = (success: boolean, message: string): AnonymousSessionResponse => ({
    success, message, user: { id: '' }, accessToken: '', refreshToken: '', isAnonymous: true,
  });

  // Direct users on /chat will be immediately walled by SignUpModal.
  if (isForceSignupOnChat()) return emptyAnonResponse(true, 'Awaiting signup');

  initializeAuthPromise = (async () => {
    try {
      authStore.setIsLoading(true);
      return await createAnonymousSession();
    } catch (error) {
      logger.error('Failed to initialize auth 1', serializeError(error));
      authStore.setError('Failed to initialize session');
      return emptyAnonResponse(false, 'Failed to initialize session');
    } finally {
      authStore.setIsLoading(false);
      initializeAuthPromise = null;
    }
  })();

  return initializeAuthPromise;
}

// OTP Authentication

type TenantOverride = {
  tenant?: string;
};

interface RequestOtpParamsPhone {
  method?: 'phone';
  phoneNumber: string;
  channel?: 'SMS' | 'WHATSAPP';
}

interface RequestOtpParamsEmail extends TenantOverride {
  method: 'email';
  email: string;
}

type RequestOtpParams = RequestOtpParamsPhone | RequestOtpParamsEmail;

interface RequestOtpResponse {
  success?: boolean;
  requestId?: string;
  ok?: boolean;
  skipped?: boolean;
  reason?: 'same_account';
  email?: string;
  verifyOnly?: boolean;
}

/**
 * Request OTP code to be sent to phone number or email
 */
export async function requestOtp(params: RequestOtpParams): Promise<RequestOtpResponse> {
  if ('email' in params && params.method === 'email') {
    await checkBypassEmail(params.email);
  }
  await initializeLocation();

  const tenant = 'tenant' in params && params.tenant ? params.tenant : getActiveTenant();
  const url = `/api/auth/${tenant}/request-otp`;

  let body: Record<string, unknown>;

  if ('email' in params && params.method === 'email') {
    // Email OTP request
    body = {
      method: 'email',
      email: params.email,
      expiry: 600, // 10 minutes
      otpLength: 6,
      metadata: { app: 'August' },
      source: MESSAGE_SOURCE
    };
  } else {
    // Phone OTP request (default)
    const { phoneNumber, channel = 'SMS' } = params as RequestOtpParamsPhone;
    body = {
      phoneNumber,
      expiry: 600, // 10 minutes
      otpLength: 6,
      channel,
      metadata: { app: 'August' },
      source: MESSAGE_SOURCE
    };
  }

  const response = await axios.post<RequestOtpResponse>(url, body, {
    withCredentials: true,
    headers: {
      'x-device-id': getOrCreateDeviceId(),
    },
  });

  return response.data;
}

interface VerifyOtpParamsPhone {
  method?: 'phone';
  requestId: string;
  otp: string;
  phone: string;
}

interface VerifyOtpParamsEmail extends TenantOverride {
  method: 'email';
  requestId?: string;
  otp: string;
  email: string;
}

type VerifyOtpParams = VerifyOtpParamsPhone | VerifyOtpParamsEmail;

interface VerifyOtpResponse {
  success?: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    phone?: string;
    email?: string;
    name?: string;
    [key: string]: unknown;
  };
  isPaymentRequired?: boolean;
  ok?: boolean;
  verifyOnly?: boolean;
  verifiedEmail?: string;
}

/**
 * Verify OTP code and authenticate user
 */
export async function verifyOtp(params: VerifyOtpParams): Promise<VerifyOtpResponse> {
  if ('email' in params && params.method === 'email') {
    await checkBypassEmail(params.email);
  }
  await initializeLocation();

  const { requestId, otp } = params;

  // Get browser language
  const browserLanguage = typeof navigator !== 'undefined'
    ? navigator.language.split('-')[0]
    : 'en';
  const { country, countryCode } = getCountryMetadata();

  const tenant = 'tenant' in params && params.tenant ? params.tenant : getActiveTenant();
  const url = `/api/auth/${tenant}/verify-otp`;

  let body: Record<string, unknown>;

  if ('email' in params && params.method === 'email') {
    // Email OTP verification
    body = {
      requestId,
      otp,
      method: 'email',
      email: params.email,
      source: MESSAGE_SOURCE,
      languageCode: browserLanguage,
      country,
      countryCode,
    };
  } else {
    // Phone OTP verification (default)
    body = {
      requestId,
      otp,
      phone: (params as VerifyOtpParamsPhone).phone,
      source: MESSAGE_SOURCE,
      languageCode: browserLanguage,
      country,
      countryCode,
    };
  }

  const response = await axios.post<VerifyOtpResponse>(url, body, {
    withCredentials: true,
    headers: {
      'x-device-id': getOrCreateDeviceId(),
    },
  });

  if (response.data.accessToken && response.data.user) {
    const { user, accessToken } = response.data;

    if (user.email) {
      await checkBypassEmail(user.email);
    }

    // Store access token
    useAuthStore.getState().setAccessToken(accessToken);

    // Update auth store state - user is no longer anonymous
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setIsAnonymous(false);

    onUserLogin(user.phone || user.id, {
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Country: country || undefined,
    });
  }

  return response.data;
}

// OAuth Authentication

export type OAuthProvider = 'google' | 'apple';

interface GoogleSignInParams {
  provider: 'google';
  idToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    givenName: string;
    familyName: string;
    photo: string;
  };
}

interface AppleSignInParams {
  provider: 'apple';
  identityToken: string;
  user: string; // Apple user ID (sub claim)
  email?: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  };
}

type OAuthSignInParams = GoogleSignInParams | AppleSignInParams;

interface OAuthSignInResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    phone?: string;
    email?: string;
    name?: string;
    [key: string]: unknown;
  };
  isPaymentRequired?: boolean;
  error?: string;
}

/**
 * Sign in with OAuth provider (Google or Apple)
 * Calls the existing backend /oauth-signin endpoint
 */
export async function oauthSignIn(params: OAuthSignInParams): Promise<OAuthSignInResponse> {
  const userEmail = params.provider === 'google' ? params.user.email : params.email;
  if (userEmail) {
    await checkBypassEmail(userEmail);
  }

  const browserLanguage = typeof navigator !== 'undefined'
    ? navigator.language.split('-')[0]
    : 'en';

  const deviceId = getOrCreateDeviceId();
  const { country, countryCode } = getCountryMetadata();

  const url = `/api/auth/${getActiveTenant()}/oauth-signin`;

  // Build request body based on provider
  let body: Record<string, unknown>;

  if (params.provider === 'apple') {
    // Apple expects: identityToken, user (as string ID), email, fullName
    body = {
      provider: 'apple',
      platform: 'WEB_APP',
      source: 'WEB_APP',
      languageCode: browserLanguage,
      country,
      countryCode,
      identityToken: params.identityToken,
      user: params.user, // Apple user ID string
      email: params.email,
      fullName: params.fullName,
    };
  } else {
    // Google expects: idToken, user object
    body = {
      provider: 'google',
      platform: 'WEB_APP',
      source: 'WEB_APP',
      languageCode: browserLanguage,
      country,
      countryCode,
      idToken: params.idToken,
      user: params.user,
    };
  }

  const response = await axios.post<OAuthSignInResponse>(url, body, {
    headers: {
      'Content-Type': 'application/json',
      'x-device-id': deviceId,
    },
    withCredentials: true,
  });

  if (response.data.success && response.data.accessToken) {
    const { user: responseUser, accessToken } = response.data;

    // Store access token
    useAuthStore.getState().setAccessToken(accessToken);

    // Update auth store state - user is no longer anonymous
    if (responseUser) {
      useAuthStore.getState().setUser(responseUser);

      onUserLogin(responseUser.phone || responseUser.id, {
        Name: responseUser.name,
        Email: responseUser.email,
        Phone: responseUser.phone,
        Country: country || undefined,
      });
    }
    useAuthStore.getState().setIsAnonymous(false);
  }

  return response.data;
}
function getCountryMetadata() {
  const location = getLocationInfo();
  if (location?.countryCode) {
    return {
      country: location.country,
      countryCode: location.countryCode,
    };
  }

  if (typeof Intl !== 'undefined') {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const code = getCountryCodeFromTimezone(timezone);
    if (code) {
      const countryInfo = getCountryInfoByCode(code);
      return {
        country: countryInfo?.name || code,
        countryCode: code,
      };
    }
  }

  return { country: undefined, countryCode: undefined };
}

interface ResetUserResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    phone?: string;
    email?: string;
    name?: string;
    [key: string]: unknown;
  };
  error?: string;
}

export async function resetUser(languageCode: string = 'en'): Promise<ResetUserResponse> {
  const accessToken = useAuthStore.getState().getAccessToken();
  if (!accessToken) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const url = `${API_CONFIG.BASE_URL}/auth/${API_CONFIG.TENANT}/reset-user`;
    const response = await axios.post(
      url,
      { languageCode, source: MESSAGE_SOURCE },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      },
    );
    return {
      success: true,
      accessToken: response.data?.accessToken,
      refreshToken: response.data?.refreshToken,
      user: response.data?.user,
    };
  } catch (error) {
    logger.error('Failed to reset user', serializeError(error));
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message
      : (error as Error)?.message;
    return { success: false, error: message || 'Failed to reset user' };
  }
}

interface MigrateMemoryParams {
  memory: string;
}

interface MigrateMemoryResponse {
  success: boolean;
  error?: string;
}

export async function migrateMemory(params: MigrateMemoryParams): Promise<MigrateMemoryResponse> {
  const { memory } = params;
  const { country, countryCode } = getCountryMetadata();
  const accessToken = useAuthStore.getState().getAccessToken();

  const url = `/api/user/${getActiveTenant()}/migrate-memory`;
  const body = {
    memory,
    source: MESSAGE_SOURCE,
    country,
    countryCode,
  };

  const response = await axios.post<MigrateMemoryResponse>(url, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    withCredentials: true,
  });

  return response.data;
}
