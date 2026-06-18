'use client';

import { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface AuthSDKLoaderProps {
  children: React.ReactNode;
}

let appleSdkLoaded = false;
let appleSdkLoading = false;

export function AuthSDKLoader({ children }: AuthSDKLoaderProps) {
  const [appleReady, setAppleReady] = useState(appleSdkLoaded);

  useEffect(() => {
    // Load Apple SDK
    if (!appleSdkLoaded && !appleSdkLoading) {
      appleSdkLoading = true;
      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      script.onload = () => {
        appleSdkLoaded = true;
        setAppleReady(true);
      };
      document.head.appendChild(script);
    } else if (appleSdkLoaded) {
      setAppleReady(true);
    }
  }, []);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
