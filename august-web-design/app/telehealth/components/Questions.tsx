"use client";

/* "The questions you actually want to ask" — two opposing marquee rows of
   category question cards. Each card opens the anonymous chat. */

import { useState } from "react";
import {
  HeartIcon,
  GenderFemaleIcon,
  HeartbeatIcon,
  ArrowsClockwiseIcon,
  PillIcon,
  FirstAidKitIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

import { chatHrefWithMessage } from "../constants";

/* Custom SVG icons from healthicons.org (CC0) */
function HiOverweight() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M28.874 9C28.874 11.7614 26.6354 14 23.874 14C21.1126 14 18.874 11.7614 18.874 9C18.874 6.23858 21.1126 4 23.874 4C26.6354 4 28.874 6.23858 28.874 9ZM26.874 9C26.874 10.6569 25.5309 12 23.874 12C22.2172 12 20.874 10.6569 20.874 9C20.874 7.34315 22.2172 6 23.874 6C25.5309 6 26.874 7.34315 26.874 9Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M16.8737 32.2071C16.0537 31.595 15.4755 30.6753 15.3117 29.6158C14.642 29.5497 14.011 29.4761 13.4246 29.3957C12.0634 29.2088 10.8605 28.9742 9.95648 28.6808C9.51825 28.5386 9.02967 28.3451 8.61066 28.064C8.28132 27.8431 7.42871 27.1864 7.42871 26C7.42871 24.8136 8.28132 24.1569 8.61066 23.936C9.02967 23.6549 9.51825 23.4614 9.95648 23.3192C10.8098 23.0423 11.9296 22.8177 13.1974 22.6362L13.347 24.6355C12.6527 24.7375 12.0354 24.8496 11.5077 24.9699C11.3807 24.9988 11.2589 25.0283 11.1425 25.0581C10.0488 25.3388 9.42871 25.6595 9.42871 26C9.42871 26.3406 10.0488 26.6612 11.1425 26.9419C11.2589 26.9718 11.3807 27.0012 11.5077 27.0301C12.4726 27.2501 13.7372 27.4425 15.2239 27.5967L15.0016 19.594C14.9341 17.1663 17.028 15.2392 19.4418 15.5074L23.4324 15.9508C23.7259 15.9834 24.0222 15.9834 24.3158 15.9508L28.1762 15.5218C30.6345 15.2487 32.749 17.2497 32.6118 19.7193L32.1708 27.6562C33.921 27.4933 35.3992 27.2794 36.4926 27.0301C36.6196 27.0012 36.7414 26.9718 36.8578 26.9419C37.9515 26.6612 38.5716 26.3406 38.5716 26C38.5716 25.6595 37.9515 25.3388 36.8578 25.0581C36.7414 25.0283 36.6196 24.9988 36.4926 24.9699C36.3362 24.9342 36.1719 24.8993 36 24.8651V26.7002L33 23.7003L36 20.7002V22.8293C36.7775 22.9709 37.4707 23.1332 38.0438 23.3192C38.482 23.4614 38.9706 23.6549 39.3896 23.936C39.719 24.1569 40.5716 24.8136 40.5716 26C40.5716 27.1864 39.719 27.8431 39.3896 28.064C38.9706 28.3451 38.482 28.5386 38.0438 28.6808C37.1398 28.9742 35.9369 29.2088 34.5757 29.3957C33.8013 29.5019 32.9489 29.5963 32.0326 29.6769C31.8863 30.5344 31.469 31.2956 30.8737 31.8723V40.9996C30.8737 42.6565 29.5306 43.9996 27.8737 43.9996H27.7869C26.4185 43.9996 25.2493 43.0794 24.8959 41.8021C24.8634 41.6847 24.8378 41.5643 24.8196 41.4414C24.8112 41.3852 24.8045 41.3285 24.7993 41.2712L24.0473 32.9999H23.7001L22.9482 41.2712C22.943 41.3285 22.9362 41.3852 22.9279 41.4414C22.9097 41.5643 22.8841 41.6847 22.8516 41.8021C22.4982 43.0794 21.3289 43.9996 19.9605 43.9996H19.8737C18.2169 43.9996 16.8737 42.6565 16.8737 40.9996V32.2071ZM18.8737 32.2071C18.8737 31.576 18.5758 30.9819 18.0701 30.6043C17.7886 30.3942 17.5656 30.1143 17.4262 29.7901C19.4223 29.9253 21.6539 30 24.0001 30C26.0892 30 28.0875 29.9408 29.9095 29.8323C29.8054 30.0596 29.6599 30.2636 29.482 30.436C29.0932 30.8127 28.8737 31.331 28.8737 31.8723V40.9996C28.8737 41.5519 28.426 41.9996 27.8737 41.9996H27.7869C27.2697 41.9996 26.8379 41.6052 26.791 41.0902L26.0391 32.8188C25.9455 31.7886 25.0817 30.9999 24.0473 30.9999H23.7001C22.6657 30.9999 21.802 31.7886 21.7083 32.8188L20.9564 41.0902C20.9096 41.6052 20.4777 41.9996 19.9605 41.9996H19.8737C19.3214 41.9996 18.8737 41.5519 18.8737 40.9996V32.2071ZM24.0001 28C21.556 28 19.2525 27.9174 17.2295 27.7715L17.0008 19.5385C16.9671 18.3246 18.014 17.3611 19.2209 17.4952L23.2115 17.9386C23.6519 17.9875 24.0963 17.9875 24.5367 17.9386L28.3971 17.5096C29.6262 17.373 30.6835 18.3735 30.6149 19.6083L30.159 27.8131C28.2883 27.933 26.2012 28 24.0001 28Z" fill="currentColor" />
    </svg>
  );
}
function HiHairLoss() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M8.46289 18.5911C8.46287 16.8205 9.13032 14.1735 11.1262 11.9805C13.0948 9.81741 16.4436 8 21.997 8C24.8969 8 26.7944 8.35253 28.218 8.91692C29.6317 9.47742 30.6517 10.2748 31.7777 11.3038C31.8673 11.3856 31.9532 11.4638 32.0356 11.5387C32.9207 12.3441 33.3979 12.7783 33.6509 13.4426C34.9272 16.7931 37.1986 21.6057 38.6703 24.6413C39.0005 25.3224 38.5008 26.112 37.7572 26.112H35.56V33C35.56 33.5523 35.1123 34 34.56 34H29.1151C29.0703 33.9949 29.0246 33.9927 28.9782 33.9937C28.8057 33.9975 28.6396 33.9996 28.4792 34H28.352C26.0659 33.9936 24.964 33.6422 23.3377 33.0588C22.8179 32.8723 22.2453 33.1425 22.0588 33.6624C21.8723 34.1822 22.1425 34.7548 22.6624 34.9413C24.209 35.4962 25.4159 35.8815 27.4073 35.9769V42H29.4073V36H34.56C36.2169 36 37.56 34.6569 37.56 33V28.112H37.7572C39.9903 28.112 41.4383 25.7661 40.4699 23.7687C38.9957 20.7281 36.7609 15.9887 35.5199 12.7307C35.0859 11.5912 34.2313 10.8223 33.4212 10.0935C33.3222 10.0044 33.2238 9.91586 33.1269 9.82736C31.9317 8.73512 30.7005 7.74968 28.9551 7.05771C27.2195 6.36963 25.05 6 21.997 6C15.9684 6 12.05 7.99392 9.64707 10.6343C7.27141 13.2447 6.46286 16.3932 6.46289 18.5911C6.46296 24.2512 9.66061 28.6551 11.4999 30.6382V42H13.4999V29.8311L13.2151 29.5396C11.5944 27.8812 8.46295 23.7903 8.46289 18.5911Z" fill="currentColor" />
    </svg>
  );
}

