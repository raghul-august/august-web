import Script from 'next/script';

/**
 * Meta Pixel (Facebook Pixel) — only injected for US visitors.
 * Country detection is handled by the parent server component (CountryAwareContent)
 * via the Cloudflare `cf-ipcountry` header, so this component simply renders
 * when called and should only be mounted for `country === "US"`.
 */
export function MetaPixelScript() {
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
      >
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','725145380337433');
fbq('track','PageView');`}
      </Script>
      {/* Fallback for browsers with JavaScript disabled */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=725145380337433&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  );
}
