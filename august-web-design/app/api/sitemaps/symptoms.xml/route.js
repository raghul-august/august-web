import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { buildSitemapXmlFromRows } from "../helpers";

const logger = require("../../../utils/logger");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT s.slug, COALESCE(s.updated_at, s.created_at) AS lastmod,
              COALESCE(ARRAY_AGG(DISTINCT l.code) FILTER (WHERE l.code IS NOT NULL), ARRAY['en']) AS locale_codes
       FROM symptom_new s
       LEFT JOIN symptom_translations_new t ON t.symptom_id = s.id
       LEFT JOIN languages l ON l.id = t.language_id
       WHERE s.status = 'published'
       GROUP BY s.slug, s.updated_at, s.created_at`,
      []
    );
    const sitemap = buildSitemapXmlFromRows(
      rows,
      (row) => `/symptoms/${row.slug}`
    );

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    logger.error("Failed to build symptoms sitemap", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
