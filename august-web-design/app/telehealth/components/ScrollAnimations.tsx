"use client";

/* Ports the kit's scroll-reveal behaviour: any [data-anim] / [data-stagger]
   element fades/slides in once it enters the viewport. */

import { useEffect } from "react";

export default function ScrollAnimations() {
  useEffect(() => {
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

    const start = () =>
      document
        .querySelectorAll("[data-anim], [data-stagger]")
        .forEach((el) => obs.observe(el));

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(start);
    } else {
      setTimeout(start, 100);
    }

    // Re-observe nodes added after the initial render (dynamic sections).
    const mo = new MutationObserver(() => {
      document
        .querySelectorAll(
          "[data-anim]:not(.aug-visible), [data-stagger]:not(.aug-visible)",
        )
        .forEach((el) => obs.observe(el));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      obs.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
