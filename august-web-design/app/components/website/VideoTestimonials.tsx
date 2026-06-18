"use client";

import { useState, useRef, useEffect } from "react";
import { checkCountry } from "@/app/utils/checkCountry";
import { TrackedCTA } from "./TrackedCTA";

interface VideoItem {
  src: string;
  poster?: string;
}

const VIDEOS: VideoItem[] = [
  { src: "https://assets.getbeyondhealth.com/user-stories/Abhijeet.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/abhishek.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/priyanshi.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/Rupali.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/Deepu.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/Shilpa.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/Sachin.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/Rushali.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/Sheetal.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/Swathi.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/Saroj.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/Shailesh.mp4" },
  { src: "https://assets.getbeyondhealth.com/user-stories/Jai.mp4" },
];

export function VideoTestimonials({ initialCountry, initialIsMobile = false }: { initialCountry?: string | null, initialIsMobile?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(initialIsMobile);
  const [shouldShow, setShouldShow] = useState(initialCountry === "IN");
  const videoRef = useRef<HTMLVideoElement>(null);
 
  // Check country — only show for India
  useEffect(() => {
    if (!initialCountry) {
      try {
        const country = checkCountry();
        setShouldShow(country === "IN");
      } catch {
        setShouldShow(false); 
      }
    }
  }, [initialCountry]);

  // Detect mobile
  useEffect(() => {
    const check = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth <= 768
      );
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Reset video when slide changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
    }
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + VIDEOS.length) % VIDEOS.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % VIDEOS.length);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  if (!shouldShow) return null;

  const currentVideo = VIDEOS[currentIndex];

  return (
    <section className="relative bg-white overflow-hidden">
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: isMobile ? "60px 16px" : "100px 72px",
          gap: isMobile ? 36 : 60,
        }}
      >
        {/* Inner container */}
        <div
          style={{
            width: "100%",
            maxWidth: 1100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: isMobile ? 36 : 60,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Label */}
            <p
              style={{
                fontWeight: 600,
                fontFamily: "var(--font-manrope), sans-serif",
                color: "#088f7b",
                fontSize: isMobile ? 14 : 20,
                letterSpacing: "0em",
                textAlign: "center",
                lineHeight: "110%",
              }}
            >
              Video Stories
            </p>

            {/* Main heading */}
            <h2
              style={{
                fontWeight: 600,
                fontFamily: "var(--font-manrope), sans-serif",
                color: "#111111",
                fontSize: isMobile ? 28 : 36,
                letterSpacing: "-0.03em",
                textAlign: "center",
                lineHeight: "120%",
                margin: 0,
              }}
            >
              Watch real people share how August
              <br />
              changed their health journey
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontWeight: 500,
                fontFamily: "var(--font-manrope), sans-serif",
                color: "rgba(17, 17, 17, 0.7)",
                fontSize: 16,
                letterSpacing: "0em",
                textAlign: "center",
                lineHeight: "160%",
                maxWidth: 600,
              }}
            >
              From late-night anxiety to morning clarity – see how August helps
              when you need answers most.
            </p>
          </div>

          {/* Video Player */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: isMobile ? "9/16" : "16/9",
                maxHeight: isMobile ? "70vh" : 600,
                background: "#000",
                borderRadius: 8,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Video */}
              <video
                ref={videoRef}
                src={currentVideo.src}
                poster={currentVideo.poster}
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Center Play Button — hidden on mobile */}
              {!isPlaying && !isMobile && (
                <button
                  onClick={togglePlayPause}
                  aria-label="Play video"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.85)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.7)";
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                  >
                    <path d="M10 8L24 16L10 24V8Z" fill="white" />
                  </svg>
                </button>
              )}

              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                aria-label="Previous video"
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M13 15L8 10L13 5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={goToNext}
                aria-label="Next video"
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M7 5L12 10L7 15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Slide Indicators */}
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 4,
              }}
            >
              {VIDEOS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to video ${index + 1}`}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: "none",
                    background:
                      index === currentIndex
                        ? "#333"
                        : "rgba(0, 0, 0, 0.3)",
                    cursor: "pointer",
                    padding: 0,
                    transition: "background 0.2s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 500, lineHeight: '150%', color: '#1D1D1D' }}>Get free health answers now</p>
            <TrackedCTA
              href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=page_cta"
              button_name="video_testimonials"
              button_copy="Talk To August Now"
              className="w-full sm:w-auto"
              style={{ padding: isMobile ? '10px 20px' : '12px 28px', fontSize: isMobile ? 14 : 16 }}
              initialCountry={initialCountry}
            >
              Talk To August Now
            </TrackedCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
