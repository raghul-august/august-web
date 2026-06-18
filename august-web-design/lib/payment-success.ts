export type SuccessData = {
    planName: string;
    amountPaid: string;
    originalAmount?: string;
    amountSaved?: string;
    durationLabel: string;
    periodStart?: string | null;
    periodEnd?: string | null;
};

export function formatDurationDays(days: number): string {
    if (days <= 0) return '';
    if (days === 30) return '1 month';
    if (days === 365) return '1 year';
    if (days < 60) return `${days} days`;
    if (days % 30 === 0) {
        const months = days / 30;
        return `${months} months`;
    }
    return `${days} days`;
}

export function formatPriceMinorUnits(minor: number, currency: string): string {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '';
    const major = minor / 100;
    const rounded = Math.round(major * 10) / 10;
    const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    return `${symbol}${formatted}`;
}

export function formatPeriodDate(iso: string | null | undefined): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function buildSuccessData(
    paymentPlan: {
        name: string;
        amount: number;
        original_amount: number;
        currency: string;
        duration_days: number;
    },
    userPaymentPlan: {
        current_period_start?: string | null;
        current_period_end?: string | null;
        paid_at?: string | null;
    }
): SuccessData {
    const saved = paymentPlan.original_amount - paymentPlan.amount;
    const periodEnd = userPaymentPlan.current_period_end
        ?? computeEndFromStart(userPaymentPlan.paid_at, paymentPlan.duration_days);
    return {
        planName: paymentPlan.name,
        amountPaid: formatPriceMinorUnits(paymentPlan.amount, paymentPlan.currency),
        originalAmount:
            paymentPlan.original_amount > paymentPlan.amount
                ? formatPriceMinorUnits(paymentPlan.original_amount, paymentPlan.currency)
                : undefined,
        amountSaved: saved > 0 ? formatPriceMinorUnits(saved, paymentPlan.currency) : undefined,
        durationLabel: formatDurationDays(paymentPlan.duration_days),
        periodStart: userPaymentPlan.current_period_start ?? null,
        periodEnd,
    };
}

function computeEndFromStart(start: string | null | undefined, durationDays: number): string | null {
    if (!start || durationDays <= 0) return null;
    const d = new Date(start);
    if (Number.isNaN(d.getTime())) return null;
    d.setUTCDate(d.getUTCDate() + durationDays);
    return d.toISOString();
}
