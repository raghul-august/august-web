'use client';

import { useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import logger from '@/utils/logger';

export function useWebviewBack(onExit?: () => void) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isWebview = searchParams.get('source') === 'webview';

    const handleBack = useCallback(() => {
        if (onExit) {
            onExit();
        } else {
            router.back();
        }
    }, [onExit, router]);

    useEffect(() => {
        if (!isWebview) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (data?.type === 'NAVIGATION' && data?.action === 'BACK') {
                    handleBack();
                }
            } catch (err) {
                logger.error('Failed to parse webview back message', { error: String(err) });
            }
        };

        window.addEventListener('message', handleMessage);
        document.addEventListener('message', handleMessage as EventListener);

        return () => {
            window.removeEventListener('message', handleMessage);
            document.removeEventListener('message', handleMessage as EventListener);
        };
    }, [isWebview, handleBack]);

    return { isWebview, handleBack };
}
