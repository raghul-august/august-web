'use client';

import { useEffect, useState } from 'react';

export function LandscapeBlocker() {
  const [showBlocker, setShowBlocker] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isPhoneInLandscape = window.matchMedia('(orientation: landscape) and (max-height: 500px) and (pointer: coarse)').matches;

      setShowBlocker(isPhoneInLandscape);
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!showBlocker) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      {/* Rotate icon */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#206E55"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: '24px' }}
      >
        <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2" />
        <path d="m15.194 13.707 3.814 1.86-1.86 3.814" />
        <path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4" />
      </svg>

      <h2
        style={{
          fontFamily: '"SF Pro", system-ui, -apple-system, sans-serif',
          fontSize: '20px',
          fontWeight: 600,
          color: '#141515',
          margin: '0 0 12px 0',
        }}
      >
        Please rotate your device
      </h2>

      <p
        style={{
          fontFamily: '"SF Pro", system-ui, -apple-system, sans-serif',
          fontSize: '16px',
          fontWeight: 400,
          color: '#8A9390',
          margin: 0,
          maxWidth: '280px',
        }}
      >
        August works best in portrait mode
      </p>
    </div>
  );
}
