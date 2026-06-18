'use client';

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';

/*
 * RefillSidebar — three stacked cards meant for the prescription-refill
 * chat's left rail:
 *
 *   1. GlowCard         — glass tile with drug class, tablet + Rx,
 *                         medication name, dose, mechanism. The branded
 *                         centerpiece of the rail.
 *   2. UserInfoCard     — flat white card with the patient's name +
 *                         age + gender, sourced from the demographics
 *                         the user filled on the refill-details step.
 *   3. PrescriptionCard — flat white card with sig, dispense, refills,
 *                         written-on date, prescriber + credential.
 *
 * The component owns layout only. Data and glass tuning come in as props,
 * which keeps it framework-agnostic.
 */

export type SidebarMedication = {
  drugClass: string;
  name: string;
  dose?: string;
  // Optional: the mechanism blurb is hand-curated drug knowledge — when
  // a medication isn't in MEDICATION_META we still want to render the
  // card with just chip + name + dose.
  mechanism?: string;
  // Optional: when omitted, the GlowCard skips the tablet hero (and the
  // Rx disc, which only makes sense anchored to the tablet) and renders
  // in compact mode — same layout the rail uses on short viewports.
  tabletImage?: StaticImageData;
};

export type SidebarPatient = {
  firstName: string;
  lastName: string;
  age: string | number;
  gender: string;
};

export type SidebarPrescription = {
  sig: string;
  dispense: string;
  refills: string;
  prescribedDaysAgo: number;
  prescriber: string;
  credential: string;
};

export type GlassProps = {
  width: number;
  height: number;
  radius: number;
  bezel: number;
  scale: number;
  blur: number;
  grey: number;
  alpha: number;
  profile: 'squircle' | 'sphere';
};

export type RxProps = {
  size: number;
  bezel: number;
  scale: number;
  blur: number;
  grey: number;
  alpha: number;
  profile: 'squircle' | 'sphere';
};

const PRESCRIBED_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const GLASS_PROFILES = {
  squircle: (t: number) => Math.pow(1 - Math.pow(1 - t, 4), 0.25),
  sphere: (t: number) => Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2))),
} as const;

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
  profile: (t: number) => number,
): string {
  if (typeof document === 'undefined') return '';

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

function prescribedDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return PRESCRIBED_DATE_FORMAT.format(date);
}

export function RefillSidebar({
  medication,
  patient,
  prescription,
  glass,
  rx,
  showGlowCard = true,
  showTablet = true,
  showRx = true,
  nonGlowStackRef,
}: {
  medication: SidebarMedication;
  patient: SidebarPatient;
  prescription: SidebarPrescription;
  glass: GlassProps;
  rx: RxProps;
  /** Pull the glassy card out of the stack when the rail can't fit it.
   *  Callers (chat sidebar) flip this when the viewport is too short
   *  to render anything meaningful. */
  showGlowCard?: boolean;
  /** Hide the tablet image + floor shadow and drop the glow card
   *  into a compact layout. Chat flips this when the rail is too
   *  short for the full card but still tall enough to show the
   *  chip + name + dose + mechanism. */
  showTablet?: boolean;
  /** Hide just the Rx disc while keeping the tablet + shadow.
   *  Chat flips this off slightly before the tablet itself hides,
   *  to claw back a bit more room. Default true. */
  showRx?: boolean;
  /** Optional ref attached to the wrapper around the patient +
   *  prescription cards. Callers use this to measure the actual stack
   *  height with a ResizeObserver and squeeze the glow card to fit. */
  nonGlowStackRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      style={{
        width: glass.width,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        fontFamily:
          '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {showGlowCard && (
        <GlowCard
          medication={medication}
          glass={glass}
          rx={rx}
          showTablet={showTablet}
          showRx={showRx}
        />
      )}
      <div
        ref={nonGlowStackRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          // Pin the stack at its natural height. Without this, the
          // column's outer flex layout (which has a fixed height when
          // the chat sidebar wraps us) would default-shrink this
          // wrapper, and the ResizeObserver above would measure the
          // shrunk size — leading the caller's squeeze math to
          // under-shrink the glow card. We want the stack untouched and
          // the glow to absorb all the shrinkage.
          flexShrink: 0,
        }}
      >
        <UserInfoCard patient={patient} />
        <PrescriptionCard
          prescription={prescription}
          // When the glow card has been hidden entirely, surface the
          // medication name + dose here so the user still knows what
          // the prescription is for. When the glow is visible (full
          // or compact), it already carries that info.
          medication={showGlowCard ? undefined : medication}
        />
      </div>
    </div>
  );
}

