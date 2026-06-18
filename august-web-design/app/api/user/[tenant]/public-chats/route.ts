import { NextResponse } from 'next/server';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { serializeError } from '@/services/error-reporter';
import logger from '@/utils/logger';
import { resolveBackendUrl, buildForwardHeaders, getAlternateBackendUrl } from '@/server/backend-selector';
import { forwardSetCookies } from '@/server/cookie-forwarder';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Missing code parameter' },
        { status: 400 }
      );
    }

    const backendUrl = resolveBackendUrl(request);
    const url = `${backendUrl}/user/${tenant}/public-chats`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: { code },
      });
      return NextResponse.json(response.data);
    } catch (primaryError) {
      const primaryAxiosError = primaryError as AxiosError<{ error?: string }>;
      if (primaryAxiosError.response?.status === 404) {
        const alternateBackendUrl = getAlternateBackendUrl(backendUrl);
        const alternateUrl = `${alternateBackendUrl}/user/${tenant}/public-chats`;

        const alternateResponse = await axios.get(alternateUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
          params: { code },
        });
        return NextResponse.json(alternateResponse.data);
      }
      throw primaryError;
    }
  } catch (error) {
    const serialized = serializeError(error);
    logger.error('Public chats fetch failed', serialized);
    const axiosError = error as AxiosError<{ error?: string }>;
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.error || 'Failed to fetch public chats';

    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;
    const body = await request.json();
    const backendUrl = resolveBackendUrl(request);
    const url = `${backendUrl}/user/${tenant}/public-chats`;

    const response = await axios.post(url, body, {
      withCredentials: true,
      headers: Object.fromEntries(buildForwardHeaders(request).entries()),
    });

    const nextResponse = NextResponse.json(response.data);
    forwardSetCookies(response.headers, nextResponse);
    return nextResponse;
  } catch (error) {
    const serialized = serializeError(error);
    logger.error('Public share creation failed', serialized);
    const axiosError = error as AxiosError<{ error?: string }>;
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.error || 'Failed to create public share';

    const nextResponse = NextResponse.json({ success: false, error: message }, { status });
    forwardSetCookies(axiosError.response?.headers, nextResponse);
    return nextResponse;
  }
}
