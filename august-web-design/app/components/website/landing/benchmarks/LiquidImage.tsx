"use client";
import { useRef, useEffect, useState, useCallback } from "react";

const vertexSrc = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0, 1);
}
`;

const fragmentSrc = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_strength;
uniform float u_speed;
uniform vec2 u_resolution;
#define MAX_WAKE 16
uniform int u_wakeCount;
uniform vec3 u_wake[MAX_WAKE];
uniform float u_maskRadius;
void main() {
    vec2 uv = v_uv;
    float total = 0.0;
    for (int i = 0; i < MAX_WAKE; ++i) {
        if (i >= u_wakeCount) break;
        vec2 w = u_wake[i].xy;
        float t = u_time - u_wake[i].z;
        float dist = distance(uv, w);
        float amp = exp(-dist * 16.0) * exp(-t * 1.2);
        float ripple = sin(32.0 * dist - t * 8.0 * u_speed) * 0.04;
        uv += normalize(uv - w) * ripple * u_strength * amp * 2.0;
    }
    if (u_mouse.x >= 0.0 && u_mouse.x <= 1.0 && u_mouse.y >= 0.0 && u_mouse.y <= 1.0) {
        float dist = distance(uv, u_mouse);
        float ripple = sin(32.0 * dist - u_time * 8.0 * u_speed) * 0.04;
        float effect = exp(-dist * 12.0);
        uv += normalize(uv - u_mouse) * ripple * u_strength * effect * 2.0;
    }
    uv = clamp(uv, 0.0, 1.0);
    vec4 color = texture2D(u_image, uv);
    gl_FragColor = color;
}
`;

