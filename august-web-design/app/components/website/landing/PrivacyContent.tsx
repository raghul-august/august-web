"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ────────────────────────────────────────────────────────────
   Hero — same interactive ripple grid as benchmarks
─────────────────────────────────────────────────────────────── */
function PrivacyHero() {
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

    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      strength: number;
      life: number;
    }
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
        ripples.push({
          x: mouseX,
          y: mouseY,
          radius: 0,
          maxRadius: 180,
          strength: 12,
          life: 1,
        });
        lastSpawn = now;
        if (ripples.length > 20) ripples.shift();
      }
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    const getDisplacement = (
      px: number,
      py: number
    ): [number, number] => {
      let dx = 0;
      let dy = 0;
      for (const r of ripples) {
        const distX = px - r.x;
        const distY = py - r.y;
        const dist = Math.sqrt(distX * distX + distY * distY);
        const ringDist = Math.abs(dist - r.radius);
        const ringWidth = 60;
        if (ringDist < ringWidth) {
          const factor =
            r.strength *
            r.life *
            Math.cos((ringDist / ringWidth) * (Math.PI / 2));
          const angle = Math.atan2(distY, distX);
          dx += Math.cos(angle) * factor;
          dy += Math.sin(angle) * factor;
        }
      }
      return [dx, dy];
    };

    const MAJOR = 80;
    const MINOR = 20;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.5;
        r.life *= 0.985;
        if (r.life < 0.01 || r.radius > r.maxRadius * 1.5) {
          ripples.splice(i, 1);
        }
      }

      const hasRipples = ripples.length > 0;
      const step = hasRipples ? 4 : 0;

      ctx.strokeStyle = "rgba(168, 213, 186, 0.06)";
      ctx.lineWidth = 0.5;

      for (let y = 0; y < height; y += MINOR) {
        if (y % MAJOR === 0) continue;
        ctx.beginPath();
        if (hasRipples) {
          for (let x = 0; x <= width; x += step) {
            const [, dy] = getDisplacement(x, y);
            if (x === 0) ctx.moveTo(x, y + dy);
            else ctx.lineTo(x, y + dy);
          }
        } else {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      for (let x = 0; x < width; x += MINOR) {
        if (x % MAJOR === 0) continue;
        ctx.beginPath();
        if (hasRipples) {
          for (let y = 0; y <= height; y += step) {
            const [dx] = getDisplacement(x, y);
            if (y === 0) ctx.moveTo(x + dx, y);
            else ctx.lineTo(x + dx, y);
          }
        } else {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(168, 213, 186, 0.12)";
      ctx.lineWidth = 0.5;

      for (let y = 0; y < height; y += MAJOR) {
        ctx.beginPath();
        if (hasRipples) {
          for (let x = 0; x <= width; x += step) {
            const [, dy] = getDisplacement(x, y);
            if (x === 0) ctx.moveTo(x, y + dy);
            else ctx.lineTo(x, y + dy);
          }
        } else {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      for (let x = 0; x < width; x += MAJOR) {
        ctx.beginPath();
        if (hasRipples) {
          for (let y = 0; y <= height; y += step) {
            const [dx] = getDisplacement(x, y);
            if (y === 0) ctx.moveTo(x + dx, y);
            else ctx.lineTo(x + dx, y);
          }
        } else {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    };

    resize();
    rafId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
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
      {/* Interactive ripple grid */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 65% 55% at 50% 45%, transparent 0%, rgba(23, 69, 58, 0.6) 80%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 40% 40% at 50% 45%, rgba(32, 110, 85, 0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-[1200px] px-6 text-center md:px-10 lg:px-20">
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "rgba(168, 213, 186, 0.7)",
          }}
        >
          Legal
        </span>
        <h1
          className="mx-auto max-w-3xl"
          style={{
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#FAF9F5",
            marginTop: "12px",
          }}
        >
          Privacy Policy
        </h1>
        <p
          className="mx-auto mt-2 max-w-2xl"
          style={{
            fontSize: "clamp(15px, 1.8vw, 18px)",
            fontWeight: 300,
            lineHeight: 1.7,
            color: "rgba(250, 249, 245, 0.6)",
          }}
        >
          How August Health collects, uses, and protects your personal&nbsp;information.
        </p>
      </div>
    </section>
  );
}

const TOC = [
  { id: "introduction", label: "Introduction" },
  { id: "general-approach", label: "General Approach" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "use-of-personal-information", label: "Use of Personal Information" },
  { id: "your-affirmation", label: "Your Affirmation" },
  { id: "sharing-and-transfer", label: "Sharing & Transfer" },
  { id: "ai-data-uses", label: "AI Data Uses" },
  { id: "data-security", label: "Data Collection & Security" },
  { id: "data-retention", label: "Data Retention & Protection" },
  { id: "cookies", label: "Cookies" },
  { id: "your-rights", label: "Your Rights" },
  { id: "arbitration", label: "Arbitration & Dispute Resolution" },
  { id: "changes", label: "Changes to Our Policy" },
  { id: "grievance", label: "Grievance Redressal" },
  { id: "contact", label: "Contact Information" },
];

function SideNav({ activeId }: { activeId: string }) {
  return (
    <nav className="hidden lg:block" aria-label="Table of contents">
      <div className="sticky top-32">
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(28, 25, 23, 0.4)",
            marginBottom: "16px",
          }}
        >
          On this page
        </p>
        <ul className="flex flex-col gap-1">
          {TOC.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block transition-all duration-200"
                style={{
                  fontSize: "13px",
                  fontWeight: activeId === item.id ? 500 : 400,
                  color:
                    activeId === item.id
                      ? "#206E55"
                      : "rgba(28, 25, 23, 0.45)",
                  padding: "6px 0 6px 16px",
                  borderLeft:
                    activeId === item.id
                      ? "2px solid #206E55"
                      : "2px solid transparent",
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

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ scrollMarginTop: "120px" }}>
      <h2
        style={{
          fontSize: "clamp(22px, 3vw, 28px)",
          fontWeight: 400,
          color: "#1C1917",
          letterSpacing: "-0.02em",
          lineHeight: 1.3,
          marginBottom: "20px",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(28, 25, 23, 0.08)",
        }}
      >
        {title}
      </h2>
      <div className="privacy-body">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "28px" }}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 500,
          color: "#1C1917",
          letterSpacing: "-0.01em",
          lineHeight: 1.4,
          marginBottom: "12px",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p
      style={{
        fontSize: "15px",
        fontWeight: 400,
        lineHeight: 1.7,
        color: "rgba(28, 25, 23, 0.7)",
        marginTop: "12px",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul
      style={{
        marginTop: "12px",
        paddingLeft: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {children}
    </ul>
  );
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        fontSize: "15px",
        fontWeight: 400,
        lineHeight: 1.7,
        color: "rgba(28, 25, 23, 0.7)",
        listStyleType: "disc",
      }}
    >
      {children}
    </li>
  );
}

function OL({ children, type = "decimal" }: { children: React.ReactNode; type?: "decimal" | "lower-alpha" }) {
  return (
    <ol
      style={{
        marginTop: "12px",
        paddingLeft: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        listStyleType: type,
      }}
    >
      {children}
    </ol>
  );
}

function OLI({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        fontSize: "15px",
        fontWeight: 400,
        lineHeight: 1.7,
        color: "rgba(28, 25, 23, 0.7)",
      }}
    >
      {children}
    </li>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ fontWeight: 500, color: "#1C1917" }}>{children}</strong>;
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: "16px",
        padding: "20px 24px",
        borderRadius: "12px",
        background: "rgba(32, 110, 85, 0.04)",
        border: "1px solid rgba(32, 110, 85, 0.08)",
      }}
    >
      {children}
    </div>
  );
}

