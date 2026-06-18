import { NextResponse } from 'next/server';
import logger from '@/utils/logger';

export async function POST(request: Request) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL_DEFAULT;
    const authToken = process.env.API_INTERNAL_SYSTEM_AUTH_TOKEN;
    const slug = process.env.NEXT_PUBLIC_TENANT || 'august';

    if (!baseUrl || !authToken) {
        logger.error('[plan-selection] missing env', {
            hasBaseUrl: !!baseUrl,
            hasToken: !!authToken,
        });
        return NextResponse.json(
            { valid: false, reason: 'payment_plan_selection_failed' },
            { status: 500 }
        );
    }

    let body: { token?: string; payment_plan_id?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { valid: false, reason: 'payment_plan_id_required' },
            { status: 400 }
        );
    }

    const token = body.token;
    const paymentPlanId = body.payment_plan_id;

    if (!token) {
        return NextResponse.json(
            { valid: false, reason: 'checkout_link_not_found' },
            { status: 404 }
        );
    }
    if (!paymentPlanId) {
        return NextResponse.json(
            { valid: false, reason: 'payment_plan_id_required' },
            { status: 400 }
        );
    }

    const forwarded: Record<string, string> = {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
    };
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip');
    const ua = request.headers.get('user-agent');
    const chUa = request.headers.get('sec-ch-ua');
    const chUaMobile = request.headers.get('sec-ch-ua-mobile');
    const chUaPlatform = request.headers.get('sec-ch-ua-platform');
    if (ip) forwarded['X-Forwarded-For'] = ip;
    if (ua) forwarded['User-Agent'] = ua;
    if (chUa) forwarded['Sec-CH-UA'] = chUa;
    if (chUaMobile) forwarded['Sec-CH-UA-Mobile'] = chUaMobile;
    if (chUaPlatform) forwarded['Sec-CH-UA-Platform'] = chUaPlatform;

    try {
        const upstream = await fetch(
            `${baseUrl}/s/payments/${encodeURIComponent(slug)}/checkout/${encodeURIComponent(token)}/plan-selection`,
            {
                method: 'POST',
                headers: forwarded,
                body: JSON.stringify({ payment_plan_id: paymentPlanId }),
                cache: 'no-store',
            }
        );
        const data = await upstream.json().catch(() => ({}));
        return NextResponse.json(data, { status: upstream.status });
    } catch (err) {
        logger.error('[plan-selection] fetch failed', { err: String(err) });
        return NextResponse.json(
            { valid: false, reason: 'payment_plan_selection_failed' },
            { status: 502 }
        );
    }
}
