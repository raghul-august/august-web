import { NextResponse } from 'next/server';
import axios from 'axios';
import type { AxiosError } from 'axios';
import logger from '@/utils/logger';
import { resolveBackendUrl, buildForwardHeaders } from '@/server/backend-selector';
import { forwardSetCookies } from '@/server/cookie-forwarder';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenant: string; action: string[] }> }
) {
  const { tenant, action } = await params;
  const actionPath = action.join('/');

  if (action[0] === 'run' && action[1] && action[2] === 'release') {
    try {
      const backendUrl = resolveBackendUrl(request);
      const url = `${backendUrl}/user/${tenant}/future-self/${actionPath}`;
      const body = await request.json().catch(() => ({}));
      const response = await axios.post(url, body, {
        withCredentials: true,
        timeout: 30_000,
        headers: Object.fromEntries(buildForwardHeaders(request).entries()),
      });
      const nextResponse = NextResponse.json(response.data);
      forwardSetCookies(response.headers, nextResponse);
      return nextResponse;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      const status = axiosError.response?.status || 500;
      const message =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        'Future self release failed';
      logger.error('Future self release proxy failed', { status, message });
      return NextResponse.json({ success: false, error: message }, { status });
    }
  }

  if (actionPath === 'run') {
    try {
      const body = await request.json();
      const backendUrl = resolveBackendUrl(request);
      const url = `${backendUrl}/user/${tenant}/future-self/run`;

      const backendRes = await fetch(url, {
        method: 'POST',
        headers: Object.fromEntries(buildForwardHeaders(request).entries()),
        body: JSON.stringify(body),
      });

      if (!backendRes.ok || !backendRes.body) {
        const text = await backendRes.text().catch(() => 'SSE connection failed');
        let errorMessage = text;
        try {
          const parsed = JSON.parse(text);
          errorMessage = parsed.message || parsed.error || text;
        } catch { /* not JSON */ }
        return NextResponse.json({ success: false, error: errorMessage }, { status: backendRes.status || 502 });
      }

      return new Response(backendRes.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    } catch (error: any) {
      logger.error('Future self SSE run proxy failed', { error: error.message });
      return NextResponse.json({ success: false, error: 'Pipeline request failed' }, { status: 500 });
    }
  }

  try {
    const body = await request.json();
    const backendUrl = resolveBackendUrl(request);
    const url = `${backendUrl}/user/${tenant}/future-self/${actionPath}`;

    const response = await axios.post(url, body, {
      withCredentials: true,
      timeout: 180_000,
      headers: Object.fromEntries(buildForwardHeaders(request).entries()),
    });

    const nextResponse = NextResponse.json(response.data);
    forwardSetCookies(response.headers, nextResponse);
    return nextResponse;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      'Future self request failed';

    logger.error(`Future self ${actionPath} failed`, { status, message });

    const nextResponse = NextResponse.json({ success: false, error: message }, { status });
    forwardSetCookies(axiosError.response?.headers, nextResponse);
    return nextResponse;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenant: string; action: string[] }> }
) {
  const { tenant, action } = await params;
  const actionPath = action.join('/');

  if (action[0] === 'run' && action[1] && action[2] === 'status') {
    try {
      const backendUrl = resolveBackendUrl(request);
      const url = `${backendUrl}/user/${tenant}/future-self/${actionPath}`;

      const backendRes = await fetch(url, {
        headers: Object.fromEntries(buildForwardHeaders(request).entries()),
      });

      if (!backendRes.ok) {
        const text = await backendRes.text().catch(() => 'Status check failed');
        return NextResponse.json({ success: false, error: text }, { status: backendRes.status });
      }

      return NextResponse.json(await backendRes.json());
    } catch (error: any) {
      logger.error('Future self run status proxy failed', { error: error.message });
      return NextResponse.json({ success: false, error: 'Status check failed' }, { status: 500 });
    }
  }

  if (action[0] === 'quota') {
    try {
      const backendUrl = resolveBackendUrl(request);
      const url = `${backendUrl}/user/${tenant}/future-self/quota`;
      const backendRes = await fetch(url, {
        headers: Object.fromEntries(buildForwardHeaders(request).entries()),
      });
      if (!backendRes.ok) {
        const text = await backendRes.text().catch(() => 'Quota check failed');
        return NextResponse.json({ success: false, error: text }, { status: backendRes.status });
      }
      return NextResponse.json(await backendRes.json());
    } catch (error: any) {
      logger.error('Future self quota proxy failed', { error: error.message });
      return NextResponse.json({ success: false, error: 'Quota check failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
}
