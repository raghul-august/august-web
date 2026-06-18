'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Stethoscope, Lock, ShieldCheck, WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { createPatient, type PatientRecord } from '@/services/consultations-service';
import { trackTelehealth } from '@/services/telehealth-analytics';
import { track as trackMeta } from '@/app/utils/analytics';
import { CONSULT_PRICE_LABEL } from '@/lib/config';
import type { User } from '@/types';
import {
  TextField,
  Field,
  PillGroup,
  DateOfBirthPicker,
  StateCombobox,
  GENDER_OPTIONS,
  formatUSPhone,
  isValidUSZip,
  isValidEmail,
  isValidName,
  mmddyyyyToISO,
  resolveStateCode,
} from '../_components';

// Draft persistence — keep the user's in-progress form fields in
// localStorage so a tab close / refresh doesn't blow away their progress.
// Cleared on successful submit so the (PHI-bearing) draft never outlives
// the moment the patient row is actually created.
const draftKey = (ddId?: string) => (ddId ? `intake-form-draft:${ddId}` : null);

function readDraft(ddId?: string): Partial<Details> | null {
  const key = draftKey(ddId);
  if (!key || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<Details>) : null;
  } catch {
    return null;
  }
}

function writeDraft(ddId: string | undefined, details: Details) {
  const key = draftKey(ddId);
  if (!key || typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(details));
  } catch {
    // quota / private mode — ignore
  }
}

