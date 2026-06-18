'use client';

import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import '../../../consult/consult-theme.css';
import { AppShell } from '@/components/layout/app-shell';
import { Navbar } from '@/components/layout/navbar';
import {
  getEncounter,
  getPatient,
  type EncounterDetail,
  type PatientRecord,
} from '@/services/consultations-service';
import { useCachedResource } from '@/hooks/use-cached-resource';
import { BeautifulLoader, SuccessPopup } from '../../../consult/_components';
import { ConsultChatPane } from './consult-chat-pane';
import { PreDoctorPopup } from './pre-doctor-popup';
import { ReadyForVisitModal } from '../../../consult/steps/ready-for-visit-modal';
import { useAccountSheetStore } from '@/stores/account-sheet-store';
import { useAuthStore } from '@/stores/auth-store';

interface Props {
  encounterId: string;
}

type PatientWithZip = PatientRecord & { zip_code?: string | null };

// Decides which post-payment step to render based on the encounter's
// current status + the patient's flags. The pre-payment URL hands off
// to this page after Stripe success.
//
// State is cached in sessionStorage (keyed by encounterId / patientId) via
// useCachedResource — every mount renders instantly from cache while a
// background fetch revalidates. If the backend hiccups, the user keeps
// progressing from their last-known state instead of staring at a spinner.
export function PostPaymentFlow({ encounterId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [popupDismissed, setPopupDismissed] = useState(false);
  const isAccountSheetOpen = useAccountSheetStore((s) => s.isOpen);

  const [justPaidVisible, setJustPaidVisible] = useState(
    () => searchParams?.get('just_paid') === '1',
  );
  // Shown briefly when arriving from a completed intake (?intake_done=1) — the
  // "you're ready" card auto-dismisses after 3s, then the post-payment steps
  // (location / pharmacy / DL / video) take over.
  const [readyVisible, setReadyVisible] = useState(
    () => searchParams?.get('intake_done') === '1',
  );
  useEffect(() => {
    if (!readyVisible) return;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('intake_done');
      const next = url.pathname + (url.search ? url.search : '') + url.hash;
      window.history.replaceState(window.history.state, '', next);
    }
    const t = setTimeout(() => setReadyVisible(false), 3000);
    return () => clearTimeout(t);
  }, [readyVisible]);
  const userEmail = useAuthStore(
    (s) => (s.user as { email?: string } | null)?.email,
  );
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleJustPaidDone = () => {
    setJustPaidVisible(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('just_paid');
      const next = url.pathname + (url.search ? url.search : '') + url.hash;
      window.history.replaceState(window.history.state, '', next);
    }
  };

  const encResource = useCachedResource<EncounterDetail>(
    isAuthenticated ? `enc:${encounterId}` : null,
    () => getEncounter(encounterId),
  );
  const encounter = encResource.value;

  // Disqualified encounters never went through payment — route the user
  // back to /chat so the DisqualifiedOverlay handles them instead of
  // dropping them into the pharmacy / chat pane.
  useEffect(() => {
    if (encounter?.status === 'disqualified') {
      router.replace(`/chat?disqualified=${encounterId}`);
    }
  }, [encounter?.status, encounterId, router]);

  const encErrorStatus = (encResource.error as AxiosError | null)?.response?.status;
  const encNotAccessible = encErrorStatus === 404 || encErrorStatus === 403;
  useEffect(() => {
    if (encNotAccessible && !encounter) {
      router.replace('/chat');
    }
  }, [encNotAccessible, encounter, router]);

  const patResource = useCachedResource<PatientWithZip | null>(
    isAuthenticated && encounter?.patient_id ? `pat:${encounter.patient_id}` : null,
    () => getPatient(encounter!.patient_id as string),
  );
  const patient = patResource.value;

  // Guard against the cross-tab race: `encounter` and `patient` resolve via
  // independent fetches. On a fresh tab (no sessionStorage cache), encounter
  // arrives first while patient is still null — without `!!patient` the
  // optional-chains return undefined and the gate flips true for one render,
  // which the popupSticky latch then locks in until refresh.
  const needsLocation = !!encounter && !!patient && !encounter.consult_state;
  const needsPreDoctor =
    !!encounter && !!patient && (
      !patient.driver_license_id ||
      !patient.has_preferred_pharmacy ||
      (!!patient.is_av_consultation_flow && !patient.intro_video_id)
    );
  const needsAnyStep = needsLocation || needsPreDoctor;

  // Once the popup has been shown in this session, keep it open until the
  // user explicitly hits "Continue to consultation". After a successful
  // upload `onPatientUpdated()` refreshes the cached patient and
  // `needsPreDoctor` flips to false — without this stickiness the popup
  // would auto-dismiss before the user had a chance to confirm.
  //
  // NOTE: this hook + effect must run on every render (before any early
  // return) to keep the hook order stable across loading → loaded
  // transitions. Otherwise React throws "Rendered more hooks than during
  // the previous render."
  const [popupSticky, setPopupSticky] = useState(false);
  useEffect(() => {
    if (needsAnyStep) setPopupSticky(true);
  }, [needsAnyStep]);

  const justPaidOverlay = justPaidVisible ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(28, 25, 23, 0.15)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <SuccessPopup
        title="Payment confirmed"
        description={
          <>
            We&apos;ll connect you with a U.S. licensed doctor,
            usually within a few minutes. We&apos;ll send an email to
            {userEmail && <span className="mx-1">{userEmail}</span>}
            the moment they&apos;re ready.
          </>
        }
        buttonText="Done"
        onButtonClick={handleJustPaidDone}
      />
    </div>
  ) : null;

  if (encResource.error && !encounter) {
    if (encNotAccessible) {
      return (
        <>
          {justPaidOverlay}
          <BeautifulLoader label="Loading…" fullScreen />
        </>
      );
    }
    return (
      <>
        {justPaidOverlay}
        <div className="flex min-h-screen items-center justify-center px-6 text-sm text-text-secondary">
          {encResource.error.message || 'Failed to load consult'}
        </div>
      </>
    );
  }

  if (!encounter || encounter.status === 'disqualified') {
    return (
      <>
        {justPaidOverlay}
        <BeautifulLoader label="Loading…" fullScreen />
      </>
    );
  }

  const showPopup =
    popupSticky &&
    !popupDismissed &&
    !isAccountSheetOpen &&
    !justPaidVisible &&
    // Hold the pre-doctor popup back while the "you're ready" card is up.
    !readyVisible;

  return (
    <AppShell
      background="#FAF9F5"
      webviewExitSource="consults"
      renderNavbar={({ openSidebar }) => (
        <div className="lg:hidden">
          <Navbar onMenuClick={openSidebar} />
        </div>
      )}
    >
      <div style={{ position: 'relative', height: '100%' }}>
        <ConsultChatPane encounterId={encounterId} initialEncounter={encounter} />
        {showPopup && (
          <PreDoctorPopup
            // Only require the intro video for patients flagged for the
            // AV (audio-video) flow. Gatekeeper's /upload-intro-video
            // rejects non-AV patients with `av_flow_not_required`.
            requireVideo={!!patient?.is_av_consultation_flow && !patient?.intro_video_id}
            patientId={encounter.patient_id as string | null}
            patientZip={patient?.zip_code ?? null}
            patientState={patient?.state_name ?? null}
            initialConsultLocation={encounter.consult_state ?? null}
            encounterId={encounter.id}
            initialPharmacyName={patient?.preferred_pharmacy_name ?? null}
            onPatientUpdated={() => {
              // Each step (DL upload, pharmacy save, video upload) calls
              // this so the cached patient picks up the new server state
              // and the popup's showPopup gate evaluates against fresh data.
              patResource.refresh();
              encResource.refresh();
            }}
            onContinueToConsultation={() => {
              setPopupDismissed(true);
              patResource.refresh();
              encResource.refresh();
            }}
          />
        )}
        {readyVisible && <ReadyForVisitModal />}
        {justPaidOverlay}
      </div>
    </AppShell>
  );
}
