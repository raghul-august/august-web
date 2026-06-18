'use client';

import { useState } from 'react';
import { Stethoscope, Plus, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { type PatientRecord } from '@/services/consultations-service';
import { CONSULT_PRICE_LABEL } from '@/lib/config';
import { trackTelehealth } from '@/services/telehealth-analytics';

interface Props {
  patients: PatientRecord[];
  onUseExisting: (
    patient_id: string,
    hasDriverLicense: boolean,
    isAvFlow: boolean,
    hasIntroVideo: boolean,
  ) => void;
  onCreateNew: () => void;
}

function formatDOB(dob: string | null): string {
  if (!dob) return '';
  try {
    return new Date(dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dob;
  }
}

export function ChoosePatientStep({ patients, onUseExisting, onCreateNew }: Props) {
  const [picked, setPicked] = useState<string | null>(patients[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleContinue() {
    if (!picked) return;
    setError(null);
    const pickedRow = patients.find((p) => p.id === picked) as
      | (PatientRecord & {
          is_av_consultation_flow?: boolean | null;
          intro_video_id?: string | null;
        })
      | undefined;
    const hasDriverLicense = !!pickedRow?.driver_license_id;
    const isAvFlow = !!pickedRow?.is_av_consultation_flow;
    const hasIntroVideo = !!pickedRow?.intro_video_id;
    trackTelehealth('telehealth_patient_selected', { patient_count: patients.length });
    onUseExisting(picked, hasDriverLicense, isAvFlow, hasIntroVideo);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-5 md:px-6 pt-0 pb-10">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 h-9 px-5 rounded-full bg-brand-subtle text-text-brand t-label-sm">
          <Stethoscope size={14} weight="regular" />
          Online Doctor Consult · {CONSULT_PRICE_LABEL}
        </span>
      </div>

      <h1
        className="text-text-primary font-normal text-center mt-6"
        style={{ fontSize: 'clamp(28px, 3vw, 34px)', lineHeight: 1.08, letterSpacing: '-0.5px' }}
      >
        Who is this consult for?
      </h1>
      <p className="t-paragraph-md text-text-secondary text-center mt-1 mx-auto max-w-md">
        Use a profile you've already created, or add someone new.
      </p>

      <div className="mt-10 space-y-3">
        {patients.map((p) => {
          const isPicked = picked === p.id;
          const fullName = `${p.legal_first_name || ''} ${p.legal_last_name || ''}`.trim() || 'Patient';
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPicked(p.id)}
              className={cn(
                'flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition',
                'bg-surface-elevated ring-1 ring-inset',
                isPicked
                  ? 'ring-brand-primary'
                  : 'ring-border-subtle hover:ring-border-default'
              )}
            >
              <PatientInitial firstName={p.legal_first_name} lastName={p.legal_last_name} />
              <div className="min-w-0 flex-1">
                <p className="t-label-md text-text-primary truncate">{fullName}</p>
                <p className="mt-0.5 t-paragraph-sm text-text-tertiary truncate">
                  {[p.email, formatDOB(p.date_of_birth)].filter(Boolean).join(' · ') || 'Saved patient'}
                </p>
              </div>
              <span
                aria-hidden
                className={cn(
                  'flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-inset transition-colors',
                  isPicked
                    ? 'bg-brand-primary ring-brand-primary text-text-inverse'
                    : 'bg-surface-elevated ring-border-strong'
                )}
              >
                {isPicked && <Check size={14} weight="bold" />}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onCreateNew}
          className={cn(
            'flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition',
            'bg-surface-subtle ring-1 ring-inset ring-border-subtle hover:ring-border-default'
          )}
        >
          <span className="flex-shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle ring-1 ring-inset ring-border-subtle text-text-tertiary">
            <Plus size={18} weight="regular" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="t-label-md text-text-primary">Add new patient</p>
            <p className="mt-0.5 t-paragraph-sm text-text-tertiary">
              For a different person — fill out a fresh intake form.
            </p>
          </div>
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!picked}
        className="mt-8 w-full h-[52px] rounded-full bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-primary transition-colors text-text-inverse t-label-lg inline-flex items-center justify-center"
      >
        Continue
      </button>
    </div>
  );
}

function PatientInitial({ firstName, lastName }: { firstName: string | null; lastName: string | null }) {
  const initials = `${(firstName || '?')[0]}${(lastName || '')[0] || ''}`.toUpperCase();
  return (
    <span className="flex-shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-text-brand t-label-md">
      {initials}
    </span>
  );
}
