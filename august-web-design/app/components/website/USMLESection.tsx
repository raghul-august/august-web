"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { TrackedCTA } from "./TrackedCTA";

export function USMLESection({ initialCountry, initialIsMobile = false }: { initialCountry?: string | null, initialIsMobile?: boolean }) {
  const [isMobile, setIsMobile] = useState(initialIsMobile);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section 
      id="usmle"
      className="framer-csgz1l relative py-12 sm:py-24 px-4 overflow-visible bg-white"
      data-framer-name="Problem solution"
    >
      {/* Background Glows - Replicating Framer export structure for soft atmospheric effect */}
      <div 
        className="framer-1jhmlaf absolute top-0 left-0 w-full h-[120%] pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 10% 10%, rgba(0, 178, 255, 0.12) 0%, transparent 60%)',
          zIndex: 0,
          transform: 'translateZ(0)'
        }}
      />
      <div 
        className="framer-1wgm2wk absolute top-0 right-0 w-full h-[120%] pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at 90% 10%, rgba(207, 251, 32, 0.18) 0%, transparent 60%)',
          zIndex: 0,
          transform: 'translateZ(0)'
        }}
      />
      
      {/* Blurry top/bottom transitions for the "wash" effect seen in prod */}
      <div 
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, white 0%, rgba(255, 255, 255, 0) 100%)',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, white 0%, rgba(255, 255, 255, 0) 100%)',
        }}
      />

      <div className="framer-7ejwwu relative max-w-[1100px] mx-auto z-20" data-framer-name="container">
        <div className="framer-1t797u1 flex flex-col items-center text-center mb-8 sm:mb-12" data-framer-name="content">
          {/* #1 Health AI Label */}
          <div className="framer-1dbrt82 mb-4 sm:mb-6" data-framer-name="The Upgrade" data-framer-component-type="RichTextContainer" style={{ transform: "none" }}>
            <p 
              className="framer-text" 
              style={{
                fontFamily: 'var(--font-manrope), sans-serif',
                fontWeight: 600,
                lineHeight: '110%',
                textAlign: 'center',
                color: 'rgb(8, 143, 123)',
                fontSize: isMobile ? '14px' : '20px'
              }}
            >
              #1 Health AI
            </p>
          </div>

          {/* Heading */}
          <div className="framer-qqhbew mb-4 sm:mb-6 px-2" data-framer-name="Upgrade heading" data-framer-component-type="RichTextContainer" style={{ transform: "none" }}>
            <h2 
              className="framer-text" 
              style={{
                fontFamily: 'var(--font-manrope), sans-serif',
                fontSize: isMobile ? '28px' : '48px',
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: "120%",
                textAlign: "center",
                color: "rgb(17, 17, 17)"
              }}
            >
              August scores 100% in USMLE
            </h2>
          </div>

          {/* Description */}
          <div className="framer-1t9kizg mb-8 sm:mb-12" data-framer-name="Support text" data-framer-component-type="RichTextContainer" style={{ transform: "none" }}>
            <p 
              className="framer-text" 
              style={{
                fontFamily: 'var(--font-manrope), sans-serif',
                fontWeight: 500,
                lineHeight: "150%",
                textAlign: "center",
                color: "rgb(17, 17, 17)",
                maxWidth: "600px",
                margin: "0 auto",
                opacity: 0.8,
                fontSize: isMobile ? '15px' : '16px'
              }}
            >
              August beats other leading AI models in the world on the US Medical Licensing Exam with a perfect 100% score. Human physicians train for years to achieve the passing threshold of 60%
            </p>
          </div>
        </div>

        {/* Image / Chart Section */}
        <div className="framer-y3jrhd flex justify-center mb-10 sm:mb-16">
          <div className="framer-c02mer relative w-full max-w-[774px] aspect-[2048/1368]">
            <div data-framer-background-image-wrapper="true" style={{ position: "absolute", inset: 0 }}>
              <Image 
                src="/website-images/hero-chart.png" 
                alt="USMLE benchmark chart showing August scoring 100%" 
                fill
                sizes="(max-width: 640px) 217px, (max-width: 768px) 50vw, 774px"
                priority 
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Lower CTA Area */}
        <div className="framer-1ddvgy7 flex flex-col items-center gap-4 sm:gap-6">
          <div className="framer-2cfu9i" data-framer-component-type="RichTextContainer" style={{ transform: "none" }}>
            <p 
              className="framer-text" 
              style={{
                fontFamily: 'var(--font-manrope), sans-serif',
                fontWeight: 500,
                lineHeight: "150%",
                color: "rgb(29, 29, 29)",
                fontSize: isMobile ? '14px' : '16px'
              }}
            >
              Get accurate health guidance
            </p>
          </div>

          <div className="framer-bcjly2-container">
            <TrackedCTA 
              className="framer-GW7Ac group"
              href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=page_cta"
              button_name="usmle"
              button_copy="Talk To August Now"
              initialCountry={initialCountry}
            >
              Talk To August Now
            </TrackedCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
