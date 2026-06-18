import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { buildSitemapXmlFromRows } from "../helpers";

const logger = require("../../../utils/logger");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT m.handle as slug, COALESCE(m.updated_at, m.created_at) AS lastmod,
              COALESCE(ARRAY_AGG(DISTINCT l.code) FILTER (WHERE l.code IS NOT NULL), ARRAY['en']) AS locale_codes
       FROM prevention_wellness_new m
       LEFT JOIN prevention_wellness_translations_new t ON t.prevention_wellness_id = m.id
       LEFT JOIN languages l ON l.id = t.language_id
       WHERE m.status = 'published'
       GROUP BY m.handle, m.updated_at, m.created_at`,
      []
    );
    const sitemap = buildSitemapXmlFromRows(
      rows,
      (row) => `/prevention-wellness/${row.slug}`
    );

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    logger.error("Failed to build prevention wellness sitemap", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
