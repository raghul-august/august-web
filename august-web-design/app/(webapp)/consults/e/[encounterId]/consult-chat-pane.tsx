'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CaretRightIcon,
  HeadsetIcon,
  IdentificationBadge,
  IdentificationCard,
  MapPin,
  Microphone,
  Paperclip,
  Pill,
  Plus,
  Stop,
  VideoCamera,
  ClockIcon
} from '@phosphor-icons/react';
import { FileText, X as CloseIcon } from 'lucide-react';
import {
  extractPrescribedProducts,
  getEncounter,
  getPatient,
  listEncounterMessages,
  markEncounterRead,
  sendMessage,
  type ChatLog,
  type ClinicianDetail,
  type EncounterDetail,
  type PatientRecord,
  type PrescribedProducts,
} from '@/services/consultations-service';
import { useWebPubSubConnection } from '@/hooks/use-webpubsub-connection';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { useCachedResource } from '@/hooks/use-cached-resource';
import { VoiceRecorderUI } from '@/components/consults/voice-recorder-ui';
import { VideoRecorderUI } from '@/components/chat/video-recorder-ui';
import { AudioWaveformPlayer } from '@/components/chat/audio-waveform-player';
import { ChatImage } from '@/components/chat/chat-image';
import { SummarySoapModal, type SummarySoapTab } from '@/components/chat/summary-soap-modal';
import { FileAttachmentPreview } from '@/components/chat/file-attachment-preview';
import { LinkPreviewCard } from '@/components/chat/link-preview-card';
import { LinkPreviewSlot } from '@/components/chat/link-preview-slot';
import { extractAllUrls, stripUrlFromText } from '@/utils/link-preview';
import { readCachedChatLogs, writeCachedChatLogs } from '@/utils/consult-chat-cache';
import { useLinkPreview } from '@/hooks/use-link-preview';
import { BeautifulLoader } from '../../../consult/_components';
import { trackTelehealth, getTelehealthBaseParams } from '@/services/telehealth-analytics';
import { track } from '@/services/analytics-service';
import { InPersonCareModal } from '../../../consult/steps/in-person-modal';

interface Props {
  encounterId: string;
  initialEncounter?: EncounterDetail;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const FIRST_DOCTOR_MESSAGE_NOTE = 'This is your first message to your doctor';

const ASSIGNED_STATUSES = new Set(['assigned', 'waiting', 'support', 'processing', 'completed']);

function isAssigned(status: string | null | undefined): boolean {
  return !!status && ASSIGNED_STATUSES.has(status);
}

function clinicianDisplayName(clinician: any): string {
  if (!clinician) return '';
  const first = clinician.first_name || '';
  const last = clinician.last_name || '';
  const suffix = clinician.suffix || '';
  const name = `${first} ${last}`.trim();
  if (!name) return 'your clinician';
  return suffix ? `${name} ${suffix}` : name;
}

// Used to group consecutive messages from the same visual sender so we
// only render the avatar on the last bubble of a streak. Prescription
// cards are injected with role='august' by the webhook but are
// authored by the doctor, so they share the 'clinician' streak.
function bubbleSenderKey(log: ChatLog): 'patient' | 'clinician' | 'support' | 'system' {
  if (log.role === 'patient') return 'patient';
  if (log.type === 'prescription') return 'clinician';
  if (log.role === 'clinician') return 'clinician';
  if (log.role === 'support') return 'support';
  return 'system';
}

function relativeDayLabel(d: Date, now: Date): string {
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((b - a) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function SummarySoapCard({ title, body, onOpen }: { title: string; body: string; onOpen: (tab: SummarySoapTab) => void }) {
  const text = stripMarkdown(body);
  const isSummary = title === 'Summary';
  const displayTitle = isSummary ? 'Visit Summary' : 'SOAP Note';
  const ctaLabel = isSummary ? 'Read full summary' : 'View full note';
  const iconBg = isSummary ? '#E8F2ED' : '#EFE5EC';
  const iconColor = isSummary ? '#206E55' : '#6B3D5C';

  return (
    <div className="consult-summary-card">
      {/* Header */}
      <div className="consult-summary-card__header">
        <div className="consult-summary-card__icon" style={{ background: iconBg }}>
          {isSummary ? (
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.398 5.602L11.461 1.664a.563.563 0 0 0-.398-.164H4.313a1.125 1.125 0 0 0-1.125 1.125v12.75A1.125 1.125 0 0 0 4.312 16.5h10.125a1.125 1.125 0 0 0 1.125-1.125V6a.563.563 0 0 0-.164-.398zM11.625 3.42 13.642 5.438h-2.017V3.42zm2.813 11.955H4.313V2.625h6.187V6a.562.562 0 0 0 .563.563h3.375v8.812zM12.188 9.375a.563.563 0 0 1-.563.563h-4.5a.562.562 0 1 1 0-1.125h4.5a.563.563 0 0 1 .563.562zm0 2.25a.563.563 0 0 1-.563.563h-4.5a.562.562 0 1 1 0-1.125h4.5a.562.562 0 0 1 .563.562z" fill={iconColor} />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.625 8.25c0-.155.063-.293.165-.398.105-.105.243-.165.398-.165h4.5c.155 0 .293.06.398.165.105.105.165.243.165.398 0 .155-.06.293-.165.398-.105.105-.243.165-.398.165h-4.5c-.155 0-.293-.06-.398-.165A.563.563 0 0 1 5.625 8.25zm.563 2.813h4.5c.155 0 .293-.06.398-.165.105-.105.165-.243.165-.398 0-.155-.06-.293-.165-.398-.105-.105-.243-.165-.398-.165h-4.5c-.155 0-.293.06-.398.165a.563.563 0 0 0 0 .796c.105.105.243.165.398.165zm2.25 1.125h-2.25c-.155 0-.293.06-.398.165a.562.562 0 1 0 .796.796c.105-.105.165-.243.165-.398 0-.155-.06-.293-.165-.398-.105-.105-.243-.165-.398-.165h2.25c.155 0 .293-.06.398-.165.105-.105.165-.243.165-.398 0-.155-.06-.293-.165-.398a.563.563 0 0 0-.398-.165zM15.188 5.625v7.642c0 .148-.03.294-.085.43a1.13 1.13 0 0 1-.244.388l-3.609 3.608a1.13 1.13 0 0 1-.388.244 1.12 1.12 0 0 1-.43.085H2.789a1.125 1.125 0 0 1-1.125-1.125V5.625a1.125 1.125 0 0 1 1.125-1.125h11.25a1.125 1.125 0 0 1 1.125 1.125zM2.789 16.875h7.313V13.5c0-.155.06-.293.165-.398.105-.105.243-.165.398-.165h3.375V5.625H2.789v11.25zm8.438-2.813v2.018l2.018-2.018h-2.018z" fill={iconColor} />
            </svg>
          )}
        </div>
        <span className="consult-summary-card__title">
          {displayTitle}
        </span>
        {!isSummary && (
          <span className="consult-summary-card__subtitle">(for doctor reference only)</span>
        )}
      </div>

      {/* Preview */}
      <div className="consult-summary-card__body">
        {text}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onOpen(isSummary ? 'summary' : 'soap')}
        className="consult-summary-card__cta"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <span
          className="consult-summary-card__cta-label"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 13,
            lineHeight: '20px',
            color: '#141515',
            textDecoration: 'underline',
          }}
        >
          {ctaLabel}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3l5 5-5 5" stroke="#141515" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export function ConsultChatPane({ encounterId, initialEncounter }: Props) {
  const [encounter, setEncounter] = useState<EncounterDetail | null>(initialEncounter ?? null);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cancelledModalOpen, setCancelledModalOpen] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const cached = readCachedChatLogs(encounterId);
    if (cached && cached.length > 0) {
      setChatLogs(cached);
    }
  }, [encounterId]);
  
  useEffect(() => {
    if (chatLogs.length === 0) return;
    writeCachedChatLogs(encounterId, chatLogs);
  }, [encounterId, chatLogs]);
  // Confirms the component mounts at all on hard refresh. If you don't see
  // this log, the route never reached us (auth gate, error boundary, etc.).
  useEffect(() => {
    console.info('[ConsultChatPane] mounted', { encounterId });
    trackTelehealth('doctor_consult_chat_viewed');
  }, [encounterId]);

  // Users who deep-link straight to /consults/e/<id> (or navigate here from
  // /chat, whose unmount tears the connection down) would otherwise miss
  // the live consultations.* events.
  useWebPubSubConnection('ConsultChatPane');

  // Initial fetch on mount. No polling — subsequent updates come from
  // WebPubSub events pushed by the MDI webhook handler. We pull two things
  // in parallel:
  //   1. /get-encounter — encounter + diff-diag + clinician (local-first, MDI
  //      fallback only when the local clinicians row is missing).
  //   2. Local chat logs.
  // We trust the webhook → local DB pipeline as the source of truth; no
  // separate MDI reconcile call on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [enc, logs] = await Promise.all([
          getEncounter(encounterId),
          listEncounterMessages(encounterId),
        ]);
        if (cancelled) return;
        setEncounter(enc);
        setChatLogs(logs);
      } catch (err: any) {
        if (cancelled) return;
        // If we already have an encounter (from initialEncounter / cache) or
        // chat logs hydrated from localStorage, keep showing them instead of
        // throwing up an error wall — the user is probably offline and stale
        // data beats nothing. Only block when we have nothing to render.
        const hasCachedChatLogs = readCachedChatLogs(encounterId) !== null;
        if (!initialEncounter && !hasCachedChatLogs) {
          setError(err?.response?.data?.error || err?.message || 'Failed to load consult');
        } else {
          console.warn('[ConsultChatPane] Background refresh failed — showing cached state', err);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [encounterId]);


  // WebPubSub: react to backend-pushed events.
  //   consultations.encounter.assigned     → status flips, clinician details land
  //   consultations.encounter.status       → status flips (support / waiting / completed / cancelled)
  //   consultations.message.created        → new chat log row (clinician message, etc.)
  //   consultations.prescribed_products    → a prescription chat log was inserted on the
  //                                         server; refetch logs so we pick it up (the
  //                                         get-telehealth-chat-logs handler server-side
  //                                         joins prescribed_products into the row's metadata).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        type?: string;
        encounter_id?: string;
        status?: string;
        clinician?: any;
        message?: ChatLog;
      };
      if (!detail?.type || detail.encounter_id !== encounterId) return;

      if (detail.type === 'consultations.encounter.assigned') {
        // Optimistically apply the slim event payload so the header flips
        // immediately, then refetch /get-encounter to pull the full clinician
        // profile (bio, npi, licensed_states, etc.) the doctor modal needs.
        setEncounter((prev) =>
          prev
            ? {
                ...prev,
                status: 'assigned',
                clinician: detail.clinician || prev.clinician,
                clinician_id:
                  detail.clinician?.clinician_id || detail.clinician?.id || prev.clinician_id,
              }
            : prev
        );
        getEncounter(encounterId).then((full) => {
          setEncounter((prev) => (prev ? { ...prev, ...full } : full));
        }).catch(() => {});
      } else if (detail.type === 'consultations.encounter.status' && detail.status) {
        setEncounter((prev) => (prev ? { ...prev, status: detail.status as string } : prev));
        if (detail.status === 'cancelled') {
          setCancelledModalOpen(true);
        }
      } else if (detail.type === 'consultations.prescribed_products') {
        // The realtime event already carries the full prescribed_products
        // snapshot — drop it straight into the chat log array. Use a stable
        // synthetic id keyed by encounter so a follow-up event replaces the
        // existing card with the latest snapshot. On refresh, the canonical
        // server row (with its real UUID) takes over.
        const eventDetail = detail as unknown as {
          encounter_id: string;
          prescribed_products: PrescribedProducts;
        };
        const syntheticId = `prescription:${eventDetail.encounter_id}`;
        const nextMetadata = {
          encounter_id: eventDetail.encounter_id,
          prescribed_products: eventDetail.prescribed_products,
        };
        setChatLogs((prev) => {
          const idx = prev.findIndex(
            (m) => m.id === syntheticId || m.type === 'prescription',
          );
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], metadata: nextMetadata };
            return next;
          }
          return [
            ...prev,
            {
              id: syntheticId,
              user_id: '',
              encounter_id: eventDetail.encounter_id,
              role: 'august',
              type: 'prescription',
              message: '',
              files: [],
              metadata: nextMetadata,
              timestamp: new Date().toISOString(),
            } as ChatLog,
          ];
        });
      } else if (detail.type === 'consultations.message.created' && detail.message) {
        const msg = detail.message;
        setChatLogs((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          // If this is the canonical version of an optimistic patient message
          // we already rendered, swap it into the same array slot. We keep
          // the optimistic `files` (blob: URLs from URL.createObjectURL) so
          // <img src> doesn't change — otherwise the browser refetches the
          // image from the server URL and the user sees a flicker.
          //
          // Match on role + temp- id prefix only (no text comparison): the
          // composer locks during send so at most one optimistic patient
          // bubble is ever in-flight. Trying to match on `message` breaks for
          // image-only sends, where MDI may return a filename or null but the
          // optimistic has an empty string.
          if (msg.role === 'patient') {
            const idx = prev.findIndex(
              (m) =>
                typeof m.id === 'string' &&
                m.id.startsWith('temp-') &&
                m.role === 'patient',
            );
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = { ...msg, files: prev[idx].files };
              return next;
            }
          }
          return [...prev, msg];
        });
      }
    };
    window.addEventListener('consultations.event', handler as EventListener);
    return () => window.removeEventListener('consultations.event', handler as EventListener);
  }, [encounterId]);

  useEffect(() => {
    if (encounter?.status === 'cancelled') setCancelledModalOpen(true);
  }, [encounter?.status]);

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 text-sm text-text-secondary">
        {error}
      </main>
    );
  }

  if (!encounter) {
    return <BeautifulLoader label="Loading…" fullScreen />;
  }

  return (
    <>
      <Pane encounter={encounter} chatLogs={chatLogs} setChatLogs={setChatLogs} />
      {cancelledModalOpen && (
        <InPersonCareModal
          onAcknowledge={() => setCancelledModalOpen(false)}
          onDismiss={() => setCancelledModalOpen(false)}
        />
      )}
    </>
  );
}

