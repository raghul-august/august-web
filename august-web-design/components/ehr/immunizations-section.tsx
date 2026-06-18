'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EhrSkeleton } from './ehr-skeleton';
import { useEhrStore } from '@/stores/ehr-store';
import type { EhrImmunizationPageItem } from '@/types/ehr';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import {
  formatDate,
  titleCase,
  StatusBadge,
  DetailLabel,
  NotesList,
  BulletList,
  StringChips,
  type BadgeVariant,
} from './shared-display';


// ── Variants ──────────────────────────────────────────────────

function statusVariant(status?: string): BadgeVariant {
  if (!status) return 'gray';
  const s = status.toLowerCase();
  if (s === 'completed') return 'green';
  if (s === 'not-done') return 'red';
  return 'gray';
}


// ── Vaccine series card ───────────────────────────────────────

function VaccineSeriesBlock({ series }: { series: NonNullable<EhrImmunizationPageItem['vaccine_series']> }) {
  if (series.length === 0) return null;
  return (
    <div className="mt-2 space-y-1.5">
      {series.map((s, i) => (
        <div key={i} className="rounded-md bg-[#F8FAF9] border border-[#E4E8E6] px-3 py-2">
          {s.name && <p className="text-[13px] font-medium text-[#1A1E1C]">{s.name}</p>}
          {s.target_diseases && s.target_diseases.length > 0 && (
            <p className="text-[12px] text-[#6B7370] mt-0.5">
              Protects against: {s.target_diseases.join(', ')}
            </p>
          )}
          {s.dose_number && (
            <p className="text-[12px] text-[#6B7370] mt-0.5">Dose: {s.dose_number}</p>
          )}
        </div>
      ))}
    </div>
  );
}


// ── Immunization Card ─────────────────────────────────────────

function ImmunizationCard({ immunization: m }: { immunization: EhrImmunizationPageItem }) {
  const [expanded, setExpanded] = useState(false);

  const series = m.vaccine_series ?? [];
  const reactions = m.reactions ?? [];
  const performers = m.performers ?? [];
  const education = m.education ?? [];
  const notes = m.notes ?? [];

  const hasExpandableDetails =
    performers.length > 0 ||
    !!m.location ||
    !!m.manufacturer ||
    !!m.site ||
    !!m.route ||
    !!m.dose ||
    education.length > 0 ||
    notes.length > 0;

  return (
    <div className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
      {/* Header: name + status */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-medium text-[#1A1E1C]">{m.name}</span>
        </div>
        {m.status && (
          <StatusBadge label={titleCase(m.status)} variant={statusVariant(m.status)} />
        )}
      </div>

      {/* Inline: date */}
      {m.date && (
        <p className="text-[12px] text-[#6B7370] mt-2">Given {formatDate(m.date)}</p>
      )}

      {/* Reason */}
      {m.reason && (
        <p className="text-[12px] text-[#6B7370] mt-1">Reason: {m.reason}</p>
      )}

      {/* Vaccine series */}
      <VaccineSeriesBlock series={series} />

      {/* Reactions */}
      {reactions.length > 0 && (
        <div className="mt-2.5">
          <DetailLabel>Reactions</DetailLabel>
          <div className="mt-1">
            <StringChips items={reactions} variant="amber" />
          </div>
        </div>
      )}

      {/* Expandable: location/manufacturer/site/route/dose/performers/education/notes */}
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
              {(m.dose || m.route || m.site) && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[#1A1E1C]">
                  {m.dose && <span><span className="text-[#8A9290]">Dose:</span> {m.dose}</span>}
                  {m.route && <span><span className="text-[#8A9290]">Route:</span> {m.route}</span>}
                  {m.site && <span><span className="text-[#8A9290]">Site:</span> {m.site}</span>}
                </div>
              )}

              {m.manufacturer && (
                <div>
                  <DetailLabel>Manufacturer</DetailLabel>
                  <p className="text-[13px] text-[#1A1E1C] mt-0.5">{m.manufacturer}</p>
                </div>
              )}

              {m.location && (
                <div>
                  <DetailLabel>Location</DetailLabel>
                  <p className="text-[13px] text-[#1A1E1C] mt-0.5">{m.location}</p>
                </div>
              )}

              {performers.length > 0 && (
                <div>
                  <DetailLabel>Performers</DetailLabel>
                  <p className="text-[13px] text-[#1A1E1C] mt-0.5">{performers.join(', ')}</p>
                </div>
              )}

              {education.length > 0 && (
                <div>
                  <DetailLabel>Education</DetailLabel>
                  <BulletList items={education} />
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

export function ImmunizationsPageSection({ personId }: { personId: string }) {
  const fetchImmunizationsPage = useEhrStore(s => s.fetchImmunizationsPage);
  const refreshSeq = useEhrStore(s => s.pageRefreshSeq[personId] ?? 0);
  const [items, setItems] = useState<EhrImmunizationPageItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPersonId, setLoadedPersonId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchImmunizationsPage(personId)
      .then(res => {
        if (!cancelled) {
          setItems(res);
          setError(null);
          setLoadedPersonId(personId);
        }
      })
      .catch(err => {
        logger.error('[EHR] Immunizations page fetch failed', serializeError(err));
        if (!cancelled) {
          setItems(null);
          setError('Failed to load immunizations');
          setLoadedPersonId(personId);
        }
      });

    return () => { cancelled = true; };
  }, [personId, refreshSeq, fetchImmunizationsPage]);

  const loading = loadedPersonId !== personId;

  if (loading) {
    return <EhrSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-[#C44040] text-center py-4">{error}</p>;
  }

  if (!items || items.length === 0) {
    return <p className="text-sm text-[#6B7370] text-center py-4">No immunizations found</p>;
  }

  return (
    <div className="space-y-2.5">
      {items.map(m => (
        <ImmunizationCard key={m.id} immunization={m} />
      ))}
    </div>
  );
}
