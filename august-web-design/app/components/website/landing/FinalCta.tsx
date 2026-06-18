"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { track } from "@/app/utils/analytics";

gsap.registerPlugin(ScrollTrigger);

export default function FinalCta() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const image = imageRef.current;
    if (!section || !content || !image) return;

    // Clip-path circle reveal is gated to landing-scope (needs Lenis to feel smooth)
    const isLanding = !!section.closest(".landing-scope");

    if (isLanding) {
      gsap.fromTo(
        section,
        { clipPath: "circle(0% at 50% 50%)" },
        {
          clipPath: "circle(150% at 50% 50%)",
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "top 15%",
            scrub: 0.6,
          },
        }
      );
    } else {
      gsap.set(section, { clipPath: "none" });
    }

    // Content fade — runs on all hosts
    gsap.fromTo(
      content,
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 50%",
          toggleActions: "play none none none",
        },
      }
    );

    // Hand slides up on scroll — runs on all hosts
    gsap.fromTo(
      image,
      { opacity: 0, y: 200 },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 40%",
          end: "bottom 80%",
          scrub: 0.8,
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="download"
      data-nav-dark
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #206E55 0%, #1a5c47 40%, #0f3d2f 70%, #1C1917 100%)",
        clipPath: "circle(0% at 50% 50%)",
      }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(168,213,186,0.15) 0%, transparent 50%)",
        }}
      />

      {/* Text content */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto max-w-[1200px] px-6 pt-32 text-center md:px-10 md:pt-44 lg:px-20"
        style={{ opacity: 0 }}
      >
        <h2
          className="text-white"
          style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
          }}
        >
          Your health journey starts with a single&nbsp;question
        </h2>
        <p
          className="mx-auto mt-2 max-w-lg"
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "clamp(15px, 2vw, 18px)",
            fontWeight: 300,
            lineHeight: 1.6,
          }}
        >
          Download August today. No appointments.
          Just answers you can&nbsp;trust.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://join.meetaugust.ai/?c=landing_page_footer_ios"
            target="_blank"
            rel="noopener"
            onClick={() => track("download_click", { button_name: "footer_section_ios" })}
            className="rounded-full bg-white px-7 py-3.5 text-green-primary text-center transition-transform duration-300 hover:scale-[1.03]"
            style={{ fontSize: "16px", fontWeight: 500, minWidth: "200px" }}
          >
            Download for iOS
          </a>
          <a
            href="https://join.meetaugust.ai/?c=landing_page_footer_android"
            target="_blank"
            rel="noopener"
            onClick={() => track("download_click", { button_name: "footer_section_android" })}
            className="rounded-full border border-white/30 px-7 py-3.5 text-white text-center transition-transform duration-300 hover:bg-white/10 hover:scale-[1.03]"
            style={{ fontSize: "16px", fontWeight: 500, minWidth: "200px" }}
          >
            Download for Android
          </a>
        </div>
      </div>

      {/* App icon hand image — blends into footer */}
      <div
        ref={imageRef}
        className="relative z-10 mx-auto"
        style={{ maxWidth: "550px", marginTop: "40px", opacity: 0 }}
      >
        <div className="relative">
          {/* Motion blur layers — offset blurred copies behind the sharp image */}
          {[
            { y: 6, x: 0, blur: 8, opacity: 0.3 },
            { y: 12, x: 1, blur: 14, opacity: 0.2 },
            { y: 20, x: 2, blur: 22, opacity: 0.12 },
          ].map((layer, i) => (
            <div
              key={i}
              className="pointer-events-none absolute inset-0"
              style={{
                transform: `translate(${layer.x}px, ${layer.y}px)`,
                filter: `blur(${layer.blur}px)`,
                opacity: layer.opacity,
                maskImage:
                  "linear-gradient(to bottom, transparent 30%, black 60%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 30%, black 60%)",
              }}
            >
              <Image
                src="/images/august-app-icon-hand-v2.webp"
                alt=""
                width={1024}
                height={1024}
                className="h-auto w-full"
                priority={false}
              />
            </div>
          ))}
          {/* Sharp original */}
          <Image
            src="/images/august-app-icon-hand-v2.webp"
            alt="Hand reaching for August Health app icon"
            width={1024}
            height={1024}
            className="relative h-auto w-full"
            priority={false}
          />
        </div>
        {/* Gradient overlay — full width, bleeds to section edges */}
        <div
          className="pointer-events-none absolute bottom-0 left-[-50vw] right-[-50vw] z-20"
          style={{
            height: "25%",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(28,25,23,0.15) 20%, rgba(28,25,23,0.4) 45%, rgba(28,25,23,0.7) 70%, #1C1917 100%)",
          }}
        />
      </div>
    </section>
  );
}
