'use client';

import { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useBillAnalyserStore } from '@/stores/bill-analyser-store';
import type { PipelineStage } from '@/stores/bill-analyser-store';
import { useAuthStore } from '@/stores/auth-store';
import { initializeAuth } from '@/services/auth-service';
import { fetchRunStatus } from '@/services/bill-analyser-service';
import { useWebviewAuth } from '@/hooks/useWebviewAuth';
import { LandingStep } from '@/components/bill-analyser/intro-step';
import { ProcessingStep } from '@/components/bill-analyser/processing-step';
import { ResultsStep } from '@/components/bill-analyser/results-step';
import { ItemDetail } from '@/components/bill-analyser/item-detail';
import { RecapStep } from '@/components/bill-analyser/recap-step';
import { SignUpModal } from '@/components/auth';
import { useLoginModalStore } from '@/stores/login-modal-store';
import { ChatEntrySection } from '@/components/chat-entry-section';
import { useToolsStore } from '@/stores/tools-store';
import { DocumentStage } from '@/components/bill-analyser/document-stage';
import { TurnstileLoader } from '@/components/turnstile-loader';

const PROCESSING_STAGES: PipelineStage[] = ['extracting', 'enriching', 'explaining'];

function BillAnalyserInner() {
    const searchParams = useSearchParams();
    const isWebview = searchParams.get('source') === 'webview';

    const { pipelineStage, runId, selectedItemIndex, introSeen, analysis, uploadedFiles, reset, setIsWebview, setIntroSeen, setActiveSubView } = useBillAnalyserStore();
    const { isAnonymous } = useAuthStore();
    const [authReady, setAuthReady] = useState(false);
    const [showRecap, setShowRecap] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);

    const isIdle = pipelineStage === 'idle';
    const isComplete = pipelineStage === 'complete';
    const isError = pipelineStage === 'error';
    const isProcessing = PROCESSING_STAGES.includes(pipelineStage);

    const firstFile = uploadedFiles[0] || null;
    const fileUrl = firstFile?.signedURL || null;
    const fileMimeType = firstFile?.mimeType || null;

    useEffect(() => { if (isWebview) setIsWebview(true); }, [isWebview, setIsWebview]);
    useEffect(() => { useToolsStore.getState().setLastUsedTool('bill-analyser'); }, []);

    useEffect(() => { setActiveSubView(showRecap ? 'recap' : showPdfModal ? 'pdf' : null); }, [showRecap, showPdfModal, setActiveSubView]);

    useEffect(() => {
        const handler = () => {
            const store = useBillAnalyserStore.getState();
            if (store.activeSubView === 'pdf') { setShowPdfModal(false); return; }
            if (store.activeSubView === 'draft') { window.dispatchEvent(new Event('bill-analyser-close-draft')); return; }
            if (store.activeSubView === 'recap') { setShowRecap(false); return; }
            if (PROCESSING_STAGES.includes(store.pipelineStage)) reset();
            setIntroSeen(false);
            window.dispatchEvent(new Event('bill-analyser-at-start'));
        };
        window.addEventListener('bill-analyser-back', handler);
        return () => window.removeEventListener('bill-analyser-back', handler);
    }, [reset, setIntroSeen]);


    const { webviewAuthReady } = useWebviewAuth(isWebview, 'bill-analyser');
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
        const currentRunId = useBillAnalyserStore.getState().runId;
        if (!currentRunId) return;
        const run = await fetchRunStatus(currentRunId);
        if (!run) {
            pollFailures.current++;
            if (pollFailures.current >= 5) {
                if (pollRef.current) clearInterval(pollRef.current);
                pollRef.current = null;
                useBillAnalyserStore.getState().setError('Lost connection. Please try again.');
            }
            return;
        }
        pollFailures.current = 0;
        const store = useBillAnalyserStore.getState();
        if (run.status === 'complete' && run.result) {
            store.setAnalysis(run.result);
            store.setPipelineStage('complete');
            store.setRunId(null);
        } else if (run.status === 'error') {
            store.setError(run.error || 'Pipeline failed');
            store.setRunId(null);
        } else if (run.status === 'processing' && run.stage) {
            store.setPipelineStage(run.stage as PipelineStage);
        }
    }, []);


    const needsPolling = (isProcessing || (isComplete && !analysis)) && !!runId;
    useEffect(() => {
        if (!needsPolling) return;
        pollFailures.current = 0;
        pollOnce();
        pollRef.current = setInterval(pollOnce, 5000);
        return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
    }, [needsPolling, pollOnce]);

    useEffect(() => {
        window.dispatchEvent(new Event('bill-analyser-step-changed'));
    }, [pipelineStage]);

    const showLoginModal = isComplete && isAnonymous && !isWebview;

    if (!authReady) return <LoadingSpinner />;

    const hasFile = fileUrl && fileMimeType;

    const loginModalEl = showLoginModal && (
        <SignUpModal
            onDismiss={() => useLoginModalStore.getState().close()}
        />
    );

    const showChatEntry = isComplete && !isWebview && !isAnonymous && !showRecap && !showPdfModal;

    // PDF view — full screen, layout back button handles navigation
    if (isComplete && showPdfModal && hasFile) {
        return <DocumentStage fileUrl={fileUrl} mimeType={fileMimeType!} />;
    }

    // Results view — dashboard layout on desktop, single column on mobile
    if (isComplete && !showRecap) {
        return (
            <>
                {selectedItemIndex !== null && <ItemDetail />}
                <ResultsStep
                    onShowRecap={() => setShowRecap(true)}
                    onViewPdf={hasFile ? () => setShowPdfModal(true) : undefined}
                />
                {showChatEntry && <ChatEntrySection source="bill-analyser" />}
                {loginModalEl}
            </>
        );
    }

    // Recap view
    if (isComplete && showRecap) {
        return (
            <>
                {selectedItemIndex !== null && <ItemDetail />}
                <RecapStep onBack={() => setShowRecap(false)} />
                {loginModalEl}
            </>
        );
    }

    return (
        <div className={isIdle ? '' : 'max-w-3xl mx-auto xl:ml-[max(2rem,calc(50%-24rem))]'}>
            <div>
                {isIdle && <LandingStep />}
                {isProcessing && (
                    <div className="min-h-[60vh] flex items-center justify-center">
                        <ProcessingStep onRefresh={pollOnce} />
                    </div>
                )}
                {isError && (
                    <div className="max-w-lg mx-auto px-4 pt-8 pb-8 text-center">
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 mb-4">
                            <p className="text-[15px] text-red-700 mb-4">
                                {useBillAnalyserStore.getState().error || 'Something went wrong. Please try again.'}
                            </p>
                            <button
                                onClick={() => reset()}
                                className="h-10 px-6 rounded-full bg-[#302e28] text-white text-[14px] font-medium hover:bg-[#1a1917] transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
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

export default function BillAnalyserPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <TurnstileLoader />
            <BillAnalyserInner />
        </Suspense>
    );
}
