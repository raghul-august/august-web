"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon, StarIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

const CDN = "https://assets.getbeyondhealth.com/telehealth";
const GAP = 16;
const CARD_SIZES = "(max-width: 480px) 90vw, (max-width: 640px) 85vw, (max-width: 1023px) 50vw, 25vw";

type Testimonial = { img: string; quote: ReactNode; demo: string; imgStyle?: CSSProperties };

const TESTIMONIALS: Testimonial[] = [
  {
    img: "man-smiling",
    quote: `"I'm freelance, so a sick day means no pay. Got a sinus infection treated between client calls without leaving my studio. Back to work the same afternoon."`,
    demo: "Male, 25-34 years old",
  },
  {
    img: "old-couple",
    quote: `"My husband and I don't drive much anymore. Having a doctor come to us through a screen instead of the other way around — that's how it should be."`,
    demo: "Female, 65-74 years old",
  },
  {
    img: "family-eating",
    quote: <>&quot;My daughter woke up with pinkeye on a school night. {CONSULT_PRICE_LABEL} and twenty minutes later we had a prescription — didn&apos;t even have to leave the kitchen.&quot;</>,
    demo: "Male, 30-39 years old",
  },
  {
    img: "climbing",
    quote: `"Found a tick on my leg after a hike. August walked me through what to watch for and connected me with a doctor for a prescription. Calm, clear, fast."`,
    demo: "Male, 25-34 years old",
    // Subjects sit low with a lot of sky; zoom in around them so the framing
    // matches the other cards.
    imgStyle: { transform: "scale(1.4)", transformOrigin: "center 45%" },
  },
  {
    img: "man-working",
    quote: `"Started feeling awful at 11pm on a deadline night. Opened August on my phone, talked to a doctor, had a care plan before midnight. Didn't miss a beat."`,
    demo: "Male, 25-34 years old",
  },
  {
    img: "woman-reading",
    quote: `"It didn't feel like a chatbot rushing me. It actually asked the right questions, explained things gently, and never made me feel silly for asking."`,
    demo: "Female, 25-34 years old",
  },
  {
    img: "woman-shopping",
    quote: `"Woke up with a UTI and had errands to run. Talked to a doctor from the grocery store parking lot. Prescription was ready by the time I got home."`,
    demo: "Female, 20-29 years old",
  },
  {
    img: "child-walking",
    quote: `"My little one got a rash halfway through our Disney day. Instead of leaving the park, I talked to a doctor right there. She was back on rides in no time."`,
    demo: "Female, 30-39 years old",
    imgStyle: { objectPosition: "35% center" },
  },
];

const STARS = (
  <div className="stars" aria-label="5 stars">
    {Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} weight="fill" className="ph" aria-hidden />
    ))}
  </div>
);

export default function Testimonials() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef({ step: 0, maxScroll: 0, maxIdx: 0 });
  const [idx, setIdx] = useState(0);
  const [maxIdx, setMaxIdx] = useState(0);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    const card = track?.children[0] as HTMLElement | undefined;
    if (!track || !wrap || !card) return;
    const step = card.offsetWidth + GAP;
    const maxScroll = Math.max(0, track.scrollWidth - wrap.clientWidth);
    metricsRef.current = { step, maxScroll, maxIdx: step > 0 ? Math.ceil(maxScroll / step) : 0 };
  }, []);

  const applyTransform = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const { step, maxScroll } = metricsRef.current;
    track.style.transform = `translateX(-${Math.min(i * step, maxScroll)}px)`;
  }, []);

  useEffect(() => {
    let raf = 0;
    const sync = () => {
      measure();
      const mi = metricsRef.current.maxIdx;
      setMaxIdx(mi);
      setIdx((cur) => {
        const next = Math.min(cur, mi);
        applyTransform(next);
        return next;
      });
    };
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [measure, applyTransform]);

  useEffect(() => {
    applyTransform(idx);
  }, [idx, applyTransform]);

  const slide = (dir: number) => setIdx((i) => Math.max(0, Math.min(maxIdx, i + dir)));

  const cards = useMemo(
    () =>
      TESTIMONIALS.map((t) => (
        <article className="testi-card" key={t.img}>
          <Image
            className="testi-card-bg"
            src={`${CDN}/${t.img}.webp`}
            alt=""
            fill
            sizes={CARD_SIZES}
            style={t.imgStyle}
          />
          <div className="testi-body">
            {STARS}
            <p className="testi-quote">{t.quote}</p>
            <span className="testi-demo">{t.demo}</span>
          </div>
        </article>
      )),
    [],
  );

  return (
    <section id="reviews" className="sec-greentint">
      <div className="wrap">
        <div className="testi-header">
          <div className="sec-head" data-anim="fade-up">
            <p className="eyebrow">From happy users</p>
            <h2>Quietly, genuinely <span>helpful</span></h2>
          </div>
          <div className="testi-nav">
            <button type="button" aria-label="Previous" onClick={() => slide(-1)} disabled={idx === 0}><CaretLeftIcon className="ph" aria-hidden /></button>
            <button type="button" aria-label="Next" onClick={() => slide(1)} disabled={idx >= maxIdx}><CaretRightIcon className="ph" aria-hidden /></button>
          </div>
        </div>

        <div className="testi-track-wrap" data-anim="fade-up" ref={wrapRef}>
          <div className="testi-track" ref={trackRef}>
            {cards}
          </div>
        </div>
      </div>
    </section>
  );
}
