"use client";

/* Treatment programs grid (hims/hers-style cards). Each card opens chat. */

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";

import { CHAT_HREF, asset } from "../constants";
import SectionHead from "./SectionHead";

const ITEMS = [
  { title: "Weight Loss", desc: "GLP-1 and metabolic programs, with a clinician and August by your side the whole way.", photo: "treat-weight-loss.webp" },
  { title: "Sexual Health", desc: "Discreet, judgment-free care for ED, libido, lasting longer and STI prevention.", photo: "treat-sexual-health.webp" },
  { title: "Hair Loss", desc: "Clinically-proven treatments to slow shedding and regrow hair, as pills or topical.", photo: "treat-hair-loss.webp" },
  { title: "Women's Health", desc: "Birth control, UTIs, menopause and cycle support. Care that meets you where you are.", photo: "treat-womens-health.webp" },
  { title: "Chronic Care", desc: "Ongoing support for blood pressure, cholesterol, thyroid and more. Never starting over.", photo: "treat-chronic-care.webp" },
  { title: "Prescription Refills", desc: "Refill maintenance medications online and have them sent to your pharmacy or door.", photo: "treat-rx-refills.webp" },
  { title: "Medication Management", desc: "One calm place to track, understand and safely adjust everything you take.", photo: "treat-med-mgmt.webp" },
  { title: "Everyday & Urgent Care", desc: "From the sniffles to a sinus infection, with symptom checks and same-day treatment.", photo: "treat-urgent-care.webp", pos: "65% center" },
];

function TreatmentCard({ title, desc, photo, pos }: { title: string; desc: string; photo: string; pos?: string }) {
  const [hover, setHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const show = hover || isMobile;

  return (
    <a
      href={CHAT_HREF}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block",
        textDecoration: "none",
        position: "relative",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        aspectRatio: "3 / 4",
        boxShadow: hover ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        transition: "transform var(--dur-med) var(--ease-out), box-shadow var(--dur-med)",
      }}
    >
      <Image
        src={asset(photo)}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
        style={{
          objectFit: "cover",
          objectPosition: pos || "center center",
          transform: hover ? "scale(1.04)" : "scale(1)",
          transition: "transform 0.5s var(--ease-out)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: show
            ? "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.25) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)",
          transition: "background 0.35s var(--ease-out)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "24px 22px",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div className="th-card-title" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 4 }}>{title}</div>
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.75)",
            maxHeight: show ? 60 : 0,
            opacity: show ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.35s var(--ease-out), opacity 0.35s var(--ease-out)",
          }}
        >
          {desc}
        </div>
        <div
          style={{
            maxHeight: show ? 30 : 0,
            opacity: show ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.35s var(--ease-out), opacity 0.35s var(--ease-out)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Get started <ArrowRightIcon style={{ fontSize: "0.85rem" }} aria-hidden />
          </span>
        </div>
      </div>
    </a>
  );
}

export default function Treatments() {
  return (
    <section style={{ background: "var(--surface-page)", padding: "var(--section-pad) 0" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div data-anim="fade-up">
          <SectionHead
            center
            eyebrow="What we help with"
            title="Care for the things that matter most"
            sub="Pick what you came for and see a doctor in minutes."
          />
        </div>
        <div
          className="aug-treat-grid"
          data-stagger
          style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "clamp(12px,2vw,18px)" }}
        >
          {ITEMS.map((it) => (
            <TreatmentCard key={it.title} {...it} />
          ))}
        </div>
      </div>
    </section>
  );
}
