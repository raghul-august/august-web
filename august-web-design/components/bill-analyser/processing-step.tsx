'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBillAnalyserStore, PipelineStage } from '@/stores/bill-analyser-store';

const PIPELINE_STEPS: { stage: PipelineStage; label: string; num: string }[] = [
    { stage: 'extracting', label: 'Reading your bill', num: '1' },
    { stage: 'enriching', label: 'Checking prices', num: '2' },
    { stage: 'explaining', label: 'Explaining charges', num: '3' },
];

const TIPS = [
    'Medical bills contain errors about 80% of the time.',
    'You can negotiate medical bills even after insurance has paid.',
    'Always ask for an itemized bill. It often reveals hidden charges.',
    'Hospitals are required to provide price transparency data.',
    'You have the right to dispute any charge on your bill.',
];

interface ProcessingStepProps {
    onRefresh?: () => Promise<void>;
}

export function ProcessingStep({ onRefresh }: ProcessingStepProps) {
    const { pipelineStage, isWebview } = useBillAnalyserStore();
    const currentIndex = PIPELINE_STEPS.findIndex((s) => s.stage === pipelineStage);

    const [currentTip, setCurrentTip] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [pullY, setPullY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const touchStartY = useRef(0);
    const pulling = useRef(false);
    const THRESHOLD = 60;

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
                <h1
                    className="text-[#302e28] mb-8"
                    style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}
                >
                    Reading between the lines...
                </h1>

                {/* Horizontal stepper */}
                <div className="mb-6 flex items-start">
                    {PIPELINE_STEPS.map((step, index) => {
                        const isComplete = index < currentIndex;
                        const isActive = index === currentIndex;

                        return (
                            <div key={step.stage} className="flex-1 flex flex-col items-center text-center relative" style={{ padding: '4px 4px' }}>
                                <div className="shrink-0 flex items-center justify-center relative" style={{ width: '32px', height: '32px' }}>
                                    {isComplete ? (
                                        <div className="rounded-full flex items-center justify-center" style={{ width: '32px', height: '32px', background: '#206E55' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    ) : isActive ? (
                                        <div className="relative" style={{ width: '32px', height: '32px' }}>
                                            <div className="rounded-full w-full h-full flex items-center justify-center" style={{ border: '2px solid #206E55' }}>
                                                <div className="rounded-full" style={{ width: '10px', height: '10px', background: '#206E55' }} />
                                            </div>
                                            <div className="absolute rounded-full animate-[pulse-ring_2s_ease-in-out_infinite]" style={{ inset: '-4px', border: '1.5px solid #206E55', opacity: 0.3 }} />
                                        </div>
                                    ) : (
                                        <div className="rounded-full flex items-center justify-center" style={{ width: '32px', height: '32px', border: '1.5px solid #c8c1b5' }}>
                                            <span className="text-xs text-[#a09b93]" style={{ fontWeight: 500 }}>{step.num}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Connecting line between circles */}
                                {index < PIPELINE_STEPS.length - 1 && (
                                    <div className="absolute top-[19px] h-px" style={{ left: 'calc(50% + 20px)', right: 'calc(-50% + 20px)', background: isComplete ? '#206E55' : '#d9d3c8' }} />
                                )}
                                <div className="mt-2" style={{
                                    fontSize: isActive ? '14px' : '13px',
                                    fontWeight: isActive ? 650 : 400,
                                    color: isActive ? '#302e28' : isComplete ? '#7a756a' : '#a09b93',
                                    letterSpacing: isActive ? '-0.02em' : '0',
                                    lineHeight: 1.3,
                                }}>
                                    {step.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pull-quote style tips */}
                <div className="mt-10 px-1">
                    <div className="flex justify-center mb-4">
                        <div style={{ width: '32px', height: '2px', background: '#4d8b77', borderRadius: '1px' }} />
                    </div>
                    <div className="relative" style={{ minHeight: '80px' }}>
                        {TIPS.map((tip, i) => (
                            <div
                                key={i}
                                className="absolute top-0 left-0 right-0 transition-all duration-[400ms] ease-in-out text-center"
                                style={{
                                    opacity: i === currentTip ? 1 : 0,
                                    transform: i === currentTip ? 'translateY(0)' : 'translateY(6px)',
                                    fontSize: '17px',
                                    lineHeight: 1.5,
                                    color: '#302e28',
                                    letterSpacing: '-0.01em',
                                    fontStyle: 'italic',
                                }}
                            >
                                {tip}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-1.5 mt-[88px] justify-center">
                        {TIPS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => selectTip(i)}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: '5px',
                                    height: '5px',
                                    background: i === currentTip ? '#206E55' : '#c8c1b5',
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

            <p
                className="text-center mt-20"
                style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a756a' }}
            >
                Please keep this page open while I analyze your bill
            </p>
        </motion.div>
    );
}
