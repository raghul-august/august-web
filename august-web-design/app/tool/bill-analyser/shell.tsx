'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { postToNative, useIsWebview } from '@/hooks/use-webview';
import { useBillAnalyserStore } from '@/stores/bill-analyser-store';

export function BillAnalyserShell({ children }: { children: React.ReactNode }) {
    const isWebview = useIsWebview();
    const [onUploadStep, setPastIntro] = useState(false);
    const pipelineStage = useBillAnalyserStore((s) => s.pipelineStage);
    const activeSubView = useBillAnalyserStore((s) => s.activeSubView);
    const isComplete = pipelineStage === 'complete';
    const hasSubView = isComplete && activeSubView !== null;
    const canGoBack =
        hasSubView ||
        (!isComplete && (onUploadStep || !['idle', 'error'].includes(pipelineStage)));

    const handleBack = () => {
        if (canGoBack) {
            window.dispatchEvent(new Event('bill-analyser-back'));
            setPastIntro(false);
        } else {
            postToNative({
                source: 'bill-analyser',
                type: 'NAVIGATION',
                action: 'BACK',
            });
        }
    };

    useEffect(() => {
        const handler = () => setPastIntro(true);
        window.addEventListener('bill-analyser-step-changed', handler);
        return () => window.removeEventListener('bill-analyser-step-changed', handler);
    }, []);

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
            className="bill-analyser-layout"
            background="#f5f1eb"
            style={{ height: '100dvh' }}
            webviewExitSource="bill-analyser"
            onBack={handleBack}
        >
            {children}
        </AppShell>
    );
}
