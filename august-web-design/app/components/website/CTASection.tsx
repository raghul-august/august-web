"use client";

import { track } from "@/app/utils/analytics";
import { TrackedCTA } from "./TrackedCTA";
import { useState, useEffect } from "react";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-lexend",
});
export function CTASection({ initialCountry, initialIsMobile = false }: { initialCountry?: string | null, initialIsMobile?: boolean }) {
  const [isMobile, setIsMobile] = useState(initialIsMobile);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="relative py-12 sm:py-24 px-4 overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-x-0 top-0 h-[600px] bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_20%,transparent_100%)] opacity-[0.8] pointer-events-none" />
      <div className="absolute left-1/4 top-1/2 -translate-y-[60%] -translate-x-1/2 w-[500px] h-[500px] bg-[#e6f4f1]/80 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute right-1/4 top-1/2 -translate-y-[60%] translate-x-1/2 w-[500px] h-[500px] bg-[#f4fae6]/80 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1100px] mx-auto">
        <div className="flex flex-col items-center gap-12">
          {/* Centered Content */}
          <div className="text-center">
            <h2 className="text-[32px] sm:text-[46px] font-semibold leading-[1.15] tracking-[-0.96px] text-[#111] mb-5">
              Take control of your
              <br />
              health today
            </h2>
            <p className="text-base sm:text-[17px] font-medium text-[#767f7c] max-w-[420px] mx-auto leading-relaxed">
              Chat with August and start your journey to smarter health.
            </p>
          </div>

          {/* Chat Preview */}
          <div 
            style={{ 
              width: "100%", 
              maxWidth: "636px", 
              boxShadow: "0 3px 7px #9696961a, 0 13px 13px #96969617, 0 30px 18px #9696960d, 0 53px 21px #96969603, 0 83px 23px #96969600",
              borderRadius: isMobile ? "24px" : "32px",
              overflow: "hidden",
              border: "1px solid #1111111a",
              backgroundColor: "#fff",
            }}
          >

            <a
              href="https://www.meetaugust.ai/join/wa?message=Hello%20August"
              target="_blank"
              rel="noopener"
              onClick={() => track("card_click", { button_name: "cta", button_copy: "chat_preview" })}
              className={lexend.className}
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#ffffff",
                transition: "transform 0.2s ease",
              }}
            >
              {/* Profile Header Block */}
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "12px" : "14px",
                  padding: isMobile ? "16px 20px" : "24px 28px",
                  backgroundColor: "#F1F1F1",
                }}
              >
                <div style={{
                  width: isMobile ? "36px" : "44px",
                  height: isMobile ? "36px" : "44px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                  flexShrink: 0,
                }}>
                  <p style={{
                    fontFamily: "inherit",
                    fontSize: isMobile ? "10.72px" : "12.72px",
                    fontWeight: 600,
                    color: "rgb(26, 26, 26)",
                    margin: 0,
                  }}>AU</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <p style={{
                    fontFamily: "'Lexend', sans-serif",
                    fontSize: isMobile ? "18px" : "20px",
                    fontWeight: 600,
                    color: "rgb(17, 17, 17)",
                    margin: 0,
                  }}>August AI</p>
                  <div style={{ width: "21px", height: "20px", flexShrink: 0 }}>
                    <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M7.56508 3.05064L10.1766 0.0449219L12.7882 3.05064L16.7208 2.4268L16.7893 6.40799L20.2029 8.45794L17.6963 11.5518L18.9936 15.3163L15.0848 16.0751L13.6587 19.7928L10.1766 17.8615L6.69456 19.7928L5.26851 16.0751L1.3597 15.3163L2.65695 11.5518L0.150391 8.45794L3.56394 6.40799L3.63247 2.4268L7.56508 3.05064ZM13.8649 8.54863L12.5323 7.21604L9.23432 10.514L7.82089 9.10061L6.4883 10.4332L9.23432 13.1792L13.8649 8.54863Z" fill="#1CB50E"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Chat Content Block */}
              <div style={{ padding: isMobile ? "24px 20px" : "32px 28px", display: "flex", flexDirection: "column", gap: isMobile ? "16px" : "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "14px" : "20px" }}>
                  {/* August AI Initial Message */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: isMobile ? "10px" : "12px" }}>
                    <div style={{
                      width: isMobile ? "32px" : "40px",
                      height: isMobile ? "32px" : "40px",
                      borderRadius: "50%",
                      backgroundColor: "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <p style={{
                        fontFamily: "'Lexend', sans-serif",
                        fontSize: isMobile ? "12px" : "14.61px",
                        fontWeight: 500,
                        color: "rgb(26, 26, 26)",
                        margin: 0,
                      }}>AU</p>
                    </div>
                    <div style={{
                      backgroundColor: "#F1F1F1",
                      borderRadius: "16px",
                      borderTopLeftRadius: "2px",
                      padding: isMobile ? "12px 16px" : "16px 20px",
                      maxWidth: "85%",
                    }}>
                      <p style={{
                        fontFamily: "'Lexend', sans-serif",
                        fontSize: isMobile ? "13px" : "14px",
                        lineHeight: "150%",
                        color: "rgb(17, 17, 17)",
                        margin: 0,
                      }}>Hey, I’m August AI. Your AI health <br /> companion! How can I help you?</p>
                    </div>
                  </div>

                  {/* User Message */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{
                      backgroundColor: "#264653",
                      borderRadius: "16px",
                      borderTopRightRadius: "2px",
                      padding: isMobile ? "12px 16px" : "16px 20px",
                      maxWidth: "85%",
                    }}>
                      <p style={{
                        fontFamily: "'Lexend', sans-serif",
                        fontSize: isMobile ? "13px" : "14px",
                        lineHeight: "150%",
                        fontWeight: 500,
                        color: "#FFFFFF",
                        margin: 0,
                      }}>I’m feeling like vomiting and my head <br/> aches. What do I do?</p>
                    </div>
                  </div>
                </div>

                {/* Input Simulator Bar */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: isMobile ? "4px" : "8px"
                }}>
                  {/* Send a message box */}
                  <div style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    padding: isMobile ? "0 18px" : "0 24px",
                    height: isMobile ? "44px" : "52px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "100px",
                  }}>
                    <p style={{
                      fontFamily: "'Lexend', sans-serif",
                      fontSize: isMobile ? "14px" : "15px",
                      letterSpacing: "-0.02em",
                      lineHeight: "150%",
                      color: "rgba(0, 0, 0, 0.2)",
                      margin: 0,
                    }}>Send a message</p>
                  </div>

                  {/* Send button circle */}
                  <div style={{
                    width: isMobile ? "44px" : "52px",
                    height: isMobile ? "44px" : "52px",
                    borderRadius: "50%",
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0px 4px 10px rgba(0, 168, 150, 0.2)"
                  }}>
                    <div style={{ position: "absolute", borderRadius: "inherit", inset: "0px" }}>
                      <img decoding="auto" loading="lazy" width="192" height="192" src="https://framerusercontent.com/images/bDj7G6HUGeMwQ7om6rMYK2frM.png?width=192&height=192" alt="Beyond Health logo" style={{ display: "block", width: "100%", height: "100%", borderRadius: "inherit", objectPosition: "center center", objectFit: "fill" }} />
                    </div>
                    <div style={{ position: "relative", zIndex: 1, width: isMobile ? "18px" : "20px", height: isMobile ? "18px" : "20px" }}>
                      <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 16 16" fill="white">
                        <path d="M0.225832 1.89381C-0.0676354 1.01341 0.84984 0.217684 1.67989 0.63271L15.0348 7.31017C15.8026 7.69405 15.8026 8.78968 15.0348 9.17356L1.67989 15.851C0.849837 16.266 -0.0676347 15.4703 0.225832 14.5899L2.13357 8.8667H5.709C6.05418 8.8667 6.334 8.58688 6.334 8.2417C6.334 7.89652 6.05418 7.6167 5.709 7.6167H2.13346L0.225832 1.89381Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center mt-12 gap-4">
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 500, lineHeight: '150%', color: '#1D1D1D' }}>Get health answers 24/7</p>
          <TrackedCTA
            href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=page_cta"
            button_name="cta"
            button_copy="Talk To August Now"
            initialCountry={initialCountry}
          >
            Talk To August Now
          </TrackedCTA>
        </div>
      </div>
    </section>
  );
}
