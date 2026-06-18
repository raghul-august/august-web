"use client";

import { useEffect } from "react";

// Presentational scroll effects for the urgent-care page: entrance reveals
// (elements tagged [data-anim] / [data-stagger]), light parallax, and a 3D tilt
// on the condition cards. All are progressive enhancements with full cleanup.
export default function UrgentCareEffects() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    // Entrance animations
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
      );
      document.querySelectorAll("[data-anim],[data-stagger]").forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // Parallax
    if (!reducedMotion) {
      const items: Array<{ el: HTMLElement; speed: number }> = [];
      const floatCard = document.querySelector(".float-card") as HTMLElement | null;
      const checkerCard = document.querySelector(".checker-card") as HTMLElement | null;
      if (floatCard) items.push({ el: floatCard, speed: 0.03 });
      if (checkerCard) items.push({ el: checkerCard, speed: 0.02 });
      document.querySelectorAll(".sec-head").forEach((h) => items.push({ el: h as HTMLElement, speed: 0.015 }));
      if (items.length) {
        let ticking = false;
        const onScroll = () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const viewH = window.innerHeight;
            items.forEach((item) => {
              const rect = item.el.getBoundingClientRect();
              const offset = (rect.top + rect.height / 2 - viewH / 2) * item.speed;
              item.el.style.transform = `translateY(${offset}px)`;
            });
            ticking = false;
          });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => {
          window.removeEventListener("scroll", onScroll);
          items.forEach((item) => (item.el.style.transform = ""));
        });
      }
    }

    // 3D tilt on condition cards (pointer devices only)
    if (!reducedMotion && !("ontouchstart" in window)) {
      document.querySelectorAll(".quad-card").forEach((node) => {
        const card = node as HTMLElement;
        const onMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-6px)`;
        };
        const onLeave = () => {
          card.style.transform = "perspective(800px) rotateY(0) rotateX(0) translateY(0)";
        };
        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("mousemove", onMove);
          card.removeEventListener("mouseleave", onLeave);
          card.style.transform = "";
        });
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
