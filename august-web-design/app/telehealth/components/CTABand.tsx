/* Closing CTA band over a warm lifestyle image. */

import Image from "next/image";
import { ShieldCheckIcon, ArrowRightIcon } from "@phosphor-icons/react/ssr";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

import { CHAT_HREF, sharedAsset } from "../constants";
import Button from "./Button";

export default function CTABand() {
  return (
    <section
      aria-label="Closing CTA"
      style={{ background: "var(--surface-page)", padding: "clamp(20px,4vw,40px) 0 var(--section-pad)" }}
    >
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div
          data-anim="fade-up"
          style={{
            borderRadius: "var(--radius-2xl)",
            display: "flex",
            alignItems: "center",
            minHeight: 380,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src="/images/telehealth/cta-bg.png"
            alt=""
            fill
            sizes="(max-width: 1200px) 100vw, 1120px"
            className="aug-cta-img"
            style={{ objectFit: "cover", objectPosition: "right center" }}
          />
          <div
            className="aug-cta-overlay"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(172,146,116,0.9) 28%, rgba(172,146,116,0.35) 52%, rgba(172,146,116,0.08) 70%, transparent 85%)",
            }}
          />
          <div
            className="aug-cta-content"
            style={{ position: "relative", zIndex: 2, maxWidth: "55%", padding: "clamp(40px,7vw,72px) clamp(28px,5vw,56px)" }}
          >
            <h2
              style={{
                color: "var(--text-inverse)",
                fontSize: "clamp(26px,4vw,34px)",
                fontWeight: 500,
                letterSpacing: "var(--tracking-tight)",
                margin: "0 0 12px",
              }}
            >
              Healthcare that's always on your side
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                maxWidth: "42ch",
                fontSize: 15,
                lineHeight: "var(--leading-normal)",
                margin: "0 0 26px",
              }}
            >
              Ask August anything, start a treatment, or see a doctor starting from {CONSULT_PRICE_LABEL},
              any time, from anywhere.
            </p>
            <Button
              as="a"
              href={CHAT_HREF}
              variant="primary"
              iconRight={<ArrowRightIcon aria-hidden />}
              style={{ background: "var(--text-inverse)", color: "var(--text-primary)", borderColor: "var(--text-inverse)" }}
            >
              Chat with August, free
            </Button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 20,
                color: "rgba(255,255,255,0.8)",
                fontSize: "var(--text-xs)",
              }}
            >
              <ShieldCheckIcon aria-hidden /> HIPAA secured. Data is never sold.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
