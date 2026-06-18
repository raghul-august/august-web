export function buildSoftwareSchema(
  name: string,
  description: string,
  applicationCategory = "HealthApplication",
) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "SoftwareApplication" as const,
    name,
    applicationCategory,
    operatingSystem: "Web",
    description,
    offers: {
      "@type": "Offer" as const,
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildFaqSchema(faqs: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: faqs.map((f) => ({
      "@type": "Question" as const,
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: f.a,
      },
    })),
  };
}

export function buildMedicalWebpageSchema(
  name: string,
  conditionName: string,
  icdCode: string,
  lastReviewed?: string,
) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "MedicalWebPage" as const,
    name,
    about: {
      "@type": "MedicalCondition" as const,
      name: conditionName,
      code: {
        "@type": "MedicalCode" as const,
        codeValue: icdCode,
        codingSystem: "ICD-10",
      },
    },
    audience: {
      "@type": "MedicalAudience" as const,
      audienceType: "Patient",
    },
    ...(lastReviewed && { lastReviewed }),
  };
}