type CatStyle = {
  Icon?: Icon;
  Custom?: React.ComponentType;
  c: string;
  bg: string;
};

const CAT_STYLE: Record<string, CatStyle> = {
  "Weight Loss": { Custom: HiOverweight, c: "var(--aug-accent-brand)", bg: "var(--aug-accent-brand-bg)" },
  "Sexual Health": { Icon: HeartIcon, c: "var(--aug-accent-plum)", bg: "var(--aug-accent-plum-bg)" },
  "Hair Loss": { Custom: HiHairLoss, c: "var(--aug-accent-blue)", bg: "var(--aug-accent-blue-bg)" },
  "Women's Health": { Icon: GenderFemaleIcon, c: "var(--aug-accent-plum)", bg: "var(--aug-accent-plum-bg)" },
  "Chronic Care": { Icon: HeartbeatIcon, c: "var(--aug-accent-brand)", bg: "var(--aug-accent-brand-bg)" },
  "Prescription Refills": { Icon: ArrowsClockwiseIcon, c: "var(--aug-accent-blue)", bg: "var(--aug-accent-blue-bg)" },
  "Medication Management": { Icon: PillIcon, c: "var(--aug-accent-tan)", bg: "var(--aug-accent-tan-bg)" },
  "Everyday & Urgent Care": { Icon: FirstAidKitIcon, c: "var(--aug-accent-neutral)", bg: "var(--aug-accent-neutral-bg)" },
};

