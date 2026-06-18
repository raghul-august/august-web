import JsonLd from "@/app/components/tool/shared/JsonLd";
import { buildToolMetadata, BASE_URL } from "@/app/utils/tools/tool-metadata";
import ImportMemoryClient from "@/app/components/tool/import-memory/ImportMemoryClient";

export const metadata = buildToolMetadata({
  title: "Import Health Memory to August | Bring Your Health Context",
  description:
    "Import your health conversations and context from any AI assistant into August. Keep your health journey continuous with personalized support.",
  canonical: "/tool/import-memory",
  ogImage: "https://assets.getbeyondhealth.com/health-lib/import-memory/background.png",
  ogImageAlt: "Import your health memory to August",
  keywords: [
    "import health data",
    "AI health memory",
    "transfer health context",
    "health AI migration",
    "August health assistant",
    "import AI conversations",
    "health data portability",
  ],
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${BASE_URL}/tool/import-memory#app`,
      name: "August Import Memory",
      description:
        "Import your health conversations and memory from other AI assistants into August for continuous, personalized health support.",
      url: `${BASE_URL}/tool/import-memory`,
      applicationCategory: "HealthApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: {
        "@type": "Organization",
        name: "August",
        url: "https://meetaugust.ai",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${BASE_URL}/tool/import-memory#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: `${BASE_URL}/en/tool`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Import Memory",
          item: `${BASE_URL}/tool/import-memory`,
        },
      ],
    },
  ],
};

export default function ImportMemoryPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <ImportMemoryClient />
    </>
  );
}
