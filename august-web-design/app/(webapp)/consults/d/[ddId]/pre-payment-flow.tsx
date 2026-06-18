'use client';

import '../../../consult/consult-theme.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, useAuthHasHydrated } from '@/stores/auth-store';
import { track as trackMeta } from '@/app/utils/analytics';
import {
  getDifferentialDiagnosis,
  getEncounter,
  listPatients,
  selectExistingPatient,
  type DifferentialDiagnosisBootstrap,
  type PatientRecord,
} from '@/services/consultations-service';

import { BeautifulLoader, ProgressBar, TOTAL_STEPS } from '../../../consult/_components';
import { ChoosePatientStep } from '../../../consult/steps/choose-patient';
import { IntakeFormStep } from '../../../consult/steps/intake-form';
import {
  IntakeQuestionsStep,
  ageFromDob,
  type IntakeQuestionsHandle,
} from '../../../consult/steps/intake-questions';
import { LoginStep } from '../../../consult/steps/login';
import { PaymentStep } from '../../../consult/steps/payment';
import { InPersonCareModal } from '../../../consult/steps/in-person-modal';

type Step = 'choose-patient' | 'intake' | 'intake-questions' | 'login' | 'payment';

const STEP_ORDER: Step[] = ['intake', 'login', 'payment', 'intake-questions'];
function progressIndexFor(step: Step): number {
  if (step === 'choose-patient') return 1;
  return STEP_ORDER.indexOf(step) + 1;
}

interface Props {
  ddId: string;
}

