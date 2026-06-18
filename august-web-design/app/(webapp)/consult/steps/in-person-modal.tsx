'use client';

// Shown after /complete-intake returns status === 'disqualified' — every
// candidate offering failed at least one required intake question, so we
// route the patient to brick-and-mortar care instead of the payment flow.

import { useEffect } from 'react';
import { Warning, HandHeartIcon, HospitalIcon, IdentificationCardIcon } from '@phosphor-icons/react';
import { CONSULT_PRICE_LABEL } from '@/lib/config';

interface Props {
  onAcknowledge: () => void;
  onDismiss?: () => void;
}

export function InPersonCareModal({ onAcknowledge, onDismiss }: Props) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="in-person-modal-title"
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 21, 21, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '24px',
      }}
    >
      {/* Mobile (<=640px): the desktop card overflows small screens, so the
          CTA ends up crammed against the bottom edge. Tighten padding/gaps,
          shrink the disclaimer + "what to do next" text so it fits without
          scrolling, and give the CTA safe-area bottom clearance. Scoped under
          .ipm-card so nothing leaks; !important overrides the inline styles. */}
      <style>{`
        @media (max-width: 640px) {
          .ipm-card {
            padding: 20px !important;
            gap: 14px !important;
            padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px)) !important;
          }
          .ipm-next { gap: 12px !important; }
          .ipm-next-title { font-size: 14px !important; line-height: 20px !important; }
          .ipm-step-title { font-size: 13px !important; line-height: 18px !important; }
          .ipm-step-body { font-size: 12px !important; line-height: 16px !important; }
          .ipm-disclaimer { font-size: 12px !important; line-height: 16px !important; }
          .ipm-cta { height: 52px !important; }
        }
      `}</style>
      <div
        className="ipm-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '0.5px solid #E5E2DA',
          padding: '24px',
          width: '513px',
          maxWidth: '100%',
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '20px',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
        }}
      >
        <HandHeartIcon size={40} color="#141515" aria-hidden />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'stretch' }}>
          <h2
            id="in-person-modal-title"
            style={{
              margin: 0,
              color: '#141515',
              fontFamily: 'Inter, sans-serif',
              fontSize: '20px',
              fontWeight: 500,
              lineHeight: '24px',
            }}
          >
            This one&apos;s better handled in person
          </h2>
          <p
            style={{
              margin: 0,
              color: '#5A554A',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: '24px',
            }}
          >
            Based on what you&apos;ve shared, the safest and most effective care for you right now is an in-person visit — not a virtual one.
          </p>
          <p
            style={{
              margin: 0,
              color: '#5A554A',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: '24px',
            }}
          >
            Some situations need a hands-on exam, a test, or a provider who can review your full history before making a treatment decision. This is one of them.
          </p>
        </div>

        {/* Disqualification happens after payment, so the charge is refunded.
            The parent flex has gap:20px; the negative top / positive bottom
            margins make it 12px above this box and 24px below (to the next
            section). */}
        <div
          style={{
            background: '#E8F2ED',
            border: '0.5px solid #E8F2ED',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            alignSelf: 'stretch',
            marginTop: '-8px',
            marginBottom: '4px',
          }}
        >
          <span
            style={{
              color: '#3D8168',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              lineHeight: '24px',
            }}
          >
            Your consult fee will be refunded.
          </span>
          <span
            style={{
              color: '#3D8168',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: '20px',
            }}
          >
            We&apos;ll send it back to your original payment method automatically.
          </span>
        </div>

        <div className="ipm-next" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignSelf: 'stretch' }}>
          <h3
            className="ipm-next-title"
            style={{
              margin: 0,
              color: '#141515',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              lineHeight: '24px',
            }}
          >
            What to do next
          </h3>

          <NextStep
            icon={<HospitalIcon size={18} color='#5A554A'/>}
            title="Visit an in-person urgent care clinic today"
            body="Most are open evenings and weekends, no appointment needed"
            background="#F3F1EB"
          />
          <NextStep
            icon={<IdentificationCardIcon size={18} color='#5A554A' />}
            title="Carry with you"
            body="Photo ID, insurance card, a list of your current medications, and any known allergies"
            background="#F3F1EB"
          />
        </div>

        <div
          style={{
            background: '#FAF9F5',
            border: '0.5px solid #E5E2DA',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            alignSelf: 'stretch',
          }}
        >
          <Warning size={18} color="#5A554A" weight="regular" style={{ flexShrink: 0, marginTop: 2 }} />
          <p
            className="ipm-disclaimer"
            style={{
              margin: 0,
              color: '#5A554A',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: '20px',
            }}
          >
            If your symptoms get worse before you can be seen — severe pain, high fever, trouble breathing, confusion, or anything that feels like an emergency — go to the <strong>nearest ER or call 911.</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={onAcknowledge}
          className="ipm-cta"
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '999px',
            background: '#206E55',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease-in-out',
          }}
        >
          Yes, I understand
        </button>
      </div>
    </div>
  );
}

function NextStep({ icon, title, body, background }: { icon: React.ReactNode; title: string; body: string; background: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: background,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span className="ipm-step-title" style={{ color: '#141515', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500, lineHeight: '24px' }}>
          {title}
        </span>
        <span className="ipm-step-body" style={{ color: '#5A554A', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 400, lineHeight: '20px' }}>
          {body}
        </span>
      </div>
    </div>
  );
}
