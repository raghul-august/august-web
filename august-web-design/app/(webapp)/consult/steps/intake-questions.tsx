'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Paperclip, Camera, VideoCamera, X, CaretLeft } from '@phosphor-icons/react';
import {
  completeIntake,
  submitIntakeAnswer,
  uploadMedia,
  uploadIntroVideo,
  type IntakeAnswerValue,
  type IntakeQuestion,
} from '@/services/consultations-service';
import { trackTelehealth } from '@/services/telehealth-analytics';
import { BeautifulLoader } from '../_components';
import { clearDraft as clearIntakeFormDraft } from './intake-form';
import { VideoRecorderUI } from '@/components/chat/video-recorder-ui';
import { PhotoCaptureUI } from '@/components/chat/photo-capture-ui';

interface Props {
  differentialDiagnosisId: string;
  // Pending intake questions fetched upstream (pre-payment-flow's bootstrap
  // call). The step uses them as its source of truth — no second fetch.
  initialQuestions?: IntakeQuestion[];
  onComplete: () => void;
  // Fired when the gatekeeper's eligibility check at complete-intake
  // determines every candidate offering failed its required questions.
  // The parent flow swaps the step out for the in-person-care modal.
  onDisqualified?: () => void;
  // Patient facts used to auto-answer derived intake questions without
  // showing them to the user.
  patientDob?: string | null;
  patientGender?: number | string | null;
  // Fired by the in-step Back chrome when the user is already on the first
  // question — lets the parent decide whether to walk back to the picker /
  // intake form / route home.
  onBack?: () => void;
  onClose?: () => void;
  encounterId?: string | null;
}

export function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  if (age < 0 || age > 150) return null;
  return age;
}

const FIRST_MESSAGE_PREFIX = 'This is your first message to your doctor.';
function displayTitle(question: { slug: string; title: string }): string {
  if (question.slug === 'additional_context' && question.title.startsWith(FIRST_MESSAGE_PREFIX)) {
    return question.title.slice(FIRST_MESSAGE_PREFIX.length).trim();
  }
  return question.title;
}

// File questions have no explicit media type stored, so infer it from the
// slug/title: a "video" question records video; a "photo"/"image" question
// takes a photo; everything else accepts any file.
function fileKindForQuestion(question: { slug?: string | null; title?: string | null }): 'video' | 'image' | 'any' {
  const s = `${question.slug ?? ''} ${question.title ?? ''}`.toLowerCase();
  if (s.includes('video')) return 'video';
  if (s.includes('photo') || s.includes('image')) return 'image';
  return 'any';
}

function genderOptionIdFromGender(gender: number | string | null | undefined): string | null {
  if (gender == null) return null;
  if (typeof gender === 'number') {
    if (gender === 1) return 'gender_male';
    if (gender === 2) return 'gender_female';
    return null;
  }
  const normalized = gender.trim().toLowerCase();
  if (normalized === '1' || normalized === 'male' || normalized === 'm') return 'gender_male';
  if (normalized === '2' || normalized === 'female' || normalized === 'f') return 'gender_female';
  if (normalized === 'not_known' || normalized === 'unknown') return 'gender_not_known';
  if (normalized === 'not_applicable') return 'gender_not_applicable';
  return null;
}

function hasOption(question: IntakeQuestion, id: string): boolean {
  const opts: Array<Option | string> = Array.isArray(question.options) ? (question.options as any) : [];
  return opts.some((opt, i) => optionId(opt, i) === id);
}

function deriveAnswerForQuestion(
  question: IntakeQuestion,
  patientDob: string | null | undefined,
  patientGender: number | string | null | undefined,
): IntakeAnswerValue | null {
  if (question.slug === 'patient_age') {
    const age = ageFromDob(patientDob);
    return age != null ? { number: age } : null;
  }
  if (question.slug === 'patient_gender') {
    const optionId = genderOptionIdFromGender(patientGender);
    return optionId && hasOption(question, optionId) ? { option_id: optionId } : null;
  }
  if (
    genderOptionIdFromGender(patientGender) === 'gender_male' &&
    (question.slug === 'pregnancy' || hasOption(question, 'pregnancy_no'))
  ) {
    return { option_id: 'pregnancy_no' };
  }
  return null;
}

// Imperative handle the parent flow uses to wire the chrome's back button
// into intra-step navigation: clicking back should walk through previous
// questions before exiting the flow.
export interface IntakeQuestionsHandle {
  /**
   * Steps to the previous question when one is available.
   * Returns true if it stepped back, false if already on the first
   * question (parent should then decide where to go — e.g. choose-patient).
   */
  goBack: () => boolean;
}

