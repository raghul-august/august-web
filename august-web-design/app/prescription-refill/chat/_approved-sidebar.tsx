'use client';

import { useMemo, useState } from 'react';
import { CaretDown, Check, X } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/*
 * Shown in the clinician's right rail when the backend pushes a
 * `prescription_refill_approved` event — the refill request has cleared
 * automated checks and is ready for a clinician decision. Renders the
 * structured SOAP note inline, with a collapsible chat-bubble transcript
 * of the patient/assistant exchange below it.
 *
 * The SOAP and conversation payloads are deterministically formatted by
 * the backend (four named sections + `[August]:` / `[Patient]:` turns),
 * so we parse them with simple string scans rather than dragging in a
 * markdown renderer.
 */

// Desktop cap. On mobile the column becomes a full-screen drawer; we let
// the aside fill that width by switching to `width: 100%` and capping
// only at the desktop breakpoint via CSS below. The approved card is
// intentionally wider than the medication sidebar's 364px glow card —
// SOAP + transcript benefit from the extra horizontal breathing room.
// We also widen the column itself (see :has rule below) so the clinician
// review surface gets noticeably more room than the medication state.
const CARD_MAX_WIDTH = 480;
const APPROVED_COLUMN_WIDTH = 496;

const FALLBACK_BODY =
  "The patient's refill request has cleared automated checks. Review the prescription details in the conversation, then approve to send it to the pharmacy or reject to return it for revision.";

const SOAP_KEYS = ['Subjective', 'Objective', 'Assessment', 'Plan'] as const;
type SoapKey = (typeof SOAP_KEYS)[number];
// Visible sections in the rail. The Plan section is intentionally
// omitted — we surface a clinician-facing Recommendation block in its
// place (see RECOMMENDATION_LETTER / RECOMMENDATION_TITLE below).
const VISIBLE_SOAP_KEYS: SoapKey[] = ['Subjective', 'Objective', 'Assessment'];
const RECOMMENDATION_TITLE = 'Recommendation';
const RECOMMENDATION_LETTER = 'R';
type SoapSection = { key: SoapKey; body: string };

// Capture each section's body up to the next header (or end-of-string).
// Headers arrive as markdown — `## Subjective` — but we also tolerate the
// legacy bare `Subjective:` form so older payloads still render.
function parseSoap(text: string): SoapSection[] {
  const headerAlternation = SOAP_KEYS.map(
    (k) => `(?:##\\s*${k}\\b|${k}\\s*:)`,
  ).join('|');
  const sectionRegex = new RegExp(
    `(${headerAlternation})([\\s\\S]*?)(?=(?:${headerAlternation})|$)`,
    'g',
  );
  const bodies: Record<SoapKey, string> = {
    Subjective: '',
    Objective: '',
    Assessment: '',
    Plan: '',
  };
  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(text)) !== null) {
    const raw = match[1].replace(/^##\s*/, '').replace(/\s*:\s*$/, '').trim();
    const head = raw as SoapKey;
    if (SOAP_KEYS.includes(head)) {
      bodies[head] = match[2].trim();
    }
  }
  return SOAP_KEYS.map((key) => ({ key, body: bodies[key] }));
}

type Turn = { role: 'August' | 'Patient'; text: string };

// Turns are line-prefixed with `[August]:` or `[Patient]:`. A turn body
// could in theory span multiple lines — fold continuation lines into the
// most recently opened turn.
function parseConversation(text: string): Turn[] {
  const turns: Turn[] = [];
  const lines = text.split('\n');
  let current: Turn | null = null;
  const turnHead = /^\[(August|Patient)\]:\s*(.*)$/;
  for (const line of lines) {
    const m = line.match(turnHead);
    if (m) {
      if (current) turns.push(current);
      current = { role: m[1] as Turn['role'], text: m[2] };
    } else if (current && line.trim()) {
      current.text += '\n' + line;
    }
  }
  if (current) turns.push(current);
  return turns;
}

