'use client';

import { GoogleOAuthProvider as GoogleOAuthProviderBase } from '@react-oauth/google';
import { ReactNode } from 'react';

interface GoogleOAuthProviderProps {
  children: ReactNode;
}

export function GoogleOAuthProvider({ children }: GoogleOAuthProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    //console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google Sign In will not work.');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProviderBase clientId={clientId}>
      {children}
    </GoogleOAuthProviderBase>
  );
}
