"use client";

import dynamic from "next/dynamic";
import { SoundProvider } from "./context/SoundContext";

const SoundToggle = dynamic(() => import("./SoundToggle"), { ssr: false });
const StickyMobileCTA = dynamic(() => import("./StickyMobileCTA"), { ssr: false });

export default function FloatingElements({ country }: { country: string }) {
  return (
    <>
      <SoundProvider>
        <SoundToggle />
      </SoundProvider>
      <StickyMobileCTA initialCountry={country} />
    </>
  );
}