export function ApprovedSidebar({
  soapNote,
  conversation,
  drugName,
  onApprove,
  onDismiss,
  onReject,
}: {
  soapNote?: string | null;
  conversation?: string | null;
  drugName?: string;
  // Fires the instant Approve is clicked — caller posts the patient
  // reply + locks the chat here so the message lands before the card
  // animates away.
  onApprove?: () => void;
  // Fires after the exit animation finishes — caller tears down the
  // approval state and unmounts the sidebar here.
  onDismiss?: () => void;
  onReject?: () => void;
}) {
  const [showConversation, setShowConversation] = useState(false);
  // Exit-animation gate. Clicking Approve flips this on, which paints
  // the card out via the approved-card-out keyframe; once the animation
  // finishes we forward to the parent's onApprove which unmounts us.
  // Held in a ref'd timeout so a double-tap doesn't fire twice.
  const [isExiting, setIsExiting] = useState(false);
  const trimmedSoap = soapNote?.trim();
  const sections = useMemo(
    () => (trimmedSoap ? parseSoap(trimmedSoap) : null),
    [trimmedSoap],
  );
  const turns = useMemo(
    () => (conversation?.trim() ? parseConversation(conversation) : []),
    [conversation],
  );
  const hasConversation = turns.length > 0;
  // "Parsed properly" = at least one section actually had content. An
  // empty array means we got a SOAP string we couldn't map, in which
  // case we fall back to surfacing the raw conversation alongside the
  // recommendation so the clinician still has *something* to review.
  const hasParsedSoap = Boolean(sections?.some((s) => s.body));
  const recommendationBody = `Approve refill for ${drugName ?? 'medication'}`;

  return (
    <aside
      className={`approved-aside${isExiting ? ' is-exiting' : ''}`}
      style={{
        // Fill the sidebar column vertically. minHeight:0 lets the inner
        // scrollable region actually bound itself against the column —
        // without it, flex's implicit min-height: auto lets the card
        // grow to fit its content and the middle scroll never engages.
        flex: 1,
        alignSelf: 'stretch',
        minHeight: 0,
        width: '100%',
        display: 'flex',
        fontFamily:
          '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontFeatureSettings: '"ss01", "cv11"',
      }}
    >
      <style jsx>{`
        /* Cap the card width on desktop only. On mobile (<1200px) the
           sidebar column becomes a full-screen drawer, so we let the
           aside fill it edge-to-edge instead of leaving stranded on the
           left half. */
        @media (min-width: 1200px) {
          :global(.approved-aside) {
            max-width: ${CARD_MAX_WIDTH}px;
          }
          /* Approved state widens the entire column and shaves both side
             gutters down from 24px to 8px so the review surface gets a
             materially wider canvas than the medication state. Uses
             :has so the medication column keeps its default geometry. */
          :global(
              .prescription-refill-chat-sidebar-column:has(.approved-aside)
            ) {
            width: ${APPROVED_COLUMN_WIDTH}px;
            padding-left: 8px;
            padding-right: 10px;
          }
        }
        /* Entrance: the approved card replaces the medication sidebar
           the moment the backend pushes the approval event. We fade +
           rise + scale from a slightly compressed state so the swap
           reads as the card materialising, not flashing into place. */
        @keyframes approved-card-in {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        :global(.approved-aside) {
          animation: approved-card-in 440ms
            cubic-bezier(0.22, 0.61, 0.36, 1) both;
          transform-origin: top center;
        }
        /* Exit: clicking Approve lifts the card off the rail with a
           gentle upward rise + fade, mirroring the entrance but in
           reverse. The parent onApprove fires after this completes so
           the unmount lines up with the animation rather than cutting
           it short. */
        @keyframes approved-card-out {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-14px) scale(0.97);
          }
        }
        :global(.approved-aside.is-exiting) {
          animation: approved-card-out 340ms
            cubic-bezier(0.4, 0, 0.2, 1) both;
          pointer-events: none;
        }
        /* scrollbar-gutter: stable reserves a column for the scrollbar
           so the macOS-style overlay bar doesn't paint on top of text.
           WebKit sizes the gutter to the custom 4px width below; on
           Firefox the gutter matches scrollbar-width: thin. */
        :global(.approved-scroll) {
          scrollbar-gutter: stable;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
        }
        :global(.approved-scroll)::-webkit-scrollbar {
          width: 4px;
        }
        :global(.approved-scroll)::-webkit-scrollbar-track {
          background: transparent;
        }
        :global(.approved-scroll)::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.14);
          border-radius: 999px;
        }
        :global(.approved-scroll):hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.26);
        }
        @keyframes approved-bubble-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :global(.approved-bubble) {
          animation: approved-bubble-in 260ms
            cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
        }
        @keyframes approved-section-in {
          from {
            opacity: 0;
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        :global(.approved-section) {
          animation: approved-section-in 320ms ease-out backwards;
        }
      `}</style>

      <div
        style={{
          flex: 1,
          width: '100%',
          background: '#1F4A38',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 22,
          padding: '24px 18px 22px',
          color: '#ffffff',
          boxShadow: '0 0 0 1px rgba(15, 59, 39, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            alignSelf: 'flex-start',
          }}
        >
          <div
            aria-hidden
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              background: '#ffffff',
              color: '#1F4A38',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={18} weight="bold" />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.72)',
            }}
          >
            Mock Clinician Review
          </span>
        </div>

        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
              color: '#ffffff',
            }}
          >
            Refill request ready for review
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              lineHeight: 1.45,
              color: 'rgba(255, 255, 255, 0.58)',
            }}
          >
            For the reviewing clinician — the patient does not see these
            notes.
          </div>
        </div>

        <div
          className="approved-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {hasParsedSoap ? (
            <SoapList sections={sections!} drugName={drugName} />
          ) : hasConversation ? (
            <>
              <SoapSectionBlock
                title={RECOMMENDATION_TITLE}
                letter={RECOMMENDATION_LETTER}
                body={recommendationBody}
                index={0}
                isFirst={true}
              />
              <ConversationSection turns={turns} index={1} />
            </>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.5,
                color: 'rgba(255, 255, 255, 0.78)',
              }}
            >
              {FALLBACK_BODY}
            </p>
          )}

          {hasParsedSoap && hasConversation && (
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: 14,
              }}
            >
              <button
                type="button"
                onClick={() => setShowConversation((v) => !v)}
                aria-expanded={showConversation}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  color: 'rgba(255, 255, 255, 0.78)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'color 0.18s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.78)';
                }}
              >
                <span>
                  {showConversation ? 'Hide conversation' : 'View conversation'}
                </span>
                <CaretDown
                  size={12}
                  weight="bold"
                  style={{
                    transform: showConversation
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                    transition: 'transform 0.18s ease-in-out',
                  }}
                />
              </button>
              {showConversation && (
                <div style={{ marginTop: 14 }}>
                  <ConversationStream turns={turns} />
                </div>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            type="button"
            disabled={isExiting}
            onClick={() => {
              if (isExiting) return;
              // 1. Post the patient-facing reply immediately so the new
              //    bot bubble appears in the chat while the card is
              //    still on screen.
              onApprove?.();
              // 2. Brief beat (≈220ms) so the message bubble has time to
              //    paint before the card starts lifting off — without
              //    this the user just sees two things move at once.
              // 3. Run the exit animation (340ms) and only then ask the
              //    parent to clear approval state, which unmounts us.
              window.setTimeout(() => {
                setIsExiting(true);
                window.setTimeout(() => {
                  onDismiss?.();
                }, 340);
              }, 220);
            }}
            style={{
              flex: 1,
              height: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 12,
              border: 'none',
              background: '#ffffff',
              color: '#1F4A38',
              fontSize: 15,
              fontWeight: 600,
              cursor: isExiting ? 'default' : 'pointer',
              transition: 'background 0.15s ease-in-out',
            }}
            onMouseEnter={(e) => {
              if (isExiting) return;
              e.currentTarget.style.background = '#EAF4EE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            <Check size={16} weight="bold" />
            Approve
          </button>
          <button
            type="button"
            onClick={onReject}
            style={{
              flex: 1,
              height: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.32)',
              background: 'transparent',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={16} weight="bold" />
            Reject
          </button>
        </div>

        <p
          style={{
            margin: '16px 0 0',
            color: 'rgba(255, 255, 255, 0.58)',
            fontSize: 14,
            fontStyle: 'italic',
            lineHeight: '20px',
            textAlign: 'center',
          }}
        >
          Note: the clinician review is simulated for demo purposes. No real
          doctor is reviewing this in the sandbox.
        </p>
      </div>
    </aside>
  );
}

function SoapList({
  sections,
  drugName,
}: {
  sections: SoapSection[];
  drugName?: string;
}) {
  const visible = sections.filter((s) => VISIBLE_SOAP_KEYS.includes(s.key));
  // The Plan section is replaced by a clinician-facing Recommendation —
  // a single deterministic line the reviewer can scan in under a second.
  const recommendationBody = `Approve refill for ${drugName ?? 'medication'}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {visible.map(({ key, body }, i) => (
        <SoapSectionBlock
          key={key}
          title={key}
          letter={key.charAt(0)}
          body={body}
          index={i}
          isFirst={i === 0}
        />
      ))}
      <SoapSectionBlock
        key={RECOMMENDATION_TITLE}
        title={RECOMMENDATION_TITLE}
        letter={RECOMMENDATION_LETTER}
        body={recommendationBody}
        index={visible.length}
        isFirst={visible.length === 0}
      />
    </div>
  );
}

function SoapSectionBlock({
  title,
  letter,
  body,
  index,
  isFirst,
}: {
  title: string;
  letter: string;
  body: string;
  index: number;
  isFirst: boolean;
}) {
  return (
    <section
      className="approved-section"
      style={{
        // 220ms base delay lets the card finish landing before the
        // SOAP sections cascade in on top — two-beat choreography.
        animationDelay: `${220 + index * 60}ms`,
        borderTop: isFirst ? 'none' : '1px solid rgba(255, 255, 255, 0.07)',
        paddingTop: isFirst ? 0 : 16,
        paddingBottom: 14,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 9,
          marginBottom: 8,
        }}
      >
        {/* Two-character monogram. The single uppercase letter (S/O/A/P)
            anchors each section to the SOAP convention and lets the
            heading sit in small caps with a calm typographic rhythm. */}
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: 5,
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          {letter}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.78)',
          }}
        >
          {title}
        </span>
      </div>
      {body ? (
        <SoapBody markdown={body} />
      ) : (
        <span
          style={{
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          Not provided
        </span>
      )}
    </section>
  );
}

// Renders the SOAP section body. Bodies arrive as markdown — bulleted
// lists with `**Label:**` leads and nested sub-bullets — so we lean on
// react-markdown and style the resulting elements to fit the dark card
// rather than trying to flatten the structure ourselves.
function SoapBody({ markdown }: { markdown: string }) {
  return (
    <div className="soap-body">
      <style jsx>{`
        .soap-body {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.86);
          word-break: break-word;
        }
        .soap-body :global(p) {
          margin: 0 0 8px;
        }
        .soap-body :global(p:last-child) {
          margin-bottom: 0;
        }
        .soap-body :global(ul),
        .soap-body :global(ol) {
          margin: 0 0 8px;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .soap-body :global(ul:last-child),
        .soap-body :global(ol:last-child) {
          margin-bottom: 0;
        }
        .soap-body :global(li) {
          padding-left: 2px;
        }
        .soap-body :global(li > ul),
        .soap-body :global(li > ol) {
          margin-top: 4px;
        }
        .soap-body :global(strong) {
          color: #ffffff;
          font-weight: 600;
        }
        .soap-body :global(em) {
          color: rgba(255, 255, 255, 0.92);
        }
        .soap-body :global(code) {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          padding: 1px 5px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        .soap-body :global(a) {
          color: #ffffff;
          text-decoration: underline;
          text-decoration-color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}

// Used when SOAP parsing yielded nothing usable. We borrow the
// SoapSectionBlock chrome (letter chip + small caps label, animation
// cascade) so the conversation lands as a peer to the Recommendation
// row above it rather than as a loose appendage.
function ConversationSection({
  turns,
  index,
}: {
  turns: Turn[];
  index: number;
}) {
  return (
    <section
      className="approved-section"
      style={{
        animationDelay: `${220 + index * 60}ms`,
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        paddingTop: 16,
        paddingBottom: 14,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 9,
          marginBottom: 10,
        }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: 5,
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          C
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.78)',
          }}
        >
          Conversation
        </span>
      </div>
      <ConversationStream turns={turns} />
    </section>
  );
}

function ConversationStream({ turns }: { turns: Turn[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {turns.map((turn, i) => (
        <Bubble key={i} turn={turn} index={i} />
      ))}
    </div>
  );
}

function Bubble({ turn, index }: { turn: Turn; index: number }) {
  const isPatient = turn.role === 'Patient';
  return (
    <div
      className="approved-bubble"
      style={{
        animationDelay: `${index * 45}ms`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isPatient ? 'flex-end' : 'flex-start',
        width: '100%',
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.5)',
          padding: '0 2px',
        }}
      >
        {turn.role}
      </span>
      <div
        style={{
          maxWidth: '86%',
          padding: '9px 13px',
          background: isPatient
            ? 'rgba(255, 255, 255, 0.16)'
            : 'rgba(255, 255, 255, 0.06)',
          borderRadius: isPatient
            ? '14px 14px 4px 14px'
            : '14px 14px 14px 4px',
          fontSize: 13,
          lineHeight: 1.5,
          color: isPatient
            ? '#ffffff'
            : 'rgba(255, 255, 255, 0.92)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          // Subtle inner stroke gives the August bubble a defined edge
          // against the dark card. Patient bubble is bright enough on
          // its own.
          boxShadow: isPatient
            ? 'none'
            : 'inset 0 0 0 1px rgba(255, 255, 255, 0.04)',
        }}
      >
        {turn.text}
      </div>
    </div>
  );
}
