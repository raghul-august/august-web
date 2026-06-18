'use client';
import { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';

const phoneNumbers: Record<string, string> = {
  'us': '+17027428310',
  'india': '+918738030604',
};

export default function RedirectSlugPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) return; // Prevent second execution
    hasLogged.current = true;

    if (!slug || typeof slug !== 'string') {
      window.location.href = '/';
      return;
    }

    const getCountryFromTimezone = () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone === 'Asia/Kolkata' || timezone === 'Asia/Calcutta') {
          return 'IN';
        }
      } catch {
        // Ignore timezone detection failures and fall back to undefined
      }
      return undefined;
    };

    const country = (searchParams.get('country') ?? getCountryFromTimezone() ?? '').toLowerCase() || undefined;
    const message = searchParams.get('message');
    const phone = searchParams.get('phone');
    const utm = searchParams.get('utm'); 
    const encodedMessage = message ? encodeURIComponent(message) : '';

    const logRedirect = async (
      url: string, 
      channel: string, 
      device_os: string, 
      country?: string, 
      message?: string,
      utm?: string,
      phone?: string
    ) => {
      try {
        await fetch('/api/redirect-logger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            channel,
            device_os,
            country,
            message,
            utm, 
            phone,
            meta: {
              user_agent: navigator.userAgent,
              screen: { width: window.screen.width, height: window.screen.height },
            },
          }),
        });
      } catch (err) {
        logger.error('Failed to log redirect', serializeError(err));
      }
    };

    const redirectTo = async (url: string, channel: string, originalUrl: string) => {
      const device_os = /Android/i.test(navigator.userAgent)
        ? 'Android'
        : /iPhone|iPad|iPod/i.test(navigator.userAgent)
        ? 'iOS'
        : 'Web';

      await logRedirect(
        originalUrl, 
        channel, 
        device_os, 
        country || undefined, 
        message || undefined,
        utm || undefined,
        phone || undefined,
      );
      window.location.href = url;
    };

    const redirectToWhatsApp = async (phoneNumber: string) => {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
      await redirectTo(url, 'whatsapp', window.location.href);
    };

    const redirectToChat = async () => {
      const baseUrl = `${window.location.origin}/chat`;
      const url = message ? `${baseUrl}?msg=${encodeURIComponent(message)}` : baseUrl;
      await redirectTo(url, 'chat', window.location.href);
    };

    const isIndiaTimezone = () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return timezone === 'Asia/Kolkata' || timezone === 'Asia/Calcutta';
      } catch {
        return false;
      }
    };

    if (slug === 'wa') {
      // Check if user is in India timezone
      if (!isIndiaTimezone()) {
        // Redirect to chat instead of WhatsApp for non-India users
        redirectToChat();
      } else if (country) {
        const selected = country.toLowerCase();
        redirectToWhatsApp(phoneNumbers[selected] || phoneNumbers['india']);
      } else {
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            const phone = data.country_code === 'US' ? phoneNumbers['us'] : phoneNumbers['india'];
            redirectToWhatsApp(phone);
          })
          .catch(() => {
            redirectToWhatsApp(phoneNumbers['india']);
          });
      }
    } else if (slug === 'app') {
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      const url = isAndroid
        ? 'https://play.google.com/store/apps/details?id=com.augustai.mobileapp'
        : isIOS
        ? 'https://apps.apple.com/in/app/august-wellness-companion/id6746088428'
        : 'https://play.google.com/store/apps/details?id=com.augustai.mobileapp';

      redirectTo(url, 'app', window.location.href);
    } else {
      window.location.href = '/';
    }
  }, [slug, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="w-12 h-12 rounded-full border-4 border-t-transparent"
        style={{
          borderColor: '#286C54',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
