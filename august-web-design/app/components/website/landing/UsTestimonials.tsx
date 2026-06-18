"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import BlurSection from "./BlurSection";
import ScrollRevealText from "./ScrollRevealText";
import { track } from "@/app/utils/analytics";
import Image from "next/image";

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    location: "Austin, TX",
    quote: "I uploaded my lab results at 11pm and got a clear breakdown in seconds. My doctor confirmed everything August told me.",
    image: "/images/testimonial-2.webp",
    imagePosition: "center 20%",
  },
  {
    name: "James K.",
    location: "Brooklyn, NY",
    quote: "I was spiraling on Google about a mole. August calmed me down, told me what to watch for, and when to actually see a dermatologist.",
    image: "/images/testimonial-13.webp",
    imagePosition: "center 25%",
  },
  {
    name: "Maria L.",
    location: "Miami, FL",
    quote: "My mom doesn't speak great English. I use August to translate her symptoms into something her doctor can actually work with.",
    image: "/images/testimonial-3.webp",
    imagePosition: "center center",
  },
  {
    name: "David R.",
    location: "Seattle, WA",
    quote: "I switched medications and wasn't sure about interactions. August flagged a conflict my pharmacist missed.",
    image: "/images/testimonial-14.webp",
    imagePosition: "center 30%",
  },
  {
    name: "Emily T.",
    location: "Chicago, IL",
    quote: "I use August almost daily for my family. It helps me understand our lab results and stay on top of everyone's health.",
    image: "/images/testimonial-5.webp",
    imagePosition: "center 25%",
  },
  {
    name: "Michael P.",
    location: "Denver, CO",
    quote: "As someone without insurance, August is the closest thing I have to a doctor on call. It's genuinely life-changing.",
    image: "/images/testimonial-6.webp",
    imagePosition: "center top",
  },
  {
    name: "Aisha W.",
    location: "Atlanta, GA",
    quote: "My daughter had a rash at midnight. Instead of panicking, I asked August. It walked me through exactly what to look for.",
    image: "/images/testimonial-15.webp",
    imagePosition: "center 25%",
  },
  {
    name: "Chris N.",
    location: "Portland, OR",
    quote: "I finally understand what my prescriptions actually do. August explains everything without making me feel dumb.",
    image: "/images/testimonial-7.webp",
    imagePosition: "center center",
  },
  {
    name: "Daniela G.",
    location: "Phoenix, AZ",
    quote: "I've been managing my dad's diabetes remotely. August helps me keep track of what to ask his doctor at every visit.",
    image: "/images/testimonial-9.webp",
    imagePosition: "center 25%",
  },
  {
    name: "Kevin L.",
    location: "San Francisco, CA",
    quote: "After my diagnosis, I was overwhelmed with information. August broke it all down and helped me prepare questions for my oncologist.",
    image: "/images/testimonial-8.webp",
    imagePosition: "center center",
  },
  {
    name: "Rachel S.",
    location: "Nashville, TN",
    quote: "I used to spend hours doom-scrolling health forums. Now I just ask August and actually trust the answer.",
    image: "/images/testimonial-11.webp",
    imagePosition: "center center",
  },
  {
    name: "Tom H.",
    location: "Boston, MA",
    quote: "My wife and I both use it. She checks her thyroid levels, I track my blood pressure. One app for the whole family.",
    image: "/images/testimonial-12.webp",
    imagePosition: "center 30%",
  },
];

