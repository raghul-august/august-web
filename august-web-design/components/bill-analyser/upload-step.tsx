'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useBillAnalyserStore } from '@/stores/bill-analyser-store';
import { uploadMedia, isValidFileType } from '@/services/media-service';
import { runBillAnalysis } from '@/services/bill-analyser-service';
import { track } from '@/services/analytics-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { formatFileSize, getFileExtLabel, type UploadedFileWithSize } from '@/utils/file-helpers';

const MAX_FILES = 1;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function FilePreview({ file, onClose }: { file: UploadedFileWithSize; onClose: () => void }) {
    const isImage = file.mimeType.startsWith('image/');
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="relative max-w-2xl w-full max-h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e4dc]">
                        <span className="text-[13px] font-medium text-[#302e28] truncate">{file.fileName}</span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#7a756a] hover:bg-[#f0ece4] hover:text-[#302e28] transition-all flex-shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="overflow-auto max-h-[calc(80vh-52px)] flex items-center justify-center bg-[#f5f4f1]">
                        {isImage ? (
                            <img src={file.signedURL} alt={file.fileName} className="max-w-full max-h-[70vh] object-contain" />
                        ) : (
                            <iframe src={file.signedURL} title={file.fileName} className="w-full h-[70vh]" />
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function FileRow({ file, onRemove }: { file: UploadedFileWithSize; onRemove: () => void }) {
    const [showPreview, setShowPreview] = useState(false);
    const isImage = file.mimeType.startsWith('image/');

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="flex items-center gap-2.5 p-[10px_12px] bg-white border border-[#e0dcd2] rounded-[10px] mb-2 cursor-pointer hover:bg-[#faf9f6] transition-colors"
                onClick={() => setShowPreview(true)}
            >
                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#f0ece4] flex items-center justify-center">
                    {isImage ? (
                        <img src={file.signedURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a756a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#302e28] truncate">{file.fileName}</div>
                    <div className="text-[10px] text-[#7a756a] mt-px">
                        {getFileExtLabel(file.mimeType)} · {formatFileSize(file.fileSize)}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[#7a756a] hover:bg-[#f0ece4] hover:text-[#302e28] transition-all flex-shrink-0"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </motion.div>
            {showPreview && <FilePreview file={file} onClose={() => setShowPreview(false)} />}
        </>
    );
}

export function UploadStep() {
    const [files, setFiles] = useState<UploadedFileWithSize[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ctaError, setCtaError] = useState(false);
    const { error, reset } = useBillAnalyserStore();
    const inputRef = useRef<HTMLInputElement>(null);

    const uploadSingleFile = useCallback(async (file: File): Promise<UploadedFileWithSize | null> => {
        if (!isValidFileType(file) || file.size > MAX_FILE_SIZE) return null;
        const result = await uploadMedia(file);
        return { ...result, fileSize: file.size };
    }, []);

    const handleFileSelected = useCallback(async (file: File) => {
        if (files.length >= MAX_FILES) return;
        setUploading(true);
        try {
            const result = await uploadSingleFile(file);
            if (result) {
                setFiles((prev) => [...prev, result]);
                track('bill_analyser_file_uploaded');
            }
        } catch (err) {
            logger.error('Bill file upload failed', serializeError(err));
        } finally {
            setUploading(false);
        }
    }, [uploadSingleFile, files.length]);


    const hasFiles = files.length > 0;

    const handleSubmit = async () => {
        if (!hasFiles) {
            setCtaError(true);
            return;
        }
        setCtaError(false);
        setIsSubmitting(true);

        track('bill_analyser_pipeline_started', { fileCount: files.length });

        const fileUrls = files.map((f) => ({
            blobName: f.blobName,
            mimeType: f.mimeType,
            originalName: f.fileName,
        }));

        useBillAnalyserStore.getState().setUploadedFiles(files);

        try {
            const result = await runBillAnalysis(
                fileUrls,
                (stage) => useBillAnalyserStore.getState().setPipelineStage(stage as any),
                (runId) => useBillAnalyserStore.getState().setRunId(runId)
            );
            // only apply if polling hasn't already completed
            const state = useBillAnalyserStore.getState();
            if (state.pipelineStage !== 'complete') {
                state.setAnalysis(result);
                state.setPipelineStage('complete');
            }
            state.setRunId(null);
        } catch (err: any) {
            const currentRunId = useBillAnalyserStore.getState().runId;
            const currentStage = useBillAnalyserStore.getState().pipelineStage;
            if (currentStage === 'complete') {
                // polling already resolved it
                logger.info('Bill analyser SSE failed but polling resolved', { runId: currentRunId });
            } else if (currentRunId) {
                logger.info('Bill analyser SSE dropped, auto-polling will resume', { runId: currentRunId });
            } else {
                const raw = err?.message || '';
                let friendly = 'Something went wrong. Please try again.';
                if (raw.includes('JWT') || raw.includes('invalid signature') || raw.includes('Unauthorized')) {
                    friendly = 'Unable to start a session. Please try again in a moment.';
                } else if (raw.includes('Connection lost') || raw.includes('network')) {
                    friendly = 'Connection interrupted. Please try again.';
                }
                useBillAnalyserStore.getState().setError(friendly);
                logger.error('Bill analyser pipeline failed', serializeError(err));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const accept = 'image/jpeg,image/png,image/gif,image/webp,application/pdf';

    return (
        <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-left mb-5"
            >
                <h1
                    className="text-[#302e28]"
                    style={{
                        fontSize: 'clamp(1.5rem, 4vw, 1.85rem)',
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                    }}
                >
                    Upload Your Bill
                </h1>
                <p className="text-[14px] text-[#5c5a52] mt-2 leading-relaxed">
                    Upload your itemized medical bill and I&apos;ll do the rest.
                </p>
            </motion.div>

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
                <div
                    className={`rounded-2xl border-[1.5px] p-[18px_16px] mb-3 transition-colors ${
                        hasFiles ? 'border-[#4d8b77]/40 bg-[#4d8b77]/[0.02]' : 'border-[#e0dcd2] bg-[#faf9f6]'
                    }`}
                >
                    <div className="flex items-center gap-2 mb-3.5">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#302e28] flex items-center justify-center flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-[#302e28]">Medical Bill</div>
                            <div className="text-[11px] text-[#7a756a] mt-px">
                                {hasFiles
                                    ? `${files.length} file${files.length > 1 ? 's' : ''} added`
                                    : 'Upload a photo or PDF of your bill'}
                            </div>
                        </div>
                    </div>

                    {files.map((f, i) => (
                        <FileRow
                            key={i}
                            file={f}
                            onRemove={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        />
                    ))}

                    {files.length < MAX_FILES && (
                        <>
                            <input
                                ref={inputRef}
                                type="file"
                                accept={accept}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileSelected(file);
                                    e.target.value = '';
                                }}
                            />
                            {files.length === 0 ? (
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => inputRef.current?.click()}
                                    className="flex items-center justify-center gap-2 w-full h-14 border-2 border-dashed border-[#e0dcd2] rounded-xl bg-[#302e28]/[0.04] text-[14px] font-medium text-[#302e28] hover:border-[#302e28]/50 hover:bg-[#302e28]/[0.07] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    )}
                                    {uploading ? 'Uploading...' : 'Upload your bill'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => inputRef.current?.click()}
                                    className="flex items-center justify-center gap-1.5 w-full h-[42px] border-[1.5px] border-dashed border-[#e0dcd2] rounded-[10px] bg-transparent text-xs font-medium text-[#7a756a] transition-all hover:border-[#302e28] hover:text-[#302e28] hover:bg-[#302e28]/[0.03] disabled:opacity-60"
                                >
                                    {uploading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    )}
                                    {uploading ? 'Uploading...' : `Upload more (${files.length} of ${MAX_FILES})`}
                                </button>
                            )}
                        </>
                    )}
                    {files.length >= MAX_FILES && (
                        <div className="text-[10px] text-[#7a756a] text-right mt-1">
                            {files.length} of {MAX_FILES} files uploaded
                        </div>
                    )}
                    <p className="text-[11px] text-[#9a958b] mt-2 text-center">Accepted formats: PDF, JPG, PNG · Max 10MB per file</p>
                </div>

                <div className="mt-2">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 text-[15px] font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                            hasFiles
                                ? 'h-[52px] rounded-full bg-[#302e28] hover:bg-[#1a1917] text-white'
                                : 'h-12 rounded-xl bg-[#302e28]/60 hover:bg-[#302e28]/70 text-white/90'
                        }`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Analyze My Bill
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </>
                        )}
                    </motion.button>
                    {ctaError && !hasFiles && (
                        <p className="text-[12px] text-red-600 text-center mt-2">Please upload at least one bill to continue</p>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                className="space-y-3 mt-6 mb-6 px-2"
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-[#302e28] flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </span>
                    <span className="text-[13px] text-[#6b6860] leading-snug">Prices checked against 300M+ real hospital negotiated rates</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="text-[#302e28] flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </span>
                    <span className="text-[13px] text-[#6b6860] leading-snug">Results in about 30 seconds</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="text-[#302e28] flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </span>
                    <span className="text-[13px] text-[#6b6860] leading-snug">This is a starting point, not legal or medical advice. Always review before acting.</span>
                </div>
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
