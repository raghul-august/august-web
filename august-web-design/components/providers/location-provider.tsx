'use client';

import { createContext, useContext, useEffect, useState, ReactNode, startTransition } from 'react';
import { usePathname } from 'next/navigation';
import { initializeLocation, getBackendUrl, isLocationInitialized } from '@/services/location-service';
import { getProxyPathForBackend } from '@/lib/config';

interface LocationContextType {
  isInitialized: boolean;
  backendUrl: string;
  proxyPath: string;
}

const LocationContext = createContext<LocationContextType>({
  isInitialized: false,
  backendUrl: '',
  proxyPath: '/api/proxy',
});

export function useLocation() {
  return useContext(LocationContext);
}

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');
  const [proxyPath, setProxyPath] = useState('/api/proxy');
  const pathname = usePathname();
  const shouldSkipLocation =
    pathname?.startsWith('/join') ||
    pathname?.startsWith('/redirect') ||
    pathname?.startsWith('/delete-account');

  useEffect(() => {
    if (shouldSkipLocation) {
      const url = getBackendUrl();
      startTransition(() => {
        setBackendUrl(url);
        setProxyPath(getProxyPathForBackend(url));
        setIsInitialized(true);
      });
      return;
    }

    // Check if already initialized (from localStorage)
    if (isLocationInitialized()) {
      const url = getBackendUrl();
      startTransition(() => {
        setBackendUrl(url);
        setProxyPath(getProxyPathForBackend(url));
        setIsInitialized(true);
      });
      return;
    }

    // Initialize location detection
    initializeLocation().then((url) => {
      startTransition(() => {
        setBackendUrl(url);
        setProxyPath(getProxyPathForBackend(url));
        setIsInitialized(true);
      });
    });
  }, [shouldSkipLocation]);

  return (
    <LocationContext.Provider value={{ isInitialized, backendUrl, proxyPath }}>
      {children}
    </LocationContext.Provider>
  );
}
