import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, COOKIE_CONFIG } from '@/lib/config';
import { buildForwardHeaders, resolveBackendUrl } from '@/server/backend-selector';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const targetUrl = new URL(`user/${API_CONFIG.TENANT}/upload-media`, resolveBackendUrl(request));
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const headers = buildForwardHeaders(request);
  if (!headers.has('authorization')) {
    const token = request.cookies.get(COOKIE_CONFIG.ACCESS_TOKEN)?.value;
    if (token) headers.set('authorization', `Bearer ${token}`);
  }

  try {
    const body = Buffer.from(await request.arrayBuffer());
    headers.set('content-length', String(body.length));

    const response = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers,
      body,
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
  } catch (error) {
    console.error('[Upload Media Proxy] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload proxy error' },
      { status: 502 },
    );
  }
}
