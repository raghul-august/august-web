import PaymentPageWrapper from '@/app/components/website/landing/PaymentPageWrapper';

export default function Loading() {
    return (
        <PaymentPageWrapper>
            <main className="pl-root">
                <div className="pl-glow" aria-hidden />

                <div className="pl-body">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/august-logo-white.png"
                        alt="August"
                        className="pl-logo"
                    />

                    <div className="pl-ring" aria-hidden>
                        <span className="pl-ring-arc" />
                    </div>
                </div>

                <style>{`
                    .pl-root {
                        position: relative;
                        min-height: 100dvh;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: calc(env(safe-area-inset-top, 0px) + 32px) 24px
                            calc(env(safe-area-inset-bottom, 0px) + 32px);
                        color: #faf9f5;
                        background: linear-gradient(
                            160deg,
                            #0f3a2c 0%,
                            #184d3d 35%,
                            #206e55 70%,
                            #2a8a6c 100%
                        );
                        overflow: hidden;
                        font-family: 'Inter Display', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                            sans-serif;
                    }
                    .pl-glow {
                        position: absolute;
                        inset: -30% -10% auto auto;
                        width: 80%;
                        aspect-ratio: 1;
                        background: radial-gradient(
                            circle,
                            rgba(168, 213, 186, 0.32) 0%,
                            transparent 65%
                        );
                        filter: blur(20px);
                        pointer-events: none;
                        animation: pl-breathe 4s ease-in-out infinite;
                    }
                    .pl-body {
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 32px;
                        animation: pl-fade-in 0.5s ease both;
                    }
                    .pl-logo {
                        height: 44px;
                        width: auto;
                        filter: brightness(0) invert(1);
                        opacity: 0.95;
                        animation: pl-logo-pulse 2.4s ease-in-out infinite;
                    }
                    .pl-ring {
                        position: relative;
                        width: 44px;
                        height: 44px;
                    }
                    .pl-ring-arc {
                        position: absolute;
                        inset: 0;
                        border-radius: 999px;
                        background: conic-gradient(
                            from 0deg,
                            transparent 0deg,
                            transparent 180deg,
                            rgba(168, 245, 207, 0.2) 220deg,
                            rgba(168, 245, 207, 0.55) 300deg,
                            #a8f5cf 340deg,
                            #ffffff 360deg
                        );
                        -webkit-mask: radial-gradient(circle, transparent 58%, black 60%);
                        mask: radial-gradient(circle, transparent 58%, black 60%);
                        animation: pl-spin 1.2s linear infinite;
                        filter: drop-shadow(0 0 6px rgba(168, 245, 207, 0.35));
                    }
                    @keyframes pl-spin {
                        to { transform: rotate(360deg); }
                    }
                    @keyframes pl-breathe {
                        0%, 100% { opacity: 0.9; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.04); }
                    }
                    @keyframes pl-logo-pulse {
                        0%, 100% { opacity: 0.9; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.03); }
                    }
                    @keyframes pl-fade-in {
                        from { opacity: 0; transform: translateY(4px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @media (prefers-reduced-motion: reduce) {
                        .pl-logo,
                        .pl-glow,
                        .pl-body {
                            animation: none;
                        }
                        .pl-ring-arc { animation: pl-spin 2s linear infinite; }
                    }
                `}</style>
            </main>
        </PaymentPageWrapper>
    );
}
