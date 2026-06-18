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
        <span style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(168, 213, 186, 0.7)" }}>Legal</span>
        <h1 className="mx-auto max-w-3xl" style={{ fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#FAF9F5", marginTop: "12px" }}>
          Terms &amp; Conditions
        </h1>
        <p className="mx-auto mt-2 max-w-2xl" style={{ fontSize: "clamp(15px, 1.8vw, 18px)", fontWeight: 300, lineHeight: 1.7, color: "rgba(250, 249, 245, 0.6)" }}>
          The terms governing your use of August Health&nbsp;services.
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   TOC + Layout components (same pattern as privacy)
─────────────────────────────────────────────────────────────── */
const TOC = [
  { id: "disclaimer", label: "Disclaimer" },
  { id: "introduction", label: "1. Introduction" },
  { id: "general-statements", label: "2. General Statements" },
  { id: "acceptable-use", label: "3. Acceptable Use Policy" },
  { id: "registration", label: "4. Registration" },
  { id: "product-details", label: "5. Product Details" },
  { id: "fees-payment", label: "6. Fees & Payment" },
  { id: "medical-emergencies", label: "7. Medical Emergencies" },
  { id: "telehealth-risks", label: "8. Telehealth Risks" },
  { id: "endorsements", label: "9. No Endorsements" },
  { id: "not-insurance", label: "10. Not an Insurance Product" },
  { id: "availability", label: "11. Availability" },
  { id: "minors", label: "12. Testing a Minor" },
  { id: "communications", label: "13. Electronic Communications" },
  { id: "consent-calls", label: "14. Consent to Calls" },
  { id: "third-party", label: "15. Third Party Services" },
  { id: "third-party-llms", label: "16. Third Party LLMs & APIs" },
  { id: "additional-terms", label: "17. Additional Terms" },
  { id: "proprietary-rights", label: "18. Proprietary Rights" },
  { id: "accuracy", label: "19. Accuracy of Information" },
  { id: "updates", label: "20. Updates" },
  { id: "advertisements", label: "21. Advertisements" },
  { id: "user-information", label: "22. User Information" },
  { id: "copyright", label: "23. Copyright Infringement" },
  { id: "intellectual-property", label: "24. Intellectual Property" },
  { id: "warranties", label: "25. Disclaimer of Warranties" },
  { id: "liability", label: "26. Limitation of Liability" },
  { id: "no-third-party-rights", label: "27. No Third-Party Rights" },
  { id: "assignment", label: "28. Assignment" },
  { id: "arbitration", label: "29. Arbitration" },
  { id: "force-majeure", label: "30. Force Majeure" },
  { id: "indemnification", label: "31. Indemnification" },
  { id: "app-support", label: "32. Application Support" },
  { id: "modified-devices", label: "33. Modified Devices" },
  { id: "apple-ios", label: "34. Apple iOS App" },
  { id: "google-app", label: "35. Google App" },
  { id: "consequences", label: "36. Consequences of Violating Terms" },
  { id: "miscellaneous", label: "37. Miscellaneous" },
  { id: "grievance", label: "38. Grievance Redressal" },
  { id: "contact", label: "39. Contact Us" },
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

function OL({ children }: { children: React.ReactNode }) {
  return <ol style={{ marginTop: "12px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>{children}</ol>;
}

function LI({ children }: { children: React.ReactNode }) {
  return <li style={{ fontSize: "15px", fontWeight: 400, lineHeight: 1.7, color: "rgba(28, 25, 23, 0.7)", listStyleType: "disc" }}>{children}</li>;
}

function OLI({ children }: { children: React.ReactNode }) {
  return <li style={{ fontSize: "15px", fontWeight: 400, lineHeight: 1.7, color: "rgba(28, 25, 23, 0.7)", listStyleType: "decimal" }}>{children}</li>;
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
   Main content
─────────────────────────────────────────────────────────────── */
export default function TermsContent() {
  const [activeId, setActiveId] = useState("disclaimer");

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

            <Section id="disclaimer" title="Disclaimer">
              <P style={{ fontSize: "13px", color: "rgba(28, 25, 23, 0.5)", marginTop: 0 }}>
                Last updated: April 11, 2026
              </P>
              <P>
                <Strong>Disclaimer:</Strong> All information/responses contained and provided on this
                platform, our website (https://www.meetaugust.ai) and any other chatbot developed by
                us, are for informational purposes only and subject to the terms and conditions
                available at https://www.meetaugust.ai/terms and privacy policy available at
                https://www.meetaugust.ai/privacy. August.ai is neither a substitute, nor suitable for
                professional medical advice, diagnosis or treatment and is not intended to function as
                a therapeutic or diagnostic tool. We do not provide any representation, guarantee or
                warranty of any kind or form with respect to the effectiveness or accuracy of the
                results that may be obtained or expected to be obtained from the information/responses
                provided by August.ai through our platform, website or any other chatbot developed by
                us.
              </P>
              <P>
                This document is an electronic record in terms of the Indian Contract Act, 1872, the
                Information Technology Act, 2000, the rules made there under, and the amended
                provisions pertaining to electronic records in various other statutes, as amended by
                the Information Technology Act, 2000. This electronic record is generated by a
                computer system and does not require any physical or digital signatures.
              </P>
            </Section>

            <Section id="introduction" title="1. Introduction">
              <P>
                These Terms of Use (<Strong>&ldquo;Terms&rdquo;</Strong>) govern the use of online
                interfaces and properties owned and operated by Goodness Factory Living Essentials
                Private Limited, a private limited company registered under the Indian Companies Act,
                2013, and having its registered office at B-70 Mandir Marg Mahanagar, Lucknow -
                226006, Uttar Pradesh, India (<Strong>&ldquo;Company&rdquo;</Strong>,{" "}
                <Strong>&ldquo;Beyond&rdquo;</Strong>, <Strong>&ldquo;August&rdquo;</Strong>,{" "}
                <Strong>&ldquo;we,&rdquo;</Strong> <Strong>&ldquo;us,&rdquo;</Strong>{" "}
                <Strong>&ldquo;our&rdquo;</Strong>), including the website www.getbeyondhealth.com and
                all of its subdomains and aliases (the <Strong>&ldquo;Site&rdquo;</Strong>), the
                Beyond mobile application (the <Strong>&ldquo;App&rdquo;</Strong>), the artificial
                intelligence-based health information and analytical platform and services currently
                named as August.ai (the <Strong>&ldquo;Platform&rdquo;</Strong>) and related services
                and products, information, materials, data, demos, blogs, and other materials made
                available on or through the Site, the App or the Platform (whether hosted on Whatsapp
                or any other similar platform or progressive web application) (collectively, the{" "}
                <Strong>&ldquo;Services&rdquo;</Strong>).
              </P>
              <P>
                The terms &ldquo;you&rdquo; and &ldquo;your&rdquo; refer to you, your dependents, any
                person accessing any of the Services through you, and your heirs, assigns, and
                successors. By accepting these Terms, you confirm you have read, understood and
                accepted its contents.
              </P>
              <P>
                Prior to using the Services, please also review our Privacy Policy. The Privacy Policy
                describes how we collect and handle any information gathered from users of the
                Services. By accessing or using any of the Services, including browsing the Site, the
                App or engaging with the Platform, you confirm your acceptance of these terms and
                expressly consent to the collection, use, storage, processing, and disclosure of your
                data and information in accordance with our Privacy Policy. If you do not agree to
                these Terms, you must not use the Site, the App, the Platform or any of our Services.
                By using the Services on behalf of another individual, you represent and warrant that
                you have the authority to bind that individual, and that your acceptance of these
                Terms will be deemed as acceptance by that individual and their heirs, assigns, and
                successors.
              </P>
            </Section>

            <Section id="general-statements" title="2. General Statements">
              <P>
                The Company believes that conversational artificial intelligence will fundamentally
                transform how we interact with technology. As you use our Services, we will gather
                data to improve and enhance this technology.
              </P>
              <UL>
                <LI><Strong>Use of Your Data:</Strong> We will utilize the content of your conversations and associated metadata to train our models, improve our Services, and develop new offerings. Please refer to our Privacy Policy for details on how we use this data.</LI>
                <LI><Strong>Acceptable Use Policy:</Strong> Your use of our Services must comply with our Acceptable Use policy. Access to our Services is conditional upon adherence to these Terms and the Acceptable Use policy outlined below.</LI>
                <LI><Strong>Accuracy of Information:</Strong> You acknowledge that the information provided by our Services may not be accurate or reliable. You should not rely on this information without independent verification or consultation with a relevant professional. The accuracy of information remains a key focus for the development of Beyond AI services. Refer to the &ldquo;No Warranties&rdquo; section for more information.</LI>
              </UL>
            </Section>

            <Section id="acceptable-use" title="3. Acceptable Use Policy">
              <P>
                By using our Services, you agree to comply with the following rules and any additional
                written policies provided:
              </P>
              <OL>
                <OLI><Strong>Legal Compliance:</Strong> You must use our Services in accordance with applicable laws. Any use of our Services is prohibited if such use is restricted by applicable law.</OLI>
                <OLI><Strong>Harmful or Unlawful Content:</Strong> Do not use our Services to create, disseminate, or attempt to create or disseminate harmful or unlawful content, including material that may cause serious harm, promote unethical or discriminatory behaviour, or spread misinformation, or threaten the integrity or sovereignty of our nation. This includes attempts to fraudulently represent any content available on our Services as human-generated.</OLI>
                <OLI><Strong>Abusive Content:</Strong> Do not use our Services to generate or disseminate or attempt to generate or disseminate hateful, discriminatory, sexually explicit, graphically violent, or otherwise shocking material.</OLI>
                <OLI><Strong>Uploading Content:</Strong> You will not upload, publish, display or use any defamatory, racist, obscene, profane, threatening, harassing, or otherwise offensive or illegal material or the material that threatens the unity, integrity, defense, security or sovereignty of India, friendly relations with foreign States, or public order, or causes incitement to the commission of any cognizable offence or prevents investigation of any offence or is insulting other nation.</OLI>
                <OLI><Strong>No Impersonation:</Strong> You will not impersonate any person or entity for or during the usage of any of our Services.</OLI>
                <OLI><Strong>Infringing Rights:</Strong> Do not use our Services to infringe on or violate the rights of others, including privacy rights. This includes attempts to obtain personal information such as phone numbers, addresses, or other sensitive data.</OLI>
                <OLI><Strong>Security:</Strong> Do not attempt to disable, disrupt, or subvert the security of our Services. This includes attempts to bypass or disable content moderation and safety measures.</OLI>
                <OLI><Strong>Reverse Engineering:</Strong> Do not use our Services to reverse engineer, decompile, or attempt to obtain the underlying models, algorithms, or source code. Do not engage in activities to create products competitive with us.</OLI>
                <OLI><Strong>Scraping:</Strong> Do not scrape or attempt to crawl or spider any page, data, or portion of our Services, either manually or through automated means.</OLI>
                <OLI>You will not hack the Services, or otherwise attempt to gain unauthorized access to the Services or its related systems or networks. You will not post, email or otherwise transmit any material that contains software viruses or any other computer code, files or programs designed to interrupt, destroy or limit the functionality of any computer software or hardware or telecommunications equipment.</OLI>
                <OLI>You will not forge headers or otherwise manipulate any identifiers in order to disguise the origin of any information transmitted through the Services.</OLI>
                <OLI>You are responsible for ensuring that the networks you use to access our Services are secure and will not hold Company responsible for any consequences of using the Service on an unsecure network.</OLI>
                <OLI>Data Charges may be applied while using our Services. You shall borne the said charges yourself and the Company shall not be held liable for any charges in this regard.</OLI>
                <OLI>You will not publicly publish or share with a third party (or media or social media) any reply or generated output or information related to any ChatBot/VoiceBot/VideoBot powered by the Company, unless permitted in writing by the Company.</OLI>
              </OL>
              <P>
                In the event any Services are being used in violation of any of the above-mentioned
                purposes, the Company shall have the absolute right to disable your access to the
                Services, remove any harmful or unlawful content, suspend or terminate your usage
                right to the Services, as the case may be, without any prior notice or intimation in
                this regard, and you shall also be liable for any penalty or punishment as provided
                under applicable law.
              </P>
            </Section>

            <Section id="registration" title="4. Registering for Our Services">
              <P>
                As part of the registration process for using any of our Services, you will need to
                provide us with your phone number and your full name. It is your responsibility to
                ensure that the information you provide is accurate, secure, and not misleading. By
                registering, you agree to:
              </P>
              <UL>
                <LI>Use a phone number you control and not impersonate another person.</LI>
                <LI>Be responsible for the security of your account, including preventing unauthorized access.</LI>
              </UL>
              <P>
                Our Services are not intended for individuals under 18 (eighteen) years of age. If
                you are under 18 (eighteen) years of age, you shall not register or provide any
                personal information to us. If you suspect a minor is using our Services or there is
                any unauthorised use of your name or phone number for obtaining our Services, you
                should contact us immediately at{" "}
                <a href="mailto:contact@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  contact@meetaugust.ai
                </a>
                , and we will take steps to revoke any such unauthorised access and delete the
                information.
              </P>
            </Section>

            <Section id="product-details" title="5. Product Details">
              <SubSection title="August AI">
                <P>
                  August AI provides health information via WhatsApp or other similar conversational
                  platform. Interaction with August AI does not guarantee a response and should not
                  be treated as medical advice. You must consult with a licensed healthcare service
                  provider before relying or acting upon any information provided by August AI.
                </P>
              </SubSection>
              <SubSection title="Beyond Lab Tests">
                <P>
                  Lab test results are accessible via the App. Consult a healthcare provider for
                  medical diagnosis and treatment advice. The Company does not provide medical advice
                  or endorse specific healthcare providers, tests, medications, products, or
                  procedures. Providers accessed through our App are independent of the Company, and
                  the Company disclaims any liability for any information provided by them or their
                  advice or services. Your reliance on any provider or information shall be at your
                  own risk.
                </P>
                <P>
                  Beyond provides informational content only and does not constitute professional
                  medical advice, diagnosis, or treatment. Always seek advice from qualified
                  healthcare professionals regarding medical conditions. Beyond facilitates selection
                  and communication with healthcare providers but does not provide medical services.
                  The doctor-patient relationship is solely between you and the chosen healthcare
                  provider.
                </P>
              </SubSection>
            </Section>

            <Section id="fees-payment" title="6. Fees and Payment">
              <P>
                6.1 The Services are currently provided free of charge, subject to the terms below.
                August AI reserves the right to introduce paid features or subscription plans for
                specific regions, as communicated through the Application or updated Terms.
              </P>
              <P>
                6.2 India - Free Usage and Subscription: For Users located in the Republic of India,
                August AI provides free access to the Services subject to a monthly message limit as
                displayed in the Application. Upon exhausting the monthly message limit, continued
                access to messaging features requires the purchase of a monthly subscription at the
                price displayed in the Application at the time of purchase. The monthly message limit
                for free users resets at the beginning of each calendar month. Unused messages do not
                carry over. August AI may modify the message limit or subscription pricing at any
                time with reasonable prior notice through the Application.
              </P>
              <P>
                6.3 Payment: Subscription fees are charged in Indian Rupees (INR), inclusive of
                applicable Goods and Services Tax (GST). Payments are processed through authorized
                third-party payment gateways. August AI does not store your payment card details.
                Each subscription purchase grants access for the applicable monthly period from the
                date of purchase. No refunds will be issued for any subscription purchase, except
                where required by applicable law.
              </P>
              <P>
                6.4 Invoicing: For any paid subscription, the Company will provide a GST invoice
                containing its GSTIN to the subscriber upon request.
              </P>
              <P>
                6.5 Purchase Transparency: The Company is committed to a transparent purchase
                process. Before you confirm any subscription purchase, the total price (including
                GST), the applicable message limits, and the subscription period will be clearly
                displayed. We do not use &ldquo;dark patterns&rdquo; such as pre-checked boxes or
                misleading buttons to induce purchases.
              </P>
            </Section>

            <Section id="medical-emergencies" title="7. Medical Emergencies">
              <P>
                Our Services are not intended for medical emergencies or urgent situations. Do not
                disregard or delay seeking medical advice based on information from our Services. For
                emergencies, kindly contact emergency services promptly. Kindly consult a physician or
                qualified healthcare provider for questions regarding medical conditions and before
                altering, initiating or resorting to any treatment.
              </P>
            </Section>

            <Section id="telehealth-risks" title="8. Risks of Telehealth Services">
              <P>
                By using the telehealth feature of the App to connect with third-party healthcare
                providers, you acknowledge the following risks associated with telehealth services:
              </P>
              <UL>
                <LI>Information transmitted may be inadequate (such as poor image resolution) for accurate medical or healthcare decision-making.</LI>
                <LI>Delays in evaluation or treatment may occur due to electronic equipment failures.</LI>
                <LI>Incomplete access to your medical records could lead to adverse drug interactions, allergic reactions, or other errors in judgment.</LI>
                <LI>Despite security protocols designed to protect health information, there is a risk of privacy breaches due to potential system failures.</LI>
              </UL>
            </Section>

            <Section id="endorsements" title="9. No Endorsements">
              <P>
                Beyond does not endorse or recommend any specific healthcare provider, medication,
                pharmacy, or pharmacological product. Any use or reliance on third parties discovered
                through Beyond is undertaken solely at your own risk.
              </P>
            </Section>

            <Section id="not-insurance" title="10. Not an Insurance Product">
              <P>
                Beyond is not an insurance provider and does not offer insurance services or products.
                Should you require health insurance or any other form of insurance, please contact
                with relevant service providers regarding the same independently.
              </P>
            </Section>

            <Section id="availability" title="11. Availability of Services">
              <P>
                The Services may not be available in all jurisdictions. You represent and warrant
                that you are not prohibited from using Beyond&apos;s Services under the laws of the
                country or other applicable jurisdictions in which you are located. Access to and use
                of the Services is restricted to users situated in states within the territorial
                jurisdiction of the Republic of India where the Services are legally available. The
                Services are not available to users located outside the Republic of India. Accessing
                the Services from jurisdictions where such content is illegal or where we do not
                offer the Services is expressly prohibited.
              </P>
            </Section>

            <Section id="minors" title="12. Testing a Minor">
              <P>
                Beyond recognizes that in certain instances, the parent or legal guardian of a minor
                in question (&ldquo;Qualified Adult&rdquo;) may want to use the Services to obtain
                test results on behalf of and for the benefit of his/her/their child (a
                &ldquo;Minor&rdquo;) who has not reached 18 (eighteen) years of age or above for a
                user to use the Services. In such a case, the Qualified Adult shall be permitted to
                create a separate sub-account for the Minor. In each such instance, the Qualified
                Adult represents and warrants that they have the legal right and authority to act on
                behalf of the Minor in question and to provide with the personal and medical
                information required by Beyond and its partners to perform the Services for the
                Minor. Once a Minor reaches the age of 18 (eighteen) years, they shall be permitted
                to have their test results transferred to their personal account by emailing Beyond
                at:{" "}
                <a href="mailto:contact@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  contact@meetaugust.ai
                </a>
                .
              </P>
            </Section>

            <Section id="communications" title="13. Electronic Communications">
              <P>
                When you use the Services, or send emails, messages, and other communications from
                your desktop or mobile device to us, you are communicating with us electronically.
                You consent to receive communications from us electronically. You agree that: (a) all
                agreements and consents can be signed electronically and (b) all notices,
                disclosures, and other communications that we provide to you electronically satisfy
                any legal requirement that such notices and other communications be in writing.
                Beyond may contact you by telephone, mail, or email to verify your account
                information. Beyond may request further information from you and you agree to provide
                such further information to ensure that you are not fraudulently attempting to access
                any of the Services. If you do not provide this information in the manner requested
                within 14 (fourteen) days of the request, we reserve the right to suspend, discontinue,
                or deny your access to and use of the Services until you provide the information
                requested. If you use our Services to communicate with a third-party healthcare
                provider, you acknowledge and accept the risks associated with transmitting health
                information through electronic communications channels.
              </P>
            </Section>

            <Section id="consent-calls" title="14. Consent to Receive Calls">
              <P>
                By providing your phone number, you consent to be contacted by or on behalf of Beyond
                at that number, including receiving calls and/or text messages related to the
                Services (such as progress tracking, prescription fulfilment, appointment reminders).
                Please be aware that withdrawing your consent may limit your access to certain Site
                or App or Platform features and Services. With your consent, we may also send
                promotional content to the provided phone number. You affirm that you are the owner
                or authorized user of the device used to sign up for communications and that you are
                authorized to approve any associated charges. Consent cannot be given on behalf of
                another person.
              </P>
              <P>
                If we communicate with you via text messages, we and our service provider may collect
                and store data about the messages, including their content, your phone number, and
                timestamps. To opt out of promotional text messages, reply with &ldquo;STOP.&rdquo;
                This is the only acceptable method for opting out. Any other form of opting out,
                including texting other words or making verbal requests, will not be considered
                valid. A text confirmation of your opt-out request may be sent. Even if you opt out
                of promotional messages, we may still contact you regarding your transactions. By
                using the Services, you consent to receive telephone communications electronically.
              </P>
              <P>
                To retain a copy of these terms, please print or download them from your
                Internet-connected device. You may withdraw your consent electronically by emailing
                us at{" "}
                <a href="mailto:contact@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  contact@meetaugust.ai
                </a>
                . To request a paper copy or revoke your consent, kindly provide your contact
                information and delivery address to the same email address.
              </P>
            </Section>

            <Section id="third-party" title="15. Third Party Services">
              <P>
                The Company may provide you with links to, or contact information for, third party
                sites or services. The Company is not responsible for, and does not endorse, any
                third-party content, sites, or services mentioned on the Services. It is hereby
                stated that Company shall in no way be responsible for any acts or omissions of third
                parties whom you may connect with through a mechanism facilitated by Company. Any
                transaction, dealings or communication otherwise that you may have with such third
                parties are at your own risk and we make no warranties, express or implied regarding
                the quality or suitability of the services or products of such third party service
                providers/platforms. You may incur third party fees through the use of the third
                party sites or services. You acknowledge and agree that you are solely responsible
                for all such fees incurred by you for use of such third party sites or services, and
                you agree to pay all such fees and abide by all such terms of service and/or privacy
                policies, as applicable.
              </P>
            </Section>

            <Section id="third-party-llms" title="16. Third Party LLMs and/or APIs">
              <P>
                If third-party APIs and/or Large Language Models (LLMs) are configured/used for
                providing the Services, your query, input, or prompt may be sent to their respective
                owners, servers, or countries.
              </P>
            </Section>

            <Section id="additional-terms" title="17. Additional Terms for Service Usage and Integration">
              <SubSection title="Channel integrations">
                <P>
                  Any channel integrations are subject to the approval from the respective company.
                  For WhatsApp Bot (if included): Beyond and/or it&apos;s partner would facilitate
                  the approval process with Facebook/WhatsApp; however, it will be subject to the
                  approval from Meta/WhatsApp. Facebook Business Manager account verification is also
                  required (if not already verified). Notifications and template messages are
                  subject to the approval from Meta/WhatsApp.
                </P>
              </SubSection>
              <SubSection title="Source Code Ownership">
                <P>
                  Source code pertaining to all Services shall at all times be with the Company,
                  unless otherwise updated in these Terms.
                </P>
              </SubSection>
              <SubSection title="Use of Prompts for Product Improvement">
                <P>
                  All prompts/questions/responses/conversations data received by the
                  Site/App/Platform will be leveraged for training of AI/ML models/engines of Beyond.
                </P>
              </SubSection>
              <SubSection title="Ownership of the Site/App/Platform">
                <P>
                  Beyond shall have entire and exclusive right/title/interest over the
                  Site/App/Platform and will own the rights (including Intellectual Property Rights,
                  Technology, Source Code, Content/Data) of the Site/App/Platform. It is also
                  pertinent to mention herein that the above-mentioned list is not exhaustive and
                  Beyond shall have all the rights over any bot/platform made/executed in and you
                  shall have no right/title/interest over the platform or the bots and shall not
                  claim over it.
                </P>
              </SubSection>
            </Section>

            <Section id="proprietary-rights" title="18. Proprietary Rights; Additional Restrictions">
              <P>
                The Site, App, Platform and Beyond products are the exclusive property of Beyond, its
                licensors, or suppliers, as applicable. These assets are protected under copyright
                and trademark laws of India and international jurisdictions. Subject to your
                compliance with these Terms and the payment of all applicable fees, Beyond grants
                you a revocable, non-transferable (except as otherwise provided), personal,
                non-exclusive license to use the object code version of the Site/App/Platform.
              </P>
              <P>
                All rights not expressly granted herein are reserved by Beyond or its licensors,
                suppliers, publishers, rights holders, or other content providers. The Site, App,
                Platform and Beyond products, or any part thereof, may not be reproduced, duplicated,
                copied, sold, resold, visited, or otherwise exploited for commercial purposes without
                the express written consent of Beyond.
              </P>
              <P>
                You may not frame or use framing techniques to enclose any trademark, logo, or
                proprietary information (including images, text, page layout, or form) of Beyond
                without express written consent. Similarly, the use of meta tags or other &ldquo;hidden
                text&rdquo; incorporating Beyond&apos;s name or trademarks is prohibited without
                explicit written authorization.
              </P>
              <P>
                You must not misuse the Services and may use them only as permitted by law. Content
                available through the Site/App/Platform, including but not limited to files,
                documents, text, photographs, images, audio, and video, may not be copied,
                distributed, modified, reproduced, published, or used in whole or in part, except
                for purposes authorized or approved in writing by Beyond.
              </P>
              <P>
                Furthermore, you are prohibited from framing, utilizing framing techniques, or
                employing deep linking to any name, trademarks, service marks, logos, content, or
                other proprietary information (including images, text, page layout, or form) of
                Beyond without our express written consent.
              </P>
            </Section>

            <Section id="accuracy" title="19. Accuracy of Information; Functionality">
              <P>
                While Beyond strives to maintain the accuracy and integrity of the Services, it makes
                no representations or warranties regarding the correctness or accuracy of the
                Site/App/Platform, or any other content therein. The Services may contain
                typographical errors, inaccuracies, or other mistakes. In the event of any
                inaccuracies, please notify Beyond for correction. Content on the Site/App/Platform
                may be updated or changed without prior notice. Beyond disclaims all responsibility
                and liability for information or content posted by third parties unaffiliated with
                Beyond. Beyond retains sole discretion over the operation of the Services and
                reserves the right to withdraw, suspend, or discontinue any or all features of the
                Site/App/Platform at any time. Beyond is not liable for transmission errors, data
                corruption, or information compromise via telecommunications carriers. We are not
                obligated to maintain any information or communications arising from the use of the
                Services. Beyond reserves the right to retain, delete, or destroy any communications
                or information posted or uploaded to the Services in accordance with its internal
                record retention and destruction policies.
              </P>
            </Section>

            <Section id="updates" title="20. Updates">
              <P>
                Company may from time to time make available to all users, updates at no cost or
                subject to additional fees in Company&apos;s sole discretion. &ldquo;Updates&rdquo;
                means any updates, upgrades or error corrections to the Services. Notwithstanding
                anything else contained in these Terms, the Company will have no obligation to
                continue producing or releasing new versions of the Services or any updates thereto.
              </P>
            </Section>

            <Section id="advertisements" title="21. Advertisements">
              <P>
                The Services may be supported by ad revenue and we may display advertisements and
                promotions on the Site or App or Platform. These advertisements may be targeted based
                on content, your content, queries or other information, but all of your personal
                information will be protected in accordance with our Privacy Policy. The manner,
                mode, and extent of advertising by or permitted by the Company are subject to change
                without specific notice to you. In consideration for Company granting you access to
                and use of the Services; you agree that Company may display such advertising
                throughout the Services you will not block such advertising from appearing.
              </P>
            </Section>

            <Section id="user-information" title="22. User Information">
              <P>
                If you submit, upload, post or transmit any health information, medical history,
                conditions, problems, symptoms, personal information, consent forms, agreements,
                requests, comments, ideas, suggestions, information, files, videos, images or other
                materials to us or our Site/App/Platform (&ldquo;User Information&rdquo;), you agree
                not to provide any User Information that: (i) is false, inaccurate, defamatory,
                abusive, libelous, unlawful, obscene, threatening, harassing, fraudulent,
                pornographic, or harmful, or that could encourage criminal or unethical behavior,
                (ii) violates or infringes the privacy, copyright, trademark, trade dress, trade
                secrets or intellectual property rights of any person or entity, or (iii) contains or
                transmits a virus or any other harmful component.
              </P>
              <P>
                If you submit User Information about a Minor, you represent and warrant that: (i) you
                have the right to submit such information to Beyond, and (ii) you will indemnify
                Beyond against any claims arising from your violation of the rights of such Minor.
                You represent and warrant to Beyond that you have the legal right and authorization
                to provide all User Information to them for use as set forth herein and required by
                them. Beyond may: (i) de-identify your information such that it is no longer
                considered protected health information or personally identifiable information, and
                (ii) disclose, aggregate, sell, or otherwise use such de-identified information to
                third parties for analytics, research, or other purposes. Please see the Beyond
                Privacy Policy for more information.
              </P>
              <P>You agree not to:</P>
              <UL>
                <LI>access or use the Services in any unlawful way or for any unlawful purpose;</LI>
                <LI>post or transmit (a) a message under a false name, or (b) any data, materials, content, or information (including, without limitation, advice, and recommendations) which is libelous, defamatory, obscene, fraudulent, false, or contrary to the ownership or intellectual property rights of any other person, or contains or promotes any virus, worm, Trojan horse, time bomb, malware, or other computer programing or code that is designed or intended to damage, destroy, intercept, download, interfere, manipulate, or otherwise interrupt or expropriate the Site/App/Platform, personal information, software, equipment, servers, or Information or facilitate or promote hacking or similar conduct;</LI>
                <LI>impersonate or misrepresent your identity or falsely state or misrepresent your affiliation with a person or entity;</LI>
                <LI>tamper, hack, spoof, copy, modify, or otherwise corrupt the administration, security, or proper function of the Site / App / Platform;</LI>
                <LI>use robots or scripts in connection with the Site/App/Platform;</LI>
                <LI>attempt to reverse engineer, reverse assembly, reverse compile, decompile, disassemble, translate, or otherwise alter, defraud, or create false results from any executable code, information on, or received by the Site/App/Platform;</LI>
                <LI>to have any antivirus or anti spyware software running that is set to override the internet browser&apos;s cookies setting;</LI>
                <LI>incorrectly identify the sender of any message transmitted to Beyond. You may not alter the attribution or origin of electronic mail, messages, or posting;</LI>
                <LI>harvest or collect health information about any other individual who uses the Services;</LI>
                <LI>infringe or facilitate infringement on any copyright, patent, trademark, trade secret, or other proprietary, publicity, or privacy rights of any party, including such rights of third parties.</LI>
              </UL>
              <P>
                You agree to defend, indemnify, and hold harmless Beyond from and against all third
                party claims, damages, and expenses (including reasonable attorneys&apos; fees)
                against or incurred by us arising out of any User Information you upload to or
                transmit through the Services.
              </P>
            </Section>

            <Section id="copyright" title="23. Claims of Copyright Infringement">
              <P>
                We disclaim any responsibility or liability for copyrighted materials posted on the
                Site/App/Platform. If you believe that your work has been copied in a manner that
                constitutes copyright infringement, please adhere to the procedures set forth below.
                Pursuant to Indian copyright laws and regulations, we will promptly respond to
                notices of alleged infringement.
              </P>
              <P>
                If you are a copyright owner, authorized to act on behalf of one, or authorized to
                act under any exclusive right under copyright, please report alleged copyright
                infringement occurring on or through our Site/App/Platform by sending us a notice
                (&ldquo;Notice&rdquo;) that includes the following:
              </P>
              <UL>
                <LI>Identification of the copyrighted work claimed to have been infringed.</LI>
                <LI>Identification of the infringing material or link to be disabled, including the URL of the link where the material is located.</LI>
                <LI>Your mailing address, telephone number, and, if available, email address.</LI>
                <LI>
                  The following statements in the body of notice:
                  <UL>
                    <LI>&ldquo;I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law.&rdquo;</LI>
                    <LI>&ldquo;I hereby state that the information in this Notice is accurate and that I am the owner or authorized agent to act on behalf of the owner of the copyright or an exclusive right under the copyright that is allegedly infringed.&rdquo;</LI>
                  </UL>
                </LI>
                <LI>Your full legal name and your electronic or physical signature.</LI>
              </UL>
              <P>Submit this notice, with all items completed, to:</P>
              <InfoCard>
                <p style={{ fontSize: "14px", color: "rgba(28,25,23,0.7)", lineHeight: 1.6 }}>
                  Goodness Factory Living Essentials Private Limited<br />
                  B-70, Sector V, Mahanagar<br />
                  Lucknow, U.P. – 226006<br />
                  Email:{" "}
                  <a href="mailto:contact@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                    contact@meetaugust.ai
                  </a>
                </p>
              </InfoCard>
            </Section>

            <Section id="intellectual-property" title="24. Intellectual Property">
              <P>
                With the exception of your electronic medical record, Beyond and its licensors, as
                applicable, retain all right, title, and interest in and to the Services and any
                information, products, documentation, software, or other materials on the Site /
                App / Platform, and any patent, copyright, trade secret, trademark, service mark, or
                other intellectual property, or proprietary right in any of the foregoing, except
                for information on the Services licensed to Beyond (in that case, the license
                provider retains all right, title, and interest therein). The information available
                through the Site / App / Platform is the property of Beyond or its licensors, as
                applicable. You agree not to store, copy, modify, reproduce, retransmit, distribute,
                disseminate, rent, lease, loan, sell, publish, broadcast, display, or circulate such
                information to anyone. Use, reproduction, copying, or redistribution of Beyond
                trademarks, service marks, and logos are strictly prohibited without the prior
                written permission of Beyond, as applicable. The immediately foregoing sentence also
                applies to any third-party trademarks, service marks, and logos posted on the Site /
                App / Platform. Nothing contained on the Site / App / Platform should be construed
                as granting, by implication, estoppel, waiver or otherwise, any license or right to
                use any trademarks, service marks, or logos displayed on the Site / App / Platform
                without the written grant thereof by Beyond or the third-party owner of such
                trademarks, service marks, and/or logos. The Services may contain other proprietary
                notices and copyright information, the terms of which you agree to follow. Beyond
                may delete any information provided by you that it deems in its sole discretion
                fraudulent, abusive, defamatory, obscene, or in violation of copyright, trademark,
                or other intellectual property or ownership right of any other person or entity.
              </P>
            </Section>

            <Section id="warranties" title="25. Disclaimer of Warranties">
              <P>
                THE COMPANY DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR FREE
                OR ACCURATE OR RELIABLE; NOR DOES IT MAKE ANY WARRANTY AS TO THE RESULTS THAT MAY BE
                OBTAINED FROM USE OF THE SERVICES. THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND
                THE COMPANY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED
                TO, IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE,
                TITLE, COMPLETENESS, COMPREHENSIVENESS, AVAILABILITY, SECURITY, COMPATIBILITY AND
                NON-INFRINGEMENT.
              </P>
              <P>
                AT NO INSTANCE SHALL THE COMPANY BE LIABLE FOR ANY ANSWER/ CONTENT/ REPLY/
                INFORMATION PROVIDED WHEN YOU ASK A QUESTION OR FOR ANY REPERCUSSIONS OCCURRED AFTER
                FOLLOWING THAT ANSWER. THE COMPANY WOULD NOT BE HELD RESPONSIBLE IF ANSWER DOES NOT
                MATCH WITH THE QUESTION ASKED.
              </P>
            </Section>

            <Section id="liability" title="26. Limitation of Liability">
              <P>
                TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL COMPANY (NOR ITS DIRECTORS,
                EMPLOYEES, AGENTS, CONSULTANTS, SPONSORS, PARTNERS, SUPPLIERS, SERVICE PROVIDERS, OR
                LICENSORS) BE LIABLE UNDER CONTRACT, TORT, STRICT LIABILITY, NEGLIGENCE OR ANY OTHER
                LEGAL OR EQUITABLE THEORY WITH RESPECT TO THE SERVICE (I) FOR ANY LOST PROFITS, DATA
                LOSS, LOSS OF GOODWILL OR OPPORTUNITY, OR SPECIAL, INDIRECT, INCIDENTAL, PUNITIVE, OR
                CONSEQUENTIAL DAMAGES OF ANY KIND WHATSOEVER, (II) FOR YOUR RELIANCE ON THE SERVICES
                (III) FOR ANY DIRECT DAMAGES IN EXCESS (IN THE AGGREGATE) OF THE GREATER OF (A) INR
                8,000/- OR (B) THE TOTAL FEES PAID BY YOU TO AUGUST AI IN THE TWELVE (12) MONTHS
                PRECEDING THE EVENT GIVING RISE TO THE CLAIM (IV) FOR ANY MATTER BEYOND ITS OR THEIR
                REASONABLE CONTROL, EVEN IF COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF ANY OF
                THE AFOREMENTIONED DAMAGES.
              </P>
            </Section>

            <Section id="no-third-party-rights" title="27. No Third-Party Rights">
              <P>
                Unless expressly stated in these Terms to the contrary, nothing herein is intended to
                confer any rights or remedies on any persons other than you, Beyond, and
                Beyond&apos;s affiliates. Nothing in these Terms of Use is intended to relieve or
                discharge the obligation or liability of any third persons to you, Beyond, and
                Beyond&apos;s affiliates, nor shall any provision give any third parties any right of
                subrogation or action over against you, Beyond, and Beyond&apos;s affiliates.
              </P>
            </Section>

            <Section id="assignment" title="28. Assignment">
              <P>
                You may not assign, transfer, or delegate the Terms of Use or any part thereof
                without Beyond&apos;s prior written consent. Beyond may freely transfer, assign, or
                delegate all or any part of the Terms of Use, and any rights or duties hereunder or
                thereunder. The Terms of Use will be binding upon and inure to the benefit of the
                heirs, successors, and permitted assignees of the parties.
              </P>
            </Section>

            <Section id="arbitration" title="29. Arbitration and Dispute Resolution">
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

            <Section id="force-majeure" title="30. Force Majeure">
              <P>
                We will not be deemed to be in breach of these Terms or liable for any breach of
                these Terms or our Privacy Policy due to any event or occurrence beyond our
                reasonable control, including, without limitation, acts of God, terrorism, war,
                hacking, computer malfunction, cyber-attacks, criminal interference, invasion,
                failures of any public networks, electrical shortages, earthquakes or floods, civil
                disorder, strikes, fire or other disaster.
              </P>
            </Section>

            <Section id="indemnification" title="31. Indemnification">
              <P>
                You shall defend, indemnify, and hold harmless the Company, its
                affiliates/subsidiaries/joint venture partners and each of its, and its
                affiliates&apos;/subsidiaries/JV partners&apos; employees, contractors, directors,
                suppliers and representatives from all liabilities, losses, claims, and expenses,
                including reasonable attorneys&apos; fees, that arise from or relate to: (i) your
                use or misuse of, or access to, the Service, or (ii) your violation of the Terms or
                Privacy Policy any applicable law, contract, policy, regulation or other obligation,
                or (iii) the content or subject matter of any information you provide to Beyond or
                through the Services, and/or (iv) any negligent or wrongful act or omission by you
                in your use or misuse of the Services, or any information on the Site and/or App
                and/or Platform, including without limitation, infringement of third party
                intellectual property rights, privacy rights, or negligent or wrongful conduct. We
                reserve the right to assume the exclusive defense and control of any matter
                otherwise subject to indemnification by you, in which event you will assist and
                cooperate with us in connection therewith.
              </P>
            </Section>

            <Section id="app-support" title="32. Application Support; Functionality">
              <P>
                All questions and requests relating to support in connection with the Services
                should be directed to Beyond. To submit a support request, please email us at{" "}
                <a href="mailto:contact@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  contact@meetaugust.ai
                </a>
                . Beyond will use commercially reasonable efforts to respond to questions and provide
                support during Monday to Friday, 9:00 AM - 6:00 PM (IST). Please note that we may
                change or remove functionality and other features of the Services at any time,
                without notice.
              </P>
            </Section>

            <Section id="modified-devices" title="33. Modified Devices and Operating Systems">
              <P>
                Beyond will have no liability for errors, unreliable operation, or other issues
                resulting from use of the Services on or in connection with rooted or jail broken
                devices or use on any mobile device that is not in conformity with the
                manufacturer&apos;s original specifications, including use of modified versions of
                the operating system.
              </P>
            </Section>

            <Section id="apple-ios" title="34. Apple iOS App">
              <P>
                If you utilize a mobile application provided by our Services that you download,
                access, and/or use on Apple&apos;s iOS operating system (an &ldquo;iOS App&rdquo;),
                you acknowledge and agree to the following terms:
              </P>
              <UL>
                <LI>The iOS App may only be accessed and used on a device owned or controlled by you and operating on Apple&apos;s iOS system.</LI>
                <LI>These Terms are solely between you and Beyond and not with Apple.</LI>
                <LI>Apple has no obligation to provide any support or maintenance services for the iOS App. Any maintenance or support inquiries should be directed to Beyond, not Apple.</LI>
                <LI>Except as expressly stated in these Terms, any claims related to the possession or use of the iOS App are between you and Beyond, not between you and Apple.</LI>
                <LI>In the event of any third-party claim that your possession or use of the iOS App (in accordance with these Terms of Use) infringes any intellectual property rights, Apple will not be responsible or liable to you regarding that claim.</LI>
                <LI>Although these Terms are between you and Beyond (not Apple), Apple, as a third-party beneficiary under these Terms, has the right to enforce these terms against you.</LI>
              </UL>
              <P>Additionally, you represent and warrant that:</P>
              <UL>
                <LI>You are not, and will not be, located in any country subject to an Indian Government embargo or designated by the Indian Government as a &ldquo;terrorist-supporting&rdquo; country.</LI>
                <LI>You are not listed on any Indian Government list of prohibited or restricted parties.</LI>
              </UL>
              <P>
                If the iOS App fails to conform to any applicable warranty, you may notify Apple, and
                Apple will refund the purchase price of the iOS App (if any). Beyond this, and to the
                maximum extent permitted by law, Apple does not provide any warranty, condition, or
                other terms regarding the iOS App and will not be liable for any claims, losses,
                costs, or expenses arising from the use of the iOS App or reliance on its content.
              </P>
              <P>
                For further assistance, please contact Beyond at{" "}
                <a href="mailto:contact@meetaugust.ai" style={{ color: "#206E55", fontWeight: 500 }}>
                  contact@meetaugust.ai
                </a>
                .
              </P>
            </Section>

            <Section id="google-app" title="35. Google App">
              <P>
                If the Services that you use include a mobile application that you download, access,
                and/or use from the Google Play Store (&ldquo;Google-Sourced Software&rdquo;): (i)
                you acknowledge that these Terms of Use are between you and Beyond only, and not
                with Google, Inc. (&ldquo;Google&rdquo;); (ii) your use of Google-Sourced Software
                must comply with Google&apos;s then-current Google Play Store Terms of Service;
                (iii) Google is only a provider of the Google Play Store where you obtained the
                Google-Sourced Software; (iv) Beyond, and not Google, is solely responsible for its
                Google-Sourced Software; (v) Google has no obligation or liability to you with
                respect to Google-Sourced Software or the Terms; and (vi) you acknowledge and agree
                that Google is a third party beneficiary to the Terms as it relates to
                Beyond&apos;s Google-Sourced Software.
              </P>
            </Section>

            <Section id="consequences" title="36. Consequences of violating these Terms">
              <P>
                We reserve the right to modify, restrict access to or terminate the Services or any
                features of the Services for any reason, without notice, at any time. We reserve
                the right to refuse to provide the Services to you in the future. We may review and
                remove any of your content at any time for any reason, including activity which, in
                its sole judgment: violates these Terms; violates applicable laws, rules, or
                regulations; is abusive, disruptive, offensive or illegal; or violates the rights
                of, or harms or threatens the safety of users. You are responsible for any claims,
                fees, fines, penalties, and other liability incurred by us or others caused by, or
                arising out of, your breach of these Terms and your use of the Services.
              </P>
            </Section>

            <Section id="miscellaneous" title="37. Miscellaneous">
              <P>
                These Terms and the Privacy Policy are the entire agreement between you and the
                Company with respect to the Services, and supersede all prior or contemporaneous
                communications and proposals (whether oral, written or electronic) between you and
                the Company with respect to the Services. If any provision of the Terms is found to
                be unenforceable or invalid, that provision will be limited or eliminated to the
                minimum extent necessary so that the Terms will otherwise remain in full force and
                effect and enforceable. The failure of either party to exercise in any respect any
                right provided for herein shall not be deemed a waiver of any further rights
                hereunder. The Terms are personal to you, and are not assignable or transferable by
                you except with Company&apos;s prior written consent. Company may assign, transfer
                or delegate any of its rights and obligations hereunder without consent. No agency,
                partnership, joint venture, or employment relationship is created as a result of
                these Terms and neither party has any authority of any kind to bind the other in any
                respect. All notices under these Terms will be in writing and will be deemed to have
                been duly given when received, if personally delivered or sent by certified or
                registered mail, return receipt requested; when receipt is electronically confirmed,
                if transmitted by facsimile or e-mail; or two days after it is sent, if sent for
                next day delivery by recognized overnight delivery service.
              </P>
            </Section>

            <Section id="grievance" title="38. Grievance Redressal Mechanism">
              <P>
                Any discrepancies or grievances with regard to content and or comment or breach of
                this Agreement shall be taken up with the designated Grievance Officer as mentioned
                below via in writing or through email signed with the electronic signature to
                Chaithali Pisupati or Anuruddh Mishra (&ldquo;Grievance Officer&rdquo;). For
                subscription or payment-related grievances, the Grievance Officer shall acknowledge
                the complaint within 48 hours and endeavour to resolve it within 30 days of receipt.
              </P>
              <InfoCard>
                <p style={{ fontSize: "15px", fontWeight: 500, color: "#1C1917" }}>Chaithali Pisupati</p>
                <p style={{ fontSize: "14px", color: "rgba(28,25,23,0.6)", marginTop: "4px" }}>Grievance Officer</p>
                <p style={{ fontSize: "14px", color: "rgba(28,25,23,0.6)", marginTop: "8px", lineHeight: 1.6 }}>
                  506/507, 1st Main Road, KR Garden, Murugeshpallya<br />
                  Bangalore - 560017
                </p>
              </InfoCard>
            </Section>

            <Section id="contact" title="39. Contact Us">
              <P>
                If you have any questions, concerns, complaints or suggestions regarding our Terms
                or otherwise need to contact us, you may contact us at:
              </P>
              <InfoCard>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</p>
                    <a href="mailto:contact@meetaugust.ai" style={{ fontSize: "15px", color: "#206E55", fontWeight: 500 }}>contact@meetaugust.ai</a>
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(28,25,23,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Address</p>
                    <p style={{ fontSize: "15px", color: "rgba(28,25,23,0.7)", lineHeight: 1.6 }}>
                      Goodness Factory Living Essential Pvt Ltd<br />
                      B-70, Sector C, Mahanagar, Lucknow, UP - 226006
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