function TestimonialCard({ item }: { item: (typeof TESTIMONIALS)[number] }) {
  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        aspectRatio: "3 / 4",
        borderRadius: "16px",
      }}
    >
      <Image
        src={item.image}
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: item.imagePosition || "center center" }}
        draggable={false}
        width={560}
        height={840}
        sizes="(max-width: 768px) 100vw, 280px"
      />
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "100%",
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 35%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.1) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 flex flex-col gap-3">
        <p
          className="text-white"
          style={{
            fontSize: "15px",
            fontWeight: 400,
            lineHeight: 1.55,
            textShadow: "0 1px 3px rgba(0,0,0,0.3)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical" as never,
            overflow: "hidden",
          }}
        >
          &ldquo;{item.quote}&rdquo;
        </p>
        <div>
          <p className="text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
            {item.name}
          </p>
          <p style={{ fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,0.7)" }}>
            {item.location}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile: single-card carousel with auto-rotate + dots + arrows ── */
function MobileCarousel() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const goTo = (index: number) => {
    setActive(index);
    resetTimer();
  };

  const goPrev = () => {
    track("carousel_nav", { direction: "left", section: "testimonials" });
    goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };
  const goNext = () => {
    track("carousel_nav", { direction: "right", section: "testimonials" });
    goTo((active + 1) % TESTIMONIALS.length);
  };

  return (
    <div className="px-6">
      <div
        className="relative overflow-hidden"
        style={{ borderRadius: "16px" }}
      >
        {TESTIMONIALS.map((item, i) => (
          <div
            key={i}
            className="transition-opacity duration-500"
            style={{
              opacity: i === active ? 1 : 0,
              position: i === 0 ? "relative" : "absolute",
              inset: i === 0 ? undefined : 0,
              pointerEvents: i === active ? "auto" : "none",
            }}
          >
            <TestimonialCard item={item} />
          </div>
        ))}
      </div>

      {/* Arrows + dots */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={goPrev}
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-95"
          style={{ borderColor: "rgba(0,0,0,0.15)" }}
          aria-label="Previous"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className="transition-all duration-300"
              style={{
                width: i === active ? "20px" : "6px",
                height: "6px",
                borderRadius: "100px",
                background: i === active ? "#1C1917" : "rgba(28, 25, 23, 0.2)",
              }}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-95"
          style={{ borderColor: "rgba(0,0,0,0.15)" }}
          aria-label="Next"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Desktop: infinite marquee scroll ── */
function InfiniteMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Wait for images to settle layout
    const timer = setTimeout(() => {
      const totalWidth = track.scrollWidth / 3;

      tweenRef.current = gsap.fromTo(
        track,
        { x: 0 },
        {
          x: -totalWidth,
          duration: totalWidth / 30, // ~30px/sec
          ease: "none",
          repeat: -1,
        }
      );
    }, 100);

    return () => {
      clearTimeout(timer);
      tweenRef.current?.kill();
    };
  }, []);

  const handleMouseEnter = () => tweenRef.current?.pause();
  const handleMouseLeave = () => tweenRef.current?.resume();

  // Triple the items for seamless loop
  const tripled = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={trackRef} className="flex gap-5 w-max" style={{ padding: "4px 0" }}>
        {tripled.map((item, i) => (
          <div key={i} className="shrink-0" style={{ width: "280px" }}>
            <TestimonialCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UsTestimonials() {
  return (
    <BlurSection className="bg-surface py-12 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-20">
        <div className="mb-8 md:mb-10 text-center">
          <ScrollRevealText
            as="h2"
            id="stories"
            className="text-text-primary"
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
            highlight={{ words: ["people"], color: "#206E55", italic: false }}
          >
            Real stories from real&nbsp;people
          </ScrollRevealText>
          <p
            className="mx-auto mt-2 max-w-lg text-text-secondary"
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              fontWeight: 300,
            }}
          >
            7 million people trust August for health clarity.
          </p>
        </div>
      </div>

      {/* Mobile: single card + dots */}
      <div className="md:hidden">
        <MobileCarousel />
      </div>

      {/* Desktop: infinite marquee */}
      <div className="hidden md:block">
        <InfiniteMarquee />
      </div>

      <p
        className="text-center mt-6"
        style={{
          fontSize: "12px",
          fontWeight: 400,
          fontStyle: "italic",
          color: "rgba(28, 25, 23, 0.3)",
        }}
      >
        Disclaimer: Photos are for illustration only. Real user photos are not used here.
      </p>
    </BlurSection>
  );
}
