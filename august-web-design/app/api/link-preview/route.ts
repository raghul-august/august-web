import { NextRequest, NextResponse } from 'next/server';

const FETCH_TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 512 * 1024;

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  domain: string;
}

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.localhost')) return true;
  if (/^127\./.test(h)) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (h === '::1' || h.startsWith('fe80:') || h.startsWith('fc') || h.startsWith('fd')) return true;
  return false;
}

function parseSafeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (isPrivateHost(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractMeta(html: string, property: string): string | null {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `<meta[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']` +
      `|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["']`,
    'i',
  );
  const m = html.match(re);
  if (!m) return null;
  const raw = m[1] || m[2];
  return raw ? decodeHtmlEntities(raw) : null;
}

function extractTitle(html: string): string | null {
  const og = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title');
  if (og) return og;
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m && m[1] ? decodeHtmlEntities(m[1].trim()) : null;
}

function resolveAbsolute(maybe: string | null, base: URL): string | null {
  if (!maybe) return null;
  try {
    return new URL(maybe, base).toString();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url');
  if (!rawUrl) {
    return NextResponse.json({ error: 'missing url' }, { status: 400 });
  }
  const target = parseSafeUrl(rawUrl);
  if (!target) {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(target.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; AugustHealth-LinkPreviewBot/1.0; +https://meetaugust.ai)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'fetch failed', status: res.status }, { status: 502 });
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return NextResponse.json({ error: 'not html' }, { status: 422 });
    }

    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: 'no body' }, { status: 502 });
    }
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let html = '';
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_HTML_BYTES) {
        await reader.cancel().catch(() => {});
        break;
      }
      html += decoder.decode(value, { stream: true });
      if (html.includes('</head>')) {
        await reader.cancel().catch(() => {});
        break;
      }
    }

    const finalUrl = (() => {
      try {
        return new URL(res.url || target.toString());
      } catch {
        return target;
      }
    })();

    const data: LinkPreviewData = {
      url: finalUrl.toString(),
      title: extractTitle(html),
      description:
        extractMeta(html, 'og:description') ||
        extractMeta(html, 'twitter:description') ||
        extractMeta(html, 'description'),
      image: resolveAbsolute(
        extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image'),
        finalUrl,
      ),
      domain: finalUrl.hostname.replace(/^www\./, ''),
    };

    if (!data.title && !data.description && !data.image) {
      return NextResponse.json({ error: 'no metadata' }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    const message = err?.name === 'AbortError' ? 'timeout' : err?.message || 'fetch error';
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
