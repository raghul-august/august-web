'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { postToNative } from '@/hooks/use-webview';
import { useAppealStore } from '@/stores/appeal-store';

const APPEAL_GRADIENT_BG = `
    linear-gradient(160deg, rgba(32,110,85,0.06) 0%, transparent 40%),
    linear-gradient(200deg, rgba(32,110,85,0.03) 60%, transparent 80%),
    #FAEEEF
`;

export function AppealAssistantShell({ children }: { children: React.ReactNode }) {
    const [onUploadStep, setPastIntro] = useState(false);
    const pipelineStage = useAppealStore((s) => s.pipelineStage);
    const isComplete = pipelineStage === 'complete';
    const canGoBack =
        !isComplete && (onUploadStep || !['idle', 'error'].includes(pipelineStage));

    const handleBack = () => {
        if (canGoBack) {
            window.dispatchEvent(new Event('appeal-back'));
            setPastIntro(false);
        } else {
            postToNative({
                source: 'appeal-assistant',
                type: 'NAVIGATION',
                action: 'BACK',
            });
        }
    };

    useEffect(() => {
        const handler = () => setPastIntro(true);
        window.addEventListener('appeal-step-changed', handler);
        return () => window.removeEventListener('appeal-step-changed', handler);
    }, []);

    return (
        <AppShell
            className="appeal-layout"
            background={APPEAL_GRADIENT_BG}
            style={{ height: '100dvh' }}
            webviewExitSource="appeal-assistant"
            onBack={handleBack}
        >
            {children}
        </AppShell>
    );
}
