'use client';

import { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useFutureSelfStore } from '@/stores/future-self-store';
import { useAuthStore } from '@/stores/auth-store';
import { initializeAuth } from '@/services/auth-service';
import { fetchFutureSelfRunStatus } from '@/services/future-self-service';
import { useWebviewAuth } from '@/hooks/useWebviewAuth';
import { LandingStep } from '@/components/future-self/landing-step';
import { QuestionnaireStep } from '@/components/future-self/questionnaire-step';
import { ProcessingStep } from '@/components/future-self/processing-step';
import { ResultsStep } from '@/components/future-self/results-step';
import { TurnstileLoader } from '@/components/turnstile-loader';
import type { FutureSelfStage } from '@/types/future-self';

const PROCESSING_STAGES: FutureSelfStage[] = ['analyzing', 'generating', 'storing'];

function FutureSelfInner() {
    const searchParams = useSearchParams();
    const isWebview = searchParams.get('source') === 'webview';

    const { step, pipelineStage, runId, analysis, setIsWebview, setStep, setPipelineStage, setAnalysis, setError, setRunId } = useFutureSelfStore();
    const [authReady, setAuthReady] = useState(false);

    const isProcessing = PROCESSING_STAGES.includes(pipelineStage);
    const isComplete = pipelineStage === 'complete';
    const isError = pipelineStage === 'error';

    useEffect(() => { if (isWebview) setIsWebview(true); }, [isWebview, setIsWebview]);

    const { webviewAuthReady } = useWebviewAuth(isWebview, 'future-self');

    useEffect(() => {
        if (isWebview) {
            if (webviewAuthReady) setAuthReady(true);
            return;
        }
        initializeAuth().finally(() => setAuthReady(true));
    }, [isWebview, webviewAuthReady]);

    // Drive the visible step from pipeline state.
    useEffect(() => {
        if (isProcessing) setStep('processing');
        else if (isComplete) setStep('results');
    }, [isProcessing, isComplete, setStep]);

    // Polling fallback while SSE is in flight.
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollFailures = useRef(0);

    const pollOnce = useCallback(async () => {
        const currentRunId = useFutureSelfStore.getState().runId;
        if (!currentRunId) return;
        const run = await fetchFutureSelfRunStatus(currentRunId);
        if (!run) {
            pollFailures.current++;
            if (pollFailures.current >= 5) {
                if (pollRef.current) clearInterval(pollRef.current);
                pollRef.current = null;
                setError('Lost connection. Please try again.');
            }
            return;
        }
        pollFailures.current = 0;
        if (run.status === 'complete' && run.result) {
            if (typeof window !== 'undefined' && run.result.agedImageSignedUrl) {
                const preload = new window.Image();
                preload.src = run.result.agedImageSignedUrl;
            }
            setAnalysis(run.result);
            setPipelineStage('complete');
            // Keep runId so results page can release the source photo on unmount.
        } else if (run.status === 'error') {
            setError(run.error || 'Pipeline failed');
            setRunId(null);
        } else if (run.status === 'processing' && run.stage) {
            setPipelineStage(run.stage as FutureSelfStage);
        }
    }, [setAnalysis, setPipelineStage, setError, setRunId]);

    const needsPolling = (isProcessing || (isComplete && !analysis)) && !!runId;
    useEffect(() => {
        if (!needsPolling) return;
        pollFailures.current = 0;
        pollOnce();
        pollRef.current = setInterval(pollOnce, 5000);
        return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
    }, [needsPolling, pollOnce]);

    if (!authReady) return <LoadingSpinner />;

    return (
        <div className="max-w-3xl mx-auto px-5 pt-6 pb-10 lg:pt-10">
            {step === 'landing' && <LandingStep />}
            {step === 'questionnaire' && <QuestionnaireStep />}
            {step === 'processing' && (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <ProcessingStep onRefresh={pollOnce} />
                </div>
            )}
            {step === 'results' && analysis && <ResultsStep />}
            {isError && (
                <div className="max-w-lg mx-auto px-4 pt-8 pb-8 text-center">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 mb-4">
                        <p className="text-[15px] text-red-700 mb-4">
                            {useFutureSelfStore.getState().error || 'Something went wrong. Please try again.'}
                        </p>
                        <button
                            onClick={() => useFutureSelfStore.getState().reset()}
                            className="h-10 px-6 rounded-full bg-[#302e28] text-white text-[14px] font-medium hover:bg-[#1a1917] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#4d8b77]" />
        </div>
    );
}

export default function FutureSelfPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <TurnstileLoader />
            <FutureSelfInner />
        </Suspense>
    );
}
