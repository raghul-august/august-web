import type { StaticImageData } from 'next/image';
import data from './medications.json';
import ozempicImage from '@/assets/prescription-refill/packaging/ozempic.webp';
import metforminImage from '@/assets/prescription-refill/packaging/metformin.webp';
import apixabanImage from '@/assets/prescription-refill/packaging/apixaban.webp';
import bupropionImage from '@/assets/prescription-refill/packaging/bupropion.webp';
import famotidineImage from '@/assets/prescription-refill/packaging/famotidine.webp';
import flecainideImage from '@/assets/prescription-refill/packaging/flecainide.webp';
import tabletVialTemplate from '@/assets/prescription-refill/templates/transparent_tablet_prescription_vial_.webp';
import capsuleVialTemplate from '@/assets/prescription-refill/templates/opaque_prescription_vial_.webp';
import eyeDropsTemplate from '@/assets/prescription-refill/templates/opaque-eye-drops.webp';
import nasalSprayTemplate from '@/assets/prescription-refill/templates/opaque-nasal-spray.webp';
import oralRinseTemplate from '@/assets/prescription-refill/templates/transparent-oral-rinse.webp';
import oralLiquidTemplate from '@/assets/prescription-refill/templates/transparent-oral-liquid-bottle.webp';
import medicalTubeTemplate from '@/assets/prescription-refill/templates/opaque-medical-tube.webp';
import patchPouchTemplate from '@/assets/prescription-refill/templates/patch_pouch.webp';

/*
 * Single source of truth: medications.json holds the catalog (id, name, dose,
 * image filename, prescription mock). Image assets must be statically imported
 * here so Next/Webpack can bundle them — JSON can only reference filenames.
 * To add a new medication: add an entry to medications.json, drop the image
 * into /assets/prescription-refill/packaging/, and wire it into IMAGES below.
 */

const IMAGES: Record<string, StaticImageData> = {
  'ozempic.webp': ozempicImage,
  'metformin.webp': metforminImage,
  'apixaban.webp': apixabanImage,
  'bupropion.webp': bupropionImage,
  'famotidine.webp': famotidineImage,
  'flecainide.webp': flecainideImage,
};

// Packaging template renders, keyed by the `packaging_image` filename in
// medications.json. One generic image per dose-form container (pill vial,
// dropper, tube, etc.) — reused across every medication of that form.
const PACKAGING_IMAGES: Record<string, StaticImageData> = {
  'transparent_tablet_prescription_vial_.webp': tabletVialTemplate,
  'opaque_prescription_vial_.webp': capsuleVialTemplate,
  'opaque-eye-drops.webp': eyeDropsTemplate,
  'opaque-nasal-spray.webp': nasalSprayTemplate,
  'transparent-oral-rinse.webp': oralRinseTemplate,
  'transparent-oral-liquid-bottle.webp': oralLiquidTemplate,
  'opaque-medical-tube.webp': medicalTubeTemplate,
  'patch_pouch.webp': patchPouchTemplate,
};

// Loose dose-form renders live in /assets/prescription-refill/<DoseForm>,
// one folder per `doseForm` value (Tablet, Capsule, Patch), each holding
// <id>.webp files named exactly by medication id plus a `generic.webp`
// fallback. require.context bundles each folder, so adding a drug's render
// is just dropping <id>.webp into the folder for its form — no import
// statement or lookup map to maintain here.
type ImageContext = {
  keys(): string[];
  (id: string): { default: StaticImageData };
};
type RequireWithContext = {
  context: (directory: string, useSubdirectories: boolean, regExp: RegExp) => ImageContext;
};

const toImageMap = (ctx: ImageContext): Record<string, StaticImageData> =>
  Object.fromEntries(
    ctx.keys().map((key) => [
      key.replace(/^\.\//, '').replace(/\.webp$/, ''),
      ctx(key).default,
    ]),
  );

// Keyed by doseForm so resolution is a direct medications.json lookup. Forms
// without a folder (Liquid, Spray, …) fall back to the packaging container.
const FORM_IMAGES: Record<string, Record<string, StaticImageData>> = {
  Tablet: toImageMap(
    (require as unknown as RequireWithContext).context(
      '../../assets/prescription-refill/Tablet',
      false,
      /\.webp$/,
    ),
  ),
  Capsule: toImageMap(
    (require as unknown as RequireWithContext).context(
      '../../assets/prescription-refill/Capsule',
      false,
      /\.webp$/,
    ),
  ),
  Patch: toImageMap(
    (require as unknown as RequireWithContext).context(
      '../../assets/prescription-refill/Patch',
      false,
      /\.webp$/,
    ),
  ),
};

export type Prescription = {
  dose?: string;
  sig: string;
  dispense: string;
  refills: string;
  prescribedDaysAgo: number;
  prescriber: string;
  credential: string;
};

export type Medication = {
  id: string;
  name: string;
  image?: StaticImageData;
  // Generic dose-form packaging render (pill vial, dropper, tube, etc.),
  // resolved from `packaging_image` in medications.json. Used as the hero
  // fallback when a medication has no curated `image`.
  packagingImage?: StaticImageData;
  // Loose dose-form render for the chat sidebar hero: the drug's own
  // <DoseForm>/<id>.webp when present, else that form's generic, else the
  // packaging container (forms without a folder — liquids, sprays). Resolved
  // by doseForm + id — no per-drug wiring.
  tabletImage?: StaticImageData;
  conditions?: string[];
  drugClass?: string;
  prescription?: Prescription;
  // Tablet / Capsule / Solution / etc. Used to strip the form suffix
  // off `prescription.dose` ("50 mg tablet" → "50 mg") when building
  // patient-facing labels.
  doseForm?: string;
};

type RawEntry = {
  name: string;
  image?: string;
  packaging_image?: string;
  conditions?: string[];
  drugClass?: string;
  prescription?: Prescription;
  doseForm?: string;
};

export const MEDICATIONS: Medication[] = Object.entries(
  data as Record<string, RawEntry>
).map(([id, m]) => {
  const packagingImage = m.packaging_image
    ? PACKAGING_IMAGES[m.packaging_image]
    : undefined;
  // Render for the drug's form: its own <id>.webp from the matching folder,
  // else that folder's generic, else (forms with no folder — liquids,
  // sprays) the packaging container so the hero never misrepresents the form.
  const formImages = m.doseForm ? FORM_IMAGES[m.doseForm] : undefined;
  const tabletImage =
    formImages?.[id] ?? formImages?.['generic'] ?? packagingImage;

  return {
    id,
    name: m.name,
    image: m.image ? IMAGES[m.image] : undefined,
    packagingImage,
    tabletImage,
    conditions: m.conditions,
    drugClass: m.drugClass,
    prescription: m.prescription,
    doseForm: m.doseForm,
  };
});
