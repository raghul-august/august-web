import { query } from "@/app/lib/db";

export interface ToolLandingData {
  body_html: string | null;
  cta: {
    headline: string;
    subheadline: string;
    label: string;
    benefits: string[];
  } | null;
  faqs: { q: string; answer_html: string }[] | null;
  seo_schemas: Record<string, unknown>[] | null;
}

export async function getToolLanding(
  toolId: string
): Promise<ToolLandingData | null> {
  const result = await query(
    `SELECT body_html, cta, faqs, seo_schemas
     FROM tool_landing_pages
     WHERE tool_id = $1
     LIMIT 1`,
    [toolId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return row as unknown as ToolLandingData;
}
