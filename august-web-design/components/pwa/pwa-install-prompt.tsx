'use client';

import { Share, Plus, X, MoreVertical, Download } from 'lucide-react';
import type { Platform } from '@/hooks/use-pwa-install';

/**
 * Responsive install guide — bottom sheet on mobile, centered dialog on desktop.
 * Shows platform-specific instructions for installing the PWA.
 */
export function InstallGuide({ platform, onDismiss }: { platform: Platform; onDismiss: () => void }) {
  return (
    <>
      <style>{responsiveCSS}</style>
      <div className="pwa-guide-overlay" onClick={onDismiss}>
        <div className="pwa-guide-sheet" onClick={(e) => e.stopPropagation()}>
          {/* Close button */}
          <button onClick={onDismiss} className="pwa-guide-close" aria-label="Close">
            <X size={16} />
          </button>

          {/* App icon + header */}
          <div className="pwa-guide-header">
            <img src="/icons/favicon.png" alt="August" className="pwa-guide-icon" />
            <div>
              <p className="pwa-guide-title">Install August</p>
              <p className="pwa-guide-subtitle">Get the full app experience</p>
            </div>
          </div>

          {/* Divider */}
          <div className="pwa-guide-divider" />

          {/* Platform-specific steps */}
          <div className="pwa-guide-steps">
            {platform === 'ios' ? (
              <>
                <Step num={1}>
                  Tap the <Share size={15} className="pwa-guide-inline-icon" /> <strong>Share</strong> button in Safari
                </Step>
                <Step num={2}>
                  Scroll down &amp; tap <Plus size={15} className="pwa-guide-inline-icon" /> <strong>Add to Home Screen</strong>
                </Step>
              </>
            ) : platform === 'android' ? (
              <>
                <Step num={1}>
                  Tap <MoreVertical size={15} className="pwa-guide-inline-icon" /> in your browser menu
                </Step>
                <Step num={2}>
                  Tap <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>
                </Step>
              </>
            ) : (
              <>
                <Step num={1}>
                  Click the <Download size={15} className="pwa-guide-inline-icon" /> <strong>install icon</strong> in your browser&apos;s address bar
                </Step>
                <Step num={2}>
                  Click <strong>&quot;Install&quot;</strong> in the prompt that appears
                </Step>
              </>
            )}
          </div>

          {/* Dismiss button */}
          <button className="pwa-guide-dismiss" onClick={onDismiss}>
            Got it
          </button>
        </div>
      </div>
    </>
  );
}

function Step({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <div className="pwa-guide-step">
      <span className="pwa-guide-step-num">{num}</span>
      <p className="pwa-guide-step-text">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Responsive CSS (injected via <style> to avoid Tailwind dependency) */
/* ------------------------------------------------------------------ */

const responsiveCSS = `
  .pwa-guide-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 12px;
    animation: pwa-fade-in 0.25s ease-out;
    user-select: none;
    -webkit-user-select: none;
  }

  .pwa-guide-sheet {
    position: relative;
    width: 100%;
    max-width: 400px;
    background: #1c1c1e;
    background: linear-gradient(to bottom right, #1c1c1e, #141415);
    border-radius: 24px;
    padding: 24px;
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
    color: #fff;
    box-shadow: 0 -10px 50px rgba(0, 0, 0, 0.6);
    animation: pwa-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .pwa-guide-close {
    position: absolute;
    top: 14px;
    right: 14px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
  }
  .pwa-guide-close:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    transform: scale(1.05);
  }
  .pwa-guide-close:active {
    transform: scale(0.95);
  }

  .pwa-guide-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-right: 40px;
  }

  .pwa-guide-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    flex-shrink: 0;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    object-fit: contain;
    background: #000;
  }

  .pwa-guide-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .pwa-guide-subtitle {
    margin: 4px 0 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.4;
  }

  .pwa-guide-divider {
    height: 1px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.1), transparent);
    margin-bottom: 20px;
  }

  .pwa-guide-steps {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  .pwa-guide-step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .pwa-guide-step-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(59, 169, 125, 0.15);
    color: #3BA97D;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
    border: 1px solid rgba(59, 169, 125, 0.2);
  }

  .pwa-guide-step-text {
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.85);
  }
  .pwa-guide-step-text strong {
    color: #fff;
    font-weight: 600;
  }

  .pwa-guide-inline-icon {
    vertical-align: text-bottom;
    margin: 0 4px;
    color: #3BA97D;
  }

  .pwa-guide-dismiss {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 14px;
    background: #3BA97D;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(59, 169, 125, 0.2);
  }
  .pwa-guide-dismiss:hover {
    background: #45bf8f;
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(59, 169, 125, 0.3);
  }
  .pwa-guide-dismiss:active {
    transform: translateY(0);
  }

  /* Very small screens (iPhone SE, etc.) */
  @media (max-width: 360px) {
    .pwa-guide-sheet {
      padding: 20px;
    }
    .pwa-guide-title {
      font-size: 18px;
    }
    .pwa-guide-subtitle {
      font-size: 13px;
    }
    .pwa-guide-step-text {
      font-size: 14px;
    }
    .pwa-guide-icon {
      width: 48px;
      height: 48px;
    }
  }

  /* Desktop View */
  @media (min-width: 768px) {
    .pwa-guide-overlay {
      align-items: center;
      padding: 24px;
    }
    .pwa-guide-sheet {
      max-width: 420px;
      padding: 32px;
      border-radius: 28px;
      animation: pwa-scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .pwa-guide-dismiss {
       max-width: 200px;
       margin-left: auto;
       display: block;
    }
  }

  @keyframes pwa-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes pwa-slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes pwa-scale-in {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;
