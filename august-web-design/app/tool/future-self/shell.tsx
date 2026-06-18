'use client';

import { useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { postToNative, useIsWebview } from '@/hooks/use-webview';
import { useFutureSelfStore } from '@/stores/future-self-store';

export function FutureSelfShell({ children }: { children: React.ReactNode }) {
    const isWebview = useIsWebview();
    const step = useFutureSelfStore((s) => s.step);
    const questionIndex = useFutureSelfStore((s) => s.questionIndex);
    const setStep = useFutureSelfStore((s) => s.setStep);
    const setQuestionIndex = useFutureSelfStore((s) => s.setQuestionIndex);
    const reset = useFutureSelfStore((s) => s.reset);
    const pipelineStage = useFutureSelfStore((s) => s.pipelineStage);

    const canGoBack =
        step === 'questionnaire' ||
        step === 'results' ||
        (step === 'processing' && pipelineStage === 'error');

    const handleBack = () => {
        if (step === 'questionnaire' && questionIndex > 0) {
            setQuestionIndex(questionIndex - 1);
            return;
        }
        if (step === 'questionnaire') {
            setStep('landing');
            return;
        }
        if (step === 'results') {
            reset();
            return;
        }
        if (step === 'processing' && pipelineStage === 'error') {
            reset();
            return;
        }
        postToNative({ source: 'future-self', type: 'NAVIGATION', action: 'BACK' });
    };

    useEffect(() => {
        if (!isWebview) return;
        const preventZoom = (e: TouchEvent) => {
            if (e.touches.length > 1) e.preventDefault();
        };
        const preventGesture = (e: Event) => e.preventDefault();
        document.addEventListener('touchmove', preventZoom, { passive: false });
        document.addEventListener('gesturestart', preventGesture);
        document.addEventListener('gesturechange', preventGesture);
        return () => {
            document.removeEventListener('touchmove', preventZoom);
            document.removeEventListener('gesturestart', preventGesture);
            document.removeEventListener('gesturechange', preventGesture);
        };
    }, [isWebview]);

    return (
        <AppShell
            className="future-self-layout"
            background="#f5f1eb"
            style={{ height: '100dvh' }}
            webviewExitSource="future-self"
            onBack={canGoBack ? handleBack : undefined}
        >
            {children}
        </AppShell>
    );
}
