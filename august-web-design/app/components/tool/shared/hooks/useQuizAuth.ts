'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { initializeAuth } from '@/services/auth-service';
import { initializeLocation } from '@/services/location-service';
import { useIsWebview } from '@/hooks/use-webview';

export function useQuizAuth() {
  const { isAnonymous } = useAuthStore();
  const isWebview = useIsWebview();

  useEffect(() => {
    initializeLocation().then(() => initializeAuth()).catch(() => {});
  }, []);

  return {
    shouldGateResults: isAnonymous && !isWebview,
  };
}
