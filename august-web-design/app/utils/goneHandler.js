import { NextResponse } from 'next/server';

const ARTICLE_PATTERN = /^\/([a-z]{2})\/(articles|mental-health|prevention-wellness|diseases-conditions|symptoms|medications|tests-procedures)\/([^/]+)$/;

function buildGoneHtml(lang) {
  const libraryUrl = `/${lang}/library`;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="5;url=${libraryUrl}">
  <title>Article No Longer Available</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; color: #1f2937; }
    .container { text-align: center; max-width: 480px; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #6b7280; line-height: 1.6; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>This article is no longer available</h1>
    <p>You'll be redirected to our <a href="${libraryUrl}">Health Library</a> in 5 seconds.</p>
  </div>
  <script>setTimeout(function(){ window.location.href = "${libraryUrl}"; }, 5000);</script>
</body>
</html>`;
}

// Returns a 410 NextResponse if the article is deleted, or null to continue
export async function handleDeletedArticle(request) {
  const pathname = request.nextUrl.pathname;
  const match = pathname.match(ARTICLE_PATTERN);
  if (!match) return null;

  const [, lang, category, slug] = match;
  if (slug === 'index') return null;

  try {
    const statusUrl = new URL(`/api/article-status/${category}/${slug}`, request.url);
    const res = await fetch(statusUrl);
    if (res.ok) {
      const { status } = await res.json();
      if (status === 'deleted') {
        return new NextResponse(buildGoneHtml(lang), {
          status: 410,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    }
  } catch (_) {
    // fall through on error
  }
  return null;
}
