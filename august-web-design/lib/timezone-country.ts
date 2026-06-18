import { rawTimeZones } from '@vvo/tzdb';

const TIMEZONE_COUNTRY_MAP: Record<string, string> = rawTimeZones.reduce(
  (acc, zone) => {
    if (!zone.countryCode) {
      return acc;
    }

    const names = new Set([zone.name, ...(zone.group || [])]);
    names.forEach((name) => {
      if (!acc[name]) {
        acc[name] = zone.countryCode;
      }
    });

    return acc;
  },
  {} as Record<string, string>
);

export function getCountryCodeFromTimezone(timezone?: string | null): string | null {
  if (!timezone) return null;
  return TIMEZONE_COUNTRY_MAP[timezone] || null;
}
