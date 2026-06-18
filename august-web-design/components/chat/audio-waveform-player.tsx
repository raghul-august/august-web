'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { trackTelehealth } from '@/services/telehealth-analytics';
import { useAuthStore } from '@/stores/auth-store';

interface AudioWaveformPlayerProps {
  url: string;
}

/**
 * Waveform-based audio player for voice messages.
 * Replaces the plain <audio> tag. Uses Web Audio API to decode
 * and visualize the audio waveform, with playback progress.
 *
 * Mirrors mobile's AudioWaveformPlayer component.
 */
export const AudioWaveformPlayer = React.memo(function AudioWaveformPlayer({ url }: AudioWaveformPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [error, setError] = useState(false);

  // Generate waveform data from audio buffer
  const generateWaveformData = useCallback(async (audioUrl: string) => {
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const barCount = 50; // Number of waveform bars
      const samplesPerBar = Math.floor(rawData.length / barCount);
      const bars: number[] = [];

      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        const start = i * samplesPerBar;
        for (let j = start; j < start + samplesPerBar && j < rawData.length; j++) {
          sum += Math.abs(rawData[j]);
        }
        bars.push(sum / samplesPerBar);
      }

      // Normalize to 0-1
      const max = Math.max(...bars, 0.01);
      const normalized = bars.map((b) => b / max);

      await audioContext.close();
      return normalized;
    } catch (err) {
      // If waveform generation fails, use placeholder bars
      return Array.from({ length: 50 }, () => 0.2 + Math.random() * 0.6);
    }
  }, []);

  // Initialize audio and waveform
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsLoading(true);
      setError(false);

      try {
        // Load waveform data
        const data = await generateWaveformData(url);
        if (!isMounted) return;
        setWaveformData(data);

        // Create audio element
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.preload = 'metadata';
        audio.src = url;

        audio.onloadedmetadata = () => {
          if (!isMounted) return;
          setAudioDuration(audio.duration);
          setIsLoading(false);
        };

        audio.onended = () => {
          if (!isMounted) return;
          setIsPlaying(false);
          setCurrentTime(0);
        };

        audio.onerror = () => {
          if (!isMounted) return;
          setError(true);
          setIsLoading(false);
        };

        audioRef.current = audio;
      } catch {
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [url, generateWaveformData]);

  // Update currentTime during playback
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const update = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      animationRef.current = requestAnimationFrame(update);
    };
    animationRef.current = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const barWidth = 3;
    const gap = 2;
    const totalBarWidth = barWidth + gap;
    const barsToFit = Math.min(waveformData.length, Math.floor(rect.width / totalBarWidth));

    const progress = audioDuration > 0 ? currentTime / audioDuration : 0;
    const progressBarIndex = Math.floor(progress * barsToFit);

    for (let i = 0; i < barsToFit; i++) {
      const value = waveformData[Math.floor((i / barsToFit) * waveformData.length)];
      const barHeight = Math.max(4, value * rect.height * 0.8);

      const x = i * totalBarWidth;
      const y = (rect.height - barHeight) / 2;

      // Played bars = dark, unplayed = semi-transparent
      ctx.fillStyle = i <= progressBarIndex ? '#141515' : 'rgba(20, 21, 21, 0.3)';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 1.5);
      ctx.fill();
    }
  }, [waveformData, currentTime, audioDuration]);

  const hasTrackedViewRef = useRef(false);
  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        if (!hasTrackedViewRef.current) {
          hasTrackedViewRef.current = true;
          trackTelehealth('user_viewed_media', {
            source: useAuthStore.getState().isAuthenticated
              ? 'telehealth_loggeinuser_chat'
              : 'telehealth_anon_chat',
            media_type: 'audio',
          });
        }
      } catch (err) {
        setError(true);
      }
    }
  }, [isPlaying]);

  // Seek on canvas click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const audio = audioRef.current;
      if (!canvas || !audio || !audioDuration) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const progress = x / rect.width;
      const newTime = progress * audioDuration;

      audio.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [audioDuration]
  );

  // Format time as M:SS
  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '16px',
          background: '#EDEBE5',
          color: '#767F7C',
          fontSize: '13px',
        }}
      >
        <span>Unable to play audio</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: '24px',
        background: '#EDEBE5',
        minWidth: '240px',
        maxWidth: '300px',
      }}
    >
      {/* Play/Pause button with increased hit-slop */}
      <button
        type="button"
        onClick={handlePlayPause}
        disabled={isLoading}
        style={{
          background: 'none',
          border: 'none',
          cursor: isLoading ? 'default' : 'pointer',
          padding: '10px', // Increased hit-slop
          margin: '-6px', // Offset padding to keep layout tight
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-[#141515] animate-spin" />
        ) : isPlaying ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#141515">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#141515">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
 
      {/* Waveform */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          flex: 1,
          height: '34px', // Larger waveform as requested
          cursor: audioDuration ? 'pointer' : 'default',
        }}
      />

      {/* Duration */}
      <span
        style={{
          color: '#141515',
          fontSize: '13px',
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
          minWidth: '35px',
          textAlign: 'right',
        }}
      >
        {isPlaying ? formatTime(currentTime) : formatTime(audioDuration)}
      </span>
    </div>
  );
});
