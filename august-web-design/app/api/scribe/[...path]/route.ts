import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendUrl, buildForwardHeaders } from '@/server/backend-selector';
import { API_CONFIG } from '@/lib/config';

export const runtime = 'nodejs';

async function handleScribeProxy(request: NextRequest, params: Promise<{ path: string[] }>) {
  const { path } = await params;
  // The client resolves the active tenant (honoring incognito mode) and sends
  // it as a header, since getActiveTenant() can't run here on the server.
  const tenant = request.headers.get('x-august-tenant') || API_CONFIG.TENANT;
  const pathname = `user/${tenant}/scribe/${path.join('/')}`;
  const backendUrl = process.env.SCRIBE_BACKEND_URL || resolveBackendUrl(request);
  const targetUrl = new URL(pathname, backendUrl);

  const headers = buildForwardHeaders(request);

  let body: Buffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    // Buffer the full request body — express-fileupload on gatekeeper
    // needs a complete multipart body, not a ReadableStream
    const arrayBuffer = await request.arrayBuffer();
    body = Buffer.from(arrayBuffer);
    headers.set('content-length', String(body.length));
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: body as BodyInit | undefined,
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
  } catch (error) {
    console.error('[Scribe Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy error', message: String(error) },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleScribeProxy(request, context.params);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleScribeProxy(request, context.params);
}
