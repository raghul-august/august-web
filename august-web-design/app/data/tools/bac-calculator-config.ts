// Pure data config for BAC Calculator tool. No React.

export const BAC_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What is Blood Alcohol Content (BAC)?",
    a: "BAC is the percentage of alcohol in your bloodstream by weight. A BAC of 0.08% means there are 0.08 grams of alcohol per 100 mL of blood. It's the same unit U.S. law enforcement uses to determine impairment.",
  },
  {
    q: "How is BAC calculated?",
    a: "This tool uses the Widmark formula: BAC = (alcohol consumed in grams / (body weight in grams × distribution ratio)) × 100, minus the alcohol your body has metabolized since you started drinking. The distribution ratio is 0.68 for males and 0.55 for females.",
  },
  {
    q: "How accurate is a BAC calculator?",
    a: "BAC estimators are educational only. Real BAC depends on food eaten, hydration, medication, recent sleep, body composition, and genetics. Even breathalyzers have a margin of error. If you're driving, the only safe BAC is 0.00.",
  },
  {
    q: "What is a standard drink?",
    a: "In the United States, a standard drink contains about 14 grams (0.6 fl oz) of pure alcohol. That's a 12 oz beer at 5% ABV, a 5 oz glass of wine at 12% ABV, or a 1.5 oz shot of 40% (80-proof) liquor.",
  },
  {
    q: "What's the legal BAC limit for driving?",
    a: "In every U.S. state except Utah, the legal limit is 0.08% for drivers 21 and over. Utah's limit is 0.05%. Commercial drivers are limited to 0.04%, and drivers under 21 face zero-tolerance laws (typically 0.00–0.02%).",
  },
  {
    q: "How long does it take to sober up?",
    a: "Your body metabolizes alcohol at roughly 0.015% BAC per hour, regardless of body size. Coffee, cold showers, and food don't speed this up — only time does. To go from 0.08 to 0.00 takes around 5 to 6 hours.",
  },
  {
    q: "Why are men and women different?",
    a: "Women typically have a lower volume of distribution for alcohol (more body fat, less water relative to body weight) and lower levels of the enzyme that breaks down alcohol in the stomach. This means equivalent drinks produce a higher BAC.",
  },
  {
    q: "Should I drive if my BAC says 0.00?",
    a: "No. This calculator is an estimate, not a measurement. If you have been drinking, the safest choice is to wait, use a rideshare, or designate a sober driver. Never drive if you've been drinking.",
  },
];

export const BAC_SOFTWARE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BAC Calculator",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description:
    "Free Blood Alcohol Content (BAC) calculator. Estimate your blood alcohol level from drinks consumed, body weight, sex, and time elapsed.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export const BAC_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: BAC_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};
