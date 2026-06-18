'use client';
import { useState } from 'react';
import {
  TimerIcon,
  HandHeartIcon,
  HourglassHighIcon,
  NoteIcon,
  TagIcon,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import { CONSULT_PRICE_LABEL } from '@/lib/config';
import type { ConsultPayment, TextSize } from '@/types';
import { trackTelehealth } from '@/services/telehealth-analytics';
import { SummarySoapModal, type SummaryMeta } from './summary-soap-modal';
import { CalendarXIcon } from 'lucide-react';

interface DoctorConsultCardProps {
  visitReason?: string;
  onConfirm: () => void;
  loading?: boolean;
  className?: string;
  summary?: string;
  soapNote?: string;
  summaryMeta?: SummaryMeta;
  consultPayment?: ConsultPayment;
  encounterStatus?: string | null;
  encounterExpiresAt?: string | null;
  encounterLoading?: boolean;
  textSize: TextSize;
}

const DOCTOR_CONSULT_TEXT_SIZE_MAP: Record<
  TextSize,
  {
    title: { fontSize: number; lineHeight: number };
    popupTitle: { fontSize: number; lineHeight: number };
    body: { fontSize: number; lineHeight: number };
    compact: { fontSize: number; lineHeight: number };
    pill: { fontSize: number; lineHeight: number };
    button: { fontSize: number; lineHeight: number };
  }
> = {
  small: {
    title: { fontSize: 22, lineHeight: 23 },
    popupTitle: { fontSize: 18, lineHeight: 22 },
    body: { fontSize: 13, lineHeight: 22 },
    compact: { fontSize: 11, lineHeight: 18 },
    pill: { fontSize: 10, lineHeight: 14 },
    button: { fontSize: 14, lineHeight: 18 },
  },
  medium: {
    title: { fontSize: 24, lineHeight: 25 },
    popupTitle: { fontSize: 20, lineHeight: 24 },
    body: { fontSize: 15, lineHeight: 24 },
    compact: { fontSize: 13, lineHeight: 20 },
    pill: { fontSize: 12, lineHeight: 16 },
    button: { fontSize: 16, lineHeight: 20 },
  },
  large: {
    title: { fontSize: 26, lineHeight: 29 },
    popupTitle: { fontSize: 22, lineHeight: 28 },
    body: { fontSize: 17, lineHeight: 26 },
    compact: { fontSize: 15, lineHeight: 22 },
    pill: { fontSize: 14, lineHeight: 18 },
    button: { fontSize: 18, lineHeight: 22 },
  },
};

function formatPaidPrice(payment?: ConsultPayment): string | null {
  if (!payment || payment.amount == null || !payment.currency) return null;
  const major = payment.amount / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: payment.currency.toUpperCase(),
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: major % 1 === 0 ? 0 : 2,
    }).format(major);
  } catch {
    return `${major} ${payment.currency.toUpperCase()}`;
  }
}

interface PricePill {
  label: string;
  icon: Icon;
  bg: string;
  color: string;
  ctaLabel: string;
  loading?: boolean;
  ctaVariant?: 'solid' | 'outline';
  footerNote?: string;
}

const PILL_DEFAULT_BG = '#E8F2ED';
const PILL_DEFAULT_COLOR = '#206E55';

const SYMPTOM_REVIEW_NOTE = 'It’s been over 7 days since your last check-in, we’ll start fresh.';

function getPricePill(
  consultPayment?: ConsultPayment,
  encounterStatus?: string | null,
  encounterExpiresAt?: string | null,
  encounterLoading?: boolean,
): PricePill {
  const paidLabel = formatPaidPrice(consultPayment);
  const base = { icon: TagIcon, bg: PILL_DEFAULT_BG, color: PILL_DEFAULT_COLOR };

  const PENDING_STATUSES = ['pending_payment', 'verified'];
  const IN_PROGRESS_STATUSES = ['created', 'assigned', 'waiting', 'approved', 'processing'];

  if (!consultPayment?.encounterId) {
    return { ...base, label: `${CONSULT_PRICE_LABEL} flat, self-pay`, ctaLabel: 'Start Doctor Consult' };
  }

  if (encounterLoading) {
    return { ...base, label: '', icon: TagIcon, ctaLabel: '', loading: true };
  }

  const expired = !!encounterExpiresAt && new Date(encounterExpiresAt).getTime() < Date.now();
  const isPending = encounterStatus && PENDING_STATUSES.includes(encounterStatus);
  const isInProgress = encounterStatus && IN_PROGRESS_STATUSES.includes(encounterStatus);

  // expired + (pending or no status) → needs a fresh symptom review
  if (expired && (isPending || !encounterStatus)) {
    return {
      label: 'Symptom Review Required',
      icon: CalendarXIcon,
      bg: '#F7E5E3',
      color: '#802F28',
      ctaLabel: 'Start Symptom Review',
      footerNote: SYMPTOM_REVIEW_NOTE,
    };
  }

  if (isPending || encounterStatus === 'paid') {
    return { label: 'Incomplete Steps', icon: TimerIcon, bg: '#FAF2DE', color: '#8A621D', ctaLabel: 'Complete Steps' };
  }

  if (encounterStatus === 'disqualified') {
    return { label: 'In person visit required', icon: HandHeartIcon, bg: '#E5EEF2', color: '#2A4A55', ctaLabel: 'Know Why', ctaVariant: 'outline' };
  }

  if (isInProgress) {
    return { ...base, label: 'Consult in progress', icon: HourglassHighIcon, color: '#2A5A48', ctaLabel: 'Go to Doctor Consult' };
  }

  if (encounterStatus === 'completed') {
    return { ...base, label: 'Prescription sent', icon: NoteIcon, color: '#2A5A48', ctaLabel: 'Go to Doctor Consult' };
  }
  // Status unknown after loading failed: fall back
  return {
    ...base,
    label: paidLabel ? `${paidLabel} paid` : `${CONSULT_PRICE_LABEL} flat, self-pay`,
    ctaLabel: 'Go to Doctor Consult',
  };
}

