'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useBillAnalyserStore } from '@/stores/bill-analyser-store';
import { uploadMedia, isValidFileType } from '@/services/media-service';
import { runBillAnalysis } from '@/services/bill-analyser-service';
import { track } from '@/services/analytics-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { formatFileSize, getFileExtLabel, type UploadedFileWithSize } from '@/utils/file-helpers';

const ease = [0.16, 1, 0.3, 1] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const FEATURES = [
    { num: '01', title: 'Real Price Data', desc: 'Compared against more than 300M negotiated hospital rates across the US.' },
    { num: '02', title: '30-Second Analysis', desc: 'Upload a photo or PDF and get instant, line-by-line results.' },
    { num: '03', title: 'Actionable Steps', desc: 'A clear checklist of what to dispute and exactly how to do it.' },
];


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
                    className="relative max-w-2xl w-full max-h-[80vh] bg-[#faf8f3] rounded-2xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#d9d3c8]">
                        <span className="text-[13px] font-medium text-[#302e28] truncate">{file.fileName}</span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#7a756a] hover:bg-[#ede8df] hover:text-[#302e28] transition-all flex-shrink-0"
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
                className="flex items-center gap-2.5 h-[52px] pl-[7px] pr-4 bg-[#faf8f3] border-[1.5px] border-[#d9d3c8] rounded-full cursor-pointer hover:bg-[#f5f1eb] transition-colors"
                onClick={() => setShowPreview(true)}
            >
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#ede8df] flex items-center justify-center">
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
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[#7a756a] hover:bg-[#ede8df] hover:text-[#302e28] transition-all flex-shrink-0"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </motion.div>
            {showPreview && <FilePreview file={file} onClose={() => setShowPreview(false)} />}
        </>
    );
}

export function LandingStep() {
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
        if (files.length >= 1) return;
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
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-6 lg:pt-16">
            <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-16 lg:items-stretch">
                {/* Left column: Hero + Upload bar + Image */}
                <div>
                    <div className="mb-8">
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease }}
                            className="uppercase font-medium mb-3"
                            style={{ fontSize: '11px', letterSpacing: '0.16em', color: '#206E55' }}
                        >
                            Medical Bill Analyser
                        </motion.p>

                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.05, ease }}
                            className="text-[#1a1a18] mb-5"
                            style={{
                                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                fontWeight: 700,
                                lineHeight: 1.08,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            Know what you
                            <br />
                            <span className="italic text-[#4d8b77]">really</span> owe.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease }}
                            className="text-[#5c5a52] text-[15px] leading-relaxed max-w-md"
                        >
                            Upload your bill and I&apos;ll compare every line item against more than 300M real hospital prices to find what you may be overpaying.
                        </motion.p>
                    </div>

                    {/* Upload bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15, ease }}
                        className="mb-6"
                    >
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center justify-between mb-3"
                            >
                                <span>{error}</span>
                                <button onClick={reset} className="text-red-500 hover:text-red-700 ml-2">
                                    <X className="h-4 w-4" />
                                </button>
                            </motion.div>
                        )}

                        <div className={`rounded-[28px] border-[1.5px] bg-[#faf8f4] shadow-sm transition-colors ${hasFiles ? 'border-[#4d8b77]/40' : 'border-[#d9d3c8]'}`}>
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

                            <div className="sm:flex sm:items-center">
                                <div className="flex-1 p-3 sm:p-4">
                                    {uploading ? (
                                        <div className="flex items-center gap-3 h-[52px] pl-[7px] pr-4 bg-[#e8e4dc] rounded-full border-[1.5px] border-[#302e28]/25">
                                            <div className="w-9 h-9 rounded-full bg-[#302e28] flex items-center justify-center flex-shrink-0">
                                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                                            </div>
                                            <div className="text-[14px] font-semibold text-[#302e28]">Uploading...</div>
                                        </div>
                                    ) : hasFiles ? (
                                        <FileRow
                                            file={files[0]}
                                            onRemove={() => setFiles([])}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => inputRef.current?.click()}
                                            className="flex items-center gap-3 w-full text-left rounded-full h-[52px] pl-[7px] pr-4 border-[1.5px] border-[#302e28]/25 bg-[#e8e4dc] hover:bg-[#dfd9cf] hover:border-[#302e28]/40 cursor-pointer transition-all"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-[#302e28]/15 flex items-center justify-center flex-shrink-0">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#302e28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="17 8 12 3 7 8" />
                                                    <line x1="12" y1="3" x2="12" y2="15" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-[14px] font-semibold text-[#302e28]">Your Bill</div>
                                                <div className="text-[12px] text-[#302e28]/60">
                                                    Drop a file or <span className="underline text-[#302e28]/80 font-medium">browse</span>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </div>

                                <div className="px-3 pb-3 sm:pb-0 sm:pr-4 sm:pl-0">
                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-[48px] text-[15px] font-medium rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                                            hasFiles
                                                ? 'bg-[#302e28] hover:bg-[#1a1917] text-white'
                                                : 'bg-[#302e28]/60 text-white/90'
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
                                </div>
                            </div>

                            {ctaError && !hasFiles && (
                                <p className="text-[12px] text-red-600 text-center pb-3">Please upload at least one bill to continue</p>
                            )}

                            <div className="border-t border-[#d9d3c8] px-4 py-2">
                                <p className="text-[11px] text-[#9a958b] text-center">PDF, JPG, PNG · Max 10MB</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hero image */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease }}
                        className="relative rounded-[28px] overflow-hidden h-[200px] lg:h-[260px]"
                    >
                        <Image
                            src="/bill-analyser-bg.png"
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 680px"
                            quality={90}
                            priority
                            className="object-cover object-top"
                        />
                    </motion.div>
                </div>

                {/* Right column: Features + Trust */}
                <div className="mt-8 lg:mt-2 lg:flex lg:flex-col">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25, ease }}
                        className="mb-8"
                    >
                        <div className="space-y-0">
                            {FEATURES.map((f, i) => (
                                <div key={f.num} className={`py-4 ${i > 0 ? 'border-t border-[#d9d3c8]' : ''}`}>
                                    <div className="text-[24px] font-light text-[#4d8b77] mb-2" style={{ letterSpacing: '-0.01em' }}>
                                        {f.num}
                                    </div>
                                    <div className="text-[14px] font-semibold text-[#302e28] mb-1">{f.title}</div>
                                    <div className="text-[12px] text-[#7a756a] leading-relaxed">{f.desc}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="hidden lg:block lg:flex-1" />

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.45 }}
                        className="text-[#7a756a]"
                        style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    >
                        Free to use &middot; Tailored for you
                    </motion.p>
                </div>
            </div>
        </div>
    );
}
