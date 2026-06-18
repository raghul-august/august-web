'use client';

import { useEffect, useState } from 'react';
import { useEhrStore } from '@/stores/ehr-store';
import type {
  EhrLabReportPageItem,
  EhrMedicationPageItem,
  EhrConditionPageItem,
} from '@/types/ehr';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { ActionItemsCard, deriveActionItems } from './ActionItemsCard';
import { KpiGrid } from './KpiGrid';
import { TodayMedicationSchedule } from './TodayMedicationSchedule';
import { ActiveDiagnoses } from './ActiveDiagnoses';
import { EhrSkeleton } from '../ehr-skeleton';


export interface OverviewPageProps {
  personId: string;
  /** Wires the hero summary-stat strip and action-items card to the same
   *  hamburger-section modals the rest of the page uses. Callers pass the
   *  setActiveSection setter so we don't reimplement the modal stack here. */
  onOpenLabReports?: () => void;
  onOpenMedications?: () => void;
  onOpenConditions?: () => void;
  /** Open the report-upload modal (the "+ Add report" action). */
  onUploadReport?: () => void;
}

/** Overview homepage — the default landing for /ehr. Pulls labs/meds/
 *  conditions lazily via the store's page fetchers and renders a Helio-
 *  style dashboard: hero + summary, action items + KPI grid, medication
 *  schedule, active diagnoses.
 *
 *  Loading model: we render whatever data has resolved so far. Each block
 *  has its own quiet empty state, so the user sees the page filling in
 *  rather than a single global spinner.
 */
export function OverviewPage({
  personId,
  onOpenLabReports,
  onOpenMedications,
  onOpenConditions,
  onUploadReport,
}: OverviewPageProps) {
  const fetchLabReportsPage = useEhrStore(s => s.fetchLabReportsPage);
  const fetchMedicationsPage = useEhrStore(s => s.fetchMedicationsPage);
  const fetchConditionsPage = useEhrStore(s => s.fetchConditionsPage);
  const refreshSeq = useEhrStore(s => s.pageRefreshSeq[personId] ?? 0);

  const [reports, setReports] = useState<EhrLabReportPageItem[]>([]);
  const [medications, setMedications] = useState<EhrMedicationPageItem[]>([]);
  const [conditions, setConditions] = useState<EhrConditionPageItem[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // Single effect that fires all three page fetches in parallel. Each
  // setState is independent, so the UI renders incrementally as each
  // resolves — labs usually slowest, conditions fastest.
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      fetchLabReportsPage(personId),
      fetchMedicationsPage(personId),
      fetchConditionsPage(personId),
    ]).then(([labs, meds, conds]) => {
      if (cancelled) return;
      if (labs.status === 'fulfilled') setReports(labs.value);
      else logger.error('[Overview] lab reports fetch failed', serializeError(labs.reason));
      if (meds.status === 'fulfilled') setMedications(meds.value);
      else logger.error('[Overview] medications fetch failed', serializeError(meds.reason));
      if (conds.status === 'fulfilled') setConditions(conds.value);
      else logger.error('[Overview] conditions fetch failed', serializeError(conds.reason));
      setLoadedFor(personId);
    });
    return () => { cancelled = true; };
  }, [personId, refreshSeq, fetchLabReportsPage, fetchMedicationsPage, fetchConditionsPage]);

  const actionItems = deriveActionItems({
    reports,
    medications,
    conditions,
    onViewLatestReport: onOpenLabReports,
    onUploadReport,
  });

  // Hold the skeleton until all three fetches settle, instead of rendering
  // empty cards that pop in as each resolves.
  if (loadedFor !== personId) {
    return (
      <div className="mt-6">
        <EhrSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Action items (1 col) + KPI grid (2 cols). Stacks on mobile.
          items-start keeps each column at its natural content height so the
          right-hand KPI cards don't stretch to match the taller column. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:items-start">
        <div className="lg:col-span-1">
          <ActionItemsCard items={actionItems} onViewAll={onOpenLabReports} />
        </div>
        <div className="lg:col-span-2">
          <KpiGrid reports={reports} onViewAll={onOpenLabReports} />
        </div>
      </div>

      <TodayMedicationSchedule
        medications={medications}
        onOpenAll={onOpenMedications}
      />

      <ActiveDiagnoses
        conditions={conditions}
        onOpenAll={onOpenConditions}
      />
    </div>
  );
}
