"use client";

import { useEffect, useState, useCallback } from "react";
import { track } from "@/app/utils/analytics";
import { checkCountry } from "@/app/utils/checkCountry";

type Props = {
  initialCountry?: string | null;
};

export default function StickyMobileCTA({ initialCountry }: Props) {
  const [visible, setVisible] = useState(false);
  const [country, setCountry] = useState<string | null>(initialCountry || null);

  useEffect(() => {
    if (!initialCountry) {
      setCountry(checkCountry());
    }
  }, [initialCountry]);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    if (scrollY < viewportHeight) {
      setVisible(false);
      return;
    }

    const footer = document.querySelector("footer");
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      if (footerRect.top < viewportHeight) {
        setVisible(false);
        return;
      }
    }

    setVisible(true);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const isIndia = country === "IN";
  const ctaLabel = isIndia ? "Talk to August" : "Download the App";
  const ctaHref = isIndia
    ? "https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=landing_page_cta"
    : "https://join.meetaugust.ai/?c=landing_page_footer";

  return (
    <div
      className={`fixed z-40 md:hidden transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      style={{
        bottom: "16px",
        left: "16px",
        right: "16px",
      }}
    >
      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          track("download_click", {
            button_name: "sticky_mobile_cta",
            variant: isIndia ? "india" : "global",
          })
        }
        className="block w-full rounded-full py-4 text-center text-white transition-all duration-200 active:scale-[0.98]"
        style={{
          fontSize: "16px",
          fontWeight: 500,
          background: "#206E55",
          boxShadow: "0 4px 20px rgba(32, 110, 85, 0.3), 0 1px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        {ctaLabel}
      </a>
    </div>
  );
}
