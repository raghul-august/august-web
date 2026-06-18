'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EhrSkeleton } from './ehr-skeleton';
import { useEhrStore } from '@/stores/ehr-store';
import type { EhrEncounterPageItem } from '@/types/ehr';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import {
  formatDate,
  formatPossibleDate,
  titleCase,
  StatusBadge,
  DetailLabel,
  NotesList,
  LinkedChips,
  type BadgeVariant,
} from './shared-display';


// ── Variants ──────────────────────────────────────────────────

function statusVariant(status?: string): BadgeVariant {
  if (!status) return 'gray';
  const s = status.toLowerCase();
  if (s === 'finished') return 'green';
  if (s === 'in-progress' || s === 'arrived' || s === 'triaged') return 'blue';
  if (s === 'onleave' || s === 'planned') return 'amber';
  return 'gray';
}

function classLabel(cls?: string): string | null {
  if (!cls) return null;
  const c = cls.toLowerCase();
  if (c === 'inpatient') return 'Inpatient';
  if (c === 'ed') return 'ED';
  if (c === 'ambulatory') return 'Ambulatory';
  if (c === 'virtual') return 'Virtual';
  return titleCase(cls);
}


// ── Time phrase ────────────────────────────────────────────────

function timePhrase(e: EhrEncounterPageItem): string | null {
  if (e.period?.start && e.period?.end) {
    return `${formatDate(e.period.start)} – ${formatDate(e.period.end)}`;
  }
  if (e.period?.display) return formatPossibleDate(e.period.display);
  if (e.period?.start) return formatDate(e.period.start);
  return null;
}


// ── Vitals row ────────────────────────────────────────────────

