import linkPreviewDomainsConfig from '@/app/data/link-preview-domains.json';

export interface LinkPreviewDomain {
  domain: string;
  params: Record<string, boolean>;
}

export const LINK_PREVIEW_DOMAINS: LinkPreviewDomain[] =
  linkPreviewDomainsConfig.domains as LinkPreviewDomain[];

const URL_REGEX = /https?:\/\/[^\s<>"']+/gi;

export function cleanTrailingPunctuation(rawUrl: string): string {
  return rawUrl.replace(/[.,;:!?)\]}>]+$/, '');
}

export function extractFirstUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const matches = text.match(URL_REGEX);
  if (!matches || matches.length === 0) return null;
  return cleanTrailingPunctuation(matches[0]);
}

export function extractAllUrls(text: string | null | undefined): string[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  // Dedupe while preserving order (a message that pastes the same link twice
  // should still only show one preview).
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    const cleaned = cleanTrailingPunctuation(m);
    if (!seen.has(cleaned)) {
      seen.add(cleaned);
      out.push(cleaned);
    }
  }
  return out;
}

/**
 * Remove a URL (and the trailing punctuation we stripped off it) from a
 * message string and tidy whitespace, so the remainder can be used as the
 * caption inside a link preview card.
 */
export function stripUrlFromText(text: string, url: string): string {
  const idx = text.indexOf(url);
  if (idx === -1) return text.trim();
  let endIdx = idx + url.length;
  while (endIdx < text.length && /[.,;:!?)\]}>]/.test(text[endIdx])) {
    endIdx++;
  }
  return (text.slice(0, idx) + text.slice(endIdx)).replace(/\s+/g, ' ').trim();
}

export function findMatchedDomain(
  url: string,
  domains: LinkPreviewDomain[] = LINK_PREVIEW_DOMAINS,
): LinkPreviewDomain | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      domains.find((d) => host === d.domain) ||
      domains.find((d) => host.endsWith('.' + d.domain)) ||
      null
    );
  } catch {
    return null;
  }
}
