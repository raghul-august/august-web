import pool from "@/lib/db";
import type {
  PillRecord,
  PillColorValue,
  PillShapeValue,
} from "@/app/data/tools/pill-identifier-config";

export interface PillSearchQuery {
  readonly imprint?: string;
  readonly color?: PillColorValue | "" | null;
  readonly shape?: PillShapeValue | "" | null;
}

export interface PillSearchResult {
  readonly matches: readonly PillRecord[];
  readonly total: number;
  readonly query: PillSearchQuery;
  readonly normalizedImprint: string;
}

const SEARCH_LIMIT = 10;

function normalizeImprint(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9./]/g, "");
}

const SELECT_PILL = `
  SELECT
    id::text,
    drug_name AS drug,
    generic_name AS "genericName",
    TRIM(CONCAT(imprint_front, ' ', imprint_back)) AS imprint,
    TRIM(CONCAT(strength_value, ' ', strength_unit)) AS strength,
    color, shape, manufacturer, ndc,
    drug_class AS "drugClass",
    indication AS use,
    schedule
  FROM drug_pill_identifier
`;

const IMPRINT_NORM = `regexp_replace(lower(concat(imprint_front, imprint_back)), '[^a-z0-9./]', '', 'g')`;

export async function searchPills(
  query: PillSearchQuery,
): Promise<PillSearchResult> {
  const imprintNorm = normalizeImprint((query.imprint ?? "").trim());
  const color = ((query.color ?? "") as string).trim();
  const shape = ((query.shape ?? "") as string).trim();

  if (!imprintNorm && !color && !shape) {
    return { matches: [], total: 0, query, normalizedImprint: imprintNorm };
  }

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (color) {
    params.push(color);
    conditions.push(`lower(color) = lower($${params.length})`);
  }
  if (shape) {
    params.push(shape);
    conditions.push(`lower(shape) = lower($${params.length})`);
  }
  if (imprintNorm) {
    params.push(imprintNorm);
    conditions.push(`${IMPRINT_NORM} LIKE $${params.length} || '%'`);
  }

  params.push(SEARCH_LIMIT);

  const sql = `
    ${SELECT_PILL}
    WHERE ${conditions.join(" AND ")}
    ORDER BY length(concat(imprint_front, imprint_back)), id
    LIMIT $${params.length}
  `;

  const client = await pool.connect();
  try {
    const result = await client.query<PillRecord>(sql, params);
    return {
      matches: result.rows,
      total: result.rows.length,
      query,
      normalizedImprint: imprintNorm,
    };
  } finally {
    client.release();
  }
}
