import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

const logger = require("../../utils/logger");

export const dynamic = "force-dynamic";

const BASE = "https://www.meetaugust.ai/sitemaps";

const SITEMAPS = [
  { file: "static.xml", table: null },
  { file: "articles.xml", table: "blogs" },
  { file: "symptoms.xml", table: "symptom_new" },
  { file: "diseasesconditions.xml", table: "condition_new" },
  { file: "testprocedures.xml", table: "test_procedures_new" },
  { file: "medications.xml", table: "medications_new" },
  { file: "mentalhealth.xml", table: "mental_health_new" },
  { file: "preventionwellness.xml", table: "prevention_wellness_new" },
  { file: "tools.xml", table: null },
  { file: "blog-posts.xml", table: "blog_posts" },
];

export async function GET() {
  try {
    const entries = await Promise.all(
      SITEMAPS.map(async ({ file, table }) => {
        let lastmodTag = "";
        if (table) {
          const { rows } = await query(
            `SELECT MAX(COALESCE(updated_at, created_at)) AS latest FROM ${table} WHERE status = 'published'`
          );
          const latest = rows[0]?.latest;
          if (latest) {
            lastmodTag = `\n    <lastmod>${new Date(latest).toISOString().split('T')[0]}</lastmod>`;
          }
        }
        return `  <sitemap>\n    <loc>${BASE}/${file}</loc>${lastmodTag}\n  </sitemap>`;
      })
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</sitemapindex>`;

    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    logger.error("Failed to build sitemap index", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
