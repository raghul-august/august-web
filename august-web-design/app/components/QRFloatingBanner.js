'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import Image from 'next/image';

export default function QRFloatingBanner() {
  const [visible, setVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1200px)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (!isDesktop) return null;

  return (
    <div
      className="qr-floating-banner"
      style={{
        position: 'fixed',
        bottom: 40,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(4px) saturate(200%)',
        WebkitBackdropFilter: 'blur(4px) saturate(200%)',
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.3)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        width: 262,
        height: 124,
        padding: '16px 24px',
        boxSizing: 'border-box',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease',
        transformOrigin: 'bottom right',
      }}
    >
      <Image
        src="/qr-download-august.png"
        alt="QR code to download August"
        width={76}
        height={76}
        style={{ borderRadius: 4 }}
      />
      <Typography
        sx={{
          fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
          fontSize: '1.3rem',
          fontWeight: 400,
          lineHeight: 1.3,
          color: '#1a1a1a',
          whiteSpace: 'pre-line',
          textAlign: 'center',
        }}
      >
        {'Download\naugust'}
      </Typography>
      <style jsx global>{`
        .qr-floating-banner {
          right: max(calc((100vw - 720px) / 2 - 310px - 40px + (280px - 262px) / 2), 20px);
        }
        @media (min-width: 1200px) and (max-width: 1439px) {
          .qr-floating-banner { transform: scale(0.85); }
        }
        @media (min-width: 1440px) and (max-width: 1999px) {
          .qr-floating-banner { transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}
