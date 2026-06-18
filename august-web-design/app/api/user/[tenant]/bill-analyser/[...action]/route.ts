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

  if (actionPath === 'run') {
    try {
      const body = await request.json();
      const backendUrl = resolveBackendUrl(request);
      const url = `${backendUrl}/user/${tenant}/bill-analyser/run`;

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
        } catch { /* not JSON, use raw text */ }
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
      logger.error('Bill analyser SSE run proxy failed', { error: error.message });
      return NextResponse.json({ success: false, error: 'Pipeline request failed' }, { status: 500 });
    }
  }

  try {
    const body = await request.json();
    const backendUrl = resolveBackendUrl(request);
    const url = `${backendUrl}/user/${tenant}/bill-analyser/${actionPath}`;

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
      'Bill analyser request failed';

    logger.error(`Bill analyser ${actionPath} failed`, { status, message });

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
      const url = `${backendUrl}/user/${tenant}/bill-analyser/${actionPath}`;

      const backendRes = await fetch(url, {
        headers: Object.fromEntries(buildForwardHeaders(request).entries()),
      });

      if (!backendRes.ok) {
        const text = await backendRes.text().catch(() => 'Status check failed');
        return NextResponse.json({ success: false, error: text }, { status: backendRes.status });
      }

      return NextResponse.json(await backendRes.json());
    } catch (error: any) {
      logger.error('Bill analyser run status proxy failed', { error: error.message });
      return NextResponse.json({ success: false, error: 'Status check failed' }, { status: 500 });
    }
  }

  if (action[0] === 'runs') {
    try {
      const backendUrl = resolveBackendUrl(request);
      const url = `${backendUrl}/user/${tenant}/bill-analyser/${actionPath}${new URL(request.url).search}`;

      const backendRes = await fetch(url, {
        headers: Object.fromEntries(buildForwardHeaders(request).entries()),
      });

      if (!backendRes.ok) {
        const text = await backendRes.text().catch(() => 'Failed to fetch runs');
        return NextResponse.json({ success: false, error: text }, { status: backendRes.status });
      }

      return NextResponse.json(await backendRes.json());
    } catch (error: any) {
      logger.error('Bill analyser runs proxy failed', { error: error.message });
      return NextResponse.json({ success: false, error: 'Failed to fetch runs' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
}
