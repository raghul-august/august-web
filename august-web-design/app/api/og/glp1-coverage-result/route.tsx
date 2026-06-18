import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { OGCard } from "../_lib/OGCard";
import { INK, FILL_LIGHT, FILL_MID, HIGHLIGHT } from "../_lib/og-theme";

export const runtime = "nodejs";

type Tier = "strong" | "good" | "requires_steps" | "unlikely" | "medical_review";
type Status = "ok" | "warn" | "bad";
type Criterion = { label: string; status: Status };

function getTierContent(tier: Tier): {
  headline: [string, string];
  subhead: [string, string];
  pct: number;
  label: string;
  criteria: Criterion[];
} {
  switch (tier) {
    case "strong":
      return {
        headline: ["Strong coverage", "is likely."],
        subhead: ["Your plan looks aligned with GLP-1 criteria.", "Next steps are quick."],
        pct: 92, label: "STRONG",
        criteria: [
          { label: "On formulary", status: "ok" },
          { label: "Indication match", status: "ok" },
          { label: "BMI threshold met", status: "ok" },
          { label: "Prior auth ready", status: "ok" },
        ],
      };
    case "good":
      return {
        headline: ["Good coverage", "likelihood."],
        subhead: ["Your answers fit most plan profiles.", "Worth checking with your insurer."],
        pct: 74, label: "GOOD",
        criteria: [
          { label: "On formulary", status: "ok" },
          { label: "Indication match", status: "ok" },
          { label: "BMI threshold met", status: "ok" },
          { label: "Prior auth required", status: "warn" },
        ],
      };
    case "requires_steps":
      return {
        headline: ["Coverage may need", "a few steps."],
        subhead: ["Likely covered with prior authorization.", "Bring documentation when you call."],
        pct: 55, label: "WITH STEPS",
        criteria: [
          { label: "On formulary", status: "ok" },
          { label: "Indication match", status: "ok" },
          { label: "BMI threshold borderline", status: "warn" },
          { label: "Prior auth required", status: "warn" },
        ],
      };
    case "unlikely":
      return {
        headline: ["Coverage may be", "harder to secure."],
        subhead: ["Your plan profile flags common denials.", "Appeal and cash paths are next."],
        pct: 28, label: "UNLIKELY",
        criteria: [
          { label: "Formulary excluded", status: "bad" },
          { label: "Indication unclear", status: "warn" },
          { label: "BMI threshold not met", status: "bad" },
          { label: "Prior auth required", status: "warn" },
        ],
      };
    case "medical_review":
      return {
        headline: ["Medical review", "recommended first."],
        subhead: ["A clinician should weigh in before pursuing coverage.", "We can help with the next step."],
        pct: 45, label: "REVIEW",
        criteria: [
          { label: "On formulary", status: "ok" },
          { label: "Indication needs review", status: "warn" },
          { label: "BMI threshold borderline", status: "warn" },
          { label: "Prior auth required", status: "warn" },
        ],
      };
  }
}

function StatusBadge({ status }: { status: Status }) {
  const SIZE = 26;
  if (status === "ok") {
    return (
      <div style={{ display: "flex", width: SIZE, height: SIZE, borderRadius: "50%", background: INK, alignItems: "center", justifyContent: "center" }}>
        <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "flex" }}>
          <path d="M 4 9 L 7.5 12.5 L 14 5.5" stroke={HIGHLIGHT} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (status === "warn") {
    return (
      <div style={{ display: "flex", width: SIZE, height: SIZE, borderRadius: "50%", background: FILL_MID, border: `2.5px solid ${INK}`, alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ display: "flex" }}>
          <line x1="7" y1="3" x2="7" y2="8" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="7" cy="11" r="1.5" fill={INK} />
        </svg>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", width: SIZE, height: SIZE, borderRadius: "50%", background: "transparent", border: `2.5px solid ${INK}`, alignItems: "center", justifyContent: "center" }}>
      <svg width="14" height="14" viewBox="0 0 14 14" style={{ display: "flex" }}>
        <line x1="4" y1="4" x2="10" y2="10" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="10" y1="4" x2="4" y2="10" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tierParam = searchParams.get("tier") as Tier | null;
  const bmiParam = searchParams.get("bmi");
  const tier: Tier = (tierParam && ["strong", "good", "requires_steps", "unlikely", "medical_review"].includes(tierParam))
    ? tierParam
    : "good";

  const { headline, subhead, pct, label, criteria } = getTierContent(tier);

  const image = new ImageResponse(
    (
      <OGCard
        eyebrow="GLP-1 COVERAGE RESULT"
        title={headline}
        subtitle={subhead}
        titleSize={64}
        titleLetterSpacing="-0.035em"
        subtitleSize={22}
      >
        <div style={{ position: "relative", display: "flex" }}>
          <div style={{ position: "absolute", left: 30, bottom: -14, width: 400, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.22)", display: "flex", filter: "blur(2px)" }} />

          <div style={{
            display: "flex", flexDirection: "column",
            width: 460, background: FILL_LIGHT, borderRadius: 14,
            border: `4px solid ${INK}`, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 24px", background: FILL_MID, borderBottom: `4px solid ${INK}`,
            }}>
              <div style={{ display: "flex", fontSize: 16, fontWeight: 800, color: INK, letterSpacing: "0.20em" }}>COVERAGE CHECK</div>
              <div style={{ display: "flex", fontSize: 12, fontWeight: 700, color: INK, opacity: 0.6, letterSpacing: "0.18em" }}>GLP-1</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 0 14px 0" }}>
              <div style={{ display: "flex", fontSize: 11, fontWeight: 800, color: INK, opacity: 0.55, letterSpacing: "0.28em" }}>LIKELIHOOD</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: INK, letterSpacing: "-0.06em", lineHeight: 1 }}>{pct}</div>
                <div style={{ display: "flex", fontSize: 38, fontWeight: 800, color: INK, opacity: 0.7, letterSpacing: "-0.04em" }}>%</div>
              </div>
              <div style={{ display: "flex", marginTop: 10, gap: 8, alignItems: "center" }}>
                <div style={{ display: "flex", padding: "5px 14px", borderRadius: 100, background: INK }}>
                  <div style={{ display: "flex", fontSize: 11, fontWeight: 800, color: HIGHLIGHT, letterSpacing: "0.22em" }}>{label}</div>
                </div>
                {bmiParam && (
                  <div style={{ display: "flex", padding: "5px 14px", borderRadius: 100, background: "rgba(26, 61, 39, 0.15)" }}>
                    <div style={{ display: "flex", fontSize: 11, fontWeight: 800, color: INK, letterSpacing: "0.18em" }}>BMI {bmiParam}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              display: "flex", flexDirection: "column",
              padding: "16px 28px 20px 28px",
              background: FILL_MID, borderTop: `3px solid ${INK}`, gap: 11,
            }}>
              {criteria.map((c) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <StatusBadge status={c.status} />
                  <div style={{ display: "flex", fontSize: 15, fontWeight: 700, color: INK, letterSpacing: "-0.01em" }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </OGCard>
    ),
    { width: 1200, height: 630 }
  );
  image.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return image;
}