export default function PrivacyContent() {
  const [activeId, setActiveId] = useState("introduction");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    TOC.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-cream" style={{ paddingBottom: "80px" }}>
      <PrivacyHero />

      {/* Spacing between hero and content */}
      <div style={{ height: "48px" }} className="md:hidden" />
      <div style={{ height: "64px" }} className="hidden md:block" />

      {/* Content grid: sidebar + main */}
      <div
        ref={contentRef}
        className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-20"
      >
        <div className="lg:grid lg:gap-16" style={{ gridTemplateColumns: "220px 1fr" }}>
          <SideNav activeId={activeId} />

          <div className="flex flex-col gap-14 max-w-[720px]">
            {/* ── Last updated ── */}
            <P style={{ fontSize: "14px", color: "rgba(28, 25, 23, 0.5)", marginTop: 0 }}>
              Last updated: March 11, 2026
            </P>

            {/* ── Introduction ── */}
            <Section id="introduction" title="Introduction">
              <P>
                This Privacy Policy (<Strong>&ldquo;Policy&rdquo;</Strong>), read with the Terms of Use, govern
                the manner in which Goodness Factory Living Essentials Private Limited, a private limited
                company registered under the Indian Companies Act, 2013, and having its registered office
                at 506/507, 1st Main Road, KR Garden, Murugeshpallya, Bengaluru, India
                (<Strong>&ldquo;Company&rdquo;</Strong>, <Strong>&ldquo;Beyond&rdquo;</Strong>,{" "}
                <Strong>&ldquo;we,&rdquo;</Strong> <Strong>&ldquo;our,&rdquo;</Strong> or{" "}
                <Strong>&ldquo;us&rdquo;</Strong>) collects, uses, maintains, stores, processes, and
                discloses any information collected from users (<Strong>&ldquo;User&rdquo;</Strong> or{" "}
                <Strong>&ldquo;you&rdquo;</Strong>) of our website www.getbeyondhealth.com and all of its
                subdomains and aliases (the <Strong>&ldquo;Site&rdquo;</Strong>), the Beyond mobile
                application (the <Strong>&ldquo;App&rdquo;</Strong>), the artificial intelligence-based
                health information and analytical platform and services currently named as August.ai
                (the <Strong>&ldquo;Platform&rdquo;</Strong>) (collectively, the{" "}
                <Strong>&ldquo;Services&rdquo;</Strong>).
              </P>
              <P>
                We aim to protect your personal information and respect your privacy. By accessing or
                using any of our Services, you confirm that you have read and agree to be bound by this
                Policy and consent to the collection, storing, processing, of your Personal Information
                (defined hereunder), as described under this Policy. If you do not agree with the terms
                of this Policy, including in relation to the manner of collection or use of your
                information, please do not use or access our Services.
              </P>
            </Section>

            {/* ── General Approach ── */}
            <Section id="general-approach" title="General Approach">
              <P>For the purpose of this Policy:</P>
              <P>
                <Strong>&ldquo;Data Protection Law&rdquo;</Strong> means any data protection, data
                security or privacy law, including, without limitation, the Information Technology
                (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information)
                Rules, 2011 (RSP Rules), Digital Personal Data Protection Act, 2023 (DPDA) and any laws
                governing Personal Information, Sensitive Personal Information (defined hereunder) or
                information outbound telephone calls, transmission of electronic mail, transmission of
                facsimile messages and any other communication-related and applicable data protection,
                data security or privacy laws.
              </P>
              <P>
                <Strong>&ldquo;Personal Information&rdquo;</Strong> means any personally identifiable
                information relating to an identified or identifiable individual or User, including data
                that identifies an individual or User or that could be directly, and without being
                combined or used with any other data, used to, contact an individual or User. Personal
                Information includes both directly identifiable information, such as a name,
                identification number, phone number or unique job title, and indirectly identifiable
                information such as date of birth, unique mobile or wearable device identifier,
                information that could be used to identify a household, telephone number, key-coded data
                or online identifiers, such as IP addresses, and includes any data that constitutes
                &ldquo;personal data&rdquo; under the RSP Rules, the DPDA or similar terms under other
                Data Protection Law.
              </P>
              <P>
                <Strong>&ldquo;Sensitive Personal Data or Information&rdquo;</Strong> with respect to a
                person means such personal information which consists of information relating to:
              </P>
              <OL type="lower-alpha">
                <OLI>password;</OLI>
                <OLI>financial information such as bank account or credit card or debit card or other payment instrument details;</OLI>
                <OLI>physical, physiological and mental health condition;</OLI>
                <OLI>sexual orientation;</OLI>
                <OLI>medical records and history;</OLI>
                <OLI>biometric information;</OLI>
                <OLI>any detail relating to the above sections as provided to body corporate for providing services; and</OLI>
                <OLI>any of the information received under above provisions by body corporate for processing, storing or transmitting under lawful contract or otherwise.</OLI>
              </OL>
              <P>
                The Company is at the forefront of conversational artificial intelligence
                (&ldquo;AI&rdquo;) technology, which we believe will revolutionize human-computer
                interactions. Our mission is to create AI that is safe, intelligent, empathetic, and
                engaging. Achieving this requires a thorough understanding of how users interact with
                AI. We assure you that we never sell your Personal Information or Sensitive Personal
                Information to any third parties or use it for targeted advertising.
              </P>
              <P>
                Transparency about data collection, usage, and security is paramount. This Policy
                outlines the types of data/information we collect, how we protect it, and how it is
                used to enhance our Services. Key points include:
              </P>
              <UL>
                <LI>Beyond is an informational platform, not a substitute for professional medical advice. Always consult a healthcare professional for medical advice.</LI>
                <LI>We collect data such as your name, phone number, and Internet Protocol (&ldquo;IP&rdquo;) address to operate and improve our platform, ensure user safety, and comply with our legal obligations.</LI>
                <LI>Protecting the privacy and security of your interactions with Beyond is our top priority. We do not sell or share your data for advertising or marketing purposes.</LI>
                <LI>Users must adhere to our Acceptable Use Policy (as set forth in our Terms of Use) and refrain from engaging in harmful, abusive, or illegal activities. Violations may result in suspension.</LI>
                <LI>The Services are intended for users aged 18 (eighteen) years and above.</LI>
                <LI>Content provided by Beyond should be independently verified before being relied upon.</LI>
              </UL>
            </Section>

            {/* ── Information We Collect ── */}
            <Section id="information-we-collect" title="Information We Collect">
              <SubSection title="Information Provided by You">
                <UL>
                  <LI><Strong>Contact and Account Information:</Strong> First and last name, email address, phone number.</LI>
                  <LI><Strong>Content and Metadata:</Strong> Messages sent using the Services.</LI>
                  <LI><Strong>Communications:</Strong> Responses to surveys, questions, feedback.</LI>
                  <LI><Strong>Health Information:</Strong> Information about your health, including health records retrieved from healthcare providers via FHIR APIs and health information exchanges, with your authorization; health and fitness data from Apple HealthKit and/or fitness trackers and wearables, if you choose to connect them. PDFs and images containing health-related data.</LI>
                  <LI><Strong>Other Information:</Strong> As disclosed at the time of collection.</LI>
                </UL>
              </SubSection>

              <SubSection title="Automatic Data Collection">
                <P>
                  We and our service providers may automatically collect information about your device
                  and interaction with our Services:
                </P>
                <UL>
                  <LI><Strong>Device Data:</Strong> Operating system, manufacturer, model, browser type, screen resolution, IP address, unique identifiers, language settings, and general location.</LI>
                  <LI><Strong>Online Activity Data:</Strong> Pages viewed, time spent on pages, referral websites, navigation paths, activity on pages, access times, and engagement with communications.</LI>
                </UL>
                <P>
                  We may combine this automatically collected information with other information we
                  collect about you. This information helps us to prevent fraud and keep the Services
                  secure, analyze and understand how the Services work for Users, and provide a more
                  personalized experience for Users.
                </P>
              </SubSection>

              <SubSection title="Tools for Automatic Data Collection">
                <UL>
                  <LI><Strong>Cookies:</Strong> Text files stored on your device to uniquely identify your browser and store information for efficient navigation and user preferences.</LI>
                  <LI><Strong>Local Storage Technologies:</Strong> HTML5-based storage for larger data amounts outside the browser.</LI>
                  <LI><Strong>Web Beacons:</Strong> Pixel tags or clear GIFs used to confirm access to webpages or emails.</LI>
                </UL>
              </SubSection>

              <SubSection title="Information from Other Sources">
                <P>
                  If you interact with our Services via third-party platforms (such as Facebook
                  Messenger, Whatsapp), we collect your profile identifier from these platforms.
                </P>
              </SubSection>

              <SubSection title="Sensitive Data">
                <P>
                  You may provide Sensitive Personal Information in your interactions with the Services.
                  By doing so, you consent to our use of these data as outlined in this Policy. By using
                  the Services, you are authorizing us to gather, resolve, and retain data related to
                  the provision of the Services.
                </P>
              </SubSection>
            </Section>

            {/* ── Use of Personal Information ── */}
            <Section id="use-of-personal-information" title="Use of Personal Information">
              <P>We use Personal Information for the following purposes:</P>
              <UL>
                <LI><Strong>Service Provision:</Strong> Operate, maintain, and provide our Services as per our Terms of Use, including for personalization of our Services.</LI>
                <LI><Strong>Communication:</Strong> Respond to requests, provide customer support, and send announcements, surveys, updates, and security alerts.</LI>
                <LI><Strong>Service Improvement:</Strong> Understand user needs, personalize user experiences, troubleshoot, and secure the Services.</LI>
                <LI><Strong>Research and Development:</Strong> Analyze and improve the services and our business, using anonymized or aggregated data when possible.</LI>
                <LI><Strong>Compliance and Protection:</Strong> Comply with legal obligations, protect rights and safety, enforce terms and conditions, and prevent unauthorized activities.</LI>
              </UL>
            </Section>

            {/* ── Your Affirmation ── */}
            <Section id="your-affirmation" title="Your Affirmation in Relation to Your Personal Information">
              <P>
                You hereby represent and declare that all personal information you supply to us is
                true, accurate, and current. We try our best to give you access to and control over
                any incomplete or inaccurate data, subject to any applicable legal obligations.
              </P>
              <P>
                If you are in the European Economic Area and you believe that someone has entrusted
                your information to us for processing (for instance, your employer or a company whose
                services you use), you can request certain actions from us regarding your data. To
                exercise those data rights, please contact the person or company that entrusted the
                data to us and we will work with them on your request.
              </P>
            </Section>

            {/* ── Sharing and Transfer ── */}
            <Section id="sharing-and-transfer" title="Sharing & Transfer of Personal Information">
              <P>
                We and our Services are based in India. As a result, Personal Information that we
                collect in and through the Services may be transferred to our India offices.
                Additionally, we may work with third-party service providers to support our business
                activities. Thus, Personal Information may be transferred to, stored on servers in,
                and accessed from India. In all such instances, we may use, transfer, and disclose
                Personal Information solely for the purposes described in this Policy and in compliance
                with Data Protection Laws.
              </P>
              <P>
                Furthermore, we do not sell or share Personal Information for advertising purposes.
                We may disclose Personal Information to:
              </P>
              <UL>
                <LI><Strong>Service Providers:</Strong> Third-party providers supporting our Services (such as hosting, cloud storage, security, customer support, AI model providers).</LI>
                <LI><Strong>Business Transferees:</Strong> In the event of bankruptcy, change of control, or business sale/merger.</LI>
                <LI><Strong>Authorities and Others:</Strong> Regulatory agencies, law enforcement, courts, and other government authorities for legal compliance and protection.</LI>
              </UL>
            </Section>

            {/* ── AI Data Uses ── */}
            <Section id="ai-data-uses" title="Artificial Intelligence Data Uses & Disclosures">
              <P>
                In addition to the descriptions of how data is collected, used, and disclosed above,
                we may also collect, use, and disclose data for purposes involving our use of
                artificial intelligence (&ldquo;AI&rdquo;), such as:
              </P>

              <SubSection title="Types of Personal Data AI May Process">
                <P>
                  In addition to the data types listed above and depending on how you use our Services
                  and the features you enable, we may also process the following Personal Data related
                  to AI products and services:
                </P>
                <UL>
                  <LI>Messages and other inputs you submit, and files or images you upload;</LI>
                  <LI>Audio you choose to submit (for example, voice notes) and transcripts, where available;</LI>
                  <LI>Health records, medical documents, and other health information you choose to upload, input, or connect; and</LI>
                  <LI>Health and fitness information from third-party sources you choose to connect (for example, Apple HealthKit or other integrations), subject to your settings and permissions.</LI>
                </UL>
              </SubSection>

              <SubSection title="How We Use Personal Data Related to AI Services">
                <P>
                  We may also use your Personal Data to develop, train, or provide AI models, products,
                  or services. Beyond personnel, including clinicians and support staff, may access or
                  review Personal Data to provide the services, respond to requests, ensure safety,
                  comply with law, and improve service quality.
                </P>
              </SubSection>

              <SubSection title="How We Disclose Personal Data Related to AI Services">
                <P>
                  We may disclose your Personal Data to the following parties in relation to AI
                  products and services:
                </P>
                <UL>
                  <LI>Service Providers, such as those that help us provide AI functionality and related services (e.g., cloud hosting, AI model providers, and safety, security, and monitoring tools).</LI>
                  <LI>Third-party AI providers, such as those that provide an AI-assisted feature. Where required by law, we obtain your explicit permission before sharing Personal Data with third parties, including third-party AI providers.</LI>
                </UL>
              </SubSection>

              <SubSection title="Your Choices and Controls">
                <P>
                  You may choose what Personal Data to submit through our Services and which
                  integrations to connect. You may revoke permissions or disable certain features
                  through your device settings or within our Digital Properties, as applicable. If an
                  AI-assisted feature requires consent, you may decline consent.
                </P>
              </SubSection>
            </Section>

            {/* ── Data Security ── */}
            <Section id="data-security" title="Data Collection & Security">
              <P>
                We prioritize the integrity and security of your data. We adopt appropriate data
                collection, storage and processing practices and security measures to protect against
                unauthorized access, alteration, disclosure or destruction of your Personal Information
                which we may have access to. We take steps to ensure that your information is treated
                securely and in accordance with this Policy. Unfortunately, the Internet cannot be
                guaranteed to be 100% secure, and we cannot ensure or warrant the security of any
                information while you are providing the same to us. We do not accept liability for
                unintentional disclosure of such information.
              </P>
              <P>
                By using the Service or providing Personal Information to us, you agree that we may
                communicate with you electronically regarding security, privacy, and administrative
                issues relating to your use of the Services. If we learn of a security system&apos;s
                breach, we may attempt to notify you electronically by posting a notice on the Services
                or sending an email to you. We may release information when its release is appropriate
                to comply with any applicable law, enforce our policies, or protect ours or
                others&apos; rights, property or safety.
              </P>
              <P>
                The Services may enable you to access several other third-party websites plug-ins and
                applications (including cookies, tracking technologies and widgets by third party
                advertisers) on which we have no control. It is important that you understand that by
                clicking on those links or enabling those connections, you may allow third parties to
                collect or share data about you. We do not have oversight of these third-party
                websites, plug-ins and applications and we are not responsible for their processing
                or using of your information. Any information collected by a third party in this
                manner is subject to that third party&apos;s own data collection, use and disclosure
                policies and you must make yourselves conversant with those. We encourage you to read
                such third parties&apos; privacy statements to learn more on how they process your
                Personal Information. We do not assume any liability to any user for their access and
                use of such third-party websites and its content thereof.
              </P>
            </Section>

            {/* ── Data Retention ── */}
            <Section id="data-retention" title="Data Retention & Protection">
              <P>
                We retain Personal Information as required by applicable Data Protection Laws and for
                the purposes it was collected, or until you withdraw your consent. Retention periods
                are determined based on the data&apos;s nature, sensitivity, risk of harm, purposes of
                use, and legal requirements. We maintain your records and information in a safe and
                secure manner as per this Policy and in compliance with the statutory provisions and
                directions.
              </P>
              <P>
                By using our Services, directly or indirectly, you expressly consent to our use and
                disclosure of your Personal Information submitted to us in accordance with this Policy.
                Personal Information, if captured, is securely stored and archived. We do not allow any
                unauthorized access to the information stored by us in any form whatsoever. The
                information is securely stored and access is restricted to authorized personnel only.
                We take necessary physical, technical, managerial, and operational measures that are
                designed to improve the integrity and security of information that we collect and
                maintain as required by applicable Data Protection Laws. Company also regularly reviews
                its policies regarding the collection, storage, using and processing of your Personal
                Information, including physical security measures, preventing alteration, loss, query,
                use or fraudulent or unauthorized access of your Personal Information.
              </P>
              <P>
                We use of firewalls, encryption and data leakage prevention technologies to protect
                your information and we undertake regular audit of vendors and service providers, and
                execution of non-disclosure agreements before availing their services.
              </P>
            </Section>

            {/* ── Cookies ── */}
            <Section id="cookies" title="Cookies">
              <P>
                We use cookies to track website usage. Cookies are small data files stored on your
                device by your browser. These cookies enhance website performance and functionality
                but are non-essential. Disabling cookies may result in limited functionality, such as
                unavailable videos or the need to re-enter login details. We do not store personally
                identifiable information in cookies.
              </P>
              <P>
                You may configure your browser to block cookies and similar technologies. Blocking
                essential cookies may impair website functionality and limit access to features and
                services. Blocking cookies may also result in the loss of saved information, such as
                login details and site preferences. For instructions on deleting cookies, refer to
                your browser&apos;s help menu.
              </P>
            </Section>

            {/* ── Your Rights ── */}
            <Section id="your-rights" title="Your Rights">
              <P>
                In accordance with applicable Data Protection Laws, we facilitate the exercise of your
                rights regarding Personal Information. Contact us if you wish to access, review, erase,
                withdraw consent, object to, or restrict the processing of your Personal Data. We will
                review such requests promptly and in compliance with applicable Data Protection Laws.
              </P>
              <P>
                We encourage you to first contact us allowing us the opportunity to address your
                concerns directly should you believe your rights concerning Personal Information have
                been violated.
              </P>
            </Section>

            {/* ── Arbitration ── */}
            <Section id="arbitration" title="Arbitration & Dispute Resolution">
              <SubSection title="Governing Law">
                <P>
                  Use of Services or any issues arising out of such use of Services and any conflict
                  with regard to these Terms and the Privacy Policy shall be governed and construed
                  in accordance with the laws of India without regard to the conflict of laws
                  provisions thereof. Any arbitration conducted pursuant to these Terms and/or the
                  Privacy Policy and/or the use of Services shall be governed by the Arbitration and
                  Conciliation Act, 2015. Subject to the Arbitration provision mentioned hereunder,
                  all disputes arising under these Terms and/or the Privacy Policy and/or use of
                  Services shall be subject to the exclusive jurisdiction of courts in Bangalore,
                  Karnataka, India.
                </P>
              </SubSection>

              <SubSection title="Arbitration">
                <P>
                  For any dispute with Beyond, kindly first contact us and attempt to resolve the
                  dispute amicably. In the unlikely event that any dispute subsists after such an
                  attempt in connection with the validity, interpretation, implementation or alleged
                  breach of any provision of these Terms and/or the Privacy Policy or the documents
                  they incorporate by reference, the dispute shall be referred to a sole arbitrator
                  who shall be an independent and neutral third party identified by Beyond. The
                  arbitration proceedings shall take place in English and shall be governed by the
                  Arbitration and Conciliation Act, 2015. Nothing in this provision shall be deemed
                  as preventing the Company from seeking injunctive or other equitable relief from
                  the Courts as necessary to prevent the actual or threatened infringement,
                  misappropriation, or violation of our data security, intellectual property rights
                  or other proprietary rights.
                </P>
              </SubSection>
            </Section>

            {/* ── Changes ── */}
            <Section id="changes" title="Changes To Our Policy">
              <P>
                We may change our Service and policies, and we may need to make changes to this
                Policy so that they accurately reflect our Service and policies. Unless otherwise
                required by law, we will notify you (for example, through our Service) before we
                make changes to this Policy and give you an opportunity to review them before they
                go into effect. Then, if you continue to use the Service, you will be bound by the
                updated Privacy Policy. If you do not want to agree to this or any updated Privacy
                Policy, you must discontinue use or access to our Services.
              </P>
            </Section>

            {/* ── Grievance ── */}
            <Section id="grievance" title="Grievance Redressal Mechanism">
              <P>
                Any discrepancies or grievances with regard to content and or comment or breach of
                this Agreement shall be taken up with the designated Grievance Officer as mentioned
                below via in writing or through email signed with the electronic signature to
                Chaithali Pisupati (&ldquo;Grievance Officer&rdquo;).
              </P>
              <InfoCard>
                <p style={{ fontSize: "15px", fontWeight: 500, color: "#1C1917" }}>
                  Chaithali Pisupati
                </p>
                <p style={{ fontSize: "14px", color: "rgba(28,25,23,0.6)", marginTop: "4px" }}>
                  Grievance Officer
                </p>
                <p style={{ fontSize: "14px", color: "rgba(28,25,23,0.6)", marginTop: "8px", lineHeight: 1.6 }}>
                  506/507, 1st Main Road, Murugeshpalya · K R Garden<br />
                  Bengaluru, Karnataka - 560017
                </p>
              </InfoCard>
            </Section>

            {/* ── Contact ── */}
            <Section id="contact" title="Contact Information">
              <P>If you have any questions, please contact us:</P>
              <InfoCard>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</p>
                    <a href="mailto:contact@meetaugust.ai" style={{ fontSize: "15px", color: "#206E55", fontWeight: 500 }}>
                      contact@meetaugust.ai
                    </a>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Phone</p>
                    <a href="tel:+917483127040" style={{ fontSize: "15px", color: "#206E55", fontWeight: 500 }}>
                      +91 74831 27040
                    </a>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Address</p>
                    <p style={{ fontSize: "15px", color: "rgba(28,25,23,0.7)", lineHeight: 1.6 }}>
                      506/507, 1st Main Road, Murugeshpalya · K R Garden<br />
                      Bengaluru, Karnataka - 560017
                    </p>
                  </div>
                </div>
              </InfoCard>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}
