import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { buildSitemapXmlFromRows } from "../helpers";

const logger = require("../../../utils/logger");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT tp.slug, COALESCE(tp.updated_at, tp.created_at) AS lastmod,
              COALESCE(ARRAY_AGG(DISTINCT l.code) FILTER (WHERE l.code IS NOT NULL), ARRAY['en']) AS locale_codes
       FROM test_procedures_new tp
       LEFT JOIN test_procedures_translations_new t ON t.procedure_id = tp.id
       LEFT JOIN languages l ON l.id = t.language_id
       WHERE tp.status = 'published'
       GROUP BY tp.slug, tp.updated_at, tp.created_at`,
      []
    );
    const sitemap = buildSitemapXmlFromRows(
      rows,
      (row) => `/tests-procedures/${row.slug}`
    );

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    logger.error("Failed to build test procedures sitemap", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
