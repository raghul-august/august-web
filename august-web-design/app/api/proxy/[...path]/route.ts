import { NextRequest, NextResponse } from 'next/server';

const US_CANADA_CODES = ['US', 'CA'];
const BACKEND_URLS = {
  US_CANADA: process.env.NEXT_PUBLIC_API_URL_US || 'https://gatekeeper-prod-us.getbeyondhealth.com',
  DEFAULT: process.env.NEXT_PUBLIC_API_URL_DEFAULT || 'https://gatekeeper-staging.getbeyondhealth.com',
};

function getBackendUrl(countryCode: string | null): string {
  if (countryCode && US_CANADA_CODES.includes(countryCode)) {
    return BACKEND_URLS.US_CANADA;
  }
  return BACKEND_URLS.DEFAULT;
}

async function handleProxy(request: NextRequest, params: Promise<{ path: string[] }>) {
  const { path } = await params;
  const pathname = path.join('/');

  // Get country code from header (set by client) or cookie
  const countryCode = request.headers.get('x-country-code') ||
    request.cookies.get('august_country_code')?.value ||
    null;

  const backendUrl = getBackendUrl(countryCode);
  const targetUrl = new URL(pathname, backendUrl);

  // Forward query params
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  console.log(`[Proxy] ${request.method} ${pathname} -> ${targetUrl.toString()} (country: ${countryCode || 'unknown'})`);

  console.log(`[Proxy] ${request.method} ${pathname} -> ${targetUrl.toString()} (country: ${countryCode || 'unknown'})`);

  // Clone headers, removing host
  const headers = new Headers(request.headers);
  headers.delete('host');

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
    });

    // Clone response headers
    const responseHeaders = new Headers(response.headers);

    // Return proxied response
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy error', message: String(error) },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context.params);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context.params);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context.params);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context.params);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context.params);
}
