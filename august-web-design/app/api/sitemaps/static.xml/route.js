import { NextResponse } from "next/server";
import { BASE_URL, buildAlternateLinks } from "../helpers";

const SIMPLE_PAGES = [
  { path: "", lastmod: "2025-10-07" },
  { path: "/about", lastmod: "2025-10-07" },
  { path: "/prescription-reader", lastmod: "2025-10-07" },
  { path: "/privacy", lastmod: "2025-10-07" },
  { path: "/terms", lastmod: "2025-10-07" },
  { path: "/august-benchmark", lastmod: "2023-09-24" },
  { path: "/august-benchmark-2026", lastmod: "2025-12-01" },
  { path: "/benchmarks", lastmod: "2025-12-01" },
  { path: "/benchmark", lastmod: "2025-12-01" },
];

const LIBRARY_HOME_SUBPATH = "/library";
const LIBRARY_HOME_LASTMOD = "2025-05-20";

const SECTION_SUBPATHS = [
  "articles",
  "diseases-conditions",
  "tests-procedures",
  "symptoms",
  "medications",
  "mental-health",
  "prevention-wellness",
];

const SECTION_LASTMOD = "2025-05-20";

const STATIC_SITEMAP_XML = buildStaticSitemapXml();

export async function GET() {
  return new NextResponse(STATIC_SITEMAP_XML, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

function buildStaticSitemapXml() {
  const simpleEntries = SIMPLE_PAGES.map(({ path, lastmod }) => {
    const loc = path ? `${BASE_URL}${path}` : BASE_URL;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
  }).join("\n");

  const libraryHomeEntry = `  <url>
    <loc>${BASE_URL}/en${LIBRARY_HOME_SUBPATH}</loc>
    <lastmod>${LIBRARY_HOME_LASTMOD}</lastmod>
${buildAlternateLinks(LIBRARY_HOME_SUBPATH)}
  </url>`;

  const sectionEntries = SECTION_SUBPATHS.map((subPath) => {
    const pathSuffix = `/${subPath}`;
    const loc = `${BASE_URL}/en${pathSuffix}`;
    const alternateLinks = buildAlternateLinks(pathSuffix);
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${SECTION_LASTMOD}</lastmod>
${alternateLinks}
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${simpleEntries}
${libraryHomeEntry}
${sectionEntries}
</urlset>`;
}
