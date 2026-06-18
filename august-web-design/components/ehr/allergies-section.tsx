'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EhrSkeleton } from './ehr-skeleton';
import { useEhrStore } from '@/stores/ehr-store';
import type { EhrAllergyPageItem } from '@/types/ehr';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import {
  formatDate,
  formatPossibleDate,
  titleCase,
  StatusBadge,
  DetailLabel,
  NotesList,
  StringChips,
  type BadgeVariant,
} from './shared-display';


// ── Variants ──────────────────────────────────────────────────

function statusVariant(status?: string): BadgeVariant {
  if (!status) return 'gray';
  const s = status.toLowerCase();
  if (s === 'active') return 'green';
  return 'gray';
}

function criticalityVariant(criticality?: string): BadgeVariant {
  if (!criticality) return 'gray';
  const c = criticality.toLowerCase();
  if (c === 'high') return 'red';
  if (c === 'low') return 'amber';
  return 'gray'; // 'unable-to-assess'
}

// ── Allergy Card ──────────────────────────────────────────────

function AllergyCard({ allergy: a }: { allergy: EhrAllergyPageItem }) {
  const [expanded, setExpanded] = useState(false);

  const reactions = a.reactions ?? [];
  const categories = a.categories ?? [];
  const notes = a.notes ?? [];

  const hasExpandableDetails = notes.length > 0;

  return (
    <div className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
      {/* Header: name + criticality + status */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-medium text-[#1A1E1C]">{a.name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {a.criticality && (
            <StatusBadge label={titleCase(a.criticality)} variant={criticalityVariant(a.criticality)} />
          )}
          {a.status && (
            <StatusBadge label={titleCase(a.status)} variant={statusVariant(a.status)} />
          )}
        </div>
      </div>

      {/* Type + categories inline meta */}
      {(a.type || categories.length > 0) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          {a.type && (
            <span className="text-[11px] text-[#8A9290]">
              Type: <span className="text-[#1A1E1C] capitalize">{a.type}</span>
            </span>
          )}
          {categories.length > 0 && (
            <span className="text-[11px] text-[#8A9290]">
              {categories.length === 1 ? 'Category' : 'Categories'}:{' '}
              <span className="text-[#1A1E1C]">{categories.map(titleCase).join(', ')}</span>
            </span>
          )}
        </div>
      )}

      {/* Reactions chips */}
      {reactions.length > 0 && (
        <div className="mt-2.5">
          <DetailLabel>Reactions</DetailLabel>
          <div className="mt-1">
            <StringChips items={reactions} variant="amber" />
          </div>
        </div>
      )}

      {/* Onset/recorded + last occurrence */}
      {(a.onset_or_recorded || a.last_occurrence) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#6B7370]">
          {a.onset_or_recorded && <span>First noted: {formatPossibleDate(a.onset_or_recorded)}</span>}
          {a.last_occurrence && <span>Last occurrence: {formatDate(a.last_occurrence)}</span>}
        </div>
      )}

      {/* Expandable: notes */}
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

export function AllergiesPageSection({ personId }: { personId: string }) {
  const fetchAllergiesPage = useEhrStore(s => s.fetchAllergiesPage);
  const refreshSeq = useEhrStore(s => s.pageRefreshSeq[personId] ?? 0);
  const [items, setItems] = useState<EhrAllergyPageItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPersonId, setLoadedPersonId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAllergiesPage(personId)
      .then(res => {
        if (!cancelled) {
          setItems(res);
          setError(null);
          setLoadedPersonId(personId);
        }
      })
      .catch(err => {
        logger.error('[EHR] Allergies page fetch failed', serializeError(err));
        if (!cancelled) {
          setItems(null);
          setError('Failed to load allergies');
          setLoadedPersonId(personId);
        }
      });

    return () => { cancelled = true; };
  }, [personId, refreshSeq, fetchAllergiesPage]);

  const loading = loadedPersonId !== personId;

  if (loading) {
    return <EhrSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-[#C44040] text-center py-4">{error}</p>;
  }

  if (!items || items.length === 0) {
    return <p className="text-sm text-[#6B7370] text-center py-4">No allergies found</p>;
  }

  return (
    <div className="space-y-2.5">
      {items.map(a => (
        <AllergyCard key={a.id} allergy={a} />
      ))}
    </div>
  );
}
