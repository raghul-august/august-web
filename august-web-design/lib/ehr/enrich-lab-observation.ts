import { lookupBiomarker, type BiomarkerFriendlyName, type LabFlagBucket } from '@/data/biomarker-friendly-names';

/**
 * Frontend-only enrichment of a lab observation with a friendly name, a
 * technical subtitle, and a status-driven plain-English note. Lives here
 * until the backend ships `Observation.code.text = patient_friendly_name`,
 * at which point this layer is unnecessary and the data source flips.
 *
 * Gated by `NEXT_PUBLIC_EHR_MOCK_BIOMARKER_METADATA` so a single env flip
 * disables the mock once real data lands.
 */

export interface EnrichedLabMetadata {
  friendly: string | null;
  technical: string | null;
  interpretation: string | null;
  conditions: string[];
}

const ENABLED = process.env.NEXT_PUBLIC_EHR_MOCK_BIOMARKER_METADATA === 'true';

function flagToBucket(flag: 'high' | 'low' | 'ok' | 'flagged' | null): LabFlagBucket {
  if (flag === 'high' || flag === 'flagged') return 'high';
  if (flag === 'low') return 'low';
  return 'normal';
}

export function enrichObservation(
  rawName: string | null | undefined,
  flag: 'high' | 'low' | 'ok' | 'flagged' | null,
): EnrichedLabMetadata {
  const empty: EnrichedLabMetadata = {
    friendly: null,
    technical: null,
    interpretation: null,
    conditions: [],
  };
  if (!ENABLED) return empty;
  const entry: BiomarkerFriendlyName | null = lookupBiomarker(rawName);
  if (!entry) return empty;
  const bucket = flagToBucket(flag);
  const interpretation =
    entry.interpretation?.[bucket] ?? entry.interpretation?.normal ?? null;
  return {
    friendly: entry.friendly,
    technical: entry.technical,
    interpretation,
    conditions: entry.conditions ?? [],
  };
}
