'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight ScrollReveal component using IntersectionObserver.
 * Replaces AOS to reduce bundle size while maintaining same functionality.
 */
export default function ScrollReveal({ children, animation = 'fade-up', delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const getAnimationStyles = () => {
    const baseTransitions = {
      transitionProperty: 'opacity, transform',
      transitionDuration: '800ms',
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      transitionDelay: `${delay}ms`,
    };

    const states = {
      'fade-up': {
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        opacity: isVisible ? 1 : 0,
      },
      'fade-down': {
        transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
        opacity: isVisible ? 1 : 0,
      },
      'fade-left': {
        transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
        opacity: isVisible ? 1 : 0,
      },
      'fade-right': {
        transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
        opacity: isVisible ? 1 : 0,
      },
      'zoom-in': {
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        opacity: isVisible ? 1 : 0,
      },
    };

    return { ...baseTransitions, ...(states[animation] || states['fade-up']) };
  };

  return (
    <div ref={ref} style={getAnimationStyles()}>
      {children}
    </div>
  );
}

// Global hook for backward compatibility if needed (now a no-op)
export function useScrollReveal() {}
