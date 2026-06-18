'use client';

import { useEffect, useRef, useState } from 'react';
import {
  listPharmacies,
  setPreferredPharmacy,
  setConsultLocation,
  uploadDriverLicense,
  uploadIntroVideo,
  type MDIPharmacy,
} from '@/services/consultations-service';
import { trackTelehealth } from '@/services/telehealth-analytics';
import { VideoCameraIcon, TrashIcon } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { US_STATES, resolveStateCode } from '../../../consult/_components';

const normalizeStateCode = (s?: string | null): string =>
  s ? (resolveStateCode(s) ?? s.trim().toUpperCase()) : '';
const stateDisplayName = (s?: string | null): string => {
  const code = normalizeStateCode(s);
  return US_STATES.find((st) => st.code === code)?.name ?? (s ?? '');
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};
const dialogTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

const PharmacyIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="44" height="44" rx="6" fill="#F3F1EB" />
    <path d="M31.75 19C31.7504 18.9303 31.7409 18.8608 31.7219 18.7938L30.3766 14.0875C30.2861 13.7752 30.0971 13.5006 29.8378 13.3046C29.5784 13.1086 29.2626 13.0017 28.9375 13H15.0625C14.7374 13.0017 14.4216 13.1086 14.1622 13.3046C13.9029 13.5006 13.7139 13.7752 13.6234 14.0875L12.2791 18.7938C12.2597 18.8608 12.2499 18.9302 12.25 19V20.5C12.25 21.0822 12.3855 21.6563 12.6459 22.1771C12.9063 22.6978 13.2843 23.1507 13.75 23.5V30.25C13.75 30.4489 13.829 30.6397 13.9697 30.7803C14.1103 30.921 14.3011 31 14.5 31H29.5C29.6989 31 29.8897 30.921 30.0303 30.7803C30.171 30.6397 30.25 30.4489 30.25 30.25V23.5C30.7157 23.1507 31.0937 22.6978 31.3541 22.1771C31.6145 21.6563 31.75 21.0822 31.75 20.5V19ZM15.0625 14.5H28.9375L30.0081 18.25H13.9947L15.0625 14.5ZM19.75 19.75H24.25V20.5C24.25 21.0967 24.0129 21.669 23.591 22.091C23.169 22.5129 22.5967 22.75 22 22.75C21.4033 22.75 20.831 22.5129 20.409 22.091C19.9871 21.669 19.75 21.0967 19.75 20.5V19.75ZM18.25 19.75V20.5C18.2499 20.8869 18.15 21.2673 17.9599 21.6043C17.7699 21.9413 17.4962 22.2236 17.1652 22.424C16.8342 22.6244 16.4571 22.736 16.0704 22.7481C15.6837 22.7602 15.3004 22.6724 14.9575 22.4931C14.9053 22.4525 14.8479 22.4191 14.7869 22.3937C14.4691 22.1903 14.2076 21.9103 14.0265 21.5794C13.8453 21.2484 13.7502 20.8773 13.75 20.5V19.75H18.25ZM28.75 29.5H15.25V24.175C15.4969 24.2248 15.7481 24.2499 16 24.25C16.5822 24.25 17.1563 24.1145 17.6771 23.8541C18.1978 23.5937 18.6507 23.2157 19 22.75C19.3493 23.2157 19.8022 23.5937 20.323 23.8541C20.8437 24.1145 21.4178 24.25 22 24.25C22.5822 24.25 23.1563 24.1145 23.6771 23.8541C24.1978 23.5937 24.6507 23.2157 25 22.75C25.3493 23.2157 25.8022 23.5937 26.3229 23.8541C26.8437 24.1145 27.4178 24.25 28 24.25C28.2519 24.2499 28.5031 24.2248 28.75 24.175V29.5ZM29.2122 22.3937C29.1519 22.4191 29.0952 22.4522 29.0434 22.4922C28.7006 22.6716 28.3173 22.7596 27.9305 22.7477C27.5437 22.7357 27.1666 22.6242 26.8355 22.424C26.5044 22.2237 26.2305 21.9414 26.0404 21.6044C25.8502 21.2673 25.7502 20.887 25.75 20.5V19.75H30.25V20.5C30.2497 20.8774 30.1545 21.2486 29.9731 21.5795C29.7918 21.9104 29.5301 22.1904 29.2122 22.3937Z" fill="#5A554A" />
  </svg>
);

const DLIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="44" height="44" rx="6" fill="#F3F1EB" />
    <path d="M28.75 20.5C28.75 20.6989 28.671 20.8897 28.5303 21.0303C28.3897 21.171 28.1989 21.25 28 21.25H24.25C24.0511 21.25 23.8603 21.171 23.7197 21.0303C23.579 20.8897 23.5 20.6989 23.5 20.5C23.5 20.3011 23.579 20.1103 23.7197 19.9697C23.8603 19.829 24.0511 19.75 24.25 19.75H28C28.1989 19.75 28.3897 19.829 28.5303 19.9697C28.671 20.1103 28.75 20.3011 28.75 20.5ZM28 22.75H24.25C24.0511 22.75 23.8603 22.829 23.7197 22.9697C23.579 23.1103 23.5 23.3011 23.5 23.5C23.5 23.6989 23.579 23.8897 23.7197 24.0303C23.8603 24.171 24.0511 24.25 24.25 24.25H28C28.1989 24.25 28.3897 24.171 28.5303 24.0303C28.671 23.8897 28.75 23.6989 28.75 23.5C28.75 23.3011 28.671 23.1103 28.5303 22.9697C28.3897 22.829 28.1989 22.75 28 22.75ZM31.75 15.25V28.75C31.75 29.1478 31.592 29.5294 31.3107 29.8107C31.0294 30.092 30.6478 30.25 30.25 30.25H13.75C13.3522 30.25 12.9706 30.092 12.6893 29.8107C12.408 29.5294 12.25 29.1478 12.25 28.75V15.25C12.25 14.8522 12.408 14.4706 12.6893 14.1893C12.9706 13.908 13.3522 13.75 13.75 13.75H30.25C30.6478 13.75 31.0294 13.908 31.3107 14.1893C31.592 14.4706 31.75 14.8522 31.75 15.25ZM30.25 28.75V15.25H13.75V28.75H30.25ZM22.7256 25.5625C22.7754 25.7552 22.7465 25.9598 22.6454 26.1312C22.5443 26.3026 22.3793 26.4268 22.1866 26.4766C21.9939 26.5263 21.7893 26.4974 21.6179 26.3963C21.4465 26.2952 21.3222 26.1302 21.2725 25.9375C21.0259 24.9756 20.0481 24.25 18.9991 24.25C17.95 24.25 16.9731 24.9756 16.7256 25.9375C16.6759 26.1302 16.5517 26.2952 16.3802 26.3963C16.2088 26.4974 16.0043 26.5263 15.8116 26.4766C15.6189 26.4268 15.4538 26.3026 15.3527 26.1312C15.2516 25.9598 15.2228 25.7552 15.2725 25.5625C15.5159 24.6566 16.0912 23.8755 16.8841 23.3744C16.4627 22.9555 16.1752 22.421 16.058 21.8386C15.9408 21.2562 15.9992 20.652 16.2257 20.1028C16.4523 19.5536 16.8368 19.084 17.3305 18.7536C17.8242 18.4232 18.405 18.2468 18.9991 18.2468C19.5932 18.2468 20.1739 18.4232 20.6676 18.7536C21.1614 19.084 21.5459 19.5536 21.7724 20.1028C21.9989 20.652 22.0573 21.2562 21.9401 21.8386C21.8229 22.421 21.5354 22.9555 21.1141 23.3744C21.9078 23.8748 22.4836 24.6562 22.7266 25.5625H22.7256ZM19 22.75C19.2967 22.75 19.5867 22.662 19.8334 22.4972C20.08 22.3324 20.2723 22.0981 20.3858 21.824C20.4994 21.5499 20.5291 21.2483 20.4712 20.9574C20.4133 20.6664 20.2704 20.3991 20.0607 20.1893C19.8509 19.9796 19.5836 19.8367 19.2926 19.7788C19.0017 19.7209 18.7001 19.7506 18.426 19.8642C18.1519 19.9777 17.9176 20.17 17.7528 20.4166C17.588 20.6633 17.5 20.9533 17.5 21.25C17.5 21.6478 17.658 22.0294 17.9393 22.3107C18.2206 22.592 18.6022 22.75 19 22.75Z" fill="#5A554A" />
  </svg>
);

interface RowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onClick?: () => void;
}

