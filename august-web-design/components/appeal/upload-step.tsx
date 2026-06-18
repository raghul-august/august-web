'use client';

import { useState, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useAppealStore } from '@/stores/appeal-store';
import { uploadMedia, UploadedFile, isValidFileType } from '@/services/media-service';
import { runPipeline } from '@/services/appeal-service';
import { track } from '@/services/analytics-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { formatFileSize, getFileExtLabel, type UploadedFileWithSize } from '@/utils/file-helpers';

const MAX_CLINICAL_FILES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB


function UploadButton({
    label,
    accept,
    uploading,
    onFileSelected,
    primary = false,
}: {
    label: string;
    accept: string;
    uploading: boolean;
    onFileSelected: (file: File) => void;
    primary?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const iconSize = primary ? 18 : 16;
    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileSelected(file);
                    e.target.value = '';
                }}
            />
            <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className={`flex items-center justify-center gap-2 w-full border-dashed transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    primary
                        ? 'h-14 border-2 border-[#302e28]/30 rounded-xl bg-[#302e28]/[0.04] text-[14px] font-medium text-[#302e28] hover:border-[#302e28]/50 hover:bg-[#302e28]/[0.07]'
                        : 'h-11 border-[1.5px] border-[#e0dcd2] rounded-[10px] bg-transparent text-[13px] font-medium text-[#6b6860] hover:border-[#302e28] hover:bg-[#302e28]/[0.04] hover:text-[#302e28]'
                }`}
            >
                {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                )}
                {uploading ? 'Uploading...' : label}
            </button>
        </>
    );
}

function FileRow({
    file,
    onRemove,
}: {
    file: UploadedFileWithSize;
    onRemove: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex items-center gap-2.5 p-[10px_12px] bg-white border border-[#e8e4dc] rounded-[10px] mb-2"
        >
            <div className="w-2 h-2 rounded-full bg-[#4d8b77] flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[#302e28] truncate">{file.fileName}</div>
                <div className="text-[10px] text-[#7a756a] mt-px">
                    {getFileExtLabel(file.mimeType)} -- {formatFileSize(file.fileSize)}
                </div>
            </div>
            <button
                type="button"
                onClick={onRemove}
                className="w-6 h-6 rounded-md flex items-center justify-center text-[#7a756a] hover:bg-[#f0ece4] hover:text-[#302e28] transition-all flex-shrink-0"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </motion.div>
    );
}

function AddMoreBox({
    count,
    max,
    accept,
    onFileSelected,
}: {
    count: number;
    max: number;
    accept: string;
    onFileSelected: (file: File) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileSelected(file);
                    e.target.value = '';
                }}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 w-full h-[42px] border-[1.5px] border-dashed border-[#e0dcd2] rounded-[10px] bg-transparent text-xs font-medium text-[#7a756a] transition-all hover:border-[#302e28] hover:text-[#302e28] hover:bg-[#302e28]/[0.03]"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Upload more ({count} of {max})
            </button>
        </>
    );
}

function TrustIndicator({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="text-[#302e28] flex-shrink-0">{icon}</span>
            <span className="text-[13px] text-[#6b6860] leading-snug">{text}</span>
        </div>
    );
}