/* ---------- Glow card ---------- */

function GlassSurface({
  width,
  height,
  radius,
  bezel,
  scale,
  blur,
  profile,
  children,
  style,
}: {
  width: number;
  height: number;
  radius: number;
  bezel: number;
  scale: number;
  blur: number;
  profile: 'squircle' | 'sphere';
  children: ReactNode;
  style?: CSSProperties;
}) {
  const filterId = useId();
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const safeRadius = useMemo(
    () => Math.min(radius, Math.floor(Math.min(width, height) / 2)),
    [height, radius, width],
  );
  const safeBezel = useMemo(
    () => Math.min(bezel, Math.floor(Math.min(width, height) / 2)),
    [bezel, height, width],
  );

  useEffect(() => {
    setMapUrl(
      buildLensMap(
        width,
        height,
        safeRadius,
        safeBezel,
        GLASS_PROFILES[profile],
      ),
    );
  }, [height, profile, safeBezel, safeRadius, width]);

  const sanitizedId = `refill-sidebar-glass-${filterId.replace(/[^\w-]/g, '')}`;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: safeRadius,
        background: 'rgba(255, 255, 255, 0.13)',
        WebkitBackdropFilter: `blur(${blur}px)`,
        backdropFilter: `url(#${sanitizedId})`,
        ...style,
      }}
    >
      <svg
        aria-hidden
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <filter
          id={sanitizedId}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          {mapUrl && (
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
            stdDeviation={blur}
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
      {children}
    </div>
  );
}

// Reference size for the tablet wrapper. rx.size from the slider is the
// "Rx size at this reference"; we scale linearly from there.
const TABLET_REFERENCE_PX = 200;

// Hard cap on the glow card's rendered height. Heights from the caller
// that exceed this are clamped — the playground slider is also capped at
// the same value, but the cap belongs on the component so anything
// passing a larger height (chat sidebar, future callers) still renders
// the same shape.
const CARD_MAX_HEIGHT_PX = 420;

// Threshold past which the tablet's cap starts growing 1-for-1 with the
// card's height (up to CARD_MAX_HEIGHT_PX).
const TABLET_GROWTH_THRESHOLD_PX = 380;

// Threshold below which the Rx disc starts shrinking linearly with card
// height. At or above this value the disc stays at the slider's size.
const RX_SHRINK_THRESHOLD_PX = 335;

