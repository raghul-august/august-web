'use client';

/**
 * PrescriptionDetails — standalone, presentational component for the
 * "Prescription details" route. Renders one card per active medication.
 *
 * Backend handoff:
 *   The current chat-log prescription payload (see PrescriptionItem in
 *   consult-chat-pane.tsx) carries title/strength/quantity/refills/etc,
 *   but does NOT yet carry:
 *     - status         ("sent_to_pharmacy" | "pending" | "filled")
 *     - therapeutic_class (e.g. "Antitussive")
 *     - last_refill_at, next_refill_at (ISO date strings)
 *   Hook up these fields once backend exposes them.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkle as SparkleIcon, Jar as JarIcon, InfoIcon } from '@phosphor-icons/react';
import { trackTelehealth } from '@/services/telehealth-analytics';

export interface PrescriptionMedication {
  id?: string;
  /** e.g. "Dextromethorphan 10 ml Syrup" */
  title: string;
  name?: string;
  /** therapeutic class label shown under the title — e.g. "Antitussive" */
  therapeutic_class?: string;
  /** dosage / sig line shown inside the warning banner */
  directions?: string;
  /** e.g. "sent_to_pharmacy" | "pending" | "filled" */
  status?: 'sent_to_pharmacy' | 'pending' | 'filled' | string;
  /** quantity + unit ("140 ml") or numeric */
  quantity?: number | string;
  dispense_unit_name?: string | null;
  /** "2 of 2" */
  refills_used?: number;
  refills_total?: number;
  /** ISO date strings */
  last_refill_at?: string | null;
  next_refill_at?: string | null;
  clinical_note?: string;
}

interface PrescriptionDetailsProps {
  medications: PrescriptionMedication[];
  onBack?: () => void;
  onAskAugust?: (medication: PrescriptionMedication) => void;
}