// the final intake step (intake-questions) can clear this
// PHI-bearing localStorage draft on completeIntake 
export function clearDraft(ddId?: string) {
  const key = draftKey(ddId);
  if (!key || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// In-memory cache keyed by ddId so the form state survives this
// component's unmount/remount when the user navigates back from
// intake-questions. localStorage alone isn't enough — the write happens
// in a deferred useEffect, which can race with a fast unmount and leave
// stale empty defaults persisted. This cache is updated synchronously on
// every field edit so a remount can always pull the latest state.
const formStateCache = new Map<string, Details>();

interface Props {
  user: User | null;
  onComplete: (
    patientId: string,
    isAvFlow: boolean,
    gender?: string | number | null,
    dob?: string | null,
    email?: string,
  ) => void;
  // Pre-payment flow only — binds the new patient to the in-progress DD.
  differentialDiagnosisId?: string;
  prefillPatient?: PatientRecord | null;
}

type Details = {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  heightFt: string;
  heightIn: string;
  weightLbs: string;
  smsConsent: boolean;
};

// Patient is asked in their familiar units, but MDI / our DB store metric.
// Below 18 → ask cm + kg directly. 18+ → ask ft+in + lbs, convert on submit.
const MINOR_AGE_THRESHOLD = 18;
const MAX_AGE_THRESHOLD = 100;
type ZipLookupStatus = 'idle' | 'pending' | 'valid' | 'invalid';

function ageFromMMDDYYYY(value: string): number | null {
  const m = value.match(/^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  const dob = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  if (age < 0 || age > 150) return null;
  return age;
}

function toFiniteNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function isoToMMDDYYYY(iso: string | null | undefined): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const [, y, mo, d] = m;
  return `${mo}/${d}/${y}`;
}

function genderToFormValue(g: number | string | null | undefined): string {
  if (g == null) return '';
  const s = String(g).toLowerCase();
  if (s === 'female' || s === '2' || s === 'f') return 'female';
  if (s === 'male' || s === '1' || s === 'm') return 'male';
  return '';
}

function patientToDetails(p: PatientRecord, fallbackEmail?: string): Details {
  let heightFt = '';
  let heightIn = '';
  if (p.height_cm != null && Number.isFinite(p.height_cm)) {
    const totalIn = p.height_cm / 2.54;
    heightFt = String(Math.floor(totalIn / 12));
    heightIn = String(Math.round(totalIn - Math.floor(totalIn / 12) * 12));
  }
  const weightLbs =
    p.weight_kg != null && Number.isFinite(p.weight_kg)
      ? String(Math.round(p.weight_kg / 0.453592))
      : '';
  return {
    firstName: p.legal_first_name ?? '',
    lastName: p.legal_last_name ?? '',
    dob: isoToMMDDYYYY(p.date_of_birth),
    gender: genderToFormValue(p.gender_at_birth ?? p.gender),
    email: p.email ?? fallbackEmail ?? '',
    phone: p.phone ? formatUSPhone(p.phone) : '',
    addressLine1: p.address ?? '',
    addressLine2: p.address2 ?? '',
    city: p.city_name ?? '',
    state: p.state_name ?? '',
    zip: p.zip_code ?? '',
    heightFt,
    heightIn,
    weightLbs,
    // The patient already exists, so consent was captured at creation.
    smsConsent: true,
  };
}

function detailsMatchPatient(a: Details, b: Details, isMinor: boolean): boolean {
  const keys: (keyof Details)[] = [
    'firstName', 'lastName', 'dob', 'gender', 'email', 'phone',
    'addressLine1', 'addressLine2', 'city', 'state', 'zip',
  ];
  for (const k of keys) {
    if (String(a[k]).trim() !== String(b[k]).trim()) return false;
  }
  if (isMinor) {
    if (a.heightFt.trim() !== b.heightFt.trim()) return false;
    if (a.heightIn.trim() !== b.heightIn.trim()) return false;
    if (a.weightLbs.trim() !== b.weightLbs.trim()) return false;
  }
  return true;
}

function humanizeCreatePatientError(err: any): string {
  const code: unknown = err?.response?.data?.error;
  const FRIENDLY: Record<string, string> = {
    create_patient_failed:
      'We couldn’t save your details right now — this is usually temporary. Please try again in a moment.',
    mdi_error:
      'We couldn’t save your details right now. Please try again in a moment.',
  };
  if (typeof code === 'string' && FRIENDLY[code]) return FRIENDLY[code];
  return 'We couldn’t save your details right now. Please try again, or contact support if the problem continues.';
}

export function IntakeFormStep({ user, onComplete, differentialDiagnosisId, prefillPatient }: Props) {
  const initialName = (user?.name || '').trim();
  const [first = '', ...rest] = initialName.split(' ');
  const [details, setDetails] = useState<Details>(() => {
    if (prefillPatient) {
      return patientToDetails(prefillPatient, user?.email ?? undefined);
    }
    // First check the in-memory cache — preserves state across remounts
    // in the same tab session, immune to localStorage write timing.
    if (differentialDiagnosisId) {
      const cached = formStateCache.get(differentialDiagnosisId);
      if (cached) return cached;
    }
    // Then hydrate from localStorage so a full page refresh keeps the
    // user's progress. Falls back to user-prefilled defaults.
    const draft = readDraft(differentialDiagnosisId);
    return {
      firstName: draft?.firstName ?? first,
      lastName: draft?.lastName ?? rest.join(' '),
      dob: draft?.dob ?? '',
      gender: draft?.gender ?? '',
      email: draft?.email ?? user?.email ?? '',
      phone: draft?.phone ?? '',
      addressLine1: draft?.addressLine1 ?? '',
      addressLine2: draft?.addressLine2 ?? '',
      city: draft?.city ?? '',
      state: draft?.state ?? '',
      zip: draft?.zip ?? '',
      heightFt: draft?.heightFt ?? '',
      heightIn: draft?.heightIn ?? '',
      weightLbs: draft?.weightLbs ?? '',
      smsConsent: draft?.smsConsent ?? false,
    };
  });

  // Persist on every change so a tab close / refresh doesn't lose progress.
  useEffect(() => {
    if (!differentialDiagnosisId) return;
    writeDraft(differentialDiagnosisId, details);
  }, [details, differentialDiagnosisId]);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [toastOn, setToastOn] = useState(false);
  // Track which fields have lost focus so we only surface inline errors
  // after the user has tried to leave the field — same pattern as Stripe /
  // Formik. The submit attempt below also flips them all on at once.
  const [touched, setTouched] = useState<{
    zip?: boolean;
    state?: boolean;
    firstName?: boolean;
    lastName?: boolean;
    email?: boolean;
  }>({});
  const markTouched = (k: keyof typeof touched) =>
    setTouched((prev) => (prev[k] ? prev : { ...prev, [k]: true }));

  const lastNameRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement | null>(null);
  const firstGenderRef = useRef<HTMLButtonElement | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addr1Ref = useRef<HTMLInputElement>(null);
  const addr2Ref = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const zipLookupAbort = useRef<AbortController | null>(null);
  const [zipLookupStatus, setZipLookupStatus] = useState<ZipLookupStatus>('idle');

  async function lookupZip(zip: string) {
    zipLookupAbort.current?.abort();
    const controller = new AbortController();
    zipLookupAbort.current = controller;
    setZipLookupStatus('pending');
    const applyResult = (cityName: string, stateAbbr: string, status: ZipLookupStatus) => {
      setDetails((prev) => {
        if (prev.zip !== zip) return prev;
        const next = { ...prev, city: cityName, state: stateAbbr };
        if (differentialDiagnosisId) formStateCache.set(differentialDiagnosisId, next);
        return next;
      });
      setZipLookupStatus((prev) => (prev === 'pending' ? status : prev));
    };
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`, { signal: controller.signal });
      if (res.status === 404) {
        applyResult('', '', 'invalid');
        return;
      }
      if (!res.ok) {
        setZipLookupStatus((prev) => (prev === 'pending' ? 'idle' : prev));
        return;
      }
      const data = await res.json();
      const place = data?.places?.[0];
      if (!place) {
        applyResult('', '', 'invalid');
        return;
      }
      applyResult(place['place name'] || '', place['state abbreviation'] || '', 'valid');
    } catch {
      // Aborted (newer lookup started) or network blip — silently bail.
    }
  }

  const focusAndScroll = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const advanceTo = useCallback(
    (nextRef: React.RefObject<HTMLInputElement | HTMLButtonElement | null>) =>
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          focusAndScroll(nextRef.current);
        }
      },
    [focusAndScroll]
  );

  const dismissOnEnter = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  function set<K extends keyof Details>(key: K, value: Details[K]) {
    setDetails((prev) => {
      const next = { ...prev, [key]: value };
      // Mirror to the module-level cache synchronously so a remount
      // (e.g. back-nav from intake-questions) sees the latest state
      // regardless of when the useEffect localStorage write fires.
      if (differentialDiagnosisId) formStateCache.set(differentialDiagnosisId, next);
      return next;
    });
  }

  const zipFormatValid = isValidUSZip(details.zip);
  const zipLookupInvalid = zipFormatValid && zipLookupStatus === 'invalid';
  const zipValid = zipFormatValid && !zipLookupInvalid;
  const firstNameValid = isValidName(details.firstName);
  const lastNameValid = isValidName(details.lastName);
  const emailValid = isValidEmail(details.email);
  // The combobox writes a 2-letter code on commit; bare free-text that
  // didn't resolve is cleared. Re-resolve here defensively in case the
  // value was hydrated from an older draft that wasn't normalized.
  const stateValid = !!resolveStateCode(details.state);

  const age = ageFromMMDDYYYY(details.dob);
  // Default to adult units when DOB isn't a complete valid date yet — the
  // form still gates the dob field separately, so this only affects which
  // height/weight inputs render.
  const isMinor = age !== null && age < MINOR_AGE_THRESHOLD;
  const dobOver100 = age !== null && age > MAX_AGE_THRESHOLD;
  // Minors are allowed — only an out-of-range (future / >100) DOB is invalid.
  const dobValid = !!details.dob.trim() && age !== null && !dobOver100;

  // Only minors are asked for height/weight — adults skip the question and
  // we don't send the fields to MDI. Inputs are imperial; convert on submit.
  const heightWeightValid = isMinor
    ? toFiniteNumber(details.heightFt) !== null &&
      toFiniteNumber(details.heightIn) !== null &&
      toFiniteNumber(details.weightLbs) !== null
    : true;

  const formFieldsValid =
    firstNameValid &&
    lastNameValid &&
    dobValid &&
    !!details.gender.trim() &&
    emailValid &&
    !!details.phone.trim() &&
    !!details.addressLine1.trim() &&
    !!details.city.trim() &&
    stateValid &&
    zipValid &&
    heightWeightValid;

  const isValid = formFieldsValid && details.smsConsent;

  async function handleNext() {
    if (!isValid) {
      // Surface inline errors for fields the user hasn't tabbed through yet.
      setTouched({ zip: true, state: true, firstName: true, lastName: true, email: true });
      setToastOn(true);
      setTimeout(() => setToastOn(false), 5000);
      return;
    }
    setSubmitting(true);
    setServerError(null);

    if (prefillPatient) {
      const original = patientToDetails(prefillPatient, user?.email ?? undefined);
      if (detailsMatchPatient(details, original, isMinor)) {
        trackTelehealth('intake_step_filled', {
          step: 'patient_details',
          question: 'Your Details',
        });
        onComplete(
          prefillPatient.id,
          !!prefillPatient.is_av_consultation_flow,
          prefillPatient.gender_at_birth ?? prefillPatient.gender ?? details.gender,
          prefillPatient.date_of_birth ?? mmddyyyyToISO(details.dob),
          (prefillPatient.email ?? details.email).trim(),
        );
        return;
      }
      // Anything changed → fall through and create a NEW patient below.
    }

    try {
      const dobISO = mmddyyyyToISO(details.dob) || '';

      // Only minors are asked for height/weight; for adults we skip the
      // fields entirely so MDI keeps them null. Inputs are imperial — the
      // backend stores height_cm / weight_kg, and MDI rejects non-integer
      // values ("height must be an integer"), so round to whole numbers.
      let heightForBackend: number | undefined;
      let weightForBackend: number | undefined;
      if (isMinor) {
        const ft = toFiniteNumber(details.heightFt);
        const inches = toFiniteNumber(details.heightIn);
        const lbs = toFiniteNumber(details.weightLbs);
        if (ft !== null && inches !== null) {
          heightForBackend = Math.round(ft * 30.48 + inches * 2.54);
        }
        if (lbs !== null) {
          weightForBackend = Math.round(lbs * 0.453592);
        }
      }

      const result = await createPatient({
        first_name: details.firstName.trim(),
        last_name: details.lastName.trim(),
        gender: details.gender === 'female' ? 2 : 1,
        date_of_birth: dobISO,
        phone_number: details.phone,
        phone_type: 2,
        email: details.email.trim(),
        address: {
          // MDI caps address lines at 35 chars — defensively trim+slice in
          // case anything bypassed the input maxLength (autofill, paste, etc.).
          address: details.addressLine1.trim().slice(0, 35),
          address2: details.addressLine2.trim().slice(0, 35) || undefined,
          zip_code: details.zip,
          city_name: details.city,
          state_name: details.state,
        },
        ...(heightForBackend !== undefined ? { height: heightForBackend } : {}),
        ...(weightForBackend !== undefined ? { weight: weightForBackend } : {}),
        ...(differentialDiagnosisId ? { differential_diagnosis_id: differentialDiagnosisId } : {}),
      });
      // Keep the draft around after submit so navigating back to the
      // intake step (e.g. from intake-questions) re-hydrates the form
      // instead of showing empty fields. The draft is keyed by ddId and
      // becomes orphaned once the DD is consumed by payment.
      // The created patient row carries `is_av_consultation_flow` derived
      // server-side from MDI's create-patient response — read it here so
      // the consult flow knows whether to show the AV-video step.
      const isAvFlow = !!result?.patient?.is_av_consultation_flow;
      trackTelehealth('intake_step_filled', {
        step: 'patient_details',
        question: 'Your Details',
      });
      trackMeta('telehealth_patient_created');
      onComplete(
        result.patient.id,
        isAvFlow,
        result?.patient?.gender ?? details.gender,
        result?.patient?.date_of_birth ?? dobISO,
        details.email.trim(),
      );
    } catch (err: any) {
      setServerError(humanizeCreatePatientError(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="relative w-full">
      <div className="mx-auto w-full max-w-lg px-5 md:px-6 pt-0 pb-8">
        <div className="flex justify-center">
            <div 
              style={{
                display: 'flex',
                padding: '5px 10px',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '999px',
                background: '#E8F2ED',
              }}
            >
              <Stethoscope size={14} weight="regular" color='#206E55'/>
              <span 
                style={{
                  color: '#206E55',
                  textAlign: 'center',
                  // 
                  fontSize: '11px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '15px',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                Online Doctor Consult · {CONSULT_PRICE_LABEL}
              </span>
            </div>
          </div>

          <h1
            className="text-center mt-6"
            style={{ 
              color: '#141515',
              // 
              fontSize: '30px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '36px',
              letterSpacing: '-0.5px',
            }}
          >
            Your Details
          </h1>
          <p 
            className="text-center mt-1 mx-auto"
            style={{
              color: '#5A554A',
              textAlign: 'center',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '23px',
              letterSpacing: '-0.2px',
              maxWidth: '480px',
              margin: '4px auto 0',
            }}
          >
            We use this to find a licensed doctor in your state<br className="hidden md:inline" />
            and notify you when your consultation is ready.
          </p>

          <div className="mt-10 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <TextField
                  label="Legal first name"
                  autoComplete="given-name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  onKeyDown={advanceTo(lastNameRef)}
                  value={details.firstName}
                  aria-invalid={touched.firstName && !firstNameValid ? true : undefined}
                  className={cn(touched.firstName && !firstNameValid && 'ring-1 ring-inset ring-red-400')}
                  onBlur={() => markTouched('firstName')}
                  onChange={(e) => set('firstName', e.target.value)}
                  autoFocus
                />
                {touched.firstName && !firstNameValid && details.firstName.trim() && (
                  <p className="mt-1.5 ml-1 t-paragraph-sm text-danger">
                    First name must be at least 2 characters.
                  </p>
                )}
              </div>
              <div>
                <TextField
                  ref={lastNameRef}
                  label="Legal last name"
                  autoComplete="family-name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  onKeyDown={advanceTo(dobRef)}
                  value={details.lastName}
                  aria-invalid={touched.lastName && !lastNameValid ? true : undefined}
                  className={cn(touched.lastName && !lastNameValid && 'ring-1 ring-inset ring-red-400')}
                  onBlur={() => markTouched('lastName')}
                  onChange={(e) => set('lastName', e.target.value)}
                />
                {touched.lastName && !lastNameValid && details.lastName.trim() && (
                  <p className="mt-1.5 ml-1 t-paragraph-sm text-danger">
                    Last name must be at least 2 characters.
                  </p>
                )}
              </div>
            </div>

            <Field label="Date of birth">
              <DateOfBirthPicker
                value={details.dob}
                onChange={(v) => set('dob', v)}
                inputRef={dobRef}
                onEnterAdvance={() => focusAndScroll(firstGenderRef.current)}
              />
              {dobOver100 && (
                <p className="mt-1.5 ml-1 t-paragraph-sm text-danger">
                  Only patients under 100 are eligible for this consult.
                </p>
              )}
            </Field>

            <Field label="Sex assigned at birth">
              <PillGroup
                value={details.gender}
                firstButtonRef={firstGenderRef}
                onChange={(v) => {
                  set('gender', v);
                  setTimeout(() => focusAndScroll(emailRef.current), 0);
                }}
                options={GENDER_OPTIONS}
              />
            </Field>

            {isMinor && (
              <div className="grid grid-cols-3 gap-3">
                <TextField
                  label="Height (ft)"
                  inputMode="numeric"
                  enterKeyHint="next"
                  placeholder="5"
                  value={details.heightFt}
                  onChange={(e) =>
                    set('heightFt', e.target.value.replace(/[^0-9]/g, '').slice(0, 1))
                  }
                />
                <TextField
                  label="Height (in)"
                  inputMode="numeric"
                  enterKeyHint="next"
                  placeholder="2"
                  value={details.heightIn}
                  onChange={(e) =>
                    set('heightIn', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))
                  }
                />
                <TextField
                  label="Weight (lbs)"
                  inputMode="decimal"
                  enterKeyHint="next"
                  placeholder="100"
                  value={details.weightLbs}
                  onChange={(e) =>
                    set('weightLbs', e.target.value.replace(/[^0-9.]/g, '').slice(0, 6))
                  }
                />
              </div>
            )}

            <div className="pt-2 space-y-4">
              {/* Email — show locked display if pre-filled from account */}
              {details.email && user?.email ? (
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      color: '#5A554A',
                      fontSize: '13px',
                      fontWeight: '500',
                      lineHeight: '18px',
                    }}
                  >
                    Email
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      height: '48px',
                      padding: '0 14px',
                      borderRadius: '12px',
                      border: '0.5px solid #D1CDC2',
                      background: '#F5F4F0',
                    }}
                  >
                    <span style={{ flex: 1, color: '#141515', fontSize: '15px', fontWeight: '400' }}>
                      {details.email}
                    </span>
                    <Lock size={15} weight="regular" style={{ color: '#9E9A92', flexShrink: 0 }} />
                  </div>
                </div>
              ) : (
                <div>
                  <TextField
                    ref={emailRef}
                    label="Email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    enterKeyHint="next"
                    onKeyDown={advanceTo(phoneRef)}
                    placeholder="you@example.com"
                    value={details.email}
                    aria-invalid={touched.email && !emailValid ? true : undefined}
                    className={cn(touched.email && !emailValid && 'ring-1 ring-inset ring-red-400')}
                    onBlur={() => markTouched('email')}
                    onChange={(e) => set('email', e.target.value)}
                  />
                  {touched.email && !emailValid && details.email.trim() && (
                    <p className="mt-1.5 ml-1 t-paragraph-sm text-danger">
                      Enter a valid email (e.g. you@example.com).
                    </p>
                  )}
                </div>
              )}

              <TextField
                ref={phoneRef}
                label="Phone"
                type="tel"
                autoComplete="tel-national"
                inputMode="tel"
                enterKeyHint="next"
                onKeyDown={advanceTo(addr1Ref)}
                placeholder="(555) 123-4567"
                value={details.phone}
                onChange={(e) => set('phone', formatUSPhone(e.target.value))}
              />
            </div>

            <div className="pt-2 space-y-4">
              <TextField
                ref={addr1Ref}
                label="Address line 1"
                autoComplete="address-line1"
                autoCapitalize="words"
                enterKeyHint="next"
                onKeyDown={advanceTo(addr2Ref)}
                value={details.addressLine1}
                maxLength={35}
                onChange={(e) => set('addressLine1', e.target.value.slice(0, 35))}
              />
              <TextField
                ref={addr2Ref}
                label="Address line 2"
                optional
                autoComplete="address-line2"
                autoCapitalize="words"
                enterKeyHint="next"
                onKeyDown={advanceTo(zipRef)}
                value={details.addressLine2}
                maxLength={35}
                onChange={(e) => set('addressLine2', e.target.value.slice(0, 35))}
              />
              <div>
                <TextField
                  ref={zipRef}
                  label="Zip code"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  onKeyDown={dismissOnEnter}
                  value={details.zip}
                  maxLength={5}
                  aria-invalid={touched.zip && !zipValid ? true : undefined}
                  className={cn(touched.zip && !zipValid && 'ring-1 ring-inset ring-red-400')}
                  onBlur={() => markTouched('zip')}
                  onChange={(e) => {
                    const newZip = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
                    const prevZipWasComplete = details.zip.length === 5;
                    if (newZip.length === 5) {
                      set('zip', newZip);
                      lookupZip(newZip);
                    } else if (prevZipWasComplete) {
                      setDetails((prev) => {
                        const next = { ...prev, zip: newZip, city: '', state: '' };
                        if (differentialDiagnosisId) formStateCache.set(differentialDiagnosisId, next);
                        return next;
                      });
                      setZipLookupStatus('idle');
                    } else {
                      set('zip', newZip);
                      setZipLookupStatus('idle');
                    }
                  }}
                />
                {touched.zip && details.zip.trim() && !zipFormatValid && (
                  <p className="mt-1.5 ml-1 t-paragraph-sm text-danger">
                    Enter a valid 5-digit US zip code (e.g. 94105).
                  </p>
                )}
                {touched.zip && zipLookupInvalid && (
                  <p className="mt-1.5 ml-1 t-paragraph-sm text-danger">
                    Please enter a valid zip code.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="City"
                  autoComplete="address-level2"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  value={details.city}
                  onChange={(e) => set('city', e.target.value)}
                />
                <div>
                  <Field label="State">
                    <StateCombobox
                      value={details.state}
                      onChange={(code) => set('state', code)}
                      onBlur={() => markTouched('state')}
                      invalid={touched.state && !stateValid}
                      enterKeyHint="done"
                    />
                  </Field>
                  {touched.state && !stateValid && (
                    <p className="mt-1.5 ml-1 t-paragraph-sm text-danger">
                      Choose a US state or territory.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>
            )}

            <section className="pt-6">
              <div
                role="checkbox"
                tabIndex={formFieldsValid ? 0 : -1}
                aria-checked={details.smsConsent}
                aria-disabled={!formFieldsValid}
                onClick={() => {
                  if (!formFieldsValid) return;
                  set('smsConsent', !details.smsConsent);
                }}
                onKeyDown={(e) => {
                  if (!formFieldsValid) return;
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    set('smsConsent', !details.smsConsent);
                  }
                }}
                className={cn(
                  'flex items-start gap-4 select-none group',
                  formFieldsValid ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                )}
              >
                <span
                  aria-hidden
                  className="flex-shrink-0 inline-flex items-center justify-center"
                  style={{ width: 30, height: 30 }}
                >
                  {details.smsConsent ? (
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path fillRule="evenodd" clipRule="evenodd" d="M24.375 24.375V5.625H5.625V24.375H24.375ZM20.5543 11.8285C20.5071 11.7147 20.4379 11.6113 20.3508 11.5242C20.2637 11.4371 20.1603 11.3679 20.0465 11.3207C19.9327 11.2735 19.8107 11.2493 19.6875 11.2493C19.5643 11.2493 19.4423 11.2735 19.3285 11.3207C19.2147 11.3679 19.1113 11.4371 19.0242 11.5242L16.0746 14.4744L13.125 17.4246L10.9758 15.2742C10.7999 15.0983 10.5613 14.9995 10.3125 14.9995C10.0637 14.9995 9.82513 15.0983 9.64922 15.2742C9.47331 15.4501 9.37448 15.6887 9.37448 15.9375C9.37448 16.1863 9.47331 16.4249 9.64922 16.6008L12.4617 19.4133C12.5488 19.5004 12.6522 19.5696 12.766 19.6168C12.8798 19.664 13.0018 19.6882 13.125 19.6882C13.2482 19.6882 13.3702 19.664 13.484 19.6168C13.5978 19.5696 13.7012 19.5004 13.7883 19.4133L20.3508 12.8508C20.4379 12.7637 20.5071 12.6603 20.5543 12.5465C20.6015 12.4327 20.6257 12.3107 20.6257 12.1875C20.6257 12.0643 20.6015 11.9423 20.5543 11.8285Z" fill="#3D8168" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M26.25 24.375V5.625C26.25 5.12772 26.0525 4.65081 25.7008 4.29917C25.3492 3.94754 24.8723 3.75 24.375 3.75H5.625C5.12772 3.75 4.65081 3.94754 4.29917 4.29917C3.94754 4.65081 3.75 5.12772 3.75 5.625V24.375C3.75 24.8723 3.94754 25.3492 4.29917 25.7008C4.65081 26.0525 5.12772 26.25 5.625 26.25H24.375C24.8723 26.25 25.3492 26.0525 25.7008 25.7008C26.0525 25.3492 26.25 24.8723 26.25 24.375ZM24.375 5.625V24.375H5.625V5.625H24.375Z" fill="#3D8168" />
                      <path d="M20.3508 11.5242C20.4379 11.6113 20.5071 11.7147 20.5543 11.8285C20.6015 11.9423 20.6257 12.0643 20.6257 12.1875C20.6257 12.3107 20.6015 12.4327 20.5543 12.5465C20.5071 12.6603 20.4379 12.7637 20.3508 12.8508L13.7883 19.4133C13.7012 19.5004 13.5978 19.5696 13.484 19.6168C13.3702 19.664 13.2482 19.6882 13.125 19.6882C13.0018 19.6882 12.8798 19.664 12.766 19.6168C12.6522 19.5696 12.5488 19.5004 12.4617 19.4133L9.64922 16.6008C9.47331 16.4249 9.37448 16.1863 9.37448 15.9375C9.37448 15.6887 9.47331 15.4501 9.64922 15.2742C9.82513 15.0983 10.0637 14.9995 10.3125 14.9995C10.5613 14.9995 10.7999 15.0983 10.9758 15.2742L13.125 17.4246L16.0746 14.4744L19.0242 11.5242C19.1113 11.4371 19.2147 11.3679 19.3285 11.3207C19.4423 11.2735 19.5643 11.2493 19.6875 11.2493C19.8107 11.2493 19.9327 11.2735 20.0465 11.3207C20.1603 11.3679 20.2637 11.4371 20.3508 11.5242Z" fill="white" />
                    </svg>
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M24.375 3.5C24.9386 3.5 25.4794 3.72356 25.8779 4.12207C26.2764 4.52059 26.5 5.06142 26.5 5.625V24.375C26.5 24.9386 26.2764 25.4794 25.8779 25.8779C25.4794 26.2764 24.9386 26.5 24.375 26.5H5.625C5.06142 26.5 4.52059 26.2764 4.12207 25.8779C3.72356 25.4794 3.5 24.9386 3.5 24.375V5.625C3.5 5.06141 3.72356 4.52059 4.12207 4.12207C4.52059 3.72356 5.06141 3.5 5.625 3.5H24.375Z" fill="white" stroke="#D1CDC2" strokeWidth="0.5" />
                    </svg>
                  )}
                </span>
                <span
                  className="select-text"
                  style={{
                    display: 'flex',
                    // Mobile fills remaining row width after the 30px check
                    // icon + 16px gap; desktop caps at the original 419px.
                    flex: '1 1 0',
                    minWidth: 0,
                    maxWidth: '419px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    color: '#7A7468',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '20px',
                  }}
                >
                  <span>
                    I authorize August Labs Inc to send text messages to the phone number
                    provided above, including: (1) health-related updates (such as 
                    appointment reminders, medication follow-ups, and care coordination 
                    messages) which may involve personal health information;
                    and (2) optional marketing messages. I acknowledge that text 
                    messaging is not a completely secure communication channel and my health 
                    details could be viewed by others. Agreeing to marketing texts is not a
                    condition for receiving services. Msg & data rates may apply. Message 
                    frequency varies. Reply STOP to opt out.{" "}
                    <a
                      href="#"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        color: '#7A7468',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontWeight: '400',
                        lineHeight: '20px',
                        textDecorationLine: 'underline',
                        textDecorationStyle: 'solid',
                        textDecorationSkipInk: 'auto',
                        textDecorationThickness: 'auto',
                        textUnderlineOffset: 'auto',
                        textUnderlinePosition: 'from-font',
                      }}
                    >Privacy Policy</a> &{" "}
                    <a
                      href="#"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        color: '#7A7468',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontWeight: '400',
                        lineHeight: '20px',
                        textDecorationLine: 'underline',
                        textDecorationStyle: 'solid',
                        textDecorationSkipInk: 'auto',
                        textDecorationThickness: 'auto',
                        textUnderlineOffset: 'auto',
                        textUnderlinePosition: 'from-font',
                      }}
                    >Terms of Service</a>
                  </span>
                </span>
              </div>
            </section>

          </div>
        </div>
            {(() => {
            const barStyle: React.CSSProperties = {
              width: '100%',
              padding: '20px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
            };
            const bar = (
            <div style={barStyle}>
              <div style={{ width: '100%', maxWidth: '512px' }}>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!details.smsConsent || submitting}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '999px',
                    background: (!details.smsConsent || submitting) ? '#E5E2DA' : '#206E55',
                    color: (!details.smsConsent || submitting) ? '#7A7468' : '#FFF',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.2s ease-in-out',
                    cursor: (!details.smsConsent || submitting) ? 'not-allowed' : 'pointer',
                    border: 'none',
                    outline: 'none',
                    marginBottom: '24px',
                  }}
                  className="t-label-lg"
                >
                  {submitting ? 'Saving…' : 'Next'}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <div 
                    style={{
                      borderRadius: '999px',
                      border: '1px solid #E5E2DA',
                      background: '#FAF9F5',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_133_1181)">
                        <path d="M10.5625 4.0625H8.9375V2.84375C8.9375 2.19728 8.68069 1.5773 8.22357 1.12018C7.76645 0.663057 7.14647 0.40625 6.5 0.40625C5.85353 0.40625 5.23355 0.663057 4.77643 1.12018C4.31931 1.5773 4.0625 2.19728 4.0625 2.84375V4.0625H2.4375C2.22201 4.0625 2.01535 4.1481 1.86298 4.30048C1.7106 4.45285 1.625 4.65951 1.625 4.875V10.5625C1.625 10.778 1.7106 10.9847 1.86298 11.137C2.01535 11.2894 2.22201 11.375 2.4375 11.375H10.5625C10.778 11.375 10.9847 11.2894 11.137 11.137C11.2894 10.9847 11.375 10.778 11.375 10.5625V4.875C11.375 4.65951 11.2894 4.45285 11.137 4.30048C10.9847 4.1481 10.778 4.0625 10.5625 4.0625ZM4.875 2.84375C4.875 2.41277 5.0462 1.99945 5.35095 1.6947C5.6557 1.38995 6.06902 1.21875 6.5 1.21875C6.93098 1.21875 7.3443 1.38995 7.64905 1.6947C7.95379 1.99945 8.125 2.41277 8.125 2.84375V4.0625H4.875V2.84375ZM10.5625 10.5625H2.4375V4.875H10.5625V10.5625Z" fill="#7A7468"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_133_1181">
                          <rect width="13" height="13" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                    <span 
                      style={{
                        color: '#7A7468',
                        
                        fontSize: '12px',
                        fontStyle: 'normal',
                        fontWeight: '400',
                        lineHeight: '16px',
                      }}
                    >
                      Secure & confidential
                    </span>
                  </div>

                  <div 
                    style={{
                      borderRadius: '999px',
                      border: '1px solid #E5E2DA',
                      background: '#FAF9F5',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.0004 1.93879C7.16728 1.93879 7.30256 1.80351 7.30256 1.63663C7.30256 1.46975 7.16728 1.33447 7.0004 1.33447C6.83352 1.33447 6.69824 1.46975 6.69824 1.63663C6.69824 1.80351 6.83352 1.93879 7.0004 1.93879Z" fill="#7A7468"/>
                      <path d="M7.15079 1.93896H6.84863V13.0181H7.15079V1.93896Z" fill="#7A7468"/>
                      <path d="M7.00015 2.99644C5.48936 2.39212 3.97856 2.39212 2.46777 3.19788C3.57569 4.10435 5.48936 4.10435 7.00015 3.39932V2.99644ZM7.00015 2.99644C8.51094 2.39212 10.0217 2.39212 11.5325 3.19788C10.4246 4.10435 8.51094 4.10435 7.00015 3.39932V2.99644Z" fill="#7A7468"/>
                      <path d="M7.00039 4.50708C4.88529 5.01068 4.88529 6.52147 7.00039 7.02507C9.1155 7.52866 9.1155 9.03945 7.00039 9.54305C4.88529 10.0466 4.88529 11.5574 7.00039 12.061" stroke="#7A7468" strokeWidth="0.503597" strokeLinecap="round"/>
                      <path d="M7.00039 4.50708C9.1155 5.01068 9.1155 6.52147 7.00039 7.02507C4.88529 7.52866 4.88529 9.03945 7.00039 9.54305C9.1155 10.0466 9.1155 11.5574 7.00039 12.061" stroke="#7A7468" strokeWidth="0.503597" strokeLinecap="round"/>
                      <path d="M4.88488 5.21214C5.13519 5.21214 5.33812 5.00922 5.33812 4.7589C5.33812 4.50859 5.13519 4.30566 4.88488 4.30566C4.63456 4.30566 4.43164 4.50859 4.43164 4.7589C4.43164 5.00922 4.63456 5.21214 4.88488 5.21214Z" fill="#7A7468"/>
                      <path d="M9.11535 5.21214C9.36566 5.21214 9.56858 5.00922 9.56858 4.7589C9.56858 4.50859 9.36566 4.30566 9.11535 4.30566C8.86503 4.30566 8.66211 4.50859 8.66211 4.7589C8.66211 5.00922 8.86503 5.21214 9.11535 5.21214Z" fill="#7A7468"/>
                    </svg>
                    <span
                      style={{
                        color: '#7A7468',

                        fontSize: '12px',
                        fontStyle: 'normal',
                        fontWeight: '400',
                        lineHeight: '16px',
                      }}
                    >
                      HIPAA
                    </span>
                  </div>
                </div>

                <p
                  className="text-center"
                  style={{
                    color: '#7A7468',
                    fontSize: '12px',
                    fontWeight: '400',
                    lineHeight: '16px',
                    marginTop: '16px',
                  }}
                >
                  A prescription is not guaranteed. You may not receive one after your
                  consultation if the doctor determines it isn&apos;t appropriate.
                </p>
              </div>
            </div>
            );
            return bar;
            })()}
      {toastOn && (
        <div
          role="alert"
          aria-live="assertive"
          className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 max-w-[calc(100vw-2rem)] rounded-full bg-text-primary text-text-inverse pl-3.5 pr-4 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
          style={{ animation: 'consultPopoverIn 240ms cubic-bezier(0.22,1,0.36,1)' }}
        >
          <WarningCircle size={16} weight="fill" className="text-danger flex-shrink-0" />
          <span className="t-paragraph-sm leading-tight">
            Complete required fields and accept the consent to continue.
          </span>
        </div>
      )}
    </div>
  );
}
