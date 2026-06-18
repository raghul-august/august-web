"use client";
import { createContext, useContext, useState } from "react";

const SoundContext = createContext<{
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
}>({ soundEnabled: false, setSoundEnabled: () => {} });

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundEnabled() {
  return useContext(SoundContext);
}