export function PrescriptionDetails({ medications, onBack, onAskAugust }: PrescriptionDetailsProps) {
  const activeCount = medications.length;
  const router = useRouter();

  useEffect(() => {
    trackTelehealth('prescription_details_shown');
  }, []);

  const handleAskAugust = (med: PrescriptionMedication) => {
    if (onAskAugust) {
      onAskAugust(med);
      return;
    }
    const medLabel = (med.name || med.title || '').trim();
    const msg = `Can you tell me about the dosing, missed doses, food interactions, or side effects for ${medLabel}?`;
    router.push(`/chat?msg=${encodeURIComponent(msg)}`);
  };

  return (
    <div className="prescription-details-page-wrapper">
      <style jsx global>{`
        /* Responsive View Controls */
        .desktop-only-view {
          display: block !important;
        }
        .mobile-only-view {
          display: none !important;
        }
        @media (max-width: 640px) {
          .desktop-only-view {
            display: none !important;
          }
          .mobile-only-view {
            display: block !important;
          }
        }

        /* --- DESKTOP SPECIFIC GLOBAL STYLES --- */
        .desktop-only-view .prescription-details-page {
          background: #FAF9F5;
          height: 100dvh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          position: relative;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .desktop-only-view .prescription-details-back {
          position: sticky;
          left: 24px;
          top: 24px;
          display: flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          z-index: 10;
        }
        @media (max-width: 1100px) and (min-width: 641px) {
          /* Tablet: the centered 720px shell is wide enough that its content
             scrolls under the sticky back button. Lay an opaque strip behind
             the button (a navbar substitute) so content passes beneath it
             instead of clashing. */
          .desktop-only-view .prescription-details-page::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: #FAF9F5;
            z-index: 9;
            pointer-events: none;
          }
        }
        .desktop-only-view .prescription-details-shell {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 24px 64px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .desktop-only-view .prescription-details-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .desktop-only-view .prescription-med-card {
          background: #FFFFFF;
          border: 0.5px solid #E5E2DA;
          box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.04);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .desktop-only-view .prescription-med-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 32px 20px 12px;
          gap: 8px;
        }
        .desktop-only-view .prescription-med-card__title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }
        .desktop-only-view .prescription-med-card__title-stack {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .desktop-only-view .prescription-med-card__title {
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .desktop-only-view .prescription-med-card__banner-wrap {
          padding: 0 20px;
        }
        .desktop-only-view .prescription-med-card__banner {
          display: flex;
          align-items: flex-start;
          padding: 16px;
          gap: 12px;
          background: #FAF2DE;
          border: 0.5px solid #8A621D;
          border-radius: 12px;
        }
        .desktop-only-view .prescription-med-card__details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 20px 12px;
        }
        .desktop-only-view .prescription-med-card__details-grid {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0;
        }
        .desktop-only-view .prescription-med-card__detail-cell {
          flex: 1 1 0;
          min-width: 0;
        }
        .desktop-only-view .prescription-med-card__divider {
          display: inline-block;
          width: 1px;
          height: 44px;
          background: #F3F1EB;
          flex-shrink: 0;
        }
        .desktop-only-view .prescription-med-card__clinical-wrap {
          padding: 16px 20px;
        }
        .desktop-only-view .prescription-med-card__clinical {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px 20px;
          background: #FAF9F5;
          border: 0.5px solid #E5E2DA;
          border-radius: 12px;
        }
        .desktop-only-view .prescription-med-card__ask-wrap {
          padding: 16px 20px 32px;
        }
        .desktop-only-view .prescription-med-card__ask {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          background: #FFFFFF;
          border: 0.5px solid #E5E2DA;
          border-radius: 12px;
        }
        .desktop-only-view .prescription-med-card__ask-button {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          padding: 12px 24px;
          width: 160px;
          height: 52px;
          background: #206E55;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* --- MOBILE SPECIFIC GLOBAL STYLES (Figma Redesign) --- */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        .mobile-only-view .prescription-details-page {
          background: #FAF9F5;
          height: 100dvh;
          font-family: 'Inter', sans-serif;
          color: #141515;
          width: 100%;
          box-sizing: border-box;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .mobile-only-view .details-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .mobile-only-view .back-nav {
          align-self: flex-start;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #5A554A;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-size: 15px;
          font-weight: 400;
          line-height: 24px;
        }

        .mobile-only-view .header-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mobile-only-view .header-title {
          font-size: 32px;
          font-weight: 500;
          line-height: 40px;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .mobile-only-view .header-subtitle {
          font-size: 16px;
          font-weight: 400;
          line-height: 24px;
          color: #5A554A;
          margin: 0;
        }

        .mobile-only-view .med-cards-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (max-width: 640px) {
          .mobile-only-view .prescription-details-page {
            padding: 0px;
          }

          .mobile-only-view .details-container {
            max-width: 100%;
            padding: 24px 24px 40px;
            gap: 24px;
            box-sizing: border-box;
          }

          .mobile-only-view .back-nav {
            margin-bottom: 0px;
            font-size: 13px;
            line-height: 20px;
            gap: 4px;
          }

          .mobile-only-view .header-section {
            gap: 4px;
            margin-bottom: 0px;
            margin-top: 10px;
          }

          .mobile-only-view .header-title {
            font-size: 20px;
            line-height: 24px;
            font-weight: 500;
          }

          .mobile-only-view .header-subtitle {
            font-size: 13px;
            line-height: 20px;
          }

          .mobile-only-view .med-cards-list {
            gap: 20px;
          }
        }
      `}</style>

      {/* --- DESKTOP VIEW --- */}
      <div className="desktop-only-view">
        <div
          className="prescription-details-page"
          style={{
            background: '#FAF9F5',
            height: '100dvh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            position: 'relative',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="prescription-details-back"
              style={{
                background: 'transparent',
              }}
              aria-label="Back to chat"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 6l-6 6 6 6" stroke="#5A554A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 15,
                  lineHeight: '24px',
                  color: '#5A554A',
                }}
              >
                Back to Chat
              </span>
            </button>
          )}

          <div
            className="prescription-details-shell"
            style={{
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            <div className="prescription-details-header">
              <h1
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 24,
                  lineHeight: '25px',
                  letterSpacing: '-0.4px',
                  color: '#141515',
                  margin: 0,
                }}
              >
                Prescription details
              </h1>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 15,
                  lineHeight: '24px',
                  color: '#5A554A',
                  margin: 0,
                }}
              >
                {activeCount} active medication{activeCount === 1 ? '' : 's'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {medications.map((med, i) => (
                <MedicationCardDesktop
                  key={med.id || i}
                  medication={med}
                  onAskAugust={() => handleAskAugust(med)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="mobile-only-view">
        <div className="prescription-details-page">
          <div className="details-container">
            {onBack && (
              <button className="back-nav" onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path d="M15 19l-7-7 7-7" stroke="#5A554A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Chat
              </button>
            )}

            <div className="header-section">
              <h1 className="header-title">Prescription details</h1>
              <p className="header-subtitle">{activeCount} active medication{activeCount === 1 ? '' : 's'}</p>
            </div>

            <div className="med-cards-list">
              {medications.map((med, i) => (
                <MedicationCardMobile
                  key={med.id || i}
                  medication={med}
                  onAskAugust={() => handleAskAugust(med)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   DESKTOP COMPONENTS & HELPERS (Exactly as provided in the specification)
   ========================================================================== */

function MedicationCardDesktop({
  medication,
  onAskAugust,
}: {
  medication: PrescriptionMedication;
  onAskAugust?: () => void;
}) {
  const [noteExpanded, setNoteExpanded] = useState(false);

  const qtyDisplay =
    typeof medication.quantity === 'number'
      ? `${medication.quantity}${medication.dispense_unit_name ? ` ${medication.dispense_unit_name}` : ''}`
      : medication.quantity ?? '—';

  const refillsDisplay =
    typeof medication.refills_used === 'number' && typeof medication.refills_total === 'number'
      ? `${medication.refills_used} of ${medication.refills_total}`
      : typeof medication.refills_total === 'number'
        ? `${medication.refills_total}`
        : '—';

  return (
    <article className="prescription-med-card">
      {/* Header */}
      <div className="prescription-med-card__header">
        <div className="prescription-med-card__title-wrap">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 44,
              height: 44,
              background: '#F3F1EB',
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            <MedicationIcon medication={medication} size={24} />
          </div>
          <div className="prescription-med-card__title-stack">
            <h2
              className="prescription-med-card__title"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 24,
                lineHeight: '25px',
                letterSpacing: '-0.4px',
                color: '#141515',
              }}
            >
              {medication.title}
            </h2>
            {medication.therapeutic_class && (
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  lineHeight: '20px',
                  color: '#5A554A',
                }}
              >
                {medication.therapeutic_class}
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={medication.status} />
      </div>

      {/* Dosage warning banner */}
      {medication.directions && (
        <div className="prescription-med-card__banner-wrap">
          <div className="prescription-med-card__banner">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 24,
                flexShrink: 0,
              }}
            >
              <InfoIcon size={20} color="#8A621D" />
            </span>
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 15,
                lineHeight: '24px',
                color: '#8A621D',
              }}
            >
              {medication.directions}
            </div>
          </div>
        </div>
      )}

      {/* Prescription details grid */}
      <div className="prescription-med-card__details">
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 15,
            lineHeight: '24px',
            color: '#141515',
            margin: 0,
          }}
        >
          Prescription details
        </h3>
        <div className="prescription-med-card__details-grid">
          <DetailCell label="Quantity" value={String(qtyDisplay)} />
          <DetailDivider />
          <DetailCell label="Refills" value={refillsDisplay} />
          <DetailDivider />
          <DetailCell label="Last refill" value={formatShortDate(medication.last_refill_at)} />
          <DetailDivider />
          <DetailCell label="Next refill" value={formatShortDate(medication.next_refill_at)} />
        </div>
      </div>

      {/* Ask August CTA */}
      <div className="prescription-med-card__ask-wrap">
        <div className="prescription-med-card__ask">
          <SparkleIcon size={21} color="#206E55" weight="regular" style={{ flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 15,
                lineHeight: '24px',
                color: '#141515',
              }}
            >
              Got questions about {shortName(medication.title)}?
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '20px',
                color: '#5A554A',
              }}
            >
              Ask about dosing, missed doses, food interactions, or when to stop.
            </span>
          </div>
          <button
            type="button"
            onClick={onAskAugust}
            disabled={!onAskAugust}
            className="prescription-med-card__ask-button"
            style={{
              background: '#206E55',
              cursor: onAskAugust ? 'pointer' : 'default',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 16,
                lineHeight: '20px',
                color: '#FFFFFF',
              }}
            >
              Ask August
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (status === 'sent_to_pharmacy') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          background: '#E8F2ED',
          border: '0.5px solid #206E55',
          borderRadius: 6,
          flexShrink: 0,
          height: 24,
          boxSizing: 'border-box',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6.5" stroke="#206E55" strokeWidth="1.3" />
          <path d="M5 8l2 2 4-4" stroke="#206E55" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#206E55' }}>
          Sent to Pharmacy
        </span>
      </span>
    );
  }
  if (status === 'filled') {
    return (
      <span style={badgePillStyle('#E8F2ED', '#206E55')}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#206E55' }}>
          Filled
        </span>
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span style={badgePillStyle('#FAF2DE', '#8A621D')}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#8A621D' }}>
          Pending
        </span>
      </span>
    );
  }
  return null;
}

