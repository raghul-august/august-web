'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useFutureSelfStore } from '@/stores/future-self-store';
import { useAuthStore } from '@/stores/auth-store';
import { useLoginModalStore } from '@/stores/login-modal-store';
import { uploadMedia } from '@/services/media-service';
import { track } from '@/services/analytics-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';

const ease = [0.16, 1, 0.3, 1] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED = 'image/jpeg,image/png,image/webp';

function isAcceptedPhoto(file: File): boolean {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

// Downscale to a JPEG dataURL for the local "Today" preview on the results
// page. Backend deletes the original blob once the user is done, so we keep
// a local copy for the side-by-side. Sized for a sharp display on a portrait
// card up to ~600px wide on retina (≈1200 device px) — keeps it under 1.5MB
// in localStorage while still looking crisp.
async function makeLocalPreviewDataUrl(file: File, maxEdge = 1280, quality = 0.92): Promise<string | null> {
    try {
        const objectUrl = URL.createObjectURL(file);
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = reject;
            el.src = objectUrl;
        });
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { URL.revokeObjectURL(objectUrl); return null; }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        URL.revokeObjectURL(objectUrl);
        return dataUrl;
    } catch {
        return null;
    }
}

const FEATURES = [
    { num: '01', title: 'Photorealistic Projection', desc: 'Your photo, aged 10 years using a model that preserves your facial identity.' },
    { num: '02', title: 'Habit-Driven', desc: 'Sleep, sun, hydration, stress, exercise — each one shifts the result.' },
    { num: '03', title: 'Side-By-Side', desc: 'See the comparison and a short breakdown of what is driving the change.' },
];

