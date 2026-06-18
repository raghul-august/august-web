import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import PaymentPageWrapper from '@/app/components/website/landing/PaymentPageWrapper';
import SubscriptionsContent from '@/app/components/website/landing/SubscriptionsContent';
import PaymentLinkError from '@/app/components/website/landing/PaymentLinkError';
import PaymentSuccess from '@/app/components/website/landing/PaymentSuccess';
import { fetchPaymentPlans } from '@/lib/payment-plans';
import { buildSuccessData, type SuccessData } from '@/lib/payment-success';

async function fetchUserPaymentPlanSuccess(userPaymentPlanId: string): Promise<SuccessData | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL_DEFAULT;
    const authToken = process.env.API_INTERNAL_SYSTEM_AUTH_TOKEN;
    const slug = process.env.NEXT_PUBLIC_TENANT || 'august';
    if (!baseUrl || !authToken) return null;

    try {
        const res = await fetch(
            `${baseUrl}/s/payments/${encodeURIComponent(slug)}/user-payment-plan/${encodeURIComponent(userPaymentPlanId)}`,
            {
                headers: { Authorization: `Bearer ${authToken}` },
                cache: 'no-store',
            }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.valid || !data.payment_plan || !data.user_payment_plan) {
            return null;
        }
        return buildSuccessData(data.payment_plan, data.user_payment_plan);
    } catch {
        return null;
    }
}

export const metadata: Metadata = {
    title: 'Subscriptions — August Health',
    description:
        'Unlock unlimited messages with August. Choose a monthly or 3-month plan.',
};

type ValidationResult =
    | { kind: 'valid' }
    | { kind: 'redirect'; url: string }
    | { kind: 'completed'; userPaymentPlanId: string }
    | {
          kind: 'error';
          reason:
              | 'checkout_link_not_found'
              | 'checkout_link_expired'
              | 'checkout_link_completed'
              | 'checkout_link_lookup_failed'
              | 'network_error';
      };

type ClientContext = {
    ip: string | null;
    userAgent: string | null;
    chUa: string | null;
    chUaMobile: string | null;
    chUaPlatform: string | null;
};

function buildForwardedHeaders(ctx: ClientContext, authToken: string): HeadersInit {
    const h: Record<string, string> = {
        Authorization: `Bearer ${authToken}`,
    };
    if (ctx.ip) h['X-Forwarded-For'] = ctx.ip;
    if (ctx.userAgent) h['User-Agent'] = ctx.userAgent;
    if (ctx.chUa) h['Sec-CH-UA'] = ctx.chUa;
    if (ctx.chUaMobile) h['Sec-CH-UA-Mobile'] = ctx.chUaMobile;
    if (ctx.chUaPlatform) h['Sec-CH-UA-Platform'] = ctx.chUaPlatform;
    return h;
}

async function validateCheckoutLink(token: string, ctx: ClientContext): Promise<ValidationResult> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL_DEFAULT;
    const authToken = process.env.API_INTERNAL_SYSTEM_AUTH_TOKEN;
    const slug = process.env.NEXT_PUBLIC_TENANT || 'august';

    if (!baseUrl || !authToken) {
        return { kind: 'error', reason: 'checkout_link_lookup_failed' };
    }

    try {
        const res = await fetch(
            `${baseUrl}/s/payments/${encodeURIComponent(slug)}/checkout/${encodeURIComponent(token)}/open`,
            {
                headers: buildForwardedHeaders(ctx, authToken),
                cache: 'no-store',
            }
        );

        if (res.status === 200) {
            const data = await res.json().catch(() => ({}));
            if (data?.valid && data?.action === 'redirect' && typeof data?.redirect_url === 'string') {
                return { kind: 'redirect', url: data.redirect_url };
            }
            return { kind: 'valid' };
        }
        if (res.status === 404) {
            return { kind: 'error', reason: 'checkout_link_not_found' };
        }
        if (res.status === 410) {
            const data = await res.json().catch(() => ({}));
            if (data?.reason === 'checkout_link_completed') {
                if (data?.user_payment_plan_id) {
                    return { kind: 'completed', userPaymentPlanId: data.user_payment_plan_id };
                }
                return { kind: 'error', reason: 'checkout_link_completed' };
            }
            return { kind: 'error', reason: 'checkout_link_expired' };
        }
        return { kind: 'error', reason: 'checkout_link_lookup_failed' };
    } catch {
        return { kind: 'error', reason: 'network_error' };
    }
}

export default async function PaymentPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const h = await headers();
    const ctx: ClientContext = {
        ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip'),
        userAgent: h.get('user-agent'),
        chUa: h.get('sec-ch-ua'),
        chUaMobile: h.get('sec-ch-ua-mobile'),
        chUaPlatform: h.get('sec-ch-ua-platform'),
    };

    // Hold the loading screen for at least 0.5s so it doesn't flash by when
    // the upstream calls are fast.
    const minimumLoadMs = 500;

    const [result, plans] = await Promise.all([
        validateCheckoutLink(token, ctx),
        fetchPaymentPlans(),
        new Promise<void>((resolve) => setTimeout(resolve, minimumLoadMs)),
    ]);

    if (result.kind === 'redirect') {
        redirect(result.url);
    }

    if (result.kind === 'completed') {
        const successData = await fetchUserPaymentPlanSuccess(result.userPaymentPlanId);
        return (
            <PaymentPageWrapper>
                {successData ? (
                    <PaymentSuccess state="success" data={successData} />
                ) : (
                    <PaymentLinkError reason="checkout_link_lookup_failed" />
                )}
            </PaymentPageWrapper>
        );
    }

    return (
        <PaymentPageWrapper>
            {result.kind === 'error' ? (
                <PaymentLinkError reason={result.reason} />
            ) : (
                <SubscriptionsContent token={token} initialPlans={plans} />
            )}
        </PaymentPageWrapper>
    );
}
