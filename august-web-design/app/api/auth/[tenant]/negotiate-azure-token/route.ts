import { NextResponse } from 'next/server';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { serializeError } from '@/services/error-reporter';
import logger from '@/utils/logger';
import { resolveBackendUrl } from '@/server/backend-selector';
import { forwardSetCookies } from '@/server/cookie-forwarder';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;
    const backendUrl = resolveBackendUrl(request);
    const url = `${backendUrl}/auth/${tenant}/negotiate-azure-token`;

    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.Authorization = authHeader;
    }
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    const response = await axios.get<{ url: string }>(url, {
      headers,
      withCredentials: true,
    });

    const nextResponse = NextResponse.json(response.data);
    forwardSetCookies(response.headers, nextResponse);
    return nextResponse;
  } catch (error) {
    const serialized = serializeError(error);
    logger.error('Failed to negotiate WebPubSub token', serialized);

    const axiosError = error as AxiosError<{ error?: string }>;
    const status =
      axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.error ||
      'Failed to negotiate token';

    const nextResponse = NextResponse.json(
      { success: false, error: message },
      { status }
    );
    forwardSetCookies(axiosError.response?.headers, nextResponse);
    return nextResponse;
  }
}
