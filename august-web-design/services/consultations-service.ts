import axiosInstance from '@/lib/axios';
import { getActiveTenant } from '@/lib/tenant';

const consultationBase = () => `/consultations/${getActiveTenant()}`;

export interface DifferentialDiagnosis {
  id: string;
  user_id: string;
  episode_id: string;
  patient_id: string | null;
  encounter_id: string | null;
  visit_reason: string | null;
  summary: string | null;
  soap_note: string | null;
  possible_diagnosis: string | null;
  intake_flow: 'specific_urgent_care_offering' | 'generic_urgent_care_offering' | null;
  offering_ids: string[];
}

export interface IntakeQuestion {
  question_id: string;
  slug: string;
  title: string;
  description?: string | null;
  type: string;
  options: any;
  offering_id: string;
  requirement_kind: string;
  display_order: number;
  august_answer_value?: {
    text?: string;
    number?: number;
    option_id?: string;
    option_ids?: string[];
    single_option?: string;
    multiple_option?: string[];
    note?: string;
  } | null;
}

export interface DifferentialDiagnosisBootstrap extends DifferentialDiagnosis {
  pending_questions: IntakeQuestion[];
}

export const getDifferentialDiagnosis = async (id: string, age?: number | null) => {
  const params: Record<string, string> = { id };
  if (typeof age === 'number' && Number.isFinite(age)) params.age = String(age);
  const { data } = await axiosInstance.get(`${consultationBase()}/get-differential-diagnosis`, { params });
  return data as DifferentialDiagnosisBootstrap;
};

// `answer_value` shape mirrors the backend JSONB column:
//   text            -> { text: string }
//   single_option   -> { option_id: string, note?: string }
//   multiple_option -> { option_ids: string[], note?: string }
//   file            -> { file_ids: string[], note?: string }
//   number          -> { number: number, note?: string }
export type IntakeAnswerValue =
  | { text: string }
  | { option_id: string; note?: string }
  | { option_ids: string[]; note?: string }
  | { file_ids: string[]; note?: string }
  | { number: number; note?: string };

export const submitIntakeAnswer = async (params: {
  differential_diagnosis_id: string;
  question_id: string;
  answer_value: IntakeAnswerValue;
}) => {
  const { data } = await axiosInstance.post(`${consultationBase()}/submit-intake-answer`, params);
  return data as { ok: boolean; status?: 'disqualified'; encounter_id?: string; answer?: unknown };
};

// Backend returns `status: 'disqualified'` only when every candidate offering
// failed its required intake questions. Absence means the user is eligible —
// proceed with the normal flow.
export const completeIntake = async (differential_diagnosis_id: string, encounter_id?: string) => {
  const { data } = await axiosInstance.post(`${consultationBase()}/complete-intake`, { differential_diagnosis_id, encounter_id });
  return data as { ok: boolean; status?: 'disqualified' };
};

export const selectExistingPatient = async (params: {
  differential_diagnosis_id: string;
  patient_id: string;
}) => {
  const { data } = await axiosInstance.post(`${consultationBase()}/select-patient`, params);
  return data as { ok: boolean; patient: PatientRecord };
};

export interface CreatePatientPayload {
  prefix?: string;
  first_name: string;
  last_name: string;
  gender: number;
  date_of_birth: string;
  phone_number: string;
  phone_type: number;
  email: string;
  address: { address: string; address2?: string; zip_code: string; city_name: string; state_name: string };
  height?: number;
  weight?: number;
  pregnancy?: boolean;
  allergies?: string;
  special_necessities?: string;
  current_medications?: string;
  medical_conditions?: string;
  // Pre-payment flow only — binds the new patient to the in-progress DD.
  differential_diagnosis_id?: string;
}

export const createPatient = async (payload: CreatePatientPayload) => {
  const { data } = await axiosInstance.post(`${consultationBase()}/create-patient`, payload);
  return data;
};

export interface PatientRecord {
  id: string;
  user_id: string;
  provider: string;
  provider_patient_id: string;
  legal_first_name: string | null;
  legal_last_name: string | null;
  date_of_birth: string | null;
  gender?: number | string | null;
  gender_at_birth?: number | string | null;
  email: string | null;
  phone: string | null;
  driver_license_id: string | null;
  is_av_consultation_flow: boolean | null;
  is_sync: boolean | null;
  intro_video_id: string | null;
  address?: string | null;
  address2?: string | null;
  city_name?: string | null;
  state_name?: string | null;
  zip_code?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  // Derived (only populated by /get-patient) — true when the patient has
  // any row in user_preferred_pharmacies. Lets the post-payment flow
  // skip the pharmacy step on reload.
  has_preferred_pharmacy?: boolean;
  preferred_pharmacy_name?: string | null;
  created_at: string;
  updated_at: string;
}

