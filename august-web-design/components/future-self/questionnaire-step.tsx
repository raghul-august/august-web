'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useFutureSelfStore } from '@/stores/future-self-store';
import { runFutureSelf } from '@/services/future-self-service';
import { track } from '@/services/analytics-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import type { FutureSelfLifestyle, AlcoholFrequency, DietType, StressLevel, SkincareRoutine, FutureSelfStage } from '@/types/future-self';

type Question =
    | { key: keyof FutureSelfLifestyle; type: 'number'; label: string; help?: string; min: number; max: number; step?: number; suffix?: string }
    | { key: keyof FutureSelfLifestyle; type: 'choice'; label: string; help?: string; options: { value: any; label: string; sub?: string }[] }
    | { key: keyof FutureSelfLifestyle; type: 'boolean'; label: string; help?: string };

const QUESTIONS: Question[] = [
    {
        key: 'age', type: 'number',
        label: 'How old are you?',
        help: 'We use your age to project how you will look in 10 years.',
        min: 13, max: 80, step: 1, suffix: 'years old',
    },
    {
        key: 'waterGlassesPerDay', type: 'number',
        label: 'How many glasses of water do you drink daily?',
        help: 'A glass = ~250ml.',
        min: 0, max: 15, step: 1, suffix: 'glasses',
    },
    {
        key: 'sleepHoursPerNight', type: 'number',
        label: 'How many hours of sleep do you get on an average night?',
        min: 3, max: 12, step: 1, suffix: 'hours',
    },
    {
        key: 'alcoholFrequency', type: 'choice',
        label: 'How often do you drink alcohol?',
        options: [
            { value: 'never', label: 'Never' },
            { value: 'rarely', label: 'Rarely', sub: 'A few times a year' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'daily', label: 'Daily' },
        ] as { value: AlcoholFrequency; label: string; sub?: string }[],
    },
    {
        key: 'smokes', type: 'boolean',
        label: 'Do you smoke?',
        help: 'Cigarettes, vaping, or other tobacco.',
    },
    {
        key: 'exerciseDaysPerWeek', type: 'number',
        label: 'How many days per week do you exercise?',
        help: 'At least 20 minutes of activity that gets your heart rate up.',
        min: 0, max: 7, step: 1, suffix: 'days',
    },
    {
        key: 'diet', type: 'choice',
        label: 'How would you describe your diet?',
        options: [
            { value: 'balanced', label: 'Balanced', sub: 'Whole foods, mixed' },
            { value: 'high_protein', label: 'High protein' },
            { value: 'plant_based', label: 'Plant-based' },
            { value: 'mixed', label: 'Mixed', sub: 'A bit of everything' },
            { value: 'high_sugar', label: 'High sugar' },
            { value: 'high_processed', label: 'High processed foods' },
        ] as { value: DietType; label: string; sub?: string }[],
    },
    {
        key: 'sunscreenRegular', type: 'boolean',
        label: 'Do you use sunscreen most days?',
        help: 'SPF 30+ on exposed skin.',
    },
    {
        key: 'stressLevel', type: 'choice',
        label: 'How would you rate your average stress level?',
        options: [
            { value: 'low', label: 'Low' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'high', label: 'High' },
            { value: 'very_high', label: 'Very high' },
        ] as { value: StressLevel; label: string; sub?: string }[],
    },
    {
        key: 'skincareRoutine', type: 'choice',
        label: 'Do you follow a skincare routine?',
        options: [
            { value: 'none', label: 'None' },
            { value: 'basic', label: 'Basic', sub: 'Cleanser & moisturizer' },
            { value: 'thorough', label: 'Thorough', sub: 'Multiple steps, regular' },
        ] as { value: SkincareRoutine; label: string; sub?: string }[],
    },
    {
        key: 'outdoorMinutesPerDay', type: 'number',
        label: 'How many minutes per day do you spend outdoors?',
        min: 0, max: 480, step: 15, suffix: 'min',
    },
];

