"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { trackTelehealth } from "@/services/telehealth-analytics";
import { track as trackMeta } from "@/app/utils/analytics";

// CTAs / navigational buttons on the page (excludes condition pills, which fire
// pill_clicked instead). Page-specific class names so this never catches the
// shared nav/footer chrome.
const CTA_SELECTOR = [
  ".composer-cta",
  ".cs-link",
  ".quad-start",
  ".how-cta",
  ".pricing-cta",
  ".related-card",
  ".cta-band-sec .btn-primary",
  ".sticky-cta .btn-primary",
  ".checker-form button[type='submit']",
].join(",");

function textOf(el: Element): string {
  // Prefer a heading (e.g. related-card title) over the full card text.
  const node = el.querySelector("h3") ?? el;
  return (node.textContent ?? "").replace(/\s+/g, " ").trim();
}

// Human label for the section an element belongs to: its eyebrow text, else its
// id / aria-label, else a sensible fallback for elements outside a <section>.
function sectionLabel(el: Element): string {
  const section = el.closest("section");
  if (section) {
    const eyebrow = section.querySelector(".eyebrow")?.textContent?.trim();
    if (eyebrow) return eyebrow;
    return section.getAttribute("id") || section.getAttribute("aria-label") || "section";
  }
  if (el.closest(".sticky-cta")) return "sticky_cta";
  return "page";
}

export default function UrgentCareAnalytics() {
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
            const sectionName = sec.querySelector(".eyebrow")?.textContent?.trim()
              || sec.getAttribute("id") || sec.getAttribute("aria-label") || "section";
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
      document.querySelectorAll(".uc-scope section").forEach((s) => io.observe(s));
      cleanups.push(() => io.disconnect());
    })();

    // ---- pill_clicked + cta_clicked (delegated) --------------------------
    (function () {
      const onClick = (e: MouseEvent) => {
        const target = e.target;
        if (!(target instanceof Element)) return;

        // Meta Pixel "telehealth_start" — any CTA / condition pill that begins
        // the anon telehealth flow resolves to an anon_telehealth=true link.
        // A plain <a> does a full-page navigation, which cancels the fbq beacon
        // before it sends; so we fire the event, then navigate client-side
        // (no document unload → the beacon completes). Modifier/middle clicks
        // keep their default new-tab behaviour.
        const startLink = target.closest<HTMLAnchorElement>('a[href*="anon_telehealth=true"]');
        if (
          startLink &&
          e.button === 0 &&
          !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey &&
          !e.defaultPrevented
        ) {
          const href = startLink.getAttribute("href");
          if (href) {
            e.preventDefault();
            trackMeta("telehealth_start", {
              from_path: window.location.pathname,
              to_path: href,
            });
            window.setTimeout(() => router.push(href), 150);
          }
        }

        const pill = target.closest(".chip, .use-chip");
        if (pill) {
          const pillAnchor = pill.closest("a");
          trackTelehealth("pill_clicked", {
            location: sectionLabel(pill),
            pill_copy: textOf(pill),
            destination: pillAnchor?.getAttribute("href") || "",
          });
          return;
        }

        const cta = target.closest(CTA_SELECTOR);
        if (!cta || cta.classList.contains("is-soon")) return; // coming-soon card isn't a CTA
        const anchor = cta.closest("a");
        trackTelehealth("cta_clicked", {
          copy: textOf(cta),
          location: sectionLabel(cta),
          destination: anchor?.getAttribute("href") || "",
        });
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
  }, []);

  return null;
}
