import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { buildSitemapXmlFromRows } from "../helpers";

const logger = require("../../../utils/logger");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT m.slug, COALESCE(m.updated_at, m.created_at) AS lastmod,
              COALESCE(ARRAY_AGG(DISTINCT l.code) FILTER (WHERE l.code IS NOT NULL), ARRAY['en']) AS locale_codes
       FROM medications_new m
       LEFT JOIN medications_translations_new t ON t.medications_id = m.id
       LEFT JOIN languages l ON l.id = t.language_id
       WHERE m.status = 'published'
       GROUP BY m.slug, m.updated_at, m.created_at`,
      []
    );
    const sitemap = buildSitemapXmlFromRows(
      rows,
      (row) => `/medications/${row.slug}`
    );

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    logger.error("Failed to build medications sitemap", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
