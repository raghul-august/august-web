import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  let client;
  try {
    client = await pool.connect();
  } catch {
    console.error("Failed to connect to database");
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  try {
    const result = await client.query(
      "SELECT plan_id, plan_name, is_national FROM health_plans ORDER BY plan_name"
    );
    return NextResponse.json(result.rows, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("Plans query failed:", err);
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
  } finally {
    client.release();
  }
}
