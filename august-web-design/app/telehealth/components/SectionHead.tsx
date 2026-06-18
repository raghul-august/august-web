/* Shared section heading — eyebrow + title + optional sub. */

export default function SectionHead({
  eyebrow,
  title,
  sub,
  center,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div
      style={{
        maxWidth: 660,
        marginBottom: "clamp(40px,6vw,56px)",
        marginInline: center ? "auto" : undefined,
        textAlign: center ? "center" : "left",
      }}
    >
      <div
        className="th-eyebrow"
        style={{
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-eyebrow)",
          color: "var(--text-brand)",
          fontSize: "var(--text-eyebrow)",
          fontWeight: 400,
          lineHeight: "16px",
          marginBottom: 16,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: "clamp(28px,4.4vw,36px)",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          margin: "0 0 16px",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 16,
            lineHeight: 1.6,
            margin: 0,
            marginInline: center ? "auto" : undefined,
            maxWidth: "80ch",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
