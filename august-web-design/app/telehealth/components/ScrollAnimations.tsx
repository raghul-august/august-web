"use client";

/* Telehealth scroll engine:
   - [data-anim] / [data-stagger] elements reveal once in view (fade-up by
     default; fade-left / fade-right / zoom / blur variants via the value).
   - [data-parallax="<speed>"] elements translate as you scroll, relative to
     their distance from the viewport centre (positive = moves with scroll,
     negative = against it) for layered depth.
   - Lenis adds buttery smooth scrolling; a thin gradient bar tracks progress.
   All scroll-driven motion is skipped under prefers-reduced-motion. */

import { useEffect } from "react";

export default function ScrollAnimations() {
  useEffect(() => {
    // ---- Reveal on enter (always on) ----
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("aug-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    const startReveal = () =>
      document.querySelectorAll("[data-anim], [data-stagger]").forEach((el) => obs.observe(el));
    if (typeof requestIdleCallback !== "undefined") requestIdleCallback(startReveal);
    else setTimeout(startReveal, 100);

    const mo = new MutationObserver(() => {
      document
        .querySelectorAll("[data-anim]:not(.aug-visible), [data-stagger]:not(.aug-visible)")
        .forEach((el) => obs.observe(el));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      return () => {
        obs.disconnect();
        mo.disconnect();
      };
    }

    // ---- Scroll progress bar ----
    const scope = document.querySelector(".telehealth-scope") ?? document.body;
    const bar = document.createElement("div");
    bar.className = "aug-scroll-progress";
    scope.appendChild(bar);

    // ---- Subtle parallax + progress update ----
    const update = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = center - vh / 2; // px from viewport centre
        const speed = parseFloat(el.dataset.parallax || "0.1");
        el.style.transform = `translate3d(0, ${(-dist * speed).toFixed(2)}px, 0)`;
      });
      const doc = document.documentElement;
      const p = doc.scrollTop / (doc.scrollHeight - doc.clientHeight || 1);
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    };

    // ---- Lenis smooth scroll (graceful fallback to a plain scroll listener) ----
    let rafId = 0;
    let cleanupScroll = () => {};
    let destroyed = false;

    import("lenis")
      .then(({ default: Lenis }) => {
        if (destroyed) return;
        const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1 });
        const raf = (t: number) => {
          lenis.raf(t);
          update();
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
        cleanupScroll = () => {
          lenis.destroy();
          cancelAnimationFrame(rafId);
        };
        update();
      })
      .catch(() => {
        let ticking = false;
        const onScroll = () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            update();
            ticking = false;
          });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanupScroll = () => window.removeEventListener("scroll", onScroll);
      });

    window.addEventListener("resize", update);
    update();
    // re-run once dynamic sections have mounted
    const warm = setTimeout(update, 500);

    return () => {
      destroyed = true;
      obs.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", update);
      cleanupScroll();
      clearTimeout(warm);
      bar.remove();
    };
  }, []);

  return null;
}
