// Pure data config for IVF Success Estimator. No React.

export const IVF_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "What is the IVF Success Estimator?",
    a: "It is a free educational tool that gives you a personalised estimate of your chance of having a baby through in vitro fertilisation (IVF). It uses the same multivariate logistic regression model published by the U.S. Centers for Disease Control and Prevention (CDC), which is built from outcomes reported by U.S. fertility clinics.",
  },
  {
    q: "How is my chance of success calculated?",
    a: "Your age, BMI, infertility diagnoses, number of prior pregnancies and live births, number of past IVF cycles, and whether you plan to use your own or donor eggs are fed into a logistic regression model. The model produces a probability for each retrieval (or transfer, with donor eggs), and we combine them so each subsequent cycle adds to the cumulative chance of a live birth.",
  },
  {
    q: "Whose data is this model trained on?",
    a: "The CDC built the model from cycles reported to the National ART Surveillance System by clinics in the United States. Outcomes outside the U.S. (or at very high or very low BMI / very young or very old patients) may differ from the model's training data.",
  },
  {
    q: "Why does the estimator ask about BMI?",
    a: "Body mass index has a measurable association with IVF success, so the model uses it as one of several inputs. The model clamps your BMI to a 17–45 range before applying the formula — values outside that range are treated as 17 or 45.",
  },
  {
    q: "What does the estimator NOT account for?",
    a: "It does not consider semen quality, embryo grade, specific lab protocols, prior miscarriages, anti-Müllerian hormone (AMH) or other markers of ovarian reserve, your fertility clinic's individual success rate, or any underlying medical conditions outside the listed reasons.",
  },
  {
    q: "Is this a medical recommendation?",
    a: "No. It is an educational estimator only. It should never replace a consultation with a reproductive endocrinologist, who can evaluate factors this tool cannot see.",
  },
  {
    q: "Why am I asked to choose ‘I don’t know / no reason’?",
    a: "If you have not yet been given a specific infertility diagnosis, the model uses a separate set of coefficients that does not condition on individual reasons. Otherwise it would assume you have ‘no’ underlying cause, which would skew your estimate.",
  },
  {
    q: "Where does the formula come from?",
    a: "The coefficients are published verbatim by the CDC at cdc.gov/art/ivf-success-estimator. The original peer-reviewed paper is McLernon et al., and the model has been periodically updated by the CDC to reflect newer U.S. cycle data.",
  },
];

export const IVF_SOFTWARE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "IVF Success Estimator",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description:
    "Free IVF success estimator. Personalised estimate of your live-birth chance with IVF based on the CDC's multivariate logistic regression model.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export const IVF_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: IVF_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};