export function QuestionnaireStep() {
    const photo = useFutureSelfStore((s) => s.uploadedPhoto);
    const lifestyle = useFutureSelfStore((s) => s.lifestyle);
    const questionIndex = useFutureSelfStore((s) => s.questionIndex);
    const setQuestionIndex = useFutureSelfStore((s) => s.setQuestionIndex);
    const setLifestyle = useFutureSelfStore((s) => s.setLifestyle);
    const setStep = useFutureSelfStore((s) => s.setStep);
    const setPipelineStage = useFutureSelfStore((s) => s.setPipelineStage);
    const setRunId = useFutureSelfStore((s) => s.setRunId);
    const setAnalysis = useFutureSelfStore((s) => s.setAnalysis);
    const setError = useFutureSelfStore((s) => s.setError);

    const [submitting, setSubmitting] = useState(false);

    const total = QUESTIONS.length;
    const q = QUESTIONS[questionIndex];
    const value = (lifestyle as any)[q.key];
    const answered = q.type === 'number' || (value !== undefined && value !== null && value !== '');
    // For slider questions, use the displayed midpoint as the effective value if the user hasn't moved it yet.
    const effectiveValue = (q.type === 'number' && (value === undefined || value === null))
        ? Math.round((q.min + q.max) / 2)
        : value;

    const progress = useMemo(() => Math.round(((questionIndex) / total) * 100), [questionIndex, total]);

    const goNext = async () => {
        if (!answered) return;
        // Persist the displayed midpoint if the user never touched the slider.
        if (q.type === 'number' && (value === undefined || value === null)) {
            setLifestyle({ [q.key]: effectiveValue } as Partial<FutureSelfLifestyle>);
        }
        if (questionIndex < total - 1) {
            setQuestionIndex(questionIndex + 1);
            return;
        }
        if (!photo) return;
        setSubmitting(true);
        setStep('processing');
        setPipelineStage('analyzing');
        track('future_self_pipeline_started');

        // Read the LATEST lifestyle from the store (avoids stale closure) and fill
        // in midpoint defaults for any number questions the user never touched.
        const freshLifestyle = { ...useFutureSelfStore.getState().lifestyle } as any;
        // for (const question of QUESTIONS) {
        //     if (question.type === 'number' && (freshLifestyle[question.key] === undefined || freshLifestyle[question.key] === null)) {
        //         freshLifestyle[question.key] = Math.round((question.min + question.max) / 2);
        //     }
        // }

        try {
            const result = await runFutureSelf(
                {
                    sourceFile: { blobName: photo.blobName, mimeType: photo.mimeType },
                    lifestyle: freshLifestyle as FutureSelfLifestyle,
                },
                (stage) => setPipelineStage(stage as FutureSelfStage),
                (runId) => setRunId(runId),
            );
            // Prefetch the generated image so the results page paints instantly.
            // Fires off a background HTTP request that warms the browser cache;
            // by the time <img src=...> mounts, it's served from cache.
            if (typeof window !== 'undefined' && result?.agedImageSignedUrl) {
                const preload = new window.Image();
                preload.src = result.agedImageSignedUrl;
            }
            const state = useFutureSelfStore.getState();
            if (state.pipelineStage !== 'complete') {
                setAnalysis(result);
                setPipelineStage('complete');
            }
            // Note: keep runId set so the results page can release the source
            // photo on unmount. `reset()` clears it later.
        } catch (err: any) {
            const currentRunId = useFutureSelfStore.getState().runId;
            const currentStage = useFutureSelfStore.getState().pipelineStage;
            if (currentStage === 'complete') {
                logger.info('Future self SSE failed but polling resolved', { runId: currentRunId });
            } else if (currentRunId) {
                logger.info('Future self SSE dropped, polling will resume', { runId: currentRunId });
            } else {
                const raw = err?.message || '';
                let friendly = 'Could not generate your future self. Please try again.';
                if (raw.toLowerCase().includes('rate') || raw.toLowerCase().includes('limit')) {
                    friendly = raw;
                } else if (raw.includes('JWT') || raw.includes('Unauthorized')) {
                    friendly = 'Unable to start a session. Please try again in a moment.';
                } else if (raw.includes('Connection') || raw.includes('network')) {
                    friendly = 'Connection interrupted. Please try again.';
                }
                setError(friendly);
                logger.error('Future self pipeline failed', serializeError(err));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const setValue = (v: any) => setLifestyle({ [q.key]: v } as Partial<FutureSelfLifestyle>);

    return (
        <div className="max-w-xl mx-auto pt-2 pb-8">
            <div className="mb-6">
                <div className="flex items-center justify-between text-[12px] text-[#7a756a] mb-2">
                    <span>Question {questionIndex + 1} of {total}</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-1 rounded-full bg-[#e5dfd2] overflow-hidden">
                    <motion.div
                        className="h-full bg-[#4d8b77]"
                        initial={false}
                        animate={{ width: `${((questionIndex + (answered ? 1 : 0)) / total) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={q.key as string}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                >
                    <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#1a1a18] leading-tight mb-2" style={{ letterSpacing: '-0.02em' }}>
                        {q.label}
                    </h2>
                    {q.help && <p className="text-[13px] text-[#7a756a] mb-6">{q.help}</p>}
                    {!q.help && <div className="mb-6" />}

                    {q.type === 'number' && (
                        <NumberControl
                            value={typeof value === 'number' ? value : Math.round((q.min + q.max) / 2)}
                            min={q.min}
                            max={q.max}
                            step={q.step ?? 1}
                            suffix={q.suffix}
                            onChange={setValue}
                        />
                    )}
                    {q.type === 'choice' && (
                        <div className="space-y-2">
                            {q.options.map((opt) => {
                                const selected = value === opt.value;
                                return (
                                    <button
                                        key={String(opt.value)}
                                        onClick={() => setValue(opt.value)}
                                        className={`w-full text-left rounded-xl border-[1.5px] px-4 py-3 transition-all ${
                                            selected
                                                ? 'border-[#4d8b77] bg-[#eaf3ee]'
                                                : 'border-[#d9d3c8] bg-[#faf8f4] hover:bg-[#f0ebe1]'
                                        }`}
                                    >
                                        <div className="text-[15px] font-medium text-[#1a1a18]">{opt.label}</div>
                                        {opt.sub && <div className="text-[12px] text-[#7a756a] mt-0.5">{opt.sub}</div>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {q.type === 'boolean' && (
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { v: true, label: 'Yes' },
                                { v: false, label: 'No' },
                            ].map((opt) => {
                                const selected = value === opt.v;
                                return (
                                    <button
                                        key={String(opt.v)}
                                        onClick={() => setValue(opt.v)}
                                        className={`rounded-xl border-[1.5px] px-4 py-4 transition-all ${
                                            selected
                                                ? 'border-[#4d8b77] bg-[#eaf3ee]'
                                                : 'border-[#d9d3c8] bg-[#faf8f4] hover:bg-[#f0ebe1]'
                                        }`}
                                    >
                                        <div className="text-[15px] font-medium text-[#1a1a18]">{opt.label}</div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-end">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={goNext}
                    disabled={!answered || submitting}
                    className={`flex items-center justify-center gap-2 px-7 h-[48px] text-[15px] font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        answered ? 'bg-[#302e28] hover:bg-[#1a1917] text-white' : 'bg-[#302e28]/60 text-white/90'
                    }`}
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {questionIndex === total - 1 ? 'See my future self' : 'Next'}
                </motion.button>
            </div>
        </div>
    );
}

function NumberControl({ value, min, max, step, suffix, onChange }: {
    value: number; min: number; max: number; step: number; suffix?: string; onChange: (n: number) => void;
}) {
    const dec = () => onChange(Math.max(min, value - step));
    const inc = () => onChange(Math.min(max, value + step));
    return (
        <div className="rounded-2xl border-[1.5px] border-[#d9d3c8] bg-[#faf8f4] p-5">
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={dec}
                    className="w-12 h-12 rounded-full bg-[#ede8df] hover:bg-[#dfd9cf] text-[#302e28] text-[20px] font-medium flex items-center justify-center transition-colors"
                    aria-label="Decrease"
                >
                    −
                </button>
                <div className="flex-1 text-center">
                    <div className="text-[40px] font-semibold text-[#1a1a18] leading-none" style={{ letterSpacing: '-0.02em' }}>
                        {value}
                    </div>
                    {suffix && <div className="text-[13px] text-[#7a756a] mt-1">{suffix}</div>}
                </div>
                <button
                    onClick={inc}
                    className="w-12 h-12 rounded-full bg-[#ede8df] hover:bg-[#dfd9cf] text-[#302e28] text-[20px] font-medium flex items-center justify-center transition-colors"
                    aria-label="Increase"
                >
                    +
                </button>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="w-full mt-5 accent-[#4d8b77]"
            />
            <div className="flex justify-between text-[11px] text-[#7a756a] mt-1">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
}
