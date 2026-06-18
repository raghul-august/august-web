import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PLAN_RE = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|specified-no-plan|\d{1,10})$/i;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const procedure = params.get("procedure");
  const plan = params.get("plan");
  const zip = params.get("zip");
  const rawRadius = parseFloat(params.get("radius") || "50");
  const radius = Math.min(Math.max(isNaN(rawRadius) ? 50 : rawRadius, 0), 100);

  if (!procedure || !plan || !zip) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid ZIP code format" }, { status: 400 });
  }

  if (!UUID_RE.test(procedure)) {
    return NextResponse.json({ error: "Invalid procedure ID" }, { status: 400 });
  }

  if (!PLAN_RE.test(plan)) {
    return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
  } catch {
    console.error("Failed to connect to database");
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  try {
    const zipResult = await client.query(
      "SELECT zip_code, city, state, latitude, longitude FROM health_zipcodes WHERE zip_code = $1",
      [zip]
    );

    if (zipResult.rows.length === 0) {
      return NextResponse.json({ error: "ZIP code not found" }, { status: 404 });
    }

    const center = zipResult.rows[0];
    const centerLat = parseFloat(center.latitude);
    const centerLon = parseFloat(center.longitude);

    const latDelta = radius / 69.0;
    const lonDelta = radius / (69.0 * Math.cos((centerLat * Math.PI) / 180));

    const searchResult = await client.query(
      `SELECT
        p.provider_id, p.provider_name, p.provider_type,
        p.city, p.state, p.phone,
        p.latitude, p.longitude, p.quality_rating,
        pr.price, pr.price_type
      FROM health_providers p
      JOIN health_prices pr ON pr.provider_id = p.provider_id
      WHERE pr.service_id = $1
        AND pr.plan_id = $2
        AND pr.price IS NOT NULL
        AND p.latitude BETWEEN $3 AND $4
        AND p.longitude BETWEEN $5 AND $6`,
      [
        procedure,
        plan,
        centerLat - latDelta,
        centerLat + latDelta,
        centerLon - lonDelta,
        centerLon + lonDelta,
      ]
    );

    const results = searchResult.rows
      .map((row) => {
        const dist = haversine(
          centerLat,
          centerLon,
          parseFloat(row.latitude),
          parseFloat(row.longitude)
        );
        return {
          provider_id: row.provider_id,
          provider_name: row.provider_name,
          provider_type: row.provider_type,
          city: row.city,
          state: row.state,
          phone: row.phone || null,
          distance_miles: Math.round(dist * 10) / 10,
          price: row.price,
          price_type: row.price_type || null,
          quality_rating: row.quality_rating,
        };
      })
      .filter((r) => r.distance_miles <= radius && r.price != null)
      .sort((a, b) => a.distance_miles - b.distance_miles);

    const [serviceResult, planResult] = await Promise.all([
      client.query(
        "SELECT id, service_name, cpt_code FROM health_services WHERE id = $1",
        [procedure]
      ),
      client.query(
        "SELECT plan_id, plan_name FROM health_plans WHERE plan_id = $1",
        [plan]
      ),
    ]);

    return NextResponse.json({
      center: {
        zip: center.zip_code,
        city: center.city,
        state: center.state,
        lat: centerLat,
        lng: centerLon,
      },
      radius_miles: radius,
      total_results: results.length,
      results,
      procedure: serviceResult.rows[0] || null,
      plan: planResult.rows[0] || null,
    }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("Search query failed:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  } finally {
    client.release();
  }
}
