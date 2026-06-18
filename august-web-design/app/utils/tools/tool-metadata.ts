import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.meetaugust.ai";

interface ToolMetadataOptions {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  twitterCard?: "summary" | "summary_large_image";
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
}

const OG_TITLE_MAX = 55; // sweet spot for X/LinkedIn previews
const OG_DESC_MAX = 125; // sweet spot for Slack/Twitter/iMessage

function shortenAt(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastPeriod = slice.lastIndexOf(". ");
  if (lastPeriod > max * 0.55) return slice.slice(0, lastPeriod + 1).trim();
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim() + "…";
}

function toolIdFromCanonical(canonical: string): string | null {
  const m = canonical.match(/^\/tool\/([^/?#]+)/);
  return m ? m[1] : null;
}

const TOOLS_WITH_DEDICATED_OG_ROUTE = new Set<string>([
  "future-self",
  "bmi-calculator",
  "sleep-calculator",
  "anxiety-test",
  "pill-identifier",
  "heart-age-calculator",
  "pregnancy-calculator",
  "reaction-time",
  "iq-test",
  "depression-test",
  "hydration-calculator",
  "ovulation-calculator",
  "enneagram-test",
  "color-blind-test",
  "compatibility-test",
  "symptoms-checker",
  "bmr-calculator",
  "bac-calculator",
  "body-fat-calculator",
  "drug-interaction-checker",
  "menopause",
  "vo2max-calculator",
  "autism-test",
  "sobriety-calculator",
  "ivf-success-estimator",
  "attachment-style",
  "weight-loss-timeline-projector",
  "burnout-at-work",
  "childhood-trauma-test",
  "ace-test",
  "trauma-test",
  "ocd-test",
  "eating-disorder-test",
  "self-esteem-test",
  "loneliness-test",
  "social-anxiety-test",
  "injection-site-tracker",
  "perimenopause-symptom",
  "am-i-pregnant-quiz",
  "anger-management-test",
  "bipolar-test",
  "glp1-meal-planner",
  "glp1-supply-tracker",
  "mental-age-test",
  "narcissism-test",
  "sexual-orientation-test",
  "thc-detox-calculator",
  "miscarriage-probability",
  "body-dysmorphia-test",
  "borderline-personality-test",
  "celiac-disease",
  "dri-calculator",
  "emotional-availability-test",
  "glp1-budget-calculator",
  "glp1-plateau-calculator",
  "glp1-titration-calculator",
  "highly-sensitive-personal-test",
  "introversion-test",
  "personality-disorder-test",
  "pregnancy-weight-gain-calculator",
  "psychopathy-test",
  "schizophrenia-test",
]);

export function buildToolMetadata({
  title,
  description,
  canonical,
  ogImage,
  ogImageAlt,
  ogImageWidth = 1200,
  ogImageHeight = 630,
  twitterCard,
  keywords,
  ogTitle,
  ogDescription,
}: ToolMetadataOptions): Metadata {
  const OG_IMAGE_VERSION = "17";
  if (!ogImage) {
    const toolId = toolIdFromCanonical(canonical);
    if (toolId) {
      ogImage = TOOLS_WITH_DEDICATED_OG_ROUTE.has(toolId)
        ? `https://assets.getbeyondhealth.com/og/tools-${toolId}.png`
        : `${BASE_URL}/api/og/tool?id=${toolId}&v=${OG_IMAGE_VERSION}`;
      ogImageAlt = ogImageAlt ?? `${title} | August`;
    }
  }
  if (!twitterCard) twitterCard = ogImage ? "summary_large_image" : "summary";
  const shortTitle = ogTitle ?? shortenAt(title, OG_TITLE_MAX);
  const shortDescription = ogDescription ?? shortenAt(description, OG_DESC_MAX);
  const meta: Metadata = {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: shortTitle,
      description: shortDescription,
      type: "website",
      siteName: "August",
      ...(ogImage && {
        images: [{ url: ogImage, width: ogImageWidth, height: ogImageHeight, ...(ogImageAlt && { alt: ogImageAlt }) }],
      }),
    },
    twitter: {
      card: twitterCard,
      title: shortTitle,
      description: shortDescription,
      ...(ogImage && { images: [ogImage] }),
    },
  };

  if (keywords) {
    meta.keywords = keywords;
  }

  return meta;
}

export function buildResultMetadata(opts: {
  baseTitle: string;
  baseDescription: string;
  canonical: string;
  ogRoute: string;
  paramKey: string;
  paramValue: string | number | undefined;
  clamp?: { min: number; max: number };
  titleSuffix?: (val: string | number) => string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
}): Metadata {
  if (!opts.paramValue) {
    return buildToolMetadata({
      title: opts.baseTitle,
      description: opts.baseDescription,
      canonical: opts.canonical,
    });
  }

  let val: string | number = opts.paramValue;
  if (opts.clamp !== undefined) {
    const n = parseInt(String(val), 10);
    val = Math.max(opts.clamp.min, Math.min(opts.clamp.max, n));
  }

  const suffix = opts.titleSuffix ? opts.titleSuffix(val) : String(val);
  return buildToolMetadata({
    title: suffix,
    description: opts.baseDescription,
    canonical: opts.canonical,
    ogImage: `${BASE_URL}${opts.ogRoute}?${opts.paramKey}=${val}`,
    ...(opts.ogImageAlt && { ogImageAlt: opts.ogImageAlt }),
    ...(opts.ogImageWidth && { ogImageWidth: opts.ogImageWidth }),
    ...(opts.ogImageHeight && { ogImageHeight: opts.ogImageHeight }),
  });
}

export { BASE_URL };