export function DoctorConsultCard({ visitReason, onConfirm, loading, className, summary, soapNote, summaryMeta, consultPayment, encounterStatus, encounterExpiresAt, encounterLoading, textSize }: DoctorConsultCardProps) {
  const textSizes = DOCTOR_CONSULT_TEXT_SIZE_MAP[textSize];
  const pricePill = getPricePill(consultPayment, encounterStatus, encounterExpiresAt, encounterLoading);
  const PillIcon = pricePill.icon;
  const [activePopup, setActivePopup] = useState<'summary' | 'soap' | null>(null);

  const pillBg = pricePill.loading ? '#F3F1EB' : pricePill.bg;
  const pillBody = pricePill.loading ? (
    <span
      aria-hidden
      className="animate-pulse"
      style={{
        display: 'inline-block',
        width: 104,
        height: textSizes.pill.lineHeight,
        borderRadius: 6,
        background: 'rgba(0,0,0,0.08)',
      }}
    />
  ) : (
    <>
      <PillIcon size={textSizes.pill.fontSize + 2} color={pricePill.color} style={{ flexShrink: 0 }} />
      <span
        style={{
          color: pricePill.color,
          fontFamily: 'Inter, sans-serif',
          fontSize: `${textSizes.pill.fontSize}px`,
          fontStyle: 'normal',
          fontWeight: '400',
          lineHeight: `${textSizes.pill.lineHeight}px`,
        }}
      >
        {pricePill.label}
      </span>
    </>
  );

  const ctaBusy = loading || !!pricePill.loading;
  const ctaOutline = pricePill.ctaVariant === 'outline';

  return (
    <div
      className={cn(
        className,
        'flex w-full max-w-[556px] flex-col items-start gap-6 rounded-[24px] border border-[#E5E2DA] bg-white p-6 shadow-[0_4px_12px_0_rgba(0,0,0,0.06)] sm:p-8'
      )}
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex w-full max-w-[492px] flex-col items-start gap-5">
        {/* Section 1: SVG */}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.125 18V28.125H20.7591C21.2007 28.1306 21.6276 27.9663 21.9516 27.6661C22.2756 27.366 22.4719 26.9528 22.5 26.512C22.5131 26.2055 22.4424 25.9012 22.2954 25.6319C22.1485 25.3625 21.9309 25.1384 21.6661 24.9834C21.5792 24.934 21.5068 24.8626 21.456 24.7766C21.4052 24.6905 21.3778 24.5926 21.3764 24.4927V23.2566C21.3762 23.1675 21.3971 23.0797 21.4375 23.0003C21.4778 22.9209 21.5364 22.8522 21.6085 22.7999C21.6806 22.7475 21.7641 22.7131 21.8521 22.6994C21.9401 22.6856 22.0301 22.6929 22.1147 22.7208C22.8778 22.9894 23.5399 23.4862 24.0113 24.1437C24.4827 24.8012 24.7406 25.5877 24.75 26.3967C24.7725 28.5848 22.9219 30.375 20.7295 30.375H19.125V32.625C19.125 32.9234 19.0065 33.2095 18.7955 33.4205C18.5845 33.6315 18.2984 33.75 18 33.75C17.7016 33.75 17.4155 33.6315 17.2045 33.4205C16.9935 33.2095 16.875 32.9234 16.875 32.625V30.375H13.5C13.3458 30.3753 13.1931 30.344 13.0515 30.2828C12.91 30.2217 12.7825 30.1321 12.6769 30.0196C12.5714 29.9071 12.4902 29.7741 12.4383 29.6289C12.3863 29.4837 12.3648 29.3294 12.375 29.1755C12.3999 28.8857 12.5337 28.6161 12.7496 28.4212C12.9654 28.2262 13.2472 28.1204 13.538 28.125H16.875V18H14.6897C13.4803 18 12.4397 18.9281 12.3778 20.1361C12.3503 20.676 12.518 21.2077 12.8504 21.634C13.1827 22.0603 13.6574 22.3528 14.1877 22.4578C14.3124 22.4847 14.424 22.5538 14.5037 22.6535C14.5834 22.7531 14.6262 22.8772 14.625 23.0048V24.1875C14.625 24.3367 14.5657 24.4798 14.4602 24.5852C14.3548 24.6907 14.2117 24.75 14.0625 24.75C13.3873 24.7502 12.7188 24.6153 12.0965 24.3533C11.4742 24.0912 10.9105 23.7074 10.4388 23.2242C9.96708 22.7411 9.59677 22.1685 9.34967 21.5401C9.10257 20.9117 8.98368 20.2402 9 19.5652C9.06609 16.8019 11.3906 14.625 14.1581 14.625H16.875V3.375C16.875 3.07663 16.9935 2.79048 17.2045 2.5795C17.4155 2.36853 17.7016 2.25 18 2.25C18.2984 2.25 18.5845 2.36853 18.7955 2.5795C19.0065 2.79048 19.125 3.07663 19.125 3.375V14.625H23.625C23.9303 14.6254 24.2325 14.5636 24.5132 14.4435C24.7939 14.3234 25.0472 14.1474 25.2577 13.9262C25.4681 13.7051 25.6314 13.4434 25.7376 13.1572C25.8437 12.8709 25.8905 12.566 25.875 12.2611C25.8131 11.0531 24.7697 10.125 23.5603 10.125H21.9375C21.7883 10.125 21.6452 10.0657 21.5398 9.96025C21.4343 9.85476 21.375 9.71168 21.375 9.5625V6.1875C21.375 6.03832 21.4343 5.89524 21.5398 5.78975C21.6452 5.68426 21.7883 5.625 21.9375 5.625H24.0778C27.54 5.625 30.4341 8.45859 30.3736 11.9194C30.3456 13.5416 29.6815 15.0879 28.5245 16.2252C27.3674 17.3625 25.8099 17.9999 24.1875 18H19.125ZM13.0303 10.125H14.0625C14.2117 10.125 14.3548 10.0657 14.4602 9.96025C14.5657 9.85476 14.625 9.71168 14.625 9.5625V6.1875C14.625 6.03832 14.5657 5.89524 14.4602 5.78975C14.3548 5.68426 14.2117 5.625 14.0625 5.625H9C7.50816 5.625 6.07742 6.21763 5.02252 7.27252C3.96763 8.32742 3.375 9.75816 3.375 11.25V12.375C3.375 12.6734 3.49353 12.9595 3.7045 13.1705C3.91548 13.3815 4.20163 13.5 4.5 13.5H7.875C8.96948 13.5 10.0402 13.1807 10.9559 12.5812C11.8716 11.9817 12.5925 11.1281 13.0303 10.125Z" fill="#141515" />
        </svg>



        {/* Section 2: 2nd div after SVG */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '8px',
            width: '100%',
          }}
        >
          <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p
              style={{
                color: '#141515',
                fontSize: `${textSizes.title.fontSize}px`,
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: `${textSizes.title.lineHeight}px`,
                letterSpacing: '-0.4px',
                margin: 0,
              }}
            >
              Connect with a doctor
            </p>
            {/* Desktop pill: keep inline with title */}
            <div
              className="hidden sm:flex"
              style={{
                padding: '6px 10px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '24px',
                background: pillBg,
              }}
            >
              {pillBody}
            </div>
          </div>
          <p
            style={{
              width: '100%',
              color: '#5A554A',
              fontSize: `${textSizes.body.fontSize}px`,
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: `${textSizes.body.lineHeight}px`,
              margin: 0,
            }}
          >
            For "{visitReason || 'Health Issues'}"
          </p>

          {/* Mobile pill: sits under the subtitle with specified spacing */}
          <div
            className="flex sm:hidden mt-1 mb-2"
            style={{
              padding: '6px 10px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '24px',
              background: pillBg,
            }}
          >
            {pillBody}
          </div>

          <div
            className="mt-[8px] mb-[10px] sm:mt-[8px] sm:mb-[10px]"
            style={{
              width: '100%',
              maxWidth: '492px',
              height: '0.5px',
              background: '#E5E2DA',
            }}
          />

          <div style={{ width: '100%' }}>
            <p
              style={{
                color: '#141515',
                fontSize: `${textSizes.body.fontSize}px`,
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: `${textSizes.body.lineHeight}px`,
                margin: '0 0 12px 0',
              }}
            >
              Here's how it works
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {[
                'Fill out the intake form.',
                'Connect with a doctor via chat.',
                `Get your prescription in under 4 hours.`,
                'Enjoy 12 months of follow-up support.'
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M17.9421 6.06717L7.94205 16.0672C7.884 16.1253 7.81507 16.1714 7.7392 16.2028C7.66332 16.2343 7.582 16.2505 7.49986 16.2505C7.41773 16.2505 7.3364 16.2343 7.26052 16.2028C7.18465 16.1714 7.11572 16.1253 7.05767 16.0672L2.68267 11.6922C2.5654 11.5749 2.49951 11.4158 2.49951 11.25C2.49951 11.0841 2.5654 10.9251 2.68267 10.8078C2.79995 10.6905 2.95901 10.6246 3.12486 10.6246C3.29071 10.6246 3.44977 10.6905 3.56705 10.8078L7.49986 14.7414L17.0577 5.18279C17.175 5.06552 17.334 4.99963 17.4999 4.99963C17.6657 4.99963 17.8248 5.06552 17.9421 5.18279C18.0593 5.30007 18.1252 5.45913 18.1252 5.62498C18.1252 5.79083 18.0593 5.94989 17.9421 6.06717Z" fill="#206E55" />
                  </svg>
                  <p
                    style={{
                      color: '#5A554A',
                      fontSize: `${textSizes.compact.fontSize}px`,
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: `${textSizes.compact.lineHeight}px`,
                      margin: 0,
                    }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Next section: Flex container for pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              width: '100%',
            }}
          >
          </div>

          <button
            onClick={() => {
              if (ctaBusy) return;
              trackTelehealth('telehealth_consult_cta_clicked', {
                case_status: consultPayment?.amount ? 'paid' : 'in-progress',
              });
              onConfirm();
            }}
            disabled={ctaBusy}
            className="transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center w-full"
            style={{
              height: '52px',
              borderRadius: '999px',
              background: ctaOutline ? 'transparent' : '#206E55',
              color: ctaOutline ? 'var(--color-text-primary, #141515)' : '#FFF',
              fontSize: `${textSizes.button.fontSize}px`,
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: `${textSizes.button.lineHeight}px`,
              border: ctaOutline ? '0.5px solid var(--color-text-primary, #141515)' : 'none',
              cursor: ctaBusy ? 'default' : 'pointer',
              textAlign: 'center',
              opacity: ctaBusy ? 0.7 : 1,
            }}
          >
            {ctaBusy ? (
              <div className="flex items-center gap-3">
                <svg
                  className={cn('animate-spin h-5 w-5', ctaOutline ? 'text-[#141515]' : 'text-white')}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {loading && <span>Connecting...</span>}
              </div>
            ) : pricePill.ctaLabel}
          </button>

          <p
            style={{
              width: '100%',
              marginTop: '4px',
              marginBottom: 0,
              textAlign: 'center',
              color: '#5A554A',
              fontFamily: 'Inter, sans-serif',
              fontSize: `${textSizes.compact.fontSize}px`,
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: `${textSizes.compact.lineHeight}px`,
            }}
          >
            {pricePill.footerNote ? (
              pricePill.footerNote
            ) : (
              <>
                Your doctor receives this chat’s{' '}
                <span
                  onClick={() => summary && setActivePopup('summary')}
                  style={{
                    color: '#206E55',
                    textDecoration: 'underline',
                    textDecorationLine: 'underline',
                    textDecorationStyle: 'solid',
                    textDecorationSkipInk: 'auto',
                    textUnderlinePosition: 'from-font',
                    cursor: summary ? 'pointer' : 'default',
                    opacity: summary ? 1 : 0.7,
                  }}
                >
                  Summary
                </span>{' '}
                and{' '}
                <span
                  onClick={() => soapNote && setActivePopup('soap')}
                  style={{
                    color: '#206E55',
                    textDecoration: 'underline',
                    textDecorationLine: 'underline',
                    textDecorationStyle: 'solid',
                    textDecorationSkipInk: 'auto',
                    textUnderlinePosition: 'from-font',
                    cursor: soapNote ? 'pointer' : 'default',
                    opacity: soapNote ? 1 : 0.7,
                  }}
                >
                  SOAP notes
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <SummarySoapModal
        open={activePopup !== null}
        initialTab={activePopup === 'soap' ? 'soap' : 'summary'}
        onClose={() => setActivePopup(null)}
        summary={summary}
        soapNote={soapNote}
        summaryMeta={summaryMeta}
      />
    </div>
  );
}
