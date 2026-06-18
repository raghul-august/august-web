'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { getOrCreateDeviceId } from '@/lib/utils';

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

export function ClarityUserSync() {
  const { user } = useAuthStore();

  useEffect(() => {
    const setClarityVar = (key: string, value: string) => {
      if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
        window.clarity('set', key, value);
      }
    };

    const anonId = getOrCreateDeviceId();
    setClarityVar('anonymous_id', anonId);

    if (user?.phone) {
      setClarityVar('user_phone', user.phone);
    }
  }, [user?.phone]);

  return null;
}
