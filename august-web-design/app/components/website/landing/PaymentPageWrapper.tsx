'use client';

import { Suspense } from 'react';

function LegalPageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="legal-page-root h-full w-full overflow-y-auto">
            {children}

            <style jsx global>{`
                @font-face {
                    font-family: 'Inter Display';
                    src: url('/fonts/inter-display-300.woff2') format('woff2');
                    font-weight: 300;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'Inter Display';
                    src: url('/fonts/inter-display-400.woff2') format('woff2');
                    font-weight: 400;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'Inter Display';
                    src: url('/fonts/inter-display-500.woff2') format('woff2');
                    font-weight: 500;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'Geist';
                    src: url('/fonts/geist-latin-400-normal.woff2') format('woff2');
                    font-weight: 400;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'Geist';
                    src: url('/fonts/geist-latin-600-normal.woff2') format('woff2');
                    font-weight: 600;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'Geist';
                    src: url('/fonts/geist-latin-700-normal.woff2') format('woff2');
                    font-weight: 700;
                    font-style: normal;
                    font-display: swap;
                }

                .legal-page-root {
                    font-family: 'Inter Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    line-height: 1.6;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
            `}</style>
        </div>
    );
}

export default function PaymentPageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <LegalPageShell>{children}</LegalPageShell>
        </Suspense>
    );
}
