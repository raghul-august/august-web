import type { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';
import { NextResponse } from 'next/server';

type CookieHeaderSource =
  | AxiosResponseHeaders
  | RawAxiosResponseHeaders
  | (Partial<Record<string, unknown>> & { ['set-cookie']?: string | string[] })
  | undefined;

export function forwardSetCookies(
  headers: CookieHeaderSource,
  nextResponse: NextResponse
) {
  if (!headers) {
    return;
  }

  const rawHeader = (headers as {
    ['set-cookie']?: string | string[];
  })['set-cookie'];

  if (!rawHeader) {
    return;
  }

  const setCookies = Array.isArray(rawHeader) ? rawHeader : [rawHeader];

  for (const cookie of setCookies) {
    if (cookie) {
      nextResponse.headers.append('set-cookie', cookie);
    }
  }
}
