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
      "SELECT id, service_name FROM health_services ORDER BY service_name"
    );
    return NextResponse.json(result.rows, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("Services query failed:", err);
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  } finally {
    client.release();
  }
}
