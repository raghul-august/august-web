import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { COOKIE_CONFIG } from '@/lib/config';

interface TourProgress {
  attachment: boolean;
  feedback: boolean;
  share: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  error: string | null;
  tourProgress: TourProgress;

  // Actions
  setUser: (user: User | null) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setTourStep: (step: keyof TourProgress) => void;

  // Token management via cookies
  // Note: refresh_token is handled by backend as HttpOnly cookie (gk_session)
  // We only manage access_token client-side for API calls
  getAccessToken: () => string | undefined;
  setAccessToken: (accessToken: string) => void;
  clearTokens: () => void;

  // Auth actions
  logout: () => void;
  // Involuntary eviction (refresh 401, session revoked). Clears tokens and
  // flips isAuthenticated so UI can prompt re-auth, but preserves user and
  // isAnonymous so the shell still renders correctly and the UI can tell
  // an evicted signed-in user apart from a fresh anonymous visitor.
  evictSession: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isAnonymous: true,
  error: null,
  tourProgress: {
    attachment: false,
    feedback: false,
    share: false,
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // `isAuthenticated` means "the user has finished signing in with a
       // named account" — NOT just "we have a backend session token". Anon
       // sessions count as `isAnonymous: true` and `isAuthenticated: false`.
      setUser: (user) => set((state) => ({
        user,
        isAuthenticated: !!user && !state.isAnonymous,
        error: null,
      })),

      setIsAnonymous: (isAnonymous) => set((state) => ({
        isAnonymous,
        isAuthenticated: !!state.user && !isAnonymous,
      })),

      setIsLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      setTourStep: (step) => set((state) => ({
        tourProgress: {
          ...state.tourProgress,
          [step]: true,
        },
      })),

      getAccessToken: () => {
        return Cookies.get(COOKIE_CONFIG.ACCESS_TOKEN);
      },

      setAccessToken: (accessToken) => {
        const isLocalhost = typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        Cookies.set(
          COOKIE_CONFIG.ACCESS_TOKEN,
          accessToken,
          COOKIE_CONFIG.ACCESS_TOKEN_OPTIONS
        );

        // Verify immediately
        const verify = Cookies.get(COOKIE_CONFIG.ACCESS_TOKEN);

        if (!verify) {
          // Try setting without secure flag for non-HTTPS
          Cookies.set(COOKIE_CONFIG.ACCESS_TOKEN, accessToken, {
            path: '/',
            sameSite: 'lax',
            secure: false,
          });
          const retryVerify = Cookies.get(COOKIE_CONFIG.ACCESS_TOKEN);
        }
      },

      clearTokens: () => {
        // Only clear access_token - refresh token (gk_session) is HttpOnly and managed by backend
        Cookies.remove(COOKIE_CONFIG.ACCESS_TOKEN, { path: '/' });
      },

      logout: () => {
        get().clearTokens();
        set(initialState);
      },

      // Backend invalidated our session (refresh 401). Only flips the auth
      // flag — keeps `user` and `isAnonymous: false` intact so the UI can
      // tell "you were signed in, your session expired" apart from a fresh
      // anon visitor.
      evictSession: () => {
        get().clearTokens();
        set({ isAuthenticated: false });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Safe localStorage wrapper that handles errors
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return {
          getItem: (name: string) => {
            try {
              return localStorage.getItem(name);
            } catch {
              return null;
            }
          },
          setItem: (name: string, value: string) => {
            try {
              localStorage.setItem(name, value);
            } catch {
            }
          },
          removeItem: (name: string) => {
            try {
              localStorage.removeItem(name);
            } catch {
            }
          },
        };
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAnonymous: state.isAnonymous,
        tourProgress: state.tourProgress,
      }),
      // Self-heal stale persisted state from before isAuthenticated's semantic
      // change (when it used to be `!!user`). Recompute it as
      // "user is set AND not anonymous" on every rehydration.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const correctIsAuthed = !!state.user && !state.isAnonymous;
        if (state.isAuthenticated !== correctIsAuthed) {
          state.isAuthenticated = correctIsAuthed;
        }
      },
    }
  )
);

/**
 * Returns `false` until the auth store is safe to read on the client, then
 * `true`. Route guards must wait for this before treating `isAnonymous` as
 * authoritative — otherwise a signed-in user landing directly on a gated route
 * (e.g. /ehr) is bounced to '/' before the real session is known.
 *
 * Two separate hydration steps make the early render untrustworthy:
 *   1. zustand's `persist` middleware applies the stored values in a deferred
 *      microtask (it wraps even synchronous storage reads in a thenable).
 *   2. React's `useSyncExternalStore` returns the *server snapshot* (the store's
 *      initial defaults, `isAnonymous: true`) on the first client render to
 *      match the SSR HTML, then re-renders with the real client value a tick
 *      later.
 *
 * Crucially we must start from `false` and only flip to `true` inside an effect.
 * Initializing from `persist.hasHydrated()` looks correct but that imperative
 * getter can already report `true` during step 2's reconciliation render, while
 * the component still sees the stale `isAnonymous: true` snapshot — which is
 * exactly the window that triggers the bogus redirect. Soft client navigations
 * don't hit any of this because both steps finished earlier in the session.
 */
export function useAuthHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
