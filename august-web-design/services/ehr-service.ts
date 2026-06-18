import axiosInstance from '@/lib/axios';
import { getActiveTenant } from '@/lib/tenant';
import logger from '@/utils/logger';
import { serializeError } from './error-reporter';
import type {
  FastenBootstrap,
  FastenStatusResponse,
  FastenConnectionEvent,
  EhrData,
  EhrConditionPageItem,
  EhrConditionPageResponse,
  EhrMedicationPageItem,
  EhrMedicationPageResponse,
  EhrEncounterPageItem,
  EhrEncounterPageResponse,
  EhrLabReportPageItem,
  EhrLabReportPageResponse,
  EhrProcedurePageItem,
  EhrProcedurePageResponse,
  EhrAllergyPageItem,
  EhrAllergyPageResponse,
  EhrImmunizationPageItem,
  EhrImmunizationPageResponse,
} from '@/types/ehr';

/**
 * Source tag the web client sends so Gatekeeper signs `fasten-web` into the
 * external_id and persists it on the connection / export-job rows. The mobile
 * app omits this, in which case the backend defaults to `fasten`.
 */
const FASTEN_WEB_SOURCE_TYPE = 'fasten-web';

interface FastenConfigResponse {
  success: boolean;
  data?: {
    customer_public_id?: string;
    api_mode?: string;
    external_id?: string;
    external_state?: string;
    person_id?: string;
  };
}

interface FastenDataResponse {
  success: boolean;
  data: Record<string, unknown>;
}

const extractFastenBootstrap = (response: FastenConfigResponse): FastenBootstrap => {
  const customerPublicId = response.data?.customer_public_id;
  const apiMode = response.data?.api_mode;
  const externalId = response.data?.external_id;
  const externalState = response.data?.external_state;
  const personId = response.data?.person_id;

  if (!customerPublicId || !apiMode || !externalId || !externalState || !personId) {
    throw new Error('Fasten bootstrap response is missing required fields');
  }

  return {
    customerPublicId,
    apiMode,
    externalId,
    externalState,
    personId,
  };
};

/**
 * Get Fasten bootstrap configuration for initializing the connection widget
 */
export async function getFastenBootstrap(
  personId?: string,
  apiMode?: 'test' | 'live'
): Promise<FastenBootstrap> {
  try {
    const url = `user/${getActiveTenant()}/fasten/config`;
    const response = await axiosInstance.get<FastenConfigResponse>(url, {
      params: {
        source_type: FASTEN_WEB_SOURCE_TYPE,
        ...(personId ? { personId } : {}),
        ...(apiMode ? { apiMode } : {}),
      },
      withCredentials: true,
    });
    return extractFastenBootstrap(response.data);
  } catch (error) {
    logger.error('[EHR] Error fetching fasten bootstrap', serializeError(error));
    throw error;
  }
}

/**
 * Get current Fasten connection status
 */
