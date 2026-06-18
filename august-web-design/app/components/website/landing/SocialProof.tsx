"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import BlurSection from "./BlurSection";
import ScrollRevealText from "./ScrollRevealText";
import { track } from "@/app/utils/analytics";

/* ── Testimonial data ── */
const TESTIMONIALS = [
  {
    video: "https://assets.getbeyondhealth.com/user-stories/Rupali.mp4",
    poster: "/posters/testimonial-1.webp",
    name: "Rupali",
    subtitle: "Understood her thyroid reports for the first time",
  },
  {
    video: "https://assets.getbeyondhealth.com/user-stories/Deepu.mp4",
    poster: "/posters/testimonial-2.webp",
    name: "Deepu",
    subtitle: "Caught a drug interaction his doctor missed",
  },
  {
    video: "https://assets.getbeyondhealth.com/user-stories/Shilpa.mp4",
    poster: "/posters/testimonial-3.webp",
    name: "Shilpa",
    subtitle: "Finally got clarity on her chronic fatigue",
  },
  {
    video: "https://assets.getbeyondhealth.com/user-stories/Abhijeet.mp4",
    poster: "/posters/testimonial-4.webp",
    name: "Abhijeet",
    subtitle: "Manages his parents' health remotely",
  },
];

/* ── Inline video card (plays in-place) ── */
function VideoCard({
  item,
  isActive = true,
  preloadPoster = false,
  onPlayChange,
}: {
  item: (typeof TESTIMONIALS)[number];
  isActive?: boolean;
  preloadPoster?: boolean;
  onPlayChange?: (playing: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false); // Default to unmuted if user clicks play
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // If we transition out of active state, reset interaction
  useEffect(() => {
    if (!isActive) {
      setHasInteracted(false);
      setPlaying(false);
    }
  }, [isActive]);

  // No more first-frame rendering via currentTime, we use explicit posters


  // Notify parent of playing state changes
  useEffect(() => {
    onPlayChange?.(playing);
  }, [playing, onPlayChange]);

  // Stop playback when card becomes inactive (carousel swipe)
  useEffect(() => {
    if (!isActive && videoRef.current && playing) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
      setProgress(0);
    }
  }, [isActive, playing]);

  const togglePlay = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setPlaying(true);
      return;
    }

    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [hasInteracted]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress(v.currentTime / v.duration);
  }, []);

  const seekTo = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    const bar = progressBarRef.current;
    if (!v || !bar || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  }, []);

  return (
    <div
      className="relative cursor-pointer overflow-hidden group"
      style={{
        aspectRatio: "9 / 16",
        borderRadius: 12,
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
      onClick={togglePlay}
    >
      {hasInteracted ? (
        <video
          ref={videoRef}
          src={item.video}
          autoPlay
          playsInline
          muted={muted}
          className="absolute inset-0 h-full w-full object-cover bg-black"
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
          }}
          onTimeUpdate={onTimeUpdate}
        />
      ) : (
        <Image
          src={item.poster}
          alt={item.name}
          fill
          preload={preloadPoster}
          sizes="(max-width: 768px) calc(100vw - 48px), (max-width: 1024px) 22vw, 280px"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Gradient overlay — bottom only (hide when playing) */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none transition-opacity duration-300"
        style={{
          height: "50%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
          opacity: playing ? 0 : 1,
        }}
      />

      {/* Name + subtitle (hide when playing) */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 pointer-events-none transition-opacity duration-300"
        style={{ opacity: playing ? 0 : 1 }}
      >
        <p style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.3, color: "#fff" }}>
          {item.name}
        </p>
        <p style={{ fontSize: "14px", fontWeight: 400, lineHeight: 1.4, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
          {item.subtitle}
        </p>
      </div>

      {/* Centered play icon — visible when paused */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
        style={{ opacity: !playing ? 1 : 0 }}
      >
        <div
          className="flex items-center justify-center rounded-full w-12 h-12 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-110"
          style={{
            background: "linear-gradient(225deg, rgba(254,249,239,0.25), rgba(254,249,239,0.15))",
            backdropFilter: "blur(12px)",
          }}
        >
          <svg className="w-5 h-5 md:w-7 md:h-7" viewBox="0 0 24 24" fill="#fff">
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
        </div>
      </div>

      {/* In-place controls — visible only when playing */}
      {playing && (
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
          }}
        >
          {/* Progress bar */}
          <div
            ref={progressBarRef}
            className="cursor-pointer"
            style={{
              width: "100%",
              height: 3,
              borderRadius: 3,
              background: "rgba(255,255,255,0.3)",
              overflow: "hidden",
            }}
            onClick={seekTo}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                borderRadius: 3,
                background: "#fff",
                transition: "width 200ms linear",
              }}
            />
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
              }}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              )}
            </button>

            {/* Mute/Unmute */}
            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
              }}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mobile: single-card carousel with auto-rotate + dots ── */
