import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { BASE_URL } from "../helpers";

const logger = require("../../../utils/logger");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT slug, created_at FROM health_library_authors WHERE status = 'published'`
    );

    const urlEntries = rows
      .filter((row) => row && row.slug)
      .map((row) => {
        const lastmod = row.created_at
          ? new Date(row.created_at).toISOString().split('T')[0]
          : null;
        const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
        return `  <url>
    <loc>${BASE_URL}/en/author/${row.slug}</loc>${lastmodTag}
  </url>`;
      })
      .join("\n");

    const sitemap = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    logger.error("Failed to build authors sitemap", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
