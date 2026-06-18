'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { AccessGate, ACCESS_FIELD } from './_access-gate';
import { DoseSpotRetrieval } from './_dosespot-retrieval';
import { EmailAuth } from './_email-auth';
import { EmailMenu } from './_email-menu';
import { PersonaVerification, PERSONA_VERIFIED_FIELD } from './_persona-verification';
import { SelectMedication, type Medication } from './_select-medication';
import { useLensSettings } from './_lens-controls';
import { COLORS } from './_palette';

/*
 * This component is the full prescription-refill experience.
 *
 * Keep route files thin:
 * - app/prescription-refill/page.tsx renders this for the original URL.
 * - app/august-prescriptions/page.tsx renders this for the prescriptions URL.
 *
 * That way the page logic stays in one place and new slugs do not copy/paste
 * the whole UI.
 */
export function PrescriptionRefillFlow() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const lens = useLensSettings();

  /*
   * Persona verification persists across sessions via user metadata. Treat any
   * truthy value as verified (backend may return "true", true, "True", etc.).
   */
  const personaFlag = user?.[PERSONA_VERIFIED_FIELD];
  const identityVerified = !!personaFlag && personaFlag !== 'false' && personaFlag !== 'False';

  /*
   * Whitelist gate. Backend (gatekeeper) defaults `access` to `false` for new
   * august-prescriptions users and returns it inside the verify-OTP user
   * payload as a boolean. Admins flip it to `true` in the DB to grant access.
   * Anything that isn't explicitly `true` keeps the gate up — handles missing
   * field, legacy string values, and stale local state.
   */
  const accessFlag = user?.[ACCESS_FIELD];
  const hasAccess =
    accessFlag === true || accessFlag === 'true' || accessFlag === 'True';

  /*
   * Zustand auth state is restored from localStorage in the browser.
   * Waiting for mount avoids rendering the wrong step during server render.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <PageBackground>
      <PageHeader email={mounted && isAuthenticated ? user?.email : undefined} />

      <main
        className="prx-action-room"
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // Symmetric top/bottom padding so short steps (EmailAuth,
          // AccessGate, PersonaVerification) sit vertically centered
          // in the viewport. The .prx-action-room class still adds
          // extra bottom padding on mobile so content isn't hidden
          // behind the fixed CTA.
          padding: 'clamp(32px, 6vh, 96px) 20px clamp(32px, 6vh, 96px)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: identityVerified && selectedMedication ? '880px' : '416px',
          }}
        >
          {mounted && (
            <>
              {!isAuthenticated && <EmailAuth />}

              {isAuthenticated && !hasAccess && <AccessGate />}

              {isAuthenticated && hasAccess && !identityVerified && <PersonaVerification />}

              {isAuthenticated && hasAccess && identityVerified && !selectedMedication && (
                <SelectMedication
                  onContinue={(medication) => setSelectedMedication(medication)}
                />
              )}

              {isAuthenticated && hasAccess && identityVerified && selectedMedication && (
                <DoseSpotRetrieval medication={selectedMedication} lens={lens} />
              )}
            </>
          )}
        </div>
      </main>
    </PageBackground>
  );
}

function PageBackground({ children }: { children: React.ReactNode }) {
  // `100dvh` is the dynamic viewport height — it tracks the visible
  // area including mobile Safari's URL bar. Using `100vh` here would
  // make the page exactly the URL-bar-hidden viewport, which can park
  // the bottom button under the URL bar with no way to scroll it
  // into view on the retrieval step.
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: `linear-gradient(var(--prxGradAngle, 165deg), ${COLORS.bgPrimary} 0%, ${COLORS.bgPrimary} 65%, ${COLORS.bgAccent} 120%)`,
        backgroundSize: '140% 140%',
        animation:
          'prxBgWave 16s ease-in-out infinite, prxAngleSway 19s ease-in-out infinite',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <BackgroundAnimationStyles />

      <div
        style={{
          width: '100%',
          maxWidth: '1800px',
          margin: '0 auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PageHeader({ email }: { email?: string }) {
  return (
    <header
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <a href="/" aria-label="August home" style={{ display: 'inline-block' }}>
        <Image
          src="/images/august-logo.svg"
          alt="august"
          width={80}
          height={25}
          priority
          unoptimized
        />
      </a>

      {email && <EmailMenu email={email} />}
    </header>
  );
}

function BackgroundAnimationStyles() {
  return (
    <style jsx global>{`
      @property --prxGradAngle {
        syntax: '<angle>';
        inherits: false;
        initial-value: 165deg;
      }

      @keyframes prxBgWave {
        0% {
          background-position: 72% 88%;
        }
        13% {
          background-position: 100% 70%;
        }
        29% {
          background-position: 90% 100%;
        }
        46% {
          background-position: 65% 95%;
        }
        67% {
          background-position: 96% 65%;
        }
        89% {
          background-position: 78% 100%;
        }
        100% {
          background-position: 72% 88%;
        }
      }

      @keyframes prxAngleSway {
        0% {
          --prxGradAngle: 165deg;
        }
        14% {
          --prxGradAngle: 173deg;
        }
        37% {
          --prxGradAngle: 156deg;
        }
        61% {
          --prxGradAngle: 174deg;
        }
        83% {
          --prxGradAngle: 159deg;
        }
        100% {
          --prxGradAngle: 165deg;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        @keyframes prxBgWave {
          0%,
          100% {
            background-position: 85% 85%;
          }
        }

        @keyframes prxAngleSway {
          0%,
          100% {
            --prxGradAngle: 165deg;
          }
        }
      }

      /* Mobile sticky action bar — every primary CTA in the refill flow
         (Continue on EmailAuth / AccessGate / PersonaVerification /
         SelectMedication / DoseSpotRetrieval) lands at the bottom of
         the viewport instead of being pushed below the fold. Only ever
         one button rendered at a time, so there's no stacking concern.
         Inline styles on the button win on specificity; the !important
         flags below let the responsive overrides through. */
      @media (max-width: 720px) {
        .prx-primary-button {
          position: fixed !important;
          left: 16px !important;
          right: 16px !important;
          bottom: max(16px, env(safe-area-inset-bottom)) !important;
          width: auto !important;
          max-width: 416px !important;
          margin: 0 auto !important;
          z-index: 50;
        }
        /* Reserve room for the fixed button so the bottom of the card
           isn't hidden behind it. 52 (button height) + 16+16 (top/bottom
           offsets) + 8 breathing room ≈ 92. */
        .prx-action-room {
          padding-bottom: calc(92px + env(safe-area-inset-bottom)) !important;
        }
      }
    `}</style>
  );
}
