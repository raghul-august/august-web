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
    const backendUrl = resolveBackendUrl(request);
    const url = `${backendUrl}/user/${tenant}/feedback`;

    const response = await axios.post(url, body, {
      withCredentials: true,
      headers: Object.fromEntries(buildForwardHeaders(request).entries()),
    });

    const nextResponse = NextResponse.json(response.data);
    forwardSetCookies(response.headers, nextResponse);
    return nextResponse;
  } catch (error) {
    const serialized = serializeError(error);
    logger.error('Feedback submission failed', serialized);
    const axiosError = error as AxiosError<{ error?: string }>;
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.error || 'Failed to submit feedback';

    const nextResponse = NextResponse.json({ success: false, error: message }, { status });
    forwardSetCookies(axiosError.response?.headers, nextResponse);
    return nextResponse;
  }
}
