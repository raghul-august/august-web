'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck, ChevronRight, ClipboardList, FileText, History, MapPin } from 'lucide-react';
import { EhrSkeleton } from './ehr-skeleton';
import { useEhrStore } from '@/stores/ehr-store';
import type {
  EhrProcedurePageItem,
  EhrProcedureOccurrence,
  EhrCarePlanBasedOn,
  EhrServiceRequestBasedOn,
} from '@/types/ehr';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { EhrPanelFactGrid, EhrPanelSection, EhrSidePanel } from './side-panel';
import {
  formatDate,
  formatPossibleDate,
  titleCase,
  StatusBadge,
  DetailLabel,
  NotesList,
  BulletList,
  LinkedChips,
  pickLatestNote,
  type BadgeVariant,
} from './shared-display';


// ── Variants ──────────────────────────────────────────────────

function statusVariant(status?: string): BadgeVariant {
  if (!status) return 'gray';
  const s = status.toLowerCase();
  if (s === 'completed') return 'green';
  if (s === 'in-progress') return 'blue';
  if (s === 'on-hold') return 'amber';
  if (s === 'stopped' || s === 'not-done') return 'red';
  return 'gray';
}


// ── Time phrase ────────────────────────────────────────────────

/** Earliest-performed anchor for the card or a single occurrence row. */
function performedDate(p: EhrProcedurePageItem | EhrProcedureOccurrence): string | null {
  if (p.date) return formatDate(p.date);
  if (p.period?.display) return formatPossibleDate(p.period.display);
  if (p.period?.start) return formatDate(p.period.start);
  return null;
}

function timePhrase(p: EhrProcedurePageItem): string | null {
  const occCount = p.occurrences?.length ?? 1;
  const hasHistory = occCount > 1;

  if (!hasHistory && p.period?.start && p.period?.end) {
    return `${formatDate(p.period.start)} – ${formatDate(p.period.end)}`;
  }

  const first = performedDate(p);
  if (!hasHistory) return first;

  const latest = p.last_performed_on ? formatDate(p.last_performed_on) : null;
  const seen = `Performed ${occCount} times${latest ? `, latest ${latest}` : ''}`;
  return first ? `${first} · ${seen}` : seen;
}

/** Date phrase for a single occurrence row in the history list. */
function occurrenceDateText(o: EhrProcedureOccurrence): string | null {
  if (o.period?.start && o.period?.end) {
    return `${formatDate(o.period.start)} – ${formatDate(o.period.end)}`;
  }
  return performedDate(o);
}

// ── BasedOn block ──────────────────────────────────────────────

function CarePlanBasedOnCard({ plan }: { plan: EhrCarePlanBasedOn }) {
  return (
    <div className="rounded-md bg-[#F8FAF9] border border-[#E4E8E6] px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[13px] font-medium text-[#1A1E1C]">
          <span className="text-[10px] text-[#8A9290] uppercase tracking-wider mr-1.5">Care plan</span>
          {plan.name}
        </p>
        {plan.date && <span className="text-[11px] text-[#6B7370] shrink-0">{formatDate(plan.date)}</span>}
      </div>
      {plan.team && plan.team.length > 0 && (
        <p className="text-[12px] text-[#6B7370] mt-1">Team: {plan.team.join(', ')}</p>
      )}
      {plan.addresses && plan.addresses.length > 0 && (
        <p className="text-[12px] text-[#6B7370] mt-0.5">Addresses: {plan.addresses.join(', ')}</p>
      )}
      {plan.goals && plan.goals.length > 0 && (
        <div className="mt-1.5">
          <DetailLabel>Goals</DetailLabel>
          <BulletList items={plan.goals} />
        </div>
      )}
      {plan.activities && plan.activities.length > 0 && (
        <div className="mt-1.5">
          <DetailLabel>Activities</DetailLabel>
          <BulletList items={plan.activities} />
        </div>
      )}
    </div>
  );
}

function ServiceRequestBasedOnCard({ sr }: { sr: EhrServiceRequestBasedOn }) {
  if (!sr.reason && !sr.notes?.length && !sr.patient_instructions?.length) return null;

  return (
    <div className="rounded-md bg-[#F8FAF9] border border-[#E4E8E6] px-3 py-2">
      <div className="text-[13px] font-medium text-[#1A1E1C]">
        <span className="text-[10px] text-[#8A9290] uppercase tracking-wider mr-1.5">Service request</span>
      </div>
      {sr.reason && <p className="text-[12px] text-[#6B7370] mt-1">Reason: {sr.reason}</p>}
      {sr.notes && sr.notes.length > 0 && (
        <div className="mt-1.5">
          <DetailLabel>Notes</DetailLabel>
          <BulletList items={sr.notes} />
        </div>
      )}
      {sr.patient_instructions && sr.patient_instructions.length > 0 && (
        <div className="mt-1.5">
          <DetailLabel>Patient instructions</DetailLabel>
          <BulletList items={sr.patient_instructions} />
        </div>
      )}
    </div>
  );
}


// ── Occurrence history row ─────────────────────────────────────

