'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InPersonCareModal } from '../consult/steps/in-person-modal';

type VisitBucket = 'ready' | 'in-progress' | 'complete';

function bucketTitle(bucket: VisitBucket): string {
  switch (bucket) {
    case 'ready':
      return 'Visit is ready';
    case 'complete':
      return 'Visit is complete';
    default:
      return 'Visit is in progress';
  }
}

export function VisitTransitionOverlay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encounterId = searchParams?.get('consult_in_progress') || null;
  const visitStateParam = searchParams?.get('visit_state');
  const bucket: VisitBucket =
    visitStateParam === 'ready' || visitStateParam === 'complete'
      ? visitStateParam
      : 'in-progress';

  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    if (!encounterId) return;
    if (countdown <= 0) {
      // Replace (not push) so the back button doesn't bounce the user to
      // /chat?consult_in_progress=… and re-trigger the popup loop.
      router.replace(`/consults/e/${encounterId}`);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, encounterId, router, bucket]);

  if (!encounterId) return null;

  const countdownLabel = countdown > 0 ? `${countdown}…` : '0';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="visit-transition-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(20, 21, 21, 0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 416,
          background: 'linear-gradient(180deg, #F4F8F5 0%, #FFFFFF 60%)',
          border: '0.5px solid #E5E2DA',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 12px 36px rgba(20, 21, 21, 0.10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          boxSizing: 'border-box',
        }}
      >
        {/* Continuous left-to-right wave on the three dots conveys
            "actively transitioning" instead of the static checkmark the
            previous design used. Same sage-pill geometry as
            PendingIntake / SuccessPopup for visual consistency. */}
        <style>{`
          @keyframes visit-dot-pulse {
            0%, 60%, 100% { transform: scale(1);    opacity: 0.55; }
            30%           { transform: scale(1.25); opacity: 1; }
          }
        `}</style>
        <div
          role="img"
          aria-label={bucketTitle(bucket)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '14px 18px',
            background: '#E8F2ED',
            borderRadius: 999,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#206E55',
                boxShadow: '0 0 0 4px rgba(32, 110, 85, 0.10)',
                animation: 'visit-dot-pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 180}ms`,
              }}
            />
          ))}
        </div>
        {/* Title + subtitle grouped so the text block sits tight (8px)
            while the surrounding card gap stays at 20px — same stack
            pattern as PendingIntakeOverlay / SuccessPopup. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            width: '100%',
          }}
        >
          <h2
            id="visit-transition-title"
            style={{
              margin: 0,
              color: '#141515',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: 22,
              fontWeight: 500,
              lineHeight: '28px',
              letterSpacing: '-0.4px',
            }}
          >
            {bucketTitle(bucket)}
          </h2>
          <p
            aria-live="polite"
            style={{
              margin: 0,
              color: '#5A554A',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              fontWeight: 400,
              lineHeight: '23px',
              maxWidth: 320,
              fontVariantNumeric: 'tabular-nums',
              minHeight: 23,
            }}
          >
            Taking you to visit in {countdownLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DisqualifiedOverlay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encounterId = searchParams?.get('disqualified') || null;

  if (!encounterId) return null;
  const close = () => router.replace('/chat');

  return <InPersonCareModal onAcknowledge={close} onDismiss={close} />;
}

export function PendingIntakeOverlay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ddId = searchParams?.get('pending_intake') || null;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (ddId) setDismissed(false);
  }, [ddId]);

  if (!ddId || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    router.replace('/chat');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pending-intake-title"
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(20, 21, 21, 0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 416,
          background: 'linear-gradient(180deg, #F4F8F5 0%, #FFFFFF 60%)',
          border: '0.5px solid #E5E2DA',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 12px 36px rgba(20, 21, 21, 0.10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          boxSizing: 'border-box',
        }}
      >
        <ProgressDots filled={2} total={3} ariaLabel="Step 2 of 3 complete" />
        {/* Title + subtitle in their own column so the text block stays
            tight (8px) while the surrounding card uses a roomier 20px gap
            — same title-stack pattern as PreDoctorPopup. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            width: '100%',
          }}
        >
          <h2
            id="pending-intake-title"
            style={{
              margin: 0,
              color: '#141515',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: 22,
              fontWeight: 500,
              lineHeight: '28px',
              letterSpacing: '-0.4px',
            }}
          >
            You&apos;re almost there
          </h2>
          <p
            style={{
              margin: 0,
              color: '#5A554A',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              fontWeight: 400,
              lineHeight: '23px',
              maxWidth: 340,
            }}
          >
            Just a couple of details before your visit can begin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            router.push(`/consults/d/${ddId}?skip_pending_popup=1`);
          }}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 999,
            background: '#206E55',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: 500,
            lineHeight: '20px',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/**
 * Soft progress indicator — `filled` dots in brand green, the remainder
 * outlined in sage. Used to convey "you're partway through" without the
 * alarm of a warning glyph.
 */
function ProgressDots({
  filled,
  total,
  ariaLabel,
}: {
  filled: number;
  total: number;
  ariaLabel?: string;
}) {
  return (
    <div
      role="img"
      aria-label={ariaLabel ?? `${filled} of ${total} complete`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '14px 18px',
        background: '#E8F2ED',
        borderRadius: 999,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isFilled = i < filled;
        return (
          <span
            key={i}
            aria-hidden
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: isFilled ? '#206E55' : 'transparent',
              border: isFilled ? 'none' : '1.5px solid #B7D5C5',
              boxShadow: isFilled ? '0 0 0 4px rgba(32, 110, 85, 0.10)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
