"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const ChatInput = dynamic(() => import("./ChatInput").then(mod => mod.ChatInput), {
  ssr: true,
  loading: () => <div className="w-full h-[100px] sm:h-[135px] bg-white rounded-[12px] sm:rounded-[24px] border border-[#E8EBEA] animate-pulse" />
});
import { checkCountry } from "@/app/utils/checkCountry";
import { track } from "@/app/utils/analytics";
import { TrackedCTA } from "./TrackedCTA";
import { WhatsAppIcon } from "./WhatsAppIcon";



import { BASE_USERS, USERS_PER_MINUTE, calculateInitialUsers } from "@/app/utils/userCount";

type Variant = "Us" | "India" | "Global";

const HERO_HEADINGS: Record<Variant, string> = {
  Us: "Talk to an AI Doctor",
  India: "Health companion",
  Global: "Health companion",
};

interface HeroProps {
  initialCountry?: string | null;
  initialOs?: "ios" | "android" | "other";
  initialIsMobile?: boolean;
  initialUsers?: number;
}

function HeroBase({ initialCountry, initialOs = "other", initialIsMobile = false, initialUsers }: HeroProps) {
  const [users, setUsers] = useState(initialUsers ?? BASE_USERS);
  const [variant, setVariant] = useState<Variant>(() => {
    if (initialCountry === "US") return "Us";
    if (initialCountry === "IN") return "India";
    return "Global";
  });
  const [isMobile, setIsMobile] = useState(initialIsMobile);
  const [os, setOs] = useState<"ios" | "android" | "other">(initialOs);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initial User Count sync (optional, ensures client time matches server logic if drift exists)
    if (!initialUsers) {
      setUsers(calculateInitialUsers());
    }

    // 2. User Increment Interval
    const interval = setInterval(() => {
      setUsers((prev) => prev + Math.floor(Math.random() * 6) + 10);
    }, 60000);

    // 3. Client-side Corrections (only if server/initial props were likely off)
    const actualMobile = window.innerWidth < 640;
    if (actualMobile !== initialIsMobile) setIsMobile(actualMobile);

    const checkOS = () => {
      const ua = navigator.userAgent;
      if (/android/i.test(ua)) return "android";
      if (/iPhone|iP[oa]d/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
      return "other";
    };
    
    const actualOs = checkOS();
    if (actualOs !== initialOs) setOs(actualOs);

    if (!initialCountry) {
      const country = checkCountry();
      const nextVariant = country === "US" ? "Us" : country === "IN" ? "India" : "Global";
      if (nextVariant !== variant) setVariant(nextVariant);
    }

    return () => clearInterval(interval);
  }, []);

  // const [testimonialIndex, setTestimonialIndex] = useState(0);
  // const [isTransitioning, setIsTransitioning] = useState(false);

  // const testimonials = [
  //   "August is my go to for all medical queries - Mallika",
  //   "Is helpful for identifying medical conditions - Joel",
  //   "Having a medical companion like this is a great relief - Riley",
  // ];

  // useEffect(() => {
  //   const testimonialInterval = setInterval(() => {
  //     setIsTransitioning(true);
  //     setTimeout(() => {
  //       setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  //       setIsTransitioning(false);
  //     }, 300); // Wait for fade out
  //   }, 4000);

  //   return () => clearInterval(testimonialInterval);
  // }, [testimonials.length]);

  return (
    <section id="home" className={`pt-24 ${variant === "India" ? "sm:pt-[128px]" : "sm:pt-36"} pb-16 px-4 sm:px-7 relative overflow-hidden`}>
      {/* Background Glow - only for India */}
      {variant === "India" && (
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[480px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle, rgba(26,122,90,0.06) 0%, transparent 70%)'
          }}
        />
      )}

      <div className="max-w-[780px] mt-[1rem] mx-auto flex flex-col items-center text-center relative z-10">
        {variant === "India" ? (
          /* India Variant UI */
          <div className="flex flex-col items-center">
            {/* Animation Styles */}
            <style jsx global>{`
              @keyframes fadeUp {
                from { opacity: 0; transform: translateY(16px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-up {
                animation: fadeUp 0.6s ease-out forwards;
              }
            `}</style>

            {/* Badge */}
            <div 
              className="animate-fade-up"
              style={{ animationDelay: '0s' }}
            >
              <a
                href="#usmle"
                onClick={() => track("hero_subtitle_click", { 
                  subtitle_copy: "100% USMLE Score" 
                })}
                className="inline-block bg-white border border-[rgba(0,0,0,0.06)] rounded-full px-5 py-2 text-[13px] font-semibold text-[#1a7a5a] tracking-[0.3px] mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] no-underline"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                100% USMLE Score
              </a>
            </div>

            {/* Main Heading - Split Layout */}
            {/* Desktop: Global Style UI/CSS */}
            <h1
              className="hidden sm:flex animate-fade-up mb-4 flex flex-col items-center" 
              style={{ 
                animationDelay: '0.1s',
                fontFamily: 'var(--font-manrope), sans-serif',
                color: '#206e55',
                textAlign: 'center'
              }}
            >
              <span
                className="block text-[60px] leading-[64px] whitespace-pre"
                style={{ fontWeight: 300 }}
              >
                Health Companion
              </span>
              <span 
                className="block text-[60px] leading-[64px] whitespace-pre -mt-[7px]"
                style={{
                  fontWeight: 300,
                  backgroundImage: 'linear-gradient(90deg, rgb(32, 110, 85) 0%, rgb(45, 155, 119) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                trusted by
              </span>
              <span className="relative inline-block">
                <span 
                  className="block text-[60px] leading-[64px] cursor-pointer"
                  style={{
                    fontWeight: 500,
                    backgroundImage: 'linear-gradient(90deg, rgb(32, 110, 85) 0%, rgb(45, 155, 119) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {users.toLocaleString()} <span style={{ fontWeight: 300, opacity: 1 }}>people</span>
                </span>
                <span className="absolute -top-8 -right-10 rotate-[10deg] pointer-events-none scale-100 origin-center">
                  <SparklesIcon />
                </span>
              </span>
            </h1>

            {/* Mobile: India-specific Segmented Style */}
            <h1 
              className="sm:hidden animate-fade-up flex flex-col items-center mb-3"
              style={{ 
                animationDelay: '0.1s',
                fontFamily: 'var(--font-manrope), sans-serif',
                color: '#206e55'
              }}
            >
              <span className="text-[28px] min-[375px]:text-[42px] font-light leading-[1.15] tracking-[-0.96px]">Health Companion</span>
              <span className="text-[28px] min-[375px]:text-[42px] font-light leading-[1.15] tracking-[-0.96px]">trusted by</span>
              <span className="text-[34px] min-[375px]:text-[48px] font-semibold leading-[1.15] tracking-[-0.96px] mt-1 block">
                {users.toLocaleString()}
              </span>
              <span className="relative inline-block">
                <span className="text-[28px] min-[375px]:text-[42px] font-light leading-[1.15] tracking-[-0.96px]">people</span>
                <span className="absolute -top-6 -right-8 rotate-[10deg] pointer-events-none scale-75 origin-center">
                  <SparklesIcon />
                </span>
              </span>
            </h1>

            {/* Subtitle - Reverted CSS Style */}
            <p 
              // className="animate-fade-up text-sm sm:text-base text-neutral-800 max-w-[480px] mb-8 font-normal"
              style={{ animationDelay: '0.2s' }}
              className="text-sm min-[375px]:text-base sm:text-xl text-dark animate-fade-up mb-6 sm:mb-8"
            >
              Talk to August for clear guidance<br />on symptoms, medications, and lab reports.
            </p>

            {/* Trust Pills */}
            <div 
              className="animate-fade-up flex gap-6 mb-9 justify-center flex-wrap"
              style={{ 
                animationDelay: '0.3s',
                fontFamily: 'var(--font-inter), sans-serif'
              }}
            >
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#6b7280] tracking-[0.2px]">
                <span className="text-[#1a7a5a]"><ClockIcon /></span>
                Zero Waiting Time
              </div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#6b7280] tracking-[0.2px]">
                <span className="text-[#1a7a5a]"><FreeCostIcon /></span>
                Free to Try
              </div>
            </div>

            {/* Primary CTA */}
            <div 
              className="animate-fade-up w-full max-w-[85%] min-[375px]:max-w-[300px] mx-auto mb-3"
              style={{ animationDelay: '0.4s' }}
            >
              <a
                href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=landing_page_hero_cta"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("cta_click", { button_name: "hero_primary", button_copy: "Talk to August Now" })}
                className="w-full py-2.5 min-[375px]:py-3 px-4 min-[375px]:px-6 rounded-pill text-center text-sm min-[375px]:text-base no-underline transition-all duration-[0.25s] hover:-translate-y-px flex items-center justify-center gap-2"
                style={{
                  fontFamily: 'var(--font-manrope), sans-serif',
                  borderWidth: "1px",
                  borderColor: "rgba(32, 110, 85, 0.2)",
                  borderStyle: "solid",
                  background: "linear-gradient(rgb(45, 155, 119) 0%, rgb(32, 110, 85) 100%)",
                  borderRadius: "60px",
                  boxShadow: "rgba(0, 0, 0, 0.18) 0px 1px 2px 0px, rgba(0, 0, 0, 0.16) 0px 4px 4px 0px, rgba(0, 0, 0, 0.09) 0px 9px 5px 0px, rgba(0, 0, 0, 0.03) 0px 16px 6px 0px, rgba(0, 0, 0, 0) 0px 24px 7px 0px",
                  color: "white"
                }}
              >
                <WhatsAppIcon size={20} />
                <span className="font-bold">Talk to August Now</span>
              </a>
            </div>

            {/* Secondary CTA / Download Button Section - Split Layout */}
            <div 
              className="animate-fade-up w-full flex flex-col items-center"
              style={{ animationDelay: '0.45s' }}
            >
              {/* Desktop: General Download Button + Dual Ratings */}
              <div className="hidden sm:flex flex-col items-center w-full max-w-[300px]">
                <a 
                  href="https://join.meetaugust.ai/?c=izAwfK"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("download_click", { button_name: "hero_section_desktop_store" })}
                  className="w-full py-3 px-6 rounded-pill text-center text-base font-semibold text-[#1a7a5a] border border-[#1a7a5a] bg-white flex items-center justify-center gap-2 transition-colors hover:bg-[rgba(26,122,90,0.05)] no-underline"
                  style={{
                    fontFamily: 'var(--font-manrope), sans-serif',
                  }}
                >
                  Or, Download the App
                </a>
                
                {/* Rating (Desktop) */}
                <div className="flex items-center gap-1.5 mt-3 text-[#4b5563] opacity-70">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#a3a3a3">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                    4.6 star rating
                  </span>
                </div>
              </div>

              {/* Mobile: OS-specific Button + OS-specific Rating */}
              <div className="sm:hidden flex flex-col items-center w-full max-w-[85%] min-[375px]:max-w-[300px]">
                {os === "android" ? (
                  <a 
                    href="https://join.meetaugust.ai/?c=landing_page_hero_android"
                    onClick={() => track("download_click", { button_name: "hero_section_android" })}
                    className="w-full py-2.5 min-[375px]:py-3 px-4 min-[375px]:px-6 rounded-pill text-center text-sm min-[375px]:text-base font-semibold text-[#1a7a5a] border border-[#1a7a5a] bg-white flex items-center justify-center gap-2 transition-colors hover:bg-[rgba(26,122,90,0.05)] no-underline"
                    style={{
                      fontFamily: 'var(--font-manrope), sans-serif',
                    }}
                  >
                    <GooglePlayLogoIcon size={18} />
                    Download from Play Store
                  </a>
                ) : (
                  <a 
                    href="https://join.meetaugust.ai/?c=landing_page_hero_ios"
                    onClick={() => track("download_click", { button_name: "hero_section_ios" })}
                    className="w-full py-2.5 min-[375px]:py-3 px-4 min-[375px]:px-6 rounded-pill text-center text-sm min-[375px]:text-base font-semibold text-[#1a7a5a] border border-[#1a7a5a] bg-white flex items-center justify-center gap-2 transition-colors hover:bg-[rgba(26,122,90,0.05)] no-underline"
                    style={{
                      fontFamily: 'var(--font-manrope), sans-serif',
                    }}
                  >
                    <AppleLogoIcon size={18} />
                    Download from App Store
                  </a>
                )}
                
                {/* Rating (Mobile) */}
                <div 
                  className="animate-fade-up flex items-center gap-1.5 mt-3 opacity-70"
                  style={{ animationDelay: '0.5s' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#a3a3a3">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-[13px] font-medium text-[#4b5563]" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                    {os === "ios" ? "4.5 star rating" : os === "android" ? "4.7 star rating" : "4.6 star rating"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Original UI for Other Variants */
          <>
            {/* Badge */}
            <a
              href="#usmle"
              onClick={() => track("hero_subtitle_click", { 
                subtitle_copy: "#1 Health AI in the World" 
              })}
              className="mb-[10px] sm:mb-[12px] mt-2 sm:mt-0.5 text-sm sm:text-base"
              style={{
                boxSizing: "border-box",
                width: "176px",
                height: "min-content",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                padding: "12px 14px",
                gap: "4px",
                backgroundColor: "#f7f7f7",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: 500,
                lineHeight: "16px",
                fontFamily: 'var(--font-manrope), sans-serif'
              }}
            >
              <span className="text-dark">100% </span>

              <span className="text-dark"> USMLE Score</span>
            </a>

            {/* Main Heading */}
            <h1
              className="mb-4 flex flex-col items-center" 
              style={{ 
                fontFamily: 'var(--font-manrope), sans-serif',
                color: '#206e55',
                textAlign: 'center'
              }}
            >
              <span 
                className="block text-[32px] sm:text-[60px] leading-[40px] sm:leading-[64px] whitespace-pre"
                style={{ fontWeight: 300 }}
              >
                Health Companion
                {/* {HERO_HEADINGS[variant]} */}
              </span>
              <span 
                className="block text-[32px] sm:text-[60px] leading-[40px] sm:leading-[64px] whitespace-pre -mt-[3px] sm:-mt-[7px]"
                style={{
                  fontWeight: 300,
                  backgroundImage: 'linear-gradient(90deg, rgb(32, 110, 85) 0%, rgb(45, 155, 119) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                trusted by
              </span>
              <span className="relative inline-block">
                <span 
                  className="block text-[32px] sm:text-[60px] leading-[40px] sm:leading-[64px] cursor-pointer"
                  style={{
                    fontWeight: 500,
                    backgroundImage: 'linear-gradient(90deg, rgb(32, 110, 85) 0%, rgb(45, 155, 119) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {users.toLocaleString()} <span style={{ fontWeight: 300, opacity: 1 }}>people</span>
                </span>
                {/* Sparkle: absolute so it never affects text flow */}
                <span className="absolute -top-8 -right-10 rotate-[10deg] pointer-events-none scale-75 sm:scale-100 origin-center">
                  <SparklesIcon />
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-dark mb-6 sm:mb-8">
              Talk to August for clear guidance
              <br />
              on symptoms, medications, and lab reports.
            </p>

            {/* Search Box / Store Buttons */}
            <div className="w-full max-w-[328px] sm:max-w-[737px] mb-9 sm:mb-3">
              {/* Desktop */}
              <div className="hidden sm:block">
                <ChatInput />
              </div>

              {/* Mobile */}
              <div className="sm:hidden">
                <ChatInput isMobile />

                {/* Or, download the app */}
                <div className="flex items-center justify-center w-full mt-[8px] mb-[8px]">
                  <div className="flex items-center justify-center w-full max-w-[245px] gap-[10px] px-0">
                    <div className="flex-1 h-[0.5px] bg-[#767F7C] opacity-40"></div>
                    <p 
                      style={{
                        fontFamily: 'var(--font-manrope), sans-serif',
                        fontWeight: 400,
                        fontSize: "11px",
                        lineHeight: "24px",
                        color: "#767F7C",
                      }}
                      className="whitespace-nowrap text-center flex-shrink-0"
                    >
                      Or, download the app
                    </p>
                    <div className="flex-1 h-[0.5px] bg-[#767F7C] opacity-40"></div>
                  </div>
                </div>

                {/* Conditional Store Button */}
                <div className="flex flex-col items-center">
                  {os === "android" ? (
                    <AndroidStoreButton href="https://join.meetaugust.ai/?c=landing_page_hero_android_global" />
                  ) : os === "ios" ? (
                    <IOSStoreButton href="https://join.meetaugust.ai/?c=landing_page_hero_ios_global" />
                  ) : (
                    <>
                      <div className="mb-2">
                        <AndroidStoreButton href="https://join.meetaugust.ai/?c=landing_page_hero_android_global" />
                      </div>
                      <IOSStoreButton href="https://join.meetaugust.ai/?c=landing_page_hero_ios_global" />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 sm:gap-10 mb-4 sm:mb-6">
              <span 
                className="flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap text-sm sm:text-base text-dark"
                style={{ 
                  fontFamily: 'var(--font-manrope), sans-serif',
                  lineHeight: "16px",
                  fontWeight: 400
                }}
              >
                <span className="shrink-0"><ShieldIcon /></span>
                HIPAA Secure
              </span>
              <span 
                className="flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap text-sm sm:text-base text-dark"
                style={{ 
                  fontFamily: 'var(--font-manrope), sans-serif',
                  lineHeight: "16px",
                  fontWeight: 400
                }}
              >
                <span className="shrink-0"><DoctorIcon /></span>
                Built by Doctors
              </span>
              <span 
                className="flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap text-sm sm:text-base text-dark"
                style={{ 
                  fontFamily: 'var(--font-manrope), sans-serif',
                  lineHeight: "16px",
                  fontWeight: 400
                }}
              >
                <span className="shrink-0"><HeartIcon /></span>
                HIPAA Compliant
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export const Hero = HeroBase;

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 18.333C4.542 18.333 4.149 18.17 3.823 17.844C3.497 17.517 3.333 17.125 3.333 16.667L3.333 8.333C3.333 7.875 3.497 7.483 3.823 7.156C4.149 6.83 4.542 6.667 5 6.667L5.833 6.667L5.833 5C5.833 3.847 6.24 2.865 7.052 2.052C7.865 1.24 8.847 0.833 10 0.833C11.153 0.833 12.135 1.24 12.948 2.052C13.76 2.865 14.167 3.847 14.167 5L14.167 6.667L15 6.667C15.458 6.667 15.851 6.83 16.177 7.156C16.503 7.483 16.667 7.875 16.667 8.333L16.667 16.667C16.667 17.125 16.503 17.517 16.177 17.844C15.851 18.17 15.458 18.333 15 18.333ZM5 16.667L15 16.667L15 8.333L5 8.333ZM10 14.167C10.458 14.167 10.851 14.004 11.177 13.677C11.503 13.351 11.667 12.958 11.667 12.5C11.667 12.042 11.503 11.649 11.177 11.323C10.851 10.997 10.458 10.833 10 10.833C9.542 10.833 9.149 10.997 8.823 11.323C8.496 11.649 8.333 12.042 8.333 12.5C8.333 12.958 8.496 13.351 8.823 13.677C9.149 14.004 9.542 14.167 10 14.167ZM7.5 6.667L12.5 6.667L12.5 5C12.5 4.306 12.257 3.715 11.771 3.229C11.285 2.743 10.694 2.5 10 2.5C9.306 2.5 8.715 2.743 8.229 3.229C7.743 3.715 7.5 4.306 7.5 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DoctorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M11.25 18.333C9.75 18.333 8.472 17.806 7.417 16.75C6.361 15.694 5.833 14.417 5.833 12.917L5.833 12.437C4.639 12.243 3.646 11.684 2.854 10.76C2.062 9.837 1.667 8.75 1.667 7.5L1.667 2.5L4.167 2.5L4.167 1.667L5.833 1.667L5.833 5L4.167 5L4.167 4.167L3.333 4.167L3.333 7.5C3.333 8.417 3.66 9.201 4.312 9.854C4.965 10.507 5.75 10.833 6.667 10.833C7.583 10.833 8.368 10.507 9.021 9.854C9.674 9.201 10 8.417 10 7.5L10 4.167L9.167 4.167L9.167 5L7.5 5L7.5 1.667L9.167 1.667L9.167 2.5L11.667 2.5L11.667 7.5C11.667 8.75 11.271 9.837 10.479 10.76C9.687 11.684 8.694 12.243 7.5 12.437L7.5 12.917C7.5 13.958 7.865 14.844 8.594 15.573C9.323 16.302 10.208 16.667 11.25 16.667C12.292 16.667 13.177 16.302 13.906 15.573C14.635 14.844 15 13.958 15 12.917L15 11.521C14.514 11.354 14.115 11.056 13.802 10.625C13.49 10.194 13.333 9.708 13.333 9.167C13.333 8.472 13.576 7.882 14.062 7.396C14.549 6.91 15.139 6.667 15.833 6.667C16.528 6.667 17.118 6.91 17.604 7.396C18.09 7.882 18.333 8.472 18.333 9.167C18.333 9.708 18.177 10.194 17.865 10.625C17.552 11.056 17.153 11.354 16.667 11.521L16.667 12.917C16.667 14.417 16.139 15.694 15.083 16.75C14.028 17.806 12.75 18.333 11.25 18.333ZM15.833 10C16.069 10 16.267 9.92 16.427 9.76C16.587 9.601 16.667 9.403 16.667 9.167C16.667 8.931 16.587 8.733 16.427 8.573C16.267 8.413 16.069 8.333 15.833 8.333C15.597 8.333 15.399 8.413 15.24 8.573C15.08 8.733 15 8.931 15 9.167C15 9.403 15.08 9.601 15.24 9.76C15.399 9.92 15.597 10 15.833 10Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 14.583C10.736 14.583 11.434 14.424 12.094 14.104C12.753 13.785 13.285 13.319 13.687 12.708C13.84 12.472 13.861 12.24 13.75 12.01C13.639 11.781 13.458 11.667 13.208 11.667C13.097 11.667 12.996 11.691 12.906 11.74C12.816 11.788 12.743 11.861 12.687 11.958C12.368 12.389 11.972 12.726 11.5 12.969C11.028 13.212 10.528 13.333 10 13.333C9.472 13.333 8.972 13.212 8.5 12.969C8.028 12.726 7.632 12.389 7.312 11.958C7.243 11.861 7.163 11.788 7.073 11.74C6.983 11.691 6.882 11.667 6.771 11.667C6.521 11.667 6.34 11.778 6.229 12C6.118 12.222 6.139 12.444 6.292 12.667C6.694 13.292 7.226 13.767 7.885 14.094C8.545 14.42 9.25 14.583 10 14.583ZM12.917 9.167C13.264 9.167 13.559 9.045 13.802 8.802C14.045 8.559 14.167 8.264 14.167 7.917C14.167 7.569 14.045 7.274 13.802 7.031C13.559 6.788 13.264 6.667 12.917 6.667C12.569 6.667 12.274 6.788 12.031 7.031C11.788 7.274 11.667 7.569 11.667 7.917C11.667 8.264 11.788 8.559 12.031 8.802C12.274 9.045 12.569 9.167 12.917 9.167ZM7.083 9.167C7.431 9.167 7.726 9.045 7.969 8.802C8.212 8.559 8.333 8.264 8.333 7.917C8.333 7.569 8.212 7.274 7.969 7.031C7.726 6.788 7.431 6.667 7.083 6.667C6.736 6.667 6.441 6.788 6.198 7.031C5.955 7.274 5.833 7.569 5.833 7.917C5.833 8.264 5.955 8.559 6.198 8.802C6.441 9.045 6.736 9.167 7.083 9.167ZM10 18.333C8.847 18.333 7.764 18.115 6.75 17.677C5.736 17.24 4.854 16.646 4.104 15.896C3.354 15.146 2.76 14.264 2.323 13.25C1.885 12.236 1.667 11.153 1.667 10C1.667 8.847 1.885 7.764 2.323 6.75C2.76 5.736 3.354 4.854 4.104 4.104C4.854 3.354 5.736 2.76 6.75 2.323C7.764 1.885 8.847 1.667 10 1.667C11.153 1.667 12.236 1.885 13.25 2.323C14.264 2.76 15.146 3.354 15.896 4.104C16.646 4.854 17.24 5.736 17.677 6.75C18.115 7.764 18.333 8.847 18.333 10C18.333 11.153 18.115 12.236 17.677 13.25C17.24 14.264 16.646 15.146 15.896 15.896C15.146 16.646 14.264 17.24 13.25 17.677C12.236 18.115 11.153 18.333 10 18.333ZM10 16.667C11.861 16.667 13.437 16.021 14.729 14.729C16.021 13.437 16.667 11.861 16.667 10C16.667 8.139 16.021 6.562 14.729 5.271C13.437 3.979 11.861 3.333 10 3.333C8.139 3.333 6.562 3.979 5.271 5.271C3.979 6.562 3.333 8.139 3.333 10C3.333 11.861 3.979 13.437 5.271 14.729C6.562 16.021 8.139 16.667 10 16.667Z"
        fill="currentColor"
      />
    </svg>
  );
}


function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="-1 -1 22 22" fill="none">
      <path
        d="M10 5.75V10L12.75 12.75M19.25 10C19.25 15.1086 15.1086 19.25 10 19.25C4.89137 19.25 0.75 15.1086 0.75 10C0.75 4.89137 4.89137 0.75 10 0.75C15.1086 0.75 19.25 4.89137 19.25 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FreeCostIcon() {
  return (
    <svg width="18" height="18" viewBox="-1 -1 23 23" fill="none">
      <path
        d="M4.75 19.2122H6.89621C6.89621 19.2122 9.34615 20.1593 10.9937 20.2378C14.6264 20.411 17.5121 18.7189 19.8494 16.1452C20.3831 15.5574 20.3741 14.6701 19.8785 14.0498C19.2396 13.2501 18.0386 13.1853 17.2375 13.822C16.3548 14.5234 15.1831 15.3124 14.0668 15.6223C12.5248 16.0503 10.9937 16.1351 10.9937 16.1351C19.1886 15.6223 16.0181 10 4.75 13M12.0553 2.88943C11.6015 1.64139 10.4049 0.75 9 0.75C7.20507 0.75 5.75 2.20507 5.75 4C5.75 5.79493 7.20507 7.25 9 7.25C9.32857 7.25 9.64574 7.20124 9.94469 7.11057M12.0553 2.88943C10.7211 3.2941 9.75 4.53364 9.75 6C9.75 6.39005 9.81871 6.76406 9.94469 7.11057M12.0553 2.88943C12.3543 2.79876 12.6714 2.75 13 2.75C14.7949 2.75 16.25 4.20507 16.25 6C16.25 7.79493 14.7949 9.25 13 9.25C11.5951 9.25 10.3984 8.35861 9.94469 7.11057M2.75 20.25C1.64543 20.25 0.75 19.3546 0.75 18.25V13.75C0.75 12.6454 1.64543 11.75 2.75 11.75C3.85457 11.75 4.75 12.6454 4.75 13.75V18.25C4.75 19.3546 3.85457 20.25 2.75 20.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}



function AndroidStoreButton({ href, width, height }: { href: string; width?: string; height?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("download_click", { 
        button_name: "hero_section_android" 
      })}
      className="hover:opacity-80 transition-opacity shrink-0 flex items-center justify-center w-[180px] sm:w-[200px]"
    >
      <svg width="100%" style={{ height: "auto" }} viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="135" height="40" rx="6" fill="#a6a6a6" />
        <rect x="0.5" y="0.5" width="134" height="39" rx="5.5" fill="white" />
        
        <g transform="translate(10, 9) scale(1.1)">
          <path d="M1.22 0.272C0.948 0.56 0.792 1.004 0.792 1.58V20.42C0.792 20.996 0.948 21.44 1.22 21.728L1.296 21.8L11.848 11.248V11.001V10.753L1.296 0.201L1.22 0.272Z" fill="#4285F4" />
          <path d="M15.368 14.768L11.848 11.248V11.001V10.753L15.372 7.233L15.46 7.284L19.588 9.629C20.764 10.297 20.764 11.401 19.588 12.073L15.46 14.717L15.368 14.768Z" fill="#FBBC04" />
          <path d="M15.46 14.717L11.848 11.101L1.22 21.728C1.62 22.157 2.276 22.209 3.016 21.789L15.46 14.717Z" fill="#EA4335" />
          <path d="M15.46 7.284L3.016 0.213C2.276 -0.155 1.62 -0.155 1.22 0.273L11.848 10.901L15.46 7.284Z" fill="#34A853" />
        </g>
        <text x="38" y="15" fill="black" style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '7px', fontWeight: 700, letterSpacing: '0.2px' }}>GET IT ON</text>
        <text x="38" y="30" fill="black" style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '15px', fontWeight: 600 }}>Google Play</text>
      </svg>
    </a>
  );
}

function IOSStoreButton({href,width,height}: {href: string,width?: string,height?: string}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("download_click", { 
        button_name: "hero_section_ios" 
      })}
      className="hover:opacity-80 transition-opacity shrink-0 flex items-center justify-center w-[180px] sm:w-[200px]"
    >
      <svg width="100%" style={{ height: "auto" }} viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="135" height="40" rx="6" fill="#a6a6a6" />
        <rect x="0.5" y="0.5" width="134" height="39" rx="5.5" fill="white" />
        
        <g transform="translate(10, 8) scale(0.14)">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.92.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.76-14.04-5.04-7.08-9.19-15.29-12.44-24.65-3.49-10.15-5.23-19.97-5.23-29.45 0-10.87 2.35-20.24 7.06-28.06 3.69-6.31 8.6-11.3 14.75-14.95 6.15-3.65 12.8-5.51 19.97-5.72 3.91 0 9.05 1.21 15.43 3.59 6.36 2.39 10.45 3.6 12.24 3.6 1.34 0 5.87-1.42 13.56-4.22 7.27-2.6 13.41-3.67 18.45-3.24 13.63 1.1 23.87 6.47 30.68 16.15-12.19 7.39-18.22 17.73-18.1 31 .11 10.34 3.86 18.94 11.23 25.77 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.1-2.96 15.67-8.86 22.67-7.12 8.32-15.73 13.13-25.07 12.37-.12-.97-.18-1.99-.18-3.07 0-7.77 3.38-16.09 9.39-22.89 3-3.44 6.82-6.31 11.45-8.6 4.62-2.26 8.99-3.51 13.1-3.72.12 1.1.17 2.2.17 3.24z" fill="black" />
        </g>
        <text x="38" y="15" fill="black" style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '7px', fontWeight: 700, letterSpacing: '0.2px' }}>Download on the</text>
        <text x="38" y="30" fill="black" style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '15px', fontWeight: 600 }}>App Store</text>
      </svg>
    </a>
  );
}

function SparklesIcon() {
  return (
  <svg width="42" className='rotate-[-22deg]' height="57" viewBox="0 0 30 41" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.5602 13.431C17.5402 13.4806 17.5206 13.5288 17.5012 13.5757C17.4818 13.6226 17.4627 13.6682 17.4438 13.7125C17.4249 13.7568 17.4063 13.7998 17.3878 13.8416C17.3694 13.8834 17.351 13.9239 17.3329 13.9631C17.3147 14.0024 17.2966 14.0404 17.2787 14.0774C17.2607 14.1143 17.2429 14.15 17.225 14.1845C17.2071 14.2191 17.1892 14.2525 17.1712 14.2849C17.1532 14.3172 17.1353 14.3484 17.1172 14.3785C17.0992 14.4087 17.081 14.4377 17.0627 14.4657C17.0443 14.4937 17.0259 14.5207 17.0073 14.5466C16.9886 14.5725 16.9697 14.5975 16.9506 14.6216C16.9315 14.6455 16.9121 14.6686 16.8925 14.6907C16.8728 14.7128 16.8528 14.7339 16.8325 14.7542C16.8121 14.7745 16.7915 14.7938 16.7703 14.8123C16.7492 14.8308 16.7276 14.8485 16.7056 14.8653C16.6836 14.882 16.6611 14.8981 16.6381 14.9133C16.6151 14.9285 16.5916 14.9429 16.5674 14.9566C16.5433 14.9702 16.5186 14.9831 16.4934 14.9954C16.4682 15.0076 16.4422 15.019 16.4156 15.0298C16.389 15.0406 16.3616 15.0507 16.3336 15.0601C16.3056 15.0696 16.2768 15.0784 16.2472 15.0866C16.2177 15.0947 16.1873 15.1023 16.1561 15.1093C16.1249 15.1163 16.0928 15.1227 16.0599 15.1286C16.027 15.1345 15.9931 15.1397 15.9584 15.1446C15.9235 15.1494 15.8879 15.1537 15.8511 15.1576C15.8143 15.1614 15.7765 15.1649 15.7377 15.1677C15.6989 15.1706 15.659 15.1731 15.618 15.1753C15.577 15.1774 15.5349 15.1791 15.4917 15.1803C15.4484 15.1816 15.4039 15.1826 15.3583 15.1832C15.3126 15.1838 15.2657 15.1842 15.2176 15.1842C15.1694 15.1842 15.12 15.1839 15.0692 15.1834C15.0185 15.1828 14.9664 15.182 14.913 15.1811C14.9626 15.2011 15.0107 15.2207 15.0576 15.2401C15.1046 15.2595 15.1501 15.2786 15.1945 15.2975C15.2388 15.3164 15.2817 15.335 15.3235 15.3535C15.3653 15.3719 15.4058 15.3903 15.4451 15.4084C15.4844 15.4266 15.5225 15.4447 15.5594 15.4626C15.5963 15.4806 15.6319 15.4985 15.6665 15.5164C15.7011 15.5343 15.7345 15.5522 15.7669 15.5701C15.7992 15.588 15.8304 15.606 15.8605 15.6241C15.8906 15.6421 15.9197 15.6603 15.9477 15.6786C15.9757 15.697 16.0027 15.7154 16.0286 15.7341C16.0546 15.7527 16.0795 15.7716 16.1036 15.7907C16.1276 15.8098 16.1506 15.8292 16.1727 15.8489C16.1948 15.8685 16.216 15.8885 16.2362 15.9089C16.2565 15.9292 16.2758 15.9499 16.2943 15.971C16.3128 15.9922 16.3305 16.0137 16.3473 16.0357C16.3641 16.0578 16.3801 16.0802 16.3953 16.1032C16.4105 16.1262 16.4249 16.1498 16.4386 16.1739C16.4523 16.198 16.4651 16.2227 16.4774 16.2479C16.4895 16.2732 16.5011 16.2991 16.5118 16.3257C16.5226 16.3523 16.5327 16.3797 16.5422 16.4077C16.5516 16.4357 16.5604 16.4645 16.5686 16.4941C16.5768 16.5236 16.5843 16.554 16.5913 16.5852C16.5983 16.6164 16.6047 16.6485 16.6106 16.6814C16.6165 16.7143 16.6218 16.7482 16.6266 16.783C16.6314 16.8178 16.6357 16.8534 16.6396 16.8903C16.6434 16.927 16.6469 16.9648 16.6498 17.0036C16.6527 17.0425 16.6553 17.0823 16.6573 17.1233C16.6594 17.1643 16.6611 17.2064 16.6624 17.2497C16.6637 17.293 16.6647 17.3374 16.6653 17.383C16.6659 17.4286 16.6662 17.4755 16.6662 17.5236C16.6662 17.5718 16.666 17.6212 16.6654 17.672C16.6649 17.7228 16.6641 17.7748 16.6631 17.8283C16.6831 17.7787 16.7028 17.7305 16.7222 17.6836C16.7416 17.6367 16.7607 17.5911 16.7795 17.5468C16.7984 17.5024 16.8171 17.4595 16.8355 17.4177C16.854 17.3759 16.8723 17.3354 16.8904 17.2962C16.9085 17.257 16.9267 17.2188 16.9446 17.1819C16.9625 17.145 16.9806 17.1093 16.9985 17.0748C17.0164 17.0402 17.0342 17.0068 17.0522 16.9744C17.0701 16.9422 17.0881 16.911 17.1062 16.8808C17.1242 16.8507 17.1424 16.8216 17.1608 16.7936C17.1791 16.7657 17.1975 16.7386 17.2162 16.7127C17.2348 16.6868 17.2537 16.6618 17.2728 16.6378C17.2919 16.6138 17.3113 16.5907 17.331 16.5686C17.3506 16.5465 17.3707 16.5254 17.391 16.5051C17.4113 16.4848 17.432 16.4655 17.4531 16.447C17.4742 16.4285 17.4958 16.4109 17.5178 16.3941C17.5399 16.3772 17.5623 16.3612 17.5853 16.346C17.6084 16.3308 17.6319 16.3164 17.656 16.3027C17.6801 16.2891 17.7048 16.2762 17.73 16.2639C17.7552 16.2517 17.7812 16.2403 17.8078 16.2295C17.8344 16.2188 17.8618 16.2086 17.8898 16.1992C17.9178 16.1897 17.9466 16.1809 17.9762 16.1728C18.0057 16.1646 18.0361 16.157 18.0673 16.15C18.0985 16.143 18.1306 16.1366 18.1635 16.1307C18.1964 16.1248 18.2303 16.1196 18.2651 16.1147C18.2998 16.1099 18.3356 16.1056 18.3724 16.1017C18.4092 16.0979 18.4469 16.0945 18.4856 16.0916C18.5244 16.0888 18.5643 16.0861 18.6053 16.084C18.6463 16.0819 18.6884 16.0802 18.7317 16.079C18.775 16.0777 18.8194 16.0766 18.865 16.076C18.9107 16.0754 18.9575 16.0751 19.0057 16.0751C19.0538 16.0751 19.1033 16.0754 19.154 16.0759C19.2048 16.0764 19.2568 16.0772 19.3103 16.0782C19.2607 16.0582 19.2125 16.0385 19.1656 16.0191C19.1187 15.9998 19.0731 15.9806 19.0288 15.9618C18.9845 15.9429 18.9415 15.9242 18.8997 15.9058C18.8579 15.8874 18.8174 15.869 18.7782 15.8509C18.7389 15.8327 18.7009 15.8146 18.6639 15.7967C18.627 15.7788 18.5913 15.7608 18.5568 15.7429C18.5222 15.7249 18.4888 15.7071 18.4565 15.6892C18.4242 15.6713 18.3931 15.6533 18.3629 15.6352C18.3327 15.6172 18.3037 15.599 18.2757 15.5807C18.2478 15.5623 18.2207 15.5439 18.1948 15.5252C18.1689 15.5066 18.1439 15.4877 18.1198 15.4686C18.0959 15.4495 18.0728 15.4301 18.0507 15.4105C18.0286 15.3908 18.0074 15.3709 17.9872 15.3505C17.9669 15.3301 17.9476 15.3095 17.9291 15.2883C17.9106 15.2671 17.8929 15.2456 17.8761 15.2236C17.8593 15.2016 17.8433 15.1791 17.8281 15.1561C17.8129 15.1331 17.7985 15.1096 17.7848 15.0854C17.7712 15.0613 17.7583 15.0367 17.746 15.0114C17.7339 14.9861 17.7224 14.9602 17.7116 14.9336C17.7009 14.907 17.6907 14.8796 17.6813 14.8516C17.6718 14.8236 17.663 14.7948 17.6549 14.7652C17.6467 14.7357 17.6391 14.7053 17.6321 14.6741C17.6251 14.6429 17.6187 14.6108 17.6128 14.5779C17.6069 14.545 17.6017 14.5111 17.5968 14.4764C17.592 14.4416 17.5877 14.4059 17.5838 14.369C17.58 14.3323 17.5766 14.2945 17.5736 14.2557C17.5707 14.2168 17.5682 14.177 17.5661 14.136C17.564 14.095 17.5622 14.0529 17.561 14.0096C17.5597 13.9664 17.5587 13.9219 17.5581 13.8763C17.5575 13.8307 17.5571 13.7838 17.5571 13.7356C17.5571 13.6875 17.5574 13.6381 17.5579 13.5873C17.5585 13.5365 17.5592 13.4845 17.5602 13.431Z" fill="#BAD2CA"/>
<path d="M22.4365 18.2598C22.3947 18.3634 22.3537 18.4641 22.3132 18.562C22.2727 18.66 22.2328 18.7552 22.1935 18.8477C22.1541 18.9402 22.1151 19.03 22.0766 19.1171C22.038 19.2043 21.9998 19.2889 21.9619 19.3709C21.9239 19.453 21.8862 19.5325 21.8486 19.6095C21.811 19.6866 21.7737 19.7611 21.7363 19.8333C21.6989 19.9055 21.6616 19.9753 21.6241 20.0428C21.5866 20.1102 21.5491 20.1753 21.5114 20.2383C21.4737 20.3012 21.4358 20.3618 21.3976 20.4203C21.3594 20.4789 21.3208 20.5352 21.2819 20.5894C21.243 20.6437 21.2036 20.6958 21.1636 20.7459C21.1238 20.796 21.0833 20.8441 21.0422 20.8902C21.0012 20.9364 20.9595 20.9805 20.917 21.0229C20.8745 21.0652 20.8312 21.1057 20.7872 21.1443C20.7431 21.1829 20.6982 21.2198 20.6522 21.2549C20.6062 21.29 20.5594 21.3234 20.5114 21.3551C20.4634 21.3869 20.4142 21.417 20.364 21.4454C20.3136 21.474 20.2621 21.5009 20.2093 21.5263C20.1565 21.5517 20.1024 21.5757 20.0468 21.5982C19.9912 21.6207 19.9342 21.6417 19.8757 21.6615C19.8172 21.6813 19.7571 21.6996 19.6954 21.7166C19.6336 21.7337 19.5702 21.7496 19.5051 21.7641C19.4399 21.7787 19.373 21.7921 19.3042 21.8043C19.2354 21.8166 19.1647 21.8277 19.0921 21.8378C19.0194 21.8478 18.9448 21.8568 18.8681 21.8648C18.7913 21.8728 18.7125 21.8798 18.6314 21.8859C18.5504 21.892 18.4671 21.8972 18.3815 21.9016C18.2959 21.906 18.208 21.9095 18.1176 21.9123C18.0273 21.9151 17.9345 21.9171 17.8392 21.9184C17.7439 21.9198 17.6459 21.9204 17.5454 21.9204C17.4448 21.9204 17.3416 21.9198 17.2357 21.9187C17.1297 21.9176 17.0209 21.9158 16.9093 21.9137C17.0128 21.9555 17.1136 21.9966 17.2115 22.037C17.3095 22.0775 17.4046 22.1174 17.4971 22.1568C17.5896 22.1962 17.6794 22.2351 17.7667 22.2737C17.8539 22.3122 17.9385 22.3504 18.0205 22.3884C18.1025 22.4264 18.182 22.464 18.2591 22.5016C18.3362 22.5392 18.4107 22.5766 18.4829 22.614C18.5551 22.6513 18.6249 22.6887 18.6923 22.7262C18.7598 22.7636 18.8249 22.8011 18.8878 22.8388C18.9508 22.8765 19.0114 22.9145 19.0699 22.9527C19.1284 22.9909 19.1847 23.0294 19.239 23.0684C19.2932 23.1073 19.3453 23.1466 19.3955 23.1865C19.4456 23.2264 19.4937 23.2669 19.5398 23.3079C19.5859 23.349 19.6301 23.3907 19.6724 23.4332C19.7147 23.4757 19.7552 23.5189 19.7938 23.563C19.8324 23.607 19.8693 23.652 19.9044 23.6979C19.9395 23.7439 19.9729 23.7908 20.0046 23.8388C20.0364 23.8868 20.0665 23.9359 20.0949 23.9862C20.1235 24.0365 20.1504 24.088 20.1758 24.1408C20.2012 24.1936 20.2252 24.2478 20.2477 24.3033C20.2702 24.3589 20.2912 24.416 20.311 24.4744C20.3308 24.5329 20.3491 24.593 20.3661 24.6548C20.3832 24.7165 20.399 24.7799 20.4136 24.8451C20.4282 24.9102 20.4416 24.9771 20.4538 25.0459C20.4661 25.1147 20.4772 25.1854 20.4872 25.2581C20.4973 25.3307 20.5063 25.4053 20.5143 25.4821C20.5223 25.5588 20.5293 25.6377 20.5355 25.7187C20.5416 25.7997 20.5468 25.883 20.5512 25.9687C20.5555 26.0543 20.5591 26.1422 20.5619 26.2325C20.5647 26.3229 20.5667 26.4157 20.568 26.511C20.5694 26.6063 20.5699 26.7042 20.57 26.8048C20.5701 26.9054 20.5694 27.0086 20.5683 27.1145C20.5671 27.2205 20.5654 27.3292 20.5633 27.4408C20.6051 27.3373 20.6462 27.2365 20.6866 27.1386C20.7271 27.0407 20.767 26.9455 20.8063 26.853C20.8457 26.7605 20.8847 26.6707 20.9233 26.5835C20.9618 26.4963 21 26.4117 21.038 26.3297C21.076 26.2476 21.1136 26.1681 21.1512 26.0911C21.1887 26.014 21.2262 25.9395 21.2635 25.8673C21.3009 25.7951 21.3382 25.7253 21.3758 25.6578C21.4132 25.5904 21.4507 25.5252 21.4884 25.4623C21.5261 25.3994 21.564 25.3388 21.6023 25.2803C21.6405 25.2217 21.679 25.1654 21.7179 25.1112C21.7569 25.0569 21.7962 25.0048 21.8362 24.9547C21.8761 24.9046 21.9165 24.8565 21.9576 24.8104C21.9986 24.7642 22.0403 24.7201 22.0828 24.6778C22.1253 24.6355 22.1686 24.595 22.2126 24.5564C22.2567 24.5178 22.3017 24.4809 22.3476 24.4458C22.3936 24.4106 22.4404 24.3773 22.4884 24.3455C22.5364 24.3138 22.5856 24.2837 22.6358 24.2552C22.6862 24.2267 22.7377 24.1998 22.7905 24.1744C22.8433 24.1489 22.8975 24.125 22.953 24.1025C23.0086 24.08 23.0656 24.059 23.1241 24.0392C23.1826 24.0194 23.2427 24.0011 23.3044 23.9841C23.3662 23.967 23.4296 23.9512 23.4947 23.9366C23.5599 23.9221 23.6268 23.9087 23.6956 23.8964C23.7644 23.8842 23.835 23.8731 23.9077 23.863C23.9804 23.853 24.055 23.844 24.1317 23.836C24.2085 23.828 24.2873 23.8209 24.3684 23.8147C24.4494 23.8086 24.5327 23.8035 24.6183 23.7991C24.7039 23.7947 24.7918 23.7912 24.8822 23.7884C24.9725 23.7856 25.0654 23.7836 25.1607 23.7822C25.2559 23.7809 25.3539 23.7803 25.4544 23.7802C25.5549 23.7803 25.6581 23.7809 25.7641 23.782C25.87 23.7831 25.9788 23.7848 26.0904 23.7869C25.9869 23.7451 25.8861 23.7041 25.7882 23.6636C25.6903 23.6232 25.5951 23.5833 25.5026 23.5439C25.4101 23.5045 25.3203 23.4656 25.2331 23.427C25.146 23.3885 25.0614 23.3503 24.9793 23.3123C24.8973 23.2743 24.8178 23.2367 24.7407 23.1991C24.6637 23.1616 24.5892 23.1241 24.5169 23.0867C24.4447 23.0494 24.3749 23.012 24.3075 22.9746C24.24 22.9372 24.1749 22.8997 24.112 22.8619C24.049 22.8242 23.9884 22.7863 23.9299 22.7481C23.8714 22.7099 23.8151 22.6714 23.7608 22.6324C23.7066 22.5935 23.6545 22.5541 23.6043 22.5142C23.5542 22.4743 23.5062 22.4338 23.46 22.3928C23.4139 22.3518 23.3697 22.31 23.3274 22.2675C23.2851 22.225 23.2446 22.1818 23.206 22.1377C23.1674 22.0937 23.1306 22.0487 23.0954 22.0027C23.0603 21.9568 23.0269 21.9099 22.9952 21.8619C22.9634 21.8139 22.9333 21.7648 22.9049 21.7145C22.8763 21.6642 22.8494 21.6127 22.824 21.5599C22.7986 21.5071 22.7747 21.4529 22.7521 21.3973C22.7296 21.3418 22.7086 21.2847 22.6888 21.2262C22.6691 21.1676 22.6508 21.1076 22.6337 21.0458C22.6167 20.9841 22.6008 20.9207 22.5862 20.8555C22.5716 20.7903 22.5582 20.7235 22.546 20.6547C22.5338 20.5858 22.5226 20.5152 22.5126 20.4425C22.5025 20.3699 22.4935 20.2953 22.4855 20.2185C22.4775 20.1418 22.4705 20.0629 22.4643 19.9819C22.4582 19.9009 22.4529 19.8176 22.4486 19.7319C22.4443 19.6463 22.4407 19.5584 22.4379 19.4681C22.4351 19.3777 22.4331 19.2849 22.4318 19.1896C22.4305 19.0943 22.4299 18.9964 22.4298 18.8959C22.4297 18.7953 22.4304 18.6921 22.4315 18.5862C22.4326 18.4802 22.4343 18.3714 22.4365 18.2598Z" fill="#BAD2CA"/>
<path d="M19.0134 2.38024C18.9933 2.42984 18.9737 2.47801 18.9543 2.52493C18.9349 2.57185 18.9158 2.61743 18.8969 2.66175C18.8781 2.70607 18.8594 2.74903 18.8409 2.79081C18.8225 2.8326 18.8041 2.87309 18.786 2.91232C18.7678 2.95163 18.7498 2.98966 18.7319 3.0266C18.7138 3.06351 18.696 3.09925 18.6781 3.13376C18.6602 3.16836 18.6423 3.20175 18.6243 3.23409C18.6063 3.26642 18.5885 3.29757 18.5703 3.32773C18.5523 3.35791 18.5341 3.38694 18.5158 3.4149C18.4975 3.44287 18.479 3.46988 18.4604 3.49581C18.4417 3.52175 18.4229 3.54672 18.4037 3.57078C18.3846 3.59475 18.3652 3.61782 18.3456 3.63991C18.3259 3.66199 18.3059 3.68316 18.2856 3.70343C18.2653 3.72369 18.2446 3.74304 18.2234 3.76154C18.2023 3.78006 18.1808 3.79774 18.1587 3.81447C18.1367 3.83121 18.1143 3.8473 18.0912 3.86252C18.0682 3.87775 18.0447 3.89212 18.0206 3.90581C17.9965 3.91941 17.9718 3.93233 17.9465 3.94458C17.9213 3.95683 17.8953 3.96827 17.8687 3.97902C17.8421 3.98977 17.8148 3.99991 17.7868 4.00935C17.7587 4.01878 17.7299 4.02758 17.7004 4.03577C17.6708 4.04396 17.6405 4.05152 17.6092 4.05851C17.578 4.06553 17.546 4.07189 17.5131 4.07781C17.4801 4.08372 17.4462 4.08895 17.4115 4.09383C17.3767 4.09861 17.341 4.10293 17.3042 4.10683C17.2674 4.11064 17.2297 4.11407 17.1908 4.11691C17.152 4.11983 17.1121 4.12235 17.0711 4.12448C17.0301 4.12658 16.9881 4.12829 16.9448 4.12956C16.9015 4.13083 16.8571 4.13186 16.8114 4.13246C16.7657 4.13306 16.7189 4.13341 16.6707 4.13341C16.6225 4.1334 16.5731 4.13313 16.5223 4.13259C16.4716 4.13206 16.4196 4.13127 16.3661 4.13027C16.4157 4.1503 16.4638 4.16996 16.5108 4.18935C16.5577 4.20874 16.6033 4.22786 16.6476 4.24672C16.6919 4.26558 16.7349 4.28426 16.7767 4.3027C16.8184 4.32114 16.8589 4.33951 16.8983 4.35763C16.9376 4.37585 16.9756 4.39389 17.0125 4.41181C17.0494 4.42981 17.0851 4.44775 17.1197 4.46566C17.1543 4.48357 17.1877 4.50141 17.22 4.51933C17.2524 4.53725 17.2835 4.55519 17.3137 4.57332C17.3437 4.59133 17.3729 4.60953 17.4008 4.62787C17.4288 4.6462 17.4558 4.66462 17.4817 4.68328C17.5077 4.70195 17.5326 4.72079 17.5567 4.73992C17.5807 4.75903 17.6038 4.77841 17.6258 4.79807C17.6479 4.81773 17.6691 4.83776 17.6894 4.85808C17.7096 4.8784 17.729 4.89908 17.7475 4.92025C17.766 4.94142 17.7837 4.9629 17.8004 4.98493C17.8172 5.00697 17.8332 5.02941 17.8485 5.05244C17.8637 5.07546 17.878 5.09897 17.8917 5.12309C17.9054 5.14721 17.9183 5.1719 17.9305 5.19713C17.9427 5.22243 17.9542 5.24835 17.9649 5.27495C17.9757 5.30156 17.9858 5.32889 17.9953 5.3569C18.0047 5.38492 18.0135 5.41375 18.0217 5.44329C18.0299 5.47283 18.0374 5.50317 18.0444 5.53444C18.0515 5.56561 18.0578 5.59769 18.0637 5.6306C18.0696 5.66351 18.0749 5.69741 18.0798 5.73217C18.0845 5.767 18.0889 5.80267 18.0928 5.83947C18.0966 5.87626 18.1 5.914 18.1029 5.95285C18.1058 5.9917 18.1084 6.0315 18.1104 6.0725C18.1125 6.11352 18.1142 6.15559 18.1155 6.19887C18.1168 6.24218 18.1178 6.2866 18.1184 6.33218C18.119 6.37785 18.1194 6.42469 18.1194 6.47285C18.1193 6.52102 18.1191 6.57044 18.1185 6.62121C18.118 6.67198 18.1172 6.72401 18.1162 6.77749C18.1362 6.7279 18.1559 6.67972 18.1753 6.63279C18.1947 6.58587 18.2138 6.54029 18.2327 6.49597C18.2515 6.45165 18.2702 6.4087 18.2886 6.36692C18.3071 6.32513 18.3255 6.28464 18.3436 6.24541C18.3617 6.20617 18.3798 6.16806 18.3977 6.13112C18.4157 6.09419 18.4337 6.0585 18.4516 6.02399C18.4695 5.98939 18.4873 5.95599 18.5053 5.92365C18.5232 5.89139 18.5412 5.86018 18.5593 5.83002C18.5774 5.79993 18.5955 5.77081 18.6139 5.74284C18.6322 5.71488 18.6506 5.68786 18.6693 5.66192C18.688 5.63599 18.7068 5.61103 18.7259 5.58697C18.745 5.563 18.7644 5.53993 18.7841 5.51784C18.8037 5.49576 18.8238 5.47459 18.8441 5.45432C18.8644 5.43406 18.8851 5.41471 18.9063 5.39621C18.9273 5.37769 18.9489 5.3601 18.9709 5.34328C18.993 5.32645 19.0154 5.31045 19.0385 5.29523C19.0615 5.28 19.085 5.26563 19.1091 5.25194C19.1332 5.23834 19.1579 5.22542 19.1831 5.21317C19.2084 5.20092 19.2344 5.18948 19.261 5.17873C19.2876 5.16798 19.3149 5.15784 19.3429 5.1484C19.3709 5.13897 19.3998 5.13017 19.4293 5.12198C19.4588 5.11379 19.4892 5.10623 19.5205 5.09924C19.5516 5.09222 19.5837 5.08586 19.6166 5.07994C19.6495 5.07403 19.6834 5.06878 19.7182 5.0639C19.7529 5.05911 19.7887 5.05482 19.8255 5.05092C19.8623 5.04711 19.9 5.04368 19.9388 5.04083C19.9775 5.03798 20.0174 5.03536 20.0584 5.03325C20.0995 5.03115 20.1415 5.02944 20.1848 5.02817C20.2281 5.0269 20.2725 5.02587 20.3181 5.02525C20.3638 5.02466 20.4106 5.0243 20.4588 5.02431C20.507 5.02431 20.5564 5.02458 20.6072 5.02512C20.6579 5.02566 20.7099 5.02645 20.7634 5.02744C20.7138 5.00741 20.6657 4.98776 20.6187 4.96836C20.5718 4.94897 20.5262 4.92986 20.4819 4.91099C20.4376 4.89213 20.3946 4.87345 20.3528 4.85501C20.3111 4.83657 20.2706 4.81821 20.2313 4.8001C20.192 4.78189 20.154 4.76384 20.1171 4.74593C20.0801 4.72801 20.0444 4.71005 20.0099 4.69207C19.9753 4.67417 19.9419 4.65632 19.9097 4.63842C19.8773 4.6205 19.8462 4.60255 19.816 4.58442C19.7858 4.56639 19.7568 4.54822 19.7288 4.52988C19.7009 4.51155 19.6739 4.49313 19.6479 4.47447C19.622 4.4558 19.597 4.43696 19.573 4.41783C19.549 4.39872 19.5259 4.37934 19.5038 4.35968C19.4818 4.34002 19.4606 4.32007 19.4403 4.29967C19.4201 4.27935 19.4007 4.25867 19.3822 4.2375C19.3637 4.21633 19.346 4.19485 19.3293 4.17282C19.3124 4.15078 19.2964 4.12834 19.2812 4.10531C19.266 4.08229 19.2516 4.05878 19.2379 4.03466C19.2243 4.01056 19.2114 3.98594 19.1992 3.96062C19.187 3.93532 19.1755 3.9094 19.1647 3.8828C19.154 3.85619 19.1438 3.82886 19.1344 3.80085C19.125 3.77283 19.1162 3.744 19.108 3.71446C19.0998 3.68492 19.0922 3.65457 19.0852 3.6233C19.0782 3.59213 19.0719 3.56006 19.0659 3.52715C19.06 3.49424 19.0548 3.46034 19.0499 3.42558C19.0451 3.39084 19.0408 3.35507 19.0369 3.31827C19.0331 3.28148 19.0297 3.24375 19.0268 3.2049C19.0238 3.16605 19.0213 3.12624 19.0192 3.08522C19.0171 3.0442 19.0154 3.00214 19.0141 2.95886C19.0128 2.91558 19.0118 2.87113 19.0112 2.82555C19.0106 2.77988 19.0102 2.73303 19.0102 2.68487C19.0102 2.6367 19.0105 2.58728 19.011 2.53651C19.0116 2.48574 19.0124 2.43372 19.0134 2.38024Z" fill="#E9F1EE"/>
<path d="M23.8857 7.21101C23.8439 7.31454 23.8029 7.41531 23.7624 7.51321C23.7219 7.6112 23.682 7.70633 23.6427 7.79884C23.6033 7.89135 23.5643 7.98114 23.5258 8.0683C23.4873 8.15546 23.449 8.24007 23.4111 8.32211C23.3731 8.40415 23.3355 8.48364 23.2979 8.5607C23.2602 8.63776 23.2229 8.71227 23.1855 8.78451C23.1481 8.85667 23.1108 8.9265 23.0733 8.99395C23.0359 9.06141 22.9983 9.12652 22.9606 9.18944C22.9229 9.25236 22.885 9.313 22.8468 9.37152C22.8086 9.43003 22.7701 9.48633 22.7311 9.54058C22.6922 9.59483 22.6528 9.64695 22.6129 9.69706C22.573 9.74719 22.5325 9.79524 22.4915 9.84139C22.4504 9.88755 22.4087 9.93169 22.3662 9.97409C22.3237 10.0164 22.2805 10.0569 22.2364 10.0955C22.1923 10.1341 22.1474 10.1709 22.1014 10.2061C22.0554 10.2412 22.0086 10.2746 21.9606 10.3063C21.9126 10.3381 21.8634 10.3681 21.8132 10.3966C21.7628 10.4252 21.7113 10.4521 21.6585 10.4775C21.6057 10.5029 21.5516 10.5268 21.496 10.5494C21.4404 10.5719 21.3834 10.5929 21.3249 10.6127C21.2664 10.6324 21.2063 10.6508 21.1446 10.6678C21.0828 10.6849 21.0195 10.7007 20.9543 10.7153C20.8891 10.7299 20.8222 10.7433 20.7534 10.7555C20.6846 10.7677 20.614 10.7789 20.5413 10.7889C20.4686 10.799 20.394 10.808 20.3173 10.816C20.2406 10.824 20.1617 10.831 20.0807 10.8371C19.9996 10.8432 19.9164 10.8484 19.8307 10.8528C19.7451 10.8572 19.6572 10.8607 19.5669 10.8635C19.4765 10.8663 19.3837 10.8683 19.2884 10.8696C19.1931 10.8709 19.0951 10.8715 18.9946 10.8716C18.894 10.8716 18.7908 10.871 18.6849 10.8699C18.579 10.8687 18.4702 10.867 18.3585 10.8649C18.4621 10.9067 18.5628 10.9478 18.6607 10.9882C18.7587 11.0287 18.8538 11.0686 18.9464 11.1079C19.0389 11.1474 19.1287 11.1863 19.2159 11.2248C19.3031 11.2634 19.3877 11.3016 19.4697 11.3396C19.5518 11.3775 19.6313 11.4152 19.7083 11.4528C19.7854 11.4904 19.8599 11.5278 19.9321 11.5651C20.0043 11.6025 20.0741 11.6398 20.1415 11.6774C20.209 11.7148 20.2741 11.7523 20.3371 11.79C20.4 11.8277 20.4606 11.8656 20.5191 11.9038C20.5776 11.9421 20.6339 11.9806 20.6882 12.0195C20.7424 12.0585 20.7946 12.0978 20.8447 12.1377C20.8948 12.1776 20.9429 12.218 20.989 12.2591C21.0352 12.3002 21.0793 12.3418 21.1216 12.3843C21.1639 12.4268 21.2044 12.4701 21.243 12.5141C21.2816 12.5582 21.3185 12.6031 21.3536 12.6491C21.3887 12.6951 21.4221 12.7419 21.4539 12.7899C21.4856 12.8379 21.5157 12.8871 21.5442 12.9373C21.5727 12.9877 21.5996 13.0392 21.625 13.092C21.6504 13.1448 21.6744 13.199 21.6969 13.2545C21.7194 13.3101 21.7404 13.3671 21.7602 13.4256C21.78 13.4841 21.7983 13.5442 21.8153 13.6059C21.8324 13.6677 21.8483 13.7311 21.8628 13.7962C21.8774 13.8614 21.8908 13.9283 21.903 13.9971C21.9153 14.0659 21.9264 14.1366 21.9365 14.2092C21.9465 14.2819 21.9555 14.3565 21.9635 14.4332C21.9715 14.51 21.9785 14.5888 21.9847 14.6699C21.9908 14.7509 21.996 14.8342 22.0004 14.9198C22.0047 15.0054 22.0083 15.0933 22.0111 15.1837C22.0139 15.2741 22.0159 15.3669 22.0173 15.4622C22.0186 15.5575 22.0192 15.6554 22.0192 15.756C22.0193 15.8565 22.0186 15.9597 22.0175 16.0657C22.0163 16.1717 22.0146 16.2804 22.0125 16.392C22.0543 16.2885 22.0954 16.1877 22.1358 16.0898C22.1763 15.9919 22.2162 15.8967 22.2556 15.8042C22.2949 15.7117 22.3339 15.6219 22.3725 15.5346C22.411 15.4475 22.4492 15.3629 22.4872 15.2808C22.5252 15.1988 22.5628 15.1193 22.6004 15.0422C22.6379 14.9652 22.6754 14.8907 22.7128 14.8184C22.7501 14.7463 22.7875 14.6764 22.825 14.609C22.8624 14.5415 22.8999 14.4764 22.9376 14.4135C22.9753 14.3506 23.0133 14.2899 23.0515 14.2314C23.0897 14.1729 23.1282 14.1166 23.1672 14.0624C23.2061 14.0081 23.2454 13.956 23.2854 13.9059C23.3253 13.8557 23.3658 13.8077 23.4068 13.7615C23.4478 13.7154 23.4896 13.6712 23.5321 13.6289C23.5745 13.5866 23.6178 13.5462 23.6618 13.5076C23.7059 13.4689 23.7509 13.4321 23.7968 13.397C23.8428 13.3618 23.8897 13.3284 23.9377 13.2967C23.9857 13.265 24.0348 13.2349 24.0851 13.2064C24.1354 13.1779 24.1869 13.151 24.2397 13.1255C24.2925 13.1001 24.3467 13.0762 24.4022 13.0537C24.4578 13.0311 24.5148 13.0101 24.5733 12.9904C24.6318 12.9706 24.6919 12.9523 24.7537 12.9352C24.8154 12.9182 24.8788 12.9024 24.9439 12.8878C25.0091 12.8732 25.076 12.8599 25.1448 12.8476C25.2136 12.8354 25.2843 12.8242 25.3569 12.8142C25.4296 12.8041 25.5042 12.7951 25.5809 12.7871C25.6577 12.7791 25.7365 12.7721 25.8176 12.7659C25.8986 12.7598 25.9819 12.7546 26.0675 12.7502C26.1531 12.7459 26.241 12.7423 26.3314 12.7395C26.4218 12.7367 26.5146 12.7347 26.6099 12.7334C26.7052 12.7321 26.8031 12.7315 26.9036 12.7314C27.0041 12.7314 27.1074 12.732 27.2133 12.7332C27.3192 12.7343 27.428 12.736 27.5396 12.7381C27.4361 12.6963 27.3353 12.6553 27.2374 12.6148C27.1395 12.5744 27.0443 12.5344 26.9518 12.4951C26.8593 12.4556 26.7695 12.4167 26.6823 12.3782C26.5952 12.3396 26.5106 12.3014 26.4285 12.2635C26.3465 12.2255 26.267 12.1879 26.1899 12.1502C26.1129 12.1127 26.0384 12.0753 25.9661 12.0379C25.894 12.0005 25.8241 11.9632 25.7567 11.9258C25.6892 11.8883 25.6241 11.8508 25.5612 11.8131C25.4983 11.7754 25.4376 11.7375 25.3791 11.6993C25.3206 11.661 25.2643 11.6225 25.21 11.5836C25.1558 11.5447 25.1037 11.5053 25.0536 11.4653C25.0034 11.4255 24.9554 11.385 24.9092 11.344C24.8631 11.3029 24.8189 11.2612 24.7766 11.2187C24.7343 11.1762 24.6939 11.133 24.6552 11.0889C24.6166 11.0448 24.5798 10.9999 24.5446 10.9539C24.5095 10.9079 24.4761 10.8611 24.4444 10.8131C24.4127 10.7651 24.3825 10.716 24.3541 10.6657C24.3255 10.6153 24.2986 10.5638 24.2732 10.511C24.2478 10.4582 24.2239 10.4041 24.2014 10.3485C24.1788 10.2929 24.1578 10.2359 24.1381 10.1773C24.1183 10.1188 24.1 10.0587 24.0829 9.99699C24.0659 9.93525 24.05 9.87186 24.0354 9.80669C24.0208 9.74152 24.0075 9.67464 23.9952 9.60583C23.983 9.53702 23.9719 9.46637 23.9618 9.39371C23.9518 9.32104 23.9428 9.24644 23.9347 9.16971C23.9267 9.09297 23.9197 9.0141 23.9135 8.93305C23.9074 8.85203 23.9022 8.76873 23.8978 8.68311C23.8935 8.59749 23.8899 8.5096 23.8871 8.41924C23.8844 8.32888 23.8823 8.23607 23.881 8.14077C23.8797 8.04548 23.8791 7.94752 23.879 7.84706C23.879 7.7465 23.8796 7.64328 23.8808 7.53736C23.8818 7.43132 23.8835 7.32262 23.8857 7.21101Z" fill="#E9F1EE"/>
<path d="M13.68 18.5538C13.5916 18.773 13.5047 18.9862 13.4191 19.1935C13.3334 19.4008 13.249 19.6024 13.1656 19.7981C13.0822 19.9939 12.9998 20.184 12.9181 20.3686C12.8365 20.5532 12.7556 20.7322 12.6754 20.9059C12.595 21.0796 12.5153 21.2478 12.4358 21.4109C12.3563 21.574 12.2771 21.7318 12.198 21.8845C12.1188 22.0373 12.0398 22.185 11.9606 22.3278C11.8813 22.4706 11.8019 22.6085 11.722 22.7417C11.6422 22.8749 11.562 23.0032 11.4811 23.1271C11.4002 23.2509 11.3186 23.3701 11.2362 23.4848C11.1538 23.5996 11.0705 23.71 10.986 23.816C10.9015 23.9221 10.8159 24.0239 10.729 24.1216C10.642 24.2192 10.5538 24.3128 10.4639 24.4023C10.3739 24.4919 10.2825 24.5775 10.1891 24.6593C10.0958 24.7411 10.0006 24.8191 9.90336 24.8934C9.80608 24.9678 9.70676 25.0385 9.60515 25.1056C9.50355 25.1728 9.39958 25.2365 9.29308 25.2969C9.18658 25.3572 9.07755 25.4143 8.96575 25.4681C8.85395 25.522 8.73931 25.5726 8.62172 25.6202C8.50406 25.6678 8.38347 25.7124 8.25955 25.7542C8.13562 25.7959 8.00845 25.8347 7.87777 25.8709C7.74709 25.9071 7.61292 25.9405 7.47502 25.9714C7.33711 26.0023 7.19546 26.0306 7.04984 26.0565C6.90421 26.0825 6.75468 26.106 6.60086 26.1273C6.44711 26.1485 6.28906 26.1676 6.12664 26.1845C5.9642 26.2015 5.7973 26.2164 5.62578 26.2293C5.45418 26.2423 5.27794 26.2533 5.09676 26.2625C4.91558 26.2718 4.72952 26.2793 4.53828 26.2852C4.34704 26.291 4.15061 26.2953 3.94884 26.298C3.74705 26.3009 3.53985 26.3021 3.32703 26.3022C3.11422 26.3022 2.89573 26.301 2.67141 26.2986C2.44709 26.2962 2.21692 26.2927 1.98061 26.2881C2.19982 26.3764 2.41298 26.4633 2.62032 26.549C2.82766 26.6347 3.02911 26.7191 3.22495 26.8025C3.42075 26.8859 3.61087 26.9683 3.79543 27.05C3.97998 27.1316 4.15904 27.2125 4.33271 27.2927C4.50637 27.373 4.67462 27.4528 4.8377 27.5323C5.00077 27.6118 5.1586 27.691 5.31141 27.7701C5.46415 27.8493 5.61188 27.9283 5.75469 28.0075C5.8975 28.0868 6.03539 28.1662 6.16857 28.2461C6.30177 28.3259 6.43012 28.4062 6.55396 28.487C6.67778 28.5679 6.797 28.6495 6.91179 28.7319C7.02659 28.8143 7.13694 28.8977 7.243 28.9821C7.34906 29.0666 7.45085 29.1522 7.54852 29.2391C7.64619 29.3261 7.73975 29.4144 7.82927 29.5043C7.91887 29.5942 8.00444 29.6856 8.08622 29.779C8.16799 29.8723 8.24604 29.9675 8.32031 30.0647C8.39465 30.162 8.46529 30.2613 8.53252 30.363C8.59969 30.4646 8.66338 30.5685 8.72376 30.675C8.78413 30.7815 8.84113 30.8906 8.89498 31.0024C8.94883 31.1142 8.99945 31.2288 9.04709 31.3464C9.09472 31.464 9.13929 31.5847 9.18105 31.7086C9.2228 31.8324 9.26163 31.9597 9.2978 32.0903C9.33398 32.221 9.36741 32.3552 9.39827 32.4931C9.42913 32.631 9.45748 32.7726 9.48343 32.9182C9.50936 33.0638 9.53289 33.2133 9.55415 33.3672C9.57541 33.521 9.5945 33.679 9.61148 33.8414C9.62847 34.0038 9.64329 34.1707 9.65626 34.3423C9.66921 34.5139 9.68025 34.6901 9.68952 34.8712C9.69877 35.0524 9.70626 35.2385 9.71213 35.4297C9.71801 35.6209 9.72226 35.8174 9.72501 36.0191C9.72783 36.2209 9.72912 36.4281 9.7292 36.641C9.72927 36.8538 9.72799 37.0723 9.72557 37.2966C9.72316 37.5209 9.71963 37.7511 9.71505 37.9874C9.80341 37.7682 9.89033 37.555 9.97599 37.3477C10.0616 37.1403 10.146 36.9389 10.2295 36.743C10.3129 36.5472 10.3953 36.3571 10.4769 36.1726C10.5586 35.988 10.6394 35.8089 10.7197 35.6353C10.8 35.4616 10.8798 35.2934 10.9593 35.1303C11.0388 34.9672 11.118 34.8094 11.1971 34.6566C11.2762 34.5039 11.3553 34.3562 11.4345 34.2133C11.5138 34.0705 11.5931 33.9327 11.673 33.7995C11.7528 33.6663 11.8331 33.5379 11.914 33.4141C11.9949 33.2903 12.0765 33.1711 12.1589 33.0563C12.2413 32.9415 12.3246 32.8312 12.4091 32.7251C12.4936 32.6191 12.5791 32.5173 12.6661 32.4196C12.753 32.3219 12.8413 32.2284 12.9312 32.1388C13.0211 32.0492 13.1126 31.9637 13.2059 31.8819C13.2993 31.8001 13.3944 31.7221 13.4917 31.6478C13.589 31.5735 13.6883 31.5028 13.7899 31.4356C13.8915 31.3684 13.9955 31.3047 14.102 31.2444C14.2085 31.184 14.3175 31.127 14.4293 31.0731C14.5411 31.0193 14.6557 30.9687 14.7734 30.921C14.8911 30.8734 15.0116 30.8288 15.1356 30.7871C15.2595 30.7453 15.3867 30.7065 15.5173 30.6703C15.648 30.6342 15.7822 30.6007 15.9201 30.5699C16.058 30.539 16.1997 30.5106 16.3452 30.4847C16.4908 30.4588 16.6404 30.4352 16.7942 30.414C16.9479 30.3927 17.106 30.3736 17.2684 30.3566C17.4309 30.3397 17.5977 30.3248 17.7693 30.3119C17.9409 30.2989 18.1171 30.2879 18.2982 30.2786C18.4794 30.2694 18.6655 30.2619 18.8567 30.256C19.048 30.2501 19.2444 30.2459 19.4462 30.2431C19.648 30.2403 19.8551 30.239 20.068 30.2389C20.2808 30.2389 20.4993 30.2401 20.7236 30.2426C20.9479 30.245 21.1781 30.2485 21.4144 30.2531C21.1952 30.1647 20.982 30.0778 20.7747 29.9921C20.5673 29.9065 20.3658 29.8221 20.17 29.7386C19.9742 29.6553 19.7841 29.5728 19.5996 29.4912C19.415 29.4096 19.236 29.3287 19.0623 29.2484C18.8886 29.1681 18.7204 29.0883 18.5573 29.0088C18.3942 28.9294 18.2364 28.8502 18.0837 28.771C17.9309 28.6919 17.7832 28.6128 17.6404 28.5336C17.4976 28.4544 17.3597 28.375 17.2265 28.2952C17.0933 28.2153 16.9649 28.1351 16.8411 28.0542C16.7173 27.9733 16.598 27.8917 16.4833 27.8093C16.3685 27.7269 16.2582 27.6436 16.1521 27.5591C16.0461 27.4746 15.9443 27.3891 15.8466 27.3021C15.7489 27.2152 15.6554 27.1269 15.5658 27.037C15.4762 26.9471 15.3907 26.8556 15.3088 26.7623C15.2271 26.6689 15.1491 26.5738 15.0747 26.4765C15.0004 26.3792 14.9297 26.2799 14.8625 26.1783C14.7954 26.0767 14.7317 25.9727 14.6713 25.8662C14.6109 25.7597 14.5539 25.6507 14.5001 25.5389C14.4462 25.4271 14.3956 25.3124 14.348 25.1948C14.3003 25.0771 14.2558 24.9565 14.214 24.8326C14.1723 24.7087 14.1334 24.5815 14.0973 24.4508C14.0611 24.3202 14.0276 24.186 13.9968 24.0481C13.9659 23.9102 13.9376 23.7685 13.9116 23.623C13.8857 23.4773 13.8622 23.3278 13.8409 23.174C13.8196 23.0202 13.8006 22.8622 13.7836 22.6998C13.7666 22.5373 13.7518 22.3704 13.7388 22.1989C13.7258 22.0274 13.7148 21.8511 13.7056 21.6699C13.6963 21.4888 13.6888 21.3027 13.6829 21.1115C13.6771 20.9202 13.6728 20.7238 13.67 20.522C13.6672 20.3202 13.6659 20.113 13.6659 19.9002C13.6658 19.6874 13.6671 19.4689 13.6695 19.2446C13.6719 19.0203 13.6754 18.7901 13.68 18.5538Z" fill="#98BCB1"/>
</svg>

  );
}
function AppleLogoIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 170 170" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.92.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.76-14.04-5.04-7.08-9.19-15.29-12.44-24.65-3.49-10.15-5.23-19.97-5.23-29.45 0-10.87 2.35-20.24 7.06-28.06 3.69-6.31 8.6-11.3 14.75-14.95 6.15-3.65 12.8-5.51 19.97-5.72 3.91 0 9.05 1.21 15.43 3.59 6.36 2.39 10.45 3.6 12.24 3.6 1.34 0 5.87-1.42 13.56-4.22 7.27-2.6 13.41-3.67 18.45-3.24 13.63 1.1 23.87 6.47 30.68 16.15-12.19 7.39-18.22 17.73-18.1 31 .11 10.34 3.86 18.94 11.23 25.77 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.1-2.96 15.67-8.86 22.67-7.12 8.32-15.73 13.13-25.07 12.37-.12-.97-.18-1.99-.18-3.07 0-7.77 3.38-16.09 9.39-22.89 3-3.44 6.82-6.31 11.45-8.6 4.62-2.26 8.99-3.51 13.1-3.72.12 1.1.17 2.2.17 3.24z" />
    </svg>
  );
}

function GooglePlayLogoIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.22 0.272C0.948 0.56 0.792 1.004 0.792 1.58V20.42C0.792 20.996 0.948 21.44 1.22 21.728L1.296 21.8L11.848 11.248V11.001V10.753L1.296 0.201L1.22 0.272Z" fill="#4285F4" />
      <path d="M15.368 14.768L11.848 11.248V11.001V10.753L15.372 7.233L15.46 7.284L19.588 9.629C20.764 10.297 20.764 11.401 19.588 12.073L15.46 14.717L15.368 14.768Z" fill="#FBBC04" />
      <path d="M15.46 14.717L11.848 11.101L1.22 21.728C1.62 22.157 2.276 22.209 3.016 21.789L15.46 14.717Z" fill="#EA4335" />
      <path d="M15.46 7.284L3.016 0.213C2.276 -0.155 1.62 -0.155 1.22 0.273L11.848 10.901L15.46 7.284Z" fill="#34A853" />
    </svg>
  );
}
