import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PLAN_RE = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|specified-no-plan|\d{1,10})$/i;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const providerId = params.get("provider");
  const serviceId = params.get("service"); // UUID of the service
  const planId = params.get("plan");

  if (!providerId || !serviceId || !planId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  if (!UUID_RE.test(serviceId)) {
    return NextResponse.json({ error: "Invalid service ID format" }, { status: 400 });
  }

  if (!PLAN_RE.test(planId)) {
    return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
  } catch {
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  try {
    // Look up service_code from UUID
    const serviceResult = await client.query(
      "SELECT service_code FROM health_services WHERE id = $1",
      [serviceId]
    );
    const serviceCode = serviceResult.rows[0]?.service_code;

    const [providerResult, componentsResult] = await Promise.all([
      client.query(
        `SELECT provider_id, provider_name, provider_type,
                address, city, state, zip_code, full_address,
                phone, website_url, quality_rating
         FROM health_providers WHERE provider_id = $1`,
        [providerId]
      ),
      serviceCode
        ? client.query(
            `SELECT fee_type, component_name
             FROM health_price_components
             WHERE provider_id = $1 AND service_code = $2 AND plan_id = $3
             ORDER BY fee_type, component_name`,
            [providerId, serviceCode, planId]
          )
        : Promise.resolve({ rows: [] }),
    ]);

    if (providerResult.rows.length === 0) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const p = providerResult.rows[0];

    return NextResponse.json({
      provider: {
        provider_id: p.provider_id,
        provider_name: p.provider_name,
        provider_type: p.provider_type,
        address: p.full_address || p.address || [p.city, p.state, p.zip_code].filter(Boolean).join(", ") || null,
        city: p.city,
        state: p.state,
        zip_code: p.zip_code,
        phone: p.phone || null,
        website_url: p.website_url || null,
        quality_rating: p.quality_rating,
      },
      price_components: componentsResult.rows.map((r) => ({
        fee_type: r.fee_type,
        component_name: r.component_name,
      })),
    }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("Provider detail query failed:", err);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  } finally {
    client.release();
  }
}