// One-at-a-time intake question runner. Mirrors the spec's "Intake Form
// Loaded" step — fetches the pending question set, walks through each in
// `display_order`, upserts the answer on submit, and fires `intake_completed`
// when the queue is empty.
//
// Question types map straight to MDI's intake schema:
//   text            -> free-text textarea           -> { text: string }
//   number          -> numeric input                -> { number, note? }
//   single_option   -> radio list of options        -> { option_id, note? }
//   multiple_option -> checkbox list of options     -> { option_ids, note? }
//   file            -> not implemented in POC
export const IntakeQuestionsStep = forwardRef<IntakeQuestionsHandle, Props>(function IntakeQuestionsStep(
  { differentialDiagnosisId, initialQuestions, onComplete, onDisqualified, patientDob, patientGender, onBack, onClose, encounterId },
  ref,
) {
  const [questions, setQuestions] = useState<IntakeQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  // Per-question drafts kept around so navigating back to an already-
  // answered question shows the previously-typed answer instead of an
  // empty input. The drafts map is the source of truth for the current
  // question's value; on submit we upsert (idempotent) to the backend.
  //
  // Hydrated from sessionStorage so partial answers survive the
  // intake-questions ↔ choose-patient / intake-form remounts in the
  // pre-payment flow (the step component unmounts when the user navigates
  // back to a prior step). Persisted on every change below.
  const draftsStorageKey = `intake-drafts:${differentialDiagnosisId}`;
  const [drafts, setDrafts] = useState<Record<string, DraftValue>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = sessionStorage.getItem(draftsStorageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, DraftValue>) : {};
    } catch {
      return {};
    }
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittedDerivedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    submittedDerivedRef.current = new Set();
  }, [differentialDiagnosisId]);

  // Persist drafts every time they change. Tab-scoped (sessionStorage) so
  // closing the tab clears them — we don't want stale drafts persisting
  // across days.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(draftsStorageKey, JSON.stringify(drafts));
    } catch {
      // quota exceeded / private mode — drop silently, drafts remain in memory.
    }
  }, [drafts, draftsStorageKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const seedQuestions = Array.isArray(initialQuestions) ? initialQuestions : [];
        const derivedAnswers = seedQuestions
          .map((q) => ({
            question: q,
            answer: deriveAnswerForQuestion(q, patientDob, patientGender),
          }))
          .filter((item): item is { question: IntakeQuestion; answer: IntakeAnswerValue } => !!item.answer);
        const derivedIds = new Set(derivedAnswers.map((item) => item.question.question_id));
        const userQueue = seedQuestions.filter((q) => !derivedIds.has(q.question_id));

        // Submit each derived answer in the background. Best-effort —
        // don't block the user on these. Failures are logged via the
        // server's normal error pipeline; the question simply stays
        // unanswered until next reload.
      const pendingDerivedSubmissions = derivedAnswers.filter(
          ({ question }) => !submittedDerivedRef.current.has(question.question_id),
        );
        await Promise.all(
          pendingDerivedSubmissions.map(async ({ question, answer }) => {
            submittedDerivedRef.current.add(question.question_id);
            try {
              await submitIntakeAnswer({
                differential_diagnosis_id: differentialDiagnosisId,
                question_id: question.question_id,
                answer_value: answer,
              });
            } catch {
              submittedDerivedRef.current.delete(question.question_id);
            }
          }),
        );

        if (cancelled) return;

        if (seedQuestions.length === 0 || userQueue.length === 0) {
          const result = await completeIntake(differentialDiagnosisId, encounterId ?? undefined).catch(() => null);
          trackTelehealth('intake_completed');
          if (result?.status === 'disqualified' && onDisqualified) {
            onDisqualified();
            return;
          }
          onComplete();
          return;
        }
        // Prefill drafts from August's conversation answers so the user just
        // confirms. A persisted sessionStorage draft (or one the user already
        // edited) wins, so we only seed questions that don't already have one.
        setDrafts((prev) => {
          let changed = false;
          const next = { ...prev };
          for (const q of userQueue) {
            if (next[q.question_id]) continue;
            const seeded = draftFromAugustAnswer(q);
            if (seeded) {
              next[q.question_id] = seeded;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
        setQuestions(userQueue);
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.error || err?.message || 'Failed to load questions');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [differentialDiagnosisId, initialQuestions, onComplete, patientDob, patientGender]);

  // Chrome back button calls into this — walks to the previous question
  // when there is one, otherwise reports that we're at the start so the
  // parent can route up the flow (back to patient picker / intake form).
  useImperativeHandle(
    ref,
    () => ({
      goBack: () => {
        if (index > 0) {
          setIndex((i) => Math.max(0, i - 1));
          setError(null);
          return true;
        }
        return false;
      },
    }),
    [index],
  );

  const current = useMemo<IntakeQuestion | null>(() => {
    if (!questions) return null;
    return questions[index] ?? null;
  }, [questions, index]);

  useEffect(() => {
    if (!current) return;
    trackTelehealth('intake_step_shown', { step: current.slug });
  }, [current?.question_id]);

  // The current question's draft — pulled from the per-question map so
  // a previously-answered question shows the user's earlier value when
  // they navigate back. Falls back to a type-correct empty draft when
  // visiting the question for the first time.
  const draft: DraftValue = current
    ? drafts[current.question_id] ?? initialDraftFor(current)
    : initialDraftFor(null);

  const setDraft = (next: DraftValue) => {
    if (!current) return;
    setDrafts((prev) => ({ ...prev, [current.question_id]: next }));
  };

  if (error) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 md:px-6 pt-6 pb-10">
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!questions || !current) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BeautifulLoader label="Setting up your consult…" />
      </div>
    );
  }

  const isLast = index === questions.length - 1;
  const canSubmit = isDraftAnswered(current.type, draft);

  async function handleNext(overrideDraft?: DraftValue) {
    if (!current) return;
    const effective = overrideDraft ?? draft;
    if (!isDraftAnswered(current.type, effective)) return;
    if (overrideDraft) setDraft(overrideDraft);
    setBusy(true);
    setError(null);
    try {
      let answerValue: IntakeAnswerValue | null;
      if (current.type === 'file') {
        const filesToUpload = (effective.kind === 'file' ? effective.files : []).filter(
          (f): f is File => f instanceof File,
        );
        const urls: string[] = [];
        if (current.slug === 'parental_consent_video') {
          for (const f of filesToUpload) {
            const res = await uploadIntroVideo({ differential_diagnosis_id: differentialDiagnosisId, file: f });
            const ref = res?.url || res?.file_url || res?.file_id;
            if (ref) urls.push(ref);
          }
        } else {
          for (const f of filesToUpload) {
            const res = await uploadMedia({ file: f });
            const ref = res?.url || res?.file_id;
            if (ref) urls.push(ref);
          }
        }
        answerValue = urls.length > 0 ? { file_ids: urls } : null;
      } else {
        answerValue = buildAnswerValue(current.type, effective);
      }
      if (!answerValue) {
        setError('Upload failed. Please try again.');
        setBusy(false);
        return;
      }
      const submitResult = await submitIntakeAnswer({
        differential_diagnosis_id: differentialDiagnosisId,
        question_id: current.question_id,
        answer_value: answerValue,
      });
      trackTelehealth('intake_step_filled', {
        step: current.slug,
        question: current.title,
      });
      if (submitResult?.status === 'disqualified') {
        trackTelehealth('intake_completed');
        try {
          if (typeof window !== 'undefined') sessionStorage.removeItem(draftsStorageKey);
        } catch {
          // ignore
        }
        clearIntakeFormDraft(differentialDiagnosisId);
        onDisqualified?.();
        return;
      }
      if (isLast) {
        const result = await completeIntake(differentialDiagnosisId, encounterId ?? undefined).catch((err) => {
          // Swallow on purpose — the answers are already saved one-by-one, so
          // a flaky complete-intake must not strand the user on the last
          // question. Log it so a stuck flow can be traced in the console.
          console.warn('[IntakeQuestions] complete-intake failed', err?.response?.status, err?.message);
          return null;
        });
        console.info('[IntakeQuestions] last answer saved', {
          completeStatus: result?.status ?? 'ok',
          encounterId,
        });
        trackTelehealth('intake_completed');
        // Intake done — clear cached drafts so a future consult doesn't
        // start with stale answers from this DD.
        try {
          if (typeof window !== 'undefined') sessionStorage.removeItem(draftsStorageKey);
        } catch {
          // ignore
        }
        clearIntakeFormDraft(differentialDiagnosisId);
        setBusy(false);
        if (result?.status === 'disqualified' && onDisqualified) {
          onDisqualified();
          return;
        }
        onComplete();
        return;
      }
      setIndex((i) => i + 1);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to save answer');
    } finally {
      setBusy(false);
    }
  }

  const progressPct = ((index + 1) / questions.length) * 100;

  const handleStepBack = () => {
    if (index > 0) {
      setIndex((i) => Math.max(0, i - 1));
      setError(null);
      return;
    }
    onBack?.();
  };

  return (
    <>
      {/* Back only steps between questions. On the first question there's
          nowhere valid to go (payment precedes these questions and can't be
          undone), so hide it rather than show a dead button. */}
      {index > 0 && (
      <button
        type="button"
        onClick={handleStepBack}
        aria-label="Back"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          left: 24,
          zIndex: 60,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: 0,
          background: 'transparent',
          border: 'none',
          color: '#141515',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 16,
          fontWeight: 500,
          lineHeight: '20px',
        }}
      >
        <CaretLeft size={20} weight="regular" />
        Back
      </button>
      )}

      {/* Close the question strip (e.g. step away to finish later). The
          consult is already paid, so the bootstrap resumes these questions
          on return. Advancing is done via the primary "Continue" button.
          Uses the same branded close button + paddings as the intake/payment
          steps. */}
      {onClose && (
      <button
        type="button"
        aria-label="Close"
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 60,
          transition: 'opacity 0.2s',
          cursor: 'pointer',
        }}
        className="hover:opacity-80"
        onClick={onClose}
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" fill="white"/>
          <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" stroke="#F3F1EB"/>
          <path d="M16 16L28 28M16 28L28 16" stroke="#7A7468" strokeWidth="1.35" strokeLinecap="round"/>
        </svg>
      </button>
      )}

	    <div
	      className="mx-auto flex w-full max-w-[513px] flex-col items-stretch gap-10 px-5 pb-10 pt-[88px] sm:pt-[31px]"
	    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={0}
          aria-valuemax={questions.length}
          style={{
            position: 'relative',
            width: '100%',
            height: '6px',
            background: '#E5E2DA',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0 auto 0 0',
              width: `${progressPct}%`,
              background: '#206E55',
              transition: 'width 240ms ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h1
              style={{
                margin: 0,
                color: '#141515',
                fontSize: '30px',
                fontWeight: 500,
                lineHeight: '36px',
                letterSpacing: '-0.5px',
              }}
            >
              {displayTitle(current)}
            </h1>
            {current.description && <Description text={current.description} />}
              {current.august_answer_value != null && (
                <p
                  style={{
                    margin: 0,
                    color: '#C68E2A',
                    marginTop: '8px',
                    fontSize: '15px',
                    fontWeight: 500,
                    lineHeight: '16px',
                  }}
                >
                  Confirming our conversation before I share with the doctor
                </p>
              )}
          </div>

          <QuestionInput question={current} value={draft} onChange={setDraft} onAdvance={handleNext} />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {(() => {
        // Slugs with a two-state bottom button: when the textarea is empty,
        // the button reads "I don't have any X" and on click stamps that
        // sentinel as the answer and advances. When the user has typed
        // something, the button flips to the standard green Continue.
        const NONE_LABELS: Record<string, string> = {
          drug_allergies: "I don't have any allergies",
          current_medications: "I don't have any medications",
          medical_conditions: "I don't have any medical conditions",
        };
        const noneLabel = NONE_LABELS[current.slug];
        if (noneLabel && draft.kind === 'text') {
          const text = draft.text;
          const hasContent = text.trim().length > 0;
          const onClick = hasContent
            ? () => handleNext()
            : () => handleNext({ kind: 'text', text: noneLabel });
          return (
            <NoneOrContinueButton
              hasContent={hasContent}
              busy={busy}
              noneLabel={noneLabel}
              onClick={onClick}
            />
          );
        }
        return (
          <button
            type="button"
            onClick={() => handleNext()}
            disabled={!canSubmit || busy}
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '999px',
              background: (!canSubmit || busy) ? '#E5E2DA' : '#206E55',
              color: (!canSubmit || busy) ? '#7A7468' : '#FFF',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.2s ease-in-out',
              cursor: (!canSubmit || busy) ? 'not-allowed' : 'pointer',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '20px',
            }}
          >
            {busy ? 'Saving…' : 'Continue'}
          </button>
        );
      })()}
    </div>
    </>
  );
});

