import { NextRequest, NextResponse } from "next/server";
import { searchPills } from "@/app/utils/tools/pill-identifier-search";
import type {
  PillColorValue,
  PillShapeValue,
} from "@/app/data/tools/pill-identifier-config";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const imprint = sp.get("imprint") ?? "";
  const color = (sp.get("color") ?? "") as PillColorValue | "";
  const shape = (sp.get("shape") ?? "") as PillShapeValue | "";

  if (!imprint && !color && !shape) {
    return NextResponse.json(
      { error: "At least one of imprint, color, or shape is required" },
      { status: 400 },
    );
  }

  try {
    const result = await searchPills({ imprint, color, shape });
    return NextResponse.json(result, {
      headers: { "cache-control": "public, max-age=60, s-maxage=300" },
    });
  } catch (err) {
    console.error("[pill-identifier] search failed:", err);
    return NextResponse.json(
      { error: "Search temporarily unavailable" },
      { status: 500 },
    );
  }
}
