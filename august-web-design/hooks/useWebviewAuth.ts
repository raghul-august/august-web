'use client';

import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/auth-store';
import logger from '@/utils/logger';

interface PendingTokens {
    accessToken: string;
    refreshToken?: string;
}

let _pendingTokens: PendingTokens | null = null;

if (typeof window !== 'undefined') {
    const earlyListener = (event: MessageEvent) => {
        try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            if (data?.accessToken) {
                _pendingTokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
            }
        } catch (err) {
            logger.error('Failed to parse early webview message', { error: String(err) });
        }
    };
    window.addEventListener('message', earlyListener);
    document.addEventListener('message', earlyListener as EventListener);
}

function sendWebviewReady(source: string) {
    window.ReactNativeWebView?.postMessage(JSON.stringify({
        source,
        type: 'WEBVIEW_READY',
    }));
}

function storeTokens(tokens: PendingTokens): boolean {
    try {
        const authStore = useAuthStore.getState();
        authStore.setAccessToken(tokens.accessToken);
        if (tokens.refreshToken) {
            Cookies.set('gk_session', tokens.refreshToken, { path: '/', sameSite: 'lax' as const });
        }
        return true;
    } catch (err) {
        logger.error('Failed to store webview tokens', { error: String(err) });
        return false;
    }
}

export function useWebviewAuth(isWebview: boolean, source = 'appeal-assistant'): { webviewAuthReady: boolean } {
    const [webviewAuthReady, setWebviewAuthReady] = useState(false);
    const handled = useRef(false);

    useLayoutEffect(() => {
        if (!isWebview || handled.current) return;
        if (_pendingTokens) {
            storeTokens(_pendingTokens);
            _pendingTokens = null;
            handled.current = true;
            setWebviewAuthReady(true);
        }
    }, [isWebview]);

    useEffect(() => {
        if (!isWebview || handled.current) return;

        // Send WEBVIEW_READY every 1s until tokens arrive
        sendWebviewReady(source);
        const interval = setInterval(() => {
            if (!handled.current) sendWebviewReady(source);
        }, 1000);

        const listener = (event: MessageEvent) => {
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (data?.accessToken && !handled.current) {
                    storeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
                    handled.current = true;
                    setWebviewAuthReady(true);
                }
            } catch (err) {
                logger.error('Failed to parse webview token message', { error: String(err) });
            }
        };

        window.addEventListener('message', listener);
        document.addEventListener('message', listener as EventListener);

        return () => {
            clearInterval(interval);
            window.removeEventListener('message', listener);
            document.removeEventListener('message', listener as EventListener);
        };
    }, [isWebview]);

    return { webviewAuthReady };
}