export function UploadStep() {
    const [denialText, setDenialText] = useState('');
    const [clinicalText, setClinicalText] = useState('');
    const [showDenialPaste, setShowDenialPaste] = useState(false);
    const [showClinicalPaste, setShowClinicalPaste] = useState(false);
    const [denialFile, setDenialFile] = useState<UploadedFileWithSize | null>(null);
    const [clinicalFiles, setClinicalFiles] = useState<UploadedFileWithSize[]>([]);
    const [denialUploading, setDenialUploading] = useState(false);
    const [clinicalUploading, setClinicalUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ctaError, setCtaError] = useState(false);
    const { error, reset } = useAppealStore();

    const uploadSingleFile = useCallback(async (file: File): Promise<UploadedFileWithSize | null> => {
        if (!isValidFileType(file) || file.size > MAX_FILE_SIZE) return null;
        const result = await uploadMedia(file);
        return { ...result, fileSize: file.size };
    }, []);

    const handleDenialFile = useCallback(async (file: File) => {
        flushSync(() => setDenialUploading(true));
        try {
            const result = await uploadSingleFile(file);
            if (result) {
                setDenialFile(result);
                track('appeal_denial_uploaded');
            }
        } catch (err) {
            logger.error('Denial file upload failed', serializeError(err));
        } finally {
            setDenialUploading(false);
        }
    }, [uploadSingleFile]);

    const handleClinicalFile = useCallback(async (file: File) => {
        if (clinicalFiles.length >= MAX_CLINICAL_FILES) return;
        flushSync(() => setClinicalUploading(true));
        try {
            const result = await uploadSingleFile(file);
            if (result) {
                setClinicalFiles((prev) => [...prev, result]);
                track('appeal_clinical_uploaded');
            }
        } catch (err) {
            logger.error('Clinical file upload failed', serializeError(err));
        } finally {
            setClinicalUploading(false);
        }
    }, [uploadSingleFile, clinicalFiles.length]);

    const hasDenialInput = !!denialFile || denialText.trim().length > 0;

    const handleSubmit = async () => {
        if (!hasDenialInput) {
            setCtaError(true);
            return;
        }
        setCtaError(false);
        setIsSubmitting(true);

        const allFiles: UploadedFile[] = denialFile
            ? [denialFile, ...clinicalFiles]
            : [...clinicalFiles];

        track('appeal_pipeline_started', {
            fileCount: allFiles.length,
            hasPastedText: denialText.trim().length > 0,
        });

        const fileUrls = allFiles.map((f) => ({
            blobName: f.blobName,
            mimeType: f.mimeType,
            originalName: f.fileName,
        }));

        useAppealStore.getState().setUploadedFiles(allFiles);

        const pastedDenialText = denialText.trim() || undefined;
        const pastedClinicalText = clinicalText.trim() || undefined;

        try {
            const result = await runPipeline(
                fileUrls,
                (stage) => useAppealStore.getState().setPipelineStage(stage),
                pastedDenialText,
                pastedClinicalText,
                (runId) => useAppealStore.getState().setRunId(runId)
            );
            const state = useAppealStore.getState();
            state.setAnnotatedLetters(result.patientLetter, result.physicianLetter);
            state.setDownloadTokens(result.downloadTokens);
            state.setPipelineStage('complete');
            state.setRunId(null);
        } catch (err: any) {
            const currentRunId = useAppealStore.getState().runId;
            if (currentRunId) {
                logger.info('Appeal SSE dropped, auto-polling will resume', { runId: currentRunId });
            } else {
                const raw = err?.message || '';
                let friendly = 'Something went wrong. Please try again.';
                if (raw.includes('JWT') || raw.includes('invalid signature') || raw.includes('Unauthorized')) {
                    friendly = 'Unable to start a session. Please try again in a moment.';
                } else if (raw.includes('Connection lost') || raw.includes('network')) {
                    friendly = 'Connection interrupted. Please try again.';
                }
                useAppealStore.getState().setError(friendly);
                logger.error('Appeal pipeline failed', serializeError(err));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const accept = 'image/jpeg,image/png,image/gif,image/webp,application/pdf';

    return (
        <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-left mb-5"
            >
                <h1
                    className="font-semibold text-[#302e28]"
                    style={{
                        fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                    }}
                >
                    Upload Your Documents
                </h1>
            </motion.div>

            {/* Error banner */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center justify-between mb-5"
                >
                    <span>{error}</span>
                    <button onClick={reset} className="text-red-500 hover:text-red-700 ml-2">
                        <X className="h-4 w-4" />
                    </button>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            >
                {/* Section 1: Denial Letter — primary action */}
                <div
                    className={`rounded-2xl border-[1.5px] p-[18px_16px] mb-3 transition-colors ${
                        hasDenialInput ? 'border-[#4d8b77]/40 bg-[#4d8b77]/[0.02]' : 'border-[#302e28]/30 bg-[#faf9f6]'
                    }`}
                >
                    <div className="flex items-center gap-2 mb-3.5">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#302e28] flex items-center justify-center flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-[#302e28]">Denial Letter</div>
                            <div className="text-[11px] text-[#7a756a] mt-px">The letter from your insurance</div>
                        </div>
                        <span className="text-[10px] font-medium text-[#302e28] bg-[#302e28]/10 px-2 py-0.5 rounded-full ml-auto">
                            Required
                        </span>
                    </div>

                    {denialFile ? (
                        <FileRow file={denialFile} onRemove={() => setDenialFile(null)} />
                    ) : (
                        <>
                            <UploadButton
                                label="Upload denial letter"
                                accept={accept}
                                uploading={denialUploading}
                                onFileSelected={handleDenialFile}
                                primary
                            />
                            <p className="text-[11px] text-[#9a958b] mt-2 text-center">Accepted formats: PDF, JPG, PNG &nbsp;--&nbsp; A clear photo works too</p>
                        </>
                    )}
                    {!showDenialPaste && !denialText && (
                        <button
                            type="button"
                            onClick={() => setShowDenialPaste(true)}
                            className="text-[11px] font-semibold text-[#9a958b] hover:text-[#6b6860] transition-colors mt-2 w-full text-center"
                        >
                            Prefer to paste text instead?
                        </button>
                    )}
                    {(showDenialPaste || denialText) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                            className="mt-3 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-medium text-[#7a756a]">Paste text</span>
                                <button
                                    type="button"
                                    onClick={() => { setShowDenialPaste(false); setDenialText(''); }}
                                    className="w-5 h-5 rounded flex items-center justify-center text-[#9a958b] hover:text-[#302e28] hover:bg-[#f0ece4] transition-all"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <textarea
                                value={denialText}
                                onChange={(e) => setDenialText(e.target.value)}
                                placeholder="Paste the text from your denial letter here..."
                                className="w-full border-[1.5px] border-[#e0dcd2] rounded-[10px] p-[10px_12px] text-[13px] text-[#302e28] placeholder-[#b5b0a5] resize-none bg-white focus:border-[#302e28] focus:outline-none transition-colors min-h-[90px]"
                                style={{ fontFamily: 'inherit' }}
                            />
                        </motion.div>
                    )}
                </div>

                {/* Section 2: Strengthen your appeal */}
                <div
                    className={`rounded-2xl border-[1.5px] p-[18px_16px] mb-3 transition-colors ${
                        clinicalFiles.length > 0 ? 'border-[#4d8b77]/40 bg-[#4d8b77]/[0.02]' : 'border-[#e0dcd2] bg-[#faf9f6]'
                    }`}
                >
                    <div className="flex items-center gap-2 mb-3.5">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#302e28]/10 flex items-center justify-center flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#302e28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-[#302e28]">Strengthen your appeal</div>
                            <div className="text-[11px] text-[#7a756a] mt-px">
                                {clinicalFiles.length > 0
                                    ? `${clinicalFiles.length} file${clinicalFiles.length > 1 ? 's' : ''} added`
                                    : 'Adding lab results or doctor notes may improve approval chances'}
                            </div>
                        </div>
                        <span className="text-[10px] font-medium text-[#7a756a] bg-[#f0ece4] px-2 py-0.5 rounded-full ml-auto">
                            Optional
                        </span>
                    </div>

                    {clinicalFiles.map((f, i) => (
                        <FileRow
                            key={i}
                            file={f}
                            onRemove={() => setClinicalFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        />
                    ))}
                    {clinicalFiles.length === 0 && (
                        <UploadButton
                            label="Upload supporting documents"
                            accept={accept}
                            uploading={clinicalUploading}
                            onFileSelected={handleClinicalFile}
                            primary
                        />
                    )}
                    {clinicalFiles.length > 0 && clinicalFiles.length < MAX_CLINICAL_FILES && (
                        <AddMoreBox
                            count={clinicalFiles.length}
                            max={MAX_CLINICAL_FILES}
                            accept={accept}
                            onFileSelected={handleClinicalFile}
                        />
                    )}
                    {clinicalFiles.length >= MAX_CLINICAL_FILES && (
                        <div className="text-[10px] text-[#7a756a] text-right mt-1">
                            {clinicalFiles.length} of {MAX_CLINICAL_FILES} files uploaded
                        </div>
                    )}
                    {!showClinicalPaste && !clinicalText && (
                        <button
                            type="button"
                            onClick={() => setShowClinicalPaste(true)}
                            className="text-[11px] font-semibold text-[#9a958b] hover:text-[#6b6860] transition-colors mt-2 w-full text-center"
                        >
                            Prefer to paste text instead?
                        </button>
                    )}
                    {(showClinicalPaste || clinicalText) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                            className="mt-3 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-medium text-[#7a756a]">Paste text</span>
                                <button
                                    type="button"
                                    onClick={() => { setShowClinicalPaste(false); setClinicalText(''); }}
                                    className="w-5 h-5 rounded flex items-center justify-center text-[#9a958b] hover:text-[#302e28] hover:bg-[#f0ece4] transition-all"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <textarea
                                value={clinicalText}
                                onChange={(e) => setClinicalText(e.target.value)}
                                placeholder="Paste clinical notes, lab reports, or other medical information..."
                                className="w-full border-[1.5px] border-[#e0dcd2] rounded-[10px] p-[10px_12px] text-[13px] text-[#302e28] placeholder-[#b5b0a5] resize-none bg-white focus:border-[#302e28] focus:outline-none transition-colors min-h-[90px]"
                                style={{ fontFamily: 'inherit' }}
                            />
                        </motion.div>
                    )}
                </div>

                {/* CTA */}
                <div className="mt-2">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 text-[15px] font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                            hasDenialInput
                                ? 'h-[52px] rounded-full bg-[#302e28] hover:bg-[#1a1917] text-white'
                                : 'h-12 rounded-xl bg-[#302e28]/60 hover:bg-[#302e28]/70 text-white/90'
                        }`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Start My Appeal
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </>
                        )}
                    </motion.button>
                    {ctaError && !hasDenialInput && (
                        <p className="text-[12px] text-red-600 text-center mt-2">Please upload or paste your denial letter to continue</p>
                    )}
                </div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                className="space-y-3 mt-6 mb-6 px-2"
            >
                <TrustIndicator
                    icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    }
                    text="Built on appeal strategies used by patient advocates and healthcare attorneys"
                />
                <TrustIndicator
                    icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    }
                    text="Evidence-based and personalized, takes about 2 minutes"
                />
                <TrustIndicator
                    icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    }
                    text="This is a starting point, not legal or medical advice. Always review before sending."
                />
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="text-center text-[#7a756a]"
                style={{
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}
            >
                Free to use &middot; Tailored for you
            </motion.p>
        </div>
    );
}
