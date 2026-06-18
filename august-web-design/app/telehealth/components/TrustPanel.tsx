/* Trust panel — 5-column feature strip below the hero with 3D glassmorphic icons. */

const ITEMS = [
  { h: "HIPAA secured", p: "Your health data stays yours. Never sold, never shared.", icon: "/images/telehealth/trust-hipaa.png" },
  { h: "Prescriptions & labs", p: "Prescribed by licensed doctors, sent to your pharmacy.", icon: "/images/telehealth/trust-rx.png" },
  { h: "Insights that matter", p: "AI that connects your symptoms, history, and medications.", icon: "/images/telehealth/trust-insights.png" },
  { h: "Care that adapts", p: "Your plan evolves as your health does. Never starting over.", icon: "/images/telehealth/trust-adapt.png" },
  { h: "Real doctors, always", p: "Board-certified physicians in all 50 states + DC.", icon: "/images/telehealth/trust-doctors.png" },
];

export default function TrustPanel() {
  return (
    <section style={{ background: "var(--surface-page)", paddingBottom: "clamp(32px,5vw,64px)" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div
          className="aug-trust-panel"
          data-anim="fade-up"
          style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            padding: "clamp(28px,4vw,40px) clamp(20px,3vw,36px)",
            gap: 0,
          }}
        >
          {ITEMS.map((item, i) => (
            <div
              key={item.h}
              style={{
                padding: "0 clamp(12px,2vw,24px)",
                borderRight: i < ITEMS.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <div style={{ width: 44, height: 44, marginBottom: 14 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.icon}
                  alt=""
                  style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", objectPosition: "left center" }}
                />
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: "var(--text-primary)",
                  marginBottom: 6,
                  lineHeight: 1.3,
                }}
              >
                {item.h}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                {item.p}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
