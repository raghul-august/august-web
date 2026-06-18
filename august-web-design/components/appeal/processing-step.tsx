'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppealStore, PipelineStage } from '@/stores/appeal-store';

const PIPELINE_STEPS: { stage: PipelineStage; label: string }[] = [
    { stage: 'analyzing', label: 'Analyzing your documents' },
    { stage: 'generating', label: 'Writing appeal letters' },
    { stage: 'annotating', label: 'Adding helpful annotations' },
    { stage: 'documenting', label: 'Generating PDF and DOCX' },
];

const stageOrder: PipelineStage[] = ['analyzing', 'generating', 'annotating', 'documenting'];

const TIPS = [
    'Review your letter and fill in anything in [brackets], like your date of birth or the insurer\'s mailing address.',
    'Send your appeal via certified mail with a return receipt so you have proof it arrived.',
    'Most insurers give you 180 days to appeal, but some give as few as 30. Check your denial letter for the deadline.',
    'If they deny again, you usually have the right to an external review by an independent third party.',
    'A letter from your treating physician carries significant weight in appeals.',
    'Email or bring a printed copy of the physician letter to your doctor\'s office. Most physicians are willing to help.',
    'Your doctor can fax or mail the letter to the insurer alongside your appeal, or you can include it as an attachment.',
    'Ask to speak with the office manager or patient advocate if your doctor\'s office pushes back.',
];

interface ProcessingStepProps {
    onRefresh?: () => Promise<void>;
}

export function ProcessingStep({ onRefresh }: ProcessingStepProps) {
    const { pipelineStage, isWebview } = useAppealStore();
    const currentIndex = stageOrder.indexOf(pipelineStage);

    const [currentTip, setCurrentTip] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Pull-to-refresh state
    const [pullY, setPullY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const touchStartY = useRef(0);
    const pulling = useRef(false);
    const THRESHOLD = 60;

    // Auto-rotate tips
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % TIPS.length);
        }, 5000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const selectTip = (index: number) => {
        setCurrentTip(index);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % TIPS.length);
        }, 5000);
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.currentTarget.scrollTop > 0) return;
        touchStartY.current = e.touches[0].clientY;
        pulling.current = true;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!pulling.current || refreshing) return;
        const dy = e.touches[0].clientY - touchStartY.current;
        if (dy > 0) setPullY(Math.min(dy * 0.5, 100));
    }, [refreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!pulling.current) return;
        pulling.current = false;
        if (pullY >= THRESHOLD && onRefresh && !refreshing) {
            setRefreshing(true);
            try { await onRefresh(); } finally { setRefreshing(false); }
        }
        setPullY(0);
    }, [pullY, onRefresh, refreshing]);

    return (
        <motion.div
            className="pt-8 px-5 pb-8 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ transform: isWebview ? `translateY(${pullY}px)` : undefined, transition: pulling.current ? 'none' : 'transform 0.3s ease' }}
            onTouchStart={isWebview ? handleTouchStart : undefined}
            onTouchMove={isWebview ? handleTouchMove : undefined}
            onTouchEnd={isWebview ? handleTouchEnd : undefined}
        >
            {isWebview && refreshing && (
                <div className="pb-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#7a756a] mx-auto" />
                </div>
            )}

            <div className="w-full max-w-[420px]">
                {/* Header */}
                <h1 className="text-3xl font-semibold text-[#302e28] mb-8" style={{ letterSpacing: '-0.02em' }}>
                    Generating your appeal
                </h1>

                {/* Pipeline steps */}
                <div className="mb-6">
                    {PIPELINE_STEPS.map((step, index) => {
                        const isComplete = index < currentIndex;
                        const isActive = index === currentIndex;

                        return (
                            <div
                                key={step.stage}
                                className="flex items-center gap-3 transition-all duration-500"
                                style={{
                                    padding: isActive ? '14px 4px' : '6px 4px',
                                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                {/* Indicator */}
                                <div className="shrink-0 flex items-center justify-center">
                                    {isComplete ? (
                                        <div
                                            className="rounded-full flex items-center justify-center"
                                            style={{ width: '16px', height: '16px', background: '#206E55' }}
                                        >
                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    ) : isActive ? (
                                        <div style={{ margin: '4px' }}>
                                            <div className="relative" style={{ width: '8px', height: '8px' }}>
                                                <div className="rounded-full" style={{ width: '8px', height: '8px', background: '#206E55' }} />
                                                <div
                                                    className="absolute rounded-full animate-[pulse-ring_2s_ease-in-out_infinite]"
                                                    style={{ inset: '-5px', border: '1.5px solid #206E55', opacity: 0.3 }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ margin: '5.5px' }}>
                                            <div className="rounded-full" style={{ width: '5px', height: '5px', background: '#c4c0b8' }} />
                                        </div>
                                    )}
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    {isActive ? (
                                        <div style={{ fontSize: '19px', fontWeight: 650, color: '#302e28', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                                            {step.label}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '12px', color: isComplete ? '#7a756a' : '#a09b93', lineHeight: 1.3 }}>
                                            {step.label}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tips carousel */}
                <div className="mt-10 px-1">
                    <div
                        className="mb-2.5"
                        style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#206E55', fontWeight: 600 }}
                    >
                        While you wait
                    </div>
                    <div className="relative" style={{ minHeight: '80px' }}>
                        {TIPS.map((tip, i) => (
                            <div
                                key={i}
                                className="absolute top-0 left-0 right-0 transition-all duration-500 ease-in-out"
                                style={{
                                    opacity: i === currentTip ? 1 : 0,
                                    transform: i === currentTip ? 'translateY(0)' : 'translateY(6px)',
                                    fontSize: '16px',
                                    lineHeight: 1.5,
                                    color: '#302e28',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {tip}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-1.5 mt-[88px]">
                        {TIPS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => selectTip(i)}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: '5px',
                                    height: '5px',
                                    background: i === currentTip ? '#206E55' : '#c4c0b8',
                                    transform: i === currentTip ? 'scale(1.3)' : 'scale(1)',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer notice — pinned to bottom */}
            <p
                className="text-center mt-20"
                style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a756a' }}
            >
                Please keep this page open while I process your documents
            </p>
        </motion.div>
    );
}
