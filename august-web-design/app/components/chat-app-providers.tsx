'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { I18nProvider, LocationProvider, TourProvider } from '@/components/providers';
import { ErrorBoundary } from '@/components/error-boundary';
import { ChunkErrorHandler } from '@/components/chunk-error-handler';
import { LandscapeBlocker } from '@/components/layout/landscape-blocker';
import { LoginModalWatcher } from '@/components/auth';
import { NewConsultModal } from '@/components/consults/new-consult-modal';
import { TurnstileLoader } from '@/components/turnstile-loader';
// NOTE: chat-app.css is NOT imported here. It contains Tailwind v4 @theme
// inline directives that would leak into non-chat-app routes (health library,
// landing) if loaded via this client-component chunk. Instead, each layout
// that uses ChatAppProviders imports chat-app.css directly — that keeps the
// CSS scoped to the route it's rendered on.

// Long-form (webapp) routes that need natural page scrolling instead of the
// chat-app's internal-scroll panes. The chat-app shell normally locks
// html/body/main to overflow:hidden so /chat can manage its own scrolling.
// `/consults/e/<id>` hosts BOTH the post-payment wizard (DL / AV-video /
// pharmacy) AND the chat. Chat needs the chat-app shell locked to h-full
// (flex children compute correctly); the wizard steps scroll their own
// container instead. So `/consults/e` is intentionally NOT long-form here
// — the wizard branches in post-payment-flow.tsx wrap themselves in a
// scrollable container.
const LONG_FORM_PREFIXES = ['/consult', '/consults/d'];

export function ChatAppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isLongForm = LONG_FORM_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <div data-app="chat" data-longform={isLongForm ? '' : undefined} className={isLongForm ? 'antialiased' : 'antialiased h-full'}>
      <LandscapeBlocker />
      <TurnstileLoader />

      <I18nProvider>
        <ErrorBoundary>
          <ChunkErrorHandler />
          <LocationProvider>
            <TourProvider>
              {/* Renders SignUpModal based on the useLoginModalStore flag or
                  the /chat-specific force-login rule. Works on every chat-app
                  route, not just /chat where ChatContainer mounts. */}
              <Suspense fallback={null}>
                <LoginModalWatcher />
              </Suspense>
              <NewConsultModal />
              <main className={isLongForm ? '' : 'h-full overflow-hidden'}>{children}</main>
            </TourProvider>
          </LocationProvider>
        </ErrorBoundary>
      </I18nProvider>
    </div>
  );
}
