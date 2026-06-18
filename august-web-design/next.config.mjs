import { withSentryConfig } from '@sentry/nextjs';
// Import createMDX
import pkg from '@next/mdx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const createMDX = pkg.default || pkg;
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_API_URL_US',
  'NEXT_PUBLIC_API_URL_DEFAULT',
  'NEXT_PUBLIC_ALGOLIA_APP_ID',
  'NEXT_PUBLIC_ALGOLIA_API_KEY',
  'NEXT_PUBLIC_ALGOLIA_INDEX_NAME',
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_APPLE_CLIENT_ID',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'TURNSTILE_SECRET_KEY',
  'POSTGRES_HOST',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
];

const missing = REQUIRED_ENV_VARS.filter((entry) => {
  const names = Array.isArray(entry) ? entry : [entry];
  return !names.some((name) => process.env[name] && process.env[name].trim() !== '');
});

if (missing.length > 0) {
  const formatted = missing
    .map((entry) =>
      Array.isArray(entry) ? `  - ${entry.join(' OR ')}` : `  - ${entry}`
    )
    .join('\n');
  throw new Error(
    `\n\n❌ Missing required environment variables:\n${formatted}\n\n` +
      `Add them to .env and restart the server.\n`
  );
}
// ───────────────────────────────────────────────────────────────────────────

// Create the withMDX function
const withMDX = createMDX({
  extension: /\.mdx?$/,
});

