"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { track } from "@/app/utils/analytics";

const testimonials = [
  {
    name: "Pravin Ramachandran",
    role: "August User",
    avatar: "/website-images/pravin.jpg",
    text: "Recently, I was down with a persistent fever and severe headache that went on for more than 10 days. The doctors ran a series of tests to determine the source of the infection. I ran the report through August AI. Later when the doctors came and explained to me the reports, it was exactly as informed by August.",
    platform: "august",
  },
  {
    name: "Martin Boyle",
    role: "August User",
    avatar: "/website-images/martin.png",
    text: "August AI has become a trusted part of my health routine. I was initially skeptical about using an AI-based service for health advice, but the system impressed me with its clarity and personalized insights.",
    platform: "august",
  },
  {
    name: "Joel Samberg",
    role: "August User",
    avatar: "/website-images/joel.png",
    text: "This service is incredibly helpful for identifying medical conditions and receiving suggestions. You can simply attach a medical report or describe your symptoms, and you get valuable insights quickly.",
    platform: "google",
  },
  {
    name: "Sukesh Mallya",
    role: "August User",
    avatar: "/website-images/sukesh.jpeg",
    text: "I\u2019ve been using August AI for some time and really appreciate how practical it is. It offers sensible advice on symptoms and general health while knowing when to guide you towards a doctor. It strikes the right balance between helpful support and professional responsibility.",
    platform: "google",
  },
  {
    name: "Riley Holt",
    role: "August User",
    avatar: "/website-images/riley.png",
    text: "Last night, I started feeling really uneasy after receiving some unexpected lab results. I decided to try out August and was amazed at how quickly and clearly everything was explained. As a naturally anxious person, having a medical companion like this is a great relief!",
    platform: "august",
  },
  {
    name: "Mallika Verma",
    role: "August User",
    avatar: "/website-images/mallika.jpeg",
    text: "August is my go to for all medical queries. I\u2019ve discussed medical reports at length. Thoroughly enjoy the periodic hello and reminders from August. Very comprehensive and reliable source.",
    platform: "google",
  },
  {
    name: "Eva Smith",
    role: "August User",
    avatar: "/website-images/eva.jpg",
    text: "Recently contacted August AI through WhatsApp, and it gave me the best possible solution for mental well-being. I\u2019m highly impressed with the AI",
    platform: "google",
  },
];

const displayTestimonials = [...testimonials, ...testimonials, ...testimonials];