export interface LiquidImageProps {
  src: string;
  alt?: string;
  strength?: number;
  speed?: number;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function LiquidImage({
  src,
  alt = "",
  strength = 0.15,
  speed = 0.18,
  borderRadius = 8,
  className,
  style,
}: LiquidImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 400, height: 300 });
  const sizeRef = useRef({ width: 400, height: 300 });
  const dprRef = useRef(1);
  const mouseRef = useRef({ x: -10, y: -10, active: false });
  const maskRadiusRef = useRef(0);
  const wakeRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const hoveredRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const resize = (entries: ResizeObserverEntry[]) => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      for (const entry of entries) {
        const w = Math.round(entry.contentRect.width * dpr);
        const h = Math.round(entry.contentRect.height * dpr);
        if (w > 0 && h > 0) {
          sizeRef.current = { width: w, height: h };
          setSize({ width: w, height: h }); // Trigger re-render to update canvas attributes
        }
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x: number, y: number;
    if ("touches" in e && e.touches.length > 0) {
      x = (e.touches[0].clientX - rect.left) / rect.width;
      y = (e.touches[0].clientY - rect.top) / rect.height;
    } else if ("clientX" in e) {
      x = (e.clientX - rect.left) / rect.width;
      y = (e.clientY - rect.top) / rect.height;
    } else return;
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    mouseRef.current = { x, y, active: true };
    hoveredRef.current = true;
    const now = Date.now();
    wakeRef.current = [
      ...wakeRef.current.filter((w) => now - w.t < 1200),
      { x, y, t: now },
    ].slice(-8);
  }, []);

  const handleLeave = useCallback(() => {
    mouseRef.current = { ...mouseRef.current, active: false };
    hoveredRef.current = false;
  }, []);

  useEffect(() => {
    let animId: number;
    let lastHovered = false;
    let start: number | null = null;
    let from = 0;
    let to = 0;
    const duration = 650;
    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function animate(ts: number) {
      const hovered = hoveredRef.current;
      if (hovered !== lastHovered) {
        lastHovered = hovered;
        start = ts;
        from = maskRadiusRef.current;
        to = hovered ? 1.5 : 0;
      }
      if (start === null) start = ts;
      const elapsed = Math.min((ts - start) / duration, 1);
      const eased = easeInOutCubic(elapsed);
      maskRadiusRef.current = from + (to - from) * eased;
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const gl = canvasRef.current.getContext("webgl");
    if (!gl) return;

    let animationId: number;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    let tex: WebGLTexture | null = null;
    let program: WebGLProgram | null = null;
    let uTime: WebGLUniformLocation | null = null;
    let uMouse: WebGLUniformLocation | null = null;
    let uStrength: WebGLUniformLocation | null = null;
    let uSpeed: WebGLUniformLocation | null = null;
    let uResolution: WebGLUniformLocation | null = null;
    let uWake: WebGLUniformLocation | null = null;
    let uWakeCount: WebGLUniformLocation | null = null;
    let uMaskRadius: WebGLUniformLocation | null = null;
    const startTime = Date.now();
    let loaded = false;

    // Offscreen canvas for texture resizing
    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d")!;

    function createShader(type: number, source: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, source);
      gl!.compileShader(s);
      return s;
    }

    function setup() {
      const vs = createShader(gl!.VERTEX_SHADER, vertexSrc);
      const fs = createShader(gl!.FRAGMENT_SHADER, fragmentSrc);
      if (!vs || !fs) return;
      program = gl!.createProgram();
      if (!program) return;
      gl!.attachShader(program, vs);
      gl!.attachShader(program, fs);
      gl!.linkProgram(program);
      gl!.useProgram(program);

      const pos = gl!.createBuffer();
      gl!.bindBuffer(gl!.ARRAY_BUFFER, pos);
      gl!.bufferData(
        gl!.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl!.STATIC_DRAW
      );
      const loc = gl!.getAttribLocation(program, "a_position");
      gl!.enableVertexAttribArray(loc);
      gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);

      uTime = gl!.getUniformLocation(program, "u_time");
      uMouse = gl!.getUniformLocation(program, "u_mouse");
      uStrength = gl!.getUniformLocation(program, "u_strength");
      uSpeed = gl!.getUniformLocation(program, "u_speed");
      uResolution = gl!.getUniformLocation(program, "u_resolution");
      uWake = gl!.getUniformLocation(program, "u_wake");
      uWakeCount = gl!.getUniformLocation(program, "u_wakeCount");
      uMaskRadius = gl!.getUniformLocation(program, "u_maskRadius");

      tex = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, img);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.uniform1i(gl!.getUniformLocation(program, "u_image"), 0);
      loaded = true;
    }

    function updateTexture() {
      if (!tex || !loaded) return;
      const { width, height } = sizeRef.current;
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
      
      offCanvas.width = width;
      offCanvas.height = height;
      const iw = img.width, ih = img.height;
      if (iw === 0 || ih === 0) return;

      const scale = Math.max(width / iw, height / ih);
      const sw = iw * scale, sh = ih * scale;
      const sx = (width - sw) / 2, sy = (height - sh) / 2;
      
      offCtx.clearRect(0, 0, width, height);
      offCtx.drawImage(img, sx, sy, sw, sh);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, offCanvas);
    }

    function render() {
      if (!loaded) return;
      const { width, height } = sizeRef.current;
      updateTexture();
      gl!.viewport(0, 0, width, height);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      const now = (Date.now() - startTime) / 1000;
      gl!.uniform1f(uTime, now);
      let mx = mouseRef.current.active ? Math.max(0, Math.min(1, mouseRef.current.x)) : -10;
      let my = mouseRef.current.active ? Math.max(0, Math.min(1, mouseRef.current.y)) : -10;
      my = 1 - my;
      gl!.uniform2f(uMouse, mx, my);
      gl!.uniform1f(uStrength, strength * 2.5);
      gl!.uniform1f(uSpeed, speed);
      gl!.uniform2f(uResolution, width, height);

      const wakeArr = wakeRef.current;
      const wakeData = new Float32Array(16 * 3);
      let count = Math.min(wakeArr.length, 16);
      for (let i = 0; i < count; ++i) {
        const w = wakeArr[i];
        wakeData[i * 3 + 0] = w.x;
        wakeData[i * 3 + 1] = 1 - w.y;
        wakeData[i * 3 + 2] = (w.t - startTime) / 1000;
      }
      gl!.uniform1i(uWakeCount, count);
      gl!.uniform3fv(uWake, wakeData);
      gl!.uniform1f(uMaskRadius, maskRadiusRef.current);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }

    img.onload = () => {
      setup();
      render();
    };
    if (img.complete) {
      setup();
      render();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [src, strength, speed]);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius,
        ...style,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchMove={handleMove}
      onTouchEnd={handleLeave}
    >
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        style={{ 
          width: "100%", 
          height: "100%", 
          display: "block", 
          borderRadius,
          position: "absolute",
          inset: 0
        }}
        aria-label={alt}
      />
    </div>
  );
}