export function PrePaymentFlow({ ddId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skipPendingPopup = searchParams?.get('skip_pending_popup') === '1';
  const user = useAuthStore((s) => s.user);
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const accessToken = useAuthStore((s) => s.getAccessToken());
  const authHasHydrated = useAuthHasHydrated();

  const [dd, setDd] = useState<DifferentialDiagnosisBootstrap | null>(null);
  const [patients, setPatients] = useState<PatientRecord[] | null>(null);
  const [step, setStep] = useState<Step>('intake');
  const [patientId, setPatientId] = useState<string | undefined>(undefined);
  const [patientDob, setPatientDob] = useState<string | null>(null);
  const [patientGender, setPatientGender] = useState<number | string | null>(null);
  // Imperative handle so the chrome back button can step back inside the
  // intake-questions queue before exiting the step.
  const intakeQuestionsRef = useRef<IntakeQuestionsHandle | null>(null);
  const pendingRedirectRef = useRef<boolean | null>(null);
  // True when the chosen patient already has driver_license_id on file —
  // PaymentStep uses this to skip its "Continue to identity check" success
  // card and go straight to the post-payment route on Stripe success.
  const [skipDl, setSkipDl] = useState<boolean>(false);
  // Captured from intake so we can prefill the login email field.
  const [intakeEmail, setIntakeEmail] = useState<string | undefined>(undefined);
  // Set true once Stripe finishes the charge (success modal is up). We
  // hide the close X while this is true so the user can't accidentally
  // navigate away after the card has been charged.
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paidEncounterId, setPaidEncounterId] = useState<string | null>(null);
  const [chargedEncounterId, setChargedEncounterId] = useState<string | null>(null);
  const [prefillPatient, setPrefillPatient] = useState<PatientRecord | null>(null);
  // True after /complete-intake returns status === 'disqualified'. We
  // swap the questions step for the in-person modal until the patient
  // acknowledges and we route them back to /chat.
  const [disqualified, setDisqualified] = useState(false);

  const isEmailUser = useMemo(() => !!user?.email, [user]);
  const isLoggedIn = useMemo(() => !!user && !isAnonymous, [user, isAnonymous]);

  // Hydrate DD + patient list. The DD's patient_id (if set from a prior
  // partial run) tells us we can skip the picker and jump to the next step.
  useEffect(() => {
    if (!accessToken || !authHasHydrated) return;
    let cancelled = false;
    (async () => {
      try {
        const [ddRow, list] = await Promise.all([
          getDifferentialDiagnosis(ddId),
          listPatients(),
        ]);
        if (cancelled) return;

        if (ddRow.encounter_id) {
          const picked = list.find((p) => p.id === ddRow.patient_id);
          const age = ageFromDob(picked?.date_of_birth ?? null);
          let nextDd: DifferentialDiagnosisBootstrap = ddRow;
          let pending = ddRow.pending_questions ?? [];
          if (age != null) {
            try {
              const refreshed = await getDifferentialDiagnosis(ddId, age);
              if (cancelled) return;
              pending = refreshed.pending_questions ?? [];
              nextDd = { ...ddRow, pending_questions: pending };
            } catch {
              // keep the bootstrap question set on failure
            }
          }
          setDd(nextDd);
          setPatients(list);
          if (pending.length > 0) {
            pendingRedirectRef.current = false;
            setPatientId(ddRow.patient_id ?? undefined);
            setPatientDob(picked?.date_of_birth ?? null);
            setPatientGender(picked?.gender_at_birth ?? picked?.gender ?? null);
            setSkipDl(!!picked?.driver_license_id);
            setChargedEncounterId(ddRow.encounter_id);
            setStep('intake-questions');
          } else {
            setPaidEncounterId(ddRow.encounter_id);
          }
          return;
        }

        if (ddRow.patient_id) {
          // Patient already chosen but NOT yet paid (the encounter_id branch
          // above handles the paid/resume case). Payment now comes before the
          // medication questions, so route to payment — login first if the
          // user isn't an email-bearing logged-in user yet.
          //
          // This branch re-runs whenever `accessToken` changes (e.g. right
          // after OTP verification), so it MUST land on payment, not the
          // questions — otherwise it would override handleLoginComplete's
          // setStep('payment') and skip the paywall.
          const picked = list.find((p) => p.id === ddRow.patient_id);
          const age = ageFromDob(picked?.date_of_birth ?? null);
          let nextDd: DifferentialDiagnosisBootstrap = ddRow;
          if (age != null) {
            try {
              const refreshed = await getDifferentialDiagnosis(ddId, age);
              if (cancelled) return;
              nextDd = { ...ddRow, pending_questions: refreshed.pending_questions };
            } catch {
              // keep the bootstrap question set on failure
            }
          }
          setDd(nextDd);
          setPatients(list);
          setPatientId(ddRow.patient_id);
          setPatientDob(picked?.date_of_birth ?? null);
          setPatientGender(picked?.gender_at_birth ?? picked?.gender ?? null);
          setSkipDl(!!picked?.driver_license_id);
          if (picked?.email) setIntakeEmail(picked.email);
          setStep(isLoggedIn && isEmailUser ? 'payment' : 'login');
          return;
        }

        setDd(ddRow);
        setPatients(list);
        setStep(list.length > 0 ? 'choose-patient' : 'intake');
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.error || err?.message || 'Failed to load consult');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, ddId, authHasHydrated]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-sm text-text-secondary">
        {error}
      </div>
    );
  }

  if (!accessToken || !dd || patients === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {/* Escape hatch — a bad network can leave the user stuck on this
            loader with no way out. The X lets them bail to /chat. */}
        <button
          type="button"
          aria-label="Close"
          style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 50, transition: 'opacity 0.2s', cursor: 'pointer' }}
          className="hover:opacity-80"
          onClick={() => router.push('/chat')}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" fill="white" />
            <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" stroke="#F3F1EB" />
            <path d="M16 16L28 28M16 28L28 16" stroke="#7A7468" strokeWidth="1.35" strokeLinecap="round" />
          </svg>
        </button>
        <BeautifulLoader label="Setting up your consult…" />
      </div>
    );
  }

  if (paidEncounterId) {
    return <RedirectToPaidConsult encounterId={paidEncounterId} />;
  }

  if (pendingRedirectRef.current === null) {
    pendingRedirectRef.current =
      !skipPendingPopup &&
      (!!dd.patient_id || hasIntakeFormProgress(ddId));
  }
  if (pendingRedirectRef.current) {
    return <RedirectToPendingIntake ddId={ddId} />;
  }

  const goToPostPatient = async (
    newPatientId: string,
    hasDriverLicense: boolean,
    opts: { dob?: string | null; gender?: number | string | null } = {},
  ) => {
    setPatientId(newPatientId);
    setPatientDob(opts.dob ?? null);
    setPatientGender(opts.gender ?? null);
    setSkipDl(hasDriverLicense);
    const age = ageFromDob(opts.dob ?? null);
    if (age != null) {
      try {
        const refreshed = await getDifferentialDiagnosis(ddId, age);
        setDd((prev) => (prev ? { ...prev, pending_questions: refreshed.pending_questions } : prev));
      } catch {
        // keep the bootstrap question set on failure
      }
    }
     setStep(isLoggedIn && isEmailUser ? 'payment' : 'login');
  };

  // Submitted from the intake form. Usually a brand-new patient (no DL yet),
  // but when the user went back to edit and left everything unchanged the form
  // re-uses the existing patient — carry over its DL status so we can still
  // skip the identity-check card.
  const handleIntakeComplete = (
    newPatientId: string,
    _isAvFlow: boolean,
    gender?: number | string | null,
    dob?: string | null,
    email?: string,
  ) => {
    if (email) setIntakeEmail(email);
    const reusedExisting = newPatientId === prefillPatient?.id;
    const hasDl = reusedExisting ? !!prefillPatient?.driver_license_id : false;
    setPrefillPatient(null);
    goToPostPatient(newPatientId, hasDl, { dob, gender });
  };
  const handleUseExisting = async (
    pickedPatientId: string,
    hasDriverLicense: boolean,
    _isAvFlow: boolean,
    _hasIntroVideo: boolean,
  ) => {
    try {
      await selectExistingPatient({ differential_diagnosis_id: ddId, patient_id: pickedPatientId });
      const picked = patients?.find((p) => p.id === pickedPatientId);
      if (picked?.email) setIntakeEmail(picked.email);
      goToPostPatient(pickedPatientId, hasDriverLicense, {
        dob: picked?.date_of_birth ?? null,
        gender: picked?.gender_at_birth ?? picked?.gender ?? null,
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Could not select patient');
    }
  };
  const handleCreateNew = () => {
    // Fresh patient — never prefill from a previously-selected one.
    setPrefillPatient(null);
    setStep('intake');
  };

  const handleIntakeQuestionsComplete = () => {
    // Eligible (not disqualified) — hand off to the consult page. The
    // `intake_done=1` flag tells it to show the brief "you're ready" card
    // for a few seconds before the post-payment steps.
    // `||` not `??`: an empty-string encounter id (bad checkout-session
    // payload) must fall through instead of producing /consults/e/?…
    const target = chargedEncounterId || paidEncounterId;
    if (target) {
      const dest = `/consults/e/${target}?intake_done=1`;
      router.replace(dest);
      // Watchdog: users have gotten stuck here — the full save cycle ran,
      // onComplete fired, but the soft navigation never happened and the
      // questions step stayed up with a re-enabled Continue. If we're still
      // on /consults/d after a grace period, force a hard navigation (the
      // /consults/e page rebuilds all of its state from the server anyway).
      window.setTimeout(() => {
        if (window.location.pathname.startsWith('/consults/d/')) {
          console.warn('[PrePaymentFlow] soft navigation to consult page did not take effect, hard-navigating', { dest });
          window.location.assign(dest);
        }
      }, 1500);
    } else {
      router.push('/chat');
    }
  };

  const handleLoginComplete = () => {
    trackMeta('telehealth_login_complete', { dd_id: ddId });
    setStep('payment');
  };

  const handlePaymentComplete = (_checkoutSessionId: string, encounterId: string) => {
    setChargedEncounterId(encounterId);
    setStep('intake-questions');
  };

  const stepIndex = progressIndexFor(step);

  // Step-aware back. Walks backwards through the flow before exiting:
  //   intake-questions → previous question, or step back if at index 0
  //   intake / login / payment → previous step
  //   choose-patient → /chat
  const handleBack = () => {
    if (step === 'intake-questions') {
      intakeQuestionsRef.current?.goBack();
      return;
    }
    if (step === 'intake') {
      if (patients && patients.length > 0) {
        setStep('choose-patient');
        return;
      }
      router.push('/chat');
      return;
    }
    if (step === 'login') {
      const selected = patients?.find((p) => p.id === patientId) ?? null;
      setPrefillPatient(selected);
      setStep('intake');
      return;
    }
    if (step === 'payment') {
      const selected = patients?.find((p) => p.id === patientId) ?? null;
      setPrefillPatient(selected);
      setStep('intake');
      return;
    }
    // choose-patient or any unknown state — exit the flow.
    router.push('/chat');
  };

  return (
    <>
      {/* Branded Close Button - Fixed 24px from top/right. Hidden on
          intake-questions step because that step renders its own top
          chrome (Back / Next) and the X would overlap Next. Also hidden
          while the payment is being processed so the user can't bail out
          after their card has been charged. */}
      {step !== 'intake-questions' && !paymentProcessing && (
      <button
        type="button"
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 50,
          transition: 'opacity 0.2s',
          cursor: 'pointer',
        }}
        className="hover:opacity-80"
        onClick={() => router.push('/chat')}
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" fill="white"/>
          <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" stroke="#F3F1EB"/>
          <path d="M16 16L28 28M16 28L28 16" stroke="#7A7468" strokeWidth="1.35" strokeLinecap="round"/>
        </svg>
      </button>
      )}

      {/* Branded Back Button — on the payment and login steps, letting the
          user return to the patient details to edit. Hidden once the charge
          is processing so they can't bail. */}
      {(step === 'payment' || step === 'login') && !paymentProcessing && (
      <button
        type="button"
        aria-label="Back"
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          zIndex: 50,
          transition: 'opacity 0.2s',
          cursor: 'pointer',
        }}
        className="hover:opacity-80"
        onClick={handleBack}
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" fill="white"/>
          <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" stroke="#F3F1EB"/>
          <path d="M25 15L19 22L25 29" stroke="#7A7468" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      )}

      {/* IntakeQuestionsStep renders its own fixed Back / Next / progress
          chrome at the top of the viewport, so omit this sticky spacer for
          that step — otherwise it pushes the progress bar ~60px below the
          Back/Next baseline. Payment step is full-viewport (its own
          fixed/inset:0 shell) so we hide the spacer there too. */}
      {step !== 'intake-questions' && step !== 'payment' && (
      <div className={step === 'login' ? 'sticky top-0 z-20 bg-surface-page' : ''}>
        <div className="flex items-center gap-3 px-5 md:px-6 pt-[43px] pb-[51px]">
          {step === 'login' ? (
            <div className="flex-1 max-w-lg mx-auto">
              <ProgressBar current={stepIndex} total={TOTAL_STEPS} />
            </div>
          ) : (
            <span className="flex-shrink-0 h-11 w-11" aria-hidden />
          )}
        </div>
      </div>
      )}

      {step === 'choose-patient' && patients.length > 0 && (
        <ChoosePatientStep
          patients={patients}
          onUseExisting={handleUseExisting}
          onCreateNew={handleCreateNew}
        />
      )}
      {step === 'intake' && (
        <IntakeFormStep
          user={user}
          onComplete={handleIntakeComplete}
          differentialDiagnosisId={ddId}
          prefillPatient={prefillPatient}
        />
      )}
      {step === 'intake-questions' && (
        <IntakeQuestionsStep
          ref={intakeQuestionsRef}
          differentialDiagnosisId={ddId}
          initialQuestions={dd.pending_questions ?? []}
          onComplete={handleIntakeQuestionsComplete}
          onDisqualified={() => setDisqualified(true)}
          patientDob={patientDob}
          patientGender={patientGender}
          onBack={handleBack}
          onClose={() => router.push('/chat')}
          encounterId={chargedEncounterId ?? paidEncounterId}
        />
      )}
      {disqualified && (
        <InPersonCareModal onAcknowledge={() => router.push('/chat')} />
      )}
      {step === 'login' && (
        <LoginStep
          user={user}
          isAnonymous={isAnonymous}
          episodeId={dd.episode_id}
          differentialDiagnosisId={ddId}
          initialEmail={intakeEmail}
          onComplete={handleLoginComplete}
        />
      )}
      {step === 'payment' && patientId && (
        <PaymentStep
          episodeId={dd.episode_id}
          ddId={ddId}
          patientId={patientId}
          skipDl={skipDl}
          email={user?.email || ''}
          onComplete={handlePaymentComplete}
          onProcessingChange={setPaymentProcessing}
        />
      )}
    </>
  );
}

