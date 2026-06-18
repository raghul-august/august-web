import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { buildSitemapXmlFromRows } from "../helpers";

const logger = require("../../../utils/logger");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT c.slug, COALESCE(c.updated_at, c.created_at) AS lastmod,
              COALESCE(ARRAY_AGG(DISTINCT l.code) FILTER (WHERE l.code IS NOT NULL), ARRAY['en']) AS locale_codes
       FROM condition_new c
       LEFT JOIN condition_translations_new t ON t.condition_id = c.id
       LEFT JOIN languages l ON l.id = t.language_id
       WHERE c.status = 'published'
       GROUP BY c.slug, c.updated_at, c.created_at`,
      []
    );
    const sitemap = buildSitemapXmlFromRows(
      rows,
      (row) => `/diseases-conditions/${row.slug}`
    );

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    logger.error("Failed to build diseases & conditions sitemap", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
