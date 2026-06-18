'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SignUpModal } from './signup-modal';
import { useAuthStore, useAuthHasHydrated } from '@/stores/auth-store';
import { useLoginModalStore } from '@/stores/login-modal-store';
import {
  ANON_ALLOWED_KEY,
  ANON_TELEHEALTH_PARAM,
  TELEHEALTH_ANON_ROUTE_KEY,
  TOOL_WIDGET_SOURCES,
} from '@/lib/anon-access';

const HISTORY_SENTINEL = '__august_login_modal__';

// Routes that require a signed-in (named) account. Unauthenticated visitors who
// land here get a non-dismissible SignUpModal instead of being redirected to the
// marketing home — they stay on the page and the modal lifts the moment they
// sign in. Matches the route itself and any nested path under it.
//
// anon users may view the records landing read-only. 
const NAMED_AUTH_ROUTE_PREFIXES = ['/scribe'];

function isNamedAuthRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return NAMED_AUTH_ROUTE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/**
 * Renders the SignUpModal across every chat-app route. Three triggers, all
 * gated on `!isAuthenticated`:
 *
 *   1. Explicit login intent — sidebar/navbar/account-sheet buttons call
 *      `useLoginModalStore.getState().open()`. Works on any route.
 *
 *   2. Route is `/chat` or any `/consult(s)` route AND anon chat is not
 *      allowed for this user (either the backend kill-switch is off, or the
 *      user hasn't been through a tool widget on this browser). Consult
 *      routes never function anonymously (encounters belong to a real user),
 *      so we gate them the same way as `/chat`. Anon sessions on other
 *      routes (e.g. `/tool/*`) do NOT force the modal.
 *
 *   3. Route is a named-account-only route (`/ehr`, `/scribe`, …). These used
 *      to redirect anon users to '/'; instead we keep them on the page behind
 *      a forced modal so signing in lands them where they intended to go.
 *
 * When anon is allowed (user arrived through a widget before), the modal is
 * DISMISSIBLE: backdrop click and browser-back both close it. The forced-login
 * gates (#2 and #3) stay up until the user actually signs in.
 */
export function LoginModalWatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const authHasHydrated = useAuthHasHydrated();
  const isOpenFromIntent = useLoginModalStore((s) => s.isOpen);

  const [hydrated, setHydrated] = useState(false);
  const [anonFromWidget, setAnonFromWidget] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const src = searchParams.get('src') || '';
    const arrivedFromAnonTelehealth =
      searchParams.get(ANON_TELEHEALTH_PARAM) === 'true';
    const arrivedFromToolWidget =
      TOOL_WIDGET_SOURCES.has(src) ||
      arrivedFromAnonTelehealth;
    if (arrivedFromToolWidget) {
      try {
        localStorage.setItem(ANON_ALLOWED_KEY, '1');
        setAnonFromWidget(localStorage.getItem(ANON_ALLOWED_KEY) === '1');
      } catch {
        setAnonFromWidget(true);
      }
    } else {
      try {
        setAnonFromWidget(localStorage.getItem(ANON_ALLOWED_KEY) === '1');
      } catch {
        setAnonFromWidget(false);
      }
    }
    if (arrivedFromAnonTelehealth) {
      try {
        sessionStorage.setItem(TELEHEALTH_ANON_ROUTE_KEY, '1');
      } catch {
      }
    }
    if (arrivedFromAnonTelehealth) {
      const url = new URL(window.location.href);
      url.searchParams.delete(ANON_TELEHEALTH_PARAM);
      window.history.replaceState(
        window.history.state ?? {},
        '',
        `${url.pathname}${url.search}${url.hash}`
      );
    }
    setHydrated(true);
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && isOpenFromIntent) {
      useLoginModalStore.getState().close();
    }
  }, [isAuthenticated, isOpenFromIntent]);

  const anonChatBackendEnabled =
    process.env.NEXT_PUBLIC_ENABLE_ANONCHAT === 'true';
  const anonChatAllowed = anonChatBackendEnabled && anonFromWidget;
  const isChatRoute = pathname === '/chat' || pathname?.startsWith('/chat/');
  const isConsultRoute =
    pathname === '/consult' || pathname?.startsWith('/consult/') ||
    pathname === '/consults' || pathname?.startsWith('/consults/');
  const forceLogin = (isChatRoute || isConsultRoute) && !anonChatAllowed;

  // Named-account-only routes (e.g. /ehr, /scribe) force the modal for any
  // unauthenticated visitor. Gated on `authHasHydrated` so a signed-in user
  // hard-loading the route doesn't get a flash of the modal during the brief
  // window before the persisted session is restored.
  const forceLoginOnNamedRoute = authHasHydrated && isNamedAuthRoute(pathname);

  const shouldRender =
    hydrated &&
    !isAuthenticated &&
    (isOpenFromIntent || forceLogin || forceLoginOnNamedRoute);
  // Forced gates (chat without anon access, named-account routes) can't be
  // dismissed — there's nothing usable behind them until the user signs in.
  // Everything else (an explicitly-opened modal, e.g. an anon clicking an EHR
  // action) is dismissible so they can return to the page behind it.
  const dismissible = !forceLogin && !forceLoginOnNamedRoute;

  // Browser-back integration: while the modal is open AND dismissible, push a
  // sentinel history entry. Back consumes that entry (closing the modal) and
  // does NOT navigate the user away from the current page.
  useEffect(() => {
    if (!shouldRender || !dismissible) return;
    if (typeof window === 'undefined') return;

    const alreadyOnSentinel = window.history.state?.[HISTORY_SENTINEL] === true;
    if (!alreadyOnSentinel) {
      window.history.pushState(
        { ...(window.history.state || {}), [HISTORY_SENTINEL]: true },
        '',
        window.location.href
      );
    }

    const onPopState = () => {
      useLoginModalStore.getState().close();
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      // If the modal was closed by signup success (not back button), pop the
      // sentinel entry so the user's back history isn't polluted.
      if (window.history.state?.[HISTORY_SENTINEL] === true) {
        window.history.back();
      }
    };
  }, [shouldRender, dismissible]);

  if (!shouldRender) return null;

  return (
    <SignUpModal
      dismissible={dismissible}
      onDismiss={() => useLoginModalStore.getState().close()}
    />
  );
}
