"use client";

import { sanitizeAndSecureHtmlLinks } from "@/app/utils/sanitizeHtmlLinks";
import FaqAccordion from "@/app/components/tool/shared/FaqAccordion";
import ToolCTA from "./ToolCTA";
import JsonLd from "./JsonLd";

function buildFaqSchema(items: { q: string; a: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export interface ToolLandingContentProps {
  body_html: string | null;
  cta: {
    headline: string;
    subheadline: string;
    label: string;
    benefits: string[];
  } | null;
  faqs: { q: string; answer_html: string }[] | null;
  seo_schemas: Record<string, unknown>[] | null;
  onCtaClick?: () => void;
  ctaHref?: string;
}

function stripPTags(html: string): string {
  return html.replace(/^<p>/, "").replace(/<\/p>$/, "");
}

export default function ToolLandingContent({
  body_html,
  cta,
  faqs,
  seo_schemas,
  onCtaClick,
  ctaHref,
}: ToolLandingContentProps) {
  const faqPlain = faqs?.map((f) => ({ q: f.q, a: stripPTags(f.answer_html) }));

  const resolvedCtaHref =
    ctaHref ?? (cta?.headline
      ? `/chat?msg=${encodeURIComponent(cta.headline.toLowerCase())}`
      : undefined);

  return (
    <>
      {seo_schemas?.map((schema, i) => (
        <JsonLd key={`seo-${i}`} data={schema} />
      ))}

      {faqPlain && faqPlain.length > 0 && (
        <JsonLd data={buildFaqSchema(faqPlain)} />
      )}

      {body_html && (
        <div
          className="tool-landing-gutter article-body-html"
          dangerouslySetInnerHTML={{
            __html: sanitizeAndSecureHtmlLinks(body_html),
          }}
        />
      )}

      {cta && (
        <ToolCTA
          headline={cta.headline}
          subheadline={cta.subheadline}
          benefits={cta.benefits}
          ctaLabel={cta.label}
          onCtaClick={onCtaClick}
          href={resolvedCtaHref}
          sectionClassName="py-12 md:py-16"
        />
      )}

      {faqPlain && faqPlain.length > 0 && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <FaqAccordion faqs={faqPlain} heading="Frequently Asked Questions" />
        </div>
      )}
    </>
  );
}