// Bundle analyzer
const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  basePath: '',

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  env: {
    NEXT_PUBLIC_TENANT: process.env.NEXT_PUBLIC_TENANT || 'august',
    NEXT_PUBLIC_ENABLE_ANONCHAT: process.env.NEXT_PUBLIC_ENABLE_ANONCHAT || 'true',
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          mui: {
            name: 'mui',
            test: /[\/\\]node_modules[\/\\]@mui[\/\\]/,
            chunks: 'all',
            priority: 30,
            enforce: true,
          },
          react: {
            name: 'react',
            test: /[\/\\]node_modules[\/\\](react|react-dom)[\/\\]/,
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          lodash: {
            name: 'lodash',
            test: /[\/\\]node_modules[\/\\]lodash[\/\\]/,
            chunks: 'all',
            priority: 25,
            enforce: true,
          },
          vendor: {
            name: 'vendor',
            test: /[\/\\]node_modules[\/\\]/,
            chunks: 'all',
            priority: 10,
            minSize: 20000,
            maxSize: 200000,
          },
        },
      };

      config.module.rules.push({
        test: /[\/\\]node_modules[\/\\](@mui|lodash)[\/\\]/,
        sideEffects: false,
      });
    }
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "framerusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.usmle.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "augustbuckets.blob.core.windows.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.getbeyondhealth.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.meetaugust.ai",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "augustproduction.blob.core.windows.net",
        pathname: "/**",
      },
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 75, 85, 90, 100],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },

  experimental: {
    scrollRestoration: true,
    proxyClientMaxBodySize: '50mb',
  },

  turbopack: {
    root: projectRoot,
    rules: {
      '*.mdx': {
        loaders: ['@mdx-js/loader'],
        as: '*.js',
      },
      '*.md': {
        loaders: ['@mdx-js/loader'],
        as: '*.js',
      },
    },
  },

  async redirects() {
    return [
      // Chat-app: legacy /auth -> /chat (was /auth -> / on the old chat subdomain)
      {
        source: '/auth',
        destination: '/chat',
        permanent: true,
      },
      // Legacy: /library/:lang -> /:lang/library (old URL format)
      {
        source: '/library/:lang',
        destination: '/:lang/library',
        permanent: true,
      },
      {
        source: '/library/:lang/:path*',
        destination: '/:lang/:path*',
        permanent: true,
      },
      // Old URLs with /library/: /:lang/library/:section -> /:lang/:section
      {
        source: '/:lang/library/:section(symptoms|medications|diseases-conditions|tests-procedures|blog|author|search)',
        destination: '/:lang/:section',
        permanent: true,
      },
      // Old URLs with /library/ and /view/: /:lang/library/:section/view/:slug -> /:lang/:section/:slug
      {
        source: '/:lang/library/:section(symptoms|medications|diseases-conditions|tests-procedures|blog|author)/view/:slug*',
        destination: '/:lang/:section/:slug*',
        permanent: true,
      },
      // Old URLs with /library/ sub-paths (index/[letter], language/): /:lang/library/:section/:path* -> /:lang/:section/:path*
      {
        source: '/:lang/library/:section(symptoms|medications|diseases-conditions|tests-procedures|blog|author|search)/:path*',
        destination: '/:lang/:section/:path*',
        permanent: true,
      },
      // Old URLs without /library/ but with /view/: /:lang/:section/view/:slug -> /:lang/:section/:slug
      {
        source: '/:lang/:section(symptoms|medications|diseases-conditions|tests-procedures|blog|author)/view/:slug*',
        destination: '/:lang/:section/:slug*',
        permanent: true,
      },
      // Static blog path under library
      {
        source: '/:lang/library/blog/it-is-not-users-but-households-that-use',
        destination: '/:lang/blog/it-is-not-users-but-households-that-use',
        permanent: true,
      },
      // Blog is served from /articles — final hop for all blog URLs
      {
        source: '/:lang/blog/:path*',
        destination: '/:lang/articles/:path*',
        permanent: true,
      },
      {
        source: '/:lang/blog',
        destination: '/:lang/articles',
        permanent: true,
      },
      // Legacy: /:lang/tool/:path -> /tool/:path (tools are now language-independent)
      {
        source: '/:lang/tool/:path*',
        destination: '/tool/:path*',
        permanent: true,
      },
      {
        source: '/:lang/tool',
        destination: '/tool',
        permanent: true,
      },
      // Legacy: /:lang/library/benchmarks -> /benchmarks (benchmarks are now at root)
      {
        source: '/:lang/library/benchmarks/:path*',
        destination: '/benchmarks/:path*',
        permanent: true,
      },
      {
        source: '/:lang/library/benchmarks',
        destination: '/benchmarks',
        permanent: true,
      },
      {
        source: '/:lang/library/august-benchmark-2026',
        destination: '/august-benchmark-2026',
        permanent: true,
      },
      {
        source: '/:lang/library/august-benchmark',
        destination: '/august-benchmark',
        permanent: true,
      },
      // Legacy: /:lang/library/behind-august -> /behind-august
      {
        source: '/:lang/library/behind-august',
        destination: '/behind-august',
        permanent: true,
      },
      // Also handle bare /benchmarks without lang (for completeness)
      {
        source: '/:lang/benchmarks/:path*',
        destination: '/benchmarks/:path*',
        permanent: true,
      },
      {
        source: '/:lang/benchmarks',
        destination: '/benchmarks',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    const defaultUrl = process.env.NEXT_PUBLIC_API_URL_DEFAULT;
    const usUrl = process.env.NEXT_PUBLIC_API_URL_US;

    return [
      // Public payment URL is /payments/:token — internally handled by app/payment/[token]/page.tsx.
      // Browser URL stays /payments/:token (rewrite is internal, not a redirect).
      {
        source: '/payments/:token',
        destination: '/payment/:token',
      },
      // Bare-token shape: payments.getbeyondhealth.com/<token> → /payment/<token>.
      // Scoped via `has.host` to the payment subdomains only so this never affects
      // other paths on the main site. `/:token` matches one segment; filesystem
      // routes (e.g. /about, /privacy, /api/*) take precedence and won't be caught.
      {
        source: '/:token',
        destination: '/payment/:token',
        has: [
          {
            type: 'host',
            value: '(?:payments|payments-staging)\\.getbeyondhealth\\.com',
          },
        ],
      },
      // Sitemap rewrites
      {
        source: '/sitemaps/:file',
        destination: '/api/sitemaps/:file',
      },
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml',
      },
      {
        source: '/sitemap-index.xml',
        destination: '/api/sitemap.xml',
      },
      // Chat-app API proxies
      {
        source: '/api/proxy/:path*',
        destination: `${defaultUrl}/:path*`,
      },
      {
        source: '/api/proxy-us/:path*',
        destination: `${usUrl}/:path*`,
      },
    ];
  },

  // Asset caching — Cloudflare (and any CDN) auto-caches responses carrying
  // these Cache-Control headers. After the first request populates the edge,
  // subsequent fetches never reach the t3.large EC2 origin, so /_next/image
  // stops re-encoding via Sharp on every load. Scoped to framework-owned and
  // hash-versioned paths only — never HTML, never API routes.
  //
  // Production-only: in dev, Turbopack reuses stable chunk URLs across builds,
  // so `immutable` makes the browser refuse to refetch updated modules and
  // throws "module factory is not available" after edits.
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        source: '/_next/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' },
        ],
      },
      {
        source: '/posters/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' },
        ],
      },
      {
        source: '/:file(.*\\.(?:webp|avif|jpg|jpeg|png|svg|gif|ico|woff2?|ttf|otf|mp4|webm))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, s-maxage=31536000, immutable' },
        ],
      },
    ];
  },

  compress: true,
};

export default withSentryConfig(withBundleAnalyzer(withMDX(nextConfig)), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "august-h6",

  project: "august-web",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});