export const listPatients = async () => {
  const { data } = await axiosInstance.get(`${consultationBase()}/get-patients`);
  return (data?.patients ?? []) as PatientRecord[];
};

// Single-patient lookup. Used by the pharmacy step to read zip_code so we
// can fetch nearby pharmacies without re-listing everything.
export const getPatient = async (patient_id: string) => {
  const { data } = await axiosInstance.get(`${consultationBase()}/get-patient`, { params: { patient_id } });
  return (data?.patient ?? null) as (PatientRecord & { zip_code?: string | null }) | null;
};

export interface EncounterRecord {
  id: string;
  user_id: string;
  status: string;
  outcome: string | null;
  patient_id: string | null;
  clinician_id: string | null;
  provider_encounter_id: string | null;
  episode_id: string;
  created_at: string;
  updated_at: string;
  patient_first_name: string | null;
  patient_last_name: string | null;
  clinician_first_name: string | null;
  clinician_last_name: string | null;
  clinician_suffix: string | null;
  clinician_speciality: string | null;
  clinician_photo_url: string | null;
  visit_reason: string | null;
  has_unread: boolean;
}

export const listEncounters = async () => {
  const { data } = await axiosInstance.get(`${consultationBase()}/encounters`);
  return (data?.encounters ?? []) as EncounterRecord[];
};

export const markEncounterRead = async (encounter_id: string) => {
  const { data } = await axiosInstance.post(`${consultationBase()}/mark-read`, { encounter_id });
  return data as { ok: boolean; updated: number };
};

export const createCheckoutSession = async (params: { episode_id: string; differential_diagnosis_id?: string; patient_id: string; email?: string }) => {
  let data: {
    checkout_session_id?: string;
    encounter_id?: string;
    client_secret?: string;
  };
  try {
    ({ data } = await axiosInstance.post(`${consultationBase()}/stripe/create-checkout-session`, params));
  } catch (err: any) {
    const payload = err?.response?.data;
    const code = typeof payload?.error === 'string' ? payload.error : null;
    const detail = typeof payload?.detail === 'string' ? payload.detail : null;
    if (code) {
      throw new Error(`${code}${detail ? `: ${detail}` : ''}`);
    }
    throw err;
  }

  if (!data.client_secret) {
    throw new Error('Backend returned no client_secret');
  }

  return data as {
    checkout_session_id: string;
    encounter_id: string;
    client_secret: string;
  };
};

export interface ClinicianDetail {
  id: string;
  first_name: string | null;
  last_name: string | null;
  suffix: string | null;
  speciality: string | null;
  photo_url: string | null;
  email: string | null;
  phone_number: string | null;
  bio: string | null;
  npi: string | null;
  dea: string | null;
  practice_areas: string | null;
}

export interface EncounterDetail {
  id: string;
  status: string;
  outcome: string | null;
  episode_id: string;
  patient_id: string | null;
  clinician_id: string | null;
  provider_encounter_id: string | null;
  created_at: string;
  // Null when synthesized from an EncounterRecord (see encounter-prefetch.ts),
  // which doesn't carry expiry.
  expires_at: string | null;
  visit_reason: string | null;
  summary: string | null;
  soap_note: string | null;
  possible_diagnosis: string | null;
  consult_state?: string | null;
  clinician: ClinicianDetail | null;
}

export const setConsultLocation = async (params: { encounter_id: string; consult_location: string }) => {
  const { data } = await axiosInstance.post(`${consultationBase()}/set-consult-location`, params);
  return data as { ok: boolean };
};

export const getEncounter = async (encounter_id: string) => {
  const { data } = await axiosInstance.get(`${consultationBase()}/get-encounter`, { params: { encounter_id } });
  console.log('getEncounter response data:', data);
  return data as EncounterDetail;
};

// Local-only chat log fetch (no MDI round-trip). Webhook mirrors all MDI
// messages into telehealth_chat_logs; this just reads them back.
export const listEncounterMessages = async (encounter_id: string) => {
  const { data } = await axiosInstance.get(`${consultationBase()}/get-telehealth-chat-logs`, { params: { encounter_id } });
  return (data?.chat_logs ?? []) as ChatLog[];
};

