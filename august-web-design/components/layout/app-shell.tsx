'use client';

import {
  Suspense,
  createContext,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import {
  postToNative,
  useIsWebview,
  useWebviewBackMessage,
} from '@/hooks/use-webview';

interface AppShellContextValue {
  openSidebar: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShellSidebar(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error('useAppShellSidebar must be used inside <AppShell>');
  }
  return ctx;
}

export interface AppShellProps {
  children: ReactNode;
  /** Inline background color on the outer wrapper. Defaults to var(--background). */
  background?: string;
  /** Extra className on the outer div — used by cost-estimator + explore. */
  className?: string;
  /** `source` field sent to the native host in the exit postMessage. Defaults to 'tools'. */
  webviewExitSource?: string;
  /**
   * External-domain handling. When true, the navbar hides the menu button
   * and uses the provided `externalLoginUrl` for the login CTA, and the
   * sidebar is hidden. Only used by the cost-estimator embedded on
   * third-party domains.
   */
  externalDomain?: boolean;
  externalLoginUrl?: string;
  /**
   * Optional override for the back action invoked by the in-webview back
   * chevron AND the native-host `{type:'NAVIGATION',action:'BACK'}` message.
   * Defaults to posting the exit message to the native host.
   */
  onBack?: () => void;
  /**
   * Optional override for the non-webview header. When omitted, a default
   * <Navbar /> is rendered with menu-click, hideMenuButton, and loginUrl
   * wired up from the other props. Used by explore to render a wrapped
   * Navbar with per-page back-button chrome.
   */
  renderNavbar?: (ctx: { openSidebar: () => void }) => ReactNode;
  /** Extra inline style merged onto the outer wrapper. */
  style?: CSSProperties;
}

function AppShellInner({
  children,
  background,
  className,
  webviewExitSource = 'tools',
  externalDomain = false,
  externalLoginUrl,
  onBack,
  renderNavbar,
  style,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isWebview = useIsWebview();

  const ctxValue = useMemo<AppShellContextValue>(
    () => ({ openSidebar: () => setSidebarOpen(true) }),
    [],
  );

  const handleBack =
    onBack ??
    (() =>
      postToNative({
        source: webviewExitSource,
        type: 'NAVIGATION',
        action: 'BACK',
      }));

  useWebviewBackMessage(handleBack);

  return (
    <AppShellContext.Provider value={ctxValue}>
    <div
      className={`h-full w-full flex overflow-hidden${className ? ` ${className}` : ''}`}
      style={{ background: background ?? 'var(--background)', ...style }}
    >
      {!isWebview && !externalDomain && (
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      )}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {isWebview ? (
          <div className="shrink-0 px-4 pt-[env(safe-area-inset-top)] pb-3">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-9 h-9 rounded-full mt-12 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '0.5px solid rgba(255,255,255,0.6)',
              }}
              aria-label="Go back"
            >
              <svg
                width="7"
                height="12"
                viewBox="0 0 7 12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 1L1 6l5 5"
                  fill="none"
                  stroke="#141515"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : renderNavbar ? (
          renderNavbar({ openSidebar: () => setSidebarOpen(true) })
        ) : (
          <Navbar
            onMenuClick={() => setSidebarOpen(true)}
            hideMenuButton={externalDomain}
            loginUrl={externalDomain ? externalLoginUrl : undefined}
          />
        )}
        <div className="flex-1 overflow-y-auto" data-scroll-container>
          {children}
        </div>
      </div>
    </div>
    </AppShellContext.Provider>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <Suspense>
      <AppShellInner {...props} />
    </Suspense>
  );
}
