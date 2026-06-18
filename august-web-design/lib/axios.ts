import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, MESSAGE_SOURCE, getProxyPathForBackend, PROXY_PATHS } from './config';
import { getActiveTenant } from '@/lib/tenant';
import { useAuthStore } from '@/stores/auth-store';
import { useIncognitoStore } from '@/stores/incognito-store';
import { getBackendUrl, initializeLocation, isLocationInitialized, isUserBypassedToUS } from '@/services/location-service';

// Get the current base URL based on location
function getCurrentBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use direct backend URL
    return API_CONFIG.BASE_URL;
  }

  // Client-side: use proxy path based on detected location
  if (isLocationInitialized()) {
    const backendUrl = getBackendUrl();
    return getProxyPathForBackend(backendUrl);
  }

  // Fallback: read country cookie for US/UK 
  const code = document.cookie.split('; ').find(c => c.startsWith('august_country_code='))?.split('=')[1]?.trim().toUpperCase();
  if (code === 'US' || code === 'CA') {
    return PROXY_PATHS.US_CANADA;
  }
  return PROXY_PATHS.DEFAULT;
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor - Add auth header and dynamic baseURL
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && !isLocationInitialized()) {
      try {
        await initializeLocation();
      } catch {
        // getCurrentBaseUrl() falls back to DEFAULT.
      }
    }

    config.baseURL = getCurrentBaseUrl();

    const user = useAuthStore.getState().user;
    const userEmail = user?.email;
    if (userEmail && isUserBypassedToUS(userEmail)) {
      if (config.baseURL === PROXY_PATHS.DEFAULT) {
        config.baseURL = PROXY_PATHS.US_CANADA;
      }
    }

    // Use incognito token if in incognito mode
    const incognitoState = useIncognitoStore.getState();
    if (incognitoState.isIncognitoMode && incognitoState.incognitoToken) {
      config.headers.Authorization = `Bearer ${incognitoState.incognitoToken}`;
      return config;
    }

    const token = useAuthStore.getState().getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 and refresh
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 in incognito mode - don't attempt token refresh
    const incognitoState = useIncognitoStore.getState();
    if (error.response?.status === 401 && incognitoState.isIncognitoMode) {
      incognitoState.handleIncognito401();
      return Promise.reject(error);
    }

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        // The refresh token is sent automatically via HttpOnly cookie (gk_session)
        const baseUrl = getCurrentBaseUrl();
        const url = `${baseUrl}/auth/${getActiveTenant()}/refresh-token`;
        const body = { source: MESSAGE_SOURCE };

        const response = await axios.post(url, body, {
          withCredentials: true, // This sends the HttpOnly gk_session cookie
        });

        if (response.data.accessToken) {
          // Store new access token
          useAuthStore.getState().setAccessToken(response.data.accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

          return axiosInstance(originalRequest);
        } else {
          // Refresh returned no token — treat as session eviction
          useAuthStore.getState().evictSession();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // 401 from refresh endpoint means gk_session is dead — evict.
        // Other errors (network, 5xx) leave the session intact; the caller
        // surfaces the failure without clearing auth state.
        if ((refreshError as AxiosError).response?.status === 401) {
          useAuthStore.getState().evictSession();
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors with retry logic
    if (error.response?.status !== 401) {
      const retryCount = originalRequest._retryCount || 0;
      const maxRetries = 3;

      if (retryCount < maxRetries && isRetryableError(error)) {
        originalRequest._retryCount = retryCount + 1;

        // Exponential backoff
        const delay = 1000 * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));

        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// Check if error is retryable (network errors, 5xx errors)
function isRetryableError(error: AxiosError): boolean {
  // Network errors
  if (!error.response) {
    return true;
  }

  // Server errors (5xx)
  if (error.response.status >= 500 && error.response.status < 600) {
    return true;
  }

  // Rate limit — don't retry
  if (error.response.status === 429) {
    return false;
  }

  return false;
}

export default axiosInstance;
