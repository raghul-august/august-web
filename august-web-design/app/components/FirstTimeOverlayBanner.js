'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { track } from '@/app/utils/analytics';


export default function AppPromoHeaderBanner({ onClose, langStrings, pageType, articleSlug }) {
  const [isVisible, setIsVisible] = useState(true);
  const showTimeRef = useRef(null);
  const hasTrackedShow = useRef(false);

  // Track when banner becomes visible
  useEffect(() => {
    if (isVisible && !hasTrackedShow.current) {
      hasTrackedShow.current = true;
      showTimeRef.current = Date.now();

      track('welcome_banner_shown', {
        event_category: 'Conversion Funnel',
        page_type: pageType || 'unknown',
        article_slug: articleSlug || 'unknown',
        language: langStrings?.language || 'en',
        viewport_width: typeof window !== 'undefined' ? window.innerWidth : 0,
        is_mobile: typeof window !== 'undefined' && window.innerWidth < 768
      });
    }
  }, [isVisible, pageType, articleSlug, langStrings]);

  const handleClose = () => {
    // Track dismiss
    track('welcome_banner_dismissed', {
      event_category: 'Conversion Funnel',
      page_type: pageType || 'unknown',
      article_slug: articleSlug || 'unknown',
      language: langStrings?.language || 'en',
      time_visible_ms: showTimeRef.current ? Date.now() - showTimeRef.current : null,
      is_mobile: typeof window !== 'undefined' && window.innerWidth < 768
    });

    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleUseApp = () => {
    // Track CTA click
    track('welcome_banner_cta_clicked', {
      event_category: 'Conversion Funnel',
      page_type: pageType || 'unknown',
      article_slug: articleSlug || 'unknown',
      language: langStrings?.language || 'en',
      time_visible_ms: showTimeRef.current ? Date.now() - showTimeRef.current : null,
      is_mobile: typeof window !== 'undefined' && window.innerWidth < 768
    });

    window.open('https://join.meetaugust.ai/?c=health_lib_banner', '_blank');
  };

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Dim Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={handleClose}
      />
      
      {/* Sticky Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-[#206E55] shadow-lg z-[9999] border-t border-[#1a5a46]"
      >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Text */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
                <Image
                  src="https://res.cloudinary.com/dpgnd3ad7/image/upload/v1738557729/august_logo_green_nd4fn9.svg"
                  alt="Health Library Logo"
                  width={32}
                  height={32}
                  className="h-6 w-auto"
                  priority
                />
              </div>
            </div>
            <div className="text-white">
              <p className="font-medium">{langStrings?.headerTitle || 'Get The App'}</p>
              <p className="text-sm opacity-90">{langStrings?.headerSubtitle || 'For Better Experience'}</p>
            </div>
          </div>

          {/* Right side - Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleUseApp}
              className="bg-white text-[#206E55] px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              {langStrings?.useAppButton || 'Download Now'}
            </button>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}