function badgePillStyle(bg: string, border: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    background: bg,
    border: `0.5px solid ${border}`,
    borderRadius: 6,
    flexShrink: 0,
    height: 24,
    boxSizing: 'border-box',
  };
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="prescription-med-card__detail-cell" style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 13, lineHeight: '20px', color: '#7A7468' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, lineHeight: '24px', color: '#141515' }}>
        {value}
      </span>
    </div>
  );
}

function DetailDivider() {
  return <span aria-hidden className="prescription-med-card__divider" style={{ display: 'inline-block', width: 1, height: 44, background: '#F3F1EB', flexShrink: 0 }} />;
}

// Dose-form → icon mapping. Order matters: route-specific forms
// (otic/ophthalmic/inhaler/vaginal) are matched before generic
// "suspension/solution/syrup" so e.g. "Otic Suspension" picks the ear
// dropper instead of the liquid-bottle. Fallback is tablet, the most
// common oral solid in the prescribed-products catalog.
type MedicationFormIcon =
  | 'capsule'
  | 'tablet'
  | 'liquid-bottle'
  | 'inhaler'
  | 'eye-drop'
  | 'ear-dropper'
  | 'gel';

function getMedicationFormIcon(med: PrescriptionMedication): MedicationFormIcon {
  const text = `${med.title || ''} ${med.name || ''}`.toLowerCase();
  if (/\botic\b/.test(text)) return 'ear-dropper';
  if (/\bophthalmic\b|eye\s?(drop|ointment)/.test(text)) return 'eye-drop';
  if (/\binhal|\baerosol\b/.test(text)) return 'inhaler';
  if (/\bvaginal\b|\bgel\b/.test(text)) return 'gel';
  if (/\bcapsule\b/.test(text)) return 'capsule';
  if (/\btablet\b/.test(text)) return 'tablet';
  if (/\b(suspension|solution|syrup|liquid)\b|mg\/\s?(\d+\s?)?ml/.test(text))
    return 'liquid-bottle';
  return 'tablet';
}

