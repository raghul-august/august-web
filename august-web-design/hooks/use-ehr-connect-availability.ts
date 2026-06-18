'use client';

import { useLocation } from '@/components/providers/location-provider';
import { getLocationInfo, isUserBypassedToUS } from '@/services/location-service';
import { useAuthStore } from '@/stores/auth-store';

export function useEhrConnectAvailability() {
  const { isInitialized } = useLocation();
  const user = useAuthStore((s) => s.user);
  const email = user?.email;
  const countryCode = getLocationInfo()?.countryCode;

  return {
    ready: isInitialized,
    canConnectRecords: isInitialized && (countryCode === 'US' || isUserBypassedToUS(email)),
  };
}