// ── draft state ──────────────────────────────────────────────

type Option = {
  id?: string;
  option_id?: string;
  value?: string;
  label?: string;
  title?: string;
  // When true the option renders a red "CRITICAL" pill next to the label
  // (e.g. the penicillin-allergy "Yes" answer that disqualifies the visit).
  critical?: boolean;
};

interface TextDraft { kind: 'text'; text: string; }
interface NumberDraft { kind: 'number'; raw: string; }
interface SingleOptionDraft { kind: 'single_option'; option_id: string | null; note: string; }
interface MultipleOptionDraft { kind: 'multiple_option'; option_ids: string[]; }
interface FileDraft { kind: 'file'; files: File[]; note: string; }
interface UnsupportedDraft { kind: 'unsupported'; }
type DraftValue = TextDraft | NumberDraft | SingleOptionDraft | MultipleOptionDraft | FileDraft | UnsupportedDraft;

function initialDraftFor(q: IntakeQuestion | null): DraftValue {
  if (!q) return { kind: 'text', text: '' };
  switch (q.type) {
    case 'text':            return { kind: 'text', text: '' };
    case 'number':          return { kind: 'number', raw: '' };
    case 'single_option':   return { kind: 'single_option', option_id: null, note: '' };
    case 'multiple_option': return { kind: 'multiple_option', option_ids: [] };
    case 'file':            return { kind: 'file', files: [], note: '' };
    default:                return { kind: 'unsupported' };
  }
}