function GlowCard({
  medication,
  glass,
  rx,
  showTablet = true,
  showRx = true,
}: {
  medication: SidebarMedication;
  glass: GlassProps;
  rx: RxProps;
  /** When false, the tablet image + floor shadow are hidden and the
   *  glow card renders compact with just chip + name + dose +
   *  mechanism. The chat sidebar flips this to save vertical room on
   *  short viewports. */
  showTablet?: boolean;
  /** When false, hide just the Rx disc but keep the tablet + shadow.
   *  Independent from showTablet so chat can drop the Rx slightly
   *  before the tablet itself hides. */
  showRx?: boolean;
}) {
  const surface = `rgba(${glass.grey}, ${glass.grey + 2}, ${glass.grey + 6}, ${glass.alpha})`;
  const rxBg = `rgba(${rx.grey}, ${rx.grey + 4}, ${rx.grey + 8}, ${rx.alpha})`;

  // No tablet PNG → skip the hero entirely (and the Rx disc, which is
  // anchored to the tablet wrapper). The caller's showTablet/showRx
  // flags are honored on top of this, not the other way around.
  const hasTabletImage = Boolean(medication.tabletImage);
  const renderTablet = showTablet && hasTabletImage;
  const renderRx = renderTablet && showRx;
  const compactMode = !renderTablet;

  // Clamp the requested height to the component's hard cap. The
  // displacement map and inset content both flow from this clamped
  // value so the card always renders at most CARD_MAX_HEIGHT_PX tall.
  const cardHeight = Math.min(CARD_MAX_HEIGHT_PX, glass.height);

  // Rx scaling is now driven by card height (not the measured tablet
  // width) so the disc stays at the slider's value as long as the card
  // is at least RX_SHRINK_THRESHOLD_PX tall — and only starts shrinking
  // 1-for-1 with the remaining height below that threshold. The
  // measured tabletPx still informs the rest of the layout but no
  // longer feeds Rx size.
  const rxScaleFactor =
    cardHeight >= RX_SHRINK_THRESHOLD_PX
      ? 1
      : cardHeight / RX_SHRINK_THRESHOLD_PX;
  const effectiveRxSize = Math.max(16, Math.round(rx.size * rxScaleFactor));

  // Once the card grows past TABLET_GROWTH_THRESHOLD_PX, the tablet's
  // hard cap rises 1-for-1 with card height. Below the threshold the
  // cap stays at TABLET_REFERENCE_PX so the tablet looks identical to
  // the default shipping state.
  const tabletCap =
    TABLET_REFERENCE_PX +
    Math.max(0, cardHeight - TABLET_GROWTH_THRESHOLD_PX);

  return (
    <GlassSurface
      width={glass.width}
      height={cardHeight}
      radius={glass.radius}
      bezel={glass.bezel}
      scale={glass.scale}
      blur={glass.blur}
      profile={glass.profile}
      style={{
        background: surface,
        // Inset highlights only — outer drop shadows get clipped by the
        // rail's overflow:auto and read as harsh cropped edges.
        boxShadow:
          'inset 0 0 0 1px rgba(255, 255, 255, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 0 rgba(0, 0, 0, 0.08)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: renderTablet ? '36px 28px 32px' : '0 44px',
          justifyContent: 'flex-start',
          color: '#15191d',
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            // Vertical padding bumps up when the chip wraps to two
            // lines so the rounded pill keeps comfortable breathing
            // room above and below each line of text.
            padding: '10px 16px',
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.55)',
            ...(compactMode
              ? {
                  position: 'absolute',
                  top: 32,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'max-content',
                  maxWidth: 'calc(100% - 72px)',
                }
              : {}),
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            lineHeight: 1.35,
            textTransform: 'uppercase',
            color: 'rgba(21, 25, 29, 0.78)',
            boxShadow:
              'inset 0 0 0 1px rgba(255, 255, 255, 0.7), 0 2px 6px rgba(20, 25, 30, 0.08)',
          }}
        >
          {medication.drugClass}
        </div>

        {renderTablet && medication.tabletImage && (
        <div
          style={{
            // Tablet wrapper absorbs leftover vertical space. `flex: 1`
            // gives it the slack between the chip above and the text
            // block below; `minHeight: 0` lets it shrink past content;
            // `maxWidth/maxHeight: 220` caps it at the original size so
            // it doesn't blow up on tall cards; `aspectRatio: 1 / 1`
            // keeps it square at any size.
            flex: 1,
            minHeight: 0,
            marginTop: 'clamp(10px, 4%, 26px)',
            position: 'relative',
            width: '100%',
            maxWidth: tabletCap,
            maxHeight: tabletCap,
            aspectRatio: '1 / 1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        >
          {/* Floor shadow under the tablet — needed because the bare
              tablet PNGs are transparent with no baked-in shadow. The
              shadow ellipse is narrower than the tablet so it reads as
              a contact shadow, not a blanket. */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '26%',
              right: '26%',
              bottom: '6%',
              height: '14%',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.7)',
              filter: 'blur(20px)',
            }}
          />
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image
              src={medication.tabletImage}
              alt={`${medication.name} tablet`}
              fill
              sizes="220px"
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Rx anchored near the bottom-right corner of the tablet
              wrapper. Position is in percentages so the anchor stays
              consistent at any wrapper size; the disc itself is sized
              from `effectiveRxSize`, which scales with the measured
              wrapper width so the disc shrinks together with the tablet
              instead of looking oversized on a small card. */}
          {renderRx && (
          <div style={{ position: 'absolute', right: '10%', bottom: '8%' }}>
            <GlassSurface
              width={effectiveRxSize}
              height={effectiveRxSize}
              radius={effectiveRxSize / 2}
              bezel={rx.bezel}
              scale={rx.scale}
              blur={rx.blur}
              profile={rx.profile}
              style={{
                background: rxBg,
                boxShadow:
                  '0 6px 16px rgba(20, 25, 30, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: Math.max(10, Math.round(effectiveRxSize * 0.27)),
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
                }}
              >
                Rx
              </div>
            </GlassSurface>
          </div>
          )}
        </div>
        )}

        <div
          style={{
            textAlign: 'center',
            ...(compactMode
              ? {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 'calc(100% - 88px)',
                  marginTop: 0,
                }
              : { marginTop: 12 }),
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 500,
              letterSpacing: '-0.7px',
              color: '#15191d',
              lineHeight: 1.1,
            }}
          >
            {medication.name}
          </div>
          {medication.dose && (
            <div
              style={{
                marginTop: 4,
                fontSize: 14,
                lineHeight: 1.3,
                color: 'rgba(21, 25, 29, 0.6)',
              }}
            >
              {medication.dose}
            </div>
          )}
          {medication.mechanism && (
            <div
              style={{
                marginTop: 18,
                fontSize: 13,
                lineHeight: 1.4,
                color: 'rgba(21, 25, 29, 0.85)',
                maxWidth: 240,
                margin: '18px auto 0',
              }}
            >
              {medication.mechanism}
            </div>
          )}
        </div>
      </div>
    </GlassSurface>
  );
}

