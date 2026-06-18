'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { ConsultationPayload, TextSize } from '@/types';
import { DoctorConsultCard } from './doctor-consult-card';
import {
  getDifferentialDiagnosis,
  getEncounter,
} from '@/services/consultations-service';
import { track as trackMeta } from '@/app/utils/analytics';
import { useChatInputFocusStore } from '@/stores/chat-input-focus-store';
import { InPersonCareModal } from '@/app/(webapp)/consult/steps/in-person-modal';

const PENDING_STATUSES = ['pending_payment', 'verified'];

interface EncounterStatusState {
  encounterId?: string;
  status: string | null;
  expiresAt: string | null;
  loading: boolean;
}

const encounterStatusCache = new Map<
  string,
  Pick<EncounterStatusState, 'status' | 'expiresAt'>
>();

function getInitialEncounterStatusState(encounterId?: string): EncounterStatusState {
  if (!encounterId) {
    return {
      encounterId,
      status: null,
      expiresAt: null,
      loading: false,
    };
  }

  const cached = encounterStatusCache.get(encounterId);
  return {
    encounterId,
    status: cached?.status ?? null,
    expiresAt: cached?.expiresAt ?? null,
    loading: !cached,
  };
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

export function DoctorConsultCTA({ consultation, textSize }: { consultation?: ConsultationPayload, textSize: TextSize }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDisqualified, setShowDisqualified] = useState(false);

  const encounterId = consultation?.consultPayment?.encounterId;
  const [encounterState, setEncounterState] = useState<EncounterStatusState>(() =>
    getInitialEncounterStatusState(encounterId),
  );
  const currentEncounterState =
    encounterState.encounterId === encounterId
      ? encounterState
      : getInitialEncounterStatusState(encounterId);

  useEffect(() => {
    if (!encounterId) {
      setEncounterState(getInitialEncounterStatusState(undefined));
      return;
    }
    let cancelled = false;
    setEncounterState(getInitialEncounterStatusState(encounterId));
    getEncounter(encounterId)
      .then((enc) => {
        if (cancelled) return;
        const nextState = {
          encounterId,
          status: enc?.status ?? null,
          expiresAt: enc?.expires_at ?? null,
          loading: false,
        };
        encounterStatusCache.set(encounterId, {
          status: nextState.status,
          expiresAt: nextState.expiresAt,
        });
        setEncounterState(nextState);
      })
      .catch(() => {
        if (cancelled) return;
        const cached = encounterStatusCache.get(encounterId);
        setEncounterState({
          encounterId,
          status: cached?.status ?? null,
          expiresAt: cached?.expiresAt ?? null,
          loading: false,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [encounterId]);

  const ddId = consultation?.differentialDiagnosisId;
  const visitReason = consultation?.visitReason || consultation?.summary;

  const handleConfirm = async () => {
    if (!ddId || loading) return;
     const status = currentEncounterState.status;
    const expiresAt = currentEncounterState.expiresAt;
    const expired = !!expiresAt && new Date(expiresAt).getTime() < Date.now();
    const isPending = !!status && PENDING_STATUSES.includes(status);

    if (encounterId && expired && (isPending || !status)) {
      useChatInputFocusStore.getState().requestFocus();
      return;
    }

    if (status === 'disqualified') {
      setShowDisqualified(true);
      return;
    }

    trackMeta('telehealth_doctor_connect');
    setLoading(true);
    try {
      const dd = await getDifferentialDiagnosis(ddId);
      if (dd?.encounter_id) {
        if ((dd.pending_questions?.length ?? 0) > 0) {
          router.push(`/consults/d/${ddId}?skip_pending_popup=1`);
          return;
        }
        let bucket: 'ready' | 'in-progress' | 'complete' = 'in-progress';
        let disqualified = false;
        try {
          const enc = await getEncounter(dd.encounter_id);
          if (enc?.status === 'disqualified') disqualified = true;
          else if (enc?.status === 'completed') bucket = 'complete';
          else if (enc?.status === 'assigned') bucket = 'ready';
        } catch {
          // Fall back to the in-progress label.
        }
        if (disqualified) {
          router.replace(`/chat?disqualified=${dd.encounter_id}`);
          return;
        }
        router.replace(
          `/chat?consult_in_progress=${dd.encounter_id}&visit_state=${bucket}`,
        );
        return;
      }
      const hasProgress = !!dd?.patient_id || hasIntakeFormProgress(ddId);
      if (hasProgress) {
        router.replace(`/chat?pending_intake=${ddId}`);
        return;
      }
      router.push(`/consults/d/${ddId}?skip_pending_popup=1`);
    } catch {
      // If the DD lookup fails, fall through to the original route and let
      // pre-payment-flow surface the error.
      router.push(`/consults/d/${ddId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 mb-4">
      <DoctorConsultCard
        visitReason={visitReason}
        onConfirm={handleConfirm}
        loading={loading}
        summary={consultation?.summary}
        soapNote={consultation?.soapNote}
        consultPayment={consultation?.consultPayment}
        encounterStatus={currentEncounterState.status}
        encounterExpiresAt={currentEncounterState.expiresAt}
        encounterLoading={currentEncounterState.loading}
        textSize={textSize}
      />
      {showDisqualified && typeof document !== 'undefined' &&
        createPortal(
          <InPersonCareModal
            onAcknowledge={() => setShowDisqualified(false)}
            onDismiss={() => setShowDisqualified(false)}
          />,
          document.body,
        )}
    </div>
  );
}
