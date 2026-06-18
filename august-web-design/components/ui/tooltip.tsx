'use client';

import { ReactNode, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, position = 'right', className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; transform: string } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(hover: none)').matches);
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;
    let top = 0;
    let left = 0;
    let transform = '';
    switch (position) {
      case 'top':
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
      default:
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        transform = 'translate(0, -50%)';
        break;
    }
    setCoords({ top, left, transform });
  }, [isVisible, position, content]);

  if (isTouchDevice) {
    return <div className={`relative flex ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={triggerRef}
      className={`relative flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {mounted && isVisible && coords &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: coords.transform,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap"
            role="tooltip"
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  );
}
