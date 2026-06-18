import { notFound, redirect, permanentRedirect } from 'next/navigation';

// Status checks for page components — throws via notFound()/redirect()/permanentRedirect()
export function applyArticleStatusChecks(article, language, categoryPath, slug) {
  if (article.status === 'archived') redirect(`/${language}/library`);
  if (article.status !== 'published') notFound();
  if (language !== 'en' && !article.has_translation) {
    permanentRedirect(`/en/${categoryPath}/${slug}`);
  }
}

// Status checks for generateMetadata — returns metadata object or null (null = proceed normally)
export function applyMetadataStatusChecks(article, language, categoryPath, slug) {
  if (!article) return null;
  if (article.status === 'deleted') {
    return { title: 'Article No Longer Available', robots: { index: false } };
  }
  if (article.status === 'archived') {
    redirect(`/${language}/library`);
  }
  if (article.status !== 'published') {
    return { title: 'Not Found', robots: { index: false } };
  }
  if (language !== 'en' && !article.has_translation) {
    permanentRedirect(`/en/${categoryPath}/${slug}`);
  }
  return null;
}

export function extractFirstH1FromHtml(html) {
  if (!html) return null;
  const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  return match ? match[1].trim() : null;
}

export function extractFirstPFromHtml(html) {
  if (!html) return null;
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return match ? match[1].trim() : null;
}