export function LandingStep() {
    const [uploading, setUploading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const photo = useFutureSelfStore((s) => s.uploadedPhoto);
    const setUploadedPhoto = useFutureSelfStore((s) => s.setUploadedPhoto);
    const setOriginalPreviewDataUrl = useFutureSelfStore((s) => s.setOriginalPreviewDataUrl);
    const setStep = useFutureSelfStore((s) => s.setStep);
    
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const openLoginModal = useLoginModalStore((s) => s.open);

    const handleFile = useCallback(async (file: File) => {
        if (!isAcceptedPhoto(file)) {
            logger.warn('Future self: rejected file type', { type: file.type });
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            logger.warn('Future self: file too large', { size: file.size });
            return;
        }
        setUploading(true);
        try {
            const [result, previewDataUrl] = await Promise.all([
                uploadMedia(file),
                makeLocalPreviewDataUrl(file),
            ]);
            setUploadedPhoto(result);
            setOriginalPreviewDataUrl(previewDataUrl);
            track('future_self_photo_uploaded');
        } catch (err) {
            logger.error('Future self upload failed', serializeError(err));
        } finally {
            setUploading(false);
        }
    }, [setUploadedPhoto, setOriginalPreviewDataUrl]);

    const handleStart = () => {
        if (!photo) return;
        track('future_self_questionnaire_started');
        setStep('questionnaire');
    };

    const removePhoto = () => {
        setUploadedPhoto(null);
        setOriginalPreviewDataUrl(null);
    };

    return (
        <div className="max-w-5xl mx-auto px-1 pt-2 pb-6 lg:pt-12">
            <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-16 lg:items-stretch">
                <div>
                    <div className="mb-8">
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease }}
                            className="uppercase font-medium mb-3"
                            style={{ fontSize: '11px', letterSpacing: '0.16em', color: '#206E55' }}
                        >
                            Future Self
                        </motion.p>

                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.05, ease }}
                            className="text-[#1a1a18] mb-5"
                            style={{
                                fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
                                fontWeight: 700,
                                lineHeight: 1.08,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            See the <span className="italic text-[#4d8b77]">you</span>
                            <br />
                            ten years from now.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease }}
                            className="text-[#5c5a52] text-[15px] leading-relaxed max-w-md"
                        >
                            Upload a clear, well-lit photo of your face. We&apos;ll ask a few questions about your habits and project a photorealistic version of how you may look a decade from now.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15, ease }}
                        className="mb-6"
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isAuthenticated) {
                                openLoginModal();
                                return;
                            }
                            const f = e.dataTransfer.files?.[0];
                            if (f) handleFile(f);
                        }}
                    >
                        <div className={`rounded-[28px] border-[1.5px] bg-[#faf8f4] shadow-sm transition-colors ${photo ? 'border-[#4d8b77]/40' : 'border-[#d9d3c8]'}`}>
                            <input
                                ref={inputRef}
                                type="file"
                                accept={ACCEPTED}
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFile(f);
                                    e.target.value = '';
                                }}
                            />
                            <div className="sm:flex sm:items-center sm:gap-2">
                                <div className="flex-1 p-3 sm:p-4">
                                    {uploading ? (
                                        <div className="flex items-center gap-3 h-[52px] pl-[7px] pr-4 bg-[#e8e4dc] rounded-full border-[1.5px] border-[#302e28]/25">
                                            <div className="w-9 h-9 rounded-full bg-[#302e28] flex items-center justify-center flex-shrink-0">
                                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                                            </div>
                                            <div className="text-[14px] font-semibold text-[#302e28]">Uploading...</div>
                                        </div>
                                    ) : photo ? (
                                        <button
                                            type="button"
                                            onClick={() => setPreviewOpen(true)}
                                            className="flex items-center gap-2.5 h-[52px] pl-[7px] pr-4 bg-[#faf8f3] border-[1.5px] border-[#d9d3c8] rounded-full w-full text-left hover:bg-[#f5f1eb] transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#ede8df]">
                                                <img src={photo.signedURL} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-medium text-[#302e28] truncate">{photo.fileName}</div>
                                                <div className="text-[10px] text-[#7a756a] mt-px">Tap to preview</div>
                                            </div>
                                            <span
                                                role="button"
                                                tabIndex={0}
                                                onClick={(e) => { e.stopPropagation(); removePhoto(); }}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removePhoto(); } }}
                                                className="w-6 h-6 rounded-md flex items-center justify-center text-[#7a756a] hover:bg-[#ede8df] hover:text-[#302e28] transition-all flex-shrink-0"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    openLoginModal();
                                                    return;
                                                }
                                                inputRef.current?.click();
                                            }}
                                            className="flex items-center gap-3 w-full text-left rounded-full h-[52px] pl-[7px] pr-4 border-[1.5px] border-[#302e28]/25 bg-[#e8e4dc] hover:bg-[#dfd9cf] hover:border-[#302e28]/40 cursor-pointer transition-all"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-[#302e28]/15 flex items-center justify-center flex-shrink-0">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#302e28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="17 8 12 3 7 8" />
                                                    <line x1="12" y1="3" x2="12" y2="15" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[14px] font-semibold text-[#302e28] whitespace-nowrap">Your Photo</div>
                                                <div className="text-[12px] text-[#302e28]/60 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    Drop a photo or <span className="underline text-[#302e28]/80 font-medium">browse</span>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                                <div className="px-3 pb-3 sm:pb-0 sm:pr-4 sm:pl-0 flex-shrink-0">
                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleStart}
                                        disabled={!photo}
                                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 h-[52px] text-[15px] font-medium rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                                            photo
                                                ? 'bg-[#302e28] hover:bg-[#1a1917] text-white'
                                                : 'bg-[#302e28]/60 text-white/90'
                                        }`}
                                    >
                                        Continue
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-[#d9d3c8] bg-[#faf8f4] px-4 py-3">
                            <div className="text-[12px] font-medium text-[#1a1a18] mb-1.5">For best results</div>
                            <ul className="text-[12px] text-[#5c5a52] leading-relaxed space-y-0.5">
                                <li>• Face the camera directly, mouth closed, neutral expression</li>
                                <li>• Even, well-lit room — no harsh shadows</li>
                                <li>• Just one person in frame, no sunglasses or face coverings</li>
                                <li>• Original or recent photo — avoid heavy filters</li>
                            </ul>
                        </div>
                        <p className="mt-2 text-[11px] text-[#7a756a] leading-relaxed">
                            Your original photo is deleted from our servers as soon as you&apos;re done viewing the result.
                        </p>
                    </motion.div>
                </div>

                <motion.aside
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease }}
                    className="hidden lg:block self-start space-y-4"
                >
                    {FEATURES.map((f) => (
                        <div key={f.num} className="rounded-2xl border border-[#d9d3c8] bg-[#faf8f4] p-5">
                            <div className="text-[11px] font-medium tracking-widest text-[#206E55] mb-1">{f.num}</div>
                            <div className="text-[15px] font-medium text-[#1a1a18] mb-1">{f.title}</div>
                            <div className="text-[13px] text-[#5c5a52] leading-relaxed">{f.desc}</div>
                        </div>
                    ))}
                </motion.aside>
            </div>

            <AnimatePresence>
                {previewOpen && photo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onClick={() => setPreviewOpen(false)}
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
                                <span className="text-[13px] font-medium text-[#302e28] truncate">{photo.fileName}</span>
                                <button onClick={() => setPreviewOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#7a756a] hover:bg-[#ede8df]">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="overflow-auto max-h-[calc(80vh-52px)] flex items-center justify-center bg-[#f5f4f1]">
                                <img src={photo.signedURL} alt={photo.fileName} className="max-w-full max-h-[70vh] object-contain" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
