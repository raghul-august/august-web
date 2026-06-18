'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const UAParser = require('ua-parser-js');

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Platform = 'ios' | 'android' | 'desktop' | 'unknown';
export type Browser = 'chrome' | 'safari' | 'firefox' | 'edge' | 'samsung' | 'other';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/* ------------------------------------------------------------------ */
/*  Detection via ua-parser-js                                         */
/* ------------------------------------------------------------------ */

function detect(): { platform: Platform; browser: Browser } {
    if (typeof window === 'undefined') return { platform: 'unknown', browser: 'other' };

    const parser = new UAParser(navigator.userAgent);
    const os = parser.getOS();
    const browser = parser.getBrowser();
    const device = parser.getDevice();

    // --- Platform ---
    let platform: Platform = 'desktop';
    const osName = (os.name || '').toLowerCase();

    if (osName === 'ios' || osName === 'mac os' && device.type === 'tablet') {
        // iPadOS reports as "Mac OS" but device type is "tablet"
        platform = 'ios';
    } else if (/iphone|ipad|ipod/.test(osName) || osName === 'ios') {
        platform = 'ios';
    } else if (osName === 'android') {
        platform = 'android';
    } else if (device.type === 'mobile' || device.type === 'tablet') {
        // Catch-all for other mobile devices
        platform = osName === 'android' ? 'android' : 'ios';
    } else {
        platform = 'desktop';
    }

    // --- Browser ---
    const browserName = (browser.name || '').toLowerCase();
    let detectedBrowser: Browser = 'other';

    if (browserName.includes('samsung')) {
        detectedBrowser = 'samsung';
    } else if (browserName.includes('edge')) {
        detectedBrowser = 'edge';
    } else if (browserName.includes('chrome') || browserName.includes('chromium')) {
        detectedBrowser = 'chrome';
    } else if (browserName.includes('firefox')) {
        detectedBrowser = 'firefox';
    } else if (browserName.includes('safari') || browserName.includes('mobile safari')) {
        detectedBrowser = 'safari';
    }

    return { platform, browser: detectedBrowser };
}

/**
 * Can this browser potentially fire `beforeinstallprompt`?
 * Chromium-based browsers on non-iOS platforms support it.
 * iOS forces ALL browsers (including Chrome) to use WebKit → no native install.
 */
function supportsNativeInstall(platform: Platform, browser: Browser): boolean {
    if (platform === 'ios') return false;
    return ['chrome', 'edge', 'samsung'].includes(browser);
}

function isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function usePwaInstall() {
    const [platform, setPlatform] = useState<Platform>('unknown');
    const [browser, setBrowser] = useState<Browser>('other');
    const [isInstalled, setIsInstalled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

    // Keep ref in sync so install() always has the latest prompt
    useEffect(() => {
        promptRef.current = deferredPrompt;
    }, [deferredPrompt]);

    // Capture the native Chromium install event
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            const evt = e as BeforeInstallPromptEvent;
            setDeferredPrompt(evt);
            promptRef.current = evt;
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // Detect platform, browser & installed state on mount
    useEffect(() => {
        const { platform: p, browser: b } = detect();
        setPlatform(p);
        setBrowser(b);
        setIsInstalled(isStandalone());
    }, []);

    // Register minimal service worker (Chrome needs this for beforeinstallprompt)
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Silent fail — SW is optional
            });
        }
    }, []);

    // Smart install flow
    const install = useCallback(async () => {
        // 1. If we already captured the native prompt → use it immediately
        if (promptRef.current) {
            try {
                await promptRef.current.prompt();
                const { outcome } = await promptRef.current.userChoice;
                if (outcome === 'accepted') setIsInstalled(true);
                setDeferredPrompt(null);
                promptRef.current = null;
                return;
            } catch {
                // prompt() failed — fall through to guide
            }
        }

        // 2. If Chromium browser that SHOULD support native install,
        //    wait up to 2s for the event (SW may still be registering)
        const { platform: p, browser: b } = detect();
        if (supportsNativeInstall(p, b) && !promptRef.current) {
            const gotPrompt = await new Promise<boolean>((resolve) => {
                const onPrompt = (e: Event) => {
                    e.preventDefault();
                    const evt = e as BeforeInstallPromptEvent;
                    setDeferredPrompt(evt);
                    promptRef.current = evt;
                    resolve(true);
                };
                window.addEventListener('beforeinstallprompt', onPrompt, { once: true });
                setTimeout(() => {
                    window.removeEventListener('beforeinstallprompt', onPrompt);
                    resolve(false);
                }, 2000);
            });

            if (gotPrompt && promptRef.current) {
                const pendingPrompt: BeforeInstallPromptEvent = promptRef.current;
                try {
                    await pendingPrompt.prompt();
                    const { outcome } = await pendingPrompt.userChoice;
                    if (outcome === 'accepted') setIsInstalled(true);
                    setDeferredPrompt(null);
                    promptRef.current = null;
                    return;
                } catch {
                    // fall through
                }
            }
        }

        // 3. Fallback: show the platform-aware manual guide
        setShowGuide(true);
    }, []);

    const dismissGuide = useCallback(() => {
        setShowGuide(false);
    }, []);

    return {
        platform,
        browser,
        isInstalled,
        canInstall: !isInstalled,
        install,
        showGuide,
        dismissGuide,
    };
}