const Q_ROW_1 = [
  { cat: "Weight Loss", q: "Can you prescribe a GLP-1 for me? Which one is right?" },
  { cat: "Chronic Care", q: "My blood pressure is still high on my current meds. Should we change them?" },
  { cat: "Sexual Health", q: "I had unprotected sex and I'm worried. Can I get tested and treated?" },
  { cat: "Prescription Refills", q: "I'm out of refills and can't see my doctor for weeks. Can you renew it?" },
  { cat: "Hair Loss", q: "My hair is falling out fast. Is this normal balding or something medical?" },
  { cat: "Everyday & Urgent Care", q: "My child has a 102 fever and won't eat. Should we be seen?" },
  { cat: "Women's Health", q: "I think I have UTI symptoms, can you prescribe antibiotics today?" },
  { cat: "Medication Management", q: "I'm on several meds and feeling off. Could they be interacting?" },
  { cat: "Weight Loss", q: "I'm on a weight-loss med and the nausea is rough. Can we adjust it?" },
  { cat: "Hair Loss", q: "Can you prescribe finasteride or minoxidil for my hair loss?" },
  { cat: "Chronic Care", q: "My doctor said I'm pre-diabetic. What do I do now?" },
  { cat: "Sexual Health", q: "I need treatment for ED. Can you prescribe something today?" },
];

const Q_ROW_2 = [
  { cat: "Medication Management", q: "This new prescription is giving me side effects. Can we change it?" },
  { cat: "Women's Health", q: "I am not responding well to my birth control. Can you switch me to another?" },
  { cat: "Everyday & Urgent Care", q: "I think I have a sinus infection. Can you prescribe antibiotics?" },
  { cat: "Weight Loss", q: "I diet and exercise but nothing moves. Could it be my thyroid or hormones?" },
  { cat: "Prescription Refills", q: "I just moved. Can you transfer and refill my regular prescriptions?" },
  { cat: "Sexual Health", q: "I have burning and unusual discharge. What is it, and how do I treat it?" },
  { cat: "Chronic Care", q: "Can you manage my thyroid meds and order the labs I need?" },
  { cat: "Hair Loss", q: "I started a hair-loss treatment and now I'm shedding more. Should I stop?" },
  { cat: "Women's Health", q: "Could this be perimenopause, and what can I actually do about it?" },
  { cat: "Prescription Refills", q: "I lost my medication while traveling. Can you send a replacement?" },
  { cat: "Medication Management", q: "Can you review everything I take and tell me what's safe together?" },
  { cat: "Everyday & Urgent Care", q: "My eye is red and goopy. Is it pink eye, and can you treat it?" },
];

function QCard({ cat, q }: { cat: string; q: string }) {
  const [hover, setHover] = useState(false);
  const s = CAT_STYLE[cat];
  return (
    <a
      href={chatHrefWithMessage(q)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: "0 0 auto",
        width: 320,
        background: "var(--surface-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "22px 24px",
        boxShadow: hover ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        minHeight: 168,
        transition: "box-shadow var(--dur-med), transform var(--dur-med) var(--ease-out)",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        whiteSpace: "normal",
        cursor: "pointer",
        textDecoration: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span
          style={{
            width: 30,
            height: 30,
            flex: "none",
            borderRadius: "var(--radius-sm)",
            background: s.bg,
            color: s.c,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
          }}
          aria-hidden
        >
          {s.Custom ? <s.Custom /> : s.Icon ? <s.Icon /> : null}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.03em", color: s.c }}>{cat}</span>
      </div>
      <p
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: 500,
          lineHeight: 1.5,
          letterSpacing: "-0.01em",
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        {q}
      </p>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginTop: 16,
          fontSize: 14,
          fontWeight: 500,
          color: hover ? "var(--brand-primary)" : "var(--text-primary)",
          opacity: hover ? 1 : 0.55,
          transform: hover ? "translateX(4px)" : "translateX(0)",
          transition: "all var(--dur-med) var(--ease-out)",
        }}
      >
        Ask August <ArrowRightIcon aria-hidden />
      </span>
    </a>
  );
}

function Row({ items, reverse }: { items: { cat: string; q: string }[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="aug-qrow"
      style={{
        display: "flex",
        gap: 18,
        width: "max-content",
        animation: `${reverse ? "augQScrollRev" : "augQScroll"} 46s linear infinite`,
      }}
    >
      {doubled.map((it, i) => (
        <QCard key={i} {...it} />
      ))}
    </div>
  );
}

export default function Questions() {
  return (
    <section style={{ background: "var(--aug-white)", padding: "var(--section-pad) 0", overflow: "hidden" }}>
      <div
        data-anim="fade-up"
        style={{
          maxWidth: "var(--maxw)",
          margin: "0 auto",
          padding: "0 var(--gutter)",
          textAlign: "center",
          marginBottom: "clamp(36px,5vw,48px)",
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
          Ask anything
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
          The questions you actually want to ask
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 16,
            lineHeight: 1.6,
            margin: 0,
            marginInline: "auto",
            maxWidth: "52ch",
          }}
        >
          No judgment. No wait times. Just honest, evidence-based answers.
        </p>
      </div>
      <div
        className="aug-qmarquee"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          position: "relative",
          maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        }}
      >
        <Row items={Q_ROW_1} />
        <Row items={Q_ROW_2} reverse />
      </div>
    </section>
  );
}
