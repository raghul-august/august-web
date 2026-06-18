import logger from '@/utils/logger';

export interface ApiPlan {
    id: string;
    slug: string;
    name: string;
    description: string;
    amount: number;
    original_amount: number;
    currency: string;
    duration_days: number;
    active: boolean;
    provider: string;
    provider_plan_id: string;
    features: string[];
}

const PAYMENT_PLANS_REVALIDATE_SECONDS = 300;

export async function fetchPaymentPlans(): Promise<ApiPlan[] | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL_DEFAULT;
    const token = process.env.API_INTERNAL_SYSTEM_AUTH_TOKEN;
    const slug = process.env.NEXT_PUBLIC_TENANT || 'august';

    if (!baseUrl || !token) {
        logger.error('[payment-plans] missing env', {
            hasBaseUrl: !!baseUrl,
            hasToken: !!token,
        });
        return null;
    }

    try {
        const res = await fetch(`${baseUrl}/s/c/${slug}/payment-plans`, {
            headers: { Authorization: `Bearer ${token}` },
            next: {
                revalidate: PAYMENT_PLANS_REVALIDATE_SECONDS,
                tags: ['payment-plans'],
            },
        });

        if (!res.ok) {
            logger.error('[payment-plans] upstream error', { status: res.status });
            return null;
        }

        const data = await res.json();
        if (!data.success || !Array.isArray(data.plans)) {
            logger.error('[payment-plans] malformed response');
            return null;
        }

        return data.plans as ApiPlan[];
    } catch (err) {
        logger.error('[payment-plans] fetch failed', { err: String(err) });
        return null;
    }
}