function Row({ icon, title, subtitle, buttonLabel, onClick }: RowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontWeight: 500,
            fontSize: 15,
            lineHeight: '24px',
            color: 'var(--color-text-primary, #141515)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontWeight: 400,
            fontSize: 13,
            lineHeight: '20px',
            color: 'var(--color-text-secondary, #5A554A)',
          }}
        >
          {subtitle}
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        style={{
          flexShrink: 0,
          minWidth: 83,
          height: 38,
          borderRadius: 100,
          paddingTop: 10,
          paddingRight: 20,
          paddingBottom: 10,
          paddingLeft: 20,
          background: 'var(--color-surface-elevated, #FFFFFF)',
          color: 'var(--color-brand-primary, #206E55)',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '18px',
          border: '0.5px solid var(--color-brand-primary, #206E55)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

interface PreDoctorPopupProps {
  requireVideo?: boolean;
  patientId?: string | null;
  patientZip?: string | null;
  patientState?: string | null;
  initialConsultLocation?: string | null;
  encounterId?: string | null;
  initialPharmacyName?: string | null;
  onContinueToConsultation?: () => void;
  // Called whenever a step that mutates the patient/encounter on the server
  // succeeds (DL upload, intro video, location, pharmacy). Lets the parent
  // refetch so the showPopup gate evaluates against fresh data.
  onPatientUpdated?: () => void;
}

export function PreDoctorPopup({
  requireVideo = false,
  patientId = null,
  patientZip = null,
  patientState = null,
  initialConsultLocation = null,
  encounterId = null,
  initialPharmacyName = null,
  onContinueToConsultation,
  onPatientUpdated,
}: PreDoctorPopupProps) {
  // Ask for the consult location first when it hasn't been confirmed yet.
  const [mode, setMode] = useState<'idle' | 'location' | 'upload-dl' | 'webcam' | 'video-camera' | 'pharmacy'>(
    () => (initialConsultLocation ? 'idle' : 'location'),
  );
  // The state the patient picks in the modal (2-letter code). Seeded from the
  // already-confirmed value if present.
  const [consultLocationState, setConsultLocationState] = useState<string>(
    () => normalizeStateCode(initialConsultLocation),
  );
  const [stateQuery, setStateQuery] = useState<string>('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSaving, setLocationSaving] = useState(false);
  const patientStateCode = normalizeStateCode(patientState);
  // Pharmacy must be in the confirmed consult-location state (falls back to the
  // patient's registered state if not yet picked).
  const requiredPharmacyState = consultLocationState || normalizeStateCode(initialConsultLocation) || patientStateCode;
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dlState, setDlState] = useState<'idle' | 'processing' | 'uploaded'>('idle');
  const [error, setError] = useState<string | null>(null);

  const [zip, setZip] = useState<string>(() => (patientZip || '').trim());
  const [pharmacies, setPharmacies] = useState<MDIPharmacy[] | null>(null);
  const [pharmacyLoading, setPharmacyLoading] = useState(false);
  const [pharmacyError, setPharmacyError] = useState<string | null>(null);
  const [pickedPharmacy, setPickedPharmacy] = useState<string | number | null>(null);
  const [pharmacySearch, setPharmacySearch] = useState<string>('');
  const [pharmacySaving, setPharmacySaving] = useState(false);
  const [pharmacySaveError, setPharmacySaveError] = useState<string | null>(null);
  const [savedPharmacyName, setSavedPharmacyName] = useState<string | null>(initialPharmacyName);
  const fallbackPatientZip = (patientZip || '').trim();
  const pendingDlMethodRef = useRef<'upload' | 'capture' | null>(null);
  const pendingVideoMethodRef = useRef<'upload' | 'record' | null>(null);
  const lastPharmacySearchRef = useRef<{ zip: string; name: string } | null>(null);

  useEffect(() => {
    trackTelehealth('intake_completion_modal_shown', { type: 'choose_pharmacy' });
    trackTelehealth('intake_completion_modal_shown', { type: 'id_verification' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [videoState, setVideoState] = useState<'idle' | 'processing' | 'uploaded'>('idle');
  const [videoError, setVideoError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Just stores the selected video locally; the actual upload runs when
  // the user taps "Submit verification".
  const beginVideoProcessing = (url: string, name: string, file?: File | Blob) => {
    setVideoUrl(url);
    setVideoFileName(name);
    setVideoError(null);
    if (file) {
      pendingVideoFileRef.current =
        file instanceof File ? file : new File([file], name, { type: (file as Blob).type || 'video/webm' });
    }
    setVideoState('uploaded');
  };

  const onVideoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const allowedMime = ['video/mp4', 'video/quicktime', 'video/webm'];
    const extOk = /\.(mp4|mov|webm)$/i.test(f.name);
    const mimeOk = allowedMime.includes(f.type.toLowerCase());
    if (!extOk && !mimeOk) {
      setVideoError('Please upload a video file (MP4, MOV, or WebM).');
      return;
    }
    setVideoError(null);
    pendingVideoMethodRef.current = 'upload';
    beginVideoProcessing(URL.createObjectURL(f), f.name, f);
  };

  const reuploadVideo = () => {
    setVideoUrl(null);
    setVideoFileName(null);
    setVideoState('idle');
    pendingVideoFileRef.current = null;
    if (videoFileInputRef.current) videoFileInputRef.current.value = '';
  };

  const [verifying, setVerifying] = useState(false);
  const [dlVerified, setDlVerified] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  // Which file the user is in the middle of removing — drives the
  // confirmation popup. Null when no popup is open.
  const [removeTarget, setRemoveTarget] = useState<'dl' | 'video' | null>(null);
  const [webcamState, setWebcamState] = useState<'init' | 'ready' | 'denied' | 'review'>('init');
  const [pendingCapturedUrl, setPendingCapturedUrl] = useState<string | null>(null);
  const pendingCapturedBlobRef = useRef<Blob | null>(null);

  const [videoCamState, setVideoCamState] = useState<'init' | 'ready' | 'recording' | 'review' | 'denied'>('init');
  const [pendingVideoUrl, setPendingVideoUrl] = useState<string | null>(null);
  const pendingVideoBlobRef = useRef<Blob | null>(null);
  // Holds the DL / video the user picked or captured, ready to be uploaded
  // when they tap Submit verification. We don't upload at pick time so the
  // user can re-take/re-pick freely without firing N requests.
  const pendingDlFileRef = useRef<File | null>(null);
  const pendingVideoFileRef = useRef<File | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const zipInvalid = zip.length > 0 && zip.length !== 5;
  const videoRequirementMet = !requireVideo || videoState === 'uploaded';
  const submitEnabled = dlState === 'uploaded' && videoRequirementMet && !verifying;

  const onSubmitVerification = async () => {
    if (!submitEnabled) return;
    if (!encounterId) {
      setError('Missing encounter — please reload and try again.');
      return;
    }
    setVerifying(true);
    setError(null);
    setVideoError(null);
    try {
      // Upload DL first; only attempt the video if DL succeeded.
      if (pendingDlFileRef.current) {
        await uploadDriverLicense({ encounter_id: encounterId, file: pendingDlFileRef.current });
        trackTelehealth('drivers_license_uploaded', {
          method: pendingDlMethodRef.current ?? 'upload',
        });
        pendingDlFileRef.current = null;
        pendingDlMethodRef.current = null;
      }
      if (requireVideo && pendingVideoFileRef.current) {
        await uploadIntroVideo({ encounter_id: encounterId, file: pendingVideoFileRef.current });
        trackTelehealth('intro_video_uploaded', {
          method: pendingVideoMethodRef.current ?? 'upload',
        });
        pendingVideoFileRef.current = null;
        pendingVideoMethodRef.current = null;
      }
      onPatientUpdated?.();
      setDlVerified(true);
      setMode('idle');
    } catch (err: any) {
      const rawCode: string =
        err?.response?.data?.error || err?.message || '';
      const friendly: Record<string, string> = {
        intro_video_upload_failed: "We couldn't upload your verification video. Please try recording or selecting it again.",
        file_must_be_video: 'That file doesn’t look like a video. Please upload an MP4, MOV, or WebM file.',
        encounter_not_found: 'We couldn’t find your consult session. Refresh the page and try again.',
        patient_not_found: 'We couldn’t find your patient record. Refresh the page and try again.',
        encounter_has_no_patient: 'Your consult is missing a patient on file. Refresh and try again.',
        av_flow_not_required: 'A verification video isn’t required for this consult.',
        mdi_file_id_missing: "We couldn't upload your verification video. Please try again in a moment.",
      };
      const message =
        friendly[rawCode] ||
        err?.response?.data?.message ||
        (rawCode && !rawCode.includes('_') ? rawCode : '') ||
        'Verification failed. Please try again.';
      // Surface on whichever section is most relevant. DL is uploaded first
      // so most errors here will be DL-related; if DL already cleared and we
      // failed on video, route the message to videoError.
      if (pendingDlFileRef.current) setError(message);
      else setVideoError(message);
    } finally {
      setVerifying(false);
    }
  };

  const continueToConsultation = () => {
    onContinueToConsultation?.();
  };

  // Just stores the picked / captured DL locally; the actual upload runs
  // when the user taps "Submit verification".
  const beginProcessing = (url: string, name: string, file?: File | Blob) => {
    setCapturedUrl(url);
    setFileName(name);
    setError(null);
    if (file) {
      pendingDlFileRef.current =
        file instanceof File ? file : new File([file], name, { type: (file as Blob).type || 'image/png' });
    }
    setDlState('uploaded');
  };

  const reupload = () => {
    setCapturedUrl(null);
    setFileName(null);
    setDlState('idle');
    pendingDlFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopWebcam(), []);

  // Fetch pharmacies whenever the effective zip or the search term changes.
  // When the user hasn't typed a zip yet, fall back to the patient's zip so
  // the initial list isn't empty. Debounce search to avoid per-keystroke calls.
  useEffect(() => {
    const effectiveZip = zip || fallbackPatientZip;
    if (!effectiveZip || effectiveZip.length < 5) return;
    // Block partial-name searches: while the user is typing 1-2 chars, keep
    // the previous (zip-based) results instead of firing a request that the
    // backend can't usefully narrow with so few characters.
    const trimmedName = pharmacySearch.trim();
    if (trimmedName.length > 0 && trimmedName.length < 3) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const prev = lastPharmacySearchRef.current;
      if (prev) {
        trackTelehealth('pharmacy_search_changed', {
          zip_changed: prev.zip !== effectiveZip ? 'yes' : 'no',
          name_changed: prev.name !== trimmedName ? 'yes' : 'no',
        });
      }
      lastPharmacySearchRef.current = { zip: effectiveZip, name: trimmedName };
      setPharmacyLoading(true);
      setPharmacyError(null);
      try {
        const list = (
          await listPharmacies({ zip: effectiveZip, name: trimmedName || undefined })
        ).filter((p) => p.pharmacy_id != null);
        if (cancelled) return;
        setPharmacies(list);
        // Clear the selection if the previously-picked pharmacy isn't in the
        // new result set — keeps the Save button accurately disabled.
        setPickedPharmacy((prev) =>
          prev != null && list.some((p) => p.pharmacy_id === prev) ? prev : null,
        );
      } catch (err: any) {
        if (cancelled) return;
        setPharmacies([]);
        setPharmacyError(err?.response?.data?.error || err?.message || 'Could not load pharmacies');
      } finally {
        if (!cancelled) setPharmacyLoading(false);
      }
    }, pharmacySearch ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [zip, fallbackPatientZip, pharmacySearch]);

  const onUploadClick = () => setMode('upload-dl');

  async function savePharmacy() {
    if (!patientId || pickedPharmacy == null) return;
    const pickedForSave = pharmacies?.find((p) => String(p.pharmacy_id) === String(pickedPharmacy));
    if (
      requiredPharmacyState &&
      pickedForSave &&
      normalizeStateCode(pickedForSave.state) !== requiredPharmacyState
    ) {
      setPharmacySaveError(
        `Please select a pharmacy in ${stateDisplayName(requiredPharmacyState)}, your confirmed physical location for today's visit.`,
      );
      return;
    }
    setPharmacySaving(true);
    setPharmacySaveError(null);
    try {
      // Pass encounter_id so the backend creates the MDI case now that
      // pharmacy is set (this is the consult flow, not a Settings edit).
      await setPreferredPharmacy({ patient_id: patientId, pharmacy_id: pickedPharmacy, encounter_id: encounterId ?? undefined });
      trackTelehealth('pharmacy_selected');
      const picked = pharmacies?.find((p) => p.pharmacy_id === pickedPharmacy);
      if (picked?.name) setSavedPharmacyName(picked.name);
      // Pull the patient record fresh — has_preferred_pharmacy is derived
      // server-side from user_preferred_pharmacies, so this flips the gate.
      onPatientUpdated?.();
      setMode('idle');
    } catch (err: any) {
      setPharmacySaveError(
        err?.response?.data?.error || err?.message || 'Could not save pharmacy',
      );
    } finally {
      setPharmacySaving(false);
    }
  }

  // Valid = a state is picked AND it matches the patient's registered state.
  const locationValid =
    !!consultLocationState && !!patientStateCode && consultLocationState === patientStateCode;

  // Validate the moment a state is picked — surface the mismatch error inline.
  function handleLocationChange(code: string) {
    setConsultLocationState(code);
    if (!code) {
      setLocationError(null);
      return;
    }
    if (!patientStateCode) {
      setLocationError('We could not verify the state on your account. Please contact support.');
      return;
    }
    if (code !== patientStateCode) {
      setLocationError(
        `A prescription can only be sent to a pharmacy in ${stateDisplayName(patientStateCode)}, the state on your account.`,
      );
      return;
    }
    setLocationError(null);
  }

  async function confirmConsultLocation() {
    if (!locationValid || !encounterId) return;
    setLocationSaving(true);
    try {
      await setConsultLocation({ encounter_id: encounterId, consult_location: stateDisplayName(consultLocationState) });
      onPatientUpdated?.();
      setMode('idle');
    } catch {
      setLocationError('Could not save your location. Please try again.');
    } finally {
      setLocationSaving(false);
    }
  }

  const pickGallery = () => {
    fileInputRef.current?.click();
  };

  const openWebcam = async () => {
    setMode('webcam');
    setWebcamState('init');
    setPendingCapturedUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setWebcamState('ready');
    } catch {
      stopWebcam();
      setWebcamState('denied');
    }
  };

  const closeWebcam = () => {
    stopWebcam();
    setPendingCapturedUrl(null);
    setMode('idle');
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      pendingCapturedBlobRef.current = blob;
      const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png');
      stopWebcam();
      setPendingCapturedUrl(url);
      setWebcamState('review');
    }, 'image/png');
  };

  const retakePhoto = () => {
    setPendingCapturedUrl(null);
    openWebcam();
  };

  const useCapturedPhoto = () => {
    if (!pendingCapturedUrl) return;
    const url = pendingCapturedUrl;
    const blob = pendingCapturedBlobRef.current;
    pendingCapturedBlobRef.current = null;
    setPendingCapturedUrl(null);
    setMode('upload-dl');
    pendingDlMethodRef.current = 'capture';
    beginProcessing(url, `IMG_${Date.now()}.PNG`, blob ?? undefined);
  };

  const clearRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const openVideoCamera = async () => {
    setMode('video-camera');
    setVideoCamState('init');
    setPendingVideoUrl(null);
    setRecordingSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      setVideoCamState('ready');
    } catch {
      stopWebcam();
      setVideoCamState('denied');
    }
  };

  const closeVideoCamera = () => {
    clearRecordingTimer();
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch { }
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    stopWebcam();
    setPendingVideoUrl(null);
    setRecordingSeconds(0);
    setMode('idle');
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const stream = streamRef.current;
    const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mimeType = candidates.find((t) =>
      typeof MediaRecorder !== 'undefined' && (MediaRecorder as any).isTypeSupported?.(t),
    );
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recordedChunksRef.current = chunks;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || 'video/webm';
      const blob = new Blob(chunks, { type });
      const url = URL.createObjectURL(blob);
      pendingVideoBlobRef.current = blob;
      setPendingVideoUrl(url);
      setVideoCamState('review');
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setVideoCamState('recording');
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
  };

  const stopRecording = () => {
    clearRecordingTimer();
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch { }
  };

  const retakeVideo = () => {
    if (pendingVideoUrl) URL.revokeObjectURL(pendingVideoUrl);
    setPendingVideoUrl(null);
    setRecordingSeconds(0);
    openVideoCamera();
  };

  const useCapturedVideo = () => {
    if (!pendingVideoUrl) return;
    const url = pendingVideoUrl;
    const blob = pendingVideoBlobRef.current;
    const ext = mediaRecorderRef.current?.mimeType?.includes('mp4') ? 'mp4' : 'webm';
    stopWebcam();
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    pendingVideoBlobRef.current = null;
    setPendingVideoUrl(null);
    setRecordingSeconds(0);
    setMode('upload-dl');
    pendingVideoMethodRef.current = 'record';
    beginVideoProcessing(url, `video_${Date.now()}.${ext}`, blob ?? undefined);
  };

  const formatRecordingTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'];
    const nameExt = f.name.toLowerCase();
    const extOk = /\.(jpe?g|png|heic|heif|pdf)$/i.test(nameExt);
    const mimeOk = allowed.includes(f.type.toLowerCase());
    if (!extOk && !mimeOk) {
      setError("Invalid file type. Please upload an image (JPG, PNG, or HEIC) or PDF.");
      return;
    }
    setError(null);
    pendingDlMethodRef.current = 'upload';
    beginProcessing(URL.createObjectURL(f), f.name, f);
  };

  return (
    <div
      className="pdp-overlay-shell"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box',
        fontFamily: '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        .pharmacy-list-scroll::-webkit-scrollbar { display: none; }
        .pharmacy-list-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes pre-doctor-spin { to { transform: rotate(360deg); } }
        /* Mobile-first: every sheet anchors to the bottom of the viewport.
           At >= 500px we revert to a centered modal so desktop users get
           the familiar floating card instead of a wall-to-wall sheet. */
        .pdp-overlay-shell {
          align-items: flex-end;
          padding: 0;
          overflow: hidden;
        }
        .pdp-bottom-sheet {
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.18);
          max-height: 92vh;
        }
        .pdp-bottom-sheet::before {
          content: '';
          display: none;
          width: 40px;
          height: 4px;
          margin: 12px auto 0;
          border-radius: 999px;
          background: #F3F1EB;
          flex: none;
        }
        .pdp-idle-card-padding {
          padding: 24px 24px 40px;
        }
        @media (min-width: 500px) {
          .pdp-overlay-shell {
            align-items: center;
            padding: 16px;
            overflow: auto;
          }
          .pdp-bottom-sheet {
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
            max-height: calc(100vh - 32px);
          }
          .pdp-bottom-sheet::before {
            display: none;
          }
          .pdp-idle-card-padding {
            padding: 40px 32px;
          }
        }
        @media (max-width: 499px) {
          .pdp-bottom-sheet::before {
            display: block;
          }
          .pdp-idle-card-padding {
            padding: 12px 16px 40px;
          }
          .pdp-pharmacy-footer.is-loading {
            display: none !important;
          }
        }
      `}</style>
      <AnimatePresence mode="wait" initial={false}>
        {mode === 'location' && (
          <motion.div
            key="pdp-location"
            className="pdp-bottom-sheet pdp-idle-card-padding"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={dialogTransition}
            style={{
              width: '100%',
              maxWidth: 464,
              overflowY: 'auto',
              background: 'var(--color-surface-elevated, #FFFFFF)',
              boxSizing: 'border-box',
              willChange: 'opacity, transform',
            }}
          >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ color: 'var(--color-text-primary, #141515)', fontWeight: 500, fontSize: 24, lineHeight: '28px', letterSpacing: '-0.4px', marginTop: '5px' }}>
                  What state are you physically located in right now for today&apos;s visit?
                </div>
                <div style={{ fontWeight: 400, fontSize: 15, lineHeight: '24px', color: 'var(--color-text-secondary, #5A554A)' }}>
                  Your prescription can only be sent to a pharmacy in the state you&apos;re physically in today.
                </div>
              </div>

              {/* Inline state picker (results inside the card, like the pharmacy
              step) so there's no floating dropdown to overlap Continue. */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ marginLeft: 4, display: 'flex', alignItems: 'center', color: '#5A554A', fontSize: 14, fontWeight: 500, lineHeight: '18px' }}>
                  State<span style={{ color: '#B8453C', marginLeft: 2 }}>*</span>
                </span>
                <input
                  type="text"
                  value={stateQuery}
                  onChange={(e) => {
                    setStateQuery(e.target.value);
                    if (consultLocationState) {
                      setConsultLocationState('');
                      setLocationError(null);
                    }
                  }}
                  placeholder="Start typing…"
                  style={{
                    width: '100%',
                    height: 48,
                    boxSizing: 'border-box',
                    padding: '0 16px',
                    borderRadius: 10,
                    fontSize: 16,
                    border: locationError ? '1px solid #B5483A' : '0.5px solid #D1CDC2',
                    background: '#FFFFFF',
                    outline: 'none',
                  }}
                />
                {!consultLocationState && (() => {
                  const q = stateQuery.trim().toLowerCase();
                  const matches = US_STATES.filter(
                    (s) => !q || s.code.toLowerCase().startsWith(q) || s.name.toLowerCase().includes(q),
                  );
                  return (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 4, maxHeight: 240, overflowY: 'auto', borderRadius: 12, border: '0.5px solid #E5E2DA', background: '#FFFFFF' }}>
                      {matches.length === 0 ? (
                        <li style={{ padding: '12px 14px', fontSize: 15, color: '#A8A39A' }}>No matching state</li>
                      ) : (
                        matches.map((s) => (
                          <li key={s.code}>
                            <button
                              type="button"
                              onClick={() => {
                                handleLocationChange(s.code);
                                setStateQuery(s.name);
                              }}
                              style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 14px', borderRadius: 8 }}
                            >
                              <span style={{ fontSize: 15, color: '#141515' }}>{s.name}</span>
                              <span style={{ fontSize: 13, color: '#5A554A' }}>{s.code}</span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  );
                })()}
              </div>

              {locationError && (
                <div style={{ fontWeight: 400, fontSize: 13, lineHeight: '20px', color: '#B5483A' }}>{locationError}</div>
              )}

              <button
                type="button"
                onClick={confirmConsultLocation}
                disabled={!locationValid || locationSaving}
                style={{
                  all: 'unset',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: 56,
                  borderRadius: 999,
                  background: locationValid ? '#206E55' : 'var(--color-border-subtle, #E5E2DA)',
                  color: locationValid ? '#FFFFFF' : '#A8A39A',
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: '20px',
                  textAlign: 'center',
                  cursor: locationValid && !locationSaving ? 'pointer' : 'not-allowed',
                  boxSizing: 'border-box',
                }}
              >
                {locationSaving ? 'Saving…' : 'Continue'}
              </button>
            </div>
          </motion.div>
        )}
        {mode === 'idle' && (
          <motion.div
            key="pdp-idle"
            className="pdp-bottom-sheet pdp-idle-card-padding"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={dialogTransition}
            style={{
              width: '100%',
              maxWidth: 464,
              overflowY: 'auto',
              background: 'var(--color-surface-elevated, #FFFFFF)',
              boxSizing: 'border-box',
              willChange: 'opacity, transform',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 32,
              }}
            >
              {/* Section 1: title + subtitle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    color: 'var(--color-text-primary, #141515)',
                    fontWeight: 500,
                    fontSize: 24,
                    lineHeight: '25px',
                    letterSpacing: '-0.4px',
                    marginTop: '5px'
                  }}
                >
                  Before your doctor joins
                </div>
                <div
                  style={{
                    fontWeight: 400,
                    fontSize: 15,
                    lineHeight: '24px',
                    letterSpacing: 0,
                    color: 'var(--color-text-secondary, #5A554A)',
                  }}
                >
                  Complete these steps to enable your provider for smooth care delivery.
                </div>
              </div>

              {/* Section 2: pharmacy row + divider + DL row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {savedPharmacyName ? (
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <div style={{ flexShrink: 0 }}>
                      <PharmacyIcon />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 15,
                          lineHeight: '24px',
                          color: 'var(--color-text-primary, #141515)',
                        }}
                      >
                        Pharmacy
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 400,
                            fontSize: 13,
                            lineHeight: '20px',
                            color: 'var(--color-text-secondary, #5A554A)',
                          }}
                        >
                          {savedPharmacyName} saved
                        </span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          style={{ flexShrink: 0 }}
                        >
                          <path
                            d="M3.75 9.5 7 12.75 14.25 5.5"
                            stroke="#3D8168"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode('pharmacy')}
                      style={{
                        all: 'unset',
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontFamily: 'Inter Display',
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: '18px',
                        color: '#7A7468',
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <Row
                    icon={<PharmacyIcon />}
                    title="Choose your pharmacy"
                    subtitle="So your doctor can send prescriptions directly to your pharmacy"
                    buttonLabel="Select"
                    onClick={() => setMode('pharmacy')}
                  />
                )}
                <div style={{ borderTop: '0.5px solid var(--color-border-subtle, #E5E2DA)' }} />
                {dlVerified ? (
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <div style={{ flexShrink: 0 }}>
                      <DLIcon />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 15,
                          lineHeight: '24px',
                          color: 'var(--color-text-primary, #141515)',
                        }}
                      >
                        Driver's License
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 400,
                            fontSize: 13,
                            lineHeight: '20px',
                            color: 'var(--color-text-secondary, #5A554A)',
                          }}
                        >
                          Uploaded - your doctor will verify
                        </span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          style={{ flexShrink: 0 }}
                        >
                          <path
                            d="M3.75 9.5 7 12.75 14.25 5.5"
                            stroke="#3D8168"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onUploadClick}
                      style={{
                        all: 'unset',
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontFamily: 'Inter Display',
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: '18px',
                        color: '#7A7468',
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <Row
                    icon={<DLIcon />}
                    title="Verify your identity"
                    subtitle="This is a mandatory requirement for a telehealth visit in your state."
                    buttonLabel="Upload ID"
                    onClick={onUploadClick}
                  />
                )}
              </div>

              {/* Section 3: info banner OR continue CTA + support line */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {savedPharmacyName && dlVerified ? (
                  <button
                    type="button"
                    onClick={continueToConsultation}
                    style={{
                      all: 'unset',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      height: 56,
                      borderRadius: 999,
                      background: 'var(--color-brand-primary, #206E55)',
                      color: '#FFFFFF',
                      fontWeight: 500,
                      fontSize: 16,
                      lineHeight: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    Continue to consultation
                  </button>
                ) : (
                  <></>
                )}

                <div
                  style={{
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: '16px',
                    letterSpacing: 0,
                    color: 'var(--color-text-disabled, #A8A39A)',
                    textAlign: 'center',
                  }}
                >
                  Need help? Send your query to{' '}
                  <a
                    href="mailto:support@meetaugust.ai"
                    style={{
                      color: 'inherit',
                      textDecorationStyle: 'solid',
                      textDecorationSkipInk: 'auto',
                    }}
                  >
                    support@meetaugust.ai
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif,application/pdf,.jpg,.jpeg,.png,.heic,.heif,.pdf"
          style={{ display: 'none' }}
          onChange={onFileSelected}
        />
        <input
          ref={videoFileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
          style={{ display: 'none' }}
          onChange={onVideoFileSelected}
        />

        {mode === 'pharmacy' && (
          <motion.div
            key="pdp-pharmacy"
            className="pdp-overlay-shell"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={dialogTransition}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 60,
              boxSizing: 'border-box',
              background: 'transparent',
              willChange: 'opacity, transform',
            }}
          >
            <div
              className="pdp-bottom-sheet"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 0,
                width: '100%',
                maxWidth: 520,
                overflowY: 'auto',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '40px 32px 24px',
                  gap: 20,
                  alignSelf: 'stretch',
                  boxSizing: 'border-box',
                }}
              >
                {/* Title Row */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: 0,
                    gap: 16,
                    alignSelf: 'stretch',
                  }}
                >
                  {/* Title Col */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: 0,
                      gap: 8,
                      flexGrow: 1,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 24,
                        lineHeight: '25px',
                        letterSpacing: '-0.4px',
                        color: '#141515',
                        alignSelf: 'stretch',
                      }}
                    >
                      Choose a pharmacy
                    </div>
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: 15,
                        lineHeight: '24px',
                        color: '#5A554A',
                        alignSelf: 'stretch',
                      }}
                    >
                      {pharmacyLoading
                        ? 'Select your preferred pharmacy in your area so we can electronically send your prescription to them.'
                        : 'You prescription will be sent to the pharmacy chosen here.'}
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setMode('idle')}
                    aria-label="Close"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '1px 6px',
                      width: 32,
                      height: 32,
                      background: '#FFFFFF',
                      border: '0.5px solid #F3F1EB',
                      borderRadius: 999,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 12M4 4l8 8" stroke="#7A7468" strokeWidth="1.35" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Inputs Row */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: 0,
                    gap: 12,
                    alignSelf: 'stretch',
                  }}
                >
                  {/* Zip code */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: 0,
                      gap: 8,
                      width: 140,
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ padding: '0 0 0 2px', alignSelf: 'stretch' }}>
                      <label
                        style={{
                          fontWeight: 500,
                          fontSize: 14,
                          lineHeight: '18px',
                          color: '#5A554A',
                        }}
                      >
                        Zip code<span style={{ color: '#D63A3A', marginLeft: 1 }}>*</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      value={zip}
                      onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={() => {
                        if (!zip && patientZip) setZip(patientZip);
                      }}
                      placeholder={patientZip || '12345'}
                      style={{
                        width: '100%',
                        height: 48,
                        background: '#FFFFFF',
                        border: `${zipInvalid ? 1 : 0.5}px solid ${zipInvalid ? '#D63A3A' : '#D1CDC2'}`,
                        borderRadius: 10,
                        padding: '0 16px',
                        fontFamily: 'Inter Display',
                        fontWeight: 400,
                        fontSize: 15,
                        lineHeight: '24px',
                        color: '#141515',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                    {zipInvalid && (
                      <div
                        style={{
                          padding: '0 0 0 2px',
                          fontWeight: 400,
                          fontSize: 12,
                          lineHeight: '16px',
                          color: '#D63A3A',
                        }}
                      >
                        Enter a 5-digit zip code
                      </div>
                    )}
                  </div>

                  {/* Pharmacy name */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: 0,
                      gap: 8,
                      flexGrow: 1,
                    }}
                  >
                    <div style={{ padding: '0 0 0 2px', alignSelf: 'stretch' }}>
                      <label
                        style={{
                          fontWeight: 500,
                          fontSize: 14,
                          lineHeight: '18px',
                          color: '#5A554A',
                        }}
                      >
                        Pharmacy name
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="eg. CVS"
                      value={pharmacySearch}
                      onChange={(e) => setPharmacySearch(e.target.value)}
                      style={{
                        width: '100%',
                        height: 48,
                        background: '#FFFFFF',
                        border: '0.5px solid #D1CDC2',
                        borderRadius: 10,
                        padding: '0 16px',
                        fontFamily: 'Inter Display',
                        fontWeight: 400,
                        fontSize: 15,
                        lineHeight: '24px',
                        color: '#141515',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Pharmacy List - fixed height, scrollable */}
              <div
                className="pharmacy-list-scroll"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0 32px',
                  alignSelf: 'stretch',
                  boxSizing: 'border-box',
                  height: 381,
                  flexShrink: 0,
                  overflowY: 'auto',
                }}
              >
                {(pharmacyLoading || (!pharmacies && !pharmacyError)) &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        padding: '16px 0',
                        gap: 14,
                        alignSelf: 'stretch',
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          background: '#F3F1EB',
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: 0,
                          gap: 10,
                          flexGrow: 1,
                        }}
                      >
                        <div style={{ width: 144, height: 16, background: '#F3F1EB', borderRadius: 8 }} />
                        <div style={{ width: 208, height: 12, background: '#FAF9F5', borderRadius: 8 }} />
                      </div>
                    </div>
                  ))}

                {!pharmacyLoading && pharmacyError && (
                  <div
                    style={{
                      padding: '16px 0',
                      fontWeight: 400,
                      fontSize: 13,
                      lineHeight: '20px',
                      color: '#B5483A',
                    }}
                  >
                    {pharmacyError}
                  </div>
                )}

                {!pharmacyLoading && pharmacies && pharmacies.length === 0 && !pharmacyError && (
                  <div
                    style={{
                      flex: 1,
                      alignSelf: 'stretch',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      padding: '24px 0',
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="13" stroke="#A8A39A" strokeWidth="1.5" />
                      <circle cx="11.5" cy="13.5" r="1.1" fill="#A8A39A" />
                      <circle cx="20.5" cy="13.5" r="1.1" fill="#A8A39A" />
                      <path
                        d="M11 22c1.2-1.6 3-2.5 5-2.5s3.8.9 5 2.5"
                        stroke="#A8A39A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 16,
                        lineHeight: '22px',
                        color: '#141515',
                        textAlign: 'center',
                      }}
                    >
                      No pharmacies found
                    </div>
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: 13,
                        lineHeight: '18px',
                        color: '#5A554A',
                        textAlign: 'center',
                      }}
                    >
                      {pharmacySearch.trim()
                        ? `No results for "${pharmacySearch.trim()}". Try with a different Zip code or Pharmacy name.`
                        : `No pharmacies found near ${zip}. Try a different zip code.`}
                    </div>
                  </div>
                )}

                {!pharmacyLoading && pharmacies &&
                  pharmacies.map((p, idx, arr) => {
                    const isPicked =
                      pickedPharmacy != null && String(pickedPharmacy) === String(p.pharmacy_id);
                    const addr = [p.address, p.city, p.state].filter(Boolean).join(', ');
                    return (
                      <button
                        key={p.pharmacy_id}
                        type="button"
                        onClick={() => setPickedPharmacy(p.pharmacy_id)}
                        style={{
                          all: 'unset',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          padding: '16px 0',
                          gap: 14,
                          alignSelf: 'stretch',
                          cursor: 'pointer',
                          borderBottom: idx < arr.length - 1 ? '0.5px solid #F3F1EB' : 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        {isPicked ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ flexShrink: 0, marginTop: 2 }}
                            aria-hidden="true"
                          >
                            <path
                              d="M12 2.25C10.0716 2.25 8.18657 2.82183 6.58319 3.89317C4.97982 4.96451 3.73013 6.48726 2.99218 8.26884C2.25422 10.0504 2.06114 12.0108 2.43735 13.9021C2.81355 15.7934 3.74215 17.5307 5.10571 18.8943C6.46928 20.2579 8.20656 21.1865 10.0979 21.5627C11.9892 21.9389 13.9496 21.7458 15.7312 21.0078C17.5127 20.2699 19.0355 19.0202 20.1068 17.4168C21.1782 15.8134 21.75 13.9284 21.75 12C21.7473 9.41498 20.7192 6.93661 18.8913 5.10872C17.0634 3.28084 14.585 2.25273 12 2.25ZM12 20.25C10.3683 20.25 8.77326 19.7661 7.41655 18.8596C6.05984 17.9531 5.00242 16.6646 4.378 15.1571C3.75358 13.6496 3.5902 11.9908 3.90853 10.3905C4.22685 8.79016 5.01259 7.32015 6.16637 6.16637C7.32016 5.01259 8.79017 4.22685 10.3905 3.90852C11.9909 3.59019 13.6497 3.75357 15.1571 4.37799C16.6646 5.00242 17.9531 6.05984 18.8596 7.41655C19.7661 8.77325 20.25 10.3683 20.25 12C20.2475 14.1873 19.3775 16.2843 17.8309 17.8309C16.2843 19.3775 14.1873 20.2475 12 20.25ZM17.25 12C17.25 13.0384 16.9421 14.0534 16.3652 14.9167C15.7883 15.7801 14.9684 16.453 14.0091 16.8504C13.0498 17.2477 11.9942 17.3517 10.9758 17.1491C9.95738 16.9466 9.02192 16.4465 8.28769 15.7123C7.55347 14.9781 7.05345 14.0426 6.85088 13.0242C6.64831 12.0058 6.75228 10.9502 7.14964 9.99091C7.547 9.0316 8.2199 8.21166 9.08326 7.63478C9.94662 7.05791 10.9617 6.75 12 6.75C13.3919 6.75149 14.7264 7.30509 15.7107 8.28933C16.6949 9.27358 17.2485 10.6081 17.25 12Z"
                              fill="#141515"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ flexShrink: 0, marginTop: 2 }}
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M6.58319 3.89317C8.18657 2.82183 10.0716 2.25 12 2.25C14.585 2.25273 17.0634 3.28084 18.8913 5.10872C20.7192 6.93661 21.7473 9.41498 21.75 12C21.75 13.9284 21.1782 15.8134 20.1068 17.4168C19.0355 19.0202 17.5127 20.2699 15.7312 21.0078C13.9496 21.7458 11.9892 21.9389 10.0979 21.5627C8.20656 21.1865 6.46927 20.2579 5.10571 18.8943C3.74215 17.5307 2.81355 15.7934 2.43735 13.9021C2.06114 12.0108 2.25422 10.0504 2.99218 8.26884C3.73013 6.48726 4.97982 4.96452 6.58319 3.89317ZM7.41655 18.8596C8.77326 19.7661 10.3683 20.25 12 20.25C14.1873 20.2475 16.2843 19.3775 17.8309 17.8309C19.3775 16.2843 20.2475 14.1873 20.25 12C20.25 10.3683 19.7661 8.77325 18.8596 7.41655C17.9531 6.05984 16.6646 5.00242 15.1571 4.37799C13.6497 3.75357 11.9909 3.59019 10.3905 3.90852C8.79017 4.22685 7.32016 5.01259 6.16637 6.16637C5.01259 7.32015 4.22685 8.79016 3.90853 10.3905C3.5902 11.9908 3.75358 13.6496 4.378 15.1571C5.00242 16.6646 6.05984 17.9531 7.41655 18.8596Z"
                              fill="#D1CDC2"
                            />
                          </svg>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 }}>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 15,
                              lineHeight: '20px',
                              color: '#141515',
                            }}
                          >
                            {p.name}
                          </div>
                          {addr && (
                            <div
                              style={{
                                fontWeight: 400,
                                fontSize: 13,
                                lineHeight: '18px',
                                color: '#5A554A',
                              }}
                            >
                              {addr}
                            </div>
                          )}
                          {p.is_24_hour && (
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 13,
                                lineHeight: '18px',
                                color: '#2F7A5B',
                              }}
                            >
                              Open 24 hours
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Footer */}
              <div
                className={`pdp-pharmacy-footer ${pharmacyLoading ? 'is-loading' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '20px 40px 36px',
                  gap: 16,
                  alignSelf: 'stretch',
                  boxSizing: 'border-box',
                  flexShrink: 0,
                }}
              >
                {pharmacySaveError && (
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: 13,
                      lineHeight: '18px',
                      color: '#B5483A',
                      alignSelf: 'stretch',
                    }}
                  >
                    {pharmacySaveError}
                  </div>
                )}

                {(() => {
                  // Derive enable-state directly from what's rendered: the
                  // pickedPharmacy must actually appear in the current results.
                  // Avoids races between row clicks and refetches leaving a
                  // stale id behind.
                  const isPickedInList =
                    pickedPharmacy != null &&
                    !!pharmacies &&
                    pharmacies.some((p) => String(p.pharmacy_id) === String(pickedPharmacy));
                  const pickedObj = pharmacies?.find((p) => String(p.pharmacy_id) === String(pickedPharmacy));
                  const pickedOutOfState =
                    !!pickedObj && !!requiredPharmacyState && normalizeStateCode(pickedObj.state) !== requiredPharmacyState;
                  const saveActive = isPickedInList && !pickedOutOfState && !pharmacySaving && !!patientId;
                  return (
                    <>
                      {pickedOutOfState && (
                        <div style={{ paddingBottom: 12, fontWeight: 400, fontSize: 13, lineHeight: '20px', color: '#B5483A' }}>
                          Please select a pharmacy in {stateDisplayName(requiredPharmacyState)}, your confirmed physical location for today&apos;s visit.
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={savePharmacy}
                        disabled={!saveActive && !pharmacySaving}
                        style={{
                          all: 'unset',
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          height: 56,
                          borderRadius: 999,
                          background: saveActive || pharmacySaving
                            ? '#206E55'
                            : 'var(--color-border-subtle, #E5E2DA)',
                          color: saveActive || pharmacySaving ? '#FFFFFF' : '#A8A39A',
                          fontWeight: 500,
                          fontSize: 16,
                          lineHeight: '20px',
                          textAlign: 'center',
                          cursor: saveActive ? 'pointer' : 'not-allowed',
                          boxSizing: 'border-box',
                        }}
                      >
                        {pharmacySaving ? (
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              border: '2.5px solid rgba(255,255,255,0.35)',
                              borderTopColor: '#FFFFFF',
                              borderRadius: '50%',
                              animation: 'pre-doctor-spin 0.9s linear infinite',
                            }}
                          />
                        ) : (
                          'Save my preference'
                        )}
                      </button>
                    </>
                  );
                })()}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 16,
                    alignSelf: 'stretch',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: '6px 12px',
                      gap: 6,
                      background: '#FAF9F5',
                      border: '1px solid #E5E2DA',
                      borderRadius: 999,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#pre-doctor-lock-clip)">
                        <path
                          d="M10.5625 4.0625H8.9375V2.84375C8.9375 2.19728 8.68069 1.5773 8.22357 1.12018C7.76645 0.663057 7.14647 0.40625 6.5 0.40625C5.85353 0.40625 5.23355 0.663057 4.77643 1.12018C4.31931 1.5773 4.0625 2.19728 4.0625 2.84375V4.0625H2.4375C2.22201 4.0625 2.01535 4.1481 1.86298 4.30048C1.7106 4.45285 1.625 4.65951 1.625 4.875V10.5625C1.625 10.778 1.7106 10.9847 1.86298 11.137C2.01535 11.2894 2.22201 11.375 2.4375 11.375H10.5625C10.778 11.375 10.9847 11.2894 11.137 11.137C11.2894 10.9847 11.375 10.778 11.375 10.5625V4.875C11.375 4.65951 11.2894 4.45285 11.137 4.30048C10.9847 4.1481 10.778 4.0625 10.5625 4.0625ZM4.875 2.84375C4.875 2.41277 5.0462 1.99945 5.35095 1.6947C5.6557 1.38995 6.06902 1.21875 6.5 1.21875C6.93098 1.21875 7.3443 1.38995 7.64905 1.6947C7.95379 1.99945 8.125 2.41277 8.125 2.84375V4.0625H4.875V2.84375ZM10.5625 10.5625H2.4375V4.875H10.5625V10.5625Z"
                          fill="#7A7468"
                        />
                      </g>
                      <defs>
                        <clipPath id="pre-doctor-lock-clip">
                          <rect width="13" height="13" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#7A7468' }}>
                      Secure & confidential
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: '6px 12px',
                      gap: 6,
                      background: '#FAF9F5',
                      border: '1px solid #E5E2DA',
                      borderRadius: 999,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.99942 1.93879C7.1663 1.93879 7.30158 1.80351 7.30158 1.63663C7.30158 1.46975 7.1663 1.33447 6.99942 1.33447C6.83255 1.33447 6.69727 1.46975 6.69727 1.63663C6.69727 1.80351 6.83255 1.93879 6.99942 1.93879Z" fill="#7A7468" />
                      <path d="M7.15177 1.93884H6.84961V13.018H7.15177V1.93884Z" fill="#7A7468" />
                      <path d="M6.99917 2.99644C5.48838 2.39212 3.97759 2.39212 2.4668 3.19788C3.57471 4.10435 5.48838 4.10435 6.99917 3.39932V2.99644ZM6.99917 2.99644C8.50996 2.39212 10.0208 2.39212 11.5315 3.19788C10.4236 4.10435 8.50996 4.10435 6.99917 3.39932V2.99644Z" fill="#7A7468" />
                      <path d="M7.00039 4.5072C4.88529 5.0108 4.88529 6.52159 7.00039 7.02519C9.1155 7.52878 9.1155 9.03958 7.00039 9.54317C4.88529 10.0468 4.88529 11.5576 7.00039 12.0612" stroke="#7A7468" strokeWidth="0.503597" strokeLinecap="round" />
                      <path d="M7.00039 4.5072C9.1155 5.0108 9.1155 6.52159 7.00039 7.02519C4.88529 7.52878 4.88529 9.03958 7.00039 9.54317C9.1155 10.0468 9.1155 11.5576 7.00039 12.0612" stroke="#7A7468" strokeWidth="0.503597" strokeLinecap="round" />
                      <path d="M4.88488 5.21226C5.13519 5.21226 5.33812 5.00934 5.33812 4.75902C5.33812 4.50871 5.13519 4.30579 4.88488 4.30579C4.63456 4.30579 4.43164 4.50871 4.43164 4.75902C4.43164 5.00934 4.63456 5.21226 4.88488 5.21226Z" fill="#7A7468" />
                      <path d="M9.11535 5.21226C9.36566 5.21226 9.56858 5.00934 9.56858 4.75902C9.56858 4.50871 9.36566 4.30579 9.11535 4.30579C8.86503 4.30579 8.66211 4.50871 8.66211 4.75902C8.66211 5.00934 8.86503 5.21226 9.11535 5.21226Z" fill="#7A7468" />
                    </svg>
                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#7A7468' }}>
                      HIPAA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'upload-dl' && (
          <motion.div
            key="pdp-upload-dl"
            className="pdp-overlay-shell"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={dialogTransition}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 60,
              boxSizing: 'border-box',
              background: 'transparent',
              willChange: 'opacity, transform',
            }}
          >
            <div
              className="pdp-bottom-sheet"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 0,
                width: '100%',
                maxWidth: 520,
                overflowY: 'auto',
                background: '#FFFFFF',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '40px 32px 8px',
                  gap: 12,
                  width: '100%',
                  alignSelf: 'stretch',
                  boxSizing: 'border-box',
                }}
              >
                {/* Title Row */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: 0,
                    gap: 16,
                    alignSelf: 'stretch',
                  }}
                >
                  {/* Title Col */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: 0,
                      gap: 10,
                      flexGrow: 1,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 24,
                        lineHeight: '25px',
                        letterSpacing: '-0.4px',
                        color: '#141515',
                        alignSelf: 'stretch',
                      }}
                    >
                      {requireVideo ? 'Complete ID Verification' : 'Upload your driving license'}
                    </div>
                    <div
                      style={{
                        fontWeight: 400,
                        fontSize: 15,
                        lineHeight: '24px',
                        color: '#5A554A',
                        alignSelf: 'stretch',
                      }}
                    >
                      {requireVideo
                        ? 'ID verification is a must for obtaining Telehealth services in your state. Please submit the information as required here.'
                        : 'Your doctor will verify your identity at the start of your consultation. Upload clear photo of your license.'}
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setMode('idle')}
                    aria-label="Close"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '1px 6px',
                      width: 32,
                      height: 32,
                      background: '#FFFFFF',
                      border: '0.5px solid #F3F1EB',
                      borderRadius: 999,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 12M4 4l8 8" stroke="#7A7468" strokeWidth="1.35" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Video Error Banner */}
                {videoError && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      gap: 12,
                      alignSelf: 'stretch',
                      background: '#FBEAEA',
                      border: '0.5px solid #E5B4B4',
                      borderRadius: 12,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ flexShrink: 0, lineHeight: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.8007 11.7557L9.33505 2.26379C9.19847 2.03124 9.00348 1.83843 8.76942 1.70445C8.53537 1.57048 8.27036 1.5 8.00067 1.5C7.73098 1.5 7.46597 1.57048 7.23192 1.70445C6.99786 1.83843 6.80288 2.03124 6.6663 2.26379L1.20067 11.7557C1.06926 11.9806 1 12.2364 1 12.4969C1 12.7574 1.06926 13.0132 1.20067 13.2382C1.3355 13.4721 1.53015 13.666 1.76465 13.7999C1.99914 13.9338 2.26504 14.0028 2.53505 14H13.4663C13.7361 14.0026 14.0017 13.9334 14.236 13.7996C14.4702 13.6657 14.6647 13.4719 14.7994 13.2382C14.931 13.0134 15.0005 12.7576 15.0007 12.4971C15.0009 12.2366 14.9319 11.9807 14.8007 11.7557ZM13.9338 12.7375C13.8861 12.8188 13.8177 12.886 13.7356 12.9321C13.6534 12.9782 13.5605 13.0017 13.4663 13H2.53505C2.44084 13.0017 2.3479 12.9782 2.26575 12.9321C2.1836 12.886 2.11519 12.8188 2.06755 12.7375C2.02439 12.6645 2.00162 12.5812 2.00162 12.4963C2.00162 12.4114 2.02439 12.3281 2.06755 12.255L7.53317 2.76317C7.58178 2.68227 7.6505 2.61534 7.73264 2.56887C7.81478 2.5224 7.90755 2.49797 8.00192 2.49797C8.09629 2.49797 8.18906 2.5224 8.2712 2.56887C8.35334 2.61534 8.42206 2.68227 8.47067 2.76317L13.9363 12.255C13.9791 12.3283 14.0014 12.4118 14.001 12.4966C14.0005 12.5815 13.9773 12.6647 13.9338 12.7375ZM7.50067 9.00004V6.50004C7.50067 6.36743 7.55335 6.24026 7.64712 6.14649C7.74089 6.05272 7.86806 6.00004 8.00067 6.00004C8.13328 6.00004 8.26046 6.05272 8.35422 6.14649C8.44799 6.24026 8.50067 6.36743 8.50067 6.50004V9.00004C8.50067 9.13265 8.44799 9.25983 8.35422 9.3536C8.26046 9.44736 8.13328 9.50004 8.00067 9.50004C7.86806 9.50004 7.74089 9.44736 7.64712 9.3536C7.55335 9.25983 7.50067 9.13265 7.50067 9.00004ZM8.75067 11.25C8.75067 11.3984 8.70668 11.5434 8.62427 11.6667C8.54186 11.7901 8.42473 11.8862 8.28768 11.943C8.15064 11.9997 7.99984 12.0146 7.85435 11.9856C7.70887 11.9567 7.57523 11.8853 7.47034 11.7804C7.36545 11.6755 7.29402 11.5418 7.26508 11.3964C7.23614 11.2509 7.251 11.1001 7.30776 10.963C7.36453 10.826 7.46066 10.7089 7.58399 10.6264C7.70733 10.544 7.85233 10.5 8.00067 10.5C8.19958 10.5 8.39035 10.5791 8.531 10.7197C8.67165 10.8604 8.75067 11.0511 8.75067 11.25Z" fill="#802F28" />
                      </svg>

                    </div>
                    <div
                      style={{
                        flexGrow: 1,
                        fontFamily: 'Inter Display',
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: '20px',
                        color: '#B0413E',
                      }}
                    >
                      {videoError}
                    </div>
                    <button
                      type="button"
                      onClick={() => setVideoError(null)}
                      aria-label="Dismiss"
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 20,
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 3L3 11M3 3l8 8" stroke="#B0413E" strokeWidth="1.35" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      gap: 12,
                      alignSelf: 'stretch',
                      background: '#FBEAEA',
                      border: '0.5px solid #E5B4B4',
                      borderRadius: 12,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ flexShrink: 0, lineHeight: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.8007 11.7557L9.33505 2.26379C9.19847 2.03124 9.00348 1.83843 8.76942 1.70445C8.53537 1.57048 8.27036 1.5 8.00067 1.5C7.73098 1.5 7.46597 1.57048 7.23192 1.70445C6.99786 1.83843 6.80288 2.03124 6.6663 2.26379L1.20067 11.7557C1.06926 11.9806 1 12.2364 1 12.4969C1 12.7574 1.06926 13.0132 1.20067 13.2382C1.3355 13.4721 1.53015 13.666 1.76465 13.7999C1.99914 13.9338 2.26504 14.0028 2.53505 14H13.4663C13.7361 14.0026 14.0017 13.9334 14.236 13.7996C14.4702 13.6657 14.6647 13.4719 14.7994 13.2382C14.931 13.0134 15.0005 12.7576 15.0007 12.4971C15.0009 12.2366 14.9319 11.9807 14.8007 11.7557ZM13.9338 12.7375C13.8861 12.8188 13.8177 12.886 13.7356 12.9321C13.6534 12.9782 13.5605 13.0017 13.4663 13H2.53505C2.44084 13.0017 2.3479 12.9782 2.26575 12.9321C2.1836 12.886 2.11519 12.8188 2.06755 12.7375C2.02439 12.6645 2.00162 12.5812 2.00162 12.4963C2.00162 12.4114 2.02439 12.3281 2.06755 12.255L7.53317 2.76317C7.58178 2.68227 7.6505 2.61534 7.73264 2.56887C7.81478 2.5224 7.90755 2.49797 8.00192 2.49797C8.09629 2.49797 8.18906 2.5224 8.2712 2.56887C8.35334 2.61534 8.42206 2.68227 8.47067 2.76317L13.9363 12.255C13.9791 12.3283 14.0014 12.4118 14.001 12.4966C14.0005 12.5815 13.9773 12.6647 13.9338 12.7375ZM7.50067 9.00004V6.50004C7.50067 6.36743 7.55335 6.24026 7.64712 6.14649C7.74089 6.05272 7.86806 6.00004 8.00067 6.00004C8.13328 6.00004 8.26046 6.05272 8.35422 6.14649C8.44799 6.24026 8.50067 6.36743 8.50067 6.50004V9.00004C8.50067 9.13265 8.44799 9.25983 8.35422 9.3536C8.26046 9.44736 8.13328 9.50004 8.00067 9.50004C7.86806 9.50004 7.74089 9.44736 7.64712 9.3536C7.55335 9.25983 7.50067 9.13265 7.50067 9.00004ZM8.75067 11.25C8.75067 11.3984 8.70668 11.5434 8.62427 11.6667C8.54186 11.7901 8.42473 11.8862 8.28768 11.943C8.15064 11.9997 7.99984 12.0146 7.85435 11.9856C7.70887 11.9567 7.57523 11.8853 7.47034 11.7804C7.36545 11.6755 7.29402 11.5418 7.26508 11.3964C7.23614 11.2509 7.251 11.1001 7.30776 10.963C7.36453 10.826 7.46066 10.7089 7.58399 10.6264C7.70733 10.544 7.85233 10.5 8.00067 10.5C8.19958 10.5 8.39035 10.5791 8.531 10.7197C8.67165 10.8604 8.75067 11.0511 8.75067 11.25Z" fill="#802F28" />
                      </svg>

                    </div>
                    <div
                      style={{
                        flexGrow: 1,
                        fontFamily: 'Inter Display',
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: '20px',
                        color: '#B0413E',
                      }}
                    >
                      {error}
                    </div>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      aria-label="Dismiss"
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 20,
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 3L3 11M3 3l8 8" stroke="#B0413E" strokeWidth="1.35" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                )}

              </div>

              {/* Cards */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '24px 32px',
                  gap: 20,
                  width: '100%',
                  alignSelf: 'stretch',
                  boxSizing: 'border-box',
                }}
              >
                {/* Front of driving license card */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: 20,
                    gap: 16,
                    alignSelf: 'stretch',
                    background: '#FFFFFF',
                    border: error ? '1px solid #E5B4B4' : '0.5px solid #E5E2DA',
                    borderRadius: 16,
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Card title + idle subtitle (tight gap) */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignSelf: 'stretch',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 15,
                        lineHeight: '24px',
                        color: '#141515',
                        alignSelf: 'stretch',
                      }}
                    >
                      {requireVideo ? 'Submit Driver\'s License' : 'Driving license'}
                    </div>
                    {dlState === 'idle' && (
                      <div
                        style={{
                          fontWeight: 400,
                          fontSize: 13,
                          lineHeight: '20px',
                          color: '#5A554A',
                          alignSelf: 'stretch',
                        }}
                      >
                        Name, photo, and date of birth should be clearly visible.
                      </div>
                    )}
                  </div>

                  {dlState === 'processing' && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'stretch',
                        gap: 12,
                        padding: '24px 0',
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          border: '2px solid #E5E2DA',
                          borderTopColor: '#7A7468',
                          borderRadius: '50%',
                          animation: 'pre-doctor-spin 0.9s linear infinite',
                        }}
                      />
                      <div
                        style={{
                          fontFamily: 'Inter Display',
                          fontWeight: 400,
                          fontSize: 13,
                          lineHeight: '20px',
                          color: '#5A554A',
                        }}
                      >
                        Processing...
                      </div>
                    </div>
                  )}

                  {dlState === 'uploaded' && capturedUrl && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: 'stretch',
                        gap: 12,
                      }}
                    >
                      {/\.pdf$/i.test(fileName ?? '') ? (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            width: '100%',
                            height: 129,
                            background: '#F3F1EB',
                            border: '0.5px solid #E5E2DA',
                            borderRadius: 12,
                            boxSizing: 'border-box',
                          }}
                        >
                          <DLIcon />
                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 500,
                              fontSize: 12,
                              lineHeight: '16px',
                              color: '#7A7468',
                            }}
                          >
                            PDF document
                          </span>
                        </div>
                      ) : (
                        <img
                          src={capturedUrl}
                          alt="Driving license"
                          style={{
                            width: '100%',
                            height: 129,
                            objectFit: 'cover',
                            border: '0.5px solid #E5E2DA',
                            borderRadius: 12,
                            boxSizing: 'border-box',
                          }}
                        />
                      )}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          alignSelf: 'stretch',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: 12,
                            lineHeight: '16px',
                            color: '#7A7468',
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {fileName}
                        </div>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget('dl')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                            color: '#B8453C',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: 14,
                            lineHeight: '18px',
                            flexShrink: 0,
                          }}
                        >
                          <TrashIcon size={13} />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload buttons */}
                  {dlState === 'idle' && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        padding: 0,
                        gap: 12,
                        alignSelf: 'stretch',
                        height: 48,
                      }}
                    >
                      <button
                        type="button"
                        onClick={openWebcam}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 0,
                          gap: 4,
                          height: 48,
                          flex: 1,
                          background: '#F3F1EB',
                          border: '0.5px solid #D1CDC2',
                          borderRadius: 12,
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16.25 4.375H14.0844L13.0195 2.77813C12.9625 2.69262 12.8852 2.6225 12.7946 2.57399C12.704 2.52548 12.6028 2.50006 12.5 2.5H7.5C7.39721 2.50006 7.29602 2.52548 7.2054 2.57399C7.11478 2.6225 7.03752 2.69262 6.98047 2.77813L5.91484 4.375H3.75C3.25272 4.375 2.77581 4.57254 2.42417 4.92417C2.07254 5.27581 1.875 5.75272 1.875 6.25V15C1.875 15.4973 2.07254 15.9742 2.42417 16.3258C2.77581 16.6775 3.25272 16.875 3.75 16.875H16.25C16.7473 16.875 17.2242 16.6775 17.5758 16.3258C17.9275 15.9742 18.125 15.4973 18.125 15V6.25C18.125 5.75272 17.9275 5.27581 17.5758 4.92417C17.2242 4.57254 16.7473 4.375 16.25 4.375ZM16.875 15C16.875 15.1658 16.8092 15.3247 16.6919 15.4419C16.5747 15.5592 16.4158 15.625 16.25 15.625H3.75C3.58424 15.625 3.42527 15.5592 3.30806 15.4419C3.19085 15.3247 3.125 15.1658 3.125 15V6.25C3.125 6.08424 3.19085 5.92527 3.30806 5.80806C3.42527 5.69085 3.58424 5.625 3.75 5.625H6.25C6.35292 5.62507 6.45427 5.59971 6.54504 5.5512C6.63581 5.50268 6.71319 5.43249 6.77031 5.34688L7.83437 3.75H12.1648L13.2297 5.34688C13.2868 5.43249 13.3642 5.50268 13.455 5.5512C13.5457 5.59971 13.6471 5.62507 13.75 5.625H16.25C16.4158 5.625 16.5747 5.69085 16.6919 5.80806C16.8092 5.92527 16.875 6.08424 16.875 6.25V15ZM10 6.875C9.32013 6.875 8.65552 7.07661 8.09023 7.45432C7.52493 7.83204 7.08434 8.3689 6.82416 8.99703C6.56399 9.62515 6.49591 10.3163 6.62855 10.9831C6.76119 11.6499 7.08858 12.2624 7.56932 12.7432C8.05006 13.2239 8.66257 13.5513 9.32938 13.6839C9.99619 13.8166 10.6874 13.7485 11.3155 13.4883C11.9436 13.2282 12.4805 12.7876 12.8582 12.2223C13.2359 11.657 13.4375 10.9924 13.4375 10.3125C13.4365 9.40114 13.074 8.52739 12.4295 7.88296C11.7851 7.23853 10.9114 6.87603 10 6.875ZM10 12.5C9.56735 12.5 9.14442 12.3717 8.78469 12.1313C8.42496 11.891 8.14458 11.5493 7.97901 11.1496C7.81345 10.7499 7.77013 10.3101 7.85453 9.88574C7.93894 9.46141 8.14728 9.07163 8.4532 8.7657C8.75913 8.45978 9.14891 8.25144 9.57324 8.16703C9.99757 8.08263 10.4374 8.12595 10.8371 8.29151C11.2368 8.45708 11.5785 8.73746 11.8188 9.09719C12.0592 9.45692 12.1875 9.87985 12.1875 10.3125C12.1875 10.8927 11.957 11.4491 11.5468 11.8593C11.1366 12.2695 10.5802 12.5 10 12.5Z" fill="#141515" />
                        </svg>
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: 14,
                            lineHeight: '18px',
                            color: '#141515',
                          }}
                        >
                          Take photo
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={pickGallery}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 0,
                          gap: 4,
                          height: 48,
                          flex: 1,
                          background: '#F3F1EB',
                          border: '0.5px solid #D1CDC2',
                          borderRadius: 12,
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16.6922 6.43281L12.3172 2.05781C12.2591 1.99979 12.1902 1.95378 12.1143 1.92241C12.0384 1.89105 11.9571 1.87494 11.875 1.875H4.375C4.04348 1.875 3.72554 2.0067 3.49112 2.24112C3.2567 2.47554 3.125 2.79348 3.125 3.125V16.875C3.125 17.2065 3.2567 17.5245 3.49112 17.7589C3.72554 17.9933 4.04348 18.125 4.375 18.125H15.625C15.9565 18.125 16.2745 17.9933 16.5089 17.7589C16.7433 17.5245 16.875 17.2065 16.875 16.875V6.875C16.8751 6.7929 16.859 6.71159 16.8276 6.63572C16.7962 6.55985 16.7502 6.4909 16.6922 6.43281ZM12.5 4.00859L14.7414 6.25H12.5V4.00859ZM15.625 16.875H4.375V3.125H11.25V6.875C11.25 7.04076 11.3158 7.19973 11.4331 7.31694C11.5503 7.43415 11.7092 7.5 11.875 7.5H15.625V16.875ZM12.3172 10.8078C12.3753 10.8659 12.4213 10.9348 12.4527 11.0107C12.4842 11.0866 12.5003 11.1679 12.5003 11.25C12.5003 11.3321 12.4842 11.4134 12.4527 11.4893C12.4213 11.5652 12.3753 11.6341 12.3172 11.6922C12.2591 11.7503 12.1902 11.7963 12.1143 11.8277C12.0384 11.8592 11.9571 11.8753 11.875 11.8753C11.7929 11.8753 11.7116 11.8592 11.6357 11.8277C11.5598 11.7963 11.4909 11.7503 11.4328 11.6922L10.625 10.8836V14.375C10.625 14.5408 10.5592 14.6997 10.4419 14.8169C10.3247 14.9342 10.1658 15 10 15C9.83424 15 9.67527 14.9342 9.55806 14.8169C9.44085 14.6997 9.375 14.5408 9.375 14.375V10.8836L8.56719 11.6922C8.50912 11.7503 8.44018 11.7963 8.36431 11.8277C8.28844 11.8592 8.20712 11.8753 8.125 11.8753C8.04288 11.8753 7.96156 11.8592 7.88569 11.8277C7.80982 11.7963 7.74088 11.7503 7.68281 11.6922C7.62474 11.6341 7.57868 11.5652 7.54725 11.4893C7.51583 11.4134 7.49965 11.3321 7.49965 11.25C7.49965 11.1679 7.51583 11.0866 7.54725 11.0107C7.57868 10.9348 7.62474 10.8659 7.68281 10.8078L9.55781 8.93281C9.61586 8.8747 9.68479 8.8286 9.76066 8.79715C9.83654 8.7657 9.91787 8.74951 10 8.74951C10.0821 8.74951 10.1635 8.7657 10.2393 8.79715C10.3152 8.8286 10.3841 8.8747 10.4422 8.93281L12.3172 10.8078Z" fill="#141515" />
                        </svg>
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: 14,
                            lineHeight: '18px',
                            color: '#141515',
                          }}
                        >
                          Upload file
                        </span>
                      </button>
                    </div>
                  )}

                  {dlState === 'idle' && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        alignSelf: 'stretch',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                        <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5S11.59 1.5 8 1.5zm0 12c-3.03 0-5.5-2.47-5.5-5.5S4.97 2.5 8 2.5s5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5zm.5-3.75v-3a.5.5 0 00-1 0v3a.5.5 0 001 0zM8 5.25a.625.625 0 100 1.25.625.625 0 000-1.25z" fill="#7A7468" />
                      </svg>
                      <span
                        style={{
                          fontFamily: 'Inter Display',
                          fontWeight: 400,
                          fontSize: 12,
                          lineHeight: '16px',
                          color: '#7A7468',
                        }}
                      >
                        Accepted file types: JPG, JPEG, PNG, PDF, or HEIC.
                      </span>
                    </div>
                  )}
                </div>

                {/* Verification video card — keep visible when the user has a
                  locally-cached upload, so re-opening this sheet via "Change"
                  after a successful submission still shows what they sent.
                  (`requireVideo` flips to false once `intro_video_id` is set
                  on the patient, which would otherwise hide this whole card.) */}
                {(requireVideo || videoState === 'uploaded') && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: 20,
                      gap: 16,
                      alignSelf: 'stretch',
                      background: '#FFFFFF',
                      border: videoError ? '1px solid #E5B4B4' : '0.5px solid #E5E2DA',
                      borderRadius: 16,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: 0,
                        gap: 4,
                        alignSelf: 'stretch',
                      }}
                    >
                      {/* Title row + sample-video pill */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 0,
                          gap: 10,
                          alignSelf: 'stretch',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'Inter Display',
                            fontWeight: 500,
                            fontSize: 17,
                            lineHeight: '24px',
                            color: '#141515',
                          }}
                        >
                          Record a Verification Video
                        </div>
                      </div>

                      {/* Description + instructions */}
                      {videoState !== 'uploaded' && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: 0,
                            gap: 16,
                            alignSelf: 'stretch',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: 'Inter Display',
                              fontWeight: 400,
                              fontSize: 14,
                              lineHeight: '22px',
                              color: '#5A554A',
                              alignSelf: 'stretch',
                            }}
                          >
                            We need a short video (5–10 seconds) to verify your identity before your consultation.
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              padding: '16px 20px',
                              gap: 4,
                              alignSelf: 'stretch',
                              background: '#FAF9F5',
                              borderRadius: 12,
                              boxSizing: 'border-box',
                              border: '0.5px solid #E5E2DA',
                            }}
                          >
                            <div
                              style={{
                                fontFamily: 'Inter Display',
                                fontWeight: 400,
                                fontSize: 15,
                                lineHeight: '24px',
                                color: '#141515',
                              }}
                            >
                              Please state clearly:
                            </div>
                            <ol
                              style={{
                                margin: 0,
                                paddingLeft: 20,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                alignSelf: 'stretch',
                                fontFamily: 'Inter Display',
                                fontWeight: 400,
                                fontSize: 13,
                                lineHeight: '20px',
                                color: '#5A554A',
                                listStyleType: 'decimal',
                                listStylePosition: 'outside',
                              }}
                            >
                              <li>Your full name</li>
                              <li>Your date of birth</li>
                              <li>The condition or symptoms you&apos;re seeking care for</li>
                              <li>The state where you&apos;ll be receiving care</li>
                            </ol>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              padding: 0,
                              gap: 4,
                              alignSelf: 'stretch',
                            }}
                          >
                            <div
                              style={{
                                fontFamily: 'Inter Display',
                                fontWeight: 500,
                                fontSize: 14,
                                lineHeight: '22px',
                                color: '#141515',
                              }}
                            >
                              For best results:
                            </div>
                            <div
                              style={{
                                fontFamily: 'Inter Display',
                                fontWeight: 400,
                                fontSize: 14,
                                lineHeight: '22px',
                                color: '#5A554A',
                                alignSelf: 'stretch',
                              }}
                            >
                              Hold your phone at arm&apos;s length, or stand about two steps away. Make sure your face is well-lit and fully visible
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Video state body */}
                    {videoState === 'processing' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: 'stretch',
                          gap: 12,
                          padding: '12px 0',
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            border: '2px solid #E5E2DA',
                            borderTopColor: '#7A7468',
                            borderRadius: '50%',
                            animation: 'pre-doctor-spin 0.9s linear infinite',
                          }}
                        />
                        <div
                          style={{
                            fontFamily: 'Inter Display',
                            fontWeight: 400,
                            fontSize: 13,
                            lineHeight: '20px',
                            color: '#5A554A',
                          }}
                        >
                          Processing...
                        </div>
                      </div>
                    )}

                    {videoState === 'uploaded' && videoUrl && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignSelf: 'stretch',
                          gap: 12,
                        }}
                      >
                        <video
                          src={videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          style={{
                            width: '100%',
                            height: 208,
                            objectFit: 'cover',
                            background: '#000',
                            border: '0.5px solid #E5E2DA',
                            borderRadius: 12,
                            boxSizing: 'border-box',
                            display: 'block',
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            alignSelf: 'stretch',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 500,
                              fontSize: 12,
                              lineHeight: '16px',
                              color: '#7A7468',
                              flex: 1,
                              minWidth: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {videoFileName}
                          </div>
                          <button
                            type="button"
                            onClick={() => setRemoveTarget('video')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              padding: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: 'pointer',
                              color: '#B0413E',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 500,
                              fontSize: 14,
                              lineHeight: '18px',
                              flexShrink: 0,
                            }}
                          >
                            <TrashIcon size={13} />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {videoState === 'idle' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          padding: 0,
                          gap: 12,
                          alignSelf: 'stretch',
                          height: 48,
                        }}
                      >
                        <button
                          type="button"
                          onClick={openVideoCamera}
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 0,
                            gap: 6,
                            height: 48,
                            flex: 1,
                            background: '#F3F1EB',
                            border: '0.5px solid #D1CDC2',
                            borderRadius: 12,
                            cursor: 'pointer',
                          }}
                        >
                          <VideoCameraIcon size={18} />
                          <span
                            style={{
                              fontFamily: 'Inter Display',
                              fontWeight: 500,
                              fontSize: 14,
                              lineHeight: '18px',
                              color: '#141515',
                            }}
                          >
                            Record video
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => videoFileInputRef.current?.click()}
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 0,
                            gap: 4,
                            height: 48,
                            flex: 1,
                            background: '#F3F1EB',
                            border: '0.5px solid #D1CDC2',
                            borderRadius: 12,
                            cursor: 'pointer',
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M15.023 5.78953L11.0855 1.85203C11.0332 1.79981 10.9711 1.7584 10.9029 1.73017C10.8346 1.70194 10.7614 1.68744 10.6875 1.6875H3.9375C3.63913 1.6875 3.35298 1.80603 3.142 2.017C2.93103 2.22798 2.8125 2.51413 2.8125 2.8125V7.875C2.8125 8.02418 2.87176 8.16726 2.97725 8.27275C3.08274 8.37824 3.22582 8.4375 3.375 8.4375C3.52418 8.4375 3.66726 8.37824 3.77275 8.27275C3.87824 8.16726 3.9375 8.02418 3.9375 7.875V2.8125H10.125V6.1875C10.125 6.33668 10.1843 6.47976 10.2898 6.58525C10.3952 6.69074 10.5383 6.75 10.6875 6.75H14.0625V15.1875H13.5C13.3508 15.1875 13.2077 15.2468 13.1023 15.3523C12.9968 15.4577 12.9375 15.6008 12.9375 15.75C12.9375 15.8992 12.9968 16.0423 13.1023 16.1477C13.2077 16.2532 13.3508 16.3125 13.5 16.3125H14.0625C14.3609 16.3125 14.647 16.194 14.858 15.983C15.069 15.772 15.1875 15.4859 15.1875 15.1875V6.1875C15.1876 6.11361 15.1731 6.04043 15.1448 5.97215C15.1166 5.90386 15.0752 5.84181 15.023 5.78953ZM11.25 3.60773L13.2673 5.625H11.25V3.60773ZM10.9603 10.1953C10.8724 10.1467 10.7731 10.1225 10.6727 10.1252C10.5723 10.1279 10.4745 10.1575 10.3894 10.2108L8.98664 11.0869C8.94751 10.8199 8.81371 10.5758 8.60965 10.3993C8.40559 10.2227 8.14485 10.1254 7.875 10.125H3.375C3.07663 10.125 2.79048 10.2435 2.5795 10.4545C2.36853 10.6655 2.25 10.9516 2.25 11.25V14.625C2.25 14.9234 2.36853 15.2095 2.5795 15.4205C2.79048 15.6315 3.07663 15.75 3.375 15.75H7.875C8.14485 15.7496 8.40559 15.6523 8.60965 15.4757C8.81371 15.2992 8.94751 15.0551 8.98664 14.7881L10.3894 15.6642C10.4745 15.7174 10.5723 15.7469 10.6727 15.7495C10.773 15.7522 10.8722 15.7279 10.9601 15.6793C11.0479 15.6306 11.1211 15.5594 11.1721 15.4729C11.223 15.3864 11.25 15.2879 11.25 15.1875V10.6875C11.25 10.5871 11.2232 10.4885 11.1723 10.4019C11.1213 10.3154 11.0481 10.244 10.9603 10.1953ZM7.875 14.625H3.375V11.25H7.875V14.625ZM10.125 14.1729L9 13.4698V12.4052L10.125 11.7021V14.1729Z" fill="#141515" />
                          </svg>
                          <span
                            style={{
                              fontFamily: 'Inter Display',
                              fontWeight: 500,
                              fontSize: 14,
                              lineHeight: '18px',
                              color: '#141515',
                            }}
                          >
                            Upload file
                          </span>
                        </button>
                      </div>
                    )}

                    {videoState === 'idle' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          alignSelf: 'stretch',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                          <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5S11.59 1.5 8 1.5zm0 12c-3.03 0-5.5-2.47-5.5-5.5S4.97 2.5 8 2.5s5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5zm.5-3.75v-3a.5.5 0 00-1 0v3a.5.5 0 001 0zM8 5.25a.625.625 0 100 1.25.625.625 0 000-1.25z" fill="#7A7468" />
                        </svg>
                        <span
                          style={{
                            fontFamily: 'Inter Display',
                            fontWeight: 400,
                            fontSize: 12,
                            lineHeight: '16px',
                            color: '#7A7468',
                          }}
                        >
                          Accepted video types: MP4, MOV, M4v, or WebM.
                        </span>
                      </div>
                    )}

                    {/* {videoError && videoState === 'idle' && (
                    <div
                      style={{
                        fontFamily: 'Inter Display',
                        fontWeight: 500,
                        fontSize: 13,
                        lineHeight: '20px',
                        color: '#B0413E',
                        alignSelf: 'stretch',
                      }}
                    >
                      Invalid file type. Please try again.
                    </div>
                  )} */}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '16px 32px 36px',
                  gap: 16,
                  width: '100%',
                  alignSelf: 'stretch',
                  boxSizing: 'border-box',
                }}
              >
                {/* Submit button */}
                <button
                  type="button"
                  onClick={onSubmitVerification}
                  disabled={!submitEnabled && !verifying}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 0,
                    alignSelf: 'stretch',
                    height: 56,
                    background: submitEnabled || verifying ? 'var(--color-brand-primary, #206E55)' : 'var(--color-border-subtle, #E5E2DA)',
                    borderRadius: 999,
                    border: 'none',
                    cursor: submitEnabled ? 'pointer' : 'not-allowed',
                  }}
                >
                  {verifying ? (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        border: '2.5px solid rgba(255,255,255,0.35)',
                        borderTopColor: '#FFFFFF',
                        borderRadius: '50%',
                        animation: 'pre-doctor-spin 0.9s linear infinite',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 16,
                        lineHeight: '20px',
                        color: submitEnabled ? '#FFFFFF' : '#A8A39A',
                      }}
                    >
                      Submit for verification
                    </span>
                  )}
                </button>

                {/* Trust */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 0,
                    gap: 4,
                    alignSelf: 'stretch',
                    height: 14,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.125 2.25l-4.125-1.5-4.125 1.5v3.563c0 3.187 2.531 5.062 3.984 5.625h.281c1.453-.563 3.984-2.438 3.984-5.625V2.25Zm-.75 3.563c0 2.625-2.063 4.171-3.375 4.687-1.312-.516-3.375-2.062-3.375-4.687V2.789l3.375-1.227L9.375 2.789v3.024Zm-1.71-2.075a.375.375 0 0 1 .045.528l-2.25 2.625a.375.375 0 0 1-.555.014L3.633 5.508a.375.375 0 1 1 .517-.544l1.05 .998 1.97-2.298a.375.375 0 0 1 .495-.077Z" fill="#A8A39A" />
                  </svg>
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: 12,
                      lineHeight: '16px',
                      color: '#A8A39A',
                    }}
                  >
                    Files are encrypted and used only for ID verification.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === 'webcam' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: 16,
            boxSizing: 'border-box',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 480,
              maxWidth: '100%',
              height: 654,
              maxHeight: 'calc(100vh - 32px)',
              borderRadius: 12,
              overflow: 'hidden',
              background: webcamState === 'ready' ? '#000000' : '#141515',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* Header (always present): back button on black bar */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '24px',
                height: 80,
                background: '#141515',
                boxSizing: 'border-box',
                flexShrink: 0,
                zIndex: 2,
              }}
            >
              <button
                type="button"
                aria-label="Back"
                onClick={closeWebcam}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: '#FFFFFF',
                  border: '1px solid #F3F1EB',
                  boxSizing: 'border-box',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4L6 8l4 4" stroke="#7A7468" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Live video — always mounted so the ref is stable, but only
                visible/usable in the 'ready' state. */}
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                position: 'absolute',
                top: 80,
                left: 0,
                right: 0,
                bottom: 146,
                width: '100%',
                height: 'calc(100% - 226px)',
                objectFit: 'cover',
                background: '#000000',
                display: webcamState === 'ready' ? 'block' : 'none',
                zIndex: 0,
              }}
            />

            {/* Body */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {webcamState === 'init' && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#A8A39A',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      border: '2.5px solid rgba(255,255,255,0.35)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'pre-doctor-spin 0.9s linear infinite',
                    }}
                  />
                </div>
              )}

              {webcamState === 'ready' && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 50px 40px',
                    gap: 24,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {/* Corner brackets framing the ID card */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 32,
                      left: 50,
                      right: 50,
                      bottom: 88,
                      pointerEvents: 'none',
                    }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderTop: '3px solid #FFFFFF', borderLeft: '3px solid #FFFFFF', borderTopLeftRadius: 12 }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 32, height: 32, borderTop: '3px solid #FFFFFF', borderRight: '3px solid #FFFFFF', borderTopRightRadius: 12 }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: 32, height: 32, borderBottom: '3px solid #FFFFFF', borderLeft: '3px solid #FFFFFF', borderBottomLeftRadius: 12 }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderBottom: '3px solid #FFFFFF', borderRight: '3px solid #FFFFFF', borderBottomRightRadius: 12 }} />
                  </div>
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: 15,
                      lineHeight: '24px',
                      color: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  >
                    Position the front of your license
                  </div>
                </div>
              )}

              {webcamState === 'denied' && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 32px',
                    gap: 16,
                    background: '#A8A39A',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 20,
                      lineHeight: '26px',
                      color: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  >
                    Camera unavailable
                  </div>
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: '20px',
                      color: '#141515',
                      textAlign: 'center',
                      maxWidth: 360,
                    }}
                  >
                    Camera access denied. Please allow camera access and try again, or upload a file instead.
                  </div>
                  <button
                    type="button"
                    onClick={closeWebcam}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '14px 40px',
                      borderRadius: 999,
                      background: '#FFFFFF',
                      color: '#141515',
                      fontWeight: 500,
                      fontSize: 16,
                      lineHeight: '20px',
                    }}
                  >
                    Go back
                  </button>
                </div>
              )}

              {webcamState === 'review' && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    background: '#141515',
                  }}
                >
                  {pendingCapturedUrl && (
                    <img
                      src={pendingCapturedUrl}
                      alt="Captured"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        borderRadius: 16,
                        background: '#333333',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {webcamState === 'ready' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 146,
                  background: '#141515',
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                <button
                  type="button"
                  aria-label="Capture"
                  onClick={capturePhoto}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    width: 72,
                    height: 72,
                    borderRadius: 999,
                    border: '4px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 999,
                      background: '#FFFFFF',
                    }}
                  />
                </button>
              </div>
            )}

            {webcamState === 'review' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 14,
                  padding: '0 25px 30px',
                  background: '#141515',
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                <button
                  type="button"
                  onClick={retakePhoto}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1,
                    height: 50,
                    borderRadius: 999,
                    border: '2px solid #7A7468',
                    color: '#FFFFFF',
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: '20px',
                    boxSizing: 'border-box',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                      d="M3 9a6 6 0 1 1 1.76 4.24"
                      stroke="#FFFFFF"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 4v5h5"
                      stroke="#FFFFFF"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Retake
                </button>
                <button
                  type="button"
                  onClick={useCapturedPhoto}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    height: 50,
                    borderRadius: 999,
                    background: '#FFFFFF',
                    color: '#141515',
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: '20px',
                    boxSizing: 'border-box',
                  }}
                >
                  Use photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'video-camera' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: 16,
            boxSizing: 'border-box',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 480,
              maxWidth: '100%',
              height: 654,
              maxHeight: 'calc(100vh - 32px)',
              borderRadius: 12,
              overflow: 'hidden',
              background: videoCamState === 'review' ? '#141515' : '#000000',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '24px',
                height: 80,
                background: '#141515',
                boxSizing: 'border-box',
                flexShrink: 0,
                zIndex: 2,
              }}
            >
              <button
                type="button"
                aria-label="Back"
                onClick={closeVideoCamera}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: '#FFFFFF',
                  border: '1px solid #F3F1EB',
                  boxSizing: 'border-box',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4L6 8l4 4" stroke="#7A7468" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Live video stream (always mounted to keep ref stable; hidden in review/denied) */}
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                position: 'absolute',
                top: 80,
                left: 0,
                right: 0,
                bottom: 146,
                width: '100%',
                height: 'calc(100% - 226px)',
                objectFit: 'cover',
                background: '#A8A39A',
                display: videoCamState === 'ready' || videoCamState === 'recording' ? 'block' : 'none',
                zIndex: 0,
              }}
            />

            {/* Body */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {videoCamState === 'init' && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#A8A39A',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      border: '2.5px solid rgba(255,255,255,0.35)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'pre-doctor-spin 0.9s linear infinite',
                    }}
                  />
                </div>
              )}

              {videoCamState === 'ready' && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px 32px',
                    gap: 16,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {/* Face guide oval */}
                  <div
                    style={{
                      width: 280,
                      height: 360,
                      borderRadius: '50%',
                      border: '3px dashed #FFFFFF',
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: 16,
                      lineHeight: '22px',
                      color: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  >
                    Center your face in the frame
                  </div>
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: '20px',
                      color: '#7A7468',
                      textAlign: 'center',
                    }}
                  >
                    Say: &quot;I confirm this consult is for me&quot;
                  </div>
                </div>
              )}

              {videoCamState === 'recording' && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '24px 0 0',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {/* Recording timer chip */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 18px',
                      borderRadius: 999,
                      background: 'rgba(20, 21, 21, 0.6)',
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: '#C0473C',
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 15,
                        lineHeight: '20px',
                        color: '#FFFFFF',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatRecordingTime(recordingSeconds)}
                    </span>
                  </div>
                </div>
              )}

              {videoCamState === 'denied' && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 32px',
                    gap: 16,
                    background: '#A8A39A',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 20,
                      lineHeight: '26px',
                      color: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  >
                    Camera unavailable
                  </div>
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: '20px',
                      color: '#141515',
                      textAlign: 'center',
                      maxWidth: 360,
                    }}
                  >
                    Camera access denied. Please allow camera access and try again, or upload a file instead.
                  </div>
                  <button
                    type="button"
                    onClick={closeVideoCamera}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '14px 40px',
                      borderRadius: 999,
                      background: '#FFFFFF',
                      color: '#141515',
                      fontWeight: 500,
                      fontSize: 16,
                      lineHeight: '20px',
                    }}
                  >
                    Go back
                  </button>
                </div>
              )}

              {videoCamState === 'review' && (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    background: '#141515',
                  }}
                >
                  {pendingVideoUrl && (
                    <video
                      src={pendingVideoUrl}
                      controls
                      playsInline
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        borderRadius: 16,
                        background: '#333333',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {videoCamState === 'ready' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 146,
                  background: '#141515',
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                <button
                  type="button"
                  aria-label="Start recording"
                  onClick={startRecording}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    width: 72,
                    height: 72,
                    borderRadius: 999,
                    border: '4px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 999,
                      background: '#C0473C',
                    }}
                  />
                </button>
              </div>
            )}

            {videoCamState === 'recording' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 146,
                  background: '#141515',
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                <button
                  type="button"
                  aria-label="Stop recording"
                  onClick={stopRecording}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    width: 72,
                    height: 72,
                    borderRadius: 999,
                    border: '4px solid #C0473C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      background: '#C0473C',
                    }}
                  />
                </button>
              </div>
            )}

            {videoCamState === 'review' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 14,
                  padding: '0 25px 30px',
                  background: '#141515',
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                <button
                  type="button"
                  onClick={retakeVideo}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1,
                    height: 50,
                    borderRadius: 999,
                    border: '2px solid #7A7468',
                    color: '#FFFFFF',
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: '20px',
                    boxSizing: 'border-box',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                      d="M3 9a6 6 0 1 1 1.76 4.24"
                      stroke="#FFFFFF"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 4v5h5"
                      stroke="#FFFFFF"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Retake
                </button>
                <button
                  type="button"
                  onClick={useCapturedVideo}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    height: 50,
                    borderRadius: 999,
                    background: '#FFFFFF',
                    color: '#141515',
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: '20px',
                    boxSizing: 'border-box',
                  }}
                >
                  Use video
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {previewOpen && capturedUrl && mode === 'idle' && (
        <div
          onClick={() => setPreviewOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}
        >
          {/\.pdf$/i.test(fileName ?? '') ? (
            <iframe
              src={capturedUrl}
              title="preview"
              onClick={(e) => e.stopPropagation()}
              style={{ width: '80vw', height: '80vh', border: 'none', borderRadius: 12, background: '#FFFFFF' }}
            />
          ) : (
            <img
              src={capturedUrl}
              alt="preview"
              style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: 12 }}
            />
          )}
        </div>
      )}

      {removeTarget && (
        <div
          onClick={() => setRemoveTarget(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              padding: '32px',
              width: 360,
              maxWidth: '100%',
              background: '#FFFFFF',
              borderRadius: 20,
              boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  fontFamily: 'Inter Display',
                  fontWeight: 500,
                  fontSize: 24,
                  lineHeight: '25px',
                  color: '#141515',
                  textAlign: 'center',
                }}
              >
                Are you sure?
              </div>
              <div
                style={{
                  fontFamily: 'Inter Display',
                  fontWeight: 400,
                  fontSize: 15,
                  lineHeight: '24px',
                  color: '#5A554A',
                  textAlign: 'center',
                  maxWidth: 260,
                }}
              >
                This file will be removed. <br />
                You can add it again if needed.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignSelf: 'stretch', marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 999,
                  background: '#fff',
                  border: '0.5px solid #E5E2DA',
                  color: '#5A554A',
                  fontFamily: 'Inter Display',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  cursor: 'pointer',
                }}
              >
                Keep file
              </button>
              <button
                type="button"
                onClick={() => {
                  if (removeTarget === 'dl') reupload();
                  else reuploadVideo();
                  setRemoveTarget(null);
                }}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 999,
                  background: '#141515',
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'Inter Display',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  cursor: 'pointer',
                }}
              >
                Yes, remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
