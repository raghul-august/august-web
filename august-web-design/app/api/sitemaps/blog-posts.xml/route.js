import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { BASE_URL } from "../helpers";

const logger = require("../../../utils/logger");

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT handle AS slug, updated_at AS lastmod
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY updated_at DESC`,
      []
    );

    const urls = rows.map((row) => {
      const lastmod = row.lastmod
        ? new Date(row.lastmod).toISOString().split("T")[0]
        : "";
      const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${BASE_URL}/blog/${row.slug}</loc>${lastmodTag}\n  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    logger.error("Failed to build blog-posts sitemap", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
