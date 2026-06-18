'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  CircleNotch,
} from '@phosphor-icons/react';
import { useIncognitoStore, PRESCRIPTION_REFILL_TENANT } from '@/stores/incognito-store';
import { serializeError } from '@/services/error-reporter';
import logger from '@/utils/logger';
import { PrimaryButton } from './_primary-button';
import { COLORS } from './_palette';
import type { Medication, Prescription } from './_medications';
import type { LensSettings } from './_lens-controls';
import { readPatientInfo } from './_patient-info';

// Hemisphere profile (matches the "sphere" preset from the lab)
const BADGE_PROFILE = (t: number) => Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2)));

function sdRoundedRect(px: number, py: number, w: number, h: number, r: number) {
  const qx = Math.abs(px - w / 2) - w / 2 + r;
  const qy = Math.abs(py - h / 2) - h / 2 + r;
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - r;
}

function buildLensMap(
  width: number,
  height: number,
  radius: number,
  bezel: number,
  profile: (t: number) => number = BADGE_PROFILE
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const image = ctx.createImageData(width, height);
  const data = image.data;
  const eps = 0.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sdf = sdRoundedRect(x, y, width, height, radius);
      let dx = 0;
      let dy = 0;

      if (sdf < 0 && -sdf < bezel) {
        const dsdx =
          (sdRoundedRect(x + eps, y, width, height, radius) -
            sdRoundedRect(x - eps, y, width, height, radius)) /
          (2 * eps);
        const dsdy =
          (sdRoundedRect(x, y + eps, width, height, radius) -
            sdRoundedRect(x, y - eps, width, height, radius)) /
          (2 * eps);
        const gradLen = Math.hypot(dsdx, dsdy) || 1;
        const nx = dsdx / gradLen;
        const ny = dsdy / gradLen;

        const t = 1 - -sdf / bezel;
        const intensity = profile(t);

        // Inward = convex lens (magnify the backdrop, breaking text geometry)
        dx = -nx * intensity;
        dy = -ny * intensity;
      }

      const i = (y * width + x) * 4;
      data[i + 0] = Math.round(128 + dx * 127);
      data[i + 1] = Math.round(128 + dy * 127);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

const DEFAULT_PRESCRIPTION: Prescription = {
  sig: 'Take as directed by your provider.',
  dispense: '30-day supply',
  refills: '2 remaining',
  prescribedDaysAgo: 27,
  prescriber: 'Dr. John Doe',
  credential: 'NPI 1487201930',
};

const PRESCRIBED_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function prescribedDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return PRESCRIBED_DATE_FORMAT.format(date);
}

type RetrievalStatus = 'ready' | 'requesting' | 'retrieved';

type DoseSpotRetrievalProps = {
  medication: Medication;
  lens: LensSettings;
};

const STEP_INTERVAL_MS = 1400;
const FINAL_PAUSE_MS = 900;

const RETRIEVAL_STEPS = [
  'Opening a secure DoseSpot request',
  'Searching active prescriptions',
  'Matching the medication and dose',
  'Pulling prescription details',
];