function VitalsBlock({ vitals }: { vitals: NonNullable<EhrEncounterPageItem['vitals']> }) {
  const entries: { label: string; value: string }[] = [];
  if (vitals.bp) entries.push({ label: 'BP', value: vitals.bp });
  if (vitals.hr) entries.push({ label: 'HR', value: vitals.hr });
  if (vitals.temp) entries.push({ label: 'Temp', value: vitals.temp });
  if (vitals.weight) entries.push({ label: 'Wt', value: vitals.weight });
  if (vitals.spo2) entries.push({ label: 'SpO₂', value: vitals.spo2 });
  if (entries.length === 0) return null;

  return (
    <div className="mt-2.5">
      <DetailLabel>Vitals</DetailLabel>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {entries.map((v, i) => (
          <span key={i} className="text-[12px]">
            <span className="text-[#8A9290]">{v.label}:</span>{' '}
            <span className="text-[#1A1E1C] font-medium">{v.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}


// ── Diagnoses chips (with optional rank + link) ───────────────

type Diagnosis = NonNullable<EhrEncounterPageItem['diagnoses']>[number];

function DiagnosesChips({ items }: { items: Diagnosis[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((d, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 text-[12px] text-[#3B74C4] bg-[#EEF4FF] px-2 py-0.5 rounded"
        >
          {d.rank != null && (
            <span className="text-[10px] font-bold text-[#3B74C4]/70">#{d.rank}</span>
          )}
          {d.name}
        </span>
      ))}
    </div>
  );
}


// ── Linked-with-extras row (medications, immunizations) ─────

function MedicationsRow({ items }: { items: NonNullable<EhrEncounterPageItem['medications']> }) {
  return (
    <div className="space-y-1">
      {items.map((m, i) => (
        <div key={i} className="text-[12px]">
          <span className="text-[#1A1E1C] font-medium">{m.name}</span>
          {(m.dosage || m.reason) && (
            <span className="text-[#6B7370]">
              {m.dosage && <> — {m.dosage}</>}
              {m.reason && <> ({m.reason})</>}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ImmunizationsRow({ items }: { items: NonNullable<EhrEncounterPageItem['immunizations']> }) {
  return (
    <div className="space-y-1">
      {items.map((m, i) => (
        <div key={i} className="text-[12px] flex items-baseline justify-between gap-2">
          <span className="text-[#1A1E1C] font-medium">{m.name}</span>
          {m.date && <span className="text-[#6B7370] shrink-0">{formatDate(m.date)}</span>}
        </div>
      ))}
    </div>
  );
}


// ── Encounter Card ────────────────────────────────────────────

function EncounterCard({ encounter: e }: { encounter: EhrEncounterPageItem }) {
  const [expanded, setExpanded] = useState(false);

  const diagnoses = e.diagnoses ?? [];
  const participants = e.participants ?? [];
  const procedures = e.procedures ?? [];
  const labReports = e.lab_reports ?? [];
  const immunizations = e.immunizations ?? [];
  const medications = e.medications ?? [];
  const locations = e.locations ?? [];
  const notes = e.notes ?? [];

  const time = timePhrase(e);
  const cls = classLabel(e.class);

  const hasExpandableDetails =
    procedures.length > 0 ||
    labReports.length > 0 ||
    immunizations.length > 0 ||
    medications.length > 0 ||
    participants.length > 0 ||
    notes.length > 0 ||
    !!e.hospitalization?.duration;

  const locationText = locations.join(', ');

  return (
    <div className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
      {/* Header: name (with optional " at <location>") + status */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-medium text-[#1A1E1C]">{e.name}</span>
          {locationText && (
            <span className="text-[15px] text-[#6B7370] font-normal"> at {locationText}</span>
          )}
          {e.type && e.type !== e.name && (
            <p className="text-[12px] text-[#6B7370] mt-0.5">{e.type}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {cls && <StatusBadge label={cls} variant="blue" />}
          {e.status && <StatusBadge label={titleCase(e.status)} variant={statusVariant(e.status)} />}
        </div>
      </div>

      {/* Inline meta: time + length */}
      {(time || e.length) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[12px] text-[#6B7370]">
          {time && <span>{time}</span>}
          {e.length && <span>· {e.length}</span>}
        </div>
      )}

      {/* Reason for visit */}
      {e.reason_for_visit && (
        <p className="text-[12px] text-[#6B7370] mt-1.5">Reason: {e.reason_for_visit}</p>
      )}

      {/* Diagnoses */}
      {diagnoses.length > 0 && (
        <div className="mt-2.5">
          <DetailLabel>Diagnoses</DetailLabel>
          <div className="mt-1">
            <DiagnosesChips items={diagnoses} />
          </div>
        </div>
      )}

      {/* Vitals — always inline when present */}
      {e.vitals && <VitalsBlock vitals={e.vitals} />}

      {/* Expandable: linked rollups + participants + locations + notes */}
      {hasExpandableDetails && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2.5 flex items-center gap-1 text-[12px] font-medium text-[#206E55] hover:text-[#1a5a46] transition-colors"
          >
            {expanded ? 'Hide details' : 'View details'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 border-t border-[#F0F1F1] pt-3">
              {procedures.length > 0 && (
                <div>
                  <DetailLabel>Procedures</DetailLabel>
                  <div className="mt-1">
                    <LinkedChips items={procedures} />
                  </div>
                </div>
              )}

              {labReports.length > 0 && (
                <div>
                  <DetailLabel>Lab reports</DetailLabel>
                  <div className="mt-1">
                    <LinkedChips items={labReports} />
                  </div>
                </div>
              )}

              {immunizations.length > 0 && (
                <div>
                  <DetailLabel>Immunizations</DetailLabel>
                  <div className="mt-1.5">
                    <ImmunizationsRow items={immunizations} />
                  </div>
                </div>
              )}

              {medications.length > 0 && (
                <div>
                  <DetailLabel>Medications</DetailLabel>
                  <div className="mt-1.5">
                    <MedicationsRow items={medications} />
                  </div>
                </div>
              )}

              {participants.length > 0 && (
                <div>
                  <DetailLabel>Participants</DetailLabel>
                  <p className="text-[13px] text-[#1A1E1C] mt-0.5">{participants.join(', ')}</p>
                </div>
              )}

              {e.hospitalization?.duration && (
                <div>
                  <DetailLabel>Hospitalization</DetailLabel>
                  <p className="text-[13px] text-[#1A1E1C] mt-0.5">Duration: {e.hospitalization.duration}</p>
                </div>
              )}

              {notes.length > 0 && (
                <div>
                  <DetailLabel>Notes</DetailLabel>
                  <div className="mt-1.5">
                    <NotesList notes={notes} />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Section ───────────────────────────────────────────────

export function EncountersPageSection({ personId }: { personId: string }) {
  const fetchEncountersPage = useEhrStore(s => s.fetchEncountersPage);
  const refreshSeq = useEhrStore(s => s.pageRefreshSeq[personId] ?? 0);
  const [items, setItems] = useState<EhrEncounterPageItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPersonId, setLoadedPersonId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchEncountersPage(personId)
      .then(res => {
        if (!cancelled) {
          setItems(res);
          setError(null);
          setLoadedPersonId(personId);
        }
      })
      .catch(err => {
        logger.error('[EHR] Encounters page fetch failed', serializeError(err));
        if (!cancelled) {
          setItems(null);
          setError('Failed to load encounters');
          setLoadedPersonId(personId);
        }
      });

    return () => { cancelled = true; };
  }, [personId, refreshSeq, fetchEncountersPage]);

  const loading = loadedPersonId !== personId;

  if (loading) {
    return <EhrSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-[#C44040] text-center py-4">{error}</p>;
  }

  if (!items || items.length === 0) {
    return <p className="text-sm text-[#6B7370] text-center py-4">No encounters found</p>;
  }

  return (
    <div className="space-y-2.5">
      {items.map(e => (
        <EncounterCard key={e.id} encounter={e} />
      ))}
    </div>
  );
}
