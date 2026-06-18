/*
 * Drug-intrinsic metadata for the chat sidebar — keyed by medication id.
 *
 * What lives here vs. elsewhere:
 *   - drugClass / brand / mechanism are intrinsic to the medication. They
 *     never vary by patient, so they live in code as a static lookup.
 *   - The dose-form hero render is resolved by id in _medications.ts
 *     (Medication.tabletImage), driven straight off medications.json — it
 *     doesn't belong in this decorative copy table.
 *   - dose / sig / refills / prescriber are per-prescription and live in
 *     medications.json under each entry's `prescription` field (today as
 *     mock data; eventually fetched from DoseSpot or whichever script
 *     service replaces it).
 *
 * If a medication id is in the catalog but not here, getMedicationMeta()
 * returns null and the sidebar falls back to the catalog entry (no
 * mechanism blurb), still rendering its tablet image.
 */
export type MedicationMeta = {
  drugClass: string;
  brand: string;
  mechanism: string;
};

export const MEDICATION_META: Record<string, MedicationMeta> = {
  metformin: {
    drugClass: 'Biguanide',
    brand: 'Glucophage',
    mechanism: 'Reduces glucose production in the liver.',
  },
  apixaban: {
    drugClass: 'Anticoagulant',
    brand: 'Eliquis',
    mechanism: 'Blocks factor Xa so blood clots form less easily.',
  },
  bupropion: {
    drugClass: 'Antidepressant',
    brand: 'Wellbutrin',
    mechanism: 'Boosts dopamine and norepinephrine.',
  },
  famotidine: {
    drugClass: 'H2 blocker',
    brand: 'Pepcid',
    mechanism: 'Blocks the histamine signal that triggers stomach acid.',
  },
  flecainide: {
    drugClass: 'Antiarrhythmic',
    brand: 'Tambocor',
    mechanism: 'Slows electrical signals in the heart.',
  },
};

export function getMedicationMeta(id: string | null | undefined): MedicationMeta | null {
  if (!id) return null;
  return MEDICATION_META[id] ?? null;
}