function isDraftAnswered(type: string, d: DraftValue): boolean {
  switch (d.kind) {
    case 'text':            return d.text.trim().length > 0;
    case 'number':          return d.raw.trim().length > 0 && !Number.isNaN(Number(d.raw));
    case 'single_option':   return !!d.option_id;
    case 'multiple_option': return d.option_ids.length > 0;
    case 'file':            return d.files.length > 0;
    default:                return false;
  }
}

function buildAnswerValue(type: string, d: DraftValue): IntakeAnswerValue | null {
  switch (d.kind) {
    case 'text':            return { text: d.text.trim() };
    case 'number':          return { number: Number(d.raw) };
    case 'single_option': {
      if (!d.option_id) return null;
      const note = d.note.trim();
      return note ? { option_id: d.option_id, note } : { option_id: d.option_id };
    }
    case 'multiple_option': return d.option_ids.length > 0 ? { option_ids: d.option_ids } : null;
    case 'file':            return { file_ids: [] };
    default:                return null;
  }
}

function optionId(o: Option | string, fallback: number): string {
  if (typeof o === 'string') return o;
  return o.option_id ?? o.id ?? o.value ?? o.label ?? o.title ?? String(fallback);
}

// Resolve a token from august_answer_value (which may be an option id, an
// option_id, a value, or a backend `key`) to the draft option id used by the
// renderer (i.e. whatever optionId() returns for that option).
function resolveOptionToken(question: IntakeQuestion, token: string): string | null {
  const opts: Array<Option | string> = Array.isArray(question.options) ? (question.options as any) : [];
  for (let i = 0; i < opts.length; i++) {
    const o = opts[i];
    if (typeof o === 'string') {
      if (o === token) return optionId(o, i);
      continue;
    }
    const key = (o as { key?: string }).key;
    if (o.id === token || o.option_id === token || o.value === token || key === token) {
      return optionId(o, i);
    }
  }
  return null;
}