function NewMessagesDivider({ count }: { count: number }) {
  const label =
    count > 0
      ? count === 1
        ? '1 new message'
        : `${count} new messages`
      : 'New messages';
  return (
    <div
      role="separator"
      aria-label={label}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        margin: '54px 0',
        width: '100%',
      }}
    >
      <div className="consult-joined-line" />
      <span className="consult-joined-text">{label}</span>
      <div className="consult-joined-line" />
    </div>
  );
}

function NewMessagesPill({ count, onClick }: { count: number; onClick: () => void }) {
  const label = count === 1 ? '1 new message' : `${count} new messages`;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'calc(100% + 8px)',
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={{
          pointerEvents: 'auto',
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          borderRadius: 8,
          background: 'var(--color-surface-elevated, #FFF)',
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-tertiary, #7A7468)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '18px',
          whiteSpace: 'nowrap',
        }}
        aria-label={label}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
          <path d="M6.69023 9.93478L2.31523 5.55977C2.27458 5.51913 2.24233 5.47087 2.22034 5.41776C2.19834 5.36465 2.18701 5.30773 2.18701 5.25024C2.18701 5.19276 2.19834 5.13584 2.22034 5.08273C2.24233 5.02962 2.27458 4.98136 2.31523 4.94071C2.35587 4.90006 2.40413 4.86782 2.45724 4.84582C2.51035 4.82382 2.56727 4.8125 2.62476 4.8125C2.68224 4.8125 2.73916 4.82382 2.79228 4.84582C2.84538 4.86782 2.89364 4.90006 2.93429 4.94071L6.99976 9.00673L11.0652 4.94071C11.1473 4.85862 11.2587 4.8125 11.3748 4.8125C11.4909 4.8125 11.6022 4.85862 11.6843 4.94071C11.7664 5.02281 11.8125 5.13415 11.8125 5.25024C11.8125 5.36634 11.7664 5.47768 11.6843 5.55978L7.30929 9.93478C7.26866 9.97545 7.22041 10.0077 7.16729 10.0297C7.11418 10.0518 7.05725 10.0631 6.99976 10.0631C6.94226 10.0631 6.88533 10.0518 6.83222 10.0297C6.77911 10.0077 6.73086 9.97545 6.69023 9.93478Z" fill="#7A7468"/>
        </svg>
        {label}
        
      </button>
    </div>
  );
}

function Pane({
  encounter,
  chatLogs,
  setChatLogs,
}: {
  encounter: EncounterDetail;
  chatLogs: ChatLog[];
  setChatLogs: React.Dispatch<React.SetStateAction<ChatLog[]>>;
}) {
  const router = useRouter();
  const onViewPrescriptions = () => {
    trackTelehealth('view_prescription_clicked');
    router.push(`/consults/e/${encounter.id}/prescriptions`);
  };
  const assigned = isAssigned(encounter.status);
  const doctorName = clinicianDisplayName(encounter.clinician);
  // Statuses like 'paid'/'verified' lag behind the assignment webhook, so
  // gate the header pill on clinician presence (matches the sidebar) instead
  // of encounter.status — otherwise it shows "Awaiting doctor" even after
  // a clinician is attached.
  const hasDoctor = !!doctorName;
  const specialty = encounter.clinician?.speciality?.trim() || '';
  const topic = encounter.visit_reason || 'Online doctor consult';

  // Shared cache key with PostPaymentFlow — same fetch hydrates both.
  const patResource = useCachedResource<PatientRecord | null>(
    encounter.patient_id ? `pat:${encounter.patient_id}` : null,
    () => getPatient(encounter.patient_id as string),
  );
  const patientName = [patResource.value?.legal_first_name, patResource.value?.legal_last_name]
    .filter(Boolean)
    .join(' ');

  const searchParams = useSearchParams();
  const msgParam = searchParams ? searchParams.get('msg') ?? '' : '';

  const [showWaitingBanner, setShowWaitingBanner] = useState(true);
  const [input, setInput] = useState(msgParam);
  const [files, setFiles] = useState<File[]>([]);
  // Unified Visit summary / SOAP notes modal — null when closed, otherwise the tab to open on.
  const [summarySoapTab, setSummarySoapTab] = useState<SummarySoapTab | null>(null);

  useEffect(() => {
    if (msgParam) {
      setInput(msgParam);
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state }, '', newUrl);
    }
  }, [msgParam]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [doctorProfileOpen, setDoctorProfileOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const voice = useVoiceRecorder();

  // Reset banner whenever we transition into the assigned state.
  useEffect(() => {
    if (assigned) setShowWaitingBanner(true);
  }, [assigned, encounter.clinician_id]);

  const stickyBottomRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);
  const [dividerVisible, setDividerVisible] = useState(true);
  const firstUnreadComputedRef = useRef(false);
  const firstUnreadSeenRef = useRef(false);
  const [pillCount, setPillCount] = useState(0);
  const showNewPill = pillCount > 0;
  const tabVisibleRef = useRef<boolean>(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true,
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let prevScrollTop = el.scrollTop;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distanceFromBottom < 160;
      stickyBottomRef.current = atBottom;
      setIsAtBottom(atBottom);
      if (atBottom) setPillCount(0);
      if (el.scrollTop + 4 < prevScrollTop) {
        setDividerVisible(false);
      }
      prevScrollTop = el.scrollTop;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (stickyBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatLogs.length, assigned]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    if (!inner || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (stickyBottomRef.current) el.scrollTop = el.scrollHeight;
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onMediaLoad = () => {
      if (stickyBottomRef.current) el.scrollTop = el.scrollHeight;
    };
    el.addEventListener('load', onMediaLoad, true);
    return () => el.removeEventListener('load', onMediaLoad, true);
  }, []);

  useEffect(() => {
    if (firstUnreadComputedRef.current) return;
    if (chatLogs.length === 0) return;
    firstUnreadComputedRef.current = true;
    const firstNew = chatLogs.find(
      (m) => m.role !== 'patient' && !m.read_at,
    );
    if (firstNew) setFirstUnreadId(firstNew.id);
  }, [chatLogs]);

  // Count of non-patient messages from the divider position onward — labels
  // the "New messages" separator as e.g. "3 new messages". We don't filter
  // on read_at here: the IntersectionObserver stamps read_at as soon as a
  // bubble scrolls into view, so by the time the divider is visible the
  // unread bubbles have already been marked read and the count would drop
  // to 0. Counting all non-patient messages from firstUnreadId on keeps the
  // label in sync with the pill (which counts the same population) and
  // makes it match the bubble grouping.
  const unreadDividerCount = useMemo(() => {
    if (!firstUnreadId) return 0;
    const startIdx = chatLogs.findIndex((m) => m.id === firstUnreadId);
    if (startIdx < 0) return 0;
    let n = 0;
    for (let i = startIdx; i < chatLogs.length; i++) {
      if (chatLogs[i].role !== 'patient') n++;
    }
    return n;
  }, [chatLogs, firstUnreadId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const idsToStampRead: string[] = [];
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.logId;
          if (!id) continue;
          if (entry.isIntersecting) {
            const log = chatLogs.find((m) => m.id === id);
            if (
              log &&
              log.role !== 'patient' &&
              !log.read_at &&
              tabVisibleRef.current
            ) {
              idsToStampRead.push(id);
            }
            if (
              firstUnreadId &&
              id === firstUnreadId &&
              tabVisibleRef.current
            ) {
              firstUnreadSeenRef.current = true;
            }
            if (log && log.role !== 'patient' && tabVisibleRef.current) {
              setPillCount(0);
            }
          } else if (
            firstUnreadId &&
            id === firstUnreadId &&
            firstUnreadSeenRef.current
          ) {
            setDividerVisible(false);
          }
        }
        if (idsToStampRead.length > 0) {
          const nowIso = new Date().toISOString();
          const stampSet = new Set(idsToStampRead);
          setChatLogs((prev) =>
            prev.map((m) =>
              stampSet.has(m.id) && !m.read_at ? { ...m, read_at: nowIso } : m,
            ),
          );
          markEncounterRead(encounter.id).catch(() => {});
          window.dispatchEvent(
            new CustomEvent('consults.unread.changed', {
              detail: { encounterId: encounter.id, has_unread: false },
            }),
          );
        }
      },
      { root: el, threshold: 0.5 },
    );
    const observeAll = () => {
      el.querySelectorAll('[data-log-id]').forEach((node) => observer.observe(node));
    };
    observeAll();
    const onVisChange = () => {
      tabVisibleRef.current = document.visibilityState === 'visible';
      if (document.visibilityState === 'visible') {
        observer.disconnect();
        observeAll();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisChange);
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisChange);
      }
      observer.disconnect();
    };
  }, [chatLogs, firstUnreadId, encounter.id, setChatLogs]);

  const lastChatLogIdRef = useRef<string | null>(null);
  const lastChatLogCountRef = useRef<number>(0);
  useEffect(() => {
    const prevCount = lastChatLogCountRef.current;
    lastChatLogCountRef.current = chatLogs.length;
    if (chatLogs.length === 0) {
      lastChatLogIdRef.current = null;
      return;
    }
    const newest = chatLogs[chatLogs.length - 1];
    const previousNewestId = lastChatLogIdRef.current;
    lastChatLogIdRef.current = newest.id;
    if (prevCount === 0) return; // initial fetch — not a "new arrival"
    if (chatLogs.length <= prevCount) return;
    if (newest.id === previousNewestId) return;
    if (newest.role === 'patient') return;

    if (!tabVisibleRef.current && (!firstUnreadId || !dividerVisible)) {
      setFirstUnreadId(newest.id);
      setDividerVisible(true);
      firstUnreadSeenRef.current = false;
    }

    if (stickyBottomRef.current) return; // bottom is sticky, user will see it
    setPillCount((c) => c + 1);
  }, [chatLogs, firstUnreadId, dividerVisible]);

  const handleJumpToNew = () => {
    const el = scrollRef.current;
    if (!el) return;
    const targetId =
      firstUnreadId && dividerVisible ? firstUnreadId : lastChatLogIdRef.current;
    const target = targetId
      ? (el.querySelector(`[data-log-id="${targetId}"]`) as HTMLElement | null)
      : null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
    setPillCount(0);
  };

  async function handleSend() {
    const text = input.trim();
    if (!text && files.length === 0) return;
    const sentFiles = files;
    const sentText = text;

    // Optimistically render the message immediately — don't wait for the
    // backend round-trip (MDI file upload, MDI message create, blob upload,
    // chat-log insert). The composer clears straight away; if the server
    // ultimately fails we'll roll back and surface the error.
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimistic: ChatLog = {
      id: tempId,
      user_id: '',
      encounter_id: encounter.id,
      role: 'patient',
      type: sentFiles.length ? (sentText ? 'text' : 'file') : 'text',
      message: sentText,
      files: sentFiles.map((f) => ({
        id: tempId,
        url: URL.createObjectURL(f),
        mime_type: f.type,
        name: f.name,
      })),
      metadata: { optimistic: true },
      timestamp: new Date().toISOString(),
    };
    setChatLogs((prev) => [...prev, optimistic]);
    setInput('');
    setFiles([]);
    setDividerVisible(false);
    setPillCount(0);
    setSending(true);
    setSendError(null);
    try {
      await sendMessage({
        encounter_id: encounter.id,
        text: sentText || undefined,
        files: sentFiles.length ? sentFiles : undefined,
      });
      track('send_message', {
        ...getTelehealthBaseParams(),
        source: 'telehealth_doctor_chat',
        has_attachment: sentFiles.length > 0,
      });
      if (sentFiles.length > 0) {
        track('uploaded_media', {
          ...getTelehealthBaseParams(),
          source: 'telehealth_doctor_chat',
          file_type: sentFiles[0]?.type ?? '',
        });
      }
      // Don't refetch on success — the optimistic message (with its blob: URL
      // for image previews) stays in place so the <img> doesn't blink when
      // the src switches to a server URL. The canonical row arrives via
      // WebPubSub and the handler swaps it in while preserving the blob URL.
    } catch (err: any) {
      console.error(err);
      // Roll back the optimistic row + restore composer state so the user
      // can retry, and surface the error visibly. (Was previously swallowed —
      // user kept clicking, MDI got 4 copies, our DB got 0.)
      setChatLogs((prev) => prev.filter((m) => m.id !== tempId));
      setInput(sentText);
      setFiles(sentFiles);
      setSendError(err?.response?.data?.error || err?.message || 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  }

  // Voice send: VoiceRecorderUI hands us a WAV File; we mirror handleSend's
  // optimistic-insert + MDI send flow, just with a single voice file and no
  // text. WebPubSub will swap in the canonical row.
  async function handleSendVoice(file: File): Promise<void> {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimistic: ChatLog = {
      id: tempId,
      user_id: '',
      encounter_id: encounter.id,
      role: 'patient',
      type: 'file',
      message: '',
      files: [{
        id: tempId,
        url: URL.createObjectURL(file),
        mime_type: file.type,
        name: file.name,
      }],
      metadata: { optimistic: true },
      timestamp: new Date().toISOString(),
    };
    setChatLogs((prev) => [...prev, optimistic]);
    setDividerVisible(false);
    setPillCount(0);
    setSending(true);
    setSendError(null);
    try {
      await sendMessage({ encounter_id: encounter.id, files: [file] });
      track('voice_message_sent', {
        ...getTelehealthBaseParams(),
        source: 'telehealth_doctor_chat',
      });
    } catch (err: any) {
      setChatLogs((prev) => prev.filter((m) => m.id !== tempId));
      setSendError(err?.response?.data?.error || err?.message || 'Failed to send voice message.');
      throw err;
    } finally {
      setSending(false);
    }
  }

  async function handleVoiceToggle() {
    if (voice.isRecording) {
      const blob = await voice.stopRecording();
      if (blob && blob.size > 0) {
        const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
        const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type || 'audio/webm' });
        setFiles((arr) => [...arr, file]);
      }
      return;
    }
    await voice.startRecording();
  }

  function formatRecordingDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Group chat logs by day for the date chips.
  // Filter out the role='august' bubbles that just echo the encounter's
  // summary / soap_note — those already render as styled cards above.
  const sortedChatLogs = useMemo(() => {
    return [...chatLogs].sort((a, b) => {
      const ta = Date.parse(a.timestamp);
      const tb = Date.parse(b.timestamp);
      if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
      return ta - tb;
    });
  }, [chatLogs]);

  const grouped = useMemo(() => {
    const summary = encounter.summary?.trim();
    const soap = encounter.soap_note?.trim();
    const visible = !summary && !soap
      ? sortedChatLogs
      : sortedChatLogs.filter((log) => {
          if (log.role !== 'august') return true;
          const msg = log.message?.trim() ?? '';
          if (summary && msg.includes(summary)) return false;
          if (soap && msg.includes(soap)) return false;
          return true;
        });
    return groupByDay(visible);
  }, [sortedChatLogs, encounter.summary, encounter.soap_note]);
  const firstPatientLogId = useMemo(
    () => sortedChatLogs.find((m) => m.role === 'patient')?.id ?? null,
    [sortedChatLogs],
  );
  const now = new Date();

  return (
    <main className="flex-1 flex flex-col h-full bg-surface-page">
      <h1 className="sr-only">Doctor Consultation</h1>

      {/* Header: visit reason + status badge, doctor • specialty • response time, kebab menu */}
      <style jsx global>{`
        .consult-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          min-height: 95px;
          padding: 20px 32px;
          background: #F3F1EB;
          border-bottom: 0.5px solid #E5E2DA;
          box-sizing: border-box;
        }
        .consult-header--desktop {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }
        .consult-header--mobile {
          display: none;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }
        .consult-header__topic {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 18px;
          line-height: 28px;
          color: #141515;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
        }
        .consult-header__badge-text {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 14px;
          line-height: 18px;
        }
        .consult-header__doctor-btn {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 16px;
          line-height: 23px;
          letter-spacing: -0.2px;
          color: #5A554A;
          text-decoration: underline;
        }
        .consult-header__meta-text {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 20px;
          color: #7A7468;
        }
        .consult-header__row2 {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .consult-header__meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .consult-header__kebab {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .consult-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px;
            gap: 10px;
            min-height: auto;
            position: relative;
          }
          .consult-header--desktop {
            display: none !important;
          }
          .consult-header--mobile {
            display: flex !important;
          }
          .consult-header__content {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
            width: 100%;
            padding-right: 44px;
          }
          .consult-header__topic {
            font-size: 13px;
            line-height: 20px;
            font-weight: 400;
          }
          .consult-header__badge-text {
            font-size: 12px;
            line-height: 16px;
            font-weight: 400;
          }
          .consult-header__doctor-btn {
            font-size: 13px;
            line-height: 20px;
            letter-spacing: 0;
          }
          .consult-header__meta-text {
            font-size: 12px;
            line-height: 16px;
          }
          .consult-header__row2 {
            gap: 12px;
          }
          .consult-header__meta-row {
            gap: 8px;
          }
          .consult-header__kebab {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 32px;
            height: 32px;
          }
        }
        .consult-input-textarea {
          font-size: 16px;
        }
        .consult-input-textarea::placeholder {
          color: #4E5553 !important;
          font-size: 15px !important;
          font-weight: 400 !important;
        }
        @media (min-width: 1024px) {
          .consult-input-textarea {
            font-size: 15px;
          }
          .consult-input-textarea::placeholder {
            font-size: 15px !important;
          }
        }
        /* Mobile full-screen chat layout */
        .consult-bubble-text {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 18px;
          line-height: 28px;
          color: #141515;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .consult-doctor-initials {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 14px;
          line-height: 18px;
          color: #7A7468;
        }
        .consult-joined-line {
          flex: 1;
          height: 0;
          border-top: 0.5px solid #A8A39A;
        }
        .consult-joined-text {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 15px;
          line-height: 23px;
          letter-spacing: -0.01em;
          color: #A8A39A;
          white-space: nowrap;
        }
        .consult-chat-body {
          padding-left: 16px;
          padding-right: 24px;
        }
        .consult-composer-wrap {
          padding-left: 16px;
          padding-right: 24px;
          padding-bottom: 4px;
        }
        /* Summary / SOAP card */
        .consult-summary-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 24px;
          gap: 16px;
          width: 100%;
          max-width: 639px;
          background: #FFFFFF;
          border: 0.5px solid #E5E2DA;
          border-radius: 20px;
          box-sizing: border-box;
        }
        .consult-summary-card__header {
          display: flex;
          align-items: center;
          gap: 8px;
          align-self: stretch;
          min-width: 0;
        }
        .consult-summary-card__icon {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .consult-summary-card__title {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 20px;
          line-height: 24px;
          letter-spacing: -0.4px;
          color: #141515;
        }
        .consult-summary-card__subtitle {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 20px;
          color: #A8A39A;
          white-space: nowrap;
        }
        .consult-summary-card__body {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 15px;
          line-height: 24px;
          color: #5A554A;
          align-self: stretch;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .consult-cards-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 16px;
          margin-bottom: 16px;
          width: 100%;
        }
        .consult-prescription-row {
          width: 100%;
        }
        /* Waiting banner */
        .consult-waiting-banner {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          padding: 16px 20px;
          gap: 12px;
          background: #EEF5FA;
          border: 0.5px solid #E5EEF2;
          box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.04);
          border-radius: 20px;
          margin-bottom: 12px;
        }
        .consult-waiting-banner__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 24px;
          flex-shrink: 0;
        }
        .consult-waiting-banner__title {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 15px;
          line-height: 24px;
          color: #3D6B7A;
        }
        .consult-waiting-banner__body {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 20px;
          color: #3D6B7A;
        }
        .consult-waiting-banner__body-mobile {
          display: none;
        }
        .consult-waiting-banner__close {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .consult-bubble-text {
            font-size: 15px;
            line-height: 24px;
          }
          .consult-doctor-initials {
            font-size: 15px;
            line-height: 24px;
          }
          .consult-joined-line {
            /* full width on mobile too, matching the chat list */
          }
          .consult-joined-text {
            font-size: 13px;
            line-height: 20px;
            letter-spacing: 0;
          }
          .consult-chat-body {
            padding-left: 16px;
            padding-right: 16px;
          }
          .consult-composer-wrap {
            padding-left: 16px;
            padding-right: 16px;
          }
          .consult-cards-wrap {
            align-items: flex-end;
            gap: 15px;
            margin-bottom: 24px;
          }
          .consult-summary-card {
            width: min(322px, calc(100vw - 36px));
            min-height: 168px;
            flex: none;
            padding: 16px;
            gap: 12px;
          }
          .consult-summary-card__header {
            width: 100%;
            align-items: baseline;
            gap: 8px;
            overflow: hidden;
          }
          .consult-summary-card__icon {
            width: 28px;
            height: 28px;
            align-self: center;
          }
          .consult-summary-card__title {
            font-size: 18px;
            line-height: 24px;
            letter-spacing: 0;
            flex-shrink: 0;
          }
          .consult-summary-card__subtitle {
            font-family: 'Inter', sans-serif;
            color: #A8A39A;
            font-weight: 400;
            font-size: 11px;
            line-height: 16px;
            letter-spacing: 0;
            white-space: normal;
            min-width: 0;
          }
          .consult-summary-card__body {
            font-size: 13px;
            line-height: 20px;
            min-height: 60px;
            max-height: 60px;
            -webkit-line-clamp: 3;
          }
          .consult-summary-card__cta {
            height: 20px;
          }
          .consult-summary-card__cta-label {
            font-size: 13px !important;
            line-height: 20px !important;
          }
          .consult-prescription-row {
            width: min(358px, calc(100vw - 32px));
            max-width: none !important;
          }
          .consult-prescription-card {
            flex: 1 1 auto !important;
            width: min(314px, calc(100vw - 60px)) !important;
            min-width: 0 !important;
            max-width: none !important;
            padding: 16px !important;
            gap: 12px !important;
            border-radius: 20px !important;
          }
          .consult-prescription-card__intro {
            gap: 0 !important;
            max-width: 100%;
          }
          .consult-prescription-card__title {
            font-size: 18px !important;
            line-height: 24px !important;
            overflow-wrap: anywhere;
          }
          .consult-prescription-card__subtitle {
            font-size: 13px !important;
            line-height: 20px !important;
          }
          .consult-prescription-card__body {
            gap: 20px !important;
          }
          .consult-prescription-card__meds {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .consult-prescription-card__meds-label {
            gap: 8px !important;
          }
          .consult-prescription-card__meds-icon {
            width: 24px !important;
            height: 24px !important;
            border-radius: 6px !important;
          }
          .consult-prescription-card__meds-icon svg {
            width: 12px;
            height: 12px;
          }
          .consult-prescription-card__meds-title {
            font-size: 14px !important;
            line-height: 18px !important;
          }
          .consult-prescription-card__chips {
            width: 100% !important;
            gap: 8px 4px !important;
          }
          .consult-prescription-card__chip {
            height: 28px !important;
            padding: 6px 12px !important;
            font-size: 12px !important;
            line-height: 16px !important;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .consult-prescription-card__pharmacy {
            align-items: flex-start !important;
            gap: 4px !important;
          }
          .consult-prescription-card__pharmacy svg {
            flex: 0 0 16px;
            margin-top: 2px;
          }
          .consult-prescription-card__pharmacy-text {
            font-size: 13px !important;
            line-height: 20px !important;
          }
          .consult-prescription-card__footer {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }
          .consult-prescription-card__doctor {
            gap: 2px !important;
          }
          .consult-prescription-card__doctor-name {
            font-size: 15px !important;
            line-height: 24px !important;
          }
          .consult-prescription-card__date {
            font-size: 13px !important;
            line-height: 20px !important;
          }
          .consult-prescription-card__button {
            width: 100% !important;
            height: 52px !important;
            gap: 4px !important;
            padding: 12px 24px !important;
          }
          .consult-prescription-card__button-label {
            font-size: 16px !important;
            line-height: 20px !important;
            white-space: nowrap;
          }
          .consult-waiting-banner {
            position: relative;
            width: 100%;
            box-sizing: border-box;
            padding: 12px 40px 12px 12px;
            gap: 10px;
            border-radius: 16px;
          }
          .consult-waiting-banner > svg {
            width: 20px;
            height: 20px;
            flex: 0 0 20px;
            margin-top: 1px;
          }
          .consult-waiting-banner__icon {
            height: 20px;
          }
          .consult-waiting-banner__title {
            font-size: 14px;
            line-height: 20px;
            font-weight: 500;
            overflow-wrap: anywhere;
          }
          .consult-waiting-banner__body {
            font-size: 12px;
            line-height: 18px;
            overflow-wrap: anywhere;
          }
          .consult-waiting-banner__body-desktop {
            display: none;
          }
          .consult-waiting-banner__body-mobile {
            display: inline;
          }
          .consult-waiting-banner__close {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 24px;
            height: 24px;
          }
        }
        @media (min-width: 641px) {
          .consult-chat-body {
            padding-left: 24px;
            padding-right: 24px;
          }
          .consult-composer-wrap {
            padding-left: 24px;
            padding-right: 24px;
          }
        }

        /* WhatsApp-style File Attachment Previews */
        .file-preview-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4px;
          gap: 4px;
          position: relative;
          width: 288px;
          background: #FFFFFF;
          border-radius: 12px;
          border: 0.5px solid #E5E2DA;
          box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.04);
          box-sizing: border-box;
          overflow: hidden;
        }
        .file-preview-card.no-caption {
          height: 64px;
        }
        .file-preview-card.has-caption {
          min-height: 100px;
          height: auto;
        }
        .file-preview-card__header-link {
          display: block;
          width: 100%;
          text-decoration: none;
        }
        .file-preview-card__header {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 8px;
          gap: 10px;
          width: 280px;
          height: 56px;
          background: #F3F1EB;
          border-radius: 8px;
          box-sizing: border-box;
          transition: background-color 0.2s ease;
        }
        .file-preview-card__header:hover {
          background: #EAE7DF;
        }
        .file-preview-card__icon-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 6px;
          color: #5A554A;
        }
        .file-preview-card__icon {
          color: #5A554A;
        }
        .file-preview-card__info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 0px;
          gap: 2px;
          width: 216px;
          height: 40px;
          min-width: 0;
        }
        .file-preview-card__filename {
          width: 100%;
          height: 18px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 14px;
          line-height: 18px;
          color: #141515;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: left;
        }
        .file-preview-card__extension {
          height: 20px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 20px;
          color: #A8A39A;
          text-align: left;
        }
        .file-preview-card__caption {
          display: block;
          padding: 6px 4px 6px 8px;
          width: 100%;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 15px;
          line-height: 24px;
          color: #141515;
          word-break: break-word;
          text-align: left;
        }
      `}</style>
      <header className="consult-header">
        {/* ─── DESKTOP layout (hidden on mobile) ─── */}
        <div className="consult-header__content consult-header--desktop">
          {/* Row 1: topic only */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, maxWidth: '100%', minWidth: 0 }}>
            <div className="consult-header__topic">
              {topic}
            </div>
          </div>

          {/* Row 2: doctor name OR awaiting doctor badge */}
          <div className="consult-header__meta-row" style={{ width: '100%' }}>
            {hasDoctor ? (
              <button
                type="button"
                onClick={() => setDoctorProfileOpen(true)}
                className="consult-header__doctor-btn"
              >
                {doctorName}
              </button>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '2px 4px',
                  gap: 4,
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: '#A8A39A',
                    borderRadius: '50%',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span
                  className="consult-header__badge-text"
                  style={{ color: '#7A7468' }}
                >
                  Awaiting doctor
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ─── MOBILE layout (hidden on desktop) ─── */}
        <div className="consult-header__content consult-header--mobile">
          {/* Row 1: title */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8, maxWidth: '100%', minWidth: 0 }}>
            <div className="consult-header__topic">
              {topic}
            </div>
          </div>

          {/* Row 2: doctor name + status badge */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              {hasDoctor && (
                <button
                  type="button"
                  onClick={() => setDoctorProfileOpen(true)}
                  className="consult-header__doctor-btn"
                >
                  {doctorName}
                </button>
              )}
              {!hasDoctor && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2px 4px',
                    gap: 4,
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      background: '#A8A39A',
                      borderRadius: '50%',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="consult-header__badge-text"
                    style={{ color: '#7A7468' }}
                  >
                    Awaiting doctor
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 relative min-h-0">
        <div
          ref={scrollRef}
          className={`absolute inset-0 overflow-y-auto ${assigned && showWaitingBanner ? '' : ''}`}
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {/* Wrapper pins short threads to the bottom of the viewport while
              still allowing long threads to scroll top-anchored. The flex-1
              spacer expands to fill leftover height when messages are sparse
              and collapses to 0 once content overflows. Without this, threads
              with 2–3 messages render top-aligned with a large empty gap above
              the composer (browser-dependent height resolution made it look OK
              on some browsers and broken on others). */}
          <div className="min-h-full flex flex-col">
            <div className="flex-1" />
            <div className="max-w-3xl mx-auto w-full consult-chat-body">
            {/* Today chip — uses encounter.created_at relative to now. The
                summary + SOAP notes themselves are inserted as a role='august'
                chat log by the DL upload handler, so they render as a regular
                system bubble in the message list below. No need to also show
                them as standalone styled cards here. */}
            <div className="flex justify-center" style={{ marginTop: 16, marginBottom: 16 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 16px',
                  borderRadius: 48,
                  border: '1px solid var(--color-border-subtle, #E5E2DA)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 12,
                  lineHeight: '16px',
                  color: 'var(--color-text-disabled, #A8A39A)',
                }}
              >
                {relativeDayLabel(new Date(encounter.created_at), now)}
              </span>
            </div>

            {(encounter.summary || encounter.soap_note) && (
              <div className="consult-cards-wrap">
                {encounter.summary && (
                  <SummarySoapCard title="Summary" body={encounter.summary} onOpen={setSummarySoapTab} />
                )}
                {encounter.soap_note && (
                  <SummarySoapCard title="SOAP Note" body={encounter.soap_note} onOpen={setSummarySoapTab} />
                )}
                <SummarySoapModal
                  open={summarySoapTab !== null}
                  initialTab={summarySoapTab ?? 'summary'}
                  onClose={() => setSummarySoapTab(null)}
                  summary={encounter.summary}
                  soapNote={encounter.soap_note}
                />
              </div>
            )}

            {assigned && doctorName && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 12,
                  margin: '54px 0',
                  width: '100%',
                }}
              >
                <div className="consult-joined-line" />
                <span className="consult-joined-text">
                  {doctorName} joined the conversation
                </span>
                <div className="consult-joined-line" />
              </div>
            )}

            {/* Bubbles, grouped by day */}
            {grouped.map(({ key, label, items }, idx) => (
              <div key={key}>
                {idx > 0 && (
                  <div className="flex justify-center" style={{ marginTop: 16, marginBottom: 16 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 16px',
                        borderRadius: 48,
                        border: '1px solid var(--color-border-subtle, #E5E2DA)',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 12,
                        lineHeight: '16px',
                        color: 'var(--color-text-disabled, #A8A39A)',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                )}
                <div className="pb-6">
                  {items.map((m, idx) => {
                    const prev = items[idx - 1];
                    const next = items[idx + 1];
                    const senderKey = bubbleSenderKey(m);
                    const prevSenderKey = prev ? bubbleSenderKey(prev) : null;
                    const nextSenderKey = next ? bubbleSenderKey(next) : null;
                    const isLastInStreak = senderKey !== nextSenderKey;
                    // First in streak = previous bubble was a different
                    // sender (or there was no previous bubble). Drives the
                    // 8-vs-4px gap below: streak transitions read as a new
                    // speaker, same-streak feels like one continued thought.
                    const isFirstInStreak = senderKey !== prevSenderKey;
                    const showDividerHere =
                      dividerVisible && firstUnreadId === m.id;
                    // No top margin on the very first bubble (or right
                    // after the NewMessagesDivider — it already brings its
                    // own 54px breathing room).
                    const topGap =
                      idx === 0 || showDividerHere
                        ? 0
                        : isFirstInStreak
                          ? 8
                          : 4;
                    const showFirstDoctorNote = m.id === firstPatientLogId;
                    return (
                      <React.Fragment key={m.id}>
                        {showDividerHere && <NewMessagesDivider count={unreadDividerCount} />}
                        <div data-log-id={m.id} style={{ marginTop: topGap }}>
                          <Bubble
                            log={m}
                            clinicianInitials={doctorName ? getInitials(doctorName) : ''}
                            clinicianPhotoUrl={encounter.clinician?.photo_url ?? null}
                            patientName={patientName}
                            doctorName={doctorName}
                            visitReason={encounter.visit_reason || ''}
                            onViewPrescriptions={onViewPrescriptions}
                            isLastInStreak={isLastInStreak}
                            firstMessageNote={showFirstDoctorNote ? FIRST_DOCTOR_MESSAGE_NOTE : null}
                          />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Composer — matches the /chat page MessageInput visual */}
      <div className="consult-composer-wrap">
        <div className="max-w-3xl mx-auto relative">
          {/* Floating "N new messages" pill — anchored above the composer
              when the user is scrolled up and a non-patient message arrives
              offscreen. */}
          {showNewPill && !isAtBottom && (
            <NewMessagesPill count={pillCount} onClick={handleJumpToNew} />
          )}
          {/* `hasDoctor` covers the window where the assignment webhook has
              attached a clinician but encounter.status still lags at
              'paid'/'verified' — same reason the header pill keys off
              clinician presence instead of status. */}
          {!assigned && !hasDoctor && showWaitingBanner && (
            <div className="consult-waiting-banner">
              <span className="consult-waiting-banner__icon">
                <ClockIcon size={20} color="#3D6B7A" weight="regular" />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, flex: 1, minWidth: 0 }}>
                <div className="consult-waiting-banner__title">
                  Your consultation has been shared with a clinician
                </div>
                <div className="consult-waiting-banner__body">
                  <span className="consult-waiting-banner__body-desktop">
                    The clinician typically responds within 60 minutes. While you wait, feel free to share any questions or concerns you have.
                  </span>
                  <span className="consult-waiting-banner__body-mobile">
                    Usually responds within 60 minutes.
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Dismiss banner"
                onClick={() => setShowWaitingBanner(false)}
                className="consult-waiting-banner__close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6l12 12M6 18L18 6" stroke="#3D6B7A" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
          {sendError && (
            <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {sendError}
            </div>
          )}
          <div
            style={{
              borderRadius: '24px',
              border: '1px solid #E0DDD5',
              background: '#FAFAFA',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 16px 12px 16px',
              alignSelf: 'stretch',
              boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Attached file previews */}
            {files.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {files.map((f, i) => {
                  const isImage = f.type.startsWith('image/');
                  const isVideo = f.type.startsWith('video/');
                  const previewUrl = isImage || isVideo ? URL.createObjectURL(f) : null;
                  return (
                    <div key={i} className="relative" style={{ width: 64, height: 64 }}>
                      {isImage && previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt={f.name} className="w-full h-full object-cover" style={{ borderRadius: 12 }} />
                      ) : isVideo && previewUrl ? (
                        <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: 12 }}>
                          <video
                            src={previewUrl}
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover bg-black"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span
                              className="flex items-center justify-center bg-black/60 rounded-full"
                              style={{ width: 22, height: 22 }}
                              aria-hidden
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 1.5v7l6-3.5-6-3.5z" fill="#fff" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[#EDEBE5] flex items-center justify-center" style={{ borderRadius: 12 }}>
                          <FileText className="h-6 w-6 text-[#5a564e]" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                        aria-label={`Remove ${f.name}`}
                        className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
                        style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {isVoiceRecording ? (
              <VoiceRecorderUI
                onClose={() => setIsVoiceRecording(false)}
                onSend={handleSendVoice}
              />
            ) : (
              <>
                {/* Text input */}
                <div className="w-full mb-1">
                  <label htmlFor="consult-chat-input" className="sr-only">
                    Message your clinician
                  </label>
                  <textarea
                    id="consult-chat-input"
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={'Message your clinician...'}
                    rows={1}
                    className="w-full bg-transparent border-none outline-none consult-input-textarea resize-none overflow-y-auto pl-1"
                    style={{
                      fontWeight: 400,
                      lineHeight: '1.4',
                      background: 'transparent',
                      color: 'inherit',
                      maxHeight: '150px',
                      minHeight: '28px',
                      fieldSizing: 'content',
                    } as React.CSSProperties}
                  />

                </div>

                {/* Bottom row: attach left, mic/send right */}
                <div className="flex items-center justify-between w-full">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAttachMenuOpen((o) => !o)}
                      className={`h-9 w-9 flex items-center justify-center rounded-full shrink-0 transition-colors hover:bg-[#E8EBEA] ${attachMenuOpen ? 'bg-[#E8EBEA]' : ''}`}
                      tabIndex={-1}
                      aria-haspopup="menu"
                      aria-expanded={attachMenuOpen}
                      aria-label="Add attachment"
                    >
                      <Plus className={`h-5 w-5 text-[#4E5553] transition-transform ${attachMenuOpen ? 'rotate-45' : ''}`} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,video/mp4,video/quicktime,video/webm,video/x-m4v"
                      className="hidden"
                      onChange={(e) => {
                        const picked = Array.from(e.target.files || []);
                        setFiles((arr) => [...arr, ...picked]);
                        e.target.value = '';
                      }}
                    />

                    {attachMenuOpen && (
                      <>
                        {/* Click-away backdrop */}
                        <div className="fixed inset-0 z-40" onClick={() => setAttachMenuOpen(false)} />
                        <div
                          role="menu"
                          className="absolute bottom-11 left-0 z-50 w-48 overflow-hidden rounded-2xl border border-[#E0DDD5] bg-white py-1.5 shadow-lg"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => { setAttachMenuOpen(false); fileInputRef.current?.click(); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-[#141515] transition-colors hover:bg-[#F5F4F0]"
                          >
                            <Paperclip size={18} color="#4E5553" />
                            Upload a file
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => { setAttachMenuOpen(false); setIsVideoRecording(true); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-[#141515] transition-colors hover:bg-[#F5F4F0]"
                          >
                            <VideoCamera size={18} color="#4E5553" />
                            Record a video
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center">
                    {input.trim() || files.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={sending}
                        aria-label="Send message"
                        className={`h-9 w-9 flex items-center justify-center rounded-full shrink-0 transition-colors ${sending ? 'bg-[#206E55]/50 text-white cursor-not-allowed' : 'bg-[#206E55] text-white hover:bg-[#1a5a46]'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
                          <path d="M13.1208 6.59398H0.8125C0.581931 6.59398 0.388917 6.51616 0.233458 6.36052C0.0778193 6.20506 0 6.01205 0 5.78148C0 5.55091 0.0778193 5.3579 0.233458 5.20244C0.388917 5.0468 0.581931 4.96898 0.8125 4.96898H13.1208L9.55419 1.40238C9.39313 1.24114 9.3136 1.05255 9.31559 0.836604C9.31775 0.62066 9.39729 0.42864 9.55419 0.260543C9.72229 0.092626 9.9153 0.00586778 10.1332 0.000270552C10.3513 -0.00532667 10.5444 0.0759234 10.7125 0.244021L15.5645 5.096C15.666 5.19747 15.7375 5.30445 15.779 5.41694C15.8207 5.52943 15.8416 5.65094 15.8416 5.78148C15.8416 5.91202 15.8207 6.03354 15.779 6.14602C15.7375 6.25851 15.666 6.36549 15.5645 6.46696L10.7125 11.3189C10.5513 11.48 10.36 11.5595 10.1386 11.5575C9.91711 11.5554 9.72229 11.4703 9.55419 11.3024C9.39729 11.1343 9.31604 10.944 9.31044 10.7315C9.30484 10.519 9.38609 10.3287 9.55419 10.1606L13.1208 6.59398Z" fill="white" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="Record voice message"
                        onClick={() => setIsVoiceRecording(true)}
                        className="h-9 w-9 flex items-center justify-center rounded-full shrink-0 transition-colors hover:bg-[#E8EBEA]"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M12 16.5C13.1931 16.4988 14.337 16.0243 15.1806 15.1806C16.0243 14.337 16.4988 13.1931 16.5 12V6C16.5 4.80653 16.0259 3.66193 15.182 2.81802C14.3381 1.97411 13.1935 1.5 12 1.5C10.8065 1.5 9.66193 1.97411 8.81802 2.81802C7.97411 3.66193 7.5 4.80653 7.5 6V12C7.50124 13.1931 7.97575 14.337 8.81939 15.1806C9.66303 16.0243 10.8069 16.4988 12 16.5ZM9 6C9 5.20435 9.31607 4.44129 9.87868 3.87868C10.4413 3.31607 11.2044 3 12 3C12.7956 3 13.5587 3.31607 14.1213 3.87868C14.6839 4.44129 15 5.20435 15 6V12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12V6ZM12.75 19.4625V22.5C12.75 22.6989 12.671 22.8897 12.5303 23.0303C12.3897 23.171 12.1989 23.25 12 23.25C11.8011 23.25 11.6103 23.171 11.4697 23.0303C11.329 22.8897 11.25 22.6989 11.25 22.5V19.4625C9.40091 19.2743 7.68728 18.4072 6.44048 17.0288C5.19368 15.6504 4.50228 13.8586 4.5 12C4.5 11.8011 4.57902 11.6103 4.71967 11.4697C4.86032 11.329 5.05109 11.25 5.25 11.25C5.44891 11.25 5.63968 11.329 5.78033 11.4697C5.92098 11.6103 6 11.8011 6 12C6 13.5913 6.63214 15.1174 7.75736 16.2426C8.88258 17.3679 10.4087 18 12 18C13.5913 18 15.1174 17.3679 16.2426 16.2426C17.3679 15.1174 18 13.5913 18 12C18 11.8011 18.079 11.6103 18.2197 11.4697C18.3603 11.329 18.5511 11.25 18.75 11.25C18.9489 11.25 19.1397 11.329 19.2803 11.4697C19.421 11.6103 19.5 11.8011 19.5 12C19.4977 13.8586 18.8063 15.6504 17.5595 17.0288C16.3127 18.4072 14.5991 19.2743 12.75 19.4625Z" fill="#7A7468"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <p
            className="text-center mt-2 mb-1"
            style={{
              color: '#767F7C',
              fontFamily: '"SF Pro", system-ui, -apple-system, sans-serif',
              fontSize: 12,
              fontWeight: 400,
              lineHeight: '14px',
            }}
          >
            Messages are reviewed by your licensed doctor. For emergencies, call local emergency services.
          </p>
        </div>
      </div>

      {doctorProfileOpen && encounter.clinician && (
        <DoctorProfileModal
          clinician={encounter.clinician}
          onClose={() => setDoctorProfileOpen(false)}
        />
      )}

      {isVideoRecording && (
        <VideoRecorderUI
          onClose={() => setIsVideoRecording(false)}
          onCapture={(file) => {
            setIsVideoRecording(false);
            setFiles((arr) => [...arr, file]);
          }}
        />
      )}
    </main>
  );
}

function Bubble({
  log,
  clinicianInitials = '',
  clinicianPhotoUrl = null,
  patientName = '',
  doctorName = '',
  visitReason = '',
  onViewPrescriptions,
  isLastInStreak = true,
  firstMessageNote = null,
}: {
  log: ChatLog;
  clinicianInitials?: string;
  clinicianPhotoUrl?: string | null;
  patientName?: string;
  doctorName?: string;
  visitReason?: string;
  onViewPrescriptions?: () => void;
  isLastInStreak?: boolean;
  firstMessageNote?: string | null;
}) {
  const isMine = log.role === 'patient';
  // Treat anything that isn't an explicit human role as a system message
  // (no avatar, plain text). MDI's auto-generated chat injections — like the
  // AV verification link — arrive with role='unknown' from the webhook
  // classifier, and we don't want them rendered with the doctor's avatar.
  // Keep in sync with bubbleSenderKey() above.
  const isSystem = !isMine && log.role !== 'clinician' && log.role !== 'support';
  const filesArr = Array.isArray(log.files) ? log.files : [];
  // Detect URLs in the message text. Skip when files are attached — the
  // file preview takes precedence. The first URL feeds the swap pattern
  // (text becomes caption inside the card); multi-URL messages keep the
  // text bubble and append a card per URL.
  const messageUrls = filesArr.length === 0 ? extractAllUrls(log.message) : [];
  const firstUrl = messageUrls[0] ?? null;
  const firstUrlPreview = useLinkPreview(firstUrl);
  const isSingleUrl = messageUrls.length === 1;
  const swapPreview = isSingleUrl && !!firstUrlPreview.data;

  // Mirror the /chat page's MessageBubble typography:
  // patient (own) bubbles get the cream/elevated tint with dark text in a
  // pill, clinician/system text renders flush-left as plain prose at the
  // same SF Pro size — no border, no card.
  const sharedFontStyle: React.CSSProperties = {
    fontFamily: '"SF Pro", system-ui, -apple-system, sans-serif',
    fontWeight: 400,
  };

  // Prescription cards come in as role='august' + type='prescription' with
  // the prescribed_products payload under metadata. Flatten medications +
  // compounds into a single chip list (services / lab_orders aren't
  // rendered as chips today).
  if (log.type === 'prescription') {
    const products = extractPrescribedProducts(log.metadata);
    const rxList: PrescriptionItem[] = [
      ...products.medications.map((m) => ({
        id: m.id ?? undefined,
        name: m.name ?? undefined,
        drug_name: m.drug_name ?? undefined,
        strength: m.strength ?? undefined,
        dose_form: m.dose_form ?? undefined,
        directions: m.directions ?? undefined,
        quantity: m.quantity ?? undefined,
        dispense_unit_name: m.dispense_unit ?? undefined,
        days_supply: m.days_supply ?? undefined,
        refills: m.refills ?? undefined,
        clinical_note: m.clinical_note ?? undefined,
        pharmacy: m.pharmacy ?? null,
        pharmacy_name: m.pharmacy?.name ?? null,
      })),
      ...products.compounds.map((c) => ({
        id: c.id ?? undefined,
        name: c.name ?? undefined,
        directions: c.directions ?? undefined,
        quantity: c.quantity ?? undefined,
        dispense_unit_name: c.dispense_unit ?? undefined,
        days_supply: c.days_supply ?? undefined,
        refills: c.refills ?? undefined,
        clinical_note: c.clinical_note ?? undefined,
        pharmacy: c.pharmacy ?? null,
        pharmacy_name: c.pharmacy?.name ?? null,
      })),
    ];
    if (rxList.length === 0) {
      return null;
    }
    return (
      <>
        {doctorName && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              margin: '24px 0 16px',
              width: '100%',
            }}
          >
            <div className="consult-joined-line" />
            <span className="consult-joined-text">
              Prescription sent by {doctorName}
            </span>
            <div className="consult-joined-line" />
          </div>
        )}
        <div className="flex justify-start py-1">
        <div className="consult-prescription-row" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '100%', minWidth: 0 }}>
          {isLastInStreak ? (
            <DoctorAvatar photoUrl={clinicianPhotoUrl} initials={clinicianInitials} />
          ) : (
            <div aria-hidden style={{ width: 36, height: 36, flexShrink: 0 }} />
          )}
          <PrescriptionSummaryCard
            patientName={patientName}
            visitReason={visitReason}
            doctorName={doctorName}
            prescribedAt={log.timestamp}
            prescriptions={rxList}
            onViewDetails={onViewPrescriptions}
          />
        </div>
        </div>
      </>
    );
  }

  if (isSystem) {
    return (
      <div className="flex flex-col items-start py-1">
        <div
          className="max-w-[85%] whitespace-pre-wrap break-words text-[#272A29]"
          style={{ ...sharedFontStyle, fontSize: 16, lineHeight: '24px' }}
        >
          {log.message}
        </div>
      </div>
    );
  }

  if (!isMine) {
    const cImageFiles = filesArr.filter((f: any) => (f.mime_type || '').startsWith('image/'));
    const cAudioFiles = filesArr.filter((f: any) => (f.mime_type || '').startsWith('audio/'));
    const cVideoFiles = filesArr.filter((f: any) => (f.mime_type || '').startsWith('video/'));
    const cOtherFiles = filesArr.filter((f: any) => {
      const mime = f.mime_type || '';
      return !mime.startsWith('image/') && !mime.startsWith('audio/') && !mime.startsWith('video/');
    });
    const cHasText = !!(log.message && log.message.trim());
    return (
      <div className="flex justify-start py-1">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '85%' }}>
          {isLastInStreak ? (
            log.role === 'support' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  background: '#FFFFFF',
                  border: '0.5px solid #E5E2DA',
                  borderRadius: 18,
                  flexShrink: 0,
                }}
              >
                <HeadsetIcon size={18} color="#7A7468" aria-label="Support" />
              </div>
            ) : (
              <DoctorAvatar photoUrl={clinicianPhotoUrl} initials={clinicianInitials} />
            )
          ) : (
            <div aria-hidden style={{ width: 36, height: 36, flexShrink: 0 }} />
          )}
          <div className="flex flex-col items-start gap-2 min-w-0">
            {cImageFiles.length > 0 && (
              <div className="space-y-2">
                {cImageFiles.map((f: any, i: number) => (
                  <ChatImage
                    key={i}
                    src={f.url}
                    alt={f.name || ''}
                    name={f.name}
                  />
                ))}
              </div>
            )}

            {cAudioFiles.length > 0 && (
              <div className="space-y-2 w-[300px] max-w-full">
                {cAudioFiles.map((f: any, i: number) => (
                  <AudioWaveformPlayer key={i} url={f.url} />
                ))}
              </div>
            )}

            {cVideoFiles.length > 0 && (
              <div className="space-y-2 w-[320px] max-w-full">
                {cVideoFiles.map((f: any, i: number) => (
                  <video
                    key={i}
                    src={f.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full rounded-lg bg-black"
                    style={{ maxHeight: 240 }}
                  />
                ))}
              </div>
            )}

            {cOtherFiles.length > 0 && (
              <div className="space-y-2">
                {cOtherFiles.map((f: any, i: number) => (
                  <FileAttachmentPreview
                    key={i}
                    file={f}
                    thumbnailUrl={f.thumbnail_url || undefined}
                    caption={i === 0 && cHasText ? log.message : undefined}
                  />
                ))}
              </div>
            )}
            {cOtherFiles.length === 0 && cHasText && !swapPreview && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div className="consult-bubble-text">{log.message}</div>
              </div>
            )}
            {swapPreview && (
              <LinkPreviewCard
                url={firstUrlPreview.data!.url}
                title={firstUrlPreview.data!.title || firstUrlPreview.data!.domain}
                description={firstUrlPreview.data!.description || undefined}
                thumbnailUrl={firstUrlPreview.data!.image || undefined}
                domain={firstUrlPreview.data!.domain}
                caption={
                  cHasText
                    ? stripUrlFromText(log.message!, firstUrl!) || undefined
                    : undefined
                }
              />
            )}
            {!isSingleUrl &&
              messageUrls.map((u) => <LinkPreviewSlot key={u} url={u} />)}
          </div>
        </div>
      </div>
    );
  }

  // Patient bubble — matches /chat's user bubble: cream pill with dark
  // text, asymmetric corners (sharp bottom-right), images rendered
  // outside the bubble above the text.
  const imageFiles = filesArr.filter((f: any) => (f.mime_type || '').startsWith('image/'));
  const audioFiles = filesArr.filter((f: any) => (f.mime_type || '').startsWith('audio/'));
  const videoFiles = filesArr.filter((f: any) => (f.mime_type || '').startsWith('video/'));
  const otherFiles = filesArr.filter((f: any) => {
    const mime = (f.mime_type || '');
    return !mime.startsWith('image/') && !mime.startsWith('audio/') && !mime.startsWith('video/');
  });
  const hasText = !!(log.message && log.message.trim());
  return (
    <div className="flex justify-end py-1">
      <div className="flex flex-col items-end gap-1 max-w-[75%]">
        {firstMessageNote && (
          // Inside the bubble's content-width column with alignSelf:flex-start
          // so the note's LEFT edge lines up with the bubble's left edge.
          <div
            style={{
              alignSelf: 'flex-start',
              textAlign: 'left',
              marginBottom: 4,
              color: 'var(--color-text-tertiary, #7A7468)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '16px',
            }}
          >
            {firstMessageNote}
          </div>
        )}
        {imageFiles.length > 0 && (
          <div className="space-y-2">
            {imageFiles.map((f: any, i: number) => (
              <ChatImage
                key={i}
                src={f.url}
                alt={f.name || ''}
                name={f.name}
              />
            ))}
          </div>
        )}

        {audioFiles.length > 0 && (
          <div className="space-y-2 w-[300px]">
            {audioFiles.map((f: any, i: number) => (
              <AudioWaveformPlayer key={i} url={f.url} />
            ))}
          </div>
        )}

        {videoFiles.length > 0 && (
          <div className="space-y-2 w-[320px] max-w-full">
            {videoFiles.map((f: any, i: number) => (
              <video
                key={i}
                src={f.url}
                controls
                playsInline
                preload="metadata"
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: 240 }}
              />
            ))}
          </div>
        )}

        {otherFiles.length > 0 && (
          <div className="space-y-2">
            {otherFiles.map((f: any, i: number) => (
              <FileAttachmentPreview
                key={i}
                file={f}
                thumbnailUrl={f.thumbnail_url || undefined}
                caption={i === 0 && hasText ? log.message : undefined}
              />
            ))}
          </div>
        )}
        {otherFiles.length === 0 && hasText && !swapPreview && (
          <div
            className="bg-[#EDEBE5] text-[#141515] consult-bubble-text"
            style={{
              borderRadius: 12,
              padding: 16,
            }}
          >
            {log.message}
          </div>
        )}
        {swapPreview && (
          <LinkPreviewCard
            url={firstUrlPreview.data!.url}
            title={firstUrlPreview.data!.title || firstUrlPreview.data!.domain}
            description={firstUrlPreview.data!.description || undefined}
            thumbnailUrl={firstUrlPreview.data!.image || undefined}
            domain={firstUrlPreview.data!.domain}
            caption={
              hasText
                ? stripUrlFromText(log.message!, firstUrl!) || undefined
                : undefined
            }
          />
        )}
        {!isSingleUrl &&
          messageUrls.map((u) => <LinkPreviewSlot key={u} url={u} />)}
      </div>
    </div>
  );
}

function PrescriptionSummaryCard({
  patientName,
  visitReason,
  doctorName,
  prescribedAt,
  prescriptions,
  onViewDetails,
}: {
  patientName: string;
  visitReason: string;
  doctorName: string;
  prescribedAt: string;
  prescriptions: PrescriptionItem[];
  onViewDetails?: () => void;
}) {
  const heading = patientName ? `Treatment for ${patientName}` : 'Treatment plan';
  // Source-of-truth pharmacy = first rx that has one. Backend addresses
  // come in shouty all-caps; title-case the street + city for readability
  // while leaving the state code uppercase and the zip trimmed to the
  // 5-digit base form.
  const pharmacy =
    prescriptions.find((rx) => rx.pharmacy?.name || rx.pharmacy_name)?.pharmacy ?? null;
  const pharmacyFallbackName =
    prescriptions.find((rx) => rx.pharmacy_name)?.pharmacy_name || '';
  const pharmacyName = pharmacy?.name || pharmacyFallbackName;
  const pharmacyAddress = (() => {
    if (!pharmacy) return '';
    const toTitle = (s?: string | null) =>
      (s || '').trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    const street = toTitle(pharmacy.address1);
    const city = toTitle(pharmacy.city);
    const state = (pharmacy.state || '').trim().toUpperCase();
    const zipRaw = (pharmacy.zip_code || '').trim();
    const zip = zipRaw.length > 5 ? zipRaw.slice(0, 5) : zipRaw;
    const cityState = [city, state].filter(Boolean).join(', ');
    const head = [street, cityState].filter(Boolean).join(', ');
    return zip ? (head ? `${head} ${zip}` : zip) : head;
  })();
  const prescribedLabel = (() => {
    try {
      const d = new Date(prescribedAt);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  })();

  return (
    <article
      className="consult-prescription-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 16,
        gap: 32,
        width: '100%',
        background: '#FFFFFF',
        border: '0.5px solid #E5E2DA',
        borderRadius: 20,
        boxSizing: 'border-box',
        minWidth: 0,
      }}
    >
      <style jsx>{`
        .consult-prescription-card {
          max-width: 599px;
        }
        @media (max-width: 640px) {
          .consult-prescription-card {
            max-width: 314px;
            /* Per-section spacing controlled by margin-top below so we can
               have 20px heading→body and 16px body→footer. */
            gap: 0 !important;
          }
          /* heading (h3 + visitReason) → body (meds row): 20px */
          .consult-prescription-card__body {
            margin-top: 20px !important;
          }
          /* Mobile: stack meds section vertically; 16px between
             icon+label row and the chips/pharmacy column. */
          .consult-prescription-card__meds {
            flex-direction: column !important;
            gap: 16px !important;
          }
          /* Mobile: pharmacy text should wrap */
          .consult-prescription-card__pharmacy-text {
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: unset !important;
          }
          /* Mobile: pharmacy row should align to start */
          .consult-prescription-card__pharmacy {
            align-items: flex-start !important;
          }
          /* body (meds row) → footer (doctor name): 16px.
             Footer stacked vertically with 16px between doctor info and CTA. */
          .consult-prescription-card__footer {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            margin-top: 16px !important;
          }
          .consult-prescription-card__cta {
            width: 100% !important;
            flex-shrink: unset !important;
          }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 18,
            lineHeight: '24px',
            color: '#141515',
          }}
        >
          {heading}
        </h3>
        {visitReason && (
          <p
            style={{
              margin: 0,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 13,
              lineHeight: '20px',
              color: '#5A554A',
            }}
          >
            {visitReason}
          </p>
        )}
      </div>

      <div className="consult-prescription-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
        <div className="consult-prescription-card__meds" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 25, width: '100%' }}>
          <div className="consult-prescription-card__meds-label" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div
              className="consult-prescription-card__meds-icon"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 32,
                height: 32,
                background: '#E5EEF2',
                borderRadius: 6,
              }}
            >
              <Pill size={18} weight="regular" color="#3D6B7A" aria-hidden="true" />
            </div>
            <span
              className="consult-prescription-card__meds-title"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 15,
                lineHeight: '24px',
                color: '#141515',
              }}
            >
              Medications
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              flex: 1,
              minWidth: 0,
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <div
              className="consult-prescription-card__chips"
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '10px 8px',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
              }}
            >
              {prescriptions.map((rx, i) => {
                const chipLabel =
                  [rx.name || rx.drug_name || rx.title, rx.dose_form].filter(Boolean).join(' ') ||
                  'Prescription';
                return (
                  <span
                    key={rx.id || i}
                    className="consult-prescription-card__chip"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      padding: '6px 12px',
                      minHeight: 32,
                      background: '#FAF9F5',
                      border: '0.5px solid #E5E2DA',
                      borderRadius: 6,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 13,
                      lineHeight: '20px',
                      color: '#141515',
                      boxSizing: 'border-box',
                      maxWidth: '100%',
                      minWidth: 0,
                    }}
                  >
                    {/* The text needs its own explicit flex item so we can
                        set `min-width: 0` on it. Without the inner span,
                        the chip's text is an anonymous flex item whose
                        `min-width: auto` resolves to the full intrinsic
                        word width, overriding `overflow-wrap` on the chip
                        and preventing the break. */}
                    <span
                      style={{
                        minWidth: 0,
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                      }}
                    >
                      {chipLabel}
                    </span>
                  </span>
                );
              })}
            </div>
            {pharmacyName && (
              <div
                className="consult-prescription-card__pharmacy"
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 4, minWidth: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="8" cy="8" r="6.5" stroke="#206E55" strokeWidth="1.3" />
                  <path d="M5 8l2 2 4-4" stroke="#206E55" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span
                  className="consult-prescription-card__pharmacy-text"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: '16px',
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    minWidth: 0,
                  }}
                >
                  <span style={{ color: '#206E55' }}>Sent to {pharmacyName}</span>
                  {pharmacyAddress && (
                    <span style={{ color: '#5A554A' }}>{` · ${pharmacyAddress}`}</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="consult-prescription-card__footer"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          width: '100%',
          marginTop: 4,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          {(doctorName || prescribedLabel) && (
            <>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  lineHeight: '20px',
                  color: '#5A554A',
                }}
              >
                Prescribed by
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 15,
                  lineHeight: '24px',
                  color: '#141515',
                }}
              >
                {doctorName}
                {doctorName && prescribedLabel ? ` on ${prescribedLabel}` : prescribedLabel}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          className="consult-prescription-card__cta"
          onClick={onViewDetails}
          disabled={!onViewDetails}
          style={{
            height: 52,
            padding: '12px 24px',
            background: '#206E55',
            borderRadius: 100,
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: onViewDetails ? 'pointer' : 'default',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 16,
              lineHeight: '20px',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            View prescription details
          </span>
          <CaretRightIcon size={16} weight="bold" color="#FFFFFF" />
        </button>
      </div>
    </article>
  );
}

interface PrescriptionPharmacyInfo {
  name?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
}

interface PrescriptionItem {
  id?: string;
  title?: string;
  name?: string;
  drug_name?: string;
  strength?: string;
  dose_form?: string;
  directions?: string;
  quantity?: number | string;
  dispense_unit_name?: string;
  days_supply?: number;
  refills?: number;
  pharmacy?: PrescriptionPharmacyInfo | null;
  pharmacy_name?: string | null;
  clinical_note?: string;
}

function PrescriptionCard({ rx }: { rx: PrescriptionItem }) {
  const heading = rx.name || rx.drug_name || rx.title || 'Prescription';
  const subtitle = [rx.strength, rx.dose_form].filter(Boolean).join(' · ');
  const quantityLine = [
    rx.quantity != null ? `Qty ${rx.quantity}` : null,
    rx.dispense_unit_name || null,
  ]
    .filter(Boolean)
    .join(' ');
  const [showNote, setShowNote] = React.useState(false);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle bg-brand-subtle/40">
        <div className="flex items-center gap-2 text-text-brand">
          <Pill size={16} weight="regular" aria-hidden="true" />
          <span className="text-[11px] uppercase tracking-wide font-medium">Prescription</span>
        </div>
        <p className="mt-1 text-[15px] leading-[20px] font-medium text-text-primary">{heading}</p>
        {subtitle && <p className="text-[13px] leading-[18px] text-text-tertiary mt-0.5">{subtitle}</p>}
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {rx.directions && (
          <RxField label="Directions" value={rx.directions} className="col-span-2" />
        )}
        {quantityLine && <RxField label="Quantity" value={quantityLine} />}
        {rx.days_supply != null && <RxField label="Days supply" value={String(rx.days_supply)} />}
        {rx.refills != null && <RxField label="Refills" value={String(rx.refills)} />}
        {rx.pharmacy_name && <RxField label="Pharmacy" value={rx.pharmacy_name} />}
      </div>

      {rx.clinical_note && (
        <div className="border-t border-border-subtle">
          <button
            type="button"
            onClick={() => setShowNote((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-surface-subtle transition-colors"
          >
            <span className="text-[13px] leading-[18px] font-medium text-text-secondary">
              Clinical note
            </span>
            <span className="text-[12px] text-text-tertiary">{showNote ? 'Hide' : 'Show'}</span>
          </button>
          {showNote && (
            <div className="px-4 pb-4 text-[13px] leading-[20px] text-text-secondary whitespace-pre-line">
              {rx.clinical_note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RxField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-wide text-text-tertiary font-medium">{label}</p>
      <p className="mt-0.5 text-[14px] leading-[20px] text-text-primary whitespace-pre-line">{value}</p>
    </div>
  );
}

function groupByDay(logs: ChatLog[]): Array<{ key: string; label: string; items: ChatLog[] }> {
  if (!logs.length) return [];
  const now = new Date();
  const buckets: Array<{ key: string; label: string; items: ChatLog[] }> = [];
  for (const log of logs) {
    const d = new Date(log.timestamp);
    const key = dayKey(d);
    const last = buckets[buckets.length - 1];
    if (last && last.key === key) {
      last.items.push(log);
    } else {
      buckets.push({ key, label: relativeDayLabel(d, now), items: [log] });
    }
  }
  return buckets;
}

function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.\s*/i, '').replace(/,?\s*(MD|DO|NP|PA|MBBS|PhD)\b.*$/i, '').trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase().slice(0, 2);
}

function DoctorAvatar({ photoUrl, initials }: { photoUrl?: string | null; initials: string }) {
  const [failed, setFailed] = useState(false);
  if (photoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={initials || 'Doctor'}
        onError={() => setFailed(true)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          objectFit: 'cover',
          background: '#F3F1EB',
          border: '0.5px solid #E5E2DA',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        background: '#FFFFFF',
        border: '0.5px solid #E5E2DA',
        borderRadius: 18,
        flexShrink: 0,
      }}
    >
      <span className="consult-doctor-initials">{initials || 'Dr'}</span>
    </div>
  );
}

// Modal helpers. Read from the typed ClinicianDetail shape that get-encounter
// returns, so npi/dea/practice_areas come from dedicated columns rather
// than guessing field names.
function clinicianDetailInitials(clinician: ClinicianDetail): string {
  const first = (clinician.first_name || '').trim();
  const last = (clinician.last_name || '').trim();
  const a = first ? first[0] : '';
  const b = last ? last[0] : '';
  const initials = `${a}${b}`.toUpperCase();
  return initials || '?';
}

function clinicianFullDisplayName(clinician: ClinicianDetail): string {
  const first = (clinician.first_name || '').trim();
  const last = (clinician.last_name || '').trim();
  const suffix = (clinician.suffix || '').trim();
  const name = `${first} ${last}`.trim();
  if (!name) return 'Your clinician';
  return suffix ? `${name}, ${suffix.replace(/\./g, '')}` : name;
}

const PROFILE_FONT_STACK = '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function DoctorProfileModal({
  clinician,
  onClose,
}: {
  clinician: ClinicianDetail;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!mounted) return null;

  const displayName = clinicianFullDisplayName(clinician);
  const speciality = clinician.speciality || 'Clinician';
  const initials = clinicianDetailInitials(clinician);
  const licensedStates = (clinician.practice_areas || '').trim() || null;
  // MDI sandbox clinicians often have bio = '.' or similar placeholder.
  // Treat anything under 2 meaningful chars as no bio.
  const bioText = (clinician.bio || '').trim();
  const bio = bioText.replace(/[\.\s]+/g, '').length >= 2 ? bioText : null;
  const hasCard = !!(licensedStates || clinician.npi || clinician.dea);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-label="Doctor profile"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 500,
          maxWidth: '100%',
          maxHeight: '90vh',
          background: '#FFFFFF',
          border: '0.5px solid #E5E2DA',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
          borderRadius: 16,
          overflowY: 'auto',
          position: 'relative',
          fontFamily: PROFILE_FONT_STACK,
        }}
      >
        <style jsx global>{`
          .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
          .hide-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
        `}</style>

        {/* Close button — vertical-centered with the avatar (60px circle at
            padding-top 32px → its center sits 62px from modal top, X button
            is 32 tall → top = 46). */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            width: 32,
            height: 32,
            background: '#FFFFFF',
            border: '0.5px solid #F3F1EB',
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '1px 6px',
          }}
        >
          <CloseIcon size={18} strokeWidth={1.5} color="#7A7468" fill="none" />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 32px 20px', gap: 12, alignSelf: 'stretch' }}>
          {clinician.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clinician.photo_url}
              alt={displayName}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                objectFit: 'cover',
                background: '#F3F1EB',
                border: '0.5px solid #E5E2DA',
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                background: '#F3F1EB',
                border: '0.5px solid #E5E2DA',
                borderRadius: 30,
              }}
            >
              <span style={{ fontFamily: PROFILE_FONT_STACK, fontWeight: 500, fontSize: 20, lineHeight: '24px', color: '#7A7468' }}>
                {initials}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ margin: 0, fontFamily: PROFILE_FONT_STACK, fontWeight: 400, fontSize: 16, lineHeight: '23px', letterSpacing: '-0.2px', color: '#141515', textAlign: 'center' }}>
              {displayName}
            </p>
            <p style={{ margin: 0, fontFamily: PROFILE_FONT_STACK, fontWeight: 400, fontSize: 13, lineHeight: '20px', color: '#5A554A', textAlign: 'center' }}>
              {speciality}
            </p>
          </div>
        </div>

        {/* Divider only when there's a bio to separate from the header */}
        {bio && (
          <div style={{ display: 'flex', padding: '0 32px', alignSelf: 'stretch' }}>
            <div style={{ flex: 1, height: 1, background: '#F3F1EB' }} />
          </div>
        )}

        {/* Bio */}
        {bio && (
          <div style={{ display: 'flex', padding: '20px 32px', alignSelf: 'stretch' }}>
            <p style={{ fontFamily: PROFILE_FONT_STACK, fontWeight: 400, fontSize: 13, lineHeight: '20px', color: '#141515', margin: 0 }}>
              {bio}
            </p>
          </div>
        )}

        {/* Credentials card */}
        {hasCard && (
          <div style={{ display: 'flex', padding: bio ? '0 32px 32px' : '20px 32px 32px', alignSelf: 'stretch' }}>
            <div style={{ flex: 1 }}>
              {clinician.npi && (
                <ProfileRow
                  icon={<IdentificationCard size={16} weight="regular" color="#5A554A" />}
                  iconBg="#F3F1EB"
                  title="NPI Number"
                  isFirst
                >
                  {clinician.npi}
                </ProfileRow>
              )}
              {clinician.dea && (
                <ProfileRow
                  icon={<IdentificationBadge size={16} weight="regular" color="#5A554A" />}
                  iconBg="#F3F1EB"
                  title="DEA Number"
                  isFirst={!clinician.npi}
                >
                  {clinician.dea}
                </ProfileRow>
              )}
              {licensedStates && (
                <ProfileRow
                  icon={<MapPin size={16} weight="regular" color="#5A554A" />}
                  iconBg="#F3F1EB"
                  title="Licensed States"
                  isFirst={!clinician.npi && !clinician.dea}
                >
                  {licensedStates}
                </ProfileRow>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function ProfileRow({
  icon,
  iconBg,
  title,
  children,
  isFirst,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
  isFirst?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        padding: '16px 0',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        alignSelf: 'stretch',
        borderTop: isFirst ? 'none' : '1px solid #F3F1EB',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: iconBg,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          lineHeight: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: PROFILE_FONT_STACK, fontWeight: 500, fontSize: 14, lineHeight: '18px', color: '#141515' }}>
          {title}
        </p>
        <p style={{ margin: 0, fontFamily: PROFILE_FONT_STACK, fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#5A554A' }}>
          {children}
        </p>
      </div>
    </div>
  );
}
