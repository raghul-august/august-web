"use client";

import { useState, useCallback, useRef } from "react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v) setCurrentTime(v.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setShowControls(true);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const v = videoRef.current;
      const bar = progressRef.current;
      if (!v || !bar) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      v.currentTime = ratio * v.duration;
    },
    []
  );

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (playing) {
      hideTimeout.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, [playing]);

  const handleFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="im-video-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        preload="metadata"
        playsInline
        poster={poster}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Big center play button - shown before first play or when paused */}
      {!playing && (
        <button className="im-vp-play-overlay" onClick={togglePlay} aria-label="Play video">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.45)" />
            <path d="M19 15L35 24L19 33V15Z" fill="white" />
          </svg>
        </button>
      )}

      {/* Bottom controls bar */}
      <div className={`im-vp-controls ${showControls || !playing ? "im-vp-controls--visible" : ""}`}>
        {/* Play/Pause */}
        <button className="im-vp-btn" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <rect x="5" y="3" width="5" height="18" rx="1" />
              <rect x="14" y="3" width="5" height="18" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M6 3L20 12L6 21V3Z" />
            </svg>
          )}
        </button>

        {/* Time */}
        <span className="im-vp-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Progress bar */}
        <div className="im-vp-progress" ref={progressRef} onClick={handleProgressClick}>
          <div className="im-vp-progress-fill" style={{ width: `${progress}%` }} />
          <div className="im-vp-progress-handle" style={{ left: `${progress}%` }} />
        </div>

        {/* Fullscreen */}
        <button className="im-vp-btn" onClick={handleFullscreen} aria-label="Fullscreen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
