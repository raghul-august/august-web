'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRazorpay } from '@/hooks/use-razorpay';
import type { ApiPlan } from '@/lib/payment-plans';
import PaymentLinkError from '@/app/components/website/landing/PaymentLinkError';
import PaymentSuccess, {
    type PaymentSuccessState,
} from '@/app/components/website/landing/PaymentSuccess';
import { buildSuccessData, type SuccessData } from '@/lib/payment-success';

const FATAL_CHECKOUT_REASONS = new Set<string>([
    'payment_plan_id_required',
    'checkout_link_not_found',
    'checkout_link_expired',
    'checkout_link_completed',
    'payment_plan_not_found',
    'payment_plan_provider_not_supported',
]);

type FatalReason =
    | 'checkout_link_not_found'
    | 'checkout_link_expired'
    | 'checkout_link_completed'
    | 'checkout_link_lookup_failed';

function mapFatalReason(reason: string | undefined): FatalReason {
    if (reason === 'checkout_link_not_found') return 'checkout_link_not_found';
    if (reason === 'checkout_link_completed') return 'checkout_link_completed';
    return 'checkout_link_expired';
}

type MappedPlan = {
    title: string;
    description: string;
    originalPrice: string;
    price: string;
    ctaLabel: string;
    paymentPlanId: string;
    savings?: string;
    savedAmount?: string;
    pillLabel?: string;
    discountPercent?: number;
    recommended?: boolean;
    features: string[];
};

function formatPrice(amountInMinorUnits: number, currency: string): string {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '';
    const major = amountInMinorUnits / 100;
    const rounded = Math.round(major * 10) / 10;
    const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    return `${symbol}${formatted}`;
}

function mapPlans(apiPlans: ApiPlan[]): MappedPlan[] {
    const active = apiPlans.filter((p) => p.active);

    // Best value = lowest per-day cost. `Infinity` keeps plans with
    // duration_days=0 out of the running.
    const perDay = (p: ApiPlan) => (p.duration_days > 0 ? p.amount / p.duration_days : Infinity);
    const bestValueId = active.length > 1
        ? active.reduce((best, p) => (perDay(p) < perDay(best) ? p : best), active[0]).id
        : null;

    // Best value lands first; the rest follow in ascending price order.
    const sorted = [...active].sort((a, b) => {
        if (a.id === bestValueId) return -1;
        if (b.id === bestValueId) return 1;
        return a.amount - b.amount;
    });

    return sorted.map((p) => {
        const isRecommended = p.id === bestValueId;
        const saved = p.original_amount - p.amount;
        const hasDiscount = p.original_amount > 0 && saved > 0;
        const percent = hasDiscount
            ? Math.ceil((saved / p.original_amount) * 100)
            : 0;
        let pillLabel: string | undefined;
        if (p.duration_days === 30) {
            pillLabel = 'Low commitment';
        }

        return {
            title: p.name,
            description: p.description,
            originalPrice: formatPrice(p.original_amount, p.currency),
            price: formatPrice(p.amount, p.currency),
            ctaLabel: 'Subscribe Now',
            paymentPlanId: p.id,
            savings: isRecommended && saved > 0
                ? `Save ${formatPrice(saved, p.currency)} · Over ${percent}%`
                : undefined,
            savedAmount: hasDiscount ? formatPrice(saved, p.currency) : undefined,
            pillLabel,
            discountPercent: hasDiscount ? percent : undefined,
            recommended: isRecommended,
            features: p.features,
        };
    });
}

/* ────────────────────────────────────────────────────────────
   Shared tokens
─────────────────────────────────────────────────────────────── */
const GLASS_SHADOW = `
  inset 3px 3px 2px -3px rgba(255, 255, 255, 0.9),
  inset -3px -3px 2px -3px rgba(255, 255, 255, 0.9),
  inset 2px 2px 0.5px -2px rgba(38, 38, 38, 0.04),
  inset -2px -2px 0.5px -2px rgba(38, 38, 38, 0.04),
  inset 0 0 0 1px rgba(255, 255, 255, 0.45),
  inset 0 0 14px 2px rgba(255, 255, 255, 0.22),
  0 34px 64px -22px rgba(23, 69, 58, 0.28),
  0 14px 36px -14px rgba(17, 24, 39, 0.16)
`;

const BEST_VALUE_GLOW = `
  0 0 0 1px rgba(196, 181, 253, 0.2),
  0 0 40px -12px rgba(124, 58, 237, 0.22),
  0 26px 52px -18px rgba(124, 58, 237, 0.16)
`;

const CTA_SHADOW = `
  inset 3px 3px 2px -3px rgba(255, 255, 255, 1),
  inset -3px -3px 2px -3px rgba(255, 255, 255, 1),
  inset 2px 2px 0.5px -2px rgba(38, 38, 38, 0.06),
  inset -2px -2px 0.5px -2px rgba(38, 38, 38, 0.06),
  inset 0 0 0 1px rgba(255, 255, 255, 0.16),
  inset 0 0 12px 1px rgba(168, 213, 186, 0.12),
  0 0 2px 0 rgba(0, 0, 0, 0.1),
  0 1px 8px 0 rgba(0, 0, 0, 0.1)
`;

// Light palette — ink on cream. Keeps naming (CREAM/CREAM_DIM/CREAM_FAINT)
// so the rest of the file doesn't need to change. Values now mean "primary text",
// "dim text", "faint text" on a cream surface.
const CREAM = '#1C1917';
const CREAM_DIM = 'rgba(28, 25, 23, 0.72)';
const CREAM_FAINT = 'rgba(28, 25, 23, 0.52)';
const HAIRLINE = 'rgba(28, 25, 23, 0.12)';
const SAGE = '#206E55';
const EMERALD = '#206E55';

