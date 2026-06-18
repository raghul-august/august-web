'use client';

import { useRef, useEffect } from 'react';

interface WaveformCanvasProps {
  analyserNode: AnalyserNode | null;
  className?: string;
  barColor?: string;
  barWidth?: number;
  gap?: number;
  minBarHeight?: number;
}

export function WaveformCanvas({
  analyserNode,
  className = '',
  barColor = '#206E55',
  barWidth = 3,
  gap = 2,
  minBarHeight = 4,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const prevBarsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const barCount = Math.floor(rect.width / (barWidth + gap));

      if (analyserNode) {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);
        const step = Math.floor(bufferLength / barCount);

        // Initialize previous bars array if needed
        if (prevBarsRef.current.length !== barCount) {
          prevBarsRef.current = new Array(barCount).fill(0);
        }

        for (let i = 0; i < barCount; i++) {
          const dataIndex = i * step;
          const raw = dataArray[dataIndex] / 255;
          // Lerp for smoothing
          const smoothed = prevBarsRef.current[i] + (raw - prevBarsRef.current[i]) * 0.3;
          prevBarsRef.current[i] = smoothed;

          const barHeight = Math.max(minBarHeight, smoothed * rect.height * 0.85);
          const x = i * (barWidth + gap);
          const y = (rect.height - barHeight) / 2;

          ctx.fillStyle = barColor;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 1.5);
          ctx.fill();
        }
      } else {
        // Idle state — small static bars
        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + gap);
          const y = (rect.height - minBarHeight) / 2;

          ctx.fillStyle = barColor;
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, minBarHeight, 1.5);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [analyserNode, barColor, barWidth, gap, minBarHeight]);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%' }} />;
}
