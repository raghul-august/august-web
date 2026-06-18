'use client';

import Image from 'next/image';
import {
  ClipboardTextIcon,
  CurrencyDollarSimpleIcon,
  StethoscopeIcon,
  ClockIcon,
} from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useNewConsultModalStore } from '@/stores/new-consult-modal-store';
import { useChatInputFocusStore } from '@/stores/chat-input-focus-store';
import { trackTelehealth } from '@/services/telehealth-analytics';
import { CONSULT_PRICE_LABEL } from '@/lib/config';

const DOCTOR_IMAGES = [
  { src: '/assets/doc1.png', size: 77, z: 1 },
  { src: '/assets/doc2.png', size: 88, z: 2 },
  { src: '/assets/doc3.png', size: 77, z: 1 },
];

const STEPS = [
  { Icon: ClipboardTextIcon, label: 'August reviews your symptoms' },
  { Icon: CurrencyDollarSimpleIcon, label: 'Only pay if a doctor visit is needed' },
  { Icon: StethoscopeIcon, label: 'Get your diagnosis and prescription' },
  { Icon: ClockIcon, label: 'Follow-up with your doctor anytime' },
];

export function NewConsultModal() {
  const isOpen = useNewConsultModalStore((s) => s.isOpen);
  const close = useNewConsultModalStore((s) => s.close);
  const requestFocus = useChatInputFocusStore((s) => s.requestFocus);

  const handleClose = () => {
    close();
    requestFocus();
  };

  const handleBegin = () => {
    trackTelehealth('begin_symptom_review_clicked');
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        showCloseButton={false}
        style={{
          width: 482,
          maxWidth: 'calc(100% - 2rem)',
          padding: 32,
          borderRadius: 12,
          border: '0.5px solid #E5E2DA',
          background: '#FFF',
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Doctor avatars — center image larger, side images tucked behind it */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {DOCTOR_IMAGES.map((doc, i) => (
            <span
              key={doc.src}
              style={{
                width: doc.size,
                height: doc.size,
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                zIndex: doc.z,
                border: '4px solid #F3F1EB',
                background: '#F3F1EB',
                marginLeft: i === 0 ? 0 : -16,
                flexShrink: 0,
              }}
            >
              <Image src={doc.src} alt="" fill sizes="88px" style={{ objectFit: 'cover' }} />
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <DialogTitle
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 24,
              fontWeight: 500,
              lineHeight: '25px',
              letterSpacing: '-0.4px',
              color: '#141515',
              textAlign: 'center',
            }}
          >
            Talk to a licensed doctor
          </DialogTitle>
          <DialogDescription
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 400,
              lineHeight: '20px',
              color: '#5A554A',
              textAlign: 'center',
            }}
          >
            Get a diagnosis and prescription from a licensed physician.
            All 50 US states. Flat {CONSULT_PRICE_LABEL}, no insurance required.
          </DialogDescription>
        </div>

        {/* How it works */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignSelf: 'stretch',
            height: 295,
            padding: 20,
            borderRadius: 12,
            background: '#FAF9F5',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              fontWeight: 500,
              lineHeight: '24px',
              color: '#141515',
              textTransform: 'uppercase',
            }}
          >
            How it works
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {STEPS.map(({ Icon, label }, i) => {
              const isLast = i === STEPS.length - 1;
              return (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    gap: 12,
                    // Rows grow to spread evenly across the box; the last row
                    // hugs its content so the group fills the 295px height.
                    flex: isLast ? '0 0 auto' : 1,
                  }}
                >
                  {/* Icon column with the connecting dotted line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span
                      style={{
                        display: 'flex',
                        width: 32,
                        height: 32,
                        padding: 8,
                        gap: 10,
                        boxSizing: 'border-box',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 6,
                        background: '#F3F1EB',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} color="#5A554A" />
                    </span>
                    {!isLast && (
                      <span
                        style={{
                          flex: 1,
                          width: 0,
                          margin: '4px 0',
                          borderLeft: '1px dashed #D1CDC2',
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      fontWeight: 400,
                      lineHeight: '20px',
                      color: '#141515',
                      paddingTop: 6,
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA + disclaimer (8px apart) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, alignSelf: 'stretch' }}>
          <button
            type="button"
            onClick={handleBegin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'stretch',
              height: 56,
              borderRadius: 28,
              border: 'none',
              background: '#206E55',
              color: '#FFF',
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              fontWeight: 500,
              lineHeight: '24px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#408A6C'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#206E55'; }}
          >
            Begin symptom review
          </button>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              lineHeight: '16px',
              color: '#A8A39A',
              textAlign: 'center',
            }}
          >
            A prescription is not guaranteed. You may not receive one after your
            consultation if the doctor determines it isn&apos;t appropriate.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
