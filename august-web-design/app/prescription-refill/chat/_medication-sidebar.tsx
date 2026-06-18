'use client';

import { useEffect, useRef, useState } from 'react';
import { useIncognitoStore } from '@/stores/incognito-store';
import { useChatStore } from '@/stores/chat-store';
import { MEDICATIONS } from '../_medications';
import { getMedicationMeta } from '../_medication-meta';
import { readPatientInfo, type PatientInfo } from '../_patient-info';
import {
  RefillSidebar,
  type SidebarPrescription,
} from './_refill-sidebar';
import { ApprovedSidebar } from './_approved-sidebar';

/*
 * Chat-page right rail. Wraps RefillSidebar with the data wiring and the
 * size-aware behaviour the chat needs:
 *
 *   - read selectedMedicationId from the incognito store
 *   - resolve the catalog entry + drug-intrinsic meta + tablet image
 *   - hydrate patient demographics from localStorage
 *   - dynamically size the glassy card to fit the viewport (squeeze
 *     down to a min, then hide entirely when there isn't even room
 *     for the squeezed minimum). The rail never scrolls.
 *
 * Renders nothing if no medication has been picked.
 */

const PATIENT_FALLBACK: PatientInfo = {
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
};

// Mirrors DEFAULT_PRESCRIPTION in _dosespot-retrieval.tsx so the sidebar
// has something coherent to render even if a featured medication
// catalog entry happens to be missing its prescription block.
const PRESCRIPTION_FALLBACK: SidebarPrescription = {
  sig: 'Take as directed by your provider.',
  dispense: '30-day supply',
  refills: '0 remaining',
  prescribedDaysAgo: 27,
  prescriber: 'Dr. John Doe',
  credential: 'NPI 1487201930',
};

// v0-tuned defaults. `height` is the *max* the glow card can take —
// it's clamped further down below 420 (RefillSidebar's own hard cap)
// and squeezed dynamically based on the viewport.
const GLASS = {
  width: 364,
  height: 363,
  radius: 59,
  bezel: 4,
  scale: 83,
  blur: 18.5,
  grey: 231,
  alpha: 0.23,
  profile: 'sphere',
} as const;

const RX = {
  size: 53,
  bezel: 4,
  scale: 83,
  blur: 16,
  grey: 255,
  alpha: 0.13,
  profile: 'sphere',
} as const;

// Fallback height for the non-glow stack until the ResizeObserver
// reports the real measurement on first paint.
const NON_GLOW_STACK_INITIAL_PX = 400;
// Vertical chrome on the sidebar column: padding-top 6 + padding-bottom 6.
// Must stay in sync with the column's CSS in chat/page.tsx.
const COLUMN_CHROME_PX = 12;
// Gap between glow card and the non-glow stack (matches the flex `gap: 16`).
const STACK_GAP_PX = 16;
// Glow card has its own hard cap inside RefillSidebar (420). Use the
// same here so we don't pass anything above that.
const GLOW_MAX_PX = 420;
// Below this size the glow card is too cramped to read — hide it
// outright and let the patient + prescription cards take the column.
const GLOW_MIN_PX = 180;
// Two-stage hide for the tablet hero. As the rail shrinks we first
// drop the Rx disc (at 320), then the tablet image + floor shadow
// together (at 300). Below 300 the glow card switches to compact
// (chip + name + dose + mechanism only). Driven off the *measured*
// stack so the breakpoints track real layout, not a hardcoded
// viewport size.
//
//   showRx      if  availableForGlow >= RX_REQUIRES_GLOW_PX
//   showTablet  if  availableForGlow >= TABLET_REQUIRES_GLOW_PX
const RX_REQUIRES_GLOW_PX = 320;
const TABLET_REQUIRES_GLOW_PX = 300;
// Fixed height for the glow card in compact mode (no tablet hero).
// Sized to give the chip + name + dose stack real top/bottom breathing
// room after the outer padding (52/48 in `_refill-sidebar.tsx`) — at
// 200px the padding was bigger than the room left for content, so the
// chip wrapped right up against the name.
const GLOW_COMPACT_PX = 320;

