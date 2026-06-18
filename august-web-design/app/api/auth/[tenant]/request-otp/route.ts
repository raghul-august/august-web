import { NextResponse } from 'next/server';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { serializeError } from '@/services/error-reporter';
import logger from '@/utils/logger';
import { resolveBackendUrl, buildForwardHeaders } from '@/server/backend-selector';
import { forwardSetCookies } from '@/server/cookie-forwarder';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;
    const body = await request.json();
    const backendUrl = resolveBackendUrl(request, body?.countryCode as string | undefined);
    const url = `${backendUrl}/auth/${tenant}/request-otp`;

    const response = await axios.post(url, body, {
      withCredentials: true,
      headers: Object.fromEntries(buildForwardHeaders(request).entries()),
    });

    const nextResponse = NextResponse.json(response.data);
    nextResponse.headers.set('x-backend-url', backendUrl);
    forwardSetCookies(response.headers, nextResponse);
    return nextResponse;
  } catch (error) {
    const serialized = serializeError(error);
    logger.error('Request OTP failed', serialized);
    const status = (error as { response?: { status?: number } })?.response?.status || 500;
    const message =
      (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Failed to request OTP';

    const nextResponse = NextResponse.json({ success: false, error: message }, { status });
    const axiosError = error as AxiosError;
    forwardSetCookies(axiosError.response?.headers, nextResponse);
    return nextResponse;
  }
}
