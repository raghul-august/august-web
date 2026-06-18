'use client';

import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { oauthSignIn } from '@/services/auth-service';
import { track } from '@/services/analytics-service';
import { getTelehealthBaseParams } from '@/services/telehealth-analytics';
import { trackClevertap } from '@/utils/clevertap';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { useI18n } from '@/components/providers';

function trackLoginFailed(loginType: 'google' | 'apple', reason: string, extra?: Record<string, unknown>) {
  track('login_failed', { login_type: loginType, reason, ...extra });
  trackClevertap('Login Failed', { type: loginType === 'google' ? 'Google' : 'Apple', reason });
}

interface OAuthButtonsProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function OAuthButtons({ onSuccess, onError }: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const handleGoogleSuccess = async (idToken: string, user: GoogleUser) => {
    setIsLoading(true);

    try {
      const response = await oauthSignIn({
        provider: 'google',
        idToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          givenName: user.givenName,
          familyName: user.familyName,
          photo: user.photo,
        },
      });

      if (response.success && response.accessToken) {
        track('login_completed', { ...getTelehealthBaseParams(), login_type: 'google' });
        trackClevertap('Login Completed', { type: 'Google' });
        onSuccess();
      } else {
        logger.error('Google oauthSignIn returned failure', { error: response.error });
        trackLoginFailed('google', 'backend_rejected', { backend_error: response.error });
        onError(t('auth.errors.oauthGeneric'));
      }
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const backendError = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)?.error
        : undefined;
      logger.error('Google sign in error', { ...serializeError(err), status, backendError });
      trackLoginFailed('google', 'backend_error', { status, backend_error: backendError });
      onError(t('auth.errors.oauthGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 flex flex-col items-center w-full">
      <GoogleSignInButton
        onSuccess={handleGoogleSuccess}
        onError={onError}
        disabled={isLoading}
      />

      <AppleSignInButton onSuccess={onSuccess} onError={onError} />
    </div>
  );
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  photo: string;
}

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string, user: GoogleUser) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

function GoogleSignInButton({ onSuccess, onError, disabled }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Get user info from Google using the access token
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!response.ok) {
          const bodyText = await response.text().catch(() => '');
          logger.error('Google userinfo HTTP error', {
            status: response.status,
            body: bodyText.slice(0, 300),
          });
          trackLoginFailed('google', 'userinfo_http_error', { status: response.status });
          onError(t('auth.errors.googleUserInfo'));
          setIsLoading(false);
          return;
        }
        const userInfo = await response.json();

        const user: GoogleUser = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name || '',
          givenName: userInfo.given_name || '',
          familyName: userInfo.family_name || '',
          photo: userInfo.picture || '',
        };

        onSuccess(tokenResponse.access_token, user);
      } catch (err) {
        logger.error('Google userinfo error', serializeError(err));
        trackLoginFailed('google', 'userinfo_fetch_failed');
        onError(t('auth.errors.googleUserInfo'));
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      logger.warn('Google useGoogleLogin onError', { errorResponse });
      trackLoginFailed('google', 'popup_cancelled_or_blocked', {
        error: errorResponse?.error,
        error_description: errorResponse?.error_description,
      });
      onError(t('auth.errors.googleCancelled'));
    },
    flow: 'implicit',
    scope: 'openid email profile',
  });

  return (
    <button
      onClick={() => {
        track('login_button_clicked', { login_type: 'google' });
        trackClevertap('Login Button Clicked', { type: 'Google' });
        googleLogin();
      }}
      disabled={disabled || isLoading}
      className="flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-[#EDEBE5] transition-colors disabled:opacity-50"
      style={{
        width: '100%',
        padding: '3.5% 2%',
        gap: '2%',
        borderRadius: '60px',
        border: '1px solid #CACECD',
      }}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <GoogleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{t('auth.oauth.google')}</span>
        </>
      )}
    </button>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

interface AppleSignInButtonProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