function OccurrenceRow({
  occurrence: o,
  parentStatus,
  parentOutcome,
}: {
  occurrence: EhrProcedureOccurrence;
  parentStatus?: string;
  parentOutcome?: string;
}) {
  const date = occurrenceDateText(o);
  const showStatus = !!o.status && o.status !== parentStatus;
  // Reason is always shown when present (unlike status/outcome, which are
  // hidden when they match the parent): a per-occurrence reason is meaningful
  // on each history row even when it equals the procedure's overall reason.
  const showReason = !!o.reason;
  const showOutcome = !!o.outcome && o.outcome !== parentOutcome;

  return (
    <div className="relative flex items-center gap-2 flex-wrap pl-6 py-1 text-[12px] text-[#4A5250]">
      <span className="absolute left-[-5px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#C8D0CD] ring-4 ring-white" />
      <span>{date ?? 'Date unknown'}</span>
      {showStatus && (
        <StatusBadge label={titleCase(o.status!)} variant={statusVariant(o.status)} />
      )}
      {showReason && <span className="text-[#6B7370]">· for {o.reason}</span>}
      {showOutcome && <span className="text-[#6B7370]">· outcome: {o.outcome}</span>}
    </div>
  );
}


// ── Procedure panel ────────────────────────────────────────────

function ProcedureDetailsPanel({ procedure: p }: { procedure: EhrProcedurePageItem }) {
  const followup = p.followup ?? [];
  const complications = p.complications ?? [];
  const bodySites = p.body_sites ?? [];
  const performers = p.performers ?? [];
  const reports = p.reports ?? [];
  const notes = p.notes ?? [];
  const occurrences = p.occurrences ?? [];
  const hasHistory = occurrences.length > 1;
  const basedOn = (p.based_on ?? []).filter(entry =>
    entry.type === 'care_plan' ||
    !!entry.reason ||
    !!entry.notes?.length ||
    !!entry.patient_instructions?.length
  );

  const time = timePhrase(p);

  return (
    <article className="overflow-hidden">
      <div className="bg-[#FBFAF7] px-8 py-8 border-b border-[#E4E1DC]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={`procedure-panel-${p.id}`} className="text-[32px] font-semibold tracking-[-0.025em] text-[#111715] leading-tight break-words">{p.name}</h2>
            {time && <p className="mt-2 text-[17px] text-[#66716E]">{time}</p>}
          </div>
          {p.status && (
            <StatusBadge label={titleCase(p.status)} variant={statusVariant(p.status)} />
          )}
        </div>
      </div>

      <EhrPanelSection title="Snapshot" icon={<CalendarCheck className="h-5 w-5" />} defaultOpen>
        <EhrPanelFactGrid rows={[
          { label: 'Performed', value: time || 'Date unknown' },
          { label: 'Outcome', value: p.outcome },
          { label: 'Reason', value: p.reason },
          { label: 'Body site', value: bodySites.length > 0 ? bodySites.join(', ') : null },
        ]} />
      </EhrPanelSection>

      {(performers.length > 0 || reports.length > 0) && (
        <EhrPanelSection title="Provider & reports" icon={<MapPin className="h-5 w-5" />} defaultOpen>
          <EhrPanelFactGrid rows={[
            { label: 'Performed by', value: performers.length > 0 ? performers.join(', ') : null },
            { label: 'Reports', value: reports.length > 0 ? <LinkedChips items={reports} /> : null },
          ]} />
        </EhrPanelSection>
      )}

      {hasHistory && (
        <EhrPanelSection title={`Procedure history (${occurrences.length})`} icon={<History className="h-5 w-5" />} defaultOpen>
          <div className="ml-3 border-l border-dashed border-[#C8D0CD]">
            {occurrences.map(o => (
              <OccurrenceRow
                key={o.id}
                occurrence={o}
                parentStatus={p.status}
                parentOutcome={p.outcome}
              />
            ))}
          </div>
        </EhrPanelSection>
      )}

      {followup.length > 0 && (
        <EhrPanelSection title="Follow-up" icon={<CalendarCheck className="h-5 w-5" />} defaultOpen>
          <BulletList items={followup} />
        </EhrPanelSection>
      )}

      {basedOn.length > 0 && (
        <EhrPanelSection title="Based on" icon={<ClipboardList className="h-5 w-5" />} defaultOpen={false}>
          <div className="space-y-3">
            {basedOn.map((entry, i) =>
              entry.type === 'care_plan'
                ? <CarePlanBasedOnCard key={i} plan={entry} />
                : <ServiceRequestBasedOnCard key={i} sr={entry} />
            )}
          </div>
        </EhrPanelSection>
      )}

      {complications.length > 0 && (
        <EhrPanelSection title="Complications" icon={<ClipboardList className="h-5 w-5" />} defaultOpen={false}>
          <BulletList items={complications} />
        </EhrPanelSection>
      )}

      {notes.length > 0 && (
        <EhrPanelSection title="Notes" icon={<FileText className="h-5 w-5" />} defaultOpen>
          <NotesList notes={notes} />
        </EhrPanelSection>
      )}
    </article>
  );
}

/** An occurrence only adds history value if the panel's OccurrenceRow would
 *  render something for it: a known date, or status/reason/outcome that
 *  differs from the parent procedure. */
function occurrenceIsMeaningful(o: EhrProcedureOccurrence, p: EhrProcedurePageItem): boolean {
  if (occurrenceDateText(o)) return true;
  if (o.status && o.status !== p.status) return true;
  if (o.reason && o.reason !== p.reason) return true;
  if (o.outcome && o.outcome !== p.outcome) return true;
  return false;
}

/** The panel only adds value beyond the row through structured extras or
 *  genuinely-known repeat history. Snapshot / Provider duplicate the row,
 *  and notes are already shown in the row, so they never make a procedure
 *  clickable. */
function procedureHasDetail(p: EhrProcedurePageItem): boolean {
  const occ = p.occurrences ?? [];
  const realHistory = occ.length > 1 && occ.some(o => occurrenceIsMeaningful(o, p));
  const basedOn = (p.based_on ?? []).filter(entry =>
    entry.type === 'care_plan' ||
    !!entry.reason ||
    !!entry.notes?.length ||
    !!entry.patient_instructions?.length
  );
  return (
    (p.followup?.length ?? 0) > 0 ||
    (p.complications?.length ?? 0) > 0 ||
    (p.body_sites?.length ?? 0) > 0 ||
    (p.reports?.length ?? 0) > 0 ||
    basedOn.length > 0 ||
    realHistory
  );
}

function ProcedureRow({ procedure: p, onOpen }: { procedure: EhrProcedurePageItem; onOpen: () => void }) {
  const time = timePhrase(p);
  const performers = p.performers ?? [];
  const reports = p.reports ?? [];
  const note = pickLatestNote(p.notes ?? []);
  const clickable = procedureHasDetail(p);

  const inner = (
    <span className="flex items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight text-[#1A1E1C]">{p.name}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-[#8A9290]">
          {time && <span>{time}</span>}
          {p.outcome && <span>Outcome: {p.outcome}</span>}
          {p.reason && <span>Reason: {p.reason}</span>}
          {performers.length > 0 && <span>{performers.join(', ')}</span>}
          {reports.length > 0 && <span>{reports.length} linked {reports.length === 1 ? 'report' : 'reports'}</span>}
        </span>
        {note && (
          <span className="mt-1.5 block text-[12px] leading-snug text-[#6B7370] line-clamp-2 break-words">
            {note.text}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {p.status && <StatusBadge label={titleCase(p.status)} variant={statusVariant(p.status)} />}
        <span className="flex w-[18px] justify-center">
          {clickable && (
            <ChevronRight className="h-[18px] w-[18px] text-[#9AA39F] transition group-hover:translate-x-0.5 group-hover:text-[#206E55]" />
          )}
        </span>
      </span>
    </span>
  );

  return clickable ? (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full cursor-pointer px-4 py-3.5 text-left transition hover:bg-[#F3F5F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#206E55]/30"
    >
      {inner}
    </button>
  ) : (
    <div className="w-full px-4 py-3.5">{inner}</div>
  );
}

// ── Main Section ───────────────────────────────────────────────

export function ProceduresPageSection({ personId }: { personId: string }) {
  const fetchProceduresPage = useEhrStore(s => s.fetchProceduresPage);
  const refreshSeq = useEhrStore(s => s.pageRefreshSeq[personId] ?? 0);
  const [items, setItems] = useState<EhrProcedurePageItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPersonId, setLoadedPersonId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchProceduresPage(personId)
      .then(res => {
        if (!cancelled) {
          setItems(res);
          setError(null);
          setLoadedPersonId(personId);
        }
      })
      .catch(err => {
        logger.error('[EHR] Procedures page fetch failed', serializeError(err));
        if (!cancelled) {
          setItems(null);
          setError('Failed to load procedures');
          setLoadedPersonId(personId);
        }
      });

    return () => { cancelled = true; };
  }, [personId, refreshSeq, fetchProceduresPage]);

  const loading = loadedPersonId !== personId;

  if (loading) {
    return <EhrSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-[#C44040] text-center py-4">{error}</p>;
  }

  if (!items || items.length === 0) {
    return <p className="text-sm text-[#6B7370] text-center py-4">No procedures found</p>;
  }

  const selectedProcedure = selectedId ? items.find(p => p.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#6B7370]">
        <span>{items.length} {items.length === 1 ? 'procedure' : 'procedures'}</span>
      </div>

      <div className="bg-white rounded-[14px] shadow-sm divide-y divide-[#EFEDE8]">
        {items.map(p => (
          <ProcedureRow key={p.id} procedure={p} onOpen={() => setSelectedId(p.id)} />
        ))}
      </div>

      <EhrSidePanel
        open={!!selectedProcedure}
        eyebrow="Procedure"
        titleId={selectedProcedure ? `procedure-panel-${selectedProcedure.id}` : undefined}
        onClose={() => setSelectedId(null)}
      >
        {selectedProcedure && <ProcedureDetailsPanel procedure={selectedProcedure} />}
      </EhrSidePanel>
    </div>
  );
}
