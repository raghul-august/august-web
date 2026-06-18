'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Download } from 'lucide-react';
import { useFutureSelfStore } from '@/stores/future-self-store';
import { releaseFutureSelfRun } from '@/services/future-self-service';

const IMPACT_STYLE: Record<'positive' | 'neutral' | 'negative', { dot: string; label: string }> = {
    positive: { dot: 'bg-[#3D8168]', label: 'Helping' },
    neutral: { dot: 'bg-[#C68E2A]', label: 'Neutral' },
    negative: { dot: 'bg-[#B8453C]', label: 'Aging you' },
};

export function ResultsStep() {
    const originalPreview = useFutureSelfStore((s) => s.originalPreviewDataUrl);
    const analysis = useFutureSelfStore((s) => s.analysis);
    const reset = useFutureSelfStore((s) => s.reset);

    // Release the original photo on the server when the user is "done" with
    // the result — when this component unmounts (Try again, leaving the tool,
    // tab close best-effort). Capture the runId once at mount so cleanup
    // doesn't fire after reset.
    const releasedFor = useRef<string | null>(null);
    useEffect(() => {
        const id = useFutureSelfStore.getState().runId;
        if (!id) return;
        return () => {
            if (releasedFor.current === id) return;
            releasedFor.current = id;
            releaseFutureSelfRun(id).catch(() => {});
        };
    }, []);

    if (!analysis) return null;

    const handleDownload = async () => {
        try {
            const res = await fetch(analysis.agedImageSignedUrl, { mode: 'cors' });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `future-self-${analysis.yearsProjected}y.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            window.open(analysis.agedImageSignedUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="max-w-3xl mx-auto pt-2 pb-10">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
            >
                <p className="uppercase font-medium mb-2" style={{ fontSize: '11px', letterSpacing: '0.16em', color: '#206E55' }}>
                    Lifestyle-Based Projection
                </p>
                <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#1a1a18] leading-tight" style={{ letterSpacing: '-0.02em' }}>
                    Projected appearance in {analysis.yearsProjected} years.
                </h1>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
                <FaceCard label="Today" url={originalPreview} alt="Your photo today" />
                <FaceCard label={`In ${analysis.yearsProjected} years`} url={analysis.agedImageSignedUrl} alt="Projected future self" highlight />
            </div>

            <div className="flex gap-2 mb-7">
                <button
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 h-[44px] text-[14px] font-medium rounded-full bg-[#302e28] hover:bg-[#1a1917] text-white transition-colors"
                >
                    <Download className="h-4 w-4" /> Save image
                </button>
                <button
                    onClick={reset}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 h-[44px] text-[14px] font-medium rounded-full border-[1.5px] border-[#d9d3c8] bg-[#faf8f4] hover:bg-[#f0ebe1] text-[#302e28] transition-colors"
                >
                    <RefreshCw className="h-4 w-4" /> Try again
                </button>
            </div>

            {analysis.summary && (
                <div className="rounded-2xl border border-[#d9d3c8] bg-[#faf8f4] p-5 mb-5">
                    <p className="text-[15px] text-[#1a1a18] leading-relaxed">{analysis.summary}</p>
                </div>
            )}

            {analysis.breakdown.length > 0 && (
                <div>
                    <h2 className="text-[18px] font-semibold text-[#1a1a18] mb-3" style={{ letterSpacing: '-0.01em' }}>
                        What&apos;s driving this
                    </h2>
                    <ul className="space-y-2">
                        {analysis.breakdown.map((b, i) => (
                            <li
                                key={`${b.factor}-${i}`}
                                className="flex items-start gap-3 rounded-xl border border-[#d9d3c8] bg-[#faf8f4] px-4 py-3"
                            >
                                <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${IMPACT_STYLE[b.impact].dot}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[14px] font-medium text-[#1a1a18]">{b.factor}</div>
                                        <div className="text-[11px] uppercase tracking-wider text-[#7a756a]">{IMPACT_STYLE[b.impact].label}</div>
                                    </div>
                                    <div className="text-[13px] text-[#5c5a52] leading-relaxed mt-0.5">{b.note}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <p className="mt-8 text-[12px] text-[#7a756a] leading-relaxed">
                This is an illustrative projection, not a prediction. Real aging depends on genetics, environment, and many factors beyond habits. We delete your original photo as soon as you finish viewing the result.
            </p>
        </div>
    );
}

function FaceCard({ label, url, alt, highlight }: { label: string; url?: string | null; alt: string; highlight?: boolean }) {
    const [loaded, setLoaded] = useState(false);

    // Reset loaded state when the URL changes (e.g. user runs a second projection).
    useEffect(() => { setLoaded(false); }, [url]);

    return (
        <div className={`rounded-2xl overflow-hidden border-[1.5px] ${highlight ? 'border-[#4d8b77]' : 'border-[#d9d3c8]'} bg-[#faf8f4]`}>
            <div className="aspect-[3/4] bg-[#ede8df] overflow-hidden relative">
                {url ? (
                    <>
                        {!loaded && (
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(110deg, #ede8df 8%, #f5f1e8 18%, #ede8df 33%)',
                                    backgroundSize: '200% 100%',
                                    animation: 'future-self-shimmer 1.4s linear infinite',
                                }}
                            />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt={alt}
                            loading="eager"
                            decoding="async"
                            onLoad={() => setLoaded(true)}
                            onError={() => setLoaded(true)}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                    </>
                ) : (
                    <div className="w-full h-full" />
                )}
            </div>
            <div className="px-3 py-2 text-[12px] font-medium text-[#1a1a18] flex items-center justify-between">
                <span>{label}</span>
                {highlight && (
                    <span className="text-[10px] uppercase tracking-widest font-medium text-[#206E55]">Future</span>
                )}
            </div>
            <style jsx global>{`
                @keyframes future-self-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