export function MedicationSidebar() {
  const selectedMedicationId = useIncognitoStore(
    (s) => s.selectedMedicationId,
  );
  const specialEvent = useChatStore((s) => s.specialEvent);
  const approvedSoapNote = useChatStore((s) => s.approvedSoapNote);
  const approvedConversation = useChatStore((s) => s.approvedConversation);
  const approvedText = useChatStore((s) => s.approvedText);
  const finalizeRefillDecision = useChatStore(
    (s) => s.finalizeRefillDecision,
  );
  const postRefillDecisionMessage = useChatStore(
    (s) => s.postRefillDecisionMessage,
  );
  const clearRefillApproval = useChatStore((s) => s.clearRefillApproval);

  // Patient demographics live in localStorage. Read after mount so the
  // server render doesn't try to touch `window`.
  const [patient, setPatient] = useState<PatientInfo>(PATIENT_FALLBACK);
  useEffect(() => {
    setPatient(readPatientInfo());
  }, []);

  // Track viewport height so we can squeeze (or hide) the glow card
  // when the rail isn't tall enough. SSR-safe initial value; the real
  // value lands on the first mount tick.
  const [viewportHeight, setViewportHeight] = useState(900);
  useEffect(() => {
    const sync = () => setViewportHeight(window.innerHeight);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  // Measure the actual height of the non-glow stack (patient +
  // prescription cards) so we can squeeze the glow card against the
  // *real* remaining space, not an estimate. RefillSidebar wraps that
  // pair with a ref we attach below.
  const nonGlowStackRef = useRef<HTMLDivElement>(null);
  const [stackHeight, setStackHeight] = useState(NON_GLOW_STACK_INITIAL_PX);
  useEffect(() => {
    const el = nonGlowStackRef.current;
    if (!el) return;
    const update = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setStackHeight(Math.round(h));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // When the backend marks the refill as approved, swap the entire rail
  // for the green Approve / Reject card. This sits *above* the medication
  // null check so it still renders if a medication catalog entry is
  // missing — the approval state stands on its own.
  const medication = selectedMedicationId
    ? MEDICATIONS.find((m) => m.id === selectedMedicationId) ?? null
    : null;

  if (specialEvent === 'prescription_refill_approved') {
    // eslint-disable-next-line no-console
    console.log('[MedicationSidebar] rendering ApprovedSidebar', {
      hasSoapNote: Boolean(approvedSoapNote),
      hasConversation: Boolean(approvedConversation),
    });
    const baseName = medication?.name ?? 'your medication';
    // Catalog stores dose as "<strength> <form>" (e.g., "50 mg tablet").
    // Strip the trailing form so the recommendation reads "Losartan
    // 50 mg" rather than the redundant "Losartan 50 mg tablet".
    const rawDose = medication?.prescription?.dose?.trim();
    const form = medication?.doseForm?.trim();
    const doseStrength = rawDose
      ? form
        ? rawDose.replace(new RegExp(`\\s*${form}s?\\s*$`, 'i'), '').trim()
        : rawDose
      : '';
    const drugName = doseStrength ? `${baseName} ${doseStrength}` : baseName;
    // Backend ships the patient-facing approval copy alongside the
    // refill_approved event as `messageText` (stored as approvedText).
    // When present, use it verbatim so clinical/wording changes don't
    // require a client deploy; fall back to a generic template when
    // the field is missing.
    const approvalMessage =
      approvedText?.trim() ||
      `Good news — your refill request for ${drugName} has been approved. We've sent it to your pharmacy and they'll reach out once it's ready for pickup.`;
    return (
      <ApprovedSidebar
        soapNote={approvedSoapNote}
        conversation={approvedConversation}
        drugName={drugName}
        onApprove={() => {
          // Show the bot reply *first* (and lock the chat) — the
          // sidebar then plays its exit animation and finally invokes
          // onDismiss below to tear down the approval state.
          postRefillDecisionMessage(approvalMessage);
        }}
        onDismiss={() => {
          clearRefillApproval();
        }}
        onReject={() => {
          finalizeRefillDecision(
            `The clinician has reviewed this conversation and thinks it's better to have an in-person visit before refilling ${drugName}. If you're experiencing new or worsening symptoms, please reach out to your primary care doctor immediately.`,
          );
        }}
      />
    );
  }
  // Meta is purely decorative (mechanism blurb + tablet PNG + curated
  // drugClass copy). When a medication isn't in MEDICATION_META we fall
  // back to whatever the catalog entry provides — the sidebar still
  // renders, just without the hero image and mechanism description.
  const meta = getMedicationMeta(selectedMedicationId);

  if (!medication) return null;

  const prescription = medication.prescription ?? PRESCRIPTION_FALLBACK;
  const drugClass = meta?.drugClass ?? medication.drugClass ?? 'Medication';
  const mechanism = meta?.mechanism;
  // Hero render is resolved by id in the catalog (own tablet → generic
  // tablet for oral solids → packaging container for liquids/sprays/patches).
  const tabletImage = medication.tabletImage;

  // Three-state sizing for the glow card, driven entirely off the
  // *measured* non-glow stack height:
  //   1. available >= TABLET_REQUIRES_GLOW_PX: full glow card with the
  //      tablet hero visible; height squeezes between GLOW_MIN and
  //      GLOW_MAX (clamped to available).
  //   2. GLOW_COMPACT_PX <= available < TABLET_REQUIRES_GLOW_PX: tablet
  //      hero hidden, glow card renders compact (chip + name + dose +
  //      mechanism) at a fixed GLOW_COMPACT_PX height.
  //   3. available < GLOW_COMPACT_PX: glow card hidden entirely.
  const availableForGlow =
    viewportHeight - COLUMN_CHROME_PX - stackHeight - STACK_GAP_PX;

  // No tablet PNG for this medication → force compact mode regardless of
  // available space. Without this we'd reserve hero room for an image
  // that won't render, leaving a big empty gap inside the glow card.
  const hasTabletImage = Boolean(tabletImage);
  const showTablet =
    hasTabletImage && availableForGlow >= TABLET_REQUIRES_GLOW_PX;
  const showRx = showTablet && availableForGlow >= RX_REQUIRES_GLOW_PX;
  const showGlowCard =
    availableForGlow >= (showTablet ? GLOW_MIN_PX : GLOW_COMPACT_PX);

  const glowHeight = showTablet
    ? Math.max(GLOW_MIN_PX, Math.min(GLOW_MAX_PX, availableForGlow))
    : GLOW_COMPACT_PX;

  return (
    <aside
      style={{
        // Normal-flow element inside the sidebar column. The column owns
        // the padding and vertical centering; this aside just needs to
        // match the card width.
        width: GLASS.width,
        fontFamily:
          '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <RefillSidebar
        medication={{
          drugClass,
          name: medication.name,
          dose: medication.prescription?.dose,
          mechanism,
          tabletImage,
        }}
        patient={patient}
        prescription={prescription}
        glass={{ ...GLASS, height: glowHeight }}
        rx={RX}
        showGlowCard={showGlowCard}
        showTablet={showTablet}
        showRx={showRx}
        nonGlowStackRef={nonGlowStackRef}
      />
    </aside>
  );
}
