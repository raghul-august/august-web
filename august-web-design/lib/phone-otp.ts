import { useEffect, useState } from 'react';
import { getCountryCodeFromTimezone } from '@/lib/timezone-country';
import { getLocationInfo, initializeLocation } from '@/services/location-service';

const PHONE_OTP_ALLOWED_COUNTRY_CODES = new Set([
  'IN',
  'US',
  'GB',
  'CA',
  'FR',
  'AU',
  'AR',
]);

export function isPhoneOtpAllowed(countryCode?: string | null): boolean {
  if (!countryCode) return false;
  return PHONE_OTP_ALLOWED_COUNTRY_CODES.has(countryCode.toUpperCase());
}

function resolveTimezoneCountryCode(): string | null {
  if (typeof Intl === 'undefined') return null;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!timezone) return null;
  return getCountryCodeFromTimezone(timezone) || null;
}

export function usePhoneOtpAvailability(): boolean {
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const resolveAvailability = async () => {
      const cached = getLocationInfo();
      if (cached?.countryCode) {
        if (isMounted) setIsAllowed(isPhoneOtpAllowed(cached.countryCode));
        return;
      }

      try {
        await initializeLocation();
      } catch {
        // Fall back to timezone or hide phone OTP if location fails.
      }

      const updated = getLocationInfo();
      const countryCode = updated?.countryCode || resolveTimezoneCountryCode();
      if (isMounted) setIsAllowed(isPhoneOtpAllowed(countryCode));
    };

    void resolveAvailability();

    return () => {
      isMounted = false;
    };
  }, []);

  return isAllowed;
}
