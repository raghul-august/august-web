import { NextResponse } from "next/server";
import { BASE_URL } from "../helpers";

const TOOLS = [
  { slug: "appeal-assistant", lastmod: "2026-04-23" },
  { slug: "bac-calculator", lastmod: "2026-05-19" },
  { slug: "bill-analyser", lastmod: "2026-04-23" },
  { slug: "bmi-calculator", lastmod: "2026-05-18" },
  { slug: "bmr-calculator", lastmod: "2026-05-19" },
  { slug: "body-fat-calculator", lastmod: "2026-05-19" },
  { slug: "childhood-trauma-test", lastmod: "2026-05-15" },
  { slug: "chronotype-test", lastmod: "2026-05-15" },
  { slug: "cost-estimator", lastmod: "2026-04-23" },
  { slug: "drug-interaction-checker", lastmod: "2026-05-15" },
  { slug: "free-adhd-test", lastmod: "2026-05-15" },
  { slug: "future-self", lastmod: "2026-05-06" },
  { slug: "glp1-budget-calculator", lastmod: "2026-05-15" },
  { slug: "glp1-coverage-check", lastmod: "2026-05-15" },
  { slug: "glp1-dose-calculator", lastmod: "2026-05-15" },
  { slug: "glp1-meal-planner", lastmod: "2026-05-15" },
  { slug: "glp1-plateau-calculator", lastmod: "2026-05-15" },
  { slug: "glp1-supply-tracker", lastmod: "2026-05-15" },
  { slug: "glp1-titration-calculator", lastmod: "2026-05-15" },
  { slug: "hydration-calculator", lastmod: "2026-05-15" },
  { slug: "import-memory", lastmod: "2026-04-30" },
  { slug: "injection-site-tracker", lastmod: "2026-05-15" },
  { slug: "ivf-success-estimator", lastmod: "2026-05-19" },
  { slug: "pregnancy-weight-gain-calculator", lastmod: "2026-05-19" },
  { slug: "rice-purity-test", lastmod: "2026-05-15" },
  { slug: "sexual-orientation-test", lastmod: "2026-05-15" },
  { slug: "tdee-calculator", lastmod: "2026-05-15" },
  { slug: "weight-loss-timeline-projector", lastmod: "2026-05-15" },
];

const TOOLS_SITEMAP_XML = buildToolsSitemapXml();

export async function GET() {
  return new NextResponse(TOOLS_SITEMAP_XML, {
    headers: { "Content-Type": "application/xml" },
  });
}

function buildToolsSitemapXml() {
  const entries = TOOLS.map(
    ({ slug, lastmod }) => `  <url>
    <loc>${BASE_URL}/tool/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}
