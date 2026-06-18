'use client';

import { useState, useEffect } from 'react';
import { Bookmark, X } from 'lucide-react';

const STORAGE_KEY = 'august-bookmark-banner-dismissed';

/**
 * Desktop-only inline banner below the navbar nudging users to bookmark the page.
 * Shown once; dismissed state is persisted in localStorage.
 */
export function BookmarkBanner() {
  const [visible, setVisible] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // Only show on desktop (screen width >= 768px)
    if (window.innerWidth < 768) return;

    // Don't show if already dismissed
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Don't show if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Improved platform detection
    const platform = (window.navigator as any).userAgentData?.platform || window.navigator.platform || '';
    setIsMac(/Mac|iPhone|iPod|iPad/i.test(platform));
    
    setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!visible) return null;

  const shortcut = isMac ? '⌘D' : 'Ctrl+D';

  return (
    <>
      <style>{css}</style>
      <div className="bookmark-banner">
        <div className="bookmark-banner-content">
          <Bookmark size={14} className="bookmark-banner-icon" />
          <span>
            Press <kbd className="bookmark-banner-kbd">{shortcut}</kbd> to bookmark August for quick access
          </span>
        </div>
        <button className="bookmark-banner-close" onClick={dismiss} aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
    </>
  );
}

const css = `
  .bookmark-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 20px;
    background: rgba(45, 120, 90, 0.9); /* Significantly darker and more solid */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 2px solid rgba(59, 169, 125, 0.4);
    color: #fff;
    font-size: 13.5px;
    font-weight: 500;
    line-height: 1.4;
    animation: bookmark-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .bookmark-banner-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .bookmark-banner-icon {
    color: #4ade80; /* Brighter green icon */
    flex-shrink: 0;
  }

  .bookmark-banner-kbd {
    display: inline-block;
    padding: 2px 7px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 5px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    line-height: 1.4;
  }

  .bookmark-banner-close {
    background: rgba(255, 255, 255, 0.12);
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 5px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    transition: all 0.2s ease;
    opacity: 0.8;
  }
  .bookmark-banner-close:hover {
    background: rgba(255, 255, 255, 0.2);
    opacity: 1;
    transform: scale(1.05);
  }
  .bookmark-banner-close:active {
    transform: scale(0.95);
  }

  @keyframes bookmark-slide-down {
    from { opacity: 0; transform: translateY(-100%); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