export function DoseSpotRetrieval({ medication, lens }: DoseSpotRetrievalProps) {
  const [status, setStatus] = useState<RetrievalStatus>('ready');
  const [activeStep, setActiveStep] = useState(0);
  const [continueBusy, setContinueBusy] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);
  const router = useRouter();
  const enterIncognitoMode = useIncognitoStore((s) => s.enterIncognitoMode);
  const setSelectedMedicationId = useIncognitoStore((s) => s.setSelectedMedicationId);

  /*
   * This is intentionally mocked for now. The UI behaves like the real request:
   * start, progress through a few states, then show the retrieved prescription.
   */
  useEffect(() => {
    if (status !== 'requesting') return;

    const stepTimers = RETRIEVAL_STEPS.map((_, index) =>
      window.setTimeout(() => setActiveStep(index), index * STEP_INTERVAL_MS)
    );

    const doneTimer = window.setTimeout(() => {
      setStatus('retrieved');
    }, RETRIEVAL_STEPS.length * STEP_INTERVAL_MS + FINAL_PAUSE_MS);

    return () => {
      stepTimers.forEach(window.clearTimeout);
      window.clearTimeout(doneTimer);
    };
  }, [status]);

  function requestPrescription() {
    setActiveStep(0);
    setStatus('requesting');
  }

  async function continueToChat() {
    if (continueBusy) return;

    setContinueBusy(true);
    setContinueError(null);

    try {
      // Pull the latest patient demographics from localStorage. The
      // refill-details form mirrors every change back, so this picks up
      // whatever the user last typed even without an explicit save.
      // Also forward the medication + its prescription block so the
      // backend knows what is being refilled.
      const success = await enterIncognitoMode(
        PRESCRIPTION_REFILL_TENANT,
        readPatientInfo(),
        {
          id: medication.id,
          name: medication.name,
          prescription: medication.prescription ?? DEFAULT_PRESCRIPTION,
        },
      );
      if (!success) {
        throw new Error('Failed to start incognito chat');
      }

      // Stash which medication this chat is about so the chat sidebar can
      // render the right card. Set AFTER the session is created so the
      // persistence write inside the setter finds an active session blob.
      setSelectedMedicationId(medication.id);

      router.push('/prescription-refill/chat');
    } catch (error) {
      logger.error('Failed to continue prescription refill to chat', serializeError(error));
      setContinueError('We could not start a private chat. Please try again.');
      setContinueBusy(false);
    }
  }

  // Prefer a curated product shot; otherwise fall back to the generic
  // dose-form packaging render so every medication gets a hero visual.
  const heroImage = medication.image ?? medication.packagingImage;
  const [heroLoaded, setHeroLoaded] = useState(false);
  useEffect(() => {
    setHeroLoaded(false);
  }, [medication.id]);

  const badgeRef = useRef<HTMLDivElement>(null);
  const [badgeSize, setBadgeSize] = useState<{ w: number; h: number } | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  useEffect(() => {
    const el = badgeRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.borderBoxSize?.[0];
      const w = box ? Math.round(box.inlineSize) : Math.round(el.getBoundingClientRect().width);
      const h = box ? Math.round(box.blockSize) : Math.round(el.getBoundingClientRect().height);
      if (w > 0 && h > 0) setBadgeSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!badgeSize) return;
    setMapUrl(buildLensMap(badgeSize.w, badgeSize.h, lens.radius, lens.bezel));
  }, [badgeSize, lens.radius, lens.bezel]);

  return (
    <div>
      <DoseSpotStyles />
      {heroImage && (
        <DoseSpotFilters
          mapUrl={mapUrl}
          width={badgeSize?.w ?? 0}
          height={badgeSize?.h ?? 0}
          scale={lens.scale}
          blurStd={lens.blurStd}
        />
      )}

      <header className="dosespot-page-heading">
        <h1 className="dosespot-page-title">Retrieve prescription</h1>
        <p className="dosespot-page-subtitle">
          We&apos;ll look for your active {medication.name} prescription.
        </p>
      </header>

      <div className={`dosespot-layout${heroImage ? '' : ' dosespot-layout--solo'}`}>
        {heroImage && (
          <aside className="dosespot-hero">
            <div className="dosespot-hero-frame">
              {!heroLoaded && (
                <CircleNotch
                  className="dosespot-hero-spinner dosespot-spinner"
                  size={36}
                  color={COLORS.textOnBg}
                  weight="bold"
                />
              )}
              <Image
                src={heroImage}
                alt={medication.name}
                className="dosespot-hero-image"
                sizes="(max-width: 720px) 220px, 440px"
                onLoad={() => setHeroLoaded(true)}
                style={{
                  ...(medication.id === 'metformin'
                    ? ({ '--med-rotation': '-4deg' } as React.CSSProperties)
                    : {}),
                  opacity: heroLoaded ? 1 : 0,
                  transition: 'opacity 320ms ease',
                }}
              />
              <div
                ref={badgeRef}
                className="dosespot-rx-badge"
                style={{ width: lens.width, height: lens.height, borderRadius: lens.borderRadius }}
              >
                <h2 className="dosespot-rx-name">{medication.name}</h2>
                {status === 'retrieved' && (
                  <p className="dosespot-rx-dose">{medication.prescription?.dose}</p>
                )}
              </div>
            </div>
          </aside>
        )}

        <section className="dosespot-panel">
          {status === 'ready' && (
            <ReadyCard medication={medication} onRequest={requestPrescription} />
          )}

          {status === 'requesting' && (
            <RequestingCard medication={medication} activeStep={activeStep} />
          )}

          {status === 'retrieved' && (
            <RetrievedCard
              medication={medication}
              busy={continueBusy}
              error={continueError}
              onContinue={continueToChat}
            />
          )}

          <p className="dosespot-mock-disclaimer">
            Note: prescription lookup is mocked in this sandbox. This is a
            placeholder, not a real prescription fetch.
          </p>
        </section>
      </div>

    </div>
  );
}

