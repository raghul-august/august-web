import { NextResponse } from 'next/server';
import logger from '@/utils/logger';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userPaymentPlanId: string }> }
) {
    const { userPaymentPlanId } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL_DEFAULT;
    const authToken = process.env.API_INTERNAL_SYSTEM_AUTH_TOKEN;
    const slug = process.env.NEXT_PUBLIC_TENANT || 'august';

    if (!baseUrl || !authToken) {
        logger.error('[user-payment-plan] missing env', {
            hasBaseUrl: !!baseUrl,
            hasToken: !!authToken,
        });
        return NextResponse.json({ valid: false }, { status: 500 });
    }

    if (!userPaymentPlanId) {
        return NextResponse.json({ valid: false }, { status: 400 });
    }

    try {
        const upstream = await fetch(
            `${baseUrl}/s/payments/${encodeURIComponent(slug)}/user-payment-plan/${encodeURIComponent(userPaymentPlanId)}`,
            {
                headers: { Authorization: `Bearer ${authToken}` },
                cache: 'no-store',
            }
        );
        const data = await upstream.json().catch(() => ({}));
        return NextResponse.json(data, { status: upstream.status });
    } catch (err) {
        logger.error('[user-payment-plan] fetch failed', { err: String(err) });
        return NextResponse.json({ valid: false }, { status: 502 });
    }
}
