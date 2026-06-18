'use client';

import { formatPeriodDate, type SuccessData } from '@/lib/payment-success';

export type PaymentSuccessState = 'confirming' | 'success' | 'failed';

export default function PaymentSuccess({
    state,
    data,
}: {
    state: PaymentSuccessState;
    data?: SuccessData;
}) {
    const periodEnd = formatPeriodDate(data?.periodEnd);

    return (
        <main className="ps-root">
            <div className="ps-glow" aria-hidden />

            <div className="ps-body">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/august-logo-white.png"
                    alt="August"
                    className="ps-logo"
                />

                {state === 'confirming' && (
                    <>
                        <div className="ps-spinner" aria-hidden />
                        <h1 className="ps-title">Confirming your payment…</h1>
                        <p className="ps-sub">Hang tight. This takes a second.</p>
                    </>
                )}

                {state === 'success' && data && (
                    <>
                        <span className="ps-eyebrow">Your plan</span>
                        <h1 className="ps-plan">{data.planName}</h1>
                        {periodEnd ? (
                            <span className="ps-duration">Valid till {periodEnd}</span>
                        ) : data.durationLabel ? (
                            <span className="ps-duration">{data.durationLabel}</span>
                        ) : null}

                        <div className="ps-pricerow">
                            {data.originalAmount && (
                                <span className="ps-orig">{data.originalAmount}</span>
                            )}
                            <span className="ps-price">{data.amountPaid}</span>
                        </div>

                        <div className="ps-divider" aria-hidden />

                        <div className="ps-badge">
                            <svg className="ps-badge-check" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="ps-badge-ring" cx="12" cy="12" r="10.5" />
                                <path className="ps-badge-tick" d="M7.5 12.5L10.5 15.5L16.5 9" />
                            </svg>
                            <span>Subscription active</span>
                        </div>

                        {data.amountSaved && (
                            <p className="ps-saved">You saved {data.amountSaved} on this plan.</p>
                        )}

                        <p className="ps-foot">
                            You can head back to your August chat — we&apos;ve already lifted your limits.
                        </p>

                        <p className="ps-support">
                            Need help? Email{' '}
                            <a href="mailto:support@meetaugust.ai" className="ps-link">
                                support@meetaugust.ai
                            </a>
                            .
                        </p>
                    </>
                )}

                {state === 'failed' && (
                    <>
                        <h1 className="ps-title">Almost there…</h1>
                        <p className="ps-sub">
                            Your payment went through, but we couldn&apos;t confirm it just yet. It&apos;ll
                            reflect shortly. If not, email{' '}
                            <a href="mailto:support@meetaugust.ai" className="ps-link">
                                support@meetaugust.ai
                            </a>
                            .
                        </p>
                    </>
                )}
            </div>

            <style jsx>{`
                .ps-root {
                    position: relative;
                    min-height: 100dvh;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: calc(env(safe-area-inset-top, 0px) + 40px) 24px
                        calc(env(safe-area-inset-bottom, 0px) + 40px);
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
                .ps-glow {
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
                }
                .ps-body {
                    position: relative;
                    max-width: 520px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 10px;
                    animation: ps-fade-in 0.4s ease both;
                }
                .ps-logo {
                    height: 40px;
                    width: auto;
                    filter: brightness(0) invert(1);
                    opacity: 0.95;
                    margin-bottom: 28px;
                }
                .ps-eyebrow {
                    font-family: 'Geist', ui-monospace, monospace;
                    font-size: 10.5px;
                    font-weight: 500;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: rgba(250, 249, 245, 0.55);
                    margin-bottom: 2px;
                }
                .ps-plan {
                    font-size: clamp(26px, 3.4vw, 36px);
                    font-weight: 400;
                    letter-spacing: -0.02em;
                    line-height: 1.15;
                    margin: 0;
                }
                .ps-duration {
                    margin-top: 4px;
                    font-size: 13px;
                    font-weight: 400;
                    color: rgba(250, 249, 245, 0.6);
                    letter-spacing: 0.01em;
                }
                .ps-pricerow {
                    display: inline-flex;
                    align-items: baseline;
                    gap: 14px;
                    margin-top: 14px;
                }
                .ps-orig {
                    font-size: clamp(16px, 1.4vw, 20px);
                    font-weight: 500;
                    color: rgba(250, 249, 245, 0.45);
                    text-decoration: line-through;
                    text-decoration-thickness: 1.5px;
                }
                .ps-price {
                    font-size: clamp(40px, 5vw, 60px);
                    font-weight: 500;
                    letter-spacing: -0.035em;
                    line-height: 1;
                    color: #faf9f5;
                }
                .ps-divider {
                    width: 100%;
                    max-width: 360px;
                    height: 1px;
                    background: rgba(250, 249, 245, 0.18);
                    margin: 28px auto 6px;
                }
                .ps-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 999px;
                    background: rgba(168, 245, 207, 0.14);
                    border: 1px solid rgba(168, 245, 207, 0.35);
                    font-family: 'Geist', ui-monospace, monospace;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #a8f5cf;
                }
                .ps-badge-check {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                }
                .ps-badge-ring {
                    fill: none;
                    stroke: currentColor;
                    stroke-width: 1.6;
                    stroke-dasharray: 66;
                    stroke-dashoffset: 66;
                    animation: ps-ring 0.45s 0.1s ease forwards;
                    transform-origin: 12px 12px;
                    transform: rotate(-90deg);
                }
                .ps-badge-tick {
                    fill: none;
                    stroke: currentColor;
                    stroke-width: 2;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    stroke-dasharray: 22;
                    stroke-dashoffset: 22;
                    animation: ps-tick 0.28s 0.55s ease forwards;
                }
                .ps-period {
                    margin: 14px 0 0;
                    font-size: 14px;
                    font-weight: 300;
                    color: rgba(250, 249, 245, 0.78);
                    line-height: 1.5;
                }
                .ps-period strong {
                    font-weight: 500;
                    color: #faf9f5;
                }
                .ps-saved {
                    margin: 6px 0 0;
                    font-size: 13px;
                    font-weight: 400;
                    color: #a8f5cf;
                    letter-spacing: 0.01em;
                }
                .ps-foot {
                    margin: 24px 0 0;
                    font-size: 13px;
                    font-weight: 300;
                    color: rgba(250, 249, 245, 0.6);
                    line-height: 1.55;
                    max-width: 360px;
                }
                .ps-support {
                    margin: 10px 0 0;
                    font-size: 12.5px;
                    font-weight: 300;
                    color: rgba(250, 249, 245, 0.5);
                    line-height: 1.55;
                }
                .ps-title {
                    font-size: clamp(24px, 3.2vw, 34px);
                    font-weight: 400;
                    letter-spacing: -0.02em;
                    line-height: 1.15;
                    margin: 0;
                }
                .ps-sub {
                    font-size: clamp(14px, 1.2vw, 16px);
                    font-weight: 300;
                    line-height: 1.5;
                    color: rgba(250, 249, 245, 0.78);
                    margin: 0;
                    max-width: 360px;
                }
                .ps-spinner {
                    width: 48px;
                    height: 48px;
                    border-radius: 999px;
                    border: 3px solid rgba(250, 249, 245, 0.25);
                    border-top-color: #faf9f5;
                    animation: ps-spin 0.9s linear infinite;
                    margin-bottom: 10px;
                }
                .ps-link {
                    color: #a8f5cf;
                    text-decoration: underline;
                }
                @keyframes ps-fade-in {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes ps-spin { to { transform: rotate(360deg); } }
                @keyframes ps-ring { to { stroke-dashoffset: 0; } }
                @keyframes ps-tick { to { stroke-dashoffset: 0; } }
                @media (prefers-reduced-motion: reduce) {
                    .ps-badge-ring,
                    .ps-badge-tick {
                        animation: none;
                        stroke-dashoffset: 0;
                    }
                    .ps-body { animation: none; }
                    .ps-spinner {
                        animation: none;
                        border-top-color: rgba(250, 249, 245, 0.5);
                    }
                }
            `}</style>
        </main>
    );
}
