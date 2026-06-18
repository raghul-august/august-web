export const BASE_URL = "https://www.meetaugust.ai";

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const ALTERNATE_LOCALES = [
  "x-default",
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ru",
  "zh-Hans",
  "zh-Hant",
  "ja",
  "ko",
  "ar",
  "hi",
  "nl",
  "pl",
  "sv",
  "no",
  "da",
  "fi",
  "cs",
  "hu",
  "ro",
  "el",
  "uk",
  "bg",
  "hr",
  "sk",
  "sl",
  "et",
  "lv",
  "lt",
  "is",
  "ga",
  "mt",
  "sq",
  "be",
  "bs",
  "gd",
  "lb",
  "mk",
  "sr",
  "cy",
  "vi",
  "th",
  "id",
  "ms",
  "tl",
  "bn",
  "ur",
  "ta",
  "te",
  "mr",
  "gu",
  "kn",
  "pa",
  "ne",
  "my",
  "km",
  "si",
  "ml",
  "mn",
  "jv",
  "su",
  "sw",
  "he",
  "fa",
  "tr",
  "af",
  "am",
  "so",
  "yo",
  "zu",
  "ha",
  "ig",
  "rw",
  "om",
  "sn",
  "ht",
  "mi",
  "haw",
  "la",
];

export function buildAlternateLinks(pathSuffix) {
  return ALTERNATE_LOCALES.map((locale) => {
    const localePath = locale === "x-default" ? "en" : locale;
    return `    <xhtml:link rel="alternate" hreflang="${escapeXml(locale)}" href="${escapeXml(`${BASE_URL}/${localePath}${pathSuffix}`)}"/>`;
  }).join("\n");
}

export function buildAlternateLinksForLocales(pathSuffix, localeCodes) {
  const codeSet = new Set(localeCodes ?? []);
  codeSet.add("en");
  const locales = ["x-default", ...codeSet];
  return locales.map((locale) => {
    const localePath = locale === "x-default" ? "en" : locale;
    return `    <xhtml:link rel="alternate" hreflang="${escapeXml(locale)}" href="${escapeXml(`${BASE_URL}/${localePath}${pathSuffix}`)}"/>`;
  }).join("\n");
}

export function buildSitemapXmlFromRows(rows, buildPathSuffix) {
  const filteredRows = (rows ?? []).filter((row) => row && row.slug);
  // One <url> per slug (English loc) with hreflang alternates — keeps sitemaps under Google's 50MB limit
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue('<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n');
      for (const row of filteredRows) {
        const pathSuffix = buildPathSuffix(row);
        if (!pathSuffix) continue;
        const lastmod = formatLastmod(row.lastmod);
        const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
        const localeCodes = row.locale_codes && row.locale_codes.length > 0
          ? row.locale_codes
          : ["en"];
        const alternateLinks = buildAlternateLinksForLocales(pathSuffix, localeCodes);
        controller.enqueue(`  <url>\n    <loc>${escapeXml(`${BASE_URL}/en${pathSuffix}`)}</loc>${lastmodTag}\n${alternateLinks}\n  </url>\n`);
      }
      controller.enqueue('</urlset>');
      controller.close();
    }
  });
  return stream;
}

function formatLastmod(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}