export function Testimonials({ initialCountry }: { initialCountry?: string | null }) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [isJumping, setIsJumping] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(1); // 1 = from right, -1 = from left
  const mobileIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMobileAutoPlay = () => {
    if (mobileIntervalRef.current) clearInterval(mobileIntervalRef.current);
    mobileIntervalRef.current = setInterval(() => {
      setSlideDir(1);
      setMobileIndex((prev) => (prev + 1) % testimonials.length);
    }, 3500);
  };

  useEffect(() => {
    startMobileAutoPlay();
    return () => { if (mobileIntervalRef.current) clearInterval(mobileIntervalRef.current); };
  }, []);

  const handleMobileDotClick = (idx: number) => {
    setSlideDir(idx > mobileIndex ? 1 : -1);
    setMobileIndex(idx);
    startMobileAutoPlay();
    track("carousel_nav", { direction: "dot_click", section: "testimonials", index: idx });
  };


  // Initialize scroll position to the middle third
  useEffect(() => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth;
      scrollRef.current.scrollLeft = scrollWidth / 3;
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current || isJumping) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const third = scrollWidth / 3;

    // Reset scroll position to center copy when reaching boundaries
    if (scrollLeft < 10) {
      setIsJumping(true);
      scrollRef.current.scrollLeft = third;
      setTimeout(() => setIsJumping(false), 50);
    } else if (scrollLeft > scrollWidth - clientWidth - 10) {
      setIsJumping(true);
      scrollRef.current.scrollLeft = 2 * third - clientWidth;
      setTimeout(() => setIsJumping(false), 50);
    }
  };

  return (
    <section id="testimonials" className="pt-12 pb-[72px] sm:py-24">
      <div className="max-w-[1100px] mx-auto px-4">
        {/* Header Row */}
        <div className="relative flex flex-col items-center justify-center mb-12 text-center">
          <div className="max-w-[720px] flex flex-col items-center">
            <p className="text-base sm:text-xl font-semibold text-primary-400 mb-4">
              Testimonials 
            </p>
            <h2 className="text-[32px] sm:text-[44px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#111] mb-6">
              What users are saying
            </h2>
            <div 
              style={{
                fontFamily: 'var(--font-manrope), sans-serif',
                fontWeight: 500,
                lineHeight: "150%",
                color: "rgb(17, 17, 17)",
                fontSize: "17px",
              }}
              className="mb-6 max-w-[600px] mx-auto space-y-2"
            >
              <p>
                Answers to common questions about how August works, its accuracy, and your data privacy.
              </p>
              <p className="opacity-60">
                Note: Real stories from real users, shared with their permission. We used AI images to keep their identity private.
              </p>
            </div>
          </div>

          {/* Navigation - desktop only */}
          <div className="hidden sm:flex gap-3 flex-shrink-0 absolute bottom-6 right-0">
            <button
              onClick={() => {
                scroll("left");
                track("carousel_nav", { direction: "left", section: "testimonials" });
              }}
              className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center hover:bg-[#111] transition-colors cursor-pointer"
              aria-label="Previous"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                scroll("right");
                track("carousel_nav", { direction: "right", section: "testimonials" });
              }}
              className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center hover:bg-[#111] transition-colors cursor-pointer"
              aria-label="Next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: single centered card + dots */}
      <div className="sm:hidden px-4 overflow-hidden">
        <div className="relative">
          <AnimatePresence initial={false} custom={slideDir}>
            <motion.div
              key={mobileIndex}
              custom={slideDir}
              variants={{
                enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%" }),
                center: { x: 0 },
                exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", position: "absolute", top: 0, left: 0, right: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="bg-white border border-[#E8EAE8] rounded-[24px] p-8 flex flex-col shadow-subtle w-full min-h-[480px]"
            >
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#F0F2F0]">
            <Image
              src={testimonials[mobileIndex].avatar}
              alt={testimonials[mobileIndex].name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: "18px", fontWeight: 600, lineHeight: "28px", color: "rgb(23, 23, 23)", margin: 0 }}>
                {testimonials[mobileIndex].name}
              </p>
              <p style={{ fontSize: "18px", lineHeight: "28px", color: "rgb(81, 81, 81)", margin: 0 }}>
                {testimonials[mobileIndex].role}
              </p>
            </div>
          </div>
          <p
            style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: "150%", color: "rgb(23, 23, 23)" }}
            className="mb-6"
          >
            {testimonials[mobileIndex].text}
          </p>
          <div className="flex gap-1 mb-8">
            {[1,2,3,4,5].map((star) => (
              <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill="#008B73">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto", paddingTop: "24px", borderTop: "1px solid #F0F2F0" }}>
            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: "28px", color: "rgb(23, 23, 23)", margin: 0 }}>Posted on</p>
            <div style={{ display: "flex", alignItems: "center" }}>
              {testimonials[mobileIndex].platform === "google" ? <GoogleLogo /> : <AugustLogo />}
            </div>
          </div>
          </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-5">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleMobileDotClick(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
              style={{
                width: "20px",
                height: "8px",
                borderRadius: "4px",
                border: "none",
                background: idx === mobileIndex ? "#008B73" : "rgba(0,0,0,0.2)",
                padding: 0,
                cursor: "pointer",
                transform: idx === mobileIndex ? "scaleX(1)" : "scaleX(0.4)",
                transformOrigin: "left",
                transition: "transform 0.2s, background 0.2s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Desktop: original edge-to-edge carousel */}
      <div className="relative w-full hidden sm:block max-w-[1100px] mx-auto px-4 overflow-hidden">
        <ul
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayTestimonials.map((t, i) => (
              <li
                key={i}
                className="flex-shrink-0 w-[85vw] sm:w-[calc(50%-12px)] lg:w-[522px] min-h-[503px] snap-start bg-white border border-[#E8EAE8] rounded-[24px] p-8 flex flex-col shadow-subtle  transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#F0F2F0]">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p 
                      style={{
                        fontFamily: 'var(--font-inter), sans-serif',
                        fontSize: "18px",
                        fontWeight: 600,
                        lineHeight: "28px",
                        color: "rgb(23, 23, 23)",
                        margin: 0
                      }}
                    >
                      {t.name}
                    </p>
                    <p 
                      style={{
                        fontSize: "18px",
                        lineHeight: "28px",
                        color: "rgb(81, 81, 81)",
                        margin: 0
                      }}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
                <p 
                  style={{
                    fontFamily: 'var(--font-manrope), sans-serif',
                    fontSize: "18px",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    lineHeight: "150%",
                    color: "rgb(23, 23, 23)",
                  }}
                  className="mb-6"
                >
                  {t.text}
                </p>
                {/* Star Rating */}
                <div className="flex gap-1 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="#008B73"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "auto",
                    paddingTop: "24px",
                    borderTop: "1px solid #F0F2F0"
                  }}
                >
                  <p 
                    style={{
                      fontFamily: 'var(--font-manrope), sans-serif',
                      fontSize: "18px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      lineHeight: "28px",
                      color: "rgb(23, 23, 23)",
                      margin: 0
                    }}
                  >
                    Posted on
                  </p>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {t.platform === "google" ? (
                      <GoogleLogo />
                    ) : (
                      <AugustLogo />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
    </section>
  );
}

function GoogleLogo() {
  return (
    <svg width="103" height="32" viewBox="0 0 103 32" fill="none">
      <path d="M12.7751 11.4182V14.8364H21.0241C20.8051 16.7273 20.1481 18.1818 19.1261 19.1273C17.9581 20.2909 16.0601 21.6 12.7751 21.6C7.73805 21.6 3.79602 17.5273 3.79602 12.5091C3.79602 7.49091 7.66505 3.41818 12.7751 3.41818C15.4761 3.41818 17.5201 4.50909 18.9801 5.89091L21.3891 3.49091C19.3451 1.52727 16.5711 0 12.7751 0C5.84004 0 0 5.6 0 12.5091C0 19.4182 5.84004 25.0182 12.7751 25.0182C16.4981 25.0182 19.3451 23.7818 21.5351 21.5273C23.7982 19.2727 24.5282 16.0727 24.5282 13.5273C24.5282 12.7273 24.4552 12 24.3822 11.4182H12.7751Z" fill="#4285F4" />
      <path d="M34.7483 8.58203C30.2953 8.58203 26.5723 12.0002 26.5723 16.6548C26.5723 21.3093 30.2223 24.7275 34.7483 24.7275C39.2743 24.7275 42.9244 21.382 42.9244 16.7275C42.9244 12.0002 39.2743 8.58203 34.7483 8.58203ZM34.7483 21.6002C32.2663 21.6002 30.1493 19.5638 30.1493 16.7275C30.1493 13.8184 32.2663 11.8548 34.7483 11.8548C37.2303 11.8548 39.3473 13.8184 39.3473 16.7275C39.3473 19.5638 37.2303 21.6002 34.7483 21.6002Z" fill="#EA4335" />
      <path d="M52.9241 8.58203C48.4711 8.58203 44.748 12.0002 44.748 16.6548C44.748 21.3093 48.3981 24.7275 52.9241 24.7275C57.4501 24.7275 61.1002 21.382 61.1002 16.7275C61.1002 12.0002 57.4501 8.58203 52.9241 8.58203ZM52.9241 21.6002C50.4421 21.6002 48.3251 19.5638 48.3251 16.7275C48.3251 13.8184 50.4421 11.8548 52.9241 11.8548C55.4061 11.8548 57.5231 13.8184 52.9241 16.7275C57.5231 19.5638 55.4061 21.6002 52.9241 21.6002Z" fill="#FBBC05" />
      <path d="M74.6798 10.4002H74.5338C73.7308 9.45476 72.1978 8.58203 70.2268 8.58203C66.1388 8.58203 62.6348 12.0729 62.6348 16.6548C62.6348 21.1638 66.1388 24.7275 70.2268 24.7275C72.1978 24.7275 73.7308 23.8548 74.5338 22.9093H74.6798V24.0729C74.6798 27.1275 73.0008 28.8002 70.3728 28.8002C68.1828 28.8002 66.8688 27.2729 66.2848 25.8911L63.2188 27.2002C64.0948 29.3093 66.5038 32.0002 70.4458 32.0002C74.6068 32.0002 78.1839 29.5275 78.1839 23.5639V9.01839H74.8258V10.4002H74.6798ZM70.5918 21.6002C68.1098 21.6002 66.2848 19.4911 66.2848 16.7275C66.2848 13.8911 68.1828 11.8548 70.5918 11.8548C73.0008 11.8548 74.8988 13.9638 74.8988 16.8002C74.9718 19.5638 73.0738 21.6002 70.5918 21.6002Z" fill="#4285F4" />
      <path d="M80.8848 0.364258H84.3888V24.8006H80.8848V0.364258Z" fill="#34A853" />
      <path d="M95.1922 21.6002C93.3671 21.6002 92.1261 20.8002 91.2501 19.1275L102.127 14.6911L101.762 13.7457C101.105 11.9275 98.9882 8.58203 94.8272 8.58203C90.6661 8.58203 87.1621 11.8548 87.1621 16.6548C87.1621 21.1638 90.5931 24.7275 95.1922 24.7275C98.9152 24.7275 101.032 22.4729 101.981 21.1638L99.2072 19.3457C98.2582 20.7275 97.0172 21.6002 95.1922 21.6002ZM94.9732 11.6366C96.4332 11.6366 97.6742 12.3638 98.0392 13.382L90.7391 16.4366C90.6661 13.0911 93.1482 11.6366 94.9732 11.6366Z" fill="#EA4335" />
    </svg>
  );
}

function AugustLogo() {
  return (
    <svg width="103" height="32" viewBox="0 0 122.67 32" fill="none" className="translate-y-[1px]">
      <path d="M 6.6 23.656 C 5.387 23.656 4.372 23.434 3.553 22.989 C 2.734 22.534 2.113 21.938 1.688 21.2 C 1.274 20.452 1.067 19.633 1.067 18.744 C 1.067 17.915 1.213 17.188 1.506 16.561 C 1.799 15.934 2.234 15.404 2.81 14.969 C 3.386 14.524 4.094 14.166 4.933 13.893 C 5.66 13.68 6.484 13.493 7.404 13.332 C 8.324 13.17 9.289 13.018 10.3 12.877 C 11.32 12.735 12.331 12.594 13.332 12.452 L 12.18 13.089 C 12.2 11.806 11.927 10.855 11.361 10.239 C 10.805 9.612 9.845 9.299 8.48 9.299 C 7.621 9.299 6.833 9.501 6.115 9.905 C 5.398 10.3 4.897 10.957 4.614 11.876 L 1.658 10.967 C 2.062 9.562 2.83 8.445 3.962 7.616 C 5.104 6.787 6.621 6.373 8.511 6.373 C 9.976 6.373 11.25 6.626 12.331 7.131 C 13.423 7.626 14.221 8.415 14.727 9.496 C 14.989 10.032 15.151 10.598 15.212 11.194 C 15.272 11.79 15.303 12.432 15.303 13.119 L 15.303 23.201 L 12.498 23.201 L 12.498 19.457 L 13.044 19.942 C 12.367 21.195 11.502 22.13 10.451 22.747 C 9.41 23.353 8.127 23.656 6.6 23.656 Z M 7.161 21.064 C 8.061 21.064 8.834 20.907 9.481 20.594 C 10.128 20.27 10.648 19.861 11.042 19.366 C 11.437 18.87 11.694 18.355 11.816 17.819 C 11.987 17.334 12.084 16.788 12.104 16.182 C 12.134 15.575 12.149 15.09 12.149 14.727 L 13.18 15.105 C 12.18 15.257 11.27 15.394 10.451 15.515 C 9.632 15.636 8.89 15.757 8.223 15.879 C 7.566 15.99 6.979 16.126 6.464 16.288 C 6.029 16.44 5.64 16.622 5.297 16.834 C 4.963 17.046 4.695 17.304 4.493 17.607 C 4.301 17.91 4.205 18.279 4.205 18.714 C 4.205 19.138 4.311 19.532 4.523 19.896 C 4.736 20.25 5.059 20.533 5.494 20.745 C 5.928 20.958 6.484 21.064 7.161 21.064 Z" fill="#206E55" />
      <path d="M 23.894 23.641 C 22.762 23.641 21.812 23.459 21.044 23.095 C 20.275 22.731 19.649 22.256 19.164 21.67 C 18.689 21.074 18.325 20.427 18.072 19.729 C 17.819 19.032 17.648 18.35 17.557 17.683 C 17.466 17.016 17.42 16.43 17.42 15.924 L 17.42 6.828 L 20.634 6.828 L 20.634 14.878 C 20.634 15.515 20.685 16.172 20.786 16.849 C 20.897 17.516 21.099 18.138 21.392 18.714 C 21.695 19.29 22.115 19.755 22.651 20.109 C 23.196 20.462 23.904 20.639 24.773 20.639 C 25.339 20.639 25.875 20.548 26.38 20.366 C 26.886 20.174 27.325 19.871 27.699 19.457 C 28.083 19.042 28.381 18.496 28.594 17.819 C 28.816 17.142 28.927 16.318 28.927 15.348 L 30.898 16.091 C 30.898 17.577 30.62 18.891 30.064 20.033 C 29.508 21.165 28.71 22.049 27.669 22.686 C 26.628 23.323 25.369 23.641 23.894 23.641 Z M 29.306 23.201 L 29.306 18.471 L 28.927 18.471 L 28.927 6.828 L 32.126 6.828 L 32.126 23.201 Z" fill="#206E55" />
      <path d="M 41.609 30.933 C 40.729 30.933 39.875 30.797 39.047 30.524 C 38.228 30.251 37.48 29.847 36.803 29.311 C 36.125 28.786 35.565 28.134 35.12 27.355 L 38.046 25.87 C 38.4 26.567 38.905 27.077 39.562 27.401 C 40.219 27.724 40.911 27.886 41.639 27.886 C 42.538 27.886 43.307 27.724 43.943 27.401 C 44.58 27.088 45.06 26.612 45.384 25.976 C 45.717 25.339 45.879 24.551 45.869 23.611 L 45.869 19.032 L 46.248 19.032 L 46.248 6.828 L 49.053 6.828 L 49.053 23.641 C 49.053 24.076 49.037 24.49 49.007 24.884 C 48.977 25.278 48.921 25.673 48.84 26.067 C 48.608 27.168 48.163 28.078 47.506 28.796 C 46.859 29.513 46.031 30.049 45.02 30.403 C 44.019 30.756 42.882 30.933 41.609 30.933 Z M 41.366 23.656 C 39.84 23.656 38.521 23.277 37.409 22.519 C 36.307 21.761 35.453 20.73 34.847 19.426 C 34.251 18.112 33.952 16.637 33.952 14.999 C 33.952 13.352 34.256 11.881 34.862 10.588 C 35.468 9.284 36.328 8.258 37.439 7.51 C 38.561 6.752 39.89 6.373 41.427 6.373 C 42.973 6.373 44.272 6.752 45.323 7.51 C 46.384 8.258 47.183 9.284 47.718 10.588 C 48.264 11.891 48.537 13.362 48.537 14.999 C 48.537 16.637 48.264 18.107 47.718 19.411 C 47.173 20.715 46.369 21.751 45.308 22.519 C 44.247 23.277 42.933 23.656 41.366 23.656 Z M 41.806 20.791 C 42.847 20.791 43.696 20.543 44.353 20.048 C 45.01 19.553 45.49 18.87 45.793 18.001 C 46.096 17.132 46.248 16.131 46.248 14.999 C 46.248 13.867 46.091 12.867 45.778 11.998 C 45.475 11.128 45 10.451 44.353 9.966 C 43.716 9.481 42.902 9.238 41.912 9.238 C 40.861 9.238 39.997 9.496 39.319 10.012 C 38.642 10.527 38.137 11.219 37.803 12.089 C 37.48 12.958 37.318 13.928 37.318 14.999 C 37.318 16.081 37.48 17.061 37.803 17.941 C 38.137 18.81 38.632 19.502 39.289 20.018 C 39.956 20.533 40.795 20.791 41.806 20.791 Z" fill="#206E55" />
      <path d="M 57.964 23.641 C 56.832 23.641 55.882 23.459 55.114 23.095 C 54.346 22.731 53.719 22.256 53.234 21.67 C 52.759 21.074 52.395 20.427 52.142 19.729 C 51.89 19.032 51.718 18.35 51.627 17.683 C 51.536 17.016 51.49 16.43 51.49 15.924 L 51.49 6.828 L 54.704 6.828 L 54.704 14.878 C 54.704 15.515 54.755 16.172 54.856 16.849 C 54.967 17.516 55.169 18.138 55.463 18.714 C 55.766 19.29 56.185 19.755 56.721 20.109 C 57.267 20.462 57.974 20.639 58.843 20.639 C 59.409 20.639 59.945 20.548 60.45 20.366 C 60.956 20.174 61.395 19.871 61.769 19.457 C 62.153 19.042 62.452 19.851 62.664 17.819 C 62.886 17.142 62.997 16.318 62.997 15.348 L 64.968 16.091 C 64.968 17.577 64.69 18.891 64.134 20.033 C 63.579 21.165 62.78 22.049 61.739 22.686 C 60.698 23.323 59.44 23.641 57.964 23.641 Z M 63.376 23.201 L 63.376 18.471 L 62.997 18.471 L 62.997 6.828 L 66.196 6.828 L 66.196 23.201 Z" fill="#206E55" />
      <path d="M 75.194 23.641 C 73.203 23.641 71.58 23.201 70.327 22.322 C 69.074 21.443 68.306 20.205 68.023 18.608 L 71.267 18.107 C 71.469 18.956 71.934 19.628 72.662 20.124 C 73.4 20.609 74.314 20.851 75.406 20.851 C 76.396 20.851 77.17 20.649 77.726 20.245 C 78.292 19.841 78.575 19.285 78.575 18.577 C 78.575 18.163 78.473 17.829 78.271 17.577 C 78.079 17.314 77.67 17.066 77.043 16.834 C 76.417 16.601 75.462 16.313 74.178 15.97 C 72.773 15.606 71.656 15.217 70.827 14.802 C 70.009 14.378 69.423 13.888 69.069 13.332 C 68.725 12.766 68.553 12.084 68.553 11.285 C 68.553 10.295 68.816 9.43 69.342 8.693 C 69.867 7.955 70.605 7.384 71.555 6.979 C 72.515 6.575 73.637 6.373 74.921 6.373 C 76.174 6.373 77.291 6.57 78.271 6.964 C 79.252 7.358 80.045 7.919 80.652 8.647 C 81.258 9.365 81.622 10.209 81.743 11.179 L 78.499 11.77 C 78.388 10.982 78.019 10.36 77.392 9.905 C 76.765 9.451 75.952 9.203 74.951 9.163 C 73.991 9.122 73.213 9.284 72.616 9.648 C 72.02 10.001 71.722 10.492 71.722 11.118 C 71.722 11.482 71.833 11.79 72.055 12.043 C 72.288 12.296 72.733 12.538 73.39 12.771 C 74.047 13.003 75.017 13.281 76.3 13.605 C 77.675 13.958 78.767 14.353 79.575 14.787 C 80.384 15.212 80.96 15.722 81.303 16.318 C 81.657 16.905 81.834 17.617 81.834 18.456 C 81.834 20.073 81.243 21.342 80.06 22.261 C 78.888 23.181 77.266 23.641 75.194 23.641 Z" fill="#206E55" />
      <path d="M 93.042 23.201 C 92.011 23.404 91 23.489 90.01 23.459 C 89.019 23.429 88.135 23.237 87.357 22.883 C 86.578 22.529 85.992 21.973 85.598 21.215 C 85.244 20.538 85.052 19.851 85.022 19.153 C 85.002 18.446 84.992 17.647 84.992 16.758 L 84.992 2.28 L 88.175 2.28 L 88.175 16.606 C 88.175 17.263 88.18 17.834 88.191 18.32 C 88.211 18.805 88.317 19.214 88.509 19.548 C 88.873 20.174 89.449 20.533 90.237 20.624 C 91.036 20.705 91.971 20.67 93.042 20.518 Z M 81.853 9.375 L 81.853 6.828 L 93.042 6.828 L 93.042 9.375 Z" fill="#206E55" />
    </svg>
  );
}

