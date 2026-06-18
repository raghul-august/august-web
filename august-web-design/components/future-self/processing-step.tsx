'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { useFutureSelfStore } from '@/stores/future-self-store';
import type { FutureSelfStage } from '@/types/future-self';

const STAGE_TITLE: Record<Exclude<FutureSelfStage, 'idle' | 'complete' | 'error'>, string> = {
    analyzing: 'Reading your photo',
    generating: 'Projecting your future self',
    storing: 'Finalizing your image',
};

const TIPS = [
    'Identity preservation: same eyes, same nose, same face shape — only time and habits change.',
    'Hydration, sleep, and stress show up earliest — usually around the eyes and forehead.',
    'Sun exposure compounds. Daily sunscreen often makes the biggest visible difference.',
    'Your photo is deleted from our servers as soon as you finish viewing the result.',
];

export function ProcessingStep({ onRefresh }: { onRefresh: () => void }) {
    const stage = useFutureSelfStore((s) => s.pipelineStage);
    const [tipIdx, setTipIdx] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 4500);
        return () => clearInterval(id);
    }, []);

    const order: FutureSelfStage[] = ['analyzing', 'generating', 'storing'];
    const currentIdx = useMemo(() => {
        const i = order.indexOf(stage);
        return i === -1 ? 0 : i;
    }, [stage]);

    return (
        <div className="w-full max-w-md text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-[#e5dfd2]" />
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#4d8b77] border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 text-[#4d8b77] animate-spin" />
                </div>
            </div>

            <h3 className="text-[22px] font-semibold text-[#1a1a18] mb-1" style={{ letterSpacing: '-0.02em' }}>
                {STAGE_TITLE[(stage as Exclude<FutureSelfStage, 'idle' | 'complete' | 'error'>)] || 'Working on it'}
            </h3>
            <p className="text-[13px] text-[#7a756a] mb-6">This usually takes about 20–40 seconds.</p>

            <div className="flex items-center justify-center gap-2 mb-6">
                {order.map((s, i) => (
                    <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all ${
                            i < currentIdx
                                ? 'bg-[#4d8b77] w-6'
                                : i === currentIdx
                                ? 'bg-[#4d8b77] w-10'
                                : 'bg-[#e5dfd2] w-6'
                        }`}
                    />
                ))}
            </div>

            <motion.div
                key={tipIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-[#d9d3c8] bg-[#faf8f4] px-4 py-3 text-[13px] text-[#5c5a52] leading-relaxed"
            >
                {TIPS[tipIdx]}
            </motion.div>

            <button
                onClick={onRefresh}
                className="mt-5 inline-flex items-center gap-1.5 text-[12px] text-[#7a756a] hover:text-[#302e28] transition-colors"
            >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh status
            </button>
        </div>
    );
}