function MobileCarousel() {
  const [active, setActive] = useState(0);
  const [isSomeVideoPlaying, setIsSomeVideoPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isSomeVideoPlaying) return; // Don't start timer if a video is playing

    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
  }, [isSomeVideoPlaying]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const goTo = (index: number) => {
    setActive(index);
    setIsSomeVideoPlaying(false); // New card starts as paused
    resetTimer();
  };

  const goPrev = () => {
    track("carousel_nav", { direction: "left", section: "testimonials" });
    goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };
  const goNext = () => {
    track("carousel_nav", { direction: "right", section: "testimonials" });
    goTo((active + 1) % TESTIMONIALS.length);
  };

  return (
    <div className="px-6">
      {/* Fixed height container — all cards stacked absolutely */}
      <div className="relative overflow-hidden" style={{ borderRadius: 12, height: "448px" }}>
        {TESTIMONIALS.map((item, i) => (
          <div
            key={i}
            className="absolute inset-0 h-full transition-opacity duration-500"
            style={{
              opacity: i === active ? 1 : 0,
              pointerEvents: i === active ? "auto" : "none",
              zIndex: i === active ? 1 : 0,
            }}
          >
            <div className="h-full [&>div]:!h-full [&>div]:!aspect-auto">
              <VideoCard 
                item={item} 
                isActive={i === active} 
                preloadPoster={i === 0}
                onPlayChange={(p) => {
                  if (i === active) setIsSomeVideoPlaying(p);
                }} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Arrows + dots */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={goPrev}
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-95"
          style={{ borderColor: "rgba(0,0,0,0.15)" }}
          aria-label="Previous"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className="transition-all duration-300"
              style={{
                width: i === active ? "24px" : "8px",
                height: "8px",
                borderRadius: "100px",
                background: i === active ? "#1C1917" : "rgba(28, 25, 23, 0.2)",
              }}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-95"
          style={{ borderColor: "rgba(0,0,0,0.15)" }}
          aria-label="Next"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function SocialProof() {
  return (
    <BlurSection className="bg-surface py-12 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-20">
        <div className="mb-8 text-center">
          <ScrollRevealText
            as="h2"
            id="stories"
            className="text-text-primary"
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
            highlight={{ words: ["people"], color: "#206E55", italic: false }}
          >
            Real stories from real&nbsp;people
          </ScrollRevealText>
          <p
            className="mx-auto mt-2 max-w-lg text-text-secondary"
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              fontWeight: 300,
            }}
          >
            7 million+ people trust August for health clarity. Here&apos;s
            what they have to&nbsp;say.
          </p>
        </div>
      </div>

      {/* Mobile: single card + dots */}
      <div className="md:hidden">
        <MobileCarousel />
      </div>

      {/* Desktop: 4-column grid — plays in-place */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-[1400px] px-12 lg:px-24">
          <div className="grid grid-cols-4 gap-5 lg:gap-10">
            {TESTIMONIALS.map((item, i) => (
              <VideoCard key={i} item={item} preloadPoster={i < 2} />
            ))}
          </div>
        </div>
      </div>
    </BlurSection>
  );
}
