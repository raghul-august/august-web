import { NextResponse } from 'next/server';
import logger from '@/utils/logger';
import axios from 'axios';
import { AnonymousSessionResponse } from '@/types';
import { serializeError } from '@/services/error-reporter';
import { verifyTurnstileToken } from '@/utils/turnstile';
import { resolveBackendUrl } from '@/server/backend-selector';
import { forwardSetCookies } from '@/server/cookie-forwarder';
import type { AxiosError } from 'axios';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;
    const body = await request.json();
    const { turnstileToken, ...rest } = body as {
      turnstileToken?: string;
      [key: string]: unknown;
    };

    if (!turnstileToken) {
      return NextResponse.json(
        { success: false, error: 'Missing verification token' },
        { status: 400 }
      );
    }

    const remoteIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
    const verification = await verifyTurnstileToken(turnstileToken, remoteIp);

    if (!verification.success) {
      logger.warn('Turnstile verification failed', {
        errors: verification['error-codes'],
        action: verification.action,
      });
      return NextResponse.json(
        { success: false, error: 'Verification failed' },
        { status: 400 }
      );
    }

    const backendUrl = resolveBackendUrl(request, rest?.countryCode as string | undefined);
    const url = `${backendUrl}/auth/${tenant}/anonymous-session`;
    const response = await axios.post<AnonymousSessionResponse>(url, rest, {
      withCredentials: true,
    });
    const nextResponse = NextResponse.json(response.data);
    forwardSetCookies(response.headers, nextResponse);
    return nextResponse;
  } catch (err) {
    logger.error('Failed to initialize auth', serializeError(err));
    const axiosError = err as AxiosError<{ error?: string }>;
    const status = axiosError.response?.status ?? 500;
    const nextResponse = NextResponse.json(
      { success: false, error: 'Failed to initialize session' },
      { status }
    );
    forwardSetCookies(axiosError.response?.headers, nextResponse);
    return nextResponse;
  }
}