// Map an august_answer_value onto a DraftValue so the prefilled answer shows
// up in the input for the user to confirm. Returns null when there's nothing
// to prefill (no value, or none of its tokens matched an option).
function draftFromAugustAnswer(question: IntakeQuestion): DraftValue | null {
  const av = question.august_answer_value;
  if (!av) return null;
  switch (question.type) {
    case 'text':
      return typeof av.text === 'string' && av.text.trim() ? { kind: 'text', text: av.text } : null;
    case 'number':
      return typeof av.number === 'number' ? { kind: 'number', raw: String(av.number) } : null;
    case 'single_option': {
      const token = av.option_id ?? av.single_option ?? null;
      const id = token != null ? resolveOptionToken(question, String(token)) : null;
      return id ? { kind: 'single_option', option_id: id, note: typeof av.note === 'string' ? av.note : '' } : null;
    }
    case 'multiple_option': {
      const tokens = Array.isArray(av.option_ids)
        ? av.option_ids
        : Array.isArray(av.multiple_option)
          ? av.multiple_option
          : [];
      const ids = tokens
        .map((t) => resolveOptionToken(question, String(t)))
        .filter((x): x is string => !!x);
      return ids.length ? { kind: 'multiple_option', option_ids: ids } : null;
    }
    default:
      return null;
  }
}
function optionLabel(o: Option | string, fallback: number): string {
  const raw = typeof o === 'string' ? o : (o.label ?? o.title ?? String(o.option_id ?? o.id ?? o.value ?? fallback));
  return toSentenceCase(raw);
}
function optionIsCritical(o: Option | string): boolean {
  if (typeof o === 'string') return false;
  return o.critical === true;
}

function toSentenceCase(input: string): string {
  if (!input) return input;
  const lower = input.toLowerCase();
  return lower.replace(/(^|[.!?]\s+)([a-z])/g, (_m, lead: string, ch: string) => lead + ch.toUpperCase());
}

// Outlined red pill next to a single_option label — mirrors the design
// for clinically-significant answers (e.g. penicillin-allergy "Yes")
// that disqualify the visit at /complete-intake time.
function CriticalPill() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        border: '1px solid #9F2A1A',
        color: '#9F2A1A',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.8px',
        lineHeight: '14px',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: '#9F2A1A',
          display: 'inline-block',
        }}
      />
      Critical
    </span>
  );
}

// ── input renderer ───────────────────────────────────────────

