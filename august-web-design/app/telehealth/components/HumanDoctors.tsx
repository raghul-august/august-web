/* "Best of both worlds" — AI + human doctors band with lifestyle image. */

import Image from "next/image";
import {
  StethoscopeIcon,
  MapPinIcon,
  ChatCircleDotsIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

import { CHAT_HREF } from "../constants";
import Button from "./Button";

const STATS: { Icon: Icon; t: string; c: string; bg: string }[] = [
  { Icon: StethoscopeIcon, t: "Board-certified physicians", c: "var(--aug-accent-brand)", bg: "var(--aug-accent-brand-bg)" },
  { Icon: MapPinIcon, t: "Available in 50 states + DC", c: "var(--aug-accent-blue)", bg: "var(--aug-accent-blue-bg)" },
  { Icon: ChatCircleDotsIcon, t: "Follow-up with your doctor anytime", c: "var(--aug-accent-plum)", bg: "var(--aug-accent-plum-bg)" },
];

export default function HumanDoctors() {
  return (
    <section style={{ background: "var(--surface-page)", padding: "var(--section-pad) 0" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div
          className="aug-human"
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            alignItems: "start",
            gap: "clamp(32px,5vw,64px)",
          }}
        >
          <div data-anim="fade-up">
            <div
              className="th-eyebrow"
              style={{
                textTransform: "uppercase",
                letterSpacing: "var(--tracking-eyebrow)",
                color: "var(--text-brand)",
                fontSize: "var(--text-eyebrow)",
                fontWeight: 400,
                lineHeight: "16px",
                marginBottom: 20,
              }}
            >
              Best of both worlds
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,4.4vw,36px)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                margin: "0 0 18px",
              }}
            >
              Intelligent answers in seconds. Real doctors when you need them.
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 16,
                lineHeight: 1.6,
                margin: "0 0 32px",
                maxWidth: "52ch",
              }}
            >
              By the time you meet one of our doctors, they already know your history, your symptoms,
              and what you need. Less time explaining. More time getting better, starting from{" "}
              {CONSULT_PRICE_LABEL} a visit.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {STATS.map(({ Icon, t, c, bg }) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      flex: "none",
                      borderRadius: "var(--radius-md)",
                      background: bg,
                      color: c,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                    }}
                  >
                    <Icon aria-hidden />
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 36 }}>
              <Button as="a" href={CHAT_HREF} variant="primary" iconRight={<ArrowRightIcon aria-hidden />}>
                See a doctor starting from {CONSULT_PRICE_LABEL}
              </Button>
            </div>
          </div>

          {/* Lifestyle image */}
          <div
            className="aug-human-img"
            data-anim="fade-up"
            style={{
              position: "relative",
              borderRadius: "var(--radius-2xl)",
              overflow: "hidden",
              minHeight: 280,
              alignSelf: "stretch",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <Image
              src="https://assets.getbeyondhealth.com/telehealth-landing/doctor-2.jpeg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "center 20%" }}
            />
            <span
              style={{
                position: "absolute",
                left: 18,
                bottom: 18,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 16px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "var(--shadow-sm)",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              <ShieldCheckIcon style={{ color: "var(--brand-primary)" }} aria-hidden /> Licensed in all 50
              states + DC
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
