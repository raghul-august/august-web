"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { trackTelehealth } from "@/services/telehealth-analytics";
import { trackTelehealthStart } from "../analytics";

function sectionLabel(el: Element): string {
  const section = el.closest("section");
  if (!section) return "page";
  const eyebrow = section.querySelector(".th-eyebrow")?.textContent?.trim();
  if (eyebrow) return eyebrow;
  return section.getAttribute("aria-label") || section.getAttribute("id") || "section";
}

function copyOf(el: Element): string {
  // Prefer a card title / button / heading over the whole card text, so each
  // CTA reports something distinguishable (e.g. the treatment name).
  const node =
    el.querySelector(".th-card-title") ??
    el.querySelector("button") ??
    el.querySelector("h3") ??
    el;
  return (node.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
}

export default function TelehealthAnalytics() {
  const router = useRouter();

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // ---- scroll_depth (25 / 50 / 75 / 100%, once each) -------------------
    (function () {
      const milestones = [25, 50, 75, 100];
      const fired = new Set<number>();
      const onScroll = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const pct = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
        for (const m of milestones) {
          if (pct >= m && !fired.has(m)) {
            fired.add(m);
            trackTelehealth("scroll_depth", { percent: m });
          }
        }
        if (fired.size === milestones.length) window.removeEventListener("scroll", onScroll);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    })();

    // ---- viewed_section (each section, once) -----------------------------
    (function () {
      if (!("IntersectionObserver" in window)) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const sec = e.target;
            const sectionName = sec.querySelector(".th-eyebrow")?.textContent?.trim()
              || sec.getAttribute("aria-label") || sec.getAttribute("id") || "section";
            const heading = sec.querySelector("h2") ?? sec.querySelector("h1");
            trackTelehealth("viewed_section", {
              section_name: sectionName,
              section_title: (heading?.textContent ?? "").replace(/\s+/g, " ").trim(),
            });
            io.unobserve(sec);
          });
        },
        { threshold: 0, rootMargin: "0px 0px -30% 0px" },
      );
      document.querySelectorAll(".telehealth-scope section").forEach((s) => io.observe(s));
      cleanups.push(() => io.disconnect());
    })();

    // ---- cta_clicked + telehealth_start (delegated) ----------------------
    (function () {
      const onClick = (e: MouseEvent) => {
        const target = e.target;
        if (!(target instanceof Element)) return;

        // Every CTA on this page resolves to an anon_telehealth=true link. Fire
        // the GA cta_clicked + Meta Pixel telehealth_start, then navigate
        // client-side (no document unload → the fbq beacon completes).
        // Modifier / middle clicks keep their default new-tab behaviour.
        const startLink = target.closest<HTMLAnchorElement>('a[href*="anon_telehealth=true"]');
        if (!startLink) return;
        const href = startLink.getAttribute("href");
        if (!href) return;

        if (
          e.button === 0 &&
          !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey &&
          !e.defaultPrevented
        ) {
          e.preventDefault();
          trackTelehealthStart(href, copyOf(startLink), sectionLabel(startLink));
          window.setTimeout(() => router.push(href), 150);
        }
      };
      document.addEventListener("click", onClick);
      cleanups.push(() => document.removeEventListener("click", onClick));
    })();

    // ---- exited_page (desktop only, cursor leaves viewport top, once) -----
    (function () {
      const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (!isDesktop) return;
      let fired = false;
      const onMouseOut = (e: MouseEvent) => {
        if (fired || e.relatedTarget || (e.clientY ?? 1) > 0) return;
        fired = true;
        trackTelehealth("exited_page");
        document.removeEventListener("mouseout", onMouseOut);
      };
      document.addEventListener("mouseout", onMouseOut);
      cleanups.push(() => document.removeEventListener("mouseout", onMouseOut));
    })();

    return () => cleanups.forEach((fn) => fn());
  }, [router]);

  return null;
}
