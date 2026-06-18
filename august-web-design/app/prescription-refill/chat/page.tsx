'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, Copy, Pill, RotateCcw, X } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';
import { useIncognitoStore } from '@/stores/incognito-store';
import { disconnectWebPubSub } from '@/services/webpubsub-service';
import { ChatContainer, ChatSkeleton } from '@/components/chat';
import { MedicationSidebar } from './_medication-sidebar';

export default function PrescriptionRefillChatPage() {
  const router = useRouter();
  const [hasCheckedIncognitoSession, setHasCheckedIncognitoSession] = useState(false);
  // Toggle for the off-canvas sidebar drawer on mobile (<1200px). On
  // larger viewports the sidebar is always docked as a flex column, so
  // this state has no visible effect — kept here so the markup stays
  // viewport-agnostic.
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const isIncognitoMode = useIncognitoStore((s) => s.isIncognitoMode);
  const incognitoUserId = useIncognitoStore((s) => s.incognitoUserId);
  const restorePersistedSession = useIncognitoStore((s) => s.restorePersistedSession);
  const clearIncognitoData = useIncognitoStore((s) => s.clearIncognitoData);
  const [copiedUserId, setCopiedUserId] = useState(false);

  async function handleCopyUserId() {
    if (!incognitoUserId) return;
    try {
      await navigator.clipboard.writeText(incognitoUserId);
      setCopiedUserId(true);
      window.setTimeout(() => setCopiedUserId(false), 1500);
    } catch {
      // Clipboard API can fail in non-secure contexts; silently noop.
    }
  }

  useEffect(() => {
    if (isIncognitoMode) {
      setHasCheckedIncognitoSession(true);
      return;
    }

    const restored = restorePersistedSession();
    setHasCheckedIncognitoSession(true);

    if (!restored) {
      router.replace('/prescription-refill');
    }
  }, [isIncognitoMode, restorePersistedSession, router]);

  async function handleStartOver() {
    await disconnectWebPubSub();
    clearIncognitoData({ clearPersisted: true });
    clearMessages();
    window.location.assign('/prescription-refill');
  }

  if (!hasCheckedIncognitoSession || !isIncognitoMode) {
    return null;
  }

  return (
    <div className="prescription-refill-chat-shell h-full overflow-hidden">
      <style jsx global>{`
        /* Shell is a flex row: chat on the left, sidebar on the right.
           Each column owns its own positioning context, so the chat's
           absolute children (logo, Start over) can't bleed into the
           sidebar — and the sidebar can't bleed into the chat. */
        .prescription-refill-chat-shell {
          --background: #fff;
          background: #fff;
          display: flex;
          flex-direction: row;
        }

        .prescription-refill-chat-column {
          flex: 1 1 auto;
          /* min-width: 0 lets the chat shrink below its content's
             intrinsic width (otherwise flex children defer to content
             min-width and the row grows past the viewport). */
          min-width: 0;
          position: relative;
          height: 100%;
        }

        .prescription-refill-chat-sidebar-column {
          flex: 0 0 auto;
          /* 24 gap + 400 card + 24 gap. Sized for the wider approved
             review card; the 364 medication glow card just centers with
             extra horizontal breathing room. */
          width: 448px;
          height: 100%;
          /* 6px vertical only — the column is a sibling of the chat
             column now, so there's no logo/Start-over clearance to
             reserve here. Horizontal 24px keeps the side gutter. */
          padding: 6px 24px;
          display: flex;
          flex-direction: column;
          /* Vertically center the stack when it fits; the column does
             NOT scroll. When the viewport is too short, MedicationSidebar
             squeezes the glow card down to a minimum, then hides it
             entirely so the remaining cards still fit without a
             scrollbar. Horizontal centering matters on mobile where
             the drawer is full-width and the inner aside is 364. */
          justify-content: safe center;
          align-items: center;
          overflow: hidden;
        }
        /* On mobile (<1200px) the sidebar becomes a full-screen
           drawer. Default state: position:fixed across the whole
           viewport, slid out via translateX(100%). Adding 'is-open'
           translates it back to 0, animated via the transition. The
           drawer is dismissed by the X button in its top-left. */
        @media (max-width: 1199px) {
          .prescription-refill-chat-sidebar-column {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            max-width: 100%;
            z-index: 60;
            /* Layered radial wash (cool blue-grey top-right + warm taupe
               bottom-left + soft white base) — gives the glow card real
               colour variation to refract over instead of a flat #fff. */
            background:
              radial-gradient(60% 50% at 70% 30%, rgba(220, 226, 232, 0.9) 0%, transparent 70%),
              radial-gradient(50% 40% at 25% 80%, rgba(232, 226, 220, 0.9) 0%, transparent 70%),
              radial-gradient(80% 60% at 50% 50%, #ffffff 0%, #f4f5f7 100%);
            /* Drop the desktop 24px side padding so a 364-wide aside
               fits on narrower phones; align-items:center still
               horizontally centers the inner card. */
            padding: 6px 12px;
            transform: translateX(100%);
            transition: transform 280ms ease;
          }
          .prescription-refill-chat-sidebar-column.is-open {
            transform: translateX(0);
          }
        }

        /* Close button only matters when the drawer is full-screen on
           mobile — hide it on desktop where the sidebar is docked. */
        .prescription-refill-chat-close-sidebar {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 65;
          height: 36px;
          width: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(4, 5, 5, 0.12);
          border-radius: 999px;
          background: #ffffff;
          color: #040505;
          padding: 0;
          cursor: pointer;
          transition: background 0.15s ease-in-out;
        }
        .prescription-refill-chat-close-sidebar:hover {
          background: #f3f3f3;
        }
        @media (min-width: 1200px) {
          .prescription-refill-chat-close-sidebar {
            display: none;
          }
        }

        .prescription-refill-chat-main {
          height: 100%;
        }

        .prescription-refill-chat-logo {
          position: absolute;
          top: 15px;
          left: 24px;
          z-index: 20;
          display: inline-flex;
          align-items: center;
        }

        /* Top-right cluster — Start over + (mobile only) Pill icon to
           bring the sidebar drawer in from the right. */
        .prescription-refill-chat-actions {
          position: absolute;
          top: 10px;
          right: 16px;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* User-ID copy chip uses the same .prescription-refill-chat-start-over
           class as Start over so the two read as a matched pair, with a
           greyer text/icon color to keep it secondary. Truncation of the
           long ID is handled on the inner span. */
        .prescription-refill-chat-start-over.prescription-refill-chat-user-id-button {
          color: #888888;
        }
        @media (max-width: 1199px) {
          .prescription-refill-chat-actions
            .prescription-refill-chat-user-id-button {
            display: none;
          }
        }
        .prescription-refill-chat-sidebar-user-id {
          display: none;
          flex: 0 0 auto;
          justify-content: center;
          width: min(364px, calc(100vw - 24px));
          max-width: 100%;
          margin-bottom: 12px;
          z-index: 65;
        }
        .prescription-refill-chat-sidebar-user-id
          .prescription-refill-chat-user-id-button {
          width: 100%;
          max-width: 100%;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        @media (max-width: 1199px) {
          .prescription-refill-chat-sidebar-user-id {
            display: flex;
          }
        }
        .prescription-refill-chat-user-id-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 180px;
        }
        @media (max-width: 599px) {
          .prescription-refill-chat-user-id-text {
            max-width: 90px;
          }
          .prescription-refill-chat-sidebar-user-id
            .prescription-refill-chat-user-id-text {
            max-width: min(260px, calc(100vw - 88px));
          }
        }

        .prescription-refill-chat-start-over {
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(4, 5, 5, 0.12);
          border-radius: 10px;
          background: transparent;
          color: #040505;
          padding: 0 14px;
          font-size: 14px;
          font-weight: 500;
          line-height: 18px;
          cursor: pointer;
          transition: background 0.15s ease-in-out, border-color 0.15s ease-in-out;
        }
        .prescription-refill-chat-start-over:hover {
          background: #f3f3f3;
        }

        .prescription-refill-chat-show-sidebar {
          height: 36px;
          width: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(4, 5, 5, 0.12);
          border-radius: 999px;
          background: transparent;
          color: #040505;
          padding: 0;
          cursor: pointer;
          transition: background 0.15s ease-in-out, border-color 0.15s ease-in-out;
        }
        .prescription-refill-chat-show-sidebar:hover {
          background: #f3f3f3;
        }
        /* The pill toggle only exists for the mobile drawer — hide it
           when the sidebar is already docked at ≥1200px. */
        @media (min-width: 1200px) {
          .prescription-refill-chat-show-sidebar {
            display: none;
          }
        }

        /* Hide the chat container's own aside / mobile menu — scoped to
           inside the chat column so it doesn't touch the medication
           sidebar (which lives in a sibling column). */
        .prescription-refill-chat-column .prescription-refill-chat-main aside,
        .prescription-refill-chat-column .prescription-refill-chat-main div.lg\\:hidden {
          display: none !important;
        }

        .prescription-refill-chat-shell header > div:first-child button {
          display: none !important;
        }

        .prescription-refill-chat-shell header > div:last-child {
          display: none !important;
        }

        .prescription-refill-chat-shell .bookmark-banner {
          display: none !important;
        }

        /* Match the chat input container (#FAFAFA bg, #E0DDD5 border)
           so user messages read as the same paint as where they were
           typed. */
        .prescription-refill-chat-shell div:has(> .user-message) {
          background: #FAFAFA !important;
          border: 1px solid #E0DDD5;
        }

        .prescription-refill-chat-shell .bg-muted:has(span.animate-bounce) {
          background: transparent !important;
          border: 0;
          padding-left: 0;
          padding-right: 0;
        }

        .prescription-refill-chat-shell .bg-muted:has(span.animate-bounce) span.animate-bounce {
          background: #6f6f6f !important;
        }

        /* Attachments aren't part of the refill flow — strip the Plus
           button. The remaining mic/send button gets lifted out of the
           bottom row (below) so the input collapses to a single line
           with the placeholder and the mic at the same height. */
        .prescription-refill-chat-shell
          button[data-tour="attachment-button"] {
          display: none !important;
        }

        /* Single-line composer: the chat input container becomes the
           positioning context for the button row, which we float to the
           right edge so it sits beside the textarea instead of below
           it. Reserved padding on the textarea wrapper keeps the
           placeholder text clear of the floating button. */
        .prescription-refill-chat-shell
          div:has(> div > textarea.chat-input-textarea) {
          position: relative !important;
          padding-top: 14px !important;
          padding-bottom: 14px !important;
        }
        .prescription-refill-chat-shell
          div.w-full.mb-1:has(> textarea.chat-input-textarea) {
          padding-right: 48px !important;
          margin-bottom: 0 !important;
        }
        .prescription-refill-chat-shell
          .flex.items-center.justify-between.w-full:has(
            button[data-tour="attachment-button"]
          ) {
          position: absolute !important;
          top: 12px;
          right: 12px;
          width: auto !important;
          justify-content: flex-end !important;
        }
      `}</style>

      <div className="prescription-refill-chat-column">
        <a
          href="/"
          aria-label="August home"
          className="prescription-refill-chat-logo"
        >
          <Image
            src="/images/august-logo.svg"
            alt="august"
            width={80}
            height={25}
            priority
            unoptimized
          />
        </a>
        <div className="prescription-refill-chat-actions">
          {incognitoUserId && (
            <button
              type="button"
              className="prescription-refill-chat-start-over prescription-refill-chat-user-id-button"
              onClick={handleCopyUserId}
              aria-label={`Copy user ID ${incognitoUserId}`}
              title={incognitoUserId}
            >
              {copiedUserId ? (
                <Check size={15} strokeWidth={2.4} style={{ paddingBottom: 1 }} />
              ) : (
                <Copy size={15} strokeWidth={2.4} style={{ paddingBottom: 1 }} />
              )}
              <span className="prescription-refill-chat-user-id-text">
                {copiedUserId ? 'Copied' : incognitoUserId}
              </span>
            </button>
          )}
          <button
            type="button"
            className="prescription-refill-chat-start-over"
            onClick={handleStartOver}
          >
            <RotateCcw size={16} strokeWidth={2.4} />
            <span>Start Over</span>
          </button>
          <button
            type="button"
            className="prescription-refill-chat-show-sidebar"
            onClick={() => setMobileSidebarOpen((open) => !open)}
            aria-label={
              mobileSidebarOpen
                ? 'Hide medication details'
                : 'Show medication details'
            }
            aria-expanded={mobileSidebarOpen}
          >
            <Pill size={18} strokeWidth={2.2} />
          </button>
        </div>
        <div className="prescription-refill-chat-main">
          <Suspense fallback={<ChatSkeleton />}>
            <ChatContainer showDisabledSendWhenEmpty />
          </Suspense>
        </div>
      </div>

      <div
        className={`prescription-refill-chat-sidebar-column${
          mobileSidebarOpen ? ' is-open' : ''
        }`}
      >
        {incognitoUserId && (
          <div className="prescription-refill-chat-sidebar-user-id">
            <button
              type="button"
              className="prescription-refill-chat-start-over prescription-refill-chat-user-id-button"
              onClick={handleCopyUserId}
              aria-label={`Copy user ID ${incognitoUserId}`}
              title={incognitoUserId}
            >
              {copiedUserId ? (
                <Check size={15} strokeWidth={2.4} style={{ paddingBottom: 1 }} />
              ) : (
                <Copy size={15} strokeWidth={2.4} style={{ paddingBottom: 1 }} />
              )}
              <span className="prescription-refill-chat-user-id-text">
                {copiedUserId ? 'Copied' : incognitoUserId}
              </span>
            </button>
          </div>
        )}
        <button
          type="button"
          className="prescription-refill-chat-close-sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close medication details"
        >
          <X size={18} strokeWidth={2.2} />
        </button>
        <MedicationSidebar />
      </div>
    </div>
  );
}
