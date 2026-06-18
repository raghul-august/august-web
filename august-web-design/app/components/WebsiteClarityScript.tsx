'use client';

import Script from 'next/script';

/**
 * Microsoft Clarity — single tag (`ulvi7nj0sa`) loaded on every route.
 * Previously scoped by pathname to avoid double-loading a separate chat-app
 * tag, but we've consolidated to one Clarity project across the merged repo.
 */
export function WebsiteClarityScript() {
  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "ulvi7nj0sa");`}
    </Script>
  );
}
