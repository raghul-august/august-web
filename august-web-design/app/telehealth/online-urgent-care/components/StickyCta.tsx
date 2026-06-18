"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPinIcon } from "@phosphor-icons/react/ssr";

// Mobile-only bar that appears once the hero's doctor avatars scroll out of view
// and tucks away again when they return. Hidden on desktop via CSS.
export default function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const heroCta = document.querySelector<HTMLElement>(".float-card");
    if (!heroCta || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          const rect = entry.boundingClientRect;
          setShow(!entry.isIntersecting && rect.bottom <= 0);
        }),
      { threshold: 0, rootMargin: "0px" },
    );
    io.observe(heroCta);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`sticky-cta${show ? " show" : ""}`}>
      <div className="sticky-trust">
        <div className="sticky-avatars">
          <Image src="/urgent-care/doctor-1.webp" alt="Licensed doctor" width={30} height={30} />
          <Image src="/urgent-care/doctor-2.webp" alt="Licensed doctor" width={30} height={30} />
          <Image src="/urgent-care/doctor-3.webp" alt="Licensed doctor" width={30} height={30} />
        </div>
        <span className="sticky-trust-text"><MapPinIcon className="ph" aria-hidden /> Doctors available in 50 states + DC</span>
      </div>
      <a href="/chat?anon_telehealth=true" className="btn btn-primary">Get started</a>
    </div>
  );
}
