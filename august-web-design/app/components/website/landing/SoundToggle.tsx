"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSoundEnabled } from "./context/SoundContext";

export default function SoundToggle() {
  const [playing, setPlaying] = useState(false);
  const [onDark, setOnDark] = useState(true);
  const [hidden, setHidden] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const birdsRef = useRef<HTMLAudioElement | null>(null);
  const fadeMusicRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeBirdsRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const birdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const MUSIC_VOLUME = 0.28;
  const BIRDS_VOLUME = 0.12;
  const BIRD_CHIRP_INTERVAL = 5000;

  // Lazy-initialize audio only when needed (saves ~7.3 MB on initial load)
  const getMusic = useCallback(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio("/sounds/ambient-music.mp3");
      musicRef.current.loop = true;
      musicRef.current.volume = 0;
    }
    return musicRef.current;
  }, []);

  const getBirds = useCallback(() => {
    if (!birdsRef.current) {
      birdsRef.current = new Audio("/sounds/birds-chirp.mp3");
      birdsRef.current.loop = true;
      birdsRef.current.volume = 0;
    }
    return birdsRef.current;
  }, []);

  useEffect(() => {
    return () => {
      musicRef.current?.pause();
      birdsRef.current?.pause();
      if (fadeMusicRef.current) clearInterval(fadeMusicRef.current);
      if (fadeBirdsRef.current) clearInterval(fadeBirdsRef.current);
      if (birdIntervalRef.current) clearInterval(birdIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const btn = btnRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      btn.style.visibility = "hidden";
      document.elementFromPoint(x, y);
      btn.style.visibility = "visible";

      // Hide when footer is visible
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < window.innerHeight) {
          setHidden(true);
          return;
        }
      }
      setHidden(false);

      let isDark = false;
      if (window.scrollY < window.innerHeight * 0.7) {
        isDark = true;
      } else {
        document.querySelectorAll("[data-nav-dark]").forEach((darkEl) => {
          const r = darkEl.getBoundingClientRect();
          if (r.top < y && r.bottom > y) isDark = true;
        });
        if (footer) {
          const r = footer.getBoundingClientRect();
          if (r.top < y && r.bottom > y) isDark = true;
        }
      }
      setOnDark(isDark);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const startBirdPulse = useCallback(() => {
    const birds = getBirds();

    birds.play();
    birds.volume = 0;

    fadeBirdsIn();

    birdIntervalRef.current = setInterval(() => {
      fadeBirdsIn();
    }, BIRD_CHIRP_INTERVAL);
  }, [getBirds]);

  const fadeBirdsIn = () => {
    const birds = birdsRef.current;
    if (!birds) return;

    if (fadeBirdsRef.current) clearInterval(fadeBirdsRef.current);
    fadeBirdsRef.current = setInterval(() => {
      if (birds.volume < BIRDS_VOLUME - 0.01) {
        birds.volume = Math.min(BIRDS_VOLUME, birds.volume + 0.005);
      } else {
        clearInterval(fadeBirdsRef.current!);
        setTimeout(() => {
          fadeBirdsOut();
        }, 2000);
      }
    }, 50);
  };

  const fadeBirdsOut = () => {
    const birds = birdsRef.current;
    if (!birds) return;

    if (fadeBirdsRef.current) clearInterval(fadeBirdsRef.current);
    fadeBirdsRef.current = setInterval(() => {
      if (birds.volume > 0.005) {
        birds.volume = Math.max(0, birds.volume - 0.005);
      } else {
        birds.volume = 0;
        clearInterval(fadeBirdsRef.current!);
      }
    }, 50);
  };

  const stopBirdPulse = () => {
    if (birdIntervalRef.current) clearInterval(birdIntervalRef.current);
    const birds = birdsRef.current;
    if (!birds) return;
    if (fadeBirdsRef.current) clearInterval(fadeBirdsRef.current);
    fadeBirdsRef.current = setInterval(() => {
      if (birds.volume > 0.005) {
        birds.volume = Math.max(0, birds.volume - 0.01);
      } else {
        birds.volume = 0;
        birds.pause();
        clearInterval(fadeBirdsRef.current!);
      }
    }, 40);
  };

  const fadeInMusic = () => {
    const audio = getMusic();
    audio.play();
    if (fadeMusicRef.current) clearInterval(fadeMusicRef.current);
    fadeMusicRef.current = setInterval(() => {
      if (audio.volume < MUSIC_VOLUME - 0.01) {
        audio.volume = Math.min(MUSIC_VOLUME, audio.volume + 0.01);
      } else {
        clearInterval(fadeMusicRef.current!);
      }
    }, 90);
  };

  const fadeOutMusic = () => {
    const audio = musicRef.current;
    if (!audio) return;
    if (fadeMusicRef.current) clearInterval(fadeMusicRef.current);
    fadeMusicRef.current = setInterval(() => {
      if (audio.volume > 0.01) {
        audio.volume = Math.max(0, audio.volume - 0.01);
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeMusicRef.current!);
      }
    }, 55);
  };

  const { setSoundEnabled } = useSoundEnabled();

  const toggle = () => {
    if (playing) {
      fadeOutMusic();
      stopBirdPulse();
      setSoundEnabled(false);
    } else {
      fadeInMusic();
      startBirdPulse();
      setSoundEnabled(true);
    }
    setPlaying(!playing);
  };

  return (
    <button
      ref={btnRef}
      onClick={toggle}
      aria-label={playing ? "Mute ambient sound" : "Play ambient sound"}
      className={`fixed bottom-5 left-4 md:left-10 z-50 hidden md:flex items-center gap-2 transition-all duration-500 hover:opacity-80 ${
        hidden ? "opacity-0 pointer-events-none translate-y-4" : ""
      }`}
    >
      {playing ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={onDark ? "#ffffff" : "rgba(28,25,23,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={onDark ? "#ffffff" : "rgba(28,25,23,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
      <span
        className="transition-colors duration-500"
        style={{
          fontSize: "13px",
          fontWeight: 400,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: onDark ? "#ffffff" : "rgba(28,25,23,0.4)",
        }}
      >
        Sound: {playing ? "On" : "Off"}
      </span>
    </button>
  );
}
