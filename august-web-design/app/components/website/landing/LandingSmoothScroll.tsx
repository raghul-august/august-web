"use client";
import { useEffect } from "react";

export default function LandingSmoothScroll() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let idleId: number | undefined;

    const init = async () => {
      const [{ default: Lenis }, gsapModule, scrollTriggerModule] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ lerp: 0.08 });

      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      const scrollToHash = (hash: string) => {
        const element = document.getElementById(hash);
        if (!element) return;
        lenis.scrollTo(element, {
          offset: 0,
          duration: 1.5,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
      };

      const initialHash = window.location.hash.slice(1);
      if (initialHash) {
        setTimeout(() => scrollToHash(initialHash), 600);
      }

      const handleAnchorClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest("a");
        if (!target) return;

        const href = target.getAttribute("href");
        if (!href) return;

        if (href.startsWith("#") && href !== "#") {
          const id = href.slice(1);
          const element = document.getElementById(id);
          if (!element) return;
          e.preventDefault();
          scrollToHash(id);
          return;
        }

        if (href.includes("#")) {
          const [path, hash] = href.split("#");
          if (!hash) return;
          const currentPath = window.location.pathname;
          if (path === currentPath || (path === "/" && currentPath === "/")) {
            const element = document.getElementById(hash);
            if (!element) return;
            e.preventDefault();
            scrollToHash(hash);
          }
        }
      };

      document.addEventListener("click", handleAnchorClick);

      cleanup = () => {
        lenis.destroy();
        gsap.ticker.remove(raf);
        document.removeEventListener("click", handleAnchorClick);
      };
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => {
        void init();
      }, { timeout: 2000 });
    } else {
      globalThis.setTimeout(() => {
        void init();
      }, 1000);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      cleanup?.();
    };
  }, []);

  return null;
}
