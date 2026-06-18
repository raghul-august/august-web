export const DEPRESSION_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What is the PHQ-9 depression test?",
    a: "The Patient Health Questionnaire (PHQ-9) is a 9-item self-report screen for depression developed by Kroenke, Spitzer, and Williams (2001). It asks how often, over the past two weeks, you've been bothered by nine common symptoms of depression. It's one of the most widely used depression screens in primary care and research worldwide.",
  },
  {
    q: "How is the depression test scored?",
    a: "Each of the nine PHQ-9 items is scored 0 to 3 (Not at all → Nearly every day). Your total ranges from 0 to 27. Scores of 0–4 are minimal, 5–9 mild, 10–14 moderate, 15–19 moderately severe, and 20–27 severe. A tenth question about functional impact is shown but does not count toward the total.",
  },
  {
    q: "Is this a clinical diagnosis?",
    a: "No. The PHQ-9 is a validated screening tool, not a diagnostic instrument. A score in the moderate-or-above range is a strong signal to talk with a clinician, but only a licensed provider can diagnose depression after a full assessment.",
  },
  {
    q: "What does it mean if I scored high on question 9 (self-harm)?",
    a: "Question 9 asks about thoughts of being better off dead or hurting yourself. Any answer above \"Not at all\" deserves attention — please consider reaching out to a mental health provider, someone you trust, or one of the crisis resources shown with your result. If you're in immediate danger, call or text 988 (Suicide & Crisis Lifeline) or text \"MHA\" to 741-741 (Crisis Text Line).",
  },
  {
    q: "Will my answers be saved or shared?",
    a: "No. Everything you enter is processed in your browser and your responses are not sent to a server or stored anywhere. Closing the tab clears the result.",
  },
  {
    q: "How long does the test take?",
    a: "Most people finish in under three minutes. There are 10 questions and one tap per item, with the option to go back and change an answer.",
  },
  {
    q: "Where does the PHQ-9 come from?",
    a: "Kroenke, Spitzer, & Williams. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613. PHQ-9 © Pfizer Inc. — no permission required to reproduce, translate, display, or distribute.",
  },
  {
    q: "Can my score change over time?",
    a: "Yes. Depression severity is sensitive to recent life events, sleep, medication changes, and treatment. Many people retake the PHQ-9 every two weeks to track how they're doing — a change of five or more points is generally considered clinically meaningful.",
  },
];

export const DEPRESSION_SOFTWARE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Depression Test (PHQ-9)",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description:
    "Free 9-question PHQ-9 depression self-screen. Get your depression severity score (0–27) and where you fall on the standard PHQ-9 banding in under 3 minutes.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export const DEPRESSION_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: DEPRESSION_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};
