'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import {
  extractPrescribedProducts,
  listEncounterMessages,
  listEncounters,
  type ChatLog,
  type EncounterRecord,
} from '@/services/consultations-service';
import { useAuthStore } from '@/stores/auth-store';
import { useWebPubSubConnection } from '@/hooks/use-webpubsub-connection';
import { peekCachedResource } from '@/hooks/use-cached-resource';
import { readCachedChatLogs, writeCachedChatLogs } from '@/utils/consult-chat-cache';
import {
  prefetchConsult,
  seedEncounterDetailsFromList,
} from '@/utils/encounter-prefetch';

// Shared with the sidebar — both consume the same EncounterRecord[] list
// so we can render this page instantly from the sidebar's prior fetch.
const SIDEBAR_ENCOUNTERS_CACHE_KEY = 'sidebar:encounters';

const STORAGE_KEY = 'consult.session';

// `last_message_at` still isn't on the EncounterRecord row, so we fall back
// to the most recent chat-log timestamp (or encounter.updated_at if none).
// Med chips + pharmacy state come from the latest prescription chat-log's
// metadata.prescribed_products snapshot.
interface ConsultCardDisplay {
  encounter: EncounterRecord;
  medications: string[];
  hasNewPrescription: boolean;
  isSentToPharmacy: boolean;
  lastMessageAt: string;
}

function toCardData(e: EncounterRecord, logs: ChatLog[] = []): ConsultCardDisplay {
  // Each prescription chat row carries a full snapshot at that moment, so
  // the latest one supersedes earlier ones for chip rendering.
  let latestSnapshot: ReturnType<typeof extractPrescribedProducts> | null = null;
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].type !== 'prescription') continue;
    const snap = extractPrescribedProducts(logs[i].metadata);
    if (snap.medications.length === 0 && snap.compounds.length === 0) continue;
    latestSnapshot = snap;
    break;
  }

  const medications = latestSnapshot
    ? [
        ...latestSnapshot.medications.map((m) =>
          [m.name || m.drug_name, m.dose_form].filter(Boolean).join(' '),
        ),
        ...latestSnapshot.compounds.map((c) => c.name || ''),
      ].filter(Boolean)
    : [];

  const anyPharmacy = latestSnapshot
    ? latestSnapshot.medications.some((m) => !!m.pharmacy) ||
      latestSnapshot.compounds.some((c) => !!c.pharmacy)
    : false;

  const lastLogAt = logs.reduce<string | null>((latest, log) => {
    if (!latest) return log.timestamp;
    return new Date(log.timestamp).getTime() > new Date(latest).getTime() ? log.timestamp : latest;
  }, null);

  return {
    encounter: e,
    medications,
    hasNewPrescription: e.has_unread && !!latestSnapshot,
    isSentToPharmacy: anyPharmacy,
    lastMessageAt: lastLogAt || e.updated_at,
  };
}