/* ---------- Patient info card ---------- */

function UserInfoCard({ patient }: { patient: SidebarPatient }) {
  const fullName = [patient.firstName, patient.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <div style={flatCardStyle}>
      <Eyebrow>Patient</Eyebrow>
      <div
        style={{
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: '-0.3px',
          color: '#15191d',
          lineHeight: 1.2,
          marginTop: 4,
        }}
      >
        {fullName || '—'}
      </div>

      <DividedRow>
        <Cell label="Age" value={patient.age ? String(patient.age) : '—'} />
        <Cell label="Sex" value={patient.gender || '—'} />
      </DividedRow>
    </div>
  );
}

/* ---------- Prescription card ---------- */

function PrescriptionCard({
  prescription,
  medication,
}: {
  prescription: SidebarPrescription;
  /** When provided, the medication name and dose render under the
   *  Prescription eyebrow — same pattern as Patient → name. The chat
   *  sidebar passes this only when the glow card has been hidden, so
   *  the user can still see *what* the prescription is for. */
  medication?: Pick<SidebarMedication, 'name' | 'dose'>;
}) {
  return (
    <div style={flatCardStyle}>
      <Eyebrow>Prescription</Eyebrow>
      {medication && (
        // Name + dose sit on the same row right under the eyebrow,
        // flex-wrap so the dose drops below the name when the row
        // isn't wide enough to hold both side-by-side.
        <div
          style={{
            marginTop: 4,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            columnGap: 8,
            rowGap: 2,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: '-0.3px',
              color: '#15191d',
              lineHeight: 1.2,
            }}
          >
            {medication.name}
          </span>
          {medication.dose && (
            <span
              style={{
                fontSize: 13,
                lineHeight: 1.3,
                color: 'rgba(4, 5, 5, 0.55)',
              }}
            >
              {medication.dose}
            </span>
          )}
        </div>
      )}

      <DividedRow>
        <Cell label="Sig" value={prescription.sig} />
      </DividedRow>
      <DividedRow>
        <Cell label="Dispense" value={prescription.dispense} />
        <Cell label="Refills" value={prescription.refills} />
      </DividedRow>
      <DividedRow>
        <Cell label="Written" value={prescribedDate(prescription.prescribedDaysAgo)} />
        <Cell
          label="Prescriber"
          value={prescription.prescriber}
          footnote={prescription.credential}
        />
      </DividedRow>
    </div>
  );
}

/* ---------- Shared primitives ---------- */

const flatCardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 22,
  // 1px hairline outline only — outer drop shadows would get clipped by
  // the rail's overflow:auto and read as harsh cropped edges.
  boxShadow: '0 0 0 1px rgba(13, 39, 64, 0.06)',
  padding: '20px 22px 22px',
  color: '#040505',
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: 0,
        color: 'rgba(4, 5, 5, 0.48)',
        fontSize: 11,
        fontWeight: 700,
        lineHeight: '16px',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
      }}
    >
      {children}
    </div>
  );
}

function DividedRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        padding: '14px 0 0',
        marginTop: 14,
        borderTop: '1px solid rgba(4, 5, 5, 0.08)',
      }}
    >
      {children}
    </div>
  );
}

function Cell({
  label,
  value,
  footnote,
}: {
  label: string;
  value: string;
  footnote?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(4, 5, 5, 0.46)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          lineHeight: '20px',
          color: '#040505',
        }}
      >
        {value}
      </span>
      {footnote && (
        <span
          style={{
            fontFamily:
              'ui-monospace, "SFMono-Regular", Menlo, monospace',
            fontSize: 11,
            letterSpacing: '0.04em',
            color: 'rgba(4, 5, 5, 0.42)',
            marginTop: 2,
          }}
        >
          {footnote}
        </span>
      )}
    </div>
  );
}
