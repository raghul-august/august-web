'use client';

import { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppealStore } from '@/stores/appeal-store';
import type { PipelineStage } from '@/stores/appeal-store';
import { useAuthStore } from '@/stores/auth-store';
import { initializeAuth } from '@/services/auth-service';
import { fetchRunStatus } from '@/services/appeal-service';
import { useWebviewAuth } from '@/hooks/useWebviewAuth';
import { IntroStep } from '@/components/appeal/intro-step';
import { UploadStep } from '@/components/appeal/upload-step';
import { ProcessingStep } from '@/components/appeal/processing-step';
import { ResultsStep } from '@/components/appeal/results-step';
import { SignUpModal } from '@/components/auth';
import { useLoginModalStore } from '@/stores/login-modal-store';
import { ChatEntrySection } from '@/components/chat-entry-section';
import { useToolsStore } from '@/stores/tools-store';
import { TurnstileLoader } from '@/components/turnstile-loader';

const PROCESSING_STAGES: PipelineStage[] = ['analyzing', 'generating', 'annotating', 'documenting'];

function AppealAssistantInner() {
    const searchParams = useSearchParams();
    const isWebview = searchParams.get('source') === 'webview';

    const { pipelineStage, runId, reset, setIsWebview } = useAppealStore();
    const { isAnonymous } = useAuthStore();
    const [authReady, setAuthReady] = useState(false);
    const [showIntro, setShowIntro] = useState(() => useAppealStore.getState().pipelineStage !== 'complete');

    useEffect(() => { if (isWebview) setIsWebview(true); }, [isWebview, setIsWebview]);
    useEffect(() => { useToolsStore.getState().setLastUsedTool('insurance'); }, []);

    const isIdle = pipelineStage === 'idle' || pipelineStage === 'error';
    const isComplete = pipelineStage === 'complete';

    useEffect(() => {
        const handler = () => {
            if (PROCESSING_STAGES.includes(useAppealStore.getState().pipelineStage)) reset();
            setShowIntro(true);
            window.dispatchEvent(new Event('appeal-at-start'));
        };
        window.addEventListener('appeal-back', handler);
        return () => window.removeEventListener('appeal-back', handler);
    }, [reset]);
    const { webviewAuthReady } = useWebviewAuth(isWebview);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollFailures = useRef(0);

    useEffect(() => {
        if (isWebview) {
            if (webviewAuthReady) setAuthReady(true);
            return;
        }
        initializeAuth().finally(() => setAuthReady(true));
    }, [isWebview, webviewAuthReady]);

    const pollOnce = useCallback(async () => {
        const currentRunId = useAppealStore.getState().runId;
        if (!currentRunId) return;
        const run = await fetchRunStatus(currentRunId);
        if (!run) {
            pollFailures.current++;
            if (pollFailures.current >= 5) {
                if (pollRef.current) clearInterval(pollRef.current);
                pollRef.current = null;
                useAppealStore.getState().setError('Lost connection. Please try again.');
            }
            return;
        }
        pollFailures.current = 0;
        const store = useAppealStore.getState();
        if (run.status === 'complete' && run.patientLetter && run.physicianLetter && run.downloadTokens) {
            store.setAnnotatedLetters(run.patientLetter, run.physicianLetter);
            store.setDownloadTokens(run.downloadTokens);
            store.setPipelineStage('complete');
            store.setRunId(null);
        } else if (run.status === 'error') {
            store.setError(run.error || 'Pipeline failed');
            store.setRunId(null);
        } else if (run.status === 'processing' && run.stage) {
            store.setPipelineStage(run.stage as PipelineStage);
        }
    }, []);

    const isProcessing = PROCESSING_STAGES.includes(pipelineStage);

    useEffect(() => {
        if (!isProcessing || !runId) return;
        pollFailures.current = 0;
        pollOnce();
        pollRef.current = setInterval(pollOnce, 5000);
        return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
    }, [isProcessing, runId, pollOnce]);
    const showLoginModal = isComplete && isAnonymous && !isWebview;

    if (!authReady) return <LoadingSpinner />;

    return (
        <>
            <div className="max-w-3xl mx-auto xl:ml-[max(2rem,calc(50%-24rem))]">
                {(isIdle || (isComplete && showIntro)) && showIntro && (
                    <IntroStep onProceed={() => {
                        setShowIntro(false);
                        if (!isComplete) window.dispatchEvent(new Event('appeal-step-changed'));
                    }} />
                )}
                {isIdle && !showIntro && <UploadStep />}
                {isProcessing && <ProcessingStep onRefresh={pollOnce} />}
                {isComplete && !showIntro && <ResultsStep />}
            </div>
            {isComplete && !showIntro && !isWebview && !isAnonymous && (
                <ChatEntrySection source="appeal-assistant" />
            )}
            {showLoginModal && (
                <SignUpModal
                    onDismiss={() => useLoginModalStore.getState().close()}
                />
            )}
        </>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#4d8b77]" />
        </div>
    );
}

export default function AppealAssistantPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <TurnstileLoader />
            <AppealAssistantInner />
        </Suspense>
    );
}
