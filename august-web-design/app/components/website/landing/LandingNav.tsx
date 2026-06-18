"use client";
import { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import { List, X } from "@phosphor-icons/react";
import { checkCountry } from "@/app/utils/checkCountry";
import { track } from "@/app/utils/analytics";

const NAV_LINKS = [
  {label: "Online Urgent Care", href: "/telehealth/online-urgent-care", isUSOnly: true },
  { label: "Benchmarks", href: "/benchmarks", isUSOnly: false },
  { label: "Stories", href: "/#stories", isUSOnly: false },
  { label: "Use Cases", href: "/#usecases", isUSOnly: false },
  { label: "FAQ", href: "/#faq", isUSOnly: false },
];

const glassStyle = `
  rgba(13, 39, 64, 0.1) 0px 1.2px 30px 0px,
  inset 3px 3px 2px -3px rgba(255, 255, 255, 0.8),
  inset -3px -3px 2px -3px rgba(255, 255, 255, 0.8),
  inset 2px 2px 0.5px -2px rgba(38, 38, 38, 0.06),
  inset -2px -2px 0.5px -2px rgba(38, 38, 38, 0.06),
  inset 0 0 0 1px rgba(255, 255, 255, 0.12),
  inset 0 0 12px 1px rgba(212, 212, 212, 0.08)
`;

interface LandingNavProps {
  initialCountry?: string;
}

export default function LandingNav({ initialCountry }: LandingNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const [onLight, setOnLight] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [country, setCountry] = useState<string | null>(initialCountry || null);


  

  useEffect(() => {
    if (!initialCountry) {
      setCountry(checkCountry());
    }
  }, [initialCountry]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Simple entry animation handling without GSAP
    if (nav) {
      nav.style.opacity = "1";
      nav.style.transform = "translateY(0)";
    }

    const handleScroll = () => {
      const navBottom = 80;
      let isDark = false;

      document.querySelectorAll("[data-nav-dark]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isHero = el.tagName === "SECTION" && (el as HTMLElement).style.position === "sticky";

        if (isHero) {
          if (window.scrollY < window.innerHeight * 0.7) isDark = true;
        } else {
          if (rect.top < navBottom && rect.bottom > 0) isDark = true;
        }
      });

      const footer = document.querySelector("footer");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        if (rect.top < navBottom && rect.bottom > 0) isDark = true;
      }

      setOnLight(!isDark);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [menuOpen]);

  const filteredNavLinks = useMemo(() => {
    if(country !== 'US') return NAV_LINKS.filter(link => !link.isUSOnly);
    return NAV_LINKS;
  }, [country])

  const iconColor = onLight ? "#1C1917" : "#ffffff";
  const isIndia = country === "IN";
  const onDark = !onLight;
  const ctaColor = onDark ? "#ffffff" : "#206E55";
  const ctaWeight = onDark ? 700 : isIndia ? 600 : 500;

  return (
    <>
      {/* Mobile scrim overlay */}
      <div
        className="fixed inset-0 z-[49] lg:hidden transition-opacity duration-300"
        style={{
          background: onLight ? "rgba(28, 25, 23, 0.15)" : "rgba(28, 25, 23, 0.5)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        onClick={() => setMenuOpen(false)}
      />

      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center">
        <nav
          ref={navRef}
          className="pointer-events-auto mx-6 mt-5 w-full max-w-[1200px] transition-all duration-500 md:mx-10 lg:mx-20 overflow-hidden"
          style={{
            opacity: 0,
            transform: "translateY(-30px)",
            transition: "opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s, border-radius 0.3s ease",
            borderRadius: menuOpen ? "28px" : "100px",
            background: "transparent",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: glassStyle,
          }}
        >
          {/* Top bar */}
          <div
            className="relative flex items-center justify-between"
            style={{ padding: "12px 12px 12px 24px" }}
          >
            {/* Logo */}
            <a href="/" aria-label="August home" className="block">
              <Image
                src="/images/august-logo.svg"
                alt="august"
                width={80}
                height={25}
                unoptimized
                className={`transition-all duration-500 ${onLight ? "opacity-90" : "brightness-0 invert opacity-90"}`}
              />
            </a>

            {/* Nav links — desktop only */}
            <div className="hidden items-center gap-5 lg:flex absolute left-1/2 -translate-x-1/2">
              {filteredNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`transition-colors duration-500 ${onLight ? "text-[#1C1917] hover:text-[#1C1917]/70" : "text-[#ffffff] hover:text-[#ffffff]/70"}`}
                  style={{ fontSize: "16px", fontWeight: 400 }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center">
              {isIndia ? (
                <a
                  href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=landing_page_topnav"
                  target="_blank"
                  rel="noopener"
                  onClick={() => track("cta_click", {
                    button_name: "top_nav",
                    button_copy: "Talk to August"
                  })}
                  className="transition-all duration-300 hover:scale-[1.02] flex items-center gap-2"
                  style={{
                    fontSize: "16px",
                    fontWeight: ctaWeight,
                    color: ctaColor,
                    padding: "12px 24px",
                    borderRadius: "100px",
                    background: "transparent",
                    border: `1px solid ${ctaColor}`,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Talk to August
                </a>
              ) : (
                <a
                  href="https://www.meetaugust.ai/join/wa?utm=landing_page_topnav"
                  target="_blank"
                  rel="noopener"
                  onClick={() => track("cta_click", {
                    button_name: "top_nav",
                    button_copy: "Sign Up/Log In"
                  })}
                  className="transition-all duration-300 hover:scale-[1]"
                  style={{
                    fontSize: "16px",
                    fontWeight: ctaWeight,
                    color: ctaColor,
                    padding: "12px 24px",
                    borderRadius: "100px",
                    background: "transparent",
                    border: `1px solid ${ctaColor}`,
                  }}
                >
                  Sign up / Log in
                </a>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95"
              style={{ background: "rgba(255,255,255,0.1)" }}
              aria-label="Menu"
            >
              {menuOpen ? (
                <X size={24} color={iconColor} />
              ) : (
                <List size={24} color={iconColor} />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          <div
            className="lg:hidden transition-all duration-300 overflow-hidden"
            style={{
              maxHeight: menuOpen ? "400px" : "0px",
              opacity: menuOpen ? 1 : 0,
            }}
          >
            <div className="flex flex-col items-center gap-5 pb-6 pt-2 px-5 w-full">
              {filteredNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`transition-opacity duration-200 hover:opacity-70 ${onLight ? "text-[#1C1917]" : "text-white"}`}
                  style={{ fontSize: "15px", fontWeight: 400, letterSpacing: "-0.01em" }}
                >
                  {link.label}
                </a>
              ))}
              {isIndia ? (
                <a
                  href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=landing_page_topnav"
                  target="_blank"
                  rel="noopener"
                  onClick={() => {
                    track("cta_click", { button_name: "top_nav", button_copy: "Talk to August" });
                    setMenuOpen(false);
                  }}
                  className="mt-1 w-full text-center rounded-full py-3 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    fontSize: "16px",
                    fontWeight: ctaWeight,
                    color: ctaColor,
                    background: "transparent",
                    border: `1px solid ${ctaColor}`,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Talk to August
                </a>
              ) : (
                <a
                  href="https://www.meetaugust.ai/join/wa?utm=landing_page_topnav"
                  target="_blank"
                  rel="noopener"
                  onClick={() => {
                    track("cta_click", { button_name: "top_nav", button_copy: "Sign Up/Log In" });
                    setMenuOpen(false);
                  }}
                  className="mt-1 w-full text-center rounded-full py-3 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    fontSize: "16px",
                    fontWeight: ctaWeight,
                    color: ctaColor,
                    background: "transparent",
                    border: `1px solid ${ctaColor}`,
                  }}
                >
                  Sign up / Log in
                </a>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