function AppleSignInButton({ onSuccess, onError }: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const { t } = useI18n();

  // Check if SDK is loaded on mount and when it becomes available
  useEffect(() => {
    const checkSdk = () => {
      if (typeof window !== 'undefined' && window.AppleID) {

        // Initialize Apple Sign In
        const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
        const redirectURI = typeof window !== 'undefined' ? window.location.origin : '';

        if (clientId) {
          try {
            window.AppleID.auth.init({
              clientId,
              scope: 'name email',
              redirectURI,
              usePopup: true,
            });
          } catch {
            //console.error('[Apple Sign In] SDK init error:', err);
          }
        } else {
          //console.warn('[Apple Sign In] NEXT_PUBLIC_APPLE_CLIENT_ID not set');
        }

        setSdkReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkSdk()) return;

    // Poll for SDK availability (it loads async)
    const interval = setInterval(() => {
      if (checkSdk()) {
        clearInterval(interval);
      }
    }, 100);

    // Clean up after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!sdkReady) {
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [sdkReady]);

  const handleAppleSignIn = async () => {
    if (typeof window === 'undefined') {
      onError(t('auth.errors.appleUnavailable'));
      return;
    }

    if (!window.AppleID) {
      onError(t('auth.errors.appleUnavailableSdk'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await window.AppleID.auth.signIn();

      const identityToken = response.authorization?.id_token;

      if (!identityToken) {
        onError(t('auth.errors.appleCredential'));
        setIsLoading(false);
        return;
      }

      // Decode the JWT to get the user ID (sub claim)
      // JWT format: header.payload.signature
      const tokenParts = identityToken.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const appleUserId = payload.sub;
      const emailFromToken = payload.email;

      const signInResponse = await oauthSignIn({
        provider: 'apple',
        identityToken: identityToken,
        user: appleUserId, // Apple user ID string (sub claim)
        email: response.user?.email || emailFromToken,
        fullName: response.user?.name ? {
          givenName: response.user.name.firstName,
          familyName: response.user.name.lastName,
        } : undefined,
      });


      if (signInResponse.success && signInResponse.accessToken) {
        track('login_completed', { ...getTelehealthBaseParams(), login_type: 'apple' });
        trackClevertap('Login Completed', { type: 'Apple' });
        onSuccess();
      } else {
        logger.error('Apple oauthSignIn returned failure', { error: signInResponse.error });
        trackLoginFailed('apple', 'backend_rejected', { backend_error: signInResponse.error });
        onError(t('auth.errors.oauthGeneric'));
      }
    } catch (err) {
      // User cancelled or error occurred
      const errorObj = err as { error?: string };
      if (errorObj?.error === 'popup_closed_by_user') {
        trackLoginFailed('apple', 'popup_closed_by_user');
      } else {
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        const backendError = axios.isAxiosError(err)
          ? (err.response?.data as { error?: string } | undefined)?.error
          : undefined;
        logger.error('Apple sign in error', { ...serializeError(err), status, backendError });
        trackLoginFailed('apple', 'sdk_or_backend_error', { status, backend_error: backendError });
        onError(t('auth.errors.appleFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={() => {
        track('login_button_clicked', { login_type: 'apple' });
        trackClevertap('Login Button Clicked', { type: 'Apple' });
        handleAppleSignIn();
      }}
      disabled={isLoading}
      className="flex items-center justify-center text-sm font-medium text-black hover:bg-[#EDEBE5] transition-colors disabled:opacity-50"
      style={{
        width: '100%',
        padding: '3.5% 2%',
        gap: '2%',
        borderRadius: '60px',
        border: '1px solid #CACECD',
      }}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <AppleIcon className="h-5 w-5 text-black" />
          <span className="text-sm font-medium">{t('auth.oauth.apple')}</span>
        </>
      )}
    </button>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 20" fill="currentColor">
      <path d="M12.87 10.09c-.02-2.31 1.89-3.42 1.97-3.47-1.07-1.57-2.74-1.78-3.34-1.81-1.42-.14-2.77.84-3.49.84-.72 0-1.83-.82-3.01-.8-1.55.02-2.98.9-3.78 2.29-1.61 2.79-.41 6.93 1.16 9.2.77 1.11 1.69 2.36 2.89 2.32 1.16-.05 1.6-.75 3-.75s1.8.75 3.02.72c1.25-.02 2.04-1.13 2.8-2.25.88-1.29 1.25-2.54 1.27-2.6-.03-.01-2.43-.93-2.46-3.69h-.03zM10.6 3.28c.64-.78 1.08-1.86.96-2.94-.93.04-2.05.62-2.72 1.4-.6.69-1.12 1.8-.98 2.86 1.04.08 2.1-.53 2.74-1.32z" />
    </svg>
  );
}

// Type declarations for Apple Sign In
declare global {
  interface Window {
    AppleID?: {
      auth: {
        signIn: () => Promise<{
          authorization?: {
            id_token?: string;
            code?: string;
          };
          user?: {
            email?: string;
            name?: {
              firstName?: string;
              lastName?: string;
            };
          };
        }>;
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
      };
    };
  }
}