function MedicationChip({ medication }: { medication: Medication }) {
  return (
    <div className="dosespot-med-chip">
      <span className="dosespot-med-chip-name">{medication.name}</span>
    </div>
  );
}

function ReadyCard({
  medication,
  onRequest,
}: {
  medication: Medication;
  onRequest: () => void;
}) {
  return (
    <>
      <div className="dosespot-popup">
        <div>
          <p className="dosespot-eyebrow">DoseSpot</p>
          <h2 className="dosespot-title">Ready to request</h2>
        </div>

        {!medication.image && <MedicationChip medication={medication} />}

        <div className="dosespot-note">
          We&apos;ll pull the latest prescription details from your provider.
        </div>
      </div>

      <PrimaryButton onClick={onRequest}>Request prescription</PrimaryButton>
    </>
  );
}

function RequestingCard({
  medication,
  activeStep,
}: {
  medication: Medication;
  activeStep: number;
}) {
  return (
    <div className="dosespot-popup">
      <div className="dosespot-loading-head">
        <CircleNotch
          className="dosespot-spinner"
          size={30}
          color={COLORS.textOnSurface}
          weight="bold"
        />
        <div>
          <p className="dosespot-eyebrow">Requesting DoseSpot</p>
          <h2 className="dosespot-title">Pulling prescription</h2>
        </div>
      </div>

      {!medication.image && (
        <div className="dosespot-loading-med">
          <MedicationChip medication={medication} />
        </div>
      )}

      <div className="dosespot-steps">
        {RETRIEVAL_STEPS.map((step, index) => {
          const isDone = index < activeStep;
          const isActive = index === activeStep;

          return (
            <div
              key={step}
              className={[
                'dosespot-step',
                isActive ? 'is-active' : '',
                isDone ? 'is-done' : '',
              ].join(' ')}
            >
              <span className="dosespot-step-dot">
                {isDone ? <CheckCircle size={16} weight="fill" /> : null}
              </span>
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RetrievedCard({
  medication,
  busy,
  error,
  onContinue,
}: {
  medication: Medication;
  busy: boolean;
  error: string | null;
  onContinue: () => void;
}) {
  const rx = medication.prescription ?? DEFAULT_PRESCRIPTION;

  return (
    <>
      <div className="dosespot-popup">
        <p className="dosespot-eyebrow">Prescription</p>
        <h2 className="dosespot-title">{medication.name}</h2>
        <p className="dosespot-subtitle">{rx.dose}</p>

        <div className="dosespot-rx-row dosespot-rx-row--single">
          <RxCell label="Sig" value={rx.sig} />
        </div>

        <div className="dosespot-rx-row">
          <RxCell label="Dispense" value={rx.dispense} />
          <RxCell label="Refills" value={rx.refills} />
        </div>

        <div className="dosespot-rx-row">
          <RxCell label="Written" value={prescribedDate(rx.prescribedDaysAgo)} />
          <RxCell
            label="Prescriber"
            value={rx.prescriber}
            footnote={rx.credential}
          />
        </div>
      </div>
      {error && <div className="dosespot-error">{error}</div>}
      <PrimaryButton onClick={onContinue} disabled={busy}>
        {busy ? 'Starting private chat...' : 'Continue'}
      </PrimaryButton>
    </>
  );
}

function RxCell({
  label,
  value,
  footnote,
}: {
  label: string;
  value: string;
  footnote?: string;
}) {
  return (
    <div className="dosespot-rx-cell">
      <span className="dosespot-rx-label">{label}</span>
      <span className="dosespot-rx-value">{value}</span>
      {footnote && <span className="dosespot-rx-footnote">{footnote}</span>}
    </div>
  );
}

function DoseSpotFilters({
  mapUrl,
  width,
  height,
  scale,
  blurStd,
}: {
  mapUrl: string | null;
  width: number;
  height: number;
  scale: number;
  blurStd: number;
}) {
  return (
    <svg
      aria-hidden
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <filter
        id="dosespot-liquid-glass"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
        colorInterpolationFilters="sRGB"
      >
        {mapUrl && width > 0 && height > 0 && (
          <feImage
            href={mapUrl}
            x={0}
            y={0}
            width={width}
            height={height}
            result="map"
            preserveAspectRatio="none"
          />
        )}
        <feGaussianBlur
          in="SourceGraphic"
          stdDeviation={blurStd}
          result="blurred"
        />
        <feDisplacementMap
          in="blurred"
          in2="map"
          scale={scale}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

function DoseSpotStyles() {
  return (
    <style jsx global>{`
      .dosespot-page-heading {
        margin: 0 0 32px;
        text-align: center;
      }

      .dosespot-page-title {
        margin: 0;
        color: ${COLORS.textOnBg};
        font-size: 30px;
        font-weight: 500;
        line-height: 36px;
        letter-spacing: -1.3px;
      }

      .dosespot-page-subtitle {
        margin: 8px 0 0;
        color: ${COLORS.textOnBg};
        font-size: 16px;
        font-weight: 400;
        line-height: 23px;
        letter-spacing: -0.2px;
      }

      .dosespot-layout {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        gap: 40px;
        align-items: center;
      }

      .dosespot-layout--solo {
        grid-template-columns: minmax(0, 480px);
        justify-content: center;
      }

      .dosespot-hero {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .dosespot-hero-frame {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 440px;
      }

      .dosespot-hero-image {
        width: 440px;
        height: 440px;
        object-fit: contain;
        filter:
          drop-shadow(0 30px 36px rgba(13, 39, 64, 0.34))
          drop-shadow(0 6px 12px rgba(13, 39, 64, 0.18));
        animation: dosespotFloat 6s ease-in-out infinite;
        z-index: 1;
      }

      .dosespot-hero-spinner {
        position: absolute;
        inset: 0;
        margin: auto;
        opacity: 0.65;
        z-index: 1;
      }

      .dosespot-rx-badge {
        position: absolute;
        bottom: 16%;
        right: 0%;
        width: 183px;
        height: 68px;
        z-index: 2;
        border-radius: 34px;
        padding: 14px 20px;
        background: rgba(255, 255, 255, 0.13);
        -webkit-backdrop-filter: blur(14px);
        backdrop-filter: url(#dosespot-liquid-glass);
        box-shadow:
          rgba(13, 39, 64, 0.1) 0px 1.2px 30px 0px,
          inset 3px 3px 2px -3px rgba(255, 255, 255, 0.8),
          inset -3px -3px 2px -3px rgba(255, 255, 255, 0.8),
          inset 2px 2px 0.5px -2px rgba(38, 38, 38, 0.06),
          inset -2px -2px 0.5px -2px rgba(38, 38, 38, 0.06),
          inset 0 0 0 1px rgba(255, 255, 255, 0.12),
          inset 0 0 12px 1px rgba(212, 212, 212, 0.08);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: ${COLORS.textOnBg};
      }

      .dosespot-rx-name {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        line-height: 24px;
        letter-spacing: -0.3px;
        white-space: nowrap;
      }

      .dosespot-rx-dose {
        margin: 4px 0 0;
        font-size: 13px;
        font-weight: 400;
        line-height: 18px;
        opacity: 0.88;
        white-space: nowrap;
      }

      .dosespot-popup {
        width: 100%;
        border-radius: 22px;
        background: ${COLORS.surface};
        box-shadow:
          0 24px 56px rgba(13, 39, 64, 0.14),
          0 6px 14px rgba(13, 39, 64, 0.08),
          0 0 0 1px rgba(13, 39, 64, 0.05);
        padding: 28px;
        color: ${COLORS.textOnSurface};
        animation: dosespotRise 420ms ease both;
      }

      .dosespot-eyebrow {
        margin: 0 0 4px;
        color: rgba(4, 5, 5, 0.48);
        font-size: 13px;
        font-weight: 600;
        line-height: 18px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .dosespot-title {
        margin: 0;
        color: ${COLORS.textOnSurface};
        font-size: 26px;
        font-weight: 600;
        line-height: 32px;
        letter-spacing: -0.5px;
      }

      .dosespot-subtitle {
        margin: 6px 0 0;
        color: rgba(4, 5, 5, 0.58);
        font-size: 16px;
        line-height: 23px;
      }

      .dosespot-note {
        margin-top: 24px;
        border-radius: 18px;
        background: ${COLORS.surfaceMuted};
        padding: 14px 16px;
        color: rgba(4, 5, 5, 0.68);
        font-size: 15px;
        line-height: 22px;
      }

      .dosespot-med-chip {
        margin-top: 18px;
        display: inline-flex;
        padding: 8px 14px;
        border-radius: 999px;
        background: ${COLORS.surfaceMuted};
        color: ${COLORS.textOnSurface};
      }

      .dosespot-med-chip-name {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: -0.1px;
      }

      .dosespot-loading-med {
        margin-top: 20px;
      }

      .dosespot-error {
        margin-top: 16px;
        border-radius: 12px;
        background: ${COLORS.surfaceMuted};
        padding: 12px 14px;
        color: ${COLORS.textOnSurface};
        font-size: 14px;
        line-height: 20px;
      }

      .dosespot-mock-disclaimer {
        margin: 16px 0 0;
        color: rgba(4, 5, 5, 0.52);
        font-size: 14px;
        font-style: italic;
        line-height: 20px;
        text-align: center;
      }

      .dosespot-loading-head {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .dosespot-spinner {
        animation: dosespotSpin 900ms linear infinite;
        flex-shrink: 0;
      }

      .dosespot-steps {
        display: grid;
        gap: 12px;
        margin-top: 28px;
      }

      .dosespot-step {
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(4, 5, 5, 0.42);
        font-size: 15px;
        line-height: 22px;
        transition: color 240ms ease, transform 240ms ease;
      }

      .dosespot-step.is-active {
        color: ${COLORS.textOnSurface};
        transform: translateX(2px);
      }

      .dosespot-step.is-done {
        color: rgba(4, 5, 5, 0.68);
      }

      .dosespot-step-dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.48);
        background: rgba(255, 255, 255, 0.24);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: #206e55;
        box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.52);
      }

      .dosespot-step.is-active .dosespot-step-dot {
        border-color: rgba(255, 255, 255, 0.8);
        box-shadow:
          0 0 0 5px rgba(255, 255, 255, 0.16),
          inset 1px 1px 0 rgba(255, 255, 255, 0.7);
      }

      .dosespot-rx-row {
        display: flex;
        gap: 24px;
        padding: 14px 0;
        border-top: 1px solid rgba(4, 5, 5, 0.08);
      }

      .dosespot-rx-row:first-of-type {
        margin-top: 22px;
      }

      .dosespot-rx-row--single .dosespot-rx-cell {
        flex: 1;
      }

      .dosespot-rx-cell {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .dosespot-rx-label {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(4, 5, 5, 0.46);
      }

      .dosespot-rx-value {
        font-size: 15px;
        line-height: 22px;
        color: ${COLORS.textOnSurface};
      }

      .dosespot-rx-footnote {
        font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
        font-size: 11px;
        letter-spacing: 0.04em;
        color: rgba(4, 5, 5, 0.42);
        margin-top: 2px;
      }

      @keyframes dosespotRise {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes dosespotSpin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes dosespotFloat {
        0%,
        100% {
          transform: translateY(0) rotate(var(--med-rotation, 0deg));
        }
        50% {
          transform: translateY(-8px) rotate(var(--med-rotation, 0deg));
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .dosespot-hero-image {
          animation: none;
        }
      }

      @media (max-width: 720px) {
        .dosespot-layout {
          grid-template-columns: 1fr;
          gap: 28px;
        }

        .dosespot-hero-frame {
          min-height: 260px;
        }

        .dosespot-hero-image {
          width: 220px;
          height: 220px;
        }

        .dosespot-rx-badge {
          width: 160px;
          height: 60px;
          padding: 10px 14px;
          border-radius: 30px;
        }

        .dosespot-rx-name {
          font-size: 17px;
          line-height: 21px;
        }

        .dosespot-rx-dose {
          font-size: 12px;
          line-height: 16px;
        }
      }

      @media (max-width: 520px) {
        .dosespot-popup {
          border-radius: 20px;
          padding: 24px;
        }

        .dosespot-title {
          font-size: 24px;
          line-height: 30px;
        }

        .dosespot-rx-row {
          flex-direction: column;
          gap: 14px;
        }
      }
    `}</style>
  );
}
