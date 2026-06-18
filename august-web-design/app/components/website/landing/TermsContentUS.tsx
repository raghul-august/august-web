"use client";

import { useEffect, useState, useRef } from "react";

/* ────────────────────────────────────────────────────────────
   Hero — same interactive ripple grid as benchmarks/privacy
─────────────────────────────────────────────────────────────── */
function TermsHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    let width = 0;
    let height = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let rafId: number;

    interface Ripple { x: number; y: number; radius: number; maxRadius: number; strength: number; life: number; }
    const ripples: Ripple[] = [];
    let lastSpawn = 0;

    const resize = () => {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      const now = Date.now();
      if (now - lastSpawn > 50) {
        ripples.push({ x: mouseX, y: mouseY, radius: 0, maxRadius: 180, strength: 12, life: 1 });
        lastSpawn = now;
        if (ripples.length > 20) ripples.shift();
      }
    };

    const handleMouseLeave = () => { mouseX = -9999; mouseY = -9999; };

    const getDisplacement = (px: number, py: number): [number, number] => {
      let dx = 0, dy = 0;
      for (const r of ripples) {
        const distX = px - r.x, distY = py - r.y;
        const dist = Math.sqrt(distX * distX + distY * distY);
        const ringDist = Math.abs(dist - r.radius);
        const ringWidth = 60;
        if (ringDist < ringWidth) {
          const factor = r.strength * r.life * Math.cos((ringDist / ringWidth) * (Math.PI / 2));
          const angle = Math.atan2(distY, distX);
          dx += Math.cos(angle) * factor;
          dy += Math.sin(angle) * factor;
        }
      }
      return [dx, dy];
    };

    const MAJOR = 80, MINOR = 20;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]; r.radius += 2.5; r.life *= 0.985;
        if (r.life < 0.01 || r.radius > r.maxRadius * 1.5) ripples.splice(i, 1);
      }
      const hasRipples = ripples.length > 0;
      const step = hasRipples ? 4 : 0;

      ctx.strokeStyle = "rgba(168, 213, 186, 0.06)"; ctx.lineWidth = 0.5;
      for (let y = 0; y < height; y += MINOR) {
        if (y % MAJOR === 0) continue;
        ctx.beginPath();
        if (hasRipples) { for (let x = 0; x <= width; x += step) { const [, dy] = getDisplacement(x, y); if (x === 0) ctx.moveTo(x, y + dy); else ctx.lineTo(x, y + dy); } }
        else { ctx.moveTo(0, y); ctx.lineTo(width, y); }
        ctx.stroke();
      }
      for (let x = 0; x < width; x += MINOR) {
        if (x % MAJOR === 0) continue;
        ctx.beginPath();
        if (hasRipples) { for (let y = 0; y <= height; y += step) { const [dx] = getDisplacement(x, y); if (y === 0) ctx.moveTo(x + dx, y); else ctx.lineTo(x + dx, y); } }
        else { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(168, 213, 186, 0.12)"; ctx.lineWidth = 0.5;
      for (let y = 0; y < height; y += MAJOR) {
        ctx.beginPath();
        if (hasRipples) { for (let x = 0; x <= width; x += step) { const [, dy] = getDisplacement(x, y); if (x === 0) ctx.moveTo(x, y + dy); else ctx.lineTo(x, y + dy); } }
        else { ctx.moveTo(0, y); ctx.lineTo(width, y); }
        ctx.stroke();
      }
      for (let x = 0; x < width; x += MAJOR) {
        ctx.beginPath();
        if (hasRipples) { for (let y = 0; y <= height; y += step) { const [dx] = getDisplacement(x, y); if (y === 0) ctx.moveTo(x + dx, y); else ctx.lineTo(x + dx, y); } }
        else { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
        ctx.stroke();
      }
      rafId = requestAnimationFrame(draw);
    };

    resize(); rafId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);
    return () => { window.removeEventListener("resize", resize); section.removeEventListener("mousemove", handleMouseMove); section.removeEventListener("mouseleave", handleMouseLeave); cancelAnimationFrame(rafId); };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-dark
      className="relative flex items-center justify-center overflow-hidden mx-4 sm:mx-6 xl:mx-auto"
      style={{
        minHeight: "0",
        height: "auto",
        paddingTop: "60px",
        paddingBottom: "60px",
        maxWidth: "1200px",
        marginTop: "0",
        marginBottom: "0",
        borderRadius: "24px",
        background: "linear-gradient(165deg, #17453a 0%, #1d5c4a 25%, #206E55 50%, #2a8a6c 75%, #34a07e 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 65% 55% at 50% 45%, transparent 0%, rgba(23, 69, 58, 0.6) 80%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 40% at 50% 45%, rgba(32, 110, 85, 0.15) 0%, transparent 70%)" }} />
      </div>
      <div className="relative mx-auto max-w-[1200px] px-6 text-center md:px-10 lg:px-20">
        <span style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(168, 213, 186, 0.7)" }}>
          Legal · United States
        </span>
        <h1 className="mx-auto max-w-3xl" style={{ fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#FAF9F5", marginTop: "12px" }}>
          Terms of Service
        </h1>
        <p className="mx-auto mt-2 max-w-2xl" style={{ fontSize: "clamp(15px, 1.8vw, 18px)", fontWeight: 300, lineHeight: 1.7, color: "rgba(250, 249, 245, 0.6)" }}>
          The terms governing your use of August AI&apos;s digital health platform and access to
          telehealth services provided by MDI&nbsp;clinicians.
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   TOC + Layout components (same pattern as privacy)
─────────────────────────────────────────────────────────────── */
const TOC = [
  { id: "s1", label: "1. Who We Are" },
  { id: "s2", label: "2. What August AI Is — and Is Not" },
  { id: "s3", label: "3. Definitions" },
  { id: "s4", label: "4. Eligibility & Scope" },
  { id: "s5", label: "5. Account Registration" },
  { id: "s6", label: "6. Scope & Excluded Uses" },
  { id: "s7", label: "7. Consent to Telehealth" },
  { id: "s8", label: "8. Consent to AI Features" },
  { id: "s9", label: "9. Not for Emergencies" },
  { id: "s10", label: "10. No Controlled Substances" },
  { id: "s11", label: "11. Prescriptions & Pharmacy" },
  { id: "s12", label: "12. Fees & Payments" },
  { id: "s13", label: "13. Refunds & Billing Disputes" },
  { id: "s14", label: "14. Honest Disclosure" },
  { id: "s15", label: "15. Communications & E-Signatures" },
  { id: "s16", label: "16. Privacy & Health Information" },
  { id: "s17", label: "17. Acceptable Use" },
  { id: "s18", label: "18. Intellectual Property" },
  { id: "s19", label: "19. User Content" },
  { id: "s20", label: "20. Third-Party Services" },
  { id: "s21", label: "21. Beta Offerings" },
  { id: "s22", label: "22. Disclaimers" },
  { id: "s23", label: "23. Limitation of Liability" },
  { id: "s24", label: "24. Service Availability" },
  { id: "s25", label: "25. Indemnification" },
  { id: "s26", label: "26. Termination" },
  { id: "s27", label: "27. Arbitration & Class Waiver" },
  { id: "s28", label: "28. Governing Law" },
  { id: "s29", label: "29. State-Specific Notices" },
  { id: "s30", label: "30. Modifications to the Terms" },
  { id: "s31", label: "31. General Provisions" },
  { id: "s32", label: "32. Contact Us" },
];

function SideNav({ activeId }: { activeId: string }) {
  return (
    <nav className="hidden lg:block" aria-label="Table of contents">
      <div className="sticky top-32" style={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
        <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(28, 25, 23, 0.4)", marginBottom: "16px" }}>
          On this page
        </p>
        <ul className="flex flex-col gap-0.5">
          {TOC.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block transition-all duration-200"
                style={{
                  fontSize: "13px",
                  fontWeight: activeId === item.id ? 500 : 400,
                  color: activeId === item.id ? "#206E55" : "rgba(28, 25, 23, 0.45)",
                  padding: "5px 0 5px 16px",
                  borderLeft: activeId === item.id ? "2px solid #206E55" : "2px solid transparent",
                  lineHeight: 1.4,
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: "120px" }}>
      <h2 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 400, color: "#1C1917", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid rgba(28, 25, 23, 0.08)" }}>
        {title}
      </h2>
      <div className="terms-body">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "28px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#1C1917", letterSpacing: "-0.01em", lineHeight: 1.4, marginBottom: "12px" }}>{title}</h3>
      {children}
    </div>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: "15px", fontWeight: 400, lineHeight: 1.7, color: "rgba(28, 25, 23, 0.7)", marginTop: "12px", ...style }}>{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul style={{ marginTop: "12px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>{children}</ul>;
}

function LI({ children }: { children: React.ReactNode }) {
  return <li style={{ fontSize: "15px", fontWeight: 400, lineHeight: 1.7, color: "rgba(28, 25, 23, 0.7)", listStyleType: "disc" }}>{children}</li>;
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ fontWeight: 500, color: "#1C1917" }}>{children}</strong>;
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "16px", padding: "20px 24px", borderRadius: "12px", background: "rgba(32, 110, 85, 0.04)", border: "1px solid rgba(32, 110, 85, 0.08)" }}>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   AllCaps — block used for legal "ALL CAPS" disclaimer text
─────────────────────────────────────────────────────────────── */
function AllCaps({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "13px",
        fontWeight: 400,
        lineHeight: 1.75,
        color: "rgba(28, 25, 23, 0.7)",
        marginTop: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </p>
  );
}

/* ────────────────────────────────────────────────────────────
   Important Notice — amber callout used for §intro warning
─────────────────────────────────────────────────────────────── */
function ImportantNotice({ children, label = "Important — please read carefully" }: { children: React.ReactNode; label?: string }) {
  return (
    <div
      style={{
        marginBottom: "8px",
        padding: "20px 24px",
        borderRadius: "12px",
        background: "rgba(180, 83, 9, 0.06)",
        border: "1px solid rgba(180, 83, 9, 0.2)",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#B45309",
          margin: "0 0 10px 0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#B45309" }} />
        {label}
      </p>
      <p style={{ fontSize: "14px", fontWeight: 400, lineHeight: 1.7, color: "rgba(28, 25, 23, 0.75)", margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main content
─────────────────────────────────────────────────────────────── */
export default function TermsContentUS() {
  const [activeId, setActiveId] = useState("s1");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );
    TOC.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-cream" style={{ paddingBottom: "80px" }}>
      <TermsHero />

      <div style={{ height: "48px" }} className="md:hidden" />
      <div style={{ height: "64px" }} className="hidden md:block" />

      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-20">
        <div className="lg:grid lg:gap-16" style={{ gridTemplateColumns: "220px 1fr" }}>
          <SideNav activeId={activeId} />

          <div className="flex flex-col gap-14 max-w-[720px]">

            {/* ── Effective + lede + warning ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <P style={{ fontSize: "14px", color: "rgba(28, 25, 23, 0.5)", marginTop: 0 }}>
                Last Modified: May 29, 2026
              </P>
              <P style={{ fontSize: "16px", color: "rgba(28, 25, 23, 0.78)", marginTop: 0 }}>
                These Terms of Service (<Strong>&ldquo;Terms&rdquo;</Strong>) form a binding legal
                agreement between you and August Labs Inc., a Delaware corporation doing business as
                August AI (<Strong>&ldquo;August AI,&rdquo;</Strong>{" "}
                <Strong>&ldquo;we,&rdquo;</Strong> <Strong>&ldquo;us,&rdquo;</Strong> or{" "}
                <Strong>&ldquo;our&rdquo;</Strong>), and govern your access to and use of the website
                located at{" "}
                <a href="https://www.meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  meetaugust.ai
                </a>
                , any related subdomains, mobile applications, and other digital properties operated
                by us (collectively, the <Strong>&ldquo;Platform&rdquo;</Strong>). By creating an
                account, accessing, browsing, or otherwise using the Platform, you acknowledge that
                you have read, understood, and agree to be bound by these Terms and our{" "}
                <a href="/privacy" style={{ color: "#206E55", fontWeight: 500 }}>
                  Privacy Policy
                </a>
                . If you request a Consultation, you may also be asked to accept separate telehealth
                consents, clinical privacy notices, or other disclosures presented by MD Integrations, LLC (MDI) or its
                clinicians. If you do not agree, do not use the Platform.
              </P>
              <ImportantNotice>
                These Terms contain a binding arbitration agreement and class action waiver in
                Section 27 that affect your legal rights. You also expressly consent to the practice
                of telehealth and to interaction with AI-assisted tools as described in Sections 7
                and 8. The Platform is intended for use only within the United States by individuals
                18 years of age or older. You may not submit personal information, health
                information, images, messages, or other content relating to any person under 18. If
                you are experiencing a medical emergency, call 911 or go to the nearest emergency
                room immediately.
              </ImportantNotice>
            </div>

            {/* ── 1. Who We Are ── */}
            <Section id="s1" title="1. Who We Are">
              <P>
                August AI is operated by August Labs Inc., a corporation organized under the laws of
                the State of Delaware. Our registered office in the State of Delaware is located at
                131 Continental Drive, Suite 301, Newark, New Castle County, Delaware 19713-4323,
                and our registered agent for service of process at that address is InCorp Services,
                Inc. August Labs Inc. is legally and operationally separate from any prior operator
                of the{" "}
                <a href="https://www.meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  meetaugust.ai
                </a>{" "}
                domain. References in these Terms to August AI mean August Labs Inc. and not any
                predecessor, affiliate, or unaffiliated entity.
              </P>
            </Section>

            {/* ── 2. What August AI Is ── */}
            <Section id="s2" title="2. What August AI Is — and Is Not">
              <P>
                August AI is a digital health technology platform that helps adults in the United
                States connect, on a self-pay basis, with U.S.-licensed clinicians for non-emergency,
                low-acuity virtual urgent care. We provide the technology, account tools, intake
                tools, scheduling support, payment processing, customer support, and certain
                AI-assisted intake and educational features described in these Terms.
              </P>
              <P>
                August AI does not practice medicine, provide medical advice, diagnose, treat any
                condition, prescribe medication, or make clinical decisions. Professional medical
                services available through the Platform are provided by clinicians affiliated with
                MD Integrations, LLC (https://mdintegrations.com/) and/or the applicable MDI-affiliated professional medical
                entity involved in your Consultation (collectively, <Strong>&ldquo;MDI&rdquo;</Strong>).
                MDI and its clinicians are independent from August AI. Each MDI clinician exercises
                independent professional judgment in the clinician-patient relationship.
              </P>
              <P>
                Medical services provided by MDI clinicians are not embedded within any AI chatbot,
                AI scribe, or AI assistant offered by August AI. AI-assisted tools are used only for
                non-clinical functions such as intake organization, symptom navigation, plain-language
                education, and support in preparing information for clinician review. No AI-assisted
                tool offered by August AI diagnoses, prescribes, or independently delivers medical
                care.
              </P>
              <P>
                Submitting an intake, interacting with AI-assisted features, creating an account, or
                paying a fee does not, by itself, create a clinician-patient relationship or obligate
                any clinician to treat you. A clinician-patient relationship is established only when
                an MDI clinician accepts or begins clinical review of your Consultation or otherwise
                begins providing professional medical services to you. The applicable treating
                clinician or professional entity may be identified in the consultation workflow,
                visit documentation, prescription records, or medical record.
              </P>
            </Section>

            {/* ── 3. Definitions ── */}
            <Section id="s3" title="3. Definitions">
              <P>
                <Strong>&ldquo;AI-assisted features&rdquo;</Strong> means any artificial intelligence,
                machine learning, large-language-model, automation, summarization, or related feature
                made available through the Platform. <Strong>&ldquo;Consultation&rdquo;</Strong>{" "}
                means a discrete telehealth visit or clinical review between you and an MDI clinician
                arranged through the Platform.{" "}
                <Strong>&ldquo;Consultation Fee&rdquo;</Strong> means the fee charged at checkout for
                a Consultation. <Strong>&ldquo;MDI&rdquo;</Strong> has the meaning given in Section
                2. <Strong>&ldquo;Platform&rdquo;</Strong> has the meaning given in the introduction.{" "}
                <Strong>&ldquo;User Content&rdquo;</Strong> means information, messages, images, and
                other content you submit to the Platform.{" "}
                <Strong>&ldquo;User&rdquo;</Strong> or <Strong>&ldquo;you&rdquo;</Strong> means any
                individual who accesses or uses the Platform.
              </P>
            </Section>

            {/* ── 4. Eligibility ── */}
            <Section id="s4" title="4. Eligibility and Geographic Scope">
              <P>To use the Platform, you represent and warrant that:</P>
              <UL>
                <LI>You are at least 18 years of age and have the legal capacity to enter into a binding contract;</LI>
                <LI>You will not submit personal information, health information, images, messages, or other content relating to any person under 18;</LI>
                <LI>You are a resident of, and physically located in, the United States at the time of any Consultation, in a jurisdiction in which the relevant MDI clinician is licensed or otherwise authorized to practice;</LI>
                <LI>You are accessing the Platform for your own personal, non-commercial use;</LI>
                <LI>You have not been previously suspended or removed from the Platform; and</LI>
                <LI>Your access to and use of the Platform complies with all laws and rules applicable to you.</LI>
              </UL>
              <P>
                The Platform is not directed to or intended for minors. Telehealth services are not
                available outside the United States, and access from outside the United States is not
                authorized. We may request information to verify your age, identity, and location
                before allowing you to use certain features or request a Consultation.
              </P>
            </Section>

            {/* ── 5. Account ── */}
            <Section id="s5" title="5. Account Registration and Security">
              <P>
                To request a Consultation or use most features, you must create an account and
                provide accurate, current, and complete information. You agree to keep your account
                information up to date, to maintain the confidentiality of your login credentials,
                and to be responsible for all activity that occurs under your account. You agree to
                notify us promptly at{" "}
                <a href="mailto:support@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  support@meetaugust.ai
                </a>{" "}
                of any unauthorized access. We may suspend or terminate accounts at our reasonable
                discretion as described in Section 26.
              </P>
            </Section>

            {/* ── 6. Scope & Excluded ── */}
            <Section id="s6" title="6. Scope of Services and Excluded Uses">
              <P>
                The Platform is intended for low-acuity, non-emergency virtual urgent-care needs. It
                is not a replacement for a primary care provider, an ongoing clinician-patient
                relationship, in-person care, or emergency services. You should maintain a regular
                clinician and seek in-person care when your symptoms persist, worsen, recur, or
                require ongoing management.
              </P>
              <P>Do not use the Platform for any of the following:</P>
              <UL>
                <LI>Medical or psychiatric emergencies, including suicidal thoughts, self-harm, threats of violence, severe allergic reactions, signs of stroke, chest pain, shortness of breath, severe bleeding, poisoning, overdose, or any condition that feels life-threatening, rapidly worsening, or time-sensitive;</LI>
                <LI>Care for any person under 18 or submission of information about any person under 18;</LI>
                <LI>Pregnancy emergencies, labor, delivery, or pregnancy complications;</LI>
                <LI>Complex chronic conditions, specialist-managed conditions, or conditions that typically require specialist care, including oncology, cardiovascular disease, neurological disorders, autoimmune disease, rare disease, genetic disorders, or other complex chronic conditions;</LI>
                <LI>Any condition that may require an in-person examination, imaging, immediate laboratory testing, continuous monitoring, emergency intervention, or procedures that cannot be safely provided through telehealth;</LI>
                <LI>Diagnosis or treatment of mental, emotional, or behavioral health conditions, unless a specific workflow expressly states that such care is available and legally permitted; or</LI>
                <LI>Requests for controlled substances or other medications that cannot lawfully or appropriately be prescribed through the Platform.</LI>
              </UL>
              <P>
                An MDI clinician may decline to treat, end a Consultation, or direct you to urgent,
                emergency, in-person, or specialist care. A clinician may also determine that your
                request cannot be safely or appropriately handled through the Platform, even if the
                Platform initially allowed you to submit an intake.
              </P>
            </Section>

            {/* ── 7. Telehealth Consent ── */}
            <Section id="s7" title="7. Informed Consent to Telehealth">
              <P>
                <Strong>&ldquo;Telehealth&rdquo;</Strong> or{" "}
                <Strong>&ldquo;telemedicine&rdquo;</Strong> means the delivery of healthcare services
                through asynchronous or synchronous electronic communications, including secure
                text-based messaging, exchange of digital images, interactive audio or video, and
                related technologies that allow a clinician to evaluate and treat a patient without
                being in the same physical location.
              </P>
              <P>
                State telehealth consent requirements vary. Before receiving telehealth services, you
                may be asked to review and accept telehealth consent and any state-specific notices
                or consents required for your location, requested service, or clinician. By
                requesting and participating in a Consultation, you acknowledge and agree to the
                following:
              </P>
              <UL>
                <LI><Strong>Nature of services.</Strong> Your Consultation may be conducted by secure asynchronous messaging, synchronous chat, audio, video, or other electronic communication methods offered through the Platform. The clinician may assess, diagnose, recommend treatment, order labs where appropriate and available, and prescribe non-controlled medications in the clinician&apos;s independent professional judgment.</LI>
                <LI><Strong>Benefits.</Strong> Telehealth may improve access to care, reduce travel and wait time, and allow for more efficient evaluation of certain non-emergency conditions.</LI>
                <LI><Strong>Risks and limitations.</Strong> Telehealth is not appropriate for every condition. The clinician may not be able to fully evaluate you without an in-person examination, may have limited diagnostic information, and may recommend that you seek in-person care, urgent care, or emergency services. Technology failures, poor connectivity, message delays, device failures, or third-party outages may interrupt or prevent a Consultation. Information transmitted electronically may, in rare circumstances, be intercepted, delayed, misdirected, or corrupted despite reasonable safeguards.</LI>
                <LI><Strong>Alternatives.</Strong> You may decline telehealth and instead seek in-person care from a clinician or facility of your choosing.</LI>
                <LI><Strong>Records and privacy.</Strong> MDI may create and maintain a medical record of your Consultation. Your information will be handled as described in our <a href="/privacy" style={{ color: "#206E55", fontWeight: 500 }}>Privacy Policy</a> and any applicable clinical privacy notices presented by MDI.</LI>
                <LI><Strong>Right to withdraw.</Strong> You may withdraw your consent to telehealth at any time by ending the Consultation or closing your account, except that withdrawal does not undo a Consultation or clinical review that has already occurred.</LI>
              </UL>
              <P>
                By proceeding with a Consultation, you acknowledge that you have been informed of and
                understand the nature, benefits, risks, limitations, and alternatives of telehealth
                and consent to receive care by telehealth, subject to these Terms and any additional
                clinical consent presented in the Consultation workflow.
              </P>
            </Section>

            {/* ── 8. AI Consent ── */}
            <Section id="s8" title="8. Consent to AI-Assisted Features and Limitations">
              <P>
                The Platform offers AI-assisted features, which may include intake summarization,
                conversational symptom navigation, plain-language education, content suggestions, and
                other support tools. By using these features, you acknowledge and consent to the
                following:
              </P>
              <UL>
                <LI><Strong>AI is not a clinician.</Strong> AI-assisted features provided by August AI are not licensed medical professionals, do not establish a clinician-patient relationship, do not diagnose, do not prescribe, and do not provide medical advice. Output from AI-assisted features is informational only.</LI>
                <LI><Strong>Not a medical device unless expressly stated.</Strong> Unless we expressly state otherwise for a specific feature, AI-assisted features are not FDA-cleared or FDA-approved medical devices and are not intended to diagnose, treat, cure, mitigate, or prevent disease.</LI>
                <LI><Strong>Possible inaccuracies.</Strong> AI-assisted features may produce incorrect, incomplete, biased, or outdated information, including information that sounds plausible but is wrong. You should not rely on AI output for medical decisions and should always consult a licensed clinician.</LI>
                <LI><Strong>Human review for clinical care.</Strong> Any clinical decision affecting your care, including diagnoses, treatment plans, prescriptions, referrals, or recommendations to seek a higher level of care, is made by an MDI clinician exercising independent professional judgment, not by AI.</LI>
                <LI><Strong>Data use.</Strong> Inputs to AI-assisted features may be processed by August AI and our service providers to provide, operate, secure, monitor, troubleshoot, evaluate, and improve the Platform, as described in our <a href="/privacy" style={{ color: "#206E55", fontWeight: 500 }}>Privacy Policy</a>. We do not use identifiable health information from AI chats or Consultations to train third-party general-purpose AI models or for advertising. We may use de-identified, aggregated, or otherwise legally permitted information to operate, secure, evaluate, and improve the Platform.</LI>
                <LI><Strong>Safety escalation.</Strong> We may use automated or human review to detect potential emergencies, self-harm, abuse, threats of violence, or other safety risks. We may interrupt or end a conversation and direct you to emergency, crisis, urgent-care, or in-person resources. Where permitted or required by law, August AI, MDI, or their personnel may take steps to address an imminent threat to health or safety.</LI>
                <LI><Strong>Right to avoid AI-assisted intake.</Strong> Where available, you may proceed directly to a Consultation without using optional AI-assisted intake features. Certain non-clinical Platform features may not be available if you decline to use them.</LI>
              </UL>
              <P>
                By using the Platform, you provide your informed, knowing, and voluntary consent to
                interact with AI-assisted features subject to the limits in this Section 8.
              </P>
            </Section>

            {/* ── 9. Not for Emergencies ── */}
            <Section id="s9" title="9. Not for Emergencies">
              <AllCaps>
                The Platform is not designed for medical or psychiatric emergencies. If you are
                experiencing chest pain, shortness of breath, suicidal thoughts, severe bleeding,
                signs of stroke, severe allergic reaction, poisoning, overdose, or any other
                emergency, call 911 or go to the nearest emergency room immediately. Do not use the
                Platform to communicate emergencies. We do not provide 911 dispatch, mobile crisis
                services, emergency response, or continuous monitoring.
              </AllCaps>
            </Section>

            {/* ── 10. No Controlled Substances ── */}
            <Section id="s10" title="10. No Controlled Substances">
              <P>
                MDI clinicians do not prescribe controlled substances through the Platform.{" "}
                <Strong>&ldquo;Controlled substances&rdquo;</Strong> means any substance listed on
                Schedules I-V of the federal Controlled Substances Act or corresponding schedules of
                any U.S. state, including but not limited to opioids, benzodiazepines, stimulants
                used for ADHD, barbiturates, certain sleep medications, and other scheduled drugs.
                Requests for controlled substances will be declined, and you should seek care from an
                appropriate in-person provider for such needs.
              </P>
            </Section>

            {/* ── 11. Prescriptions ── */}
            <Section id="s11" title="11. Prescriptions and Pharmacy Choice">
              <P>
                If, in the independent professional judgment of an MDI clinician, a non-controlled
                prescription is appropriate, the clinician may electronically transmit the
                prescription through MDI&apos;s e-prescribing infrastructure to the licensed pharmacy
                of your choice. August AI does not own, operate, partner with, or share revenue with
                any pharmacy and does not facilitate the sale of medications. We do not dispense,
                ship, repackage, or otherwise handle medications. Medication acquisition, pricing,
                insurance billing if any, counseling, dispensing, and delivery are matters between
                you, the prescribing clinician, and your chosen pharmacy. Issuance of a prescription
                is at the clinician&apos;s sole professional discretion and is never guaranteed.
              </P>
            </Section>

            {/* ── 12. Fees ── */}
            <Section id="s12" title="12. Fees, Self-Pay, and Payments">
              <P>
                <Strong>Chat with August AI is free for U.S. residents.</Strong> Use of the August AI
                chat experience and other AI-assisted, non-clinical features of the Platform is
                offered free of charge to residents of the United States. This free access covers
                only August AI&apos;s non-clinical technology, including AI-assisted intake,
                conversational symptom navigation, and plain-language health education. It does not
                include any medical Consultation, diagnosis, treatment, or prescription, all of which
                require a separate paid Consultation with an MDI clinician as described below.
                Standard message and data rates from your carrier may still apply, and access to free
                features may require account registration and is subject to these Terms.
              </P>
              <P>
                Consultations are offered on a self-pay basis unless we expressly state otherwise at
                checkout. The Consultation Fee in effect at the time of your visit will be displayed
                at checkout before you complete the transaction.
              </P>
              <P>
                August AI may collect the Consultation Fee as payment agent, merchant of record, or
                other payment facilitator on behalf of MDI or the applicable MDI-affiliated
                professional medical entity. The Consultation Fee is charged for professional medical
                services provided by MDI or the applicable clinician, not for medical services
                provided by August AI. August AI does not retain any portion of the professional
                medical fee except as expressly disclosed at checkout and permitted under applicable
                agreements and law. Any separate August AI technology, administrative, subscription,
                membership, or platform fees will be disclosed separately.
              </P>
              <P>
                <Strong>Services are self-pay unless we expressly state otherwise.</Strong> August AI
                and MDI do not bill Medicare, Medicaid, federal healthcare programs, state programs,
                or private insurance for Consultations arranged through the Platform, and we do not
                guarantee reimbursement. Unless we expressly provide otherwise in writing, you agree
                not to submit claims for reimbursement for Consultation Fees or request that August
                AI or MDI submit such claims on your behalf.
              </P>
              <P>
                Each Consultation requires a separate Consultation Fee unless a promotion, bundle,
                membership, or subscription expressly states otherwise. We do not offer
                &ldquo;free&rdquo; or &ldquo;unlimited&rdquo; medical visits unless the specific
                offer clearly states the number of included Consultations, any applicable limits, and
                any expiration date. The availability of any membership, subscription, or bundle does
                not change the independent clinical nature of the medical care.
              </P>
              <P>
                We reserve the right to introduce, modify, increase, decrease, or discontinue any
                price, fee, charge, plan, bundle, promotion, free feature, or paid feature available
                on the Platform at any time, except where advance notice is required by applicable
                law. Any change will take effect when posted on the Platform or otherwise
                communicated to you. Price changes will not apply retroactively to Consultations you
                have already paid for and that have already begun or been completed.
              </P>
              <P>
                You authorize us and our payment processors to charge the payment method you provide
                for all Consultation Fees and other authorized charges. You are responsible for
                keeping a valid payment method on file. Taxes, where applicable, are your
                responsibility.
              </P>
            </Section>

            {/* ── 13. Refunds ── */}
            <Section id="s13" title="13. Refunds and Billing Disputes">
              <P>
                A Consultation begins when an MDI clinician accepts, opens, or begins clinical review
                of your submitted intake, or when a scheduled synchronous visit begins, as
                applicable. If no clinician accepts or reviews your Consultation, if MDI determines
                before clinical review that the request cannot be handled through the Platform, or if
                the Consultation cannot occur due to a Platform or MDI scheduling failure, we will
                refund or reschedule the Consultation Fee as appropriate.
              </P>
              <P>
                Once clinical review has begun or the visit has occurred, fees are non-refundable
                except as required by law or expressly stated at checkout. If you believe you have
                been billed in error, contact us at{" "}
                <a href="mailto:support@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  support@meetaugust.ai
                </a>{" "}
                within 30 days of the charge. We will investigate in good faith and, where
                appropriate, coordinate with MDI on a resolution. Disputing a charge with your card
                issuer without first contacting us may delay resolution.
              </P>
            </Section>

            {/* ── 14. Honest Disclosure ── */}
            <Section id="s14" title="14. Patient Information and Honest Disclosure">
              <P>
                Safe, appropriate care depends on accurate information. You agree to provide
                complete, current, and truthful information about your identity, age, location,
                medical history, current medications, allergies, symptoms, and any other information
                requested through the Platform or by an MDI clinician. Material misrepresentation may
                result in declined care, account termination, denial of future access, and, where
                required, reporting to authorities. You agree not to use another person&apos;s
                identity, share your account, or submit information about a person under 18.
              </P>
            </Section>

            {/* ── 15. Communications ── */}
            <Section id="s15" title="15. Communications and Electronic Signatures">
              <P>
                By creating an account and providing your contact information, you consent to receive
                electronic communications from us and from MDI relating to your account, your
                Consultations, security, billing, customer support, and similar transactional matters
                by email, in-app message, push notification, and, where permitted, SMS/MMS at the
                mobile number you provide. Message and data rates may apply. SMS frequency varies.
              </P>
              <P>
                Treatment-related and transactional communications may include appointment
                confirmations, care coordination messages, prescription follow-ups, clinical
                summaries, billing notices, account alerts, and other information related to your
                Consultation or use of the Platform. These messages may contain health information.
                Email, SMS/MMS, and push notifications may not be encrypted end-to-end and could be
                intercepted, delayed, misdirected, or accessed by third parties. By providing your
                contact information, you authorize August AI and MDI to use these channels for
                treatment-related and transactional communications. We will not intentionally include
                highly sensitive information, such as HIV/AIDS status, substance-use treatment
                records, psychotherapy notes, genetic test results, or reproductive-health details,
                in SMS or push notifications unless legally permitted and operationally necessary.
                You may revoke authorization for treatment-related electronic messages by contacting
                us, but doing so may limit our ability to coordinate your care or provide the
                Platform.
              </P>
              <P>
                Marketing communications are sent only with your consent where required by law and
                are not a condition of receiving treatment-related or transactional messages. You may
                unsubscribe from marketing emails by using the unsubscribe link in the message and
                may opt out of marketing SMS by replying STOP. Reply HELP for help. Transactional or
                treatment-related messages necessary to deliver the Platform or coordinate care may
                continue unless you close your account or revoke the applicable authorization as
                described above.
              </P>
              <P>
                Under the federal Electronic Signatures in Global and National Commerce Act and
                applicable state law, you consent to (i) the use of electronic records and signatures
                in connection with these Terms, the{" "}
                <a href="/privacy" style={{ color: "#206E55", fontWeight: 500 }}>
                  Privacy Policy
                </a>
                , telehealth informed consent, and any related agreements or notices, and (ii)
                receiving the foregoing in electronic form. You may withdraw this consent by closing
                your account; doing so will end your ability to use the Platform.
              </P>
            </Section>

            {/* ── 16. Privacy ── */}
            <Section id="s16" title="16. Privacy and Health Information">
              <P>
                Our collection, use, disclosure, and retention of personal information is described
                in our{" "}
                <a href="/privacy" style={{ color: "#206E55", fontWeight: 500 }}>
                  Privacy Policy
                </a>
                . Information you provide to August AI outside an MDI clinician-patient Consultation
                is handled under our Privacy Policy and applicable privacy laws. Information you
                provide directly to an MDI clinician during a Consultation, and the medical record
                created by MDI, are handled by MDI under its applicable clinical privacy notices and
                legal obligations.
              </P>
              <P>
                August AI may receive, process, store, or transmit information as necessary to
                operate the Platform, facilitate your Consultation, process payment, provide customer
                support, maintain security, comply with law, and perform other activities described
                in our Privacy Policy. We do not sell personal information or health information. We
                do not use identifiable health information for targeted advertising or to train
                third-party general-purpose AI models.
              </P>
              <P>
                Some information we collect may be subject to state consumer-health-data laws,
                consumer privacy laws, breach-notification laws, or other legal requirements
                depending on context. Please review our Privacy Policy and any applicable clinical
                privacy notices presented in the Consultation workflow for additional details.
              </P>
            </Section>

            {/* ── 17. Acceptable Use ── */}
            <Section id="s17" title="17. Acceptable Use">
              <P>You agree not to:</P>
              <UL>
                <LI>Use the Platform for any unlawful, harmful, fraudulent, abusive, or deceptive purpose;</LI>
                <LI>Submit false information, impersonate any person, misrepresent your affiliation, or use another person&apos;s account or identity;</LI>
                <LI>Submit any personal information, health information, images, messages, or other content relating to any person under 18;</LI>
                <LI>Attempt to obtain controlled substances, doctor shop, seek prescriptions through deception, or misrepresent your symptoms, identity, age, location, medical history, medications, or allergies;</LI>
                <LI>Reverse engineer, decompile, disassemble, scrape, crawl, or attempt to extract source code, prompts, model weights, model behavior, training data, clinical workflows, or other non-public aspects of the Platform or any AI-assisted feature;</LI>
                <LI>Probe, scan, or test the vulnerability of the Platform or breach any security or authentication measure;</LI>
                <LI>Upload viruses, malware, or other harmful code;</LI>
                <LI>Use any part of the Platform, including any input, output, or other content generated by or made available through the Platform, to train, fine-tune, develop, test, evaluate, benchmark, or improve any machine learning, artificial intelligence, or competing technology or service without our prior written consent;</LI>
                <LI>Access or use the Platform in any manner that could disable, overburden, damage, disrupt, or impair the Platform or the servers, networks, or third-party services that support it;</LI>
                <LI>Use bots, scrapers, crawlers, scripts, or automated tools to access, collect, copy, or record the Platform or its content, except as expressly authorized by us in writing;</LI>
                <LI>Resell, sublicense, rent, lease, distribute, or commercially exploit the Platform;</LI>
                <LI>Harass, threaten, abuse, or interfere with August AI staff, MDI clinicians, pharmacies, laboratories, support personnel, or other users; or</LI>
                <LI>Use the Platform in a way that violates these Terms or any applicable law, regulation, professional rule, or third-party right.</LI>
              </UL>
            </Section>

            {/* ── 18. IP ── */}
            <Section id="s18" title="18. Intellectual Property and License">
              <P>
                The Platform, including all software, text, graphics, logos, audio, video, AI models,
                prompts, workflows, user interfaces, and other content, excluding User Content and
                clinical records maintained by MDI, is owned by August AI or its licensors and is
                protected by U.S. and international intellectual property laws. Subject to your
                compliance with these Terms, August AI grants you a limited, revocable, non-exclusive,
                non-transferable, non-sublicensable license to access and use the Platform for your
                personal, non-commercial use. All rights not expressly granted are reserved.{" "}
                <Strong>&ldquo;August AI,&rdquo;</Strong> the August AI logo, and related marks are
                trademarks of August Labs Inc.
              </P>
            </Section>

            {/* ── 19. User Content ── */}
            <Section id="s19" title="19. User Content">
              <P>
                You may submit User Content to the Platform. You retain ownership of your User
                Content. You grant August AI a worldwide, royalty-free, non-exclusive, sublicensable
                license to host, store, reproduce, transmit, display, and create derivative works of
                your User Content solely as necessary to (i) facilitate your Consultations with MDI
                clinicians, (ii) operate, secure, support, troubleshoot, evaluate, and improve the
                Platform, (iii) communicate with you, and (iv) comply with law. If User Content is
                provided directly to an MDI clinician during a Consultation or becomes part of an MDI
                medical record, it is handled by MDI under its applicable clinical privacy notices
                and legal obligations. You represent that you have the right to provide all User
                Content you submit and that your User Content does not infringe any third-party
                rights, violate law, or include information about any person under 18.
              </P>
            </Section>

            {/* ── 20. Third-Party ── */}
            <Section id="s20" title="20. Third-Party Services and Links">
              <P>
                The Platform may include or link to services operated by third parties, including
                MDI, payment processors, pharmacies, laboratories, hosting providers, communications
                vendors, analytics providers, and other service providers. We do not control these
                third parties, and your use of their services may be governed by their own terms and
                privacy policies. Inclusion of a link, integration, or third-party workflow does not
                constitute endorsement unless we expressly state otherwise.
              </P>
            </Section>

            {/* ── 21. Beta ── */}
            <Section id="s21" title="21. Beta Offerings">
              <P>
                From time to time, we may include test, preview, pilot, or beta features, tools, or
                products in the Platform (collectively, <Strong>&ldquo;Beta Offerings&rdquo;</Strong>).
                Your use of any Beta Offering is voluntary. Beta Offerings are provided on an
                &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis and may contain errors,
                defects, bugs, or inaccuracies that could cause failures, corruption, loss of data,
                inaccurate outputs, or unexpected behavior. You acknowledge and agree that all use of
                any Beta Offering is at your sole risk.
              </P>
              <P>
                If we provide any Beta Offering on a closed beta or confidential basis, we will
                notify you of that designation. For confidential Beta Offerings, you agree not to
                disclose, display, publish, or otherwise make available any information about or
                content from the Beta Offering to any third party without our prior written consent.
                Nothing in this Section creates any obligation on August AI to make a Beta Offering
                generally available, continue making it available, or release any production version.
              </P>
            </Section>

            {/* ── 22. Disclaimers ── */}
            <Section id="s22" title="22. Disclaimers">
              <AllCaps>
                Except where prohibited by law, the Platform is provided &ldquo;as is&rdquo; and
                &ldquo;as available,&rdquo; with all faults and without any warranty of any kind.
                August AI expressly disclaims all warranties, whether express, implied, statutory, or
                otherwise, including the implied warranties of merchantability, fitness for a
                particular purpose, title, and non-infringement, and any warranty arising out of
                course of dealing or usage of trade.
              </AllCaps>
              <P>
                Without limiting the foregoing, August AI does not warrant that (i) the Platform will
                be uninterrupted, secure, error-free, or free of harmful components; (ii) the results
                obtained from the Platform will be accurate, complete, or reliable; (iii) any
                AI-generated output is correct or appropriate for your situation; (iv) any
                Consultation will result in a prescription, diagnosis, referral, or particular
                outcome; or (v) any defect will be corrected. August AI does not provide medical
                advice, and nothing on the Platform is a substitute for professional medical judgment
                by a licensed clinician. Some jurisdictions do not allow the exclusion of certain
                warranties; in those jurisdictions, the exclusions in this Section apply to the
                maximum extent permitted by law.
              </P>
            </Section>

            {/* ── 23. Limitation of Liability ── */}
            <Section id="s23" title="23. Limitation of Liability">
              <AllCaps>
                To the maximum extent permitted by applicable law, in no event will August AI, its
                affiliates, officers, directors, employees, agents, or licensors be liable to you for
                any indirect, incidental, special, consequential, exemplary, or punitive damages,
                including damages for loss of profits, revenue, goodwill, data, business
                interruption, substitute goods or services, personal injury, or emotional distress,
                arising out of or related to these Terms, the Platform, AI-assisted features, or any
                Consultation, whether based in contract, tort, negligence, strict liability, statute,
                or any other legal theory, even if August AI has been advised of the possibility of
                such damages.
              </AllCaps>
              <AllCaps>
                To the maximum extent permitted by applicable law, the aggregate liability of August
                AI and its affiliates for all claims arising out of or related to these Terms or the
                Platform will not exceed the greater of (a) the total amounts paid by you to August
                AI for use of the Platform in the six months immediately preceding the event giving
                rise to the claim, or (b) one hundred U.S. dollars (US $100).
              </AllCaps>
              <P>
                August AI is not the provider of medical services and is not liable for the acts,
                omissions, diagnoses, treatments, prescriptions, referrals, or professional judgment
                of any MDI clinician, pharmacy, laboratory, or other healthcare provider. Claims
                relating to medical care should be directed to the providing clinician or entity.
              </P>
              <P>
                Some jurisdictions do not allow the exclusion or limitation of certain damages; in
                those jurisdictions, the limitations in this Section apply to the maximum extent
                permitted by law. Nothing in these Terms excludes or limits liability that cannot be
                excluded or limited under applicable law, including liability for fraud or willful
                misconduct.
              </P>
            </Section>

            {/* ── 24. Service Availability ── */}
            <Section id="s24" title="24. Service Availability, Continuity, and Failure">
              <P>
                August AI strives to make the Platform available on a continuous basis, but the
                Platform is provided over the public internet and depends on third-party
                infrastructure, including hosting, telecommunications, communications, electronic
                prescribing, scheduling, payment, and identity-verification networks. These services
                may be subject to outages, maintenance, cyber incidents, delays, or other
                disruptions. You acknowledge and agree that the Platform may be unavailable or fail
                to function correctly from time to time and that August AI does not guarantee any
                specific level of uptime, response time, or availability unless we have entered into
                a separate written agreement with you that says so.
              </P>
              <P>
                If the Platform is degraded, interrupted, or unavailable, or if August AI is
                otherwise unable to deliver its services for any reason, the consequence to you may
                include: (i) temporary or permanent inability to schedule, attend, or complete a
                Consultation through the Platform; (ii) delays in transmitting prescriptions, intake
                information, or messages to MDI clinicians; (iii) loss or unavailability of access to
                account data; and (iv) the need to seek care from an in-person provider, an
                alternative telehealth platform, urgent care, or emergency services. You should not
                rely on the Platform as your sole means of accessing medical care, and you should
                always have an alternative plan for in-person and emergency care. Where a
                Consultation Fee was charged but the Consultation could not be delivered due to a
                Platform failure before clinical review began, your sole and exclusive remedy is a
                refund or rescheduling of that Consultation, subject to Sections 13 and 23.
              </P>
              <P>
                Medical records created by MDI are maintained by MDI as the treating provider under
                applicable medical-record and professional obligations and are not dependent solely
                on the continued operation of the Platform. If the Platform ceases operation, you may
                request copies of your medical record from MDI through the process MDI makes
                available.
              </P>
            </Section>

            {/* ── 25. Indemnification ── */}
            <Section id="s25" title="25. Indemnification">
              <P>
                To the fullest extent permitted by law, you agree to indemnify, defend, and hold
                harmless August AI and its affiliates, officers, directors, employees, agents, and
                licensors from and against any and all third-party claims, damages, losses,
                liabilities, costs, and expenses, including reasonable attorneys&apos; fees, arising
                out of or related to (a) your access to or use of the Platform; (b) your violation of
                these Terms; (c) your User Content; (d) your violation of any law or third-party
                right; (e) any misrepresentation of identity, age, location, medical history,
                medications, allergies, symptoms, or payment information; or (f) your submission of
                information about any person under 18. We reserve the right to assume the exclusive
                defense and control of any matter otherwise subject to indemnification by you, and
                you agree to cooperate with our defense.
              </P>
            </Section>

            {/* ── 26. Termination ── */}
            <Section id="s26" title="26. Termination">
              <P>
                You may terminate these Terms at any time by closing your account. We may suspend or
                terminate your access to the Platform, with or without notice, if we reasonably
                believe you have violated these Terms, presented a safety risk, engaged in fraud or
                abuse, attempted to obtain care or prescriptions through deception, submitted
                information about a person under 18, or where required by law. Sections 1, 2, 10–16,
                18–25, and 27–32 survive termination.
              </P>
            </Section>

            {/* ── 27. Arbitration ── */}
            <Section id="s27" title="27. Dispute Resolution; Binding Arbitration; Class Action Waiver">
              <P>Please read this Section carefully — it affects your legal rights.</P>

              <SubSection title="27.1 Informal resolution">
                <P>
                  Before filing a claim, you and August AI agree to attempt to resolve the dispute
                  informally. You must first send a written &ldquo;Notice of Dispute&rdquo; to{" "}
                  <a href="mailto:support@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                    support@meetaugust.ai
                  </a>{" "}
                  describing the nature of the claim and the relief sought. The parties will
                  negotiate in good faith for at least 60 days before any arbitration may be
                  initiated.
                </P>
              </SubSection>

              <SubSection title="27.2 Agreement to arbitrate">
                <P>
                  Any dispute, claim, or controversy arising out of or relating to these Terms, the
                  Platform, AI-assisted features, or your relationship with August AI, whether based
                  in contract, tort, statute, fraud, misrepresentation, or any other legal theory,
                  and whether arising before, during, or after termination, will be resolved by final
                  and binding arbitration administered by JAMS under its Streamlined Arbitration
                  Rules and Procedures, or the Comprehensive Arbitration Rules where the amount in
                  controversy exceeds the applicable streamlined threshold. The arbitration will be
                  conducted by a single arbitrator. The seat of the arbitration will be Wilmington,
                  Delaware, and may be conducted by videoconference where the parties agree or the
                  arbitrator orders. Judgment on the award may be entered in any court of competent
                  jurisdiction.
                </P>
              </SubSection>

              <SubSection title="27.3 Federal Arbitration Act">
                <P>
                  This arbitration agreement is governed by the Federal Arbitration Act. The
                  arbitrator, and not any court, has exclusive authority to resolve any dispute
                  relating to the interpretation, applicability, enforceability, or formation of this
                  arbitration agreement, except that issues relating to the enforceability or
                  interpretation of the class action waiver below are reserved to a court.
                </P>
              </SubSection>

              <SubSection title="27.4 Class action waiver">
                <AllCaps>
                  You and August AI agree that each may bring claims against the other only in your
                  or its individual capacity, and not as a plaintiff or class member in any purported
                  class, collective, consolidated, or representative proceeding.
                </AllCaps>
                <P>
                  The arbitrator may not consolidate more than one person&apos;s claims and may not
                  preside over any form of representative or class proceeding. If this class action
                  waiver is found unenforceable as to any claim, that claim, and only that claim,
                  will be severed and proceed in court, while all other claims will proceed in
                  arbitration.
                </P>
              </SubSection>

              <SubSection title="27.5 Mass arbitration">
                <P>
                  If 75 or more similar arbitration demands are filed against August AI or related
                  parties by or with coordination among the same or related counsel, the JAMS Mass
                  Arbitration Procedures and Guidelines will apply unless JAMS determines otherwise
                  or unless the parties agree to a different procedure in writing.
                </P>
              </SubSection>

              <SubSection title="27.6 Exceptions">
                <P>
                  Notwithstanding the foregoing, either party may (i) bring an individual action in a
                  small-claims court of competent jurisdiction for claims that qualify; (ii) seek
                  injunctive or other equitable relief in court to protect intellectual property
                  rights; (iii) bring claims that may not be arbitrated as a matter of law; or (iv)
                  seek public injunctive relief to the extent such relief cannot be waived under
                  applicable law.
                </P>
              </SubSection>

              <SubSection title="27.7 Costs and fees">
                <P>
                  August AI will pay all JAMS filing, administrative, and arbitrator fees for any
                  individual consumer arbitration brought under this Section to the extent such fees
                  would exceed the costs of a comparable court action, except where the arbitrator
                  finds the claim was frivolous or brought for an improper purpose. If JAMS consumer
                  minimum standards or applicable law require different cost allocation, those
                  standards or laws will control. Each party otherwise bears its own attorneys&apos;
                  fees and costs unless awarded by the arbitrator under applicable law.
                </P>
              </SubSection>

              <SubSection title="27.8 30-day right to opt out">
                <P>
                  You may opt out of this arbitration agreement by sending a written opt-out notice
                  to{" "}
                  <a href="mailto:support@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                    support@meetaugust.ai
                  </a>{" "}
                  within 30 days of first accepting these Terms, including your full name, email
                  associated with your account, and a clear statement that you decline to be bound by
                  this arbitration provision. Opting out will not affect any other provision of these
                  Terms.
                </P>
              </SubSection>
            </Section>

            {/* ── 28. Governing Law ── */}
            <Section id="s28" title="28. Governing Law and Venue">
              <P>
                These Terms and any dispute arising out of or related to them or the Platform are
                governed by the laws of the State of Delaware, without regard to conflict-of-laws
                principles, and, where applicable, by U.S. federal law, including the Federal
                Arbitration Act. Subject to Section 27, the exclusive venue for any non-arbitrable
                action will be the state and federal courts located in New Castle County, Delaware,
                and the parties consent to the personal jurisdiction of those courts. The United
                Nations Convention on Contracts for the International Sale of Goods does not apply.
              </P>
            </Section>

            {/* ── 29. State Notices ── */}
            <Section id="s29" title="29. State-Specific Notices">
              <P>
                Telehealth services are subject to state-specific requirements. Additional
                state-specific notices, consents, provider disclosures, prescribing restrictions,
                complaint information, service limitations, or availability rules may be presented in
                the Consultation workflow or on a State-Specific Notices page. Those notices are
                incorporated into these Terms to the extent applicable.
              </P>
              <UL>
                <LI><Strong>California residents.</Strong> Pursuant to California Civil Code Section 1789.3, the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs may be contacted at 1625 North Market Blvd., Suite N 112, Sacramento, CA 95834 or by telephone at (800) 952-5210.</LI>
                <LI><Strong>Clinician identity and licensure.</Strong> The identity, licensure, credentials, and professional entity of the treating clinician may be made available in the Consultation workflow, clinical documentation, prescription records, patient portal, or other materials provided by MDI.</LI>
                <LI><Strong>State medical board complaints.</Strong> Concerns about a clinician&apos;s practice may be directed to the medical board or professional licensing authority of the state in which the clinician is licensed. We or MDI will provide reasonable assistance in identifying the appropriate board upon request.</LI>
                <LI><Strong>Service availability.</Strong> Availability of specific services, prescriptions, labs, referrals, reproductive-health services, gender-affirming services, mental or behavioral health services, and other categories of care may vary by state, clinician licensure, clinical appropriateness, and applicable law. Eligibility will be assessed during intake and clinical review.</LI>
              </UL>
            </Section>

            {/* ── 30. Modifications ── */}
            <Section id="s30" title="30. Modifications to the Terms">
              <P>
                We may update these Terms from time to time. If we make material changes, we will
                provide reasonable notice, for example by email, in-product banner, or notice on the
                Platform, and update the &ldquo;Last Updated&rdquo; date above. Continued use of the
                Platform after the updated Terms become effective constitutes acceptance of the
                updated Terms. If you do not agree to the updated Terms, you must stop using the
                Platform.
              </P>
            </Section>

            {/* ── 31. General Provisions ── */}
            <Section id="s31" title="31. General Provisions">
              <SubSection title="Entire agreement">
                <P>
                  These Terms, together with the{" "}
                  <a href="/privacy" style={{ color: "#206E55", fontWeight: 500 }}>
                    Privacy Policy
                  </a>{" "}
                  and any additional agreements, consents, or notices you accept, including
                  telehealth informed consents and clinical privacy notices where applicable,
                  constitute the entire agreement between you and August AI concerning the Platform
                  and supersede any prior agreements.
                </P>
              </SubSection>

              <SubSection title="Severability">
                <P>
                  If any provision is held unenforceable, the remaining provisions will remain in
                  full force, and the unenforceable provision will be modified to the minimum extent
                  necessary to make it enforceable.
                </P>
              </SubSection>

              <SubSection title="No waiver">
                <P>Our failure to enforce any provision is not a waiver of our right to do so later.</P>
              </SubSection>

              <SubSection title="Assignment">
                <P>
                  You may not assign these Terms without our prior written consent. We may assign
                  these Terms in connection with a merger, acquisition, financing, reorganization,
                  sale of assets, or transfer to an affiliate.
                </P>
              </SubSection>

              <SubSection title="Force majeure">
                <P>
                  Neither party is liable for delays or failures to perform caused by events beyond
                  its reasonable control, including acts of God, war, terrorism, civil unrest, labor
                  disputes, governmental action, pandemics, epidemics, natural disasters, internet or
                  utility failures, cyber incidents, or third-party outages.
                </P>
              </SubSection>

              <SubSection title="Independent contractors">
                <P>
                  The relationship between August AI and you, and between August AI and MDI, is that
                  of independent contracting parties. No partnership, agency, joint venture,
                  employment relationship, or medical practice relationship is created between
                  August AI and MDI or between August AI and any MDI clinician.
                </P>
              </SubSection>

              <SubSection title="Notices to August AI">
                <P>
                  Legal notices must be sent in writing to August Labs Inc., c/o InCorp Services,
                  Inc., 131 Continental Drive, Suite 301, Newark, DE 19713-4323, with a copy to{" "}
                  <a href="mailto:support@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                    support@meetaugust.ai
                  </a>
                  .
                </P>
              </SubSection>

              <SubSection title="No relationship to prior operator">
                <P>
                  August Labs Inc. is a Delaware corporation and is not a successor in interest to,
                  and assumes no obligations of, any prior operator of the{" "}
                  <a href="https://www.meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                    meetaugust.ai
                  </a>{" "}
                  domain or any predecessor brand. Any agreements you may have entered into with such
                  prior operator are separate from, and do not bind, August Labs Inc.
                </P>
              </SubSection>
            </Section>

            {/* ── 32. Contact ── */}
            <Section id="s32" title="32. Contact Us">
              <P>Questions about these Terms or the Platform may be directed to:</P>
              <InfoCard>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</p>
                    <a href="mailto:support@meetaugust.ai" style={{ fontSize: "15px", color: "#206E55", fontWeight: 500 }}>
                      support@meetaugust.ai
                    </a>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Company</p>
                    <p style={{ fontSize: "15px", color: "rgba(28,25,23,0.7)", lineHeight: 1.6 }}>
                      August Labs Inc. d/b/a August AI
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Address</p>
                    <p style={{ fontSize: "15px", color: "rgba(28,25,23,0.7)", lineHeight: 1.6 }}>
                      131 Continental Drive, Suite 301<br />
                      Newark, New Castle County, DE 19713-4323
                    </p>
                  </div>
                </div>
              </InfoCard>
              <P style={{ fontSize: "13px", color: "rgba(28,25,23,0.5)", marginTop: "24px" }}>
                © 2026 August Labs Inc. All rights reserved. August AI is a digital health platform;
                medical care is provided by MDI clinicians and applicable MDI-affiliated professional
                entities. Not a substitute for emergency services. If you have a medical emergency,
                call 911.
              </P>
            </Section>

          </div>
        </div>
      </div>
    </main>
  );
}
