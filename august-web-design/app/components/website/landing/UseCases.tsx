"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ScrollRevealText from "./ScrollRevealText";
import { Heartbeat, Pill, Flower, UsersThree, ShieldCheck, ArrowRight } from "@phosphor-icons/react";
import { track } from "@/app/utils/analytics";

const CATEGORIES = {
  symptoms: {
    label: "Symptoms",
    color: "#206E55",
    bg: "rgba(232,245,233,0.6)",
    icon: <Heartbeat size={16} weight="duotone" color="#206E55" />,
  },
  medications: {
    label: "Medications",
    color: "#6B5B3E",
    bg: "rgba(255,244,235,0.6)",
    icon: <Pill size={16} weight="duotone" color="#6B5B3E" />,
  },
  wellness: {
    label: "Wellness",
    color: "#5B4B8A",
    bg: "rgba(240,238,248,0.5)",
    icon: <Flower size={16} weight="duotone" color="#5B4B8A" />,
  },
  family: {
    label: "Family",
    color: "#8A5B5B",
    bg: "rgba(248,238,238,0.5)",
    icon: <UsersThree size={16} weight="duotone" color="#8A5B5B" />,
  },
  prevention: {
    label: "Prevention",
    color: "#3E6B5B",
    bg: "rgba(232,245,240,0.5)",
    icon: <ShieldCheck size={16} weight="duotone" color="#3E6B5B" />,
  },
} as const;

type CategoryKey = keyof typeof CATEGORIES;

const ROW_1: { category: CategoryKey; question: string }[] = [
  { category: "symptoms", question: "Why do I always feel tired even after sleeping 8 hours?" },
  { category: "medications", question: "Can I take ibuprofen with my current medications?" },
  { category: "prevention", question: "What are the early signs of diabetes?" },
  { category: "wellness", question: "Is it normal to feel anxious before a doctor visit?" },
  { category: "family", question: "My child has a fever of 102. Should I go to the\u00a0ER?" },
  { category: "symptoms", question: "Why does my knee hurt when it rains?" },
];

const ROW_2: { category: CategoryKey; question: string }[] = [
  { category: "symptoms", question: "Is this mole something I should worry about?" },
  { category: "family", question: "My mom was just diagnosed with cancer. What do I need to\u00a0know?" },
  { category: "medications", question: "What does my blood work actually mean?" },
  { category: "wellness", question: "What foods should I avoid with high cholesterol?" },
  { category: "prevention", question: "What questions should I ask my surgeon before the procedure?" },
  { category: "symptoms", question: "How do I know if my headaches are migraines?" },
];

function QuestionCard({ category, question }: { category: CategoryKey; question: string }) {
  const cat = CATEGORIES[category];
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=918738030604&text=${encodeURIComponent(question)}&type=phone_number&app_absent=0`;
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("card_click", { button_name: "use_case_card", button_copy: question })}
      className="group shrink-0 flex flex-col rounded-[16px] p-5 pb-4 transition-all duration-300 hover:-translate-y-1"
      style={{
        width: "300px",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)",
        textDecoration: "none",
      }}
    >
      {/* Category icon + label */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="flex items-center justify-center rounded-full"
          style={{
            width: "28px",
            height: "28px",
            background: cat.bg,
          }}
        >
          {cat.icon}
        </span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.03em",
            color: cat.color,
          }}
        >
          {cat.label}
        </span>
      </div>

      {/* Question text */}
      <p
        className="text-text-primary flex-1"
        style={{
          fontSize: "15px",
          fontWeight: 500,
          lineHeight: 1.5,
          letterSpacing: "-0.01em",
        }}
      >
        {question}
      </p>

      {/* Ask August CTA — always visible on mobile, slides in on hover for desktop */}
      <div
        className="mt-4 opacity-100 translate-y-0 md:opacity-0 md:translate-y-1 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-y-0"
      >
        <span
          className="inline-flex items-center gap-2"
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#206E55",
          }}
        >
          Ask August
          <ArrowRight size={14} weight="bold" color="#206E55" className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  );
}

function MarqueeRow({
  items,
  direction = "left",
  speed = 35,
}: {
  items: { category: CategoryKey; question: string }[];
  direction?: "left" | "right";
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const totalWidth = track.scrollWidth / 3;
    const startX = direction === "left" ? 0 : -totalWidth;
    const endX = direction === "left" ? -totalWidth : 0;

    tweenRef.current = gsap.fromTo(
      track,
      { x: startX },
      {
        x: endX,
        duration: speed,
        ease: "none",
        repeat: -1,
      }
    );

    return () => {
      tweenRef.current?.kill();
    };
  }, [direction, speed]);

  // Pause on hover
  const handleMouseEnter = () => tweenRef.current?.pause();
  const handleMouseLeave = () => tweenRef.current?.resume();

  const doubled = [...items, ...items, ...items];

  return (
    <div
      className="overflow-hidden"
      style={{
        padding: "12px 0",
        maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={trackRef} className="flex gap-4 w-max" style={{ padding: "4px 0" }}>
        {doubled.map((q, i) => (
          <QuestionCard key={i} category={q.category} question={q.question} />
        ))}
      </div>
    </div>
  );
}

export default function UseCases() {
  return (
    <section className="bg-cream py-12 md:py-20 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-20">
        <div className="text-center mb-8 md:mb-0">
          <ScrollRevealText
            as="h2"
            id="usecases"
            className="mx-auto max-w-xl text-text-primary"
            style={{
              fontSize: "clamp(28px, 4vw, 38px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
            }}
            highlight={{ words: ["questions"], color: "#206E55", italic: false }}
          >
            The questions you actually want to&nbsp;ask
          </ScrollRevealText>
          <p
            className="mx-auto mt-2 max-w-md text-text-secondary"
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              fontWeight: 300,
              lineHeight: 1.6,
            }}
          >
            No judgment. No wait times. Just honest, evidence-based answers.
          </p>
        </div>
      </div>

      {/* Full-bleed dual marquee */}
      <div className="mt-14 flex flex-col gap-0">
        <MarqueeRow items={ROW_1} direction="left" speed={40} />
        <MarqueeRow items={ROW_2} direction="right" speed={45} />
      </div>
    </section>
  );
}
