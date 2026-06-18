import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const medication = searchParams.get("medication");
  const state = searchParams.get("state");
  const sort = searchParams.get("sort") || "match";

  if (!medication || !["semaglutide", "tirzepatide"].includes(medication)) {
    return NextResponse.json(
      { error: "medication query param required (semaglutide | tirzepatide)" },
      { status: 400 },
    );
  }

  const client = await pool.connect();
  try {
    let providerQuery = `
      SELECT p.id, p.name, p.badge, p.url, p.display_order
      FROM glp1_providers p
    `;
    const params: (string | number)[] = [];

    if (state) {
      params.push(state);
      providerQuery += `
        JOIN glp1_provider_states ps ON ps.provider_id = p.id AND ps.state_code = $${params.length}
      `;
    }

    providerQuery += ` ORDER BY p.display_order ASC`;

    const { rows: providers } = await client.query(providerQuery, params);

    const providerIds = providers.map((p: { id: string }) => p.id);
    if (providerIds.length === 0) {
      return NextResponse.json({ providers: [], total: 0 }, {
        headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
      });
    }

    const pricingQuery = `
      SELECT provider_id, dose, price
      FROM glp1_pricing
      WHERE provider_id = ANY($1) AND medication = $2
      ORDER BY price ASC
    `;
    const { rows: pricingRows } = await client.query(pricingQuery, [providerIds, medication]);

    const pricingMap = new Map<string, { dose: string; price: number }[]>();
    for (const row of pricingRows) {
      const list = pricingMap.get(row.provider_id) || [];
      list.push({ dose: row.dose, price: Number(row.price) });
      pricingMap.set(row.provider_id, list);
    }

    const result = providers
      .map((p: { id: string; name: string; badge: string | null; url: string }) => {
        const activePricing = pricingMap.get(p.id) || [];
        const lowestPrice = activePricing.length > 0 ? Math.min(...activePricing.map((t) => t.price)) : null;
        return { id: p.id, name: p.name, badge: p.badge, url: p.url, activePricing, lowestPrice };
      })
      .filter((p: { activePricing: unknown[] }) => p.activePricing.length > 0);

    if (sort === "price-asc") {
      result.sort((a: { lowestPrice: number | null }, b: { lowestPrice: number | null }) =>
        (a.lowestPrice ?? Infinity) - (b.lowestPrice ?? Infinity));
    } else if (sort === "price-desc") {
      result.sort((a: { lowestPrice: number | null }, b: { lowestPrice: number | null }) =>
        (b.lowestPrice ?? 0) - (a.lowestPrice ?? 0));
    }

    return NextResponse.json(
      { providers: result, total: result.length },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } },
    );
  } finally {
    client.release();
  }
}
