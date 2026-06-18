import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();

  if (q.length < 2 || q.length > 100) {
    return NextResponse.json([]);
  }

  let client;
  try {
    client = await pool.connect();
  } catch {
    console.error("Failed to connect to database");
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  try {
    const isZip = /^\d/.test(q);

    const result = isZip
      ? await client.query(
          `SELECT zip_code, city, state
           FROM health_zipcodes
           WHERE zip_code LIKE $1
           ORDER BY zip_code
           LIMIT 20`,
          [`${q}%`]
        )
      : await client.query(
          `SELECT DISTINCT ON (city, state) zip_code, city, state
           FROM health_zipcodes
           WHERE city ILIKE $1
           ORDER BY city, state, zip_code
           LIMIT 20`,
          [`${q}%`]
        );

    const locations = result.rows.map((row) => ({
      zip_code: row.zip_code,
      label: `${row.city}, ${row.state} ${row.zip_code}`,
      city: row.city,
      state: row.state,
    }));

    return NextResponse.json(locations, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("Locations query failed:", err);
    return NextResponse.json({ error: "Failed to search locations" }, { status: 500 });
  } finally {
    client.release();
  }
}