function hasIntakeFormProgress(ddId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(`intake-form-draft:${ddId}`);
    if (!raw) return false;
    const draft = JSON.parse(raw) as Record<string, unknown>;
    const fields = [
      'dob',
      'gender',
      'phone',
      'addressLine1',
      'addressLine2',
      'city',
      'state',
      'zip',
      'heightFt',
      'heightIn',
      'weightLbs',
    ];
    for (const k of fields) {
      const v = draft[k];
      if (typeof v === 'string' && v.trim().length > 0) return true;
    }
    return !!draft['smsConsent'];
  } catch {
    return false;
  }
}

function RedirectToPendingIntake({ ddId }: { ddId: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/chat?pending_intake=${ddId}`);
  }, [ddId, router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <BeautifulLoader />
    </div>
  );
}

// Surfaces when /get-differential-diagnosis returns an encounter_id —
// meaning the user already paid for this DD. Pre-fetches the encounter
// here (still on the loader screen) so we can hand /chat the visit bucket
// in the URL and the transition modal can render immediately on mount
// with no second-fetch flicker.
function RedirectToPaidConsult({ encounterId }: { encounterId: string }) {
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let bucket: 'ready' | 'in-progress' | 'complete' = 'in-progress';
      let disqualified = false;
      try {
        const enc = await getEncounter(encounterId);
        if (enc?.status === 'disqualified') disqualified = true;
        else if (enc?.status === 'completed') bucket = 'complete';
        else if (enc?.status === 'assigned') bucket = 'ready';
        else bucket = 'in-progress';
      } catch {
        // Fall back to in-progress label; the user still ends up at the
        // consult chat after the countdown.
      }
      if (cancelled) return;
      router.replace(
        disqualified
          ? `/chat?disqualified=${encounterId}`
          : `/chat?consult_in_progress=${encounterId}&visit_state=${bucket}`,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [encounterId, router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <BeautifulLoader />
    </div>
  );
}
