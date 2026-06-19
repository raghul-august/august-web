/* "Always cared for by an expert" — AI + human doctors band with lifestyle image. */

import Image from "next/image";
import {
  LinkIcon,
  ChatCircleDotsIcon,
  HandHeartIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

import { CHAT_HREF } from "../constants";
import Button from "./Button";

const STATS: { Icon: Icon; t: string; c: string; bg: string }[] = [
  { Icon: LinkIcon, t: "Connect your EHR, share the complete picture with your doctor", c: "var(--aug-accent-brand)", bg: "var(--aug-accent-brand-bg)" },
  { Icon: ChatCircleDotsIcon, t: "Follow-up with your doctor anytime", c: "var(--aug-accent-blue)", bg: "var(--aug-accent-blue-bg)" },
  { Icon: HandHeartIcon, t: "Get proactive post-consult support", c: "var(--aug-accent-plum)", bg: "var(--aug-accent-plum-bg)" },
];

export default function HumanDoctors() {
  return (
    <section style={{ background: "var(--surface-elevated)", padding: "var(--section-pad) 0" }}>
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
          <div data-anim="fade-left">
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
              Always cared for by an expert
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
              Care from top doctors you can trust
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
              Every treatment and prescription is given by a board-certified, MD-level physician
              licensed in your state.
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
            data-anim="fade-right"
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
              src="/images/telehealth/human-doctor.png"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "center top" }}
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
                background: "rgba(20,21,21,0.32)",
                backdropFilter: "blur(20px) saturate(160%)",
                WebkitBackdropFilter: "blur(20px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
                fontSize: 13,
                fontWeight: 400,
                color: "#fff",
              }}
            >
              <ShieldCheckIcon style={{ color: "#fff" }} aria-hidden /> Licensed in all 50
              states + DC
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
