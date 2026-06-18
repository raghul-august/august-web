import { NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { resolveBackendUrl, buildForwardHeaders } from '@/server/backend-selector';


export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;
    const body = await request.text();
    const backendUrl = resolveBackendUrl(request);
    const url = `${backendUrl}/c/${tenant}/webhook-stream`;

    const backendResponse = await fetch(url, {
      method: 'POST',
      headers: buildForwardHeaders(request),
      body,
    } as RequestInit);

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const serialized = serializeError(error);
    logger.error('Webhook stream proxy failed', serialized);

    const status =
      (error as { response?: { status?: number } })?.response?.status || 500;

    return NextResponse.json(
      { success: false, error: 'Failed to stream response' },
      { status }
    );
  }
}