function formatStartedOn(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function formatLastMessage(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function clinicianDisplayName(e: EncounterRecord): string {
  const first = (e.clinician_first_name || '').trim();
  const last = (e.clinician_last_name || '').trim();
  const suffix = (e.clinician_suffix || '').trim();
  const name = `${first} ${last}`.trim();
  if (!name) return 'Clinician — pending';
  return suffix ? `${name}, ${suffix}` : name;
}

// Build cards from cached records + cached chat logs. Used for the
// instant first-paint when the sidebar has already fetched encounters
// in this session — no skeleton, no waiting on the network.
function buildCardsFromCaches(records: EncounterRecord[]): ConsultCardDisplay[] {
  return records.map((r) => {
    const logs = readCachedChatLogs(r.id) ?? [];
    return toCardData(r, logs);
  });
}

export default function ConsultsPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.getAccessToken());
  // Initial paint comes from the sidebar's cached encounter list (warmed on
  // every authenticated page load) + any chat logs already in localStorage.
  // No skeleton if the user has navigated anywhere else first.
  const [cards, setCards] = useState<ConsultCardDisplay[] | null>(() => {
    const cachedList = peekCachedResource<EncounterRecord[]>(SIDEBAR_ENCOUNTERS_CACHE_KEY);
    return cachedList && cachedList.length > 0 ? buildCardsFromCaches(cachedList) : null;
  });
  const [error, setError] = useState<string | null>(null);

  // Keep the WebPubSub singleton connected while the user sits on the list —
  // navigating away from /chat tears it down (chat-container's unmount
  // cleanup), and without it the consultations.* events never arrive here.
  useWebPubSubConnection('ConsultsPage');

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    let isInitialLoad = true;

    const load = async () => {
      const initial = isInitialLoad;
      isInitialLoad = false;
      try {
        const list = await listEncounters();
        if (cancelled) return;
        if (list.length === 0) {
          // Only bounce to /chat on first load — an event-driven refresh
          // shouldn't yank the user off a page they're looking at.
          if (initial) router.replace('/chat');
          return;
        }
        // Seed per-encounter detail cache from the lightweight record so
        // any card the user clicks renders instantly via useCachedResource
        // even if the sidebar prefetch hasn't completed yet.
        seedEncounterDetailsFromList(list);
        const enriched = await Promise.all(
          list.map(async (encounter) => {
            try {
              const logs = await listEncounterMessages(encounter.id);
              // Seed the detail page's chat-log cache so opening this consult
              // skips the message skeleton — we already paid for these logs
              // to render the prescription chips.
              writeCachedChatLogs(encounter.id, logs);
              return toCardData(encounter, logs);
            } catch {
              return toCardData(encounter);
            }
          }),
        );
        if (!cancelled) setCards(enriched);
      } catch (err: any) {
        if (!cancelled && initial) setError(err?.response?.data?.error || err?.message || 'Failed to load consults');
      }
    };

    void load();

    // consultations.* events (clinician assigned, message created,
    // prescription) are bridged to this window event by webpubsub-service —
    // refetch so the cards update live.
    const onConsultEvent = () => {
      void load();
    };
    window.addEventListener('consultations.event', onConsultEvent);

    return () => {
      cancelled = true;
      window.removeEventListener('consultations.event', onConsultEvent);
    };
  }, [accessToken, router]);

  const openEncounter = (e: EncounterRecord) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          step: 'chat',
          episode_id: e.episode_id,
          differential_diagnosis_id: '',
          patient_id: e.patient_id,
          encounter_id: e.id,
        }),
      );
    }
    router.push(`/consults/e/${e.id}`);
  };

  return (
    // (webapp)/layout wraps <main> in `h-full overflow-hidden` so this page
    // has to own its own scroll. Use h-full + overflowY:auto rather than
    // minHeight:100vh — otherwise the inner column gets clipped at the
    // viewport bottom and nothing scrolls.
    <div className="consults-page">
      <style jsx global>{`
        .consults-page {
          height: 100%;
          min-height: 100dvh;
          background: #FAF9F5;
          position: relative;
          overflow-y: auto;
        }
        .consults-back {
          position: fixed;
          left: 24px;
          top: 24px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: Inter, sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 24px;
          color: #5A554A;
          z-index: 10;
        }
        .consults-shell {
          max-width: 720px;
          margin: 0 auto;
          padding: 24px 24px 64px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .consults-title {
          margin: 0;
          font-family: Inter, sans-serif;
          font-weight: 500;
          font-size: 24px;
          line-height: 25px;
          letter-spacing: -0.4px;
          color: #141515;
        }
        .consults-error {
          border-radius: 12px;
          border: 1px solid #FBCFCF;
          background: #FDECEC;
          padding: 12px 16px;
          color: #8A2A2A;
          font-size: 14px;
        }
        .consults-skeleton-list,
        .consults-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .consults-skeleton-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .consults-skeleton-card {
          height: 196px;
          border-radius: 16px;
          background: #FFFFFF;
          opacity: 0.6;
        }
        .consults-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .consults-started {
          font-family: Inter, sans-serif;
          font-weight: 400;
          font-size: 15px;
          line-height: 24px;
          color: #5A554A;
        }
        .consult-card {
          background: #FFFFFF;
          border: 0.5px solid #E5E2DA;
          box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.04);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 36px;
        }
        .consult-card__top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .consult-card__heading {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .consult-card__title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .consult-card__icon {
          display: none;
          justify-content: center;
          align-items: center;
          width: 24px;
          height: 24px;
          background: #F3F1EB;
          border-radius: 4px;
          color: #7A5A2E;
          flex: 0 0 24px;
        }
        .consult-card__title {
          font-family: Inter, sans-serif;
          font-weight: 500;
          font-size: 16px;
          line-height: 24px;
          color: #141515;
          min-width: 0;
          overflow-wrap: break-word;
          word-break: normal;
        }
        .consult-card__clinician {
          font-family: Inter, sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 20px;
          color: #5A554A;
        }
        .consult-card__badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .consult-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          height: 24px;
          box-sizing: border-box;
          flex-shrink: 0;
        }
        .consult-badge__label {
          font-family: Inter, sans-serif;
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
        }
        .consult-card__meds {
          display: flex;
          align-items: flex-start;
          gap: 46px;
        }
        .consult-card__meds-label {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .consult-card__meds-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 32px;
          height: 32px;
          background: #E5EEF2;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .consult-card__meds-title {
          font-family: Inter, sans-serif;
          font-weight: 500;
          font-size: 15px;
          line-height: 24px;
          color: #141515;
        }
        .consult-card__meds-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 8px;
          flex: 1;
          align-content: flex-start;
        }
        .consult-card__med-chip {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          background: #FAF9F5;
          border: 0.5px solid #E5E2DA;
          border-radius: 6px;
          font-family: Inter, sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 20px;
          color: #141515;
        }
        /* Sibling chip-style badge that takes the same row as
           consult-card__med-chip but in the warning palette — used when
           the clinician has been assigned to the consult but no
           prescription snapshot exists yet. */
        .consult-card__med-pending {
          display: flex;
          padding: 6px 12px;
          justify-content: center;
          align-items: center;
          gap: 10px;
          border-radius: 6px;
          border: 0.5px solid var(--color-state-warning-default, #C68E2A);
          background: var(--color-state-warning-subtle, #FAF2DE);
          font-family: Inter, sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 20px;
          color: #C68E2A;
        }
        .consult-card__bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .consult-card__last {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .consult-card__last-label {
          font-family: Inter, sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 20px;
          color: #7A7468;
        }
        .consult-card__last-date {
          font-family: Inter, sans-serif;
          font-weight: 400;
          font-size: 15px;
          line-height: 24px;
          color: #5A554A;
        }
        .consult-card__open {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: Inter, sans-serif;
          font-size: 16px;
          font-weight: 500;
          line-height: 20px;
          color: #141515;
          flex-shrink: 0;
        }
        @media (max-width: 1100px) and (min-width: 641px) {
          /* The fixed back button at left:24 collides with the centered
             720px shell until the viewport is wide enough to push the
             shell clear (~1100px). Drop the title below the button and lay
             an opaque strip behind the button so scrolling cards/title pass
             underneath it instead of bleeding through (same as mobile). */
          .consults-page::before {
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
          .consults-shell {
            padding-top: 96px;
          }
        }
        @media (max-width: 640px) {
          /* Solid bar behind the fixed back button so scrolling cards/title
             pass underneath it instead of bleeding through. Mobile only. */
          .consults-page::before {
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
          .consults-back {
            left: 24px;
            top: 24px;
            height: 40px;
            font-size: 13px;
            line-height: 20px;
          }
          .consults-back svg {
            width: 16px;
            height: 16px;
          }
          .consults-shell {
            max-width: none;
            padding: 64px 16px 40px;
            gap: 0;
          }
          .consults-title {
            font-size: 20px;
            line-height: 24px;
            letter-spacing: 0;
            margin-bottom: 4px;
          }
          .consults-list {
            gap: 20px;
          }
          .consults-group {
            gap: 8px;
          }
          .consults-started {
            font-size: 13px;
            line-height: 20px;
          }
          .consult-card {
            width: 100%;
            box-sizing: border-box;
            padding: 16px;
            gap: 20px;
            box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.04);
          }
          .consult-card__top {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .consult-card__badges {
            min-height: 0;
            flex-wrap: wrap;
          }
          .consult-card__heading {
            gap: 6px;
          }
          .consult-card__title-row {
            align-items: center;
          }
          .consult-card__title {
            font-weight: 500;
            font-size: 18px;
            line-height: 24px;
          }
          .consult-card__clinician {
            font-size: 13px;
            line-height: 20px;
          }
          .consult-badge {
            height: 24px;
          }
          .consult-badge__label {
            font-size: 11px;
            line-height: 16px;
          }
          .consult-card__meds {
            flex-direction: column;
            gap: 12px;
          }
          .consult-card__meds-label {
            gap: 8px;
          }
          .consult-card__meds-icon {
            width: 24px;
            height: 24px;
            border-radius: 6px;
          }
          .consult-card__meds-title {
            font-size: 14px;
            line-height: 18px;
          }
          .consult-card__meds-chips {
            gap: 8px 4px;
          }
          .consult-card__med-chip {
            /* Mobile: let long med names wrap to a new line instead of
               overflowing the card edge. Fixed height + nowrap caused
               names like "Ciprofloxacin-dexAMETHasone Otic Suspension
               0.3-0.1 % Suspension" to spill past the right border. */
            min-height: 28px;
            height: auto;
            padding: 6px 12px;
            font-size: 12px;
            line-height: 16px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            white-space: normal;
            overflow: visible;
            overflow-wrap: anywhere;
            text-overflow: clip;
          }
          .consult-card__med-pending {
            max-width: 100%;
            box-sizing: border-box;
          }
          .consult-card__bottom {
            padding-top: 0;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }
          .consult-card__last {
            flex: 1 1 auto;
            min-width: 0;
            flex-direction: row;
            align-items: center;
            gap: 4px;
            flex-wrap: nowrap;
            overflow: hidden;
          }
          .consult-card__last-label,
          .consult-card__last-date {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .consult-card__last-label {
            font-size: 13px;
            line-height: 20px;
          }
          .consult-card__last-date {
            font-size: 15px;
            line-height: 24px;
            font-weight: 500;
            color: #5A554A;
          }
          .consult-card__open {
            min-height: 44px;
            font-size: 16px;
            line-height: 20px;
          }
          .consults-skeleton-card {
            height: 156px;
          }
        }
      `}</style>
      <button
        type="button"
        onClick={() => router.push('/chat')}
        className="consults-back"
        aria-label="Back to chat"
      >
        <CaretLeft size={24} weight="regular" color="#5A554A" />
        <span>Back to Chat</span>
      </button>

      <div className="consults-shell">
        <h1 className="consults-title">
          All Consults
        </h1>

        {error && (
          <div className="consults-error">
            {error}
          </div>
        )}

        {cards === null && !error && (
          <ul className="consults-skeleton-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="consults-skeleton-card" />
            ))}
          </ul>
        )}

        {cards && cards.length > 0 && (
          <div className="consults-list">
            {cards.map((card) => (
              <ConsultGroup
                key={card.encounter.id}
                card={card}
                onOpen={() => openEncounter(card.encounter)}
                onPrefetch={() => prefetchConsult(card.encounter)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConsultGroup({
  card,
  onOpen,
  onPrefetch,
}: {
  card: ConsultCardDisplay;
  onOpen: () => void;
  onPrefetch: () => void;
}) {
  const { encounter } = card;
  return (
    <div className="consults-group">
      <span className="consults-started">
        Started on {formatStartedOn(encounter.created_at)}
      </span>
      <ConsultCard card={card} onOpen={onOpen} onPrefetch={onPrefetch} />
    </div>
  );
}

function ConsultCard({
  card,
  onOpen,
  onPrefetch,
}: {
  card: ConsultCardDisplay;
  onOpen: () => void;
  onPrefetch: () => void;
}) {
  const { encounter, medications, hasNewPrescription, isSentToPharmacy, lastMessageAt } = card;
  const title = encounter.visit_reason || 'Online doctor consult';
  const clinician = clinicianDisplayName(encounter);
  const hasMedications = medications.length > 0;
  const isAwaitingReview = !hasMedications && !hasNewPrescription && !isSentToPharmacy;

  return (
    <article
      className="consult-card"
      onPointerEnter={onPrefetch}
      onFocus={onPrefetch}
    >
      {/* Top row */}
      <div className="consult-card__top">
        <div className="consult-card__heading">
          <div className="consult-card__title-row">
            <span className="consult-card__icon" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.398 5.602L11.461 1.664a.563.563 0 0 0-.398-.164H4.313a1.125 1.125 0 0 0-1.125 1.125v12.75A1.125 1.125 0 0 0 4.312 16.5h10.125a1.125 1.125 0 0 0 1.125-1.125V6a.563.563 0 0 0-.164-.398zM11.625 3.42 13.642 5.438h-2.017V3.42zm2.813 11.955H4.313V2.625h6.187V6a.562.562 0 0 0 .563.563h3.375v8.812zM12.188 9.375a.563.563 0 0 1-.563.563h-4.5a.562.562 0 1 1 0-1.125h4.5a.563.563 0 0 1 .563.562zm0 2.25a.563.563 0 0 1-.563.563h-4.5a.562.562 0 1 1 0-1.125h4.5a.562.562 0 0 1 .563.562z" fill="currentColor" />
              </svg>
            </span>
            <span className="consult-card__title">
              {title}
            </span>
          </div>
          <span className="consult-card__clinician">
            {clinician}
          </span>
        </div>

        <div className="consult-card__badges">
          {isAwaitingReview && (
            <Badge
              bg="#FAF2DE"
              borderColor="#C68E2A"
              textColor="#C68E2A"
              label="Awaiting doctor review"
            />
          )}
          {hasNewPrescription && (
            <Badge bg="#E5EEF2" borderColor="#2A4A55" textColor="#3D6B7A" label="New prescription available" />
          )}
          {isSentToPharmacy && (
            <Badge
              bg="#E8F2ED"
              borderColor="#206E55"
              textColor="#206E55"
              label="Sent to Pharmacy"
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <circle cx="8" cy="8" r="6.5" stroke="#206E55" strokeWidth="1.3" />
                  <path d="M5 8l2 2 4-4" stroke="#206E55" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="consult-card__bottom">
        <div className="consult-card__last">
          <span className="consult-card__last-label">
            Updated At:
          </span>
          <span className="consult-card__last-date">
            {formatLastMessage(lastMessageAt)}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="consult-card__open"
          aria-label={`View consult: ${title}`}
        >
          <span>View consult</span>
          <CaretRight size={16} weight="regular" color="#141515" />
        </button>
      </div>
    </article>
  );
}

function Badge({
  bg,
  borderColor,
  textColor,
  label,
  icon,
}: {
  bg: string;
  borderColor: string;
  textColor: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className="consult-badge"
      style={{
        background: bg,
        border: `0.5px solid ${borderColor}`,
      }}
    >
      {icon}
      <span
        className="consult-badge__label"
        style={{
          color: textColor,
        }}
      >
        {label}
      </span>
    </span>
  );
}
