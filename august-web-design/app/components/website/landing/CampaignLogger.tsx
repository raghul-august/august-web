'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CampaignLogger() {
  const searchParams = useSearchParams();
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) return;

    // Support standard query params, but fallback to a robust parser to handle malformed query parameters (e.g., ?country=IN?c=fardeen)
    let c = searchParams.get('c');
    if (!c) {
      try {
        const queryStr = window.location.search.replace(/\?/g, '&');
        const robustParams = new URLSearchParams(queryStr);
        c = robustParams.get('c');
      } catch {
        // Fallback silently if URL reading fails
      }
    }

    if (!c) return; // Only log if the campaign 'c' parameter is present

    hasLogged.current = true;

    const getCountryFromTimezone = () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone === 'Asia/Kolkata' || timezone === 'Asia/Calcutta') {
          return 'IN';
        }
      } catch {
        // Fallback to undefined on error
      }
      return undefined;
    };

    const country = (searchParams.get('country') ?? getCountryFromTimezone() ?? '').toLowerCase() || undefined;
    const device_os = /Android/i.test(navigator.userAgent)
      ? 'Android'
      : /iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? 'iOS'
      : 'Web';

    const logCampaignVisit = async () => {
      try {
        await fetch('/api/redirect-logger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: window.location.href,
            channel: 'campaign_referral',
            device_os,
            country,
            utm: searchParams.get('utm') || undefined,
            phone: searchParams.get('phone') || undefined,
            c,
            meta: {
              user_agent: navigator.userAgent,
              screen: { width: window.screen.width, height: window.screen.height },
              referrer: document.referrer || undefined,
            },
          }),
        });
      } catch (err) {
        // Silently catch logging errors so it doesn't affect user experience
        console.error('Failed to log campaign visit:', err);
      }
    };

    logCampaignVisit();
  }, [searchParams]);

  return null;
}
