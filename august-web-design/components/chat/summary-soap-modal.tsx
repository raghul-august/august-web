'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { XIcon } from '@phosphor-icons/react/ssr';

export interface SummaryMeta {
  age?: string | number;
  duration?: string;
  severity?: string;
  type?: string;
}

export type SummarySoapTab = 'summary' | 'soap';

interface SummarySoapModalProps {
  open: boolean;
  initialTab: SummarySoapTab;
  onClose: () => void;
  summary?: string | null;
  soapNote?: string | null;
  summaryMeta?: SummaryMeta;
}

/**
 * Unified Visit summary / SOAP notes modal with a segmented toggle.
 * Shared between the chat doctor-consult card and the doctor consult chat pane
 * so both render a single modal that can switch between the two views.
 */
export function SummarySoapModal({
  open,
  initialTab,
  onClose,
  summary,
  soapNote,
  summaryMeta,
}: SummarySoapModalProps) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<SummarySoapTab>(initialTab);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Re-sync the active tab to whichever trigger opened the modal.
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  if (!open || !mounted) return null;

  const isSummary = tab === 'summary';

  const chips: { label: string; value: string }[] = [];
  if (summaryMeta?.age !== undefined && summaryMeta.age !== '') chips.push({ label: 'Age', value: String(summaryMeta.age) });
  if (summaryMeta?.duration) chips.push({ label: 'Duration', value: summaryMeta.duration });
  if (summaryMeta?.severity) chips.push({ label: 'Severity', value: summaryMeta.severity });
  if (summaryMeta?.type) chips.push({ label: 'Type', value: summaryMeta.type });

  const tabBase: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '9px 16px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: 500,
    fontSize: '15px',
    lineHeight: '24px',
    transition: '160ms ease',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '24px',
          padding: '24px',
          width: '518px',
          maxWidth: '100%',
          height: '610px',
          maxHeight: '85vh',
          background: 'var(--color-surface-page, #FAF9F5)',
          border: '0.5px solid var(--color-border-subtle, #E5E2DA)',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
          borderRadius: '24px',
          boxSizing: 'border-box',
        }}
      >
        <style jsx global>{`
          .ss-modal-hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
          .ss-modal-hide-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
          .ss-summary-content p { margin: 0 0 12px 0; }
          .ss-summary-content p:last-child { margin-bottom: 0; }
          .ss-summary-content strong { color: #141515; font-weight: 600; }
          .ss-summary-content ul { list-style-type: disc; padding-left: 1.25rem; margin: 0 0 12px 0; }
          .ss-summary-content li { margin-bottom: 4px; }
          .ss-soap-content h1,
          .ss-soap-content h2,
          .ss-soap-content h3,
          .ss-soap-content h4 {
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            font-size: 15px;
            line-height: 24px;
            color: #141515;
            margin: 16px 0 4px 0;
            border: none;
            padding: 0;
          }
          .ss-soap-content > :first-child { margin-top: 0; }
          .ss-soap-content p {
            font-family: 'Inter', sans-serif;
            font-weight: 400;
            font-size: 15px;
            line-height: 24px;
            color: #5A554A;
            margin: 0 0 8px 0;
          }
          .ss-soap-content p:last-child { margin-bottom: 0; }
          .ss-soap-content strong { color: #141515; font-weight: 600; }
          .ss-soap-content ul,
          .ss-soap-content ol { list-style-type: disc; padding-left: 20px; margin: 0 0 8px 0; }
          .ss-soap-content ol { list-style-type: decimal; }
          .ss-soap-content li {
            font-family: 'Inter', sans-serif;
            font-weight: 400;
            font-size: 15px;
            line-height: 24px;
            color: #5A554A;
            margin-bottom: 4px;
          }
          .ss-soap-content li::marker { color: #5A554A; }
        `}</style>

        {/* Close — 24px from top & right, above the toggle */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '32px',
            height: '32px',
            padding: '0.636px 3.818px',
            aspectRatio: '1 / 1',
            background: 'var(--color-surface-page, #FAF9F5)',
            border: '0.636px solid var(--color-border-default, #D1CDC2)',
            borderRadius: '635.727px',
            cursor: 'pointer',
            flexShrink: 0,
            zIndex: 1,
          }}
          aria-label="Close"
        >
          <XIcon size={15} color='#141515' />
        </button>

        {/* Toggle — full-width track, equal-half tabs, sits below the close button */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            marginTop: '40px',
            background: '#F3F1EB',
            border: '0.5px solid #E5E2DA',
            borderRadius: '50px',
            alignSelf: 'stretch',
            width: '100%',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={isSummary}
            onClick={() => setTab('summary')}
            style={{
              ...tabBase,
              background: isSummary ? '#FFFFFF' : 'transparent',
              boxShadow: isSummary ? '0 1px 2px rgba(0, 0, 0, 0.08)' : 'none',
              color: isSummary ? 'var(--color-brand-primary, #206E55)' : '#5A554A',
            }}
          >
            Visit summary
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isSummary}
            onClick={() => setTab('soap')}
            style={{
              ...tabBase,
              background: !isSummary ? '#FFFFFF' : 'transparent',
              boxShadow: !isSummary ? '0 1px 2px rgba(0, 0, 0, 0.08)' : 'none',
              color: !isSummary ? 'var(--color-brand-primary, #206E55)' : '#5A554A',
            }}
          >
            SOAP notes
          </button>
        </div>

        {/* Title + description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: 'stretch', flexShrink: 0 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontStyle: 'normal',
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '24px',
              letterSpacing: '-0.4px',
              color: 'var(--color-text-primary, #141515)',
            }}
          >
            {isSummary ? 'Visit summary' : 'SOAP notes (for Physicians)'}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '15px',
              lineHeight: '24px',
              color: 'var(--color-text-secondary, #5A554A)',
            }}
          >
            A clinical summary to share with your doctor
          </span>
        </div>

        {/* Body */}
        <div
          className="ss-modal-hide-scrollbar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '16px',
            alignSelf: 'stretch',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          {isSummary ? (
            <>
              <div
                className="ss-summary-content"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '24px',
                  color: 'var(--color-text-secondary, #5A554A)',
                  alignSelf: 'stretch',
                }}
              >
                {summary ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                ) : (
                  <p>No summary available.</p>
                )}
              </div>

              {chips.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '12px', alignSelf: 'stretch' }}>
                  {chips.map((chip) => (
                    <div
                      key={chip.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '8px 12px',
                        gap: '4px',
                        height: '36px',
                        background: '#F3F1EB',
                        border: '0.5px solid #E5E2DA',
                        borderRadius: '8px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '13px',
                        lineHeight: '20px',
                        color: '#7A7468',
                      }}
                    >
                      <span>{chip.label}:</span>
                      <span style={{ color: '#141515', fontWeight: 500 }}>{chip.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="ss-soap-content" style={{ alignSelf: 'stretch', fontFamily: 'Inter, sans-serif' }}>
              {soapNote ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{soapNote}</ReactMarkdown>
              ) : (
                <p>No SOAP notes available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