function QuestionInput({
  question,
  value,
  onChange,
  onAdvance,
}: {
  question: IntakeQuestion;
  value: DraftValue;
  onChange: (v: DraftValue) => void;
  onAdvance?: () => void;
}) {
  const opts: Array<Option | string> = Array.isArray(question.options) ? (question.options as any) : [];

  const orderedOpts = useMemo(() => {
    const indexed = opts.map((opt, i) => ({ opt, i }));
    const initialPicked = value.kind === 'single_option' ? value.option_id : null;
    if (!initialPicked) return indexed;
    const at = indexed.findIndex(({ opt, i }) => optionId(opt, i) === initialPicked);
    if (at <= 0) return indexed;
    const next = [...indexed];
    const [sel] = next.splice(at, 1);
    next.unshift(sel);
    return next;
  }, [question.question_id]);

  if (question.type === 'single_option' && opts.length === 1) {
    const picked = value.kind === 'single_option' ? value.option_id : null;
    const opt = opts[0];
    const id = optionId(opt, 0);
    const label = optionLabel(opt, 0);
    const isChecked = picked === id;
    const toggle = () =>
      onChange({ kind: 'single_option', option_id: isChecked ? null : id, note: '' });
    return (
      <button
        type="button"
        onClick={toggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: isChecked ? '#206E55' : '#FFFFFF',
            border: isChecked ? 'none' : '0.5px solid #D1CDC2',
            boxShadow: isChecked ? 'none' : '0 4px 12px rgba(0,0,0,0.06)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s ease-in-out',
          }}
        >
          {isChecked && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <span
          style={{
            color: '#5A554A',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '23px',
            letterSpacing: '-0.2px',
          }}
        >
          {label}
        </span>
      </button>
    );
  }

  if (question.type === 'single_option') {
    const picked = value.kind === 'single_option' ? value.option_id : null;
    const note = value.kind === 'single_option' ? value.note : '';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orderedOpts.map(({ opt, i }) => {
          const id = optionId(opt, i);
          const label = optionLabel(opt, i);
          const critical = optionIsCritical(opt);
          const isPicked = picked === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ kind: 'single_option', option_id: id, note })}
              style={{
                width: '100%',
                minHeight: '56px',
                borderRadius: '12px',
                border: isPicked ? '1px solid #3D8168' : '1px solid #D1CDC2',
                background: isPicked ? '#E8F2ED' : '#F3F1EB',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left',
                transition: 'all 0.15s ease-in-out',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isPicked ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="9" stroke="#206E55" strokeWidth="1.5" />
                    <circle cx="10" cy="10" r="4.5" fill="#206E55" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="9" stroke="#A8A39A" strokeWidth="1.5" />
                  </svg>
                )}
              </span>
              <span
                style={{
                  flex: 1,
                  color: '#141515',
                  fontSize: '15px',
                  fontWeight: 500,
                  lineHeight: '24px',
                }}
              >
                {label}
              </span>
              {critical && <CriticalPill />}
            </button>
          );
        })}

        <NoteTextarea
          value={note}
          onChange={(text) =>
            onChange({ kind: 'single_option', option_id: picked, note: text })
          }
        />
      </div>
    );
  }

  if (question.type === 'multiple_option') {
    const picked = value.kind === 'multiple_option' ? value.option_ids : [];
    const toggle = (id: string) => {
      const next = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
      onChange({ kind: 'multiple_option', option_ids: next });
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {opts.map((opt, i) => {
          const id = optionId(opt, i);
          const label = optionLabel(opt, i);
          const isPicked = picked.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              style={{
                width: '100%',
                minHeight: '56px',
                borderRadius: '12px',
                border: isPicked ? '1px solid #3D8168' : '1px solid #D1CDC2',
                background: isPicked ? '#E8F2ED' : '#F3F1EB',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left',
                transition: 'all 0.15s ease-in-out',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isPicked ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.75" y="0.75" width="18.5" height="18.5" rx="4" fill="#206E55" stroke="#206E55" strokeWidth="1.5" />
                    <path d="M5.5 10.5 L8.5 13.5 L14.5 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.75" y="0.75" width="18.5" height="18.5" rx="4" stroke="#A8A39A" strokeWidth="1.5" />
                  </svg>
                )}
              </span>
              <span
                style={{
                  color: '#141515',
                  fontSize: '15px',
                  fontWeight: 500,
                  lineHeight: '24px',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === 'number') {
    return <NumberInput value={value} onChange={onChange} />;
  }

  if (question.type === 'file') {
    return <FileInput value={value} onChange={onChange} fileKind={fileKindForQuestion(question)} />;
  }

  if (question.type === 'text') {
    const text = value.kind === 'text' ? value.text : '';
    return (
      <TextAreaInput
        value={text}
        onChange={(t) => onChange({ kind: 'text', text: t })}
      />
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      Question type "{question.type}" is not yet supported on the patient app.
    </div>
  );
}

function Description({ text }: { text: string }) {
  const blocks = useMemo(() => parseDescription(text), [text]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {blocks.map((block, i) => {
        if (block.type === 'ul') {
          return (
            <ul
              key={i}
              style={{
                margin: 0,
                paddingLeft: '20px',
                listStyleType: 'disc',
                listStylePosition: 'outside',
                color: '#5A554A',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '24px',
                letterSpacing: '-0.2px',
              }}
            >
              {block.items.map((item, j) => (
                <li key={j} style={{ marginBottom: j < block.items.length - 1 ? '4px' : 0 }}>
                  {toSentenceCase(item)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={i}
            style={{
              margin: 0,
              color: '#5A554A',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '23px',
              letterSpacing: '-0.2px',
              whiteSpace: 'pre-line',
            }}
          >
            {toSentenceCase(block.items.join('\n'))}
          </p>
        );
      })}
    </div>
  );
}

function parseDescription(text: string): Array<{ type: 'p' | 'ul'; items: string[] }> {
  const lines = text.split('\n');
  const blocks: Array<{ type: 'p' | 'ul'; items: string[] }> = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const isBullet = /^[-•]\s+/.test(line);
    const content = isBullet ? line.replace(/^[-•]\s+/, '') : line;
    const last = blocks[blocks.length - 1];
    if (isBullet) {
      if (last?.type === 'ul') last.items.push(content);
      else blocks.push({ type: 'ul', items: [content] });
    } else {
      if (last?.type === 'p') last.items.push(content);
      else blocks.push({ type: 'p', items: [content] });
    }
  }
  return blocks;
}

const PICKER_CONFIG: Record<
  string,
  { searchPlaceholder: string; noneLabel: string; noneSentinel: string }
> = {
  drug_allergies: {
    searchPlaceholder: 'Allergy name',
    noneLabel: 'I don’t have any allergies',
    noneSentinel: 'I don’t have any allergies',
  },
  current_medications: {
    searchPlaceholder: 'Medication name',
    noneLabel: 'I don’t have any medications',
    noneSentinel: 'I don’t have any medications',
  },
};

function parsePickerItems(text: string, sentinel: string): string[] {
  if (!text || text === sentinel) return [];
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

function serializePickerItems(items: string[]): string {
  return items.join('\n');
}

function MedicalListPicker({
  slug,
  value,
  onChange,
  onAdvance,
}: {
  slug: string;
  value: DraftValue;
  onChange: (v: DraftValue) => void;
  onAdvance?: () => void;
}) {
  const config = PICKER_CONFIG[slug] ?? PICKER_CONFIG.drug_allergies;
  const text = value.kind === 'text' ? value.text : '';
  const isNoneSelected = text === config.noneSentinel;
  const items = isNoneSelected ? [] : parsePickerItems(text, config.noneSentinel);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  const commitItems = (next: string[]) => {
    onChange({ kind: 'text', text: serializePickerItems(next) });
  };

  const addItem = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    commitItems([...items, trimmed]);
    setSearch('');
  };

  const editItem = (index: number) => {
    const target = items[index];
    if (target === undefined) return;
    commitItems(items.filter((_, i) => i !== index));
    setSearch(target);
  };

  // The bottom button doubles as the step's Continue action. When the
  // queue is empty, advancing also stamps the "none" sentinel so the
  // backend records "no allergies / no medications" rather than blank.
  const handleBottomButton = () => {
    if (items.length === 0 && !isNoneSelected) {
      onChange({ kind: 'text', text: config.noneSentinel });
    }
    onAdvance?.();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: items.length > 0 ? '24px' : '32px' }}>
      <div
        style={{
          width: '100%',
          height: '56px',
          background: '#FFFFFF',
          border: focused ? '1px solid #141515' : '0.5px solid #D1CDC2',
          borderRadius: '10px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'border-color 0.15s ease-in-out',
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (isNoneSelected) onChange({ kind: 'text', text: '' });
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={config.searchPlaceholder}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: '#141515',
            fontSize: '15px',
            fontWeight: 400,
            lineHeight: '24px',
            padding: 0,
          }}
        />
      </div>

      {items.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, i) => {
            // Optional "Name: details" split — the title shows the part
            // before the first colon; everything after renders as the
            // secondary row (e.g. "Hives, Wheezing" in the design mock).
            const colon = item.indexOf(':');
            const title = colon === -1 ? item : item.slice(0, colon).trim();
            const subtitle = colon === -1 ? '' : item.slice(colon + 1).trim();
            return (
              <li
                key={`${item}-${i}`}
                style={{
                  width: '100%',
                  minHeight: '68px',
                  background: '#FFFFFF',
                  border: '0.5px solid #E5E2DA',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      color: '#141515',
                      fontSize: '15px',
                      fontWeight: 500,
                      lineHeight: '24px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {title}
                  </span>
                  {subtitle && (
                    <span
                      style={{
                        color: '#5A554A',
                        fontSize: '13px',
                        fontWeight: 400,
                        lineHeight: '20px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {subtitle}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => editItem(i)}
                  aria-label={`Edit ${title}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    border: 'none',
                    background: 'transparent',
                    color: '#5A554A',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                    marginRight: '8px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M21.3103 6.87866L17.1216 2.68897C16.9823 2.54965 16.8169 2.43913 16.6349 2.36373C16.4529 2.28832 16.2578 2.24951 16.0608 2.24951C15.8638 2.24951 15.6687 2.28832 15.4867 2.36373C15.3047 2.43913 15.1393 2.54965 15 2.68897L3.43969 14.2502C3.2998 14.389 3.18889 14.5542 3.11341 14.7362C3.03792 14.9183 2.99938 15.1135 3.00001 15.3105V19.5002C3.00001 19.898 3.15804 20.2796 3.43935 20.5609C3.72065 20.8422 4.10218 21.0002 4.50001 21.0002H8.6897C8.88675 21.0009 9.08197 20.9623 9.26399 20.8868C9.44602 20.8113 9.61122 20.7004 9.75001 20.5605L21.3103 9.00022C21.4496 8.86093 21.5602 8.69556 21.6356 8.51355C21.711 8.33153 21.7498 8.13645 21.7498 7.93944C21.7498 7.74243 21.711 7.54735 21.6356 7.36534C21.5602 7.18333 21.4496 7.01795 21.3103 6.87866ZM8.6897 19.5002H4.50001V15.3105L12.75 7.06053L16.9397 11.2502L8.6897 19.5002ZM18 10.189L13.8103 6.00022L16.0603 3.75022L20.25 7.93897L18 10.189Z" fill="#5A554A"/>
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={handleBottomButton}
        style={{
          width: '100%',
          height: '56px',
          background: '#FAF9F5',
          border: '0.5px solid #141515',
          color: '#141515',
          borderRadius: '999px',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease-in-out',
          marginTop: items.length > 0 ? '16px' : '0',
        }}
      >
        {items.length > 0 ? 'Continue' : config.noneLabel}
      </button>
    </div>
  );
}

function FileInput({
  value,
  onChange,
  fileKind = 'any',
}: {
  value: DraftValue;
  onChange: (v: DraftValue) => void;
  fileKind?: 'video' | 'image' | 'any';
}) {
  const files = value.kind === 'file' ? value.files : [];
  const note = value.kind === 'file' ? value.note : '';
  const isVideo = fileKind === 'video';
  const pickerAccept = fileKind === 'video' ? 'video/*' : fileKind === 'image' ? 'image/*' : undefined;
  const captureAccept = isVideo ? 'video/*' : 'image/*';
  const captureFacing = isVideo ? 'user' : 'environment';
  const captureLabel = isVideo ? 'Record a video' : 'Take a photo from the camera';
  const pickerLabel = isVideo
    ? 'Select a video or drag and drop it here'
    : fileKind === 'image'
      ? 'Select a photo or drag and drop it here'
      : 'Select multiple files or drag and drop them here';
  const filePickerRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const next = [...files, ...Array.from(incoming)];
    onChange({ kind: 'file', files: next, note });
  };

  const addFile = (file: File) => {
    onChange({ kind: 'file', files: [...files, file], note });
  };

  const removeFile = (index: number) => {
    onChange({ kind: 'file', files: files.filter((_, i) => i !== index), note });
  };

  const hasFiles = files.length > 0;
  const tileBg = hasFiles ? '#FAF9F5' : '#F3F1EB';
  const tileBorderColor = hasFiles ? '#A8A39A' : '#D1CDC2';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
        <button
          type="button"
          onClick={() => filePickerRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          style={{
            flex: 1,
            height: '132px',
            background: tileBg,
            border: isDragging ? '0.5px dashed #206E55' : `0.5px dashed ${tileBorderColor}`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease-in-out, background 0.15s ease-in-out',
          }}
        >
          <Paperclip size={32} color="#A8A39A" weight="regular" />
          <span
            style={{
              color: '#A8A39A',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: '24px',
              textAlign: 'center',
            }}
          >
            {pickerLabel}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isVideo) setShowRecorder(true);
            else if (fileKind === 'image') setShowCamera(true);
            else cameraRef.current?.click();
          }}
          style={{
            flex: 1,
            height: '132px',
            background: tileBg,
            border: `0.5px dashed ${tileBorderColor}`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease-in-out, background 0.15s ease-in-out',
          }}
        >
          {isVideo
            ? <VideoCamera size={32} color="#A8A39A" weight="regular" />
            : <Camera size={32} color="#A8A39A" weight="regular" />}
          <span
            style={{
              color: '#A8A39A',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: '24px',
              textAlign: 'center',
            }}
          >
            {captureLabel}
          </span>
        </button>
      </div>

      <input
        ref={filePickerRef}
        type="file"
        multiple={!isVideo}
        {...(pickerAccept ? { accept: pickerAccept } : {})}
        style={{ display: 'none' }}
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={captureAccept}
        capture={captureFacing}
        style={{ display: 'none' }}
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {showRecorder && (
        <VideoRecorderUI
          onCapture={(file) => {
            addFile(file);
            setShowRecorder(false);
          }}
          onClose={() => setShowRecorder(false)}
        />
      )}

      {showCamera && (
        <PhotoCaptureUI
          onCapture={(file) => {
            addFile(file);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {hasFiles && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px' }}>
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: '#F3F1EB',
                border: '0.5px solid #E5E2DA',
                borderRadius: '38px',
                maxWidth: '100%',
              }}
            >
              <span
                style={{
                  color: '#7A7468',
                  fontSize: '13px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px',
                }}
              >
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${file.name}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  border: 'none',
                  background: 'transparent',
                  color: '#7A7468',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <X size={12} weight="bold" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NoneOrContinueButton({
  hasContent,
  busy,
  noneLabel,
  onClick,
}: {
  hasContent: boolean;
  busy: boolean;
  noneLabel: string;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const showNone = !hasContent;
  const hoverNone = showNone && hover && !busy;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={busy}
      style={{
        width: '100%',
        height: '56px',
        borderRadius: '999px',
        background: hasContent
          ? busy
            ? '#E5E2DA'
            : '#206E55'
          : hoverNone
            ? '#141515'
            : '#FAF9F5',
        color: hasContent
          ? busy
            ? '#7A7468'
            : '#FFF'
          : hoverNone
            ? '#FFF'
            : '#141515',
        border: hasContent ? 'none' : '0.5px solid #141515',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.2s ease-in-out',
        cursor: busy ? 'not-allowed' : 'pointer',
        outline: 'none',
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '20px',
      }}
    >
      {busy ? 'Saving…' : hasContent ? 'Continue' : noneLabel}
    </button>
  );
}

const INTAKE_ANSWER_MAX_LENGTH = 1000;

function TextAreaInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, INTAKE_ANSWER_MAX_LENGTH))}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      rows={4}
      maxLength={INTAKE_ANSWER_MAX_LENGTH}
      style={{
        width: '100%',
        borderRadius: '10px',
        border: focused ? '1px solid #141515' : '0.5px solid #D1CDC2',
        background: '#FFF',
        padding: '12px 20px',
        outline: 'none',
        resize: 'none',
        transition: 'border 0.2s ease-in-out',
        fontSize: '16px',
      }}
      className="text-text-primary t-paragraph-md"
      placeholder="Type your answer…"
    />
  );
}

function NoteTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        width: '100%',
        background: '#F3F1EB',
        border: focused ? '1px solid #141515' : '0.5px solid #D1CDC2',
        borderRadius: '16px',
        padding: '16px 20px',
        transition: 'border 0.2s ease-in-out',
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, INTAKE_ANSWER_MAX_LENGTH))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Add a note (optional)"
        rows={3}
        maxLength={INTAKE_ANSWER_MAX_LENGTH}
        style={{
          width: '100%',
          minHeight: '92px',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: '18px',
          fontWeight: 400,
          lineHeight: '28px',
          color: '#141515',
        }}
      />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
}: {
  value: DraftValue;
  onChange: (v: DraftValue) => void;
}) {
  const raw = value.kind === 'number' ? value.raw : '';
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="number"
      inputMode="decimal"
      value={raw}
      onChange={(e) => onChange({ kind: 'number', raw: e.target.value })}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder="Enter a number"
      style={{
        width: '100%',
        height: '56px',
        borderRadius: '12px',
        border: focused ? '1px solid #141515' : '0.5px solid #D1CDC2',
        background: '#FFFFFF',
        padding: '0 16px',
        outline: 'none',
        color: '#141515',
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: '24px',
        transition: 'border-color 0.15s ease-in-out',
      }}
    />
  );
}
