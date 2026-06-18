import "./globals.css";
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';
import ClientProviders from './components/ClientProviders';
import { WebsiteClarityScript } from './components/WebsiteClarityScript';
import { MetaPixelScript } from './components/MetaPixelScript';
import { ChunkErrorHandler } from '@/components/chunk-error-handler';
import { headers } from 'next/headers';


export default async function RootLayout({ children }) {
  const headersList = await headers();
  const lang = headersList.get('x-lang') || 'en';
  const country = headersList.get('cf-ipcountry');
  const isUS = country === 'US';

  return (
    <html lang={lang}>
      <head>
        {/* Preload only critical fonts (400+500 weights used above-the-fold) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://scripts.clarity.ms" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        <link
          rel="preload"
          href="/fonts/inter-display-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-display-500.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.ico" />

        {/* Critical CSS - inline minimal styles for immediate render */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @font-face {
              font-family: 'Inter Display';
              src: url('/fonts/inter-display-400.woff2') format('woff2');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Inter Display';
              src: url('/fonts/inter-display-500.woff2') format('woff2');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Geist';
              src: url('/fonts/geist-latin-400-normal.woff2') format('woff2');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Geist';
              src: url('/fonts/geist-latin-600-normal.woff2') format('woff2');
              font-weight: 600;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Geist';
              src: url('/fonts/geist-latin-700-normal.woff2') format('woff2');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }
            :root {
              --font-nunito-sans: "Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              --font-inter: "Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              --font-plus-jakarta: "Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              --font-manrope: "Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              --font-geist-sans: 'Geist', system-ui, sans-serif;
              --font-geist-mono: 'Geist Mono', 'Courier New', monospace;
            }
            body {
              font-family: "Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              margin: 0;
              padding: 0;
              background-color: #FAF9F5;
              color: #171717;
              line-height: 1.6;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            * {
              box-sizing: border-box;
            }
            /* Critical above-the-fold styles */
            .MuiAppBar-root {
              background-color: #fff !important;
              color: #111 !important;
              box-shadow: none !important;
              border-bottom: 1px solid #e0e0e0;
            }
            .MuiToolbar-root {
              min-height: 64px;
              padding: 0 16px;
            }
            /* Hero section critical styles */
            .hero-section {
              background-color: #f4f5f5;
              padding: 48px 0;
            }
            /* Prevent layout shift */
            @layer base {
              img {
                max-width: 100%;
                height: auto;
              }
            }
          `,
          }}
        />

        {/* Microsoft Clarity (website tag) — skipped on chat-app routes,
            which load their own Clarity tag from (webapp)/layout.tsx */}
        <WebsiteClarityScript />

        {/* Meta Pixel — US visitors only. Hoisted to <head> for optimal tracking. */}
        {isUS && <MetaPixelScript />}

      </head>

      <body>
        {/* Auditzy InApp Redirect (IAR) — bounces visitors out of Instagram/
            Facebook/TikTok in-app browsers into Chrome/Safari so paid traffic
            lands in a real browser. beforeInteractive still injects into <head>. */}
        <Script
          id="iar"
          src="https://rum.auditzy.com/PVGtWyse-www.meetaugust.ai-iar.js"
          strategy="beforeInteractive"
        />
        <ChunkErrorHandler />

        {/* Use client component for providers */}
        <ClientProviders>{children}</ClientProviders>

        {/* Google Analytics using Next.js third-parties */}
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