export async function getFastenStatus(): Promise<FastenStatusResponse> {
  try {
    const url = `user/${getActiveTenant()}/fasten/status`;
    const response = await axiosInstance.get<FastenStatusResponse>(url, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    logger.error('[EHR] Error fetching fasten status', serializeError(error));
    throw error;
  }
}

/**
 * Get EHR data from Fasten
 */
export async function getFastenData(): Promise<FastenDataResponse> {
  try {
    const url = `user/${getActiveTenant()}/fasten/data`;
    const response = await axiosInstance.get<FastenDataResponse>(url, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    logger.error('[EHR] Error fetching fasten data', serializeError(error));
    throw error;
  }
}

/**
 * Post a new Fasten connection event
 */
export async function postFastenConnection(
  event: FastenConnectionEvent
): Promise<unknown> {
  try {
    const url = `user/${getActiveTenant()}/fasten/connection`;
    // Tag the event as web-originated so the backend stamps `fasten-web` on the
    // connection / export-job rows even if it can't fall back to the external_id.
    const eventData = (event as { data?: Record<string, unknown> }).data;
    const payload = {
      ...event,
      source_type: FASTEN_WEB_SOURCE_TYPE,
      data: {
        ...eventData,
        source_type: FASTEN_WEB_SOURCE_TYPE,
        external_id: eventData?.external_id ?? event.external_id,
        external_state: eventData?.external_state ?? event.external_state,
      },
    };
    const response = await axiosInstance.post(url, payload, {
      withCredentials: true,
    });
    logger.info('[EHR] Fasten connection posted successfully');
    return response.data;
  } catch (error) {
    logger.error('[EHR] Error posting fasten connection', serializeError(error));
    throw error;
  }
}

/**
 * Disconnect a Fasten provider
 */
export async function disconnectFastenProvider(
  ehrExportJobId: string
): Promise<unknown> {
  try {
    const url = `user/${getActiveTenant()}/fasten/disconnect`;
    const response = await axiosInstance.post(
      url,
      { ehrExportJobId },
      { withCredentials: true }
    );
    logger.info('[EHR] Fasten provider disconnected successfully');
    return response.data;
  } catch (error) {
    logger.error('[EHR] Error disconnecting fasten provider', serializeError(error));
    throw error;
  }
}

/**
 * Get detailed conditions page data for the selected person.
 *
 * Wire envelope: { success: true, data: { items: EhrConditionPageItem[] } }.
 * Backend filters refuted/entered-in-error conditions and items whose subject
 * does not resolve to the patient before returning. See `src/types/ehr.ts`
 * page-contract conventions for resolution rules.
 */
export async function getConditionsPage(personId?: string): Promise<EhrConditionPageItem[]> {
  try {
    const url = `user/${getActiveTenant()}/ehr/conditions`;
    const response = await axiosInstance.get<EhrConditionPageResponse>(url, {
      params: personId ? { person_id: personId } : undefined,
      withCredentials: true,
    });
    if (!response.data?.success) throw new Error('Conditions page fetch failed');
    return response.data.data.items;
  } catch (error) {
    logger.error('[EHR] Error fetching conditions page', serializeError(error));
    throw error;
  }
}

/**
 * Get detailed medications page data for the selected person.
 *
 * Wire envelope: { success: true, data: { items: EhrMedicationPageItem[] } }.
 * Backend filters entered-in-error and statuses outside {active, completed,
 * stopped, onhold}, and items whose subject does not resolve to the patient.
 * See `src/types/ehr.ts` page-contract conventions for resolution rules.
 */
export async function getMedicationsPage(personId?: string): Promise<EhrMedicationPageItem[]> {
  try {
    const url = `user/${getActiveTenant()}/ehr/medications`;
    const response = await axiosInstance.get<EhrMedicationPageResponse>(url, {
      params: personId ? { person_id: personId } : undefined,
      withCredentials: true,
    });
    if (!response.data?.success) throw new Error('Medications page fetch failed');
    return response.data.data.items;
  } catch (error) {
    logger.error('[EHR] Error fetching medications page', serializeError(error));
    throw error;
  }
}

/**
 * Get detailed encounters page data for the selected person.
 *
 * Wire envelope: { success: true, data: { items: EhrEncounterPageItem[] } }.
 * Backend excludes cancelled and entered-in-error encounters; vitals are
 * derived from category=vital-signs Observations referencing the encounter.
 */
export async function getEncountersPage(personId?: string): Promise<EhrEncounterPageItem[]> {
  try {
    const url = `user/${getActiveTenant()}/ehr/encounters`;
    const response = await axiosInstance.get<EhrEncounterPageResponse>(url, {
      params: personId ? { person_id: personId } : undefined,
      withCredentials: true,
    });
    if (!response.data?.success) throw new Error('Encounters page fetch failed');
    return response.data.data.items;
  } catch (error) {
    logger.error('[EHR] Error fetching encounters page', serializeError(error));
    throw error;
  }
}

/**
 * Get detailed lab reports page data for the selected person.
 *
 * Wire envelope: { success: true, data: { items: EhrLabReportPageItem[] } }.
 * Each report embeds its result observations; out-of-range flags are derived
 * server-side from value/reference-range/interpretation when reliable.
 */
export async function getLabReportsPage(personId?: string): Promise<EhrLabReportPageItem[]> {
  try {
    const url = `user/${getActiveTenant()}/ehr/lab-reports`;
    const response = await axiosInstance.get<EhrLabReportPageResponse>(url, {
      params: personId ? { person_id: personId } : undefined,
      withCredentials: true,
    });
    if (!response.data?.success) throw new Error('Lab reports page fetch failed');
    return response.data.data.items;
  } catch (error) {
    logger.error('[EHR] Error fetching lab reports page', serializeError(error));
    throw error;
  }
}

/**
 * Get detailed procedures page data for the selected person.
 *
 * Wire envelope: { success: true, data: { items: EhrProcedurePageItem[] } }.
 * Backend excludes entered-in-error procedures; `based_on` expands CarePlan
 * and ServiceRequest summaries inline (CarePlan has no standalone page).
 */
export async function getProceduresPage(personId?: string): Promise<EhrProcedurePageItem[]> {
  try {
    const url = `user/${getActiveTenant()}/ehr/procedures`;
    const response = await axiosInstance.get<EhrProcedurePageResponse>(url, {
      params: personId ? { person_id: personId } : undefined,
      withCredentials: true,
    });
    if (!response.data?.success) throw new Error('Procedures page fetch failed');
    return response.data.data.items;
  } catch (error) {
    logger.error('[EHR] Error fetching procedures page', serializeError(error));
    throw error;
  }
}

/**
 * Get detailed allergies page data for the selected person.
 *
 * Wire envelope: { success: true, data: { items: EhrAllergyPageItem[] } }.
 * `status` is clinicalStatus only; verificationStatus is used for filtering
 * (refuted/entered-in-error excluded) but is not displayed.
 */
export async function getAllergiesPage(personId?: string): Promise<EhrAllergyPageItem[]> {
  try {
    const url = `user/${getActiveTenant()}/ehr/allergies`;
    const response = await axiosInstance.get<EhrAllergyPageResponse>(url, {
      params: personId ? { person_id: personId } : undefined,
      withCredentials: true,
    });
    if (!response.data?.success) throw new Error('Allergies page fetch failed');
    return response.data.data.items;
  } catch (error) {
    logger.error('[EHR] Error fetching allergies page', serializeError(error));
    throw error;
  }
}

/**
 * Get detailed immunizations page data for the selected person.
 *
 * Wire envelope: { success: true, data: { items: EhrImmunizationPageItem[] } }.
 * `location` and `manufacturer` render from Reference.display because Location
 * and Organization root pages are out of scope for this iteration.
 */
export async function getImmunizationsPage(personId?: string): Promise<EhrImmunizationPageItem[]> {
  try {
    const url = `user/${getActiveTenant()}/ehr/immunizations`;
    const response = await axiosInstance.get<EhrImmunizationPageResponse>(url, {
      params: personId ? { person_id: personId } : undefined,
      withCredentials: true,
    });
    if (!response.data?.success) throw new Error('Immunizations page fetch failed');
    return response.data.data.items;
  } catch (error) {
    logger.error('[EHR] Error fetching immunizations page', serializeError(error));
    throw error;
  }
}

// ── Report uploads ──────────────────────────────────────────────

export interface ReportUploadResponse {
  request_id: string;
  message_id: string;
  person_id: string;
  status: 'queued';
}

export interface ReportUploadStatus {
  uploaded_report_count: number;
  processed_report_count: number;
  ehr_queued_count: number;
  ehr_complete_count: number;
  ehr_failed_count: number;
  /** Per-report metadata once processing has produced rows. Used by the
   *  review UI (profile mismatch card, date cell). Missing on older
   *  responses. */
  reports?: ReportUploadStatusRow[];
}

export interface ReportUploadStatusRow {
  request_id: string;
  report_id: string;
  /** Current owner of the report. May differ from the person the user
   *  was viewing at upload time if a reassign has happened. */
  person_id: string;
  /** Parser-extracted report date, ISO. Null if the parser couldn't
   *  find one or it was cleared. */
  report_date: string | null;
  /** Patient name pulled by the LLM from the report itself. The review
   *  card compares this against the target person's name to surface
   *  potential mismatches. */
  extracted_patient_name: string | null;
  type: string | null;
  original_lab: string | null;
  /** FHIR build state for this report. 'pending' = not yet queued. */
  ehr_state: 'pending' | 'queued' | 'building' | 'complete' | 'failed' | 'skipped';
}

/**
 * Queue an uploaded report for extraction + FHIR build.
 * `file` is the URL returned by the existing media-upload endpoint.
 * Pass `personId` only for dependent/person views — omit for self.
 */
export async function submitReportUpload(args: {
  file: string;
  personId?: string;
  docType?: string | null;
}): Promise<ReportUploadResponse> {
  try {
    const url = `user/${getActiveTenant()}/ehr/report-uploads`;
    const response = await axiosInstance.post<{ success: boolean; data: ReportUploadResponse }>(
      url,
      {
        file: args.file,
        ...(args.personId ? { person_id: args.personId } : {}),
        doc_type: args.docType ?? null,
      },
      { withCredentials: true },
    );
    if (!response.data?.success) throw new Error('Report upload submit failed');
    return response.data.data;
  } catch (error) {
    logger.error('[EHR] Error submitting report upload', serializeError(error));
    throw error;
  }
}

/**
 * Poll aggregate processing status for the given request IDs.
 * Pass `personId` only for dependent views — omit for self.
 */
export async function getReportUploadStatus(args: {
  requestIds: string[];
  personId?: string;
}): Promise<ReportUploadStatus> {
  try {
    const url = `user/${getActiveTenant()}/ehr/report-uploads/status`;
    const response = await axiosInstance.get<{ success: boolean; data: ReportUploadStatus }>(url, {
      params: {
        request_ids: args.requestIds.join(','),
        ...(args.personId ? { person_id: args.personId } : {}),
      },
      withCredentials: true,
    });
    if (!response.data?.success) throw new Error('Report upload status fetch failed');
    return response.data.data;
  } catch (error) {
    logger.error('[EHR] Error fetching report upload status', serializeError(error));
    throw error;
  }
}

/**
 * Move an uploaded report to a different family-member person after the
 * extraction reveals a name mismatch. Backend clears the old FHIR export
 * job; the next status poll will trigger a rebuild under the new person.
 */
export async function reassignReportUpload(args: {
  requestId: string;
  personId: string;
}): Promise<{ request_id: string; report_id: string; person_id: string }> {
  try {
    const url = `user/${getActiveTenant()}/ehr/report-uploads/${encodeURIComponent(args.requestId)}/reassign`;
    const response = await axiosInstance.put<{ success: boolean; data: any }>(
      url,
      { person_id: args.personId },
      { withCredentials: true },
    );
    if (!response.data?.success) throw new Error('Report upload reassign failed');
    return response.data.data;
  } catch (error) {
    logger.error('[EHR] Error reassigning report upload', serializeError(error));
    throw error;
  }
}

/**
 * Override the parser-extracted report date. Pass `null` to clear an
 * incorrect parsed date back to no-date.
 */
export async function updateReportUploadDate(args: {
  requestId: string;
  /** ISO date string or null to clear. */
  reportDate: string | null;
}): Promise<{ request_id: string; report_id: string; person_id: string; report_date: string | null }> {
  try {
    const url = `user/${getActiveTenant()}/ehr/report-uploads/${encodeURIComponent(args.requestId)}/date`;
    const response = await axiosInstance.put<{ success: boolean; data: any }>(
      url,
      { report_date: args.reportDate },
      { withCredentials: true },
    );
    if (!response.data?.success) throw new Error('Report upload date update failed');
    return response.data.data;
  } catch (error) {
    logger.error('[EHR] Error updating report upload date', serializeError(error));
    throw error;
  }
}

// ── Report library (per-person list + soft-delete) ──────────────

export interface ReportLibraryItem {
  request_id: string;
  report_id: string;
  person_id: string;
  /** Parser-extracted report date (ISO). Null if the parser couldn't
   *  find one or the user cleared it. */
  report_date: string | null;
  /** Upload timestamp (ISO). Always set; useful as a fallback when
   *  report_date is null. */
  timestamp: string | null;
  /** Patient name pulled by the LLM from the report itself. */
  extracted_patient_name: string | null;
  type: string | null;
  original_lab: string | null;
  /** True when the user soft-removed this report. Removed rows are
   *  excluded from the default list — pass include_removed=true to see
   *  them. */
  removed: boolean;
  /** FHIR build state for this report. */
  ehr_state: 'pending' | 'building' | 'complete' | 'skipped' | 'failed' | 'removed';
}

/**
 * List uploaded reports attached to a given person. Removed reports are
 * excluded by default; pass `includeRemoved` to surface them.
 */
export async function listReportUploads(args: {
  personId: string;
  includeRemoved?: boolean;
}): Promise<ReportLibraryItem[]> {
  try {
    const url = `user/${getActiveTenant()}/ehr/report-uploads`;
    const response = await axiosInstance.get<{ success: boolean; data: { reports: ReportLibraryItem[] } }>(
      url,
      {
        params: {
          person_id: args.personId,
          ...(args.includeRemoved ? { include_removed: true } : {}),
        },
        withCredentials: true,
      },
    );
    if (!response.data?.success) throw new Error('Report library fetch failed');
    return response.data.data.reports;
  } catch (error) {
    logger.error('[EHR] Error fetching report library', serializeError(error));
    throw error;
  }
}

export interface DeleteReportUploadResult {
  request_id: string;
  report_id: string;
  person_id: string;
  removed: true;
  removed_at: string;
  disconnected_job_count: number;
}

/**
 * Soft-delete a report from a person's record. The backend disconnects
 * the report's FHIR export job and the parsed rows drop out of the
 * per-section page endpoints — callers should invalidate page caches
 * for the affected person on success.
 */
export async function deleteReportUpload(args: {
  requestId: string;
  personId: string;
}): Promise<DeleteReportUploadResult> {
  try {
    const url = `user/${getActiveTenant()}/ehr/report-uploads/${encodeURIComponent(args.requestId)}`;
    const response = await axiosInstance.delete<{ success: boolean; data: DeleteReportUploadResult }>(
      url,
      {
        params: { person_id: args.personId },
        withCredentials: true,
      },
    );
    if (!response.data?.success) throw new Error('Report delete failed');
    return response.data.data;
  } catch (error) {
    logger.error('[EHR] Error deleting report upload', serializeError(error));
    throw error;
  }
}

// ── Report preview (signed URL for the original upload) ─────────

export interface ReportPreviewData {
  id: string;
  report_id: string;
  request_id: string;
  person_id: string;
  /** Signed URL pointing to the original uploaded file. Short-lived;
   *  fetch fresh on each open. */
  url: string;
  thumbnail_url?: string | null;
  thumbnailUrl?: string | null;
  title?: string | null;
  /** Report category (e.g. BLOOD_REPORT, RADIOLOGY_REPORT) — not a
   *  mime type. Use the URL extension to pick a renderer. */
  type?: string | null;
  timestamp?: string | null;
  report_date?: string | null;
  reportDate?: string | null;
  canViewInsights?: boolean;
}

/**
 * Fetch a signed preview URL for a single uploaded report. Backend hides
 * soft-removed rows (404) and optionally validates `personId` ownership.
 */
export async function getReportPreview(args: {
  requestId: string;
  personId?: string;
}): Promise<ReportPreviewData> {
  try {
    const url = `user/${getActiveTenant()}/ehr/report-uploads/${encodeURIComponent(args.requestId)}/preview`;
    const response = await axiosInstance.get<{ success: boolean; data: ReportPreviewData }>(
      url,
      {
        params: args.personId ? { person_id: args.personId } : undefined,
        withCredentials: true,
      },
    );
    if (!response.data?.success) throw new Error('Report preview fetch failed');
    return response.data.data;
  } catch (error) {
    logger.error('[EHR] Error fetching report preview', serializeError(error));
    throw error;
  }
}

// Helper to parse EHR data response (handles both keyed and flat formats)
export function parseEhrDataResponse(
  response: FastenDataResponse
): { providers: Record<string, { platformType: string; ehr: EhrData }>; isMultiProvider: boolean } {
  const data = response.data;

  // Check if it's the keyed format (multiple providers)
  const firstKey = Object.keys(data)[0];
  if (
    firstKey &&
    typeof data[firstKey] === 'object' &&
    data[firstKey] !== null &&
    'platform_type' in (data[firstKey] as Record<string, unknown>)
  ) {
    // Keyed format: { jobId: { platform_type, ehr } }
    const providers: Record<string, { platformType: string; ehr: EhrData }> = {};
    for (const [jobId, value] of Object.entries(data)) {
      const providerData = value as { platform_type: string; ehr: EhrData };
      providers[jobId] = {
        platformType: providerData.platform_type,
        ehr: providerData.ehr,
      };
    }
    return { providers, isMultiProvider: true };
  }

  // Flat format (legacy single provider)
  return {
    providers: {
      default: {
        platformType: 'unknown',
        ehr: data as unknown as EhrData,
      },
    },
    isMultiProvider: false,
  };
}

// Merge EHR data from multiple providers
export function mergeEhrData(
  providers: Record<string, { platformType: string; ehr: EhrData }>
): EhrData {
  const merged: EhrData = {
    patient_profiles: [],
    encounters: [],
    conditions: [],
    medications: [],
    allergies: [],
    procedures: [],
    observations: {
      laboratory: [],
      'vital-signs': [],
      'social-history': [],
      uncategorized: [],
    },
    diagnostic_reports: [],
    immunizations: [],
    care_plans: [],
    clinical_notes: [],
    connections: [],
    export_jobs: [],
  };

  for (const { ehr } of Object.values(providers)) {
    if (!ehr) continue;

    merged.patient_profiles.push(...(ehr.patient_profiles || []));
    merged.encounters.push(...(ehr.encounters || []));
    merged.conditions.push(...(ehr.conditions || []));
    merged.medications.push(...(ehr.medications || []));
    merged.allergies.push(...(ehr.allergies || []));
    merged.procedures.push(...(ehr.procedures || []));
    merged.diagnostic_reports.push(...(ehr.diagnostic_reports || []));
    merged.immunizations.push(...(ehr.immunizations || []));
    merged.care_plans.push(...(ehr.care_plans || []));
    merged.clinical_notes.push(...(ehr.clinical_notes || []));
    merged.connections.push(...(ehr.connections || []));
    merged.export_jobs.push(...(ehr.export_jobs || []));

    // Merge observations by category
    if (ehr.observations) {
      merged.observations.laboratory.push(...(ehr.observations.laboratory || []));
      merged.observations['vital-signs'].push(...(ehr.observations['vital-signs'] || []));
      merged.observations['social-history'].push(...(ehr.observations['social-history'] || []));
      merged.observations.uncategorized.push(...(ehr.observations.uncategorized || []));
    }
  }

  return merged;
}
