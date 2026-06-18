"use client";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CaretDown } from "@phosphor-icons/react";
import ScrollRevealText from "./ScrollRevealText";
import { track } from "@/app/utils/analytics";

gsap.registerPlugin(ScrollTrigger);

const FIRST_FAQ_BY_COUNTRY: Record<"IN" | "US" | "ROW", { q: string; a: string }> = {
  IN: {
    q: "Is August free to use?",
    a: "August is a free-to-try AI Health Companion for users in India. After the free message limit, users can upgrade to paid subscriptions for un-interrupted chat with August. We believe everyone deserves access to trustworthy health\u00a0information.",
  },
  US: {
    q: "Is August AI free to use?",
    a: "Yes, August AI is completely free to use for people in USA. No subscriptions, no hidden fees, no insurance required. We believe everyone deserves access to trustworthy health\u00a0information.",
  },
  ROW: {
    q: "Is August free to use?",
    a: "Yes, August is completely free to use. No subscriptions, no hidden fees, no insurance required. We believe everyone deserves access to trustworthy health\u00a0information.",
  },
};

const REST_FAQS = [
  {
    q: "Is my health data safe?",
    a: "Absolutely. Your data is encrypted end-to-end, both at rest and in transit. We are HIPAA compliant and GDPR ready. We will never sell, share, or monetize your personal health information.",
  },
  {
    q: "Can August replace my doctor?",
    a: "No, and it's not designed to. August is a health companion that helps you understand symptoms, medications, and health topics. It's built to complement your healthcare, not replace professional medical\u00a0advice.",
  },
  {
    q: "How accurate is August?",
    a: "August scored a perfect 100% on the USMLE, the exam doctors spend 7+ years preparing for. Every answer is sourced from peer-reviewed medical literature.",
  },
  {
    q: "What kind of questions can I ask?",
    a: "Anything health-related. From symptoms and medications to lab results, family health concerns, mental wellness, nutrition, and preventive care. If it's about your health, August can\u00a0help.",
  },
  {
    q: "Is August available on my device?",
    a: "August is available on iOS and Android. Download it from the App Store or Google Play. It takes less than a minute to get\u00a0started.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const answer = answerRef.current;
    const inner = innerRef.current;
    if (!answer || !inner) return;

    if (open) {
      const height = inner.offsetHeight;
      gsap.to(answer, {
        height,
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      });
    } else {
      gsap.to(answer, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  }, [open]);

  return (
    <div
      className="faq-item"
      style={{
        borderBottom: "1px solid rgba(28,25,23,0.06)",
        opacity: 0,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-6 text-left transition-colors duration-200 hover:opacity-70"
      >
        <span
          className="text-text-primary pr-4"
          style={{
            fontSize: "clamp(15px, 1.5vw, 17px)",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {q}
        </span>
        <span
          className="shrink-0 flex items-center justify-center rounded-full transition-transform duration-300"
          style={{
            width: "32px",
            height: "32px",
            background: "rgba(32,110,85,0.06)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <CaretDown size={16} weight="bold" color="#206E55" />
        </span>
      </button>
      <div
        ref={answerRef}
        style={{ height: 0, opacity: 0, overflow: "hidden" }}
      >
        <div ref={innerRef} className="pb-6">
          <p
            className="text-text-secondary"
            style={{
              fontSize: "clamp(14px, 1.4vw, 16px)",
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: "640px",
            }}
          >
            {a}
          </p>
          <div className="mt-4 flex justify-end">
            <a
              href="https://api.whatsapp.com/send/?phone=918738030604&text=Hello%20August&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("cta_click", { button_name: "faq", button_copy: "Talk to August" })}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#206E55",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Talk to August →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FaqProps {
  country?: string;
}

export default function Faq({ country }: FaqProps = {}) {
  const listRef = useRef<HTMLDivElement>(null);
  const region: "IN" | "US" | "ROW" =
    country === "IN" ? "IN" : country === "US" ? "US" : "ROW";
  const faqs = [FIRST_FAQ_BY_COUNTRY[region], ...REST_FAQS];

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const items = list.querySelectorAll<HTMLDivElement>(".faq-item");
    items.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: list,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, []);

  return (
    <section className="bg-cream py-12 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[720px] px-6 md:px-10">
        <div className="text-center">
          <ScrollRevealText
            as="h2"
            id="faq"
            className="mx-auto max-w-lg text-text-primary"
            style={{
              fontSize: "clamp(28px, 4vw, 38px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
            }}
          >
            Questions you might&nbsp;have
          </ScrollRevealText>
        </div>

        <div
          ref={listRef}
          className="mt-8 md:mt-14"
          style={{ borderTop: "1px solid rgba(28,25,23,0.06)" }}
        >
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