function MedicationIcon({
  medication,
  size = 24,
}: {
  medication: PrescriptionMedication;
  size?: number;
}) {
  const kind = getMedicationFormIcon(medication);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/assets/medication-icons/${kind}.svg`}
      alt=""
      width={size}
      height={size}
      aria-hidden
      style={{ display: 'block' }}
    />
  );
}

function formatShortDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

function formatDrugTitle(title: string): string {
  if (!title) return '';
  
  let clean = title;
  // Special case for metronidazole duplicates
  if (clean.toLowerCase().includes('metronidazole')) {
    return 'Metronidazole Vaginal Gel 0.75%';
  }
  
  // 1. Clean up duplicate strength/form if present (e.g., "0.75 % 0.75 % Gel" -> "0.75% Gel")
  clean = clean.replace(/(\d+(\.\d+)?)\s*%\s*\1\s*%\s*(Gel|Syrup|Cream|Ointment|Tablet|Capsule)/gi, '$1% $3');
  
  // 2. Fix spaces around % (e.g. "0.75 %" -> "0.75%")
  clean = clean.replace(/(\d+(\.\d+)?)\s*%/g, '$1%');
  
  // 3. Normalize words
  const words = clean.split(/\s+/);
  const formattedWords = words.map(word => {
    const lower = word.toLowerCase();
    if (lower === 'ml') return 'ml';
    if (/^[a-zA-Z]+$/.test(word)) {
      if (lower === 'metronidazole') return 'Metronidazole';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word;
  });
  
  return formattedWords.join(' ');
}

function shortName(title: string): string {
  const cleanTitle = formatDrugTitle(title);
  const parts = cleanTitle.split(/\s+/);
  const drugName = parts[0];
  
  const forms = ['syrup', 'gel', 'cream', 'ointment', 'tablet', 'capsule', 'pill', 'spray', 'drop', 'drops'];
  const form = parts.find(p => forms.includes(p.toLowerCase()));
  
  if (form) {
    const capitalizedForm = form.charAt(0).toUpperCase() + form.slice(1).toLowerCase();
    return `${drugName} ${capitalizedForm}`;
  }
  
  if (parts.length <= 2) return cleanTitle;
  return [parts[0], parts[parts.length - 1]].join(' ');
}

/* ==========================================================================
   MOBILE COMPONENTS & HELPERS (Exactly as in original file)
   ========================================================================== */

function MedicationCardMobile({
  medication,
  onAskAugust,
}: {
  medication: PrescriptionMedication;
  onAskAugust?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const qty = typeof medication.quantity === 'number'
    ? `${medication.quantity} ${medication.dispense_unit_name || 'Units'}`
    : medication.quantity || '—';

  const refills = medication.refills_total !== undefined 
    ? `${medication.refills_used || 0} of ${medication.refills_total}`
    : '—';

  return (
    <div className="med-card">
      <style jsx>{`
        .med-card {
          background: #FFFFFF;
          border: 0.5px solid #E5E2DA;
          box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.04);
          border-radius: 16px;
          padding: 16px 0px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-sizing: border-box;
          width: 100%;
          position: relative;
        }

        .med-card__header {
          padding: 0px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .med-card__title-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .med-card__icon-box {
          width: 24px;
          height: 24px;
          background: #F3F1EB;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .med-card__title {
          font-size: 18px;
          font-weight: 500;
          line-height: 24px;
          color: #141515;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .med-card__dosage-banner-wrap {
          padding: 0px 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .med-card__dosage-banner {
          background: #FAF2DE;
          border: 0.5px solid #8A621D;
          border-radius: 12px;
          padding: 8px;
          display: flex;
          gap: 6px;
          align-items: flex-start;
        }

        .med-card__dosage-text {
          font-size: 13px;
          font-weight: 400;
          line-height: 20px;
          color: #8A621D;
          word-break: break-word;
        }

        .med-card__details-section {
          padding: 0px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
        }

        .med-card__details-title {
          font-size: 15px;
          font-weight: 500;
          line-height: 24px;
          color: #141515;
          margin: 0;
        }

        .med-card__details-grid {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          gap: 16px;
        }

        .med-card__detail-item {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          flex: 1;
        }

        .med-card__detail-label {
          font-size: 13px;
          font-weight: 400;
          line-height: 20px;
          color: #7A7468;
        }

        .med-card__detail-value {
          font-size: 15px;
          font-weight: 500;
          line-height: 24px;
          color: #141515;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .med-card__detail-divider {
          width: 1px;
          height: 44px;
          background: #F3F1EB;
          flex-shrink: 0;
        }

        .med-card__clinical-wrap {
          padding: 0px 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .med-card__clinical-box {
          background: #FAF9F5;
          border: 0.5px solid #E5E2DA;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        }

        .med-card__clinical-title {
          font-size: 15px;
          font-weight: 500;
          line-height: 24px;
          color: #141515;
          margin: 0;
        }

        .med-card__clinical-content {
          font-size: 13px;
          font-weight: 400;
          line-height: 20px;
          color: #5A554A;
          margin: 0;
          word-break: break-word;
        }

        .med-card__show-more-btn {
          background: none;
          border: none;
          padding: 0;
          color: #206E55;
          font-size: 13px;
          font-weight: 400;
          line-height: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .med-card__ask-wrap {
          padding: 0px 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .med-card__ask-box {
          background: #FFFFFF;
          border: 0.5px solid #E5E2DA;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }

        .med-card__ask-text {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .med-card__ask-title {
          font-size: 15px;
          font-weight: 500;
          line-height: 24px;
          color: #141515;
          word-break: break-word;
          max-width: 270px;
        }

        .med-card__ask-desc {
          font-size: 13px;
          font-weight: 400;
          line-height: 20px;
          color: #5A554A;
          max-width: 270px;
        }

        .med-card__ask-button {
          width: 100%;
          height: 48px;
          background: #206E55;
          border-radius: 999px;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 500;
          line-height: 20px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
      `}</style>

      <div className="med-card__header">
        <StatusBadgeMobile status={medication.status} />
        <div className="med-card__title-row">
          <div className="med-card__icon-box">
            <MedicationIcon medication={medication} size={16} />
          </div>
          <h2 className="med-card__title">{formatDrugTitle(medication.title)}</h2>
        </div>
      </div>

      {medication.directions && (
        <div className="med-card__dosage-banner-wrap">
          <div className="med-card__dosage-banner">
            <InfoIcon size={16} color='#8A621D' />
            <div className="med-card__dosage-text">{medication.directions}</div>
          </div>
        </div>
      )}

      <div className="med-card__details-section">
        <h3 className="med-card__details-title">Prescription details</h3>
        <div className="med-card__details-grid">
          <div className="med-card__detail-item">
            <span className="med-card__detail-label">Quantity</span>
            <span className="med-card__detail-value">{qty}</span>
          </div>
          <div className="med-card__detail-divider" />
          <div className="med-card__detail-item">
            <span className="med-card__detail-label">Refills</span>
            <span className="med-card__detail-value">{refills}</span>
          </div>
          <div className="med-card__detail-divider" />
          <div className="med-card__detail-item">
            <span className="med-card__detail-label">Last refill</span>
            <span className="med-card__detail-value">{formatDateMobile(medication.last_refill_at)}</span>
          </div>
          <div className="med-card__detail-divider" />
          <div className="med-card__detail-item">
            <span className="med-card__detail-label">Next refill</span>
            <span className="med-card__detail-value">{formatDateMobile(medication.next_refill_at)}</span>
          </div>
        </div>
      </div>

      <div className="med-card__ask-wrap">
        <div className="med-card__ask-box">
          <div className="med-card__ask-text">
            <span className="med-card__ask-title">Got questions about {shortName(medication.title)}?</span>
            <span className="med-card__ask-desc">Ask about dosing, missed doses, food interactions, or when to stop.</span>
          </div>
          <button className="med-card__ask-button" onClick={onAskAugust}>
            Ask August
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateMobile(dateStr?: string | null) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

function StatusBadgeMobile({ status }: { status?: string }) {
  if (!status) return null;
  
  const isPharmacy = status === 'sent_to_pharmacy' || status === 'filled';
  const bg = isPharmacy ? '#E8F2ED' : '#FAF2DE';
  const border = isPharmacy ? '#206E55' : '#8A621D';
  const textColor = isPharmacy ? '#206E55' : '#8A621D';
  const label = status === 'sent_to_pharmacy' ? 'Sent to Pharmacy' : status === 'filled' ? 'Filled' : 'Pending';
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4px 8px',
        gap: '4px',
        width: 'fit-content',
        height: '24px',
        background: bg,
        border: `0.5px solid ${border}`,
        borderRadius: '6px',
        boxSizing: 'border-box',
      }}
    >
      {status === 'sent_to_pharmacy' && (
        <svg width="12" height="12" viewBox="8.5 6.5 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d="M16.6403 11.1097C16.6752 11.1445 16.7028 11.1859 16.7217 11.2314C16.7406 11.2769 16.7503 11.3257 16.7503 11.375C16.7503 11.4243 16.7406 11.4731 16.7217 11.5186C16.7028 11.5641 16.6752 11.6055 16.6403 11.6403L14.0153 14.2653C13.9805 14.3002 13.9391 14.3278 13.8936 14.3467C13.8481 14.3656 13.7993 14.3753 13.75 14.3753C13.7007 14.3753 13.6519 14.3656 13.6064 14.3467C13.5609 14.3278 13.5195 14.3002 13.4847 14.2653L12.3597 13.1403C12.2893 13.0699 12.2498 12.9745 12.2498 12.875C12.2498 12.7755 12.2893 12.6801 12.3597 12.6097C12.4301 12.5393 12.5255 12.4998 12.625 12.4998C12.7245 12.4998 12.8199 12.5393 12.8903 12.6097L13.75 13.4698L16.1097 11.1097C16.1445 11.0748 16.1859 11.0472 16.2314 11.0283C16.2769 11.0094 16.3257 10.9997 16.375 10.9997C16.4243 10.9997 16.4731 11.0094 16.5186 11.0283C16.5641 11.0472 16.6055 11.0748 16.6403 11.1097ZM19.375 12.5C19.375 13.4642 19.0891 14.4067 18.5534 15.2084C18.0177 16.0101 17.2564 16.6349 16.3656 17.0039C15.4748 17.3729 14.4946 17.4694 13.5489 17.2813C12.6033 17.0932 11.7346 16.6289 11.0529 15.9471C10.3711 15.2654 9.90678 14.3967 9.71867 13.4511C9.53057 12.5054 9.62711 11.5252 9.99609 10.6344C10.3651 9.74363 10.9899 8.98226 11.7916 8.44659C12.5933 7.91091 13.5358 7.625 14.5 7.625C15.7925 7.62636 17.0317 8.14042 17.9456 9.05436C18.8596 9.96831 19.3736 11.2075 19.375 12.5ZM18.625 12.5C18.625 11.6842 18.3831 10.8866 17.9298 10.2083C17.4766 9.52992 16.8323 9.00121 16.0786 8.689C15.3248 8.37679 14.4954 8.2951 13.6953 8.45426C12.8951 8.61342 12.1601 9.00629 11.5832 9.58318C11.0063 10.1601 10.6134 10.8951 10.4543 11.6953C10.2951 12.4954 10.3768 13.3248 10.689 14.0786C11.0012 14.8323 11.5299 15.4766 12.2083 15.9298C12.8866 16.3831 13.6842 16.625 14.5 16.625C15.5936 16.6238 16.6421 16.1888 17.4154 15.4154C18.1888 14.6421 18.6238 13.5936 18.625 12.5Z" fill="#206E55" />
        </svg>
      )}
      <span
        style={{
          fontFamily: '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 400,
          fontSize: '11px',
          lineHeight: '16px',
          color: textColor,
        }}
      >
        {label}
      </span>
    </div>
  );
}