// MDI's `/v1/partner/files` rejects with `CorruptedPathDetected` when the
// multipart Content-Disposition `filename` has characters its storage path
// can't handle (spaces, multiple dots, special chars — common with Mac
// screenshots like "Screenshot 2026-05-10 at 9.37.31 AM.png"). The third
// arg to FormData.append overrides only the `filename` parameter in the
// multipart header; the File's bytes/type are sent unchanged.
function safeFilename(file: File, prefix: string, fallbackExt: string): string {
  const mime = (file.type || '').toLowerCase().split(';')[0].trim();
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  };
  const ext = extMap[mime] || fallbackExt;
  return `${prefix}_${Date.now()}.${ext}`;
}

// Encounter-independent file upload (usable during pre-payment intake).
// Uploads to MDI as type=document and returns the file metadata; the caller
// stores `url` on the intake answer.
export const uploadMedia = async (params: { file: File }) => {
  const form = new FormData();
  form.append('file', params.file, safeFilename(params.file, 'media', 'bin'));
  const { data } = await axiosInstance.post(`${consultationBase()}/upload-media`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data as { ok: boolean; file_id: string; url: string | null; name: string; mime_type: string };
};

export const uploadDriverLicense = async (params: { encounter_id: string; file: File }) => {
  const form = new FormData();
  form.append('encounter_id', params.encounter_id);
  form.append('file', params.file, safeFilename(params.file, 'drivers_license', 'jpg'));
  // 'multipart/form-data' (no boundary) tells axios to detect the FormData
  // body and fill in the correct boundary automatically. Don't use
  // `undefined` — that falls back to the instance default
  // (`application/json`) and JSON-stringifies the body (file becomes `{}`).
  const { data } = await axiosInstance.post(`${consultationBase()}/upload-driver-license`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data as { ok: boolean; file_id: string; file_url: string | null; encounter_status: string };
};

export const uploadIntroVideo = async (params: { encounter_id?: string; differential_diagnosis_id?: string; file: File }) => {
  const form = new FormData();
  if (params.encounter_id) form.append('encounter_id', params.encounter_id);
  if (params.differential_diagnosis_id) form.append('differential_diagnosis_id', params.differential_diagnosis_id);
  const filename = safeFilename(params.file, 'intro_video', 'webm');
  const ext = filename.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || 'webm';
  const extMime: Record<string, string> = {
    webm: 'video/webm',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    qt: 'video/quicktime',
    m4v: 'video/x-m4v',
  };
  const explicitType = params.file.type && params.file.type.startsWith('video/')
    ? params.file.type.split(';')[0]
    : (extMime[ext] || 'video/webm');
  const typedBlob = new Blob([params.file], { type: explicitType });
  form.append('file', typedBlob, filename);
  const { data } = await axiosInstance.post(`${consultationBase()}/upload-intro-video`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data as { ok: boolean; file_id: string; file_url: string | null; url: string | null };
};

export interface MDIPharmacy {
  pharmacy_id: number | string;
  name: string;
  address?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  zip_code?: string;
  phone_number?: string;
  primary_phone?: string;
  distance?: number;
  is_24_hour?: boolean;
  is_specialty?: boolean;
}

export interface PharmacySearchParams {
  id?: string | number;
  zip?: string;
  name?: string;
  state?: string;
}

export const listPharmacies = async (params: PharmacySearchParams) => {
  // Drop undefined/empty values so axios doesn't try to serialize them.
  // Some proxy/serializer layers choke on undefined entries ("target must
  // be an object") even though axios's default serializer skips them.
  const cleanParams: Record<string, string> = {};
  if (params.id != null && String(params.id).trim()) cleanParams.id = String(params.id).trim();
  if (params.zip && params.zip.trim()) cleanParams.zip = params.zip.trim();
  if (params.name && params.name.trim()) cleanParams.name = params.name.trim();
  if (params.state && params.state.trim()) cleanParams.state = params.state.trim();
  const { data } = await axiosInstance.get(`${consultationBase()}/get-provider-pharmacies`, {
    params: cleanParams,
  });
  // MDI sometimes wraps results in { data: [...] }, sometimes returns the raw
  // array, sometimes nests deeper. Accept any of the shapes we've seen.
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.pharmacies)
        ? data.pharmacies
        : Array.isArray(data?.data?.data)
          ? data.data.data
          : [];
  // MDI's /pharmacies sometimes returns rows keyed as `id` rather than
  // `pharmacy_id`. Normalize so the picker's click + selection-compare logic
  // doesn't silently fall through (which is what makes rows look unclickable).
  return arr.map((p: any) => ({
    ...p,
    pharmacy_id: p.pharmacy_id ?? p.id,
    address: p.address ?? p.address1,
    zip: p.zip ?? p.zip_code,
    phone_number: p.phone_number ?? p.primary_phone,
  })) as MDIPharmacy[];
};

export const setPreferredPharmacy = async (params: {
  patient_id: string;
  pharmacy_id: number | string;
  encounter_id?: string;
}) => {
  const { data } = await axiosInstance.post(`${consultationBase()}/set-preferred-pharmacy`, {
    patient_id: params.patient_id,
    pharmacy_id: params.pharmacy_id,
    ...(params.encounter_id ? { encounter_id: params.encounter_id } : {}),
  });
  return data;
};

export interface PrescribedPharmacy {
  id: string;
  name: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  primary_phone: string | null;
  primary_fax: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PrescribedMedication {
  id: string | null;
  name: string | null;
  drug_name: string | null;
  strength: string | null;
  dose_form: string | null;
  directions: string | null;
  quantity: number | string | null;
  dispense_unit: string | null;
  days_supply: number | null;
  refills: number | null;
  clinical_note: string | null;
  pharmacy: PrescribedPharmacy | null;
}

export interface PrescribedCompound {
  id: string | null;
  name: string | null;
  compound_formula: string | null;
  directions: string | null;
  quantity: number | string | null;
  dispense_unit: string | null;
  days_supply: number | null;
  refills: number | null;
  clinical_note: string | null;
  pharmacy: PrescribedPharmacy | null;
}

export interface PrescribedService {
  id: string | null;
  title: string | null;
  description: string | null;
  additional_note: string | null;
  clinical_notes: string | null;
  pharmacy: PrescribedPharmacy | null;
}

export interface PrescribedLabOrder {
  id: string | null;
  title: string | null;
  description: string | null;
  additional_note: string | null;
  clinical_notes: string | null;
  pharmacy: PrescribedPharmacy | null;
}

export interface PrescribedProducts {
  medications: PrescribedMedication[];
  compounds: PrescribedCompound[];
  services: PrescribedService[];
  lab_orders: PrescribedLabOrder[];
}

// Pulls `prescribed_products` out of a chat-log row's metadata. The shape
// the backend writes is `{ encounter_id, prescribed_products: {...} }`;
// this helper tolerates missing keys so callers can iterate safely.
export function extractPrescribedProducts(metadata: unknown): PrescribedProducts {
  const meta = (metadata ?? null) as { prescribed_products?: Partial<PrescribedProducts> } | null;
  const p = meta?.prescribed_products ?? {};
  return {
    medications: Array.isArray(p.medications) ? p.medications : [],
    compounds: Array.isArray(p.compounds) ? p.compounds : [],
    services: Array.isArray(p.services) ? p.services : [],
    lab_orders: Array.isArray(p.lab_orders) ? p.lab_orders : [],
  };
}

export interface ChatLog {
  id: string;
  user_id: string;
  encounter_id: string;
  role: string;
  type: string;
  message: string;
  files: any;
  metadata: any;
  timestamp: string;
  read_at?: string | null;
}

export const sendMessage = async (params: { encounter_id: string; text?: string; files?: File[] }) => {
  const form = new FormData();
  form.append('encounter_id', params.encounter_id);
  if (params.text) form.append('text', params.text);
  if (params.files) {
    // Use safeFilename so MDI doesn't reject Mac-screenshot-style filenames
    // (spaces + multiple dots) with CorruptedPathDetected. Same treatment
    // already applied to DL / intro-video uploads.
    for (const f of params.files) form.append('file', f, safeFilename(f, 'chat_attachment', 'bin'));
  }
  const { data } = await axiosInstance.post(`${consultationBase()}/send-message`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const fireEmailVerified = async (params: { email?: string; encounter_id?: string; episode_id?: string; differential_diagnosis_id?: string }) => {
  await axiosInstance.post(`${consultationBase()}/email-verified`, params);
};
