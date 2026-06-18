'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface FastenConnectWidgetProps {
  publicId: string;
  externalId: string;
  externalState: string;
  onEventBus?: (data: unknown) => void;
  className?: string;
}

interface FastenWidgetParams {
  publicId: string;
  externalId?: string;
  externalState?: string;
  searchOnly?: boolean;
  searchQuery?: string;
  showSplash?: boolean;
  eventTypes?: string;
}

function encodeOptionsAsQueryStringParameters(params: FastenWidgetParams): string {
  const urlParams = new URLSearchParams();
  urlParams.append('public-id', params.publicId);

  if (params.externalId) {
    urlParams.append('external-id', params.externalId);
  }
  if (params.externalState) {
    urlParams.append('external-state', params.externalState);
  }
  if (params.searchOnly) {
    urlParams.append('search-only', params.searchOnly.toString());
    if (params.searchQuery) {
      urlParams.append('search-query', params.searchQuery);
    }
  }
  if (params.showSplash) {
    urlParams.append('show-splash', params.showSplash.toString());
  }
  if (params.eventTypes) {
    urlParams.append('event-types', params.eventTypes);
  }
  return urlParams.toString();
}

export function FastenConnectWidget({
  publicId,
  externalId,
  externalState,
  onEventBus,
  className = '',
}: FastenConnectWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const queryString = encodeOptionsAsQueryStringParameters({
    publicId,
    externalId,
    externalState,
  });

  const iframeUrl = `https://embed.connect.fastenhealth.com/?${queryString}`;

  // Listen for messages from the Fasten iframe
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Only accept messages from Fasten
      if (!event.origin.includes('fastenhealth.com')) return;

      const { data } = event;
      if (!data) return;

      let message: Record<string, unknown>;
      try {
        message = typeof data === 'string' ? JSON.parse(data) : data;
      } catch {
        return;
      }

      console.log('[Fasten] Raw message:', message);

      // Handle events meant for external consumers (wrapped format)
      if (message.to === 'FASTEN_CONNECT_EXTERNAL' && message.payload) {
        try {
          const payload =
            typeof message.payload === 'string'
              ? JSON.parse(message.payload)
              : message.payload;

          console.log('[Fasten] Event received:', payload.event_type);

          if (onEventBus) {
            onEventBus(payload);
          }
        } catch (e) {
          console.error('[Fasten] Failed to parse payload:', e);
        }
        return;
      }

      // Handle direct event format (e.g., widget.close, client-event)
      if (message.event_type && onEventBus) {
        console.log('[Fasten] Direct event received:', message.event_type);
        onEventBus(message);
      }
    },
    [onEventBus]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  const handleIframeLoad = useCallback(() => {
    console.log('[Fasten] Iframe loaded');
    setIsLoading(false);
  }, []);

  return (
    <div className={`relative w-full h-full bg-white ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10 animate-fade-in">
          <div className="flex flex-col items-center gap-5">
            {/* Logo */}
            <img
              src="/august-logo.svg"
              alt="August"
              className="h-10 w-auto mb-2"
              onError={(e) => {
                // Hide if logo not found
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />

            {/* Shimmer text with animated dots */}
            <div className="flex items-center gap-0.5">
              <span className="shimmer-text text-lg font-medium">
                Redirecting you to your EHR partner
              </span>
              <span className="flex ml-0.5">
                <span className="animated-dot text-lg font-medium text-[#697570]" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animated-dot text-lg font-medium text-[#697570]" style={{ animationDelay: '200ms' }}>.</span>
                <span className="animated-dot text-lg font-medium text-[#697570]" style={{ animationDelay: '400ms' }}>.</span>
              </span>
            </div>
          </div>

          <style jsx>{`
            @keyframes shimmer {
              0% {
                background-position: -200% center;
              }
              100% {
                background-position: 200% center;
              }
            }

            @keyframes dot-pulse {
              0%, 60%, 100% {
                opacity: 0.3;
                transform: translateY(0);
              }
              30% {
                opacity: 1;
                transform: translateY(-2px);
              }
            }

            @keyframes fade-in {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            .animate-fade-in {
              animation: fade-in 0.5s ease-out;
            }

            .shimmer-text {
              color: #697570;
              background: linear-gradient(
                90deg,
                #697570 0%,
                #697570 40%,
                rgba(255, 255, 255, 0.9) 50%,
                #697570 60%,
                #697570 100%
              );
              background-size: 200% auto;
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: shimmer 2s ease-in-out infinite;
            }

            .animated-dot {
              animation: dot-pulse 1.4s ease-in-out infinite;
            }
          `}</style>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className="w-full h-full border-0"
        allow="camera; microphone"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation"
        onLoad={handleIframeLoad}
        title="Connect Health Records"
      />
    </div>
  );
}
