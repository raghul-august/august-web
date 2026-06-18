"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { track } from "@/app/utils/analytics";

export default function LandingHero() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "60% start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section id="hero" ref={sectionRef} data-nav-dark className="relative" style={{ minHeight: "100vh", overflow: "hidden" }}>
      <motion.div
        initial={{ scale: 1.03 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0"
        style={{ willChange: "transform", backgroundColor: "#161d1b" }}
      >
        <Image
          src="/images/august-hero-bench.webp"
          alt="August health companion"
          fill
          className="object-cover"
          preload
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAACqADAAQAAAABAAAACgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgACgAKAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAf/aAAwDAQACEQMRAD8A+mdU/bjgtJRpGsWNi+oXURNsbaSV4TKGYbXbkKCu3GSOc5wOa+KdW/ab8aXmq3l42iaUpnmkkINrbuRuYnlmJJ+p5PevibxWBuibHO4c/rXEG+vRwLiQAf7Z/Aa+Mp1qqhG0vz/AMx4nHXnrFf18j//2Q=="
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 120vw, 100vw"
          style={{ objectPosition: "center 30%" }}
        />
      </motion.div>

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(16, 24, 22, 0.35) 0%,
              rgba(16, 24, 22, 0.50) 50%,
              rgba(16, 24, 22, 0.65) 100%
            )
          `,
        }}
      />

      <div
        className="pointer-events-none absolute z-[2]"
        style={{
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "500px",
          background: "radial-gradient(ellipse, rgba(168,213,186,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-[3]" aria-hidden="true">
        {[
          { top: "8%",  delay: 0,   dur: 32, fly: "birdFly1", size: 34, opacity: 0.45, flap: 1.2, desktopOnly: false },
          { top: "14%", delay: 4,   dur: 38, fly: "birdFly2", size: 28, opacity: 0.35, flap: 1.1, desktopOnly: true },
          { top: "25%", delay: 10,  dur: 28, fly: "birdFly3", size: 22, opacity: 0.3,  flap: 1.3, desktopOnly: false },
          { top: "35%", delay: 16,  dur: 42, fly: "birdFly1", size: 20, opacity: 0.25, flap: 1.4, desktopOnly: true },
          { top: "12%", delay: 6,   dur: 34, fly: "birdFly3", size: 30, opacity: 0.4,  flap: 1.15, desktopOnly: false },
          { top: "45%", delay: 22,  dur: 44, fly: "birdFly2", size: 18, opacity: 0.2,  flap: 1.5, desktopOnly: true },
          { top: "5%",  delay: 12,  dur: 26, fly: "birdFly1", size: 16, opacity: 0.18, flap: 1.0, desktopOnly: true },
          { top: "20%", delay: 18,  dur: 40, fly: "birdFly3", size: 24, opacity: 0.3,  flap: 1.25, desktopOnly: false },
          { top: "40%", delay: 28,  dur: 48, fly: "birdFly2", size: 14, opacity: 0.15, flap: 1.35, desktopOnly: true },
          { top: "17%", delay: 2,   dur: 36, fly: "birdFly1", size: 26, opacity: 0.38, flap: 1.18, desktopOnly: false },
        ].map((bird, i) => (
          <div
            key={i}
            className={bird.desktopOnly ? "hidden md:block" : "block"}
            style={{
              position: "absolute",
              top: bird.top,
              left: "-50px",
              animation: `${bird.fly} ${bird.dur}s linear infinite`,
              animationDelay: `${bird.delay}s`,
            }}
          >
            <svg
              width={bird.size}
              height={bird.size * 0.5}
              viewBox="0 0 40 20"
              fill="none"
              style={{ opacity: bird.opacity, overflow: "visible" }}
            >
              <g style={{ transformOrigin: "20px 12px", animation: `wingFlapLeft ${bird.flap}s ease-in-out infinite` }}>
                <path d="M20 12 C16 10, 10 4, 2 2 C6 6, 12 10, 20 12Z" fill="rgba(20,20,20,0.85)" />
              </g>
              <g style={{ transformOrigin: "20px 12px", animation: `wingFlapRight ${bird.flap}s ease-in-out infinite` }}>
                <path d="M20 12 C24 10, 30 4, 38 2 C34 6, 28 10, 20 12Z" fill="rgba(20,20,20,0.85)" />
              </g>
              <ellipse cx="20" cy="12" rx="1.5" ry="1" fill="rgba(20,20,20,0.9)" />
            </svg>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 z-[3]" aria-hidden="true">
        {[
          { top: "12%", w: 250, h: 2,  opacity: 0.06, blur: 12, dur: 35, delay: 0,  path: "windDrift1" },
          { top: "28%", w: 320, h: 1.5,opacity: 0.05, blur: 18, dur: 45, delay: 8,  path: "windDrift2", desktopOnly: true },
          { top: "45%", w: 200, h: 2,  opacity: 0.05, blur: 14, dur: 40, delay: 15, path: "windDrift3" },
          { top: "18%", w: 280, h: 1,  opacity: 0.04, blur: 20, dur: 50, delay: 4,  path: "windDrift1", desktopOnly: true },
          { top: "55%", w: 360, h: 1.5,opacity: 0.03, blur: 22, dur: 48, delay: 22, path: "windDrift2" },
          { top: "8%",  w: 180, h: 2,  opacity: 0.05, blur: 15, dur: 38, delay: 12, path: "windDrift3", desktopOnly: true },
          { top: "38%", w: 300, h: 1,  opacity: 0.04, blur: 18, dur: 55, delay: 18, path: "windDrift1" },
          { top: "65%", w: 240, h: 1.5,opacity: 0.03, blur: 20, dur: 52, delay: 30, path: "windDrift2", desktopOnly: true },
        ].map((w: any, i) => (
          <div
            key={`wisp-${i}`}
            className={w.desktopOnly ? "hidden md:block" : "block"}
            style={{
              position: "absolute",
              top: w.top,
              left: "-300px",
              width: `${w.w}px`,
              height: `${w.h}px`,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.9)",
              opacity: w.opacity,
              filter: `blur(${w.blur}px)`,
              animation: `${w.path} ${w.dur}s ease-in-out infinite`,
              animationDelay: `${w.delay}s`,
            }}
          />
        ))}
      </div>


      <div className="film-grain pointer-events-none absolute inset-0 z-[4]" />

      <motion.div
        style={{ opacity, y, minHeight: "100vh", willChange: "transform, opacity" }}
        className="relative z-10 flex flex-col items-center justify-center px-6 md:px-10 lg:px-20 text-center"
      >
        <div
          data-animate
          className="shine-pill mb-6 inline-flex items-center rounded-full px-6 py-2.5 text-[14px] font-medium tracking-wide text-[#FAF9F5]/85"
          style={{
            borderRadius: "100px",
          }}
        >
          #1 Health AI Worldwide
        </div>

        <h1
          data-animate
          className="mx-auto max-w-4xl"
          style={{
            fontSize: "clamp(30px, 5.5vw, 60px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#ffffff",
          }}
        >
          august, a health companion
          <br />
          that actually knows&nbsp;you
        </h1>

        <p
          data-animate
          className="mx-auto mt-3 max-w-lg text-white"
          style={{
            fontSize: "clamp(15px, 1.8vw, 18px)",
            fontWeight: 400,
            lineHeight: 1.6,
          }}
        >
          Healthcare that finally puts you first. Personal. Accurate.
          Available when you need it.
        </p>

        <div data-animate className="mt-5 md:mt-10 flex flex-col items-center gap-4">
          <a
            href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=landing_page_hero"
            target="_blank"
            rel="noopener"
            onClick={() => track("cta_click", { button_name: "hero_primary", button_copy: "Talk to August Now" })}
            className="rounded-full px-8 py-3.5 text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.02] md:hidden"
            style={{ background: "#206E55", fontSize: "16px", fontWeight: 500 }}
          >
            Talk to August
          </a>

          <div className="hidden items-center gap-5 md:flex">
            <a
              href="https://join.meetaugust.ai/?c=landing_page_hero_ios"
              target="_blank"
              rel="noopener"
              onClick={() => track("download_click", { button_name: "hero_section_ios" })}
              className="transition-opacity duration-300 hover:opacity-80"
            >
              <Image
                src="/images/app-store-badge.svg"
                alt="Download on the App Store"
                width={150}
                height={50}
                unoptimized
                style={{ height: "50px", width: "auto" }}
              />
            </a>
            <a
              href="https://join.meetaugust.ai/?c=landing_page_hero_android"
              target="_blank"
              rel="noopener"
              onClick={() => track("download_click", { button_name: "hero_section_android" })}
              className="transition-opacity duration-300 hover:opacity-80"
            >
              <Image
                src="/images/google-play-badge.svg"
                alt="Get it on Google Play"
                width={150}
                height={50}
                unoptimized
                style={{ height: "50px", width: "auto" }}
              />
            </a>
          </div>
        </div>

        <div
          data-animate
          className="mt-5 flex flex-nowrap items-center justify-center gap-3 md:gap-7 md:flex-wrap"
        >
          <div className="flex items-center gap-1.5 md:gap-2 text-white/80 text-[12px] md:text-[14px]" style={{ fontWeight: 400 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>Zero Waiting Time</span>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 text-white/80 text-[12px] md:text-[14px]" style={{ fontWeight: 400 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>Safe and Secure</span>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2">
        <p className="text-white/40" style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Scroll
        </p>
        <div className="h-9 w-5 rounded-full border border-white/25" style={{ padding: "4px" }}>
          <div
            className="h-2 w-full rounded-full bg-white/35"
            style={{ animation: "scrollDot 2s ease-in-out infinite" }}
          />
        </div>
      </div>
    </section>
  );
}