/* ────────────────────────────────────────────────────────────
   Wireframe decoration — top ruler with ticks
─────────────────────────────────────────────────────────────── */
function Ruler({ label }: { label: string }) {
    return (
        <div
            className="flex items-center gap-3"
            style={{
                fontFamily: "'Geist', ui-monospace, monospace",
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: CREAM_FAINT,
            }}
        >
            <span style={{ color: SAGE, fontWeight: 600 }}>{label}</span>
            <span style={{ flex: 1, height: '1px', background: HAIRLINE }} />
            <span>—</span>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Pricing card — glass
─────────────────────────────────────────────────────────────── */
interface PlanProps {
    title: string;
    description: string;
    originalPrice: string;
    price: string;
    ctaLabel: string;
    paymentPlanId: string;
    savings?: string;
    savedAmount?: string;
    pillLabel?: string;
    discountPercent?: number;
    features: string[];
    showFeatures?: boolean;
    recommended?: boolean;
    onSubscribe: (plan: {
        paymentPlanId: string;
        title: string;
        price: string;
        originalPrice: string;
        savings?: string;
    }) => void;
}

function PlanCard({
    title,
    description,
    originalPrice,
    price,
    ctaLabel,
    paymentPlanId,
    savings,
    pillLabel,
    discountPercent,
    features,
    showFeatures = false,
    recommended = false,
    onSubscribe,
}: PlanProps) {
    return (
        <div
            className="plan-card relative flex flex-col"
            style={{
                borderRadius: '20px',
                padding: '28px 24px 24px',
                background: recommended
                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(245, 250, 246, 0.42) 100%)'
                    : 'rgba(255, 255, 255, 0.42)',
                backdropFilter: 'blur(28px) saturate(1.2)',
                WebkitBackdropFilter: 'blur(28px) saturate(1.2)',
                border: recommended
                    ? '1px solid transparent'
                    : '1px solid rgba(255, 255, 255, 0.55)',
                boxShadow: recommended ? `${GLASS_SHADOW}, ${BEST_VALUE_GLOW}` : GLASS_SHADOW,
                transition:
                    'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s',
            }}
        >
            {recommended && (
                <>
                    <span className="plan-rim plan-rim-a" aria-hidden />
                    <span className="plan-rim plan-rim-b" aria-hidden />
                </>
            )}
            {recommended && (
                <div
                    style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        background: '#6e1fc9',
                        color: '#FAF9F5',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        boxShadow: `${CTA_SHADOW}, 0 8px 24px -8px rgba(109, 40, 217, 0.55)`,
                        zIndex: 3,
                    }}
                >
                    Best Value
                </div>
            )}

            <h2
                className="frx"
                style={{
                    marginTop: '10px',
                    fontSize: 'clamp(22px, 2.4vw, 30px)',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    color: CREAM,
                }}
            >
                {title}
            </h2>
            <div style={{ height: '1px', background: HAIRLINE, margin: '18px 0 14px' }} />

            <div
                className="plan-price-row"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    flexWrap: 'nowrap',
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '10px',
                        flexShrink: 0,
                    }}
                >
                    {discountPercent !== undefined && (
                        <span
                            className="frx"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'baseline',
                                gap: '2px',
                                fontSize: 'clamp(22px, 2.6vw, 34px)',
                                fontWeight: 500,
                                letterSpacing: '-0.04em',
                                lineHeight: 1,
                                color: EMERALD,
                            }}
                        >
                            <svg
                                width="0.6em"
                                height="0.8em"
                                viewBox="0 0 12 16"
                                fill="none"
                                aria-hidden="true"
                                style={{ alignSelf: 'center', flexShrink: 0 }}
                            >
                                <path
                                    d="M6 1.5V13.5M6 13.5L1.5 9M6 13.5L10.5 9"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            {discountPercent}%
                        </span>
                    )}
                    {discountPercent !== undefined && (
                        <span
                            className="frx"
                            style={{
                                fontSize: 'clamp(22px, 2.6vw, 34px)',
                                fontWeight: 500,
                                letterSpacing: '-0.04em',
                                lineHeight: 1,
                                color: CREAM_FAINT,
                                textDecoration: 'line-through',
                                textDecorationThickness: '1.5px',
                            }}
                        >
                            {originalPrice}
                        </span>
                    )}
                    <span
                        className="frx"
                        style={{
                            fontSize: 'clamp(26px, 3.2vw, 42px)',
                            fontWeight: 500,
                            letterSpacing: '-0.04em',
                            lineHeight: 1,
                            color: CREAM,
                        }}
                    >
                        {price}
                    </span>
                </div>
                {pillLabel && (
                    <div
                        className="plan-savings-pill"
                        style={{
                            flexShrink: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(32, 110, 85, 0.3)',
                            fontFamily: "'Geist', ui-monospace, monospace",
                            fontSize: '11.5px',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: EMERALD,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {pillLabel}
                    </div>
                )}
            </div>

            <p
                style={{
                    marginTop: '8px',
                    fontSize: 'clamp(12.5px, 1.1vw, 14.5px)',
                    fontWeight: 400,
                    lineHeight: 1.4,
                    color: CREAM_DIM,
                }}
            >
                {description}
            </p>

            {showFeatures && features.length > 0 && (
                <>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
                        {features.map((f, i) => (
                            <li
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    fontSize: 'clamp(12.5px, 1.1vw, 14px)',
                                    fontWeight: 400,
                                    lineHeight: 1.45,
                                    color: CREAM_DIM,
                                }}
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    aria-hidden="true"
                                    style={{ flexShrink: 0, marginTop: '3px', color: EMERALD }}
                                >
                                    <path
                                        d="M3 7.5L5.5 10L11 4"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <div style={{ flex: 1 }} />

            <button
                type="button"
                onClick={() => onSubscribe({ paymentPlanId, title, price, originalPrice, savings })}
                className="plan-cta"
                data-recommended={recommended ? 'true' : 'false'}
                style={{
                    marginTop: '30px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '56px',
                    borderRadius: '12px',
                    fontSize: 'clamp(15px, 1.3vw, 17px)',
                    fontWeight: 600,
                    letterSpacing: '0.005em',
                    border: recommended ? 'none' : '1.5px solid #1C1917',
                    cursor: 'pointer',
                    transition:
                        'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease',
                    background: recommended ? '#1C1917' : 'transparent',
                    color: recommended ? '#FAF9F5' : '#1C1917',
                    boxShadow: recommended ? CTA_SHADOW : 'none',
                }}
            >
                {ctaLabel}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                        d="M3 7H11M11 7L7 3M11 7L7 11"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   FAQ
─────────────────────────────────────────────────────────────── */
function FaqItem({ q, a, n }: { q: string; a: string; n: string }) {
    return (
        <div
            style={{
                padding: '24px 0',
                borderBottom: `1px solid ${HAIRLINE}`,
                display: 'grid',
                gridTemplateColumns: '56px 1fr',
                columnGap: '16px',
            }}
        >
            <span
                style={{
                    paddingTop: '4px',
                    fontFamily: "'Geist', ui-monospace, monospace",
                    fontSize: '10px',
                    letterSpacing: '0.18em',
                    color: CREAM_FAINT,
                }}
            >
                {n}
            </span>
            <div>
                <h4
                    className="frx"
                    style={{
                        fontSize: 'clamp(17px, 1.6vw, 20px)',
                        fontWeight: 400,
                        color: CREAM,
                        letterSpacing: '-0.01em',
                        lineHeight: 1.4,
                    }}
                >
                    {q}
                </h4>
                <p
                    style={{
                        marginTop: '10px',
                        fontSize: 'clamp(14.5px, 1.25vw, 16.5px)',
                        fontWeight: 300,
                        lineHeight: 1.7,
                        color: CREAM_DIM,
                    }}
                >
                    {a}
                </p>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Pincode dialog — glass
─────────────────────────────────────────────────────────────── */
function PincodeDialog({
    plan,
    status,
    errorReason,
    onClose,
    onConfirm,
    onRetry,
}: {
    plan: { title: string; price: string; originalPrice: string; savings?: string };
    status: 'selecting' | 'ready' | 'creating' | 'already_subscribed' | 'selection_error' | 'creation_error';
    errorReason?: string;
    onClose: () => void;
    onConfirm: (pincode: string) => void;
    onRetry: (pincode: string) => void;
}) {
    const [pincode, setPincode] = useState('');
    const [detecting, setDetecting] = useState(false);
    const [detectError, setDetectError] = useState<string | null>(null);
    const valid = /^\d{6}$/.test(pincode);

    const handleDetect = () => {
        if (!('geolocation' in navigator)) {
            setDetectError('Location not supported on this device.');
            return;
        }
        setDetectError(null);
        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    const data = await res.json();
                    const detected = data?.address?.postcode?.replace(/\s/g, '');
                    if (detected && /^\d{6}$/.test(detected)) {
                        setPincode(detected);
                    } else {
                        setDetectError('Couldn’t detect pincode. Please enter manually.');
                    }
                } catch {
                    setDetectError('Detection failed. Please enter manually.');
                } finally {
                    setDetecting(false);
                }
            },
            () => {
                setDetecting(false);
                setDetectError('Location permission denied.');
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()} className="pincode-dialog">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="pincode-close"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                            d="M3 3l8 8M11 3l-8 8"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>

                {/* Left — brand + pricing */}
                <aside className="pincode-brand">
                    <div className="pincode-brand-glow" aria-hidden />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/august-logo-white.png" alt="August" className="pincode-brand-logo" />

                    <div className="pincode-brand-hero">
                        <span className="pincode-brand-eyebrow">Your plan</span>
                        <h2 className="pincode-brand-plan">{plan.title}</h2>
                        <p className="pincode-brand-tagline">
                            Uninterrupted access to all your health data, in one place.
                        </p>

                        <div className="pincode-brand-pricerow">
                            <div className="pincode-brand-pricegroup">
                                <span className="pincode-brand-orig">{plan.originalPrice}</span>
                                <span className="pincode-brand-price">{plan.price}</span>
                            </div>
                            {plan.savings && (
                                <div className="pincode-brand-savings">
                                    <svg width="10" height="11" viewBox="0 0 11 12" fill="none" aria-hidden="true">
                                        <path
                                            d="M6.5 1L1.5 6.8h3L4 11l5-5.8H6l.5-4.2Z"
                                            fill="currentColor"
                                            stroke="currentColor"
                                            strokeWidth="0.8"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    {plan.savings}
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="pincode-brand-foot">
                        Cancel anytime. Secure payments via Razorpay.
                    </p>
                </aside>

                {/* Right — input + actions */}
                <section className="pincode-form">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/august-logo.svg"
                        alt="August"
                        className="pincode-form-logo"
                    />
                    <span className="pincode-eyebrow">One last step</span>
                    <h3 className="frx pincode-title">
                        Enter your <em>pincode</em>
                    </h3>
                    <p className="pincode-lede">
                        Needed for GST on your receipt. Phone &amp; email come next.
                    </p>

                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        autoFocus
                        placeholder="6-digit pincode"
                        value={pincode}
                        onChange={(e) =>
                            setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && valid) onConfirm(pincode);
                        }}
                        className="pincode-input"
                    />

                    <button
                        type="button"
                        onClick={handleDetect}
                        disabled={detecting}
                        className="pincode-locate"
                    >
                        <svg
                            className="pincode-locate-icon"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <circle cx="10" cy="10" r="6.5" />
                            <circle cx="10" cy="10" r="2" />
                            <path d="M10 1v2.5M10 16.5V19M1 10h2.5M16.5 10H19" />
                        </svg>
                        <span className="pincode-locate-text">
                            <span className="pincode-locate-label">
                                {detecting ? 'Detecting location…' : 'Use my location'}
                            </span>
                            <span className="pincode-locate-sub">Auto-fill pincode from GPS</span>
                        </span>
                        <svg
                            className="pincode-locate-arrow"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M3 7h8M11 7l-4-4M11 7l-4 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    {detectError && <p className="pincode-err">{detectError}</p>}

                    {(status === 'selection_error' || status === 'creation_error') && (
                        <p className="pincode-err">
                            {errorReason === 'provider_subscription_create_failed'
                                ? "Couldn't set up your subscription. Try again?"
                                : errorReason === 'user_payment_plan_create_failed'
                                ? "Something went wrong on our end. Please try again."
                                : errorReason === 'network_error'
                                ? "Couldn't reach our servers. Check your connection and retry."
                                : 'Something went wrong. Please try again.'}
                        </p>
                    )}

                    {status === 'selection_error' || status === 'creation_error' ? (
                        <button
                            type="button"
                            disabled={status === 'creation_error' && !valid}
                            onClick={() => onRetry(pincode)}
                            className="pincode-submit"
                            style={{ boxShadow: CTA_SHADOW, fontWeight: 600 }}
                        >
                            Try again
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={
                                !valid || status === 'selecting' || status === 'creating'
                            }
                            onClick={() => onConfirm(pincode)}
                            className="pincode-submit"
                            style={{ boxShadow: CTA_SHADOW, fontWeight: 600 }}
                        >
                            {status === 'selecting'
                                ? 'Getting things ready…'
                                : status === 'creating'
                                ? 'Creating your subscription…'
                                : status === 'already_subscribed'
                                ? `Continue · ${plan.price}`
                                : `Continue to pay · ${plan.price}`}
                        </button>
                    )}
                </section>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Main
─────────────────────────────────────────────────────────────── */
export default function SubscriptionsContent({
    token: _token,
    initialPlans,
}: {
    token?: string;
    initialPlans: ApiPlan[] | null;
}) {
    const { openCheckout } = useRazorpay();
    const plans = useMemo(
        () => (initialPlans ? mapPlans(initialPlans) : []),
        [initialPlans]
    );
    const showFeatures = plans.length > 0 && plans.every((p) => p.features.length > 0);
    const plansError = initialPlans === null ? 'Unable to load plans. Please try again.' : null;

    type SelectionStatus = 'selecting' | 'ready' | 'creating' | 'already_subscribed' | 'selection_error' | 'creation_error';
    type PendingPlan = {
        paymentPlanId: string;
        title: string;
        price: string;
        originalPrice: string;
        savings?: string;
        status: SelectionStatus;
        errorReason?: string;
    };

    const [pendingPlan, setPendingPlan] = useState<PendingPlan | null>(null);
    const [fatalReason, setFatalReason] = useState<FatalReason | null>(null);
    const [completion, setCompletion] = useState<{
        state: PaymentSuccessState;
        data?: SuccessData;
    } | null>(null);

    const pollUserPaymentPlan = useCallback(async (userPaymentPlanId: string) => {
        const delays = [1000, 1500, 2000, 2500, 3000];
        for (let i = 0; i < delays.length; i++) {
            await new Promise((r) => setTimeout(r, delays[i]));
            try {
                const res = await fetch(`/api/user-payment-plan/${encodeURIComponent(userPaymentPlanId)}`, {
                    cache: 'no-store',
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok && data.valid && data.payment_completed && data.payment_plan && data.user_payment_plan) {
                    setCompletion({
                        state: 'success',
                        data: buildSuccessData(data.payment_plan, data.user_payment_plan),
                    });
                    return;
                }
            } catch {
                // swallow and try again
            }
        }
        setCompletion({ state: 'failed' });
    }, []);

    const handleRazorpaySuccess = useCallback(
        (userPaymentPlanId: string | undefined) => {
            setPendingPlan(null);
            setCompletion({ state: 'confirming' });
            if (!userPaymentPlanId) {
                setCompletion({ state: 'failed' });
                return;
            }
            void pollUserPaymentPlan(userPaymentPlanId);
        },
        [pollUserPaymentPlan]
    );

    const runPlanSelection = useCallback(
        async (paymentPlanId: string) => {
            try {
                const res = await fetch('/api/plan-selection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: _token, payment_plan_id: paymentPlanId }),
                });
                const data = await res.json().catch(() => ({}));

                if (res.ok && data.valid) {
                    setPendingPlan((prev) => (prev ? { ...prev, status: 'ready' } : prev));
                    return;
                }

                const reason: string | undefined = data?.reason;

                if (reason && FATAL_CHECKOUT_REASONS.has(reason)) {
                    setPendingPlan(null);
                    setFatalReason(mapFatalReason(reason));
                    return;
                }

                setPendingPlan((prev) =>
                    prev ? { ...prev, status: 'selection_error', errorReason: reason } : prev
                );
            } catch {
                setPendingPlan((prev) =>
                    prev ? { ...prev, status: 'selection_error', errorReason: 'network_error' } : prev
                );
            }
        },
        [_token]
    );

    const runSubscriptionCreation = useCallback(
        async (paymentPlanId: string, pincode: string) => {
            try {
                const res = await fetch('/api/subscription-creation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: _token,
                        payment_plan_id: paymentPlanId,
                        pincode,
                    }),
                });
                const data = await res.json().catch(() => ({}));

                if (
                    res.ok &&
                    data.valid &&
                    data.provider_subscription_id &&
                    data.razorpay_key
                ) {
                    setPendingPlan(null);
                    const userPaymentPlanId: string | undefined = data.user_payment_plan_id;
                    openCheckout({
                        key: data.razorpay_key,
                        subscription_id: data.provider_subscription_id,
                        name: 'August',
                        description: '',
                        notes: {
                            pincode,
                            ...(userPaymentPlanId
                                ? { user_payment_plan_id: userPaymentPlanId }
                                : {}),
                        },
                        theme: { color: '#34a07e' },
                        handler: () => {
                            handleRazorpaySuccess(userPaymentPlanId);
                        },
                    });
                    return;
                }

                const reason: string | undefined = data?.reason;

                if (reason === 'already_subscribed') {
                    setPendingPlan((prev) =>
                        prev ? { ...prev, status: 'already_subscribed' } : prev
                    );
                    return;
                }

                if (reason && FATAL_CHECKOUT_REASONS.has(reason)) {
                    setPendingPlan(null);
                    setFatalReason(mapFatalReason(reason));
                    return;
                }

                setPendingPlan((prev) =>
                    prev ? { ...prev, status: 'creation_error', errorReason: reason } : prev
                );
            } catch {
                setPendingPlan((prev) =>
                    prev ? { ...prev, status: 'creation_error', errorReason: 'network_error' } : prev
                );
            }
        },
        [_token, openCheckout, handleRazorpaySuccess]
    );

    const handleSubscribe = (plan: {
        paymentPlanId: string;
        title: string;
        price: string;
        originalPrice: string;
        savings?: string;
    }) => {
        setPendingPlan({ ...plan, status: 'selecting' });
        void runPlanSelection(plan.paymentPlanId);
    };

    const handleConfirm = (pincode: string) => {
        if (!pendingPlan) return;

        if (pendingPlan.status === 'ready') {
            setPendingPlan({ ...pendingPlan, status: 'creating', errorReason: undefined });
            void runSubscriptionCreation(pendingPlan.paymentPlanId, pincode);
            return;
        }

        if (pendingPlan.status === 'already_subscribed') {
            // TODO: POST pincode to /api/authorized and swap to success UI.
            setPendingPlan(null);
            return;
        }
    };

    const handleRetry = (pincode: string) => {
        if (!pendingPlan) return;

        if (pendingPlan.status === 'creation_error') {
            setPendingPlan({ ...pendingPlan, status: 'creating', errorReason: undefined });
            void runSubscriptionCreation(pendingPlan.paymentPlanId, pincode);
            return;
        }

        setPendingPlan({ ...pendingPlan, status: 'selecting', errorReason: undefined });
        void runPlanSelection(pendingPlan.paymentPlanId);
    };

    if (completion) {
        return <PaymentSuccess state={completion.state} data={completion.data} />;
    }

    if (fatalReason) {
        return <PaymentLinkError reason={fatalReason} />;
    }

    return (
        <main className="sub-dark-root relative">
            {/* Grainy gradient backdrop */}
            <div className="sub-bg" aria-hidden />
            <div className="sub-blobs" aria-hidden>
                <span className="sub-blob sub-blob-1" />
                <span className="sub-blob sub-blob-2" />
                <span className="sub-blob sub-blob-3" />
                <span className="sub-blob sub-blob-4" />
            </div>
            <div className="sub-grain" aria-hidden />

            <div className="relative mx-auto max-w-[1000px] px-5 sm:px-8 md:px-12 lg:px-16 pt-5 sm:pt-10 pb-10">
                {/* Top meta row */}
                <div className="mb-3 sm:mb-8 flex items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/august-logo.svg"
                        alt="August"
                        className="h-[20px] sm:h-[26px]"
                        style={{ width: 'auto', opacity: 0.92 }}
                    />
                </div>

                {/* Hero block */}
                <section className="relative mb-1 sm:mb-12" style={{ padding: '4px 0' }}>
                    <h1
                        className="frx"
                        style={{
                            fontSize: 'clamp(28px, 3.6vw, 38px)',
                            fontWeight: 300,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.15,
                            color: CREAM,
                            marginBottom: '8px',
                        }}
                    >
                        Uninterrupted access to{' '}
                        <br/>
                        <span style={{ color: SAGE, fontWeight: 400 }}>your august</span>
                    </h1>

                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <p
                            className="hidden sm:block"
                            style={{
                                maxWidth: '68ch',
                                fontSize: 'clamp(15.5px, 1.4vw, 18px)',
                                fontWeight: 300,
                                lineHeight: 1.7,
                                color: CREAM_DIM,
                            }}
                        >
                            An AI health companion who actually remembers — everyone in your family, every lab report, every meal. Pick the rhythm that fits.
                        </p>

                    </div>
                </section>

                {/* Plans */}
                <section className="relative mb-16">
                    <div className="mb-6">
                        <Ruler label="01 / Choose your plan" />
                    </div>

                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mx-auto"
                        style={{
                            maxWidth: '1000px',
                            alignItems: 'stretch',
                        }}
                    >
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.paymentPlanId}
                                {...plan}
                                showFeatures={showFeatures}
                                onSubscribe={handleSubscribe}
                            />
                        ))}
                    </div>

                    {plansError && (
                        <div
                            className="flex items-center justify-center"
                            style={{ minHeight: '200px', color: CREAM_DIM, fontSize: '14px' }}
                        >
                            {plansError}
                        </div>
                    )}

                    {!plansError && plans.length === 0 && (
                        <div
                            className="flex items-center justify-center text-center"
                            style={{ minHeight: '200px', color: CREAM_DIM, fontSize: '14px' }}
                        >
                            No plans are available right now. Please check back later.
                        </div>
                    )}

                    <div className="mt-8 flex items-center justify-center gap-2" style={{ fontSize: 'clamp(12.5px, 1.05vw, 14px)', color: CREAM_FAINT }}>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M3 6V4.5a4 4 0 1 1 8 0V6M2.5 6h9v6a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V6Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Secure payments by Razorpay · UPI, cards, net banking
                    </div>

                    <p
                        className="block sm:hidden"
                        style={{
                            marginTop: '24px',
                            fontSize: '15px',
                            fontWeight: 300,
                            lineHeight: 1.7,
                            color: CREAM_DIM,
                        }}
                    >
                        An AI health companion who actually remembers — everyone in your family, every lab report, every meal. Pick the rhythm that fits.
                    </p>
                </section>

                {/* FAQ */}
                <section className="relative">
                    <div className="mb-6">
                        <Ruler label="02 / Frequently asked" />
                    </div>

                    <div className="max-w-[980px]">
                    <h3
                        className="frx"
                        style={{
                            fontSize: 'clamp(28px, 3.6vw, 38px)',
                            fontWeight: 300,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.15,
                            color: CREAM,
                            marginBottom: '8px',
                        }}
                    >
                        Questions before you <em style={{ color: SAGE }}>subscribe.</em>
                    </h3>

                    <div className="mt-10">
                        <FaqItem
                            n="Q.01"
                            q="What do I get with a subscription?"
                            a="Uninterrupted messages with August — no daily caps, plus increase media processing limits."
                        />
                        <FaqItem
                            n="Q.02"
                            q="How does billing work?"
                            a="Each plan is a single upfront payment that covers the full duration mentioned. Your subscription renews automatically at the end of that period, and you can cancel anytime."
                        />
                        <FaqItem
                            n="Q.03"
                            q="Are payments secure?"
                            a="Yes. Payments are processed by Razorpay and support UPI, cards and net banking. August never stores your card details."
                        />
                        <FaqItem
                            n="Q.04"
                            q="Can I switch plans later?"
                            a="Yes. You can switch plans at any time. Reach out at support@meetaugust.ai and we’ll help you switch."
                        />
                    </div>

                    <p
                        style={{
                            marginTop: '40px',
                            textAlign: 'center',
                            fontSize: '13px',
                            color: CREAM_FAINT,
                        }}
                    >
                        Need help? Email{' '}
                        <a href="mailto:support@meetaugust.ai" style={{ color: SAGE, fontWeight: 500 }}>
                            support@meetaugust.ai
                        </a>
                    </p>
                    </div>
                </section>

            </div>

            {pendingPlan && (
                <PincodeDialog
                    plan={pendingPlan}
                    status={pendingPlan.status}
                    errorReason={pendingPlan.errorReason}
                    onClose={() => setPendingPlan(null)}
                    onConfirm={handleConfirm}
                    onRetry={handleRetry}
                />
            )}

            <style jsx global>{`
                .sub-dark-root {
                    min-height: 100%;
                    color: ${CREAM};
                    background: #F3F0E8;
                }
                .sub-bg {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                    background: linear-gradient(170deg, #F5F2EC 0%, #EEEBE3 50%, #E9E5DC 100%);
                }
                .sub-blobs {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                    overflow: hidden;
                }
                .sub-blob {
                    position: absolute;
                    border-radius: 50%;
                    background: #ffffff;
                    filter: blur(90px);
                    will-change: transform;
                }
                .sub-blob-1 {
                    width: 520px;
                    height: 520px;
                    top: -12%;
                    left: -8%;
                    opacity: 0.75;
                    animation: blobA 24s ease-in-out infinite alternate;
                }
                .sub-blob-2 {
                    width: 460px;
                    height: 460px;
                    top: 8%;
                    right: -10%;
                    opacity: 0.65;
                    animation: blobB 30s ease-in-out infinite alternate;
                }
                .sub-blob-3 {
                    width: 620px;
                    height: 620px;
                    bottom: -22%;
                    left: 28%;
                    opacity: 0.7;
                    animation: blobC 28s ease-in-out infinite alternate;
                }
                .sub-blob-4 {
                    width: 380px;
                    height: 380px;
                    top: 42%;
                    right: 18%;
                    opacity: 0.55;
                    animation: blobD 34s ease-in-out infinite alternate;
                }
                @keyframes blobA {
                    0%   { transform: translate(0, 0) scale(1); }
                    50%  { transform: translate(80px, 60px) scale(1.08); }
                    100% { transform: translate(-40px, 140px) scale(0.92); }
                }
                @keyframes blobB {
                    0%   { transform: translate(0, 0) scale(1); }
                    50%  { transform: translate(-100px, 50px) scale(1.12); }
                    100% { transform: translate(60px, -90px) scale(0.9); }
                }
                @keyframes blobC {
                    0%   { transform: translate(0, 0) scale(1); }
                    33%  { transform: translate(-140px, -70px) scale(1.06); }
                    66%  { transform: translate(90px, 50px) scale(0.94); }
                    100% { transform: translate(50px, -110px) scale(1.1); }
                }
                @keyframes blobD {
                    0%   { transform: translate(0, 0) scale(1); }
                    50%  { transform: translate(-60px, 80px) scale(1.14); }
                    100% { transform: translate(110px, -40px) scale(0.88); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .sub-blob { animation: none; }
                }
                .sub-grain {
                    position: fixed;
                    inset: 0;
                    z-index: 1;
                    pointer-events: none;
                    opacity: 0.08;
                    mix-blend-mode: multiply;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
                }
                .frx {
                    font-family: 'Inter Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-weight: 300;
                    letter-spacing: -0.025em;
                }
                .frx em {
                    font-style: normal;
                    font-weight: 400;
                    letter-spacing: -0.02em;
                }
                @property --plan-rim-angle {
                    syntax: '<angle>';
                    inherits: false;
                    initial-value: 0deg;
                }
                .plan-rim {
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    padding: 2px;
                    background: conic-gradient(
                        from var(--plan-rim-angle),
                        transparent 0deg,
                        transparent 110deg,
                        rgba(196, 181, 253, 0.45) 135deg,
                        rgba(196, 181, 253, 0.95) 160deg,
                        #7c3aed 175deg,
                        #ddd6fe 180deg,
                        #7c3aed 185deg,
                        rgba(196, 181, 253, 0.95) 200deg,
                        rgba(196, 181, 253, 0.45) 225deg,
                        transparent 250deg,
                        transparent 360deg
                    );
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    filter: drop-shadow(0 0 8px rgba(109, 40, 217, 0.55))
                            drop-shadow(0 0 18px rgba(196, 181, 253, 0.4));
                    animation: planRimSpin 9s linear infinite;
                    pointer-events: none;
                    z-index: 2;
                }
                .plan-rim-a { animation-delay: 0s; }
                .plan-rim-b { animation-delay: -4.5s; }
                @keyframes planRimSpin {
                    to { --plan-rim-angle: 360deg; }
                }
                .plan-card > *:not(.plan-rim) {
                    position: relative;
                    z-index: 1;
                }
                @media (prefers-reduced-motion: reduce) {
                    .plan-rim { animation: none; }
                }
                .pincode-dialog {
                    position: relative;
                    width: min(944px, calc(100vw - 32px));
                    height: min(628px, calc(100vh - 32px));
                    background: #ffffff;
                    border-radius: 20px;
                    border: 1px solid rgba(28, 25, 23, 0.08);
                    color: #1C1917;
                    display: grid;
                    grid-template-columns: 1fr 1.05fr;
                    overflow: hidden;
                    box-shadow:
                        0 40px 80px -30px rgba(17, 24, 39, 0.45),
                        0 16px 32px -16px rgba(17, 24, 39, 0.2);
                }
                .pincode-close {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    z-index: 3;
                    width: 34px;
                    height: 34px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 999px;
                    border: none;
                    background: rgba(255, 255, 255, 0.85);
                    color: rgba(28, 25, 23, 0.7);
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    transition: background 0.15s ease, color 0.15s ease;
                }
                .pincode-close:hover {
                    background: #ffffff;
                    color: #1C1917;
                }
                /* ── LEFT: emerald brand pane ── */
                .pincode-brand {
                    position: relative;
                    padding: 44px;
                    color: #FAF9F5;
                    background: linear-gradient(160deg, #0f3a2c 0%, #184d3d 35%, #206E55 70%, #2a8a6c 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow: hidden;
                }
                .pincode-brand-glow {
                    position: absolute;
                    inset: -40% -10% auto auto;
                    width: 80%;
                    aspect-ratio: 1;
                    background: radial-gradient(circle, rgba(168, 213, 186, 0.35) 0%, transparent 65%);
                    filter: blur(20px);
                    pointer-events: none;
                }
                .pincode-brand-logo {
                    position: relative;
                    height: 28px;
                    width: auto;
                    align-self: flex-start;
                    filter: brightness(0) invert(1);
                    opacity: 0.95;
                }
                .pincode-brand-hero {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .pincode-brand-eyebrow {
                    font-family: 'Geist', ui-monospace, monospace;
                    font-size: 10.5px;
                    font-weight: 500;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: rgba(250, 249, 245, 0.55);
                }
                .pincode-brand-plan {
                    margin: 0;
                    font-size: clamp(30px, 3.8vw, 44px);
                    font-weight: 300;
                    letter-spacing: -0.028em;
                    line-height: 1.04;
                    color: #FAF9F5;
                }
                .pincode-brand-tagline {
                    margin: 6px 0 0;
                    font-size: 14.5px;
                    font-weight: 300;
                    line-height: 1.55;
                    color: rgba(250, 249, 245, 0.72);
                    max-width: 26ch;
                }
                .pincode-brand-pricerow {
                    margin-top: 20px;
                    padding-top: 18px;
                    border-top: 1px solid rgba(250, 249, 245, 0.14);
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 12px 16px;
                }
                .pincode-brand-pricegroup {
                    display: flex;
                    align-items: baseline;
                    gap: 10px;
                }
                .pincode-brand-orig {
                    font-size: 16px;
                    font-weight: 400;
                    color: rgba(250, 249, 245, 0.42);
                    text-decoration: line-through;
                    text-decoration-thickness: 1px;
                }
                .pincode-brand-price {
                    font-family: 'Inter Display', sans-serif;
                    font-size: 32px;
                    font-weight: 400;
                    letter-spacing: -0.02em;
                    line-height: 1;
                    color: #FAF9F5;
                }
                .pincode-brand-savings {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 10px 5px 8px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.12);
                    border: 1px solid rgba(255, 255, 255, 0.22);
                    font-family: 'Geist', ui-monospace, monospace;
                    font-size: 10.5px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #FAF9F5;
                }
                .pincode-brand-foot {
                    position: relative;
                    margin: 0;
                    font-size: 12px;
                    font-weight: 400;
                    letter-spacing: 0.01em;
                    color: rgba(250, 249, 245, 0.52);
                }
                /* ── RIGHT: form pane ── */
                .pincode-form {
                    padding: 56px 48px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 14px;
                }
                .pincode-eyebrow {
                    font-family: 'Geist', ui-monospace, monospace;
                    font-size: 10.5px;
                    font-weight: 500;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: #206E55;
                }
                .pincode-title {
                    font-size: 24px;
                    font-weight: 400;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                    color: #1C1917;
                    margin: 0;
                }
                .pincode-title em {
                    font-style: normal;
                    font-weight: 400;
                    color: #206E55;
                }
                .pincode-lede {
                    margin: 0;
                    font-size: 13.5px;
                    line-height: 1.6;
                    color: rgba(28, 25, 23, 0.66);
                }
                .pincode-input {
                    width: 100%;
                    padding: 16px 18px;
                    font-size: 17px;
                    font-weight: 500;
                    letter-spacing: 0.15em;
                    color: #1C1917;
                    background: #FAF9F5;
                    border: 1px solid rgba(28, 25, 23, 0.14);
                    border-radius: 14px;
                    outline: none;
                    font-family: inherit;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
                }
                .pincode-input::placeholder {
                    font-weight: 400;
                    letter-spacing: 0;
                    color: rgba(28, 25, 23, 0.38);
                }
                .pincode-input:focus {
                    background: #ffffff;
                    border-color: #206E55;
                    box-shadow: 0 0 0 3px rgba(32, 110, 85, 0.15);
                }
                .pincode-locate {
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    align-items: center;
                    gap: 14px;
                    padding: 14px 16px;
                    width: 100%;
                    border-radius: 14px;
                    border: 1px solid rgba(28, 25, 23, 0.12);
                    background: #ffffff;
                    color: #1C1917;
                    text-align: left;
                    cursor: pointer;
                    transition:
                        border-color 0.15s ease,
                        background 0.15s ease,
                        transform 0.15s ease;
                }
                .pincode-locate:hover:not(:disabled) {
                    border-color: rgba(28, 25, 23, 0.25);
                    background: rgba(28, 25, 23, 0.025);
                }
                .pincode-locate:disabled { cursor: progress; opacity: 0.7; }
                .pincode-locate-icon {
                    color: #1C1917;
                    flex-shrink: 0;
                }
                .pincode-locate-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }
                .pincode-locate-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #1C1917;
                }
                .pincode-locate-sub {
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(28, 25, 23, 0.58);
                }
                .pincode-locate-arrow {
                    color: rgba(28, 25, 23, 0.5);
                    flex-shrink: 0;
                    transition: transform 0.15s ease, color 0.15s ease;
                }
                .pincode-locate:hover:not(:disabled) .pincode-locate-arrow {
                    transform: translateX(2px);
                    color: #1C1917;
                }
                .pincode-err {
                    margin: -8px 0 0;
                    font-size: 12px;
                    color: #B91C1C;
                }
                .pincode-submit {
                    margin-top: 4px;
                    width: 100%;
                    height: 52px;
                    border-radius: 999px;
                    border: none;
                    background: #1C1917;
                    color: #FAF9F5;
                    font-size: 15px;
                    font-weight: 500;
                    letter-spacing: -0.005em;
                    cursor: pointer;
                    transition: transform 0.15s ease, filter 0.15s ease;
                }
                .pincode-submit:hover:not(:disabled) {
                    transform: translateY(-1px);
                    filter: brightness(1.1);
                }
                .pincode-submit:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .pincode-form-logo { display: none; }
                @media (max-width: 720px) {
                    .pincode-dialog {
                        width: 100vw;
                        height: 100dvh;
                        border-radius: 0;
                        border: none;
                        box-shadow: none;
                        grid-template-columns: 1fr;
                        grid-template-rows: auto 1fr;
                    }
                    .pincode-close {
                        top: calc(env(safe-area-inset-top, 0px) + 12px);
                        right: 12px;
                    }
                    /* Green header block — centered Razorpay-style */
                    .pincode-brand {
                        display: flex;
                        align-items: center;
                        text-align: center;
                        padding: calc(env(safe-area-inset-top, 0px) + 28px) 22px 36px;
                        gap: 16px;
                    }
                    .pincode-brand-logo {
                        align-self: center;
                        height: 30px;
                        opacity: 1;
                    }
                    .pincode-brand-hero {
                        align-items: center;
                        text-align: center;
                        gap: 6px;
                    }
                    .pincode-brand-eyebrow {
                        font-size: 10px;
                        color: rgba(250, 249, 245, 0.6);
                    }
                    .pincode-brand-plan {
                        font-size: 20px;
                        font-weight: 500;
                        letter-spacing: -0.01em;
                    }
                    .pincode-brand-tagline { display: none; }
                    .pincode-brand-pricerow {
                        margin-top: 12px;
                        padding-top: 0;
                        border-top: none;
                        flex-direction: column;
                        gap: 6px;
                        align-items: center;
                    }
                    .pincode-brand-pricegroup {
                        flex-direction: column;
                        gap: 2px;
                        align-items: center;
                    }
                    .pincode-brand-orig { font-size: 13px; }
                    .pincode-brand-price { font-size: 40px; }
                    .pincode-brand-foot { display: none; }

                    /* White form block */
                    .pincode-form {
                        padding: 28px 22px calc(env(safe-area-inset-bottom, 0px) + 32px);
                        gap: 14px;
                        justify-content: flex-start;
                    }
                    .pincode-form-logo { display: none; }

                    /* Rectangular inputs + buttons (Razorpay-style) */
                    .pincode-input {
                        background: #ffffff;
                        border-radius: 10px;
                        font-size: 15px;
                        letter-spacing: 0;
                        padding: 14px 16px;
                    }
                    .pincode-locate {
                        border-radius: 10px;
                        padding: 12px 14px;
                    }
                    .pincode-submit {
                        border-radius: 10px;
                        height: 54px;
                        font-size: 15.5px;
                    }

                    /* Close button — cream chip on the green header */
                    .pincode-close {
                        background: rgba(250, 249, 245, 0.18);
                        color: #FAF9F5;
                    }
                    .pincode-close:hover {
                        background: rgba(250, 249, 245, 0.28);
                        color: #FAF9F5;
                    }
                }
                @media (max-width: 640px) {
                    .plan-card {
                        padding: 20px 20px 20px !important;
                    }
                    .plan-card .plan-cta {
                        height: 56px !important;
                        margin-top: 16px !important;
                    }
                    .plan-card .plan-price-row {
                        gap: 8px !important;
                    }
                    .plan-card .plan-savings-pill {
                        font-size: 10.5px !important;
                        padding: 3px 8px 3px 7px !important;
                        letter-spacing: 0.06em !important;
                    }
                }
                .plan-card:hover {
                    transform: translateY(-6px);
                    box-shadow:
                        inset 3px 3px 2px -3px rgba(255, 255, 255, 0.9),
                        inset -3px -3px 2px -3px rgba(255, 255, 255, 0.9),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.55),
                        inset 0 0 14px 2px rgba(255, 255, 255, 0.28),
                        0 28px 56px -24px rgba(23, 69, 58, 0.28),
                        0 12px 28px -14px rgba(17, 24, 39, 0.12);
                }
                @media (prefers-reduced-motion: reduce) {
                    .plan-card { transition: none !important; }
                }
                .plan-cta:hover {
                    transform: translateY(-1px);
                    filter: brightness(1.05);
                }
                .plan-cta[data-recommended='true']:hover {
                    box-shadow: ${CTA_SHADOW}, 0 14px 30px -8px rgba(52, 160, 126, 0.55);
                }
            `}</style>
        </main>
    );
}
