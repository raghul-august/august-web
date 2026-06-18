// Pure data config for GLP-1 Budget Calculator tool.
// No React.

export type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say" | 'others';
export type AgeRange = "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";

export type ExpenseField = {
  id: string;
  label: string;
  section: "household" | "lifestyle" | "healthcare";
};

export type Tier = {
  id: number;
  min: number;
  label: string;
  description: string;
  tips: string;
  ctaUrl: string;
};

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  // { value: "non-binary", label: "Non-binary" },
  // { value: "prefer-not-to-say", label: "Prefer not to say" },
  { value : 'others' , label : "Others"}
];

export const AGE_OPTIONS: AgeRange[] = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
];

export const EXPENSE_FIELDS: ExpenseField[] = [
  { id: "rent", label: "Rent / Mortgage", section: "household" },
  { id: "utilities", label: "Utilities + Internet", section: "household" },
  { id: "groceries", label: "Groceries + Household", section: "household" },
  { id: "transportation", label: "Transportation", section: "household" },
  { id: "subscriptions", label: "Subscriptions + Entertainment", section: "lifestyle" },
  { id: "dining", label: "Dining Out / Takeout", section: "lifestyle" },
  { id: "fitness", label: "Fitness / Wellness", section: "lifestyle" },
  { id: "healthcare", label: "Other Healthcare Expenses", section: "healthcare" },
];

// Sorted descending by min - computeBudget picks the first match where budget >= tier.min
// Thresholds based on 2025 US market pricing (cash pay, manufacturer programs, compounding pharmacies)
export const TIERS: Tier[] = [
  {
    id: 1,
    min: 1100,
    label: "All Brands",
    description:
      "Your budget supports any brand-name GLP-1 at full retail pricing.",
    tips: "At this budget, brand-name options like Wegovy (~$1,349/mo), Ozempic (~$1,028/mo), and Mounjaro (~$1,080/mo) are within reach at retail. Manufacturer savings programs may reduce your cost further. Wegovy and Zepbound are FDA-approved for weight management; Ozempic and Mounjaro are approved for type 2 diabetes and sometimes used off-label.",
    ctaUrl: "https://www.joinlevity.com/#medication",
  },
  {
    id: 2,
    min: 500,
    label: "Wegovy / Zepbound",
    description:
      "Brand-name GLP-1s may be accessible through manufacturer savings programs.",
    tips: "Novo Nordisk and Eli Lilly offer self-pay programs ($349-499/mo for Wegovy and Zepbound). These programs bypass insurance and offer brand-name medication at a fixed monthly rate. Wegovy (semaglutide) is FDA-approved for weight management. Zepbound (tirzepatide) is the weight-management equivalent of Mounjaro.",
    ctaUrl: "https://www.joinlevity.com/product/wegovy",
  },
  {
    id: 3,
    min: 300,
    label: "Compounded Semaglutide",
    description:
      "Compounded semaglutide may fit within your budget.",
    tips: "Compounded semaglutide from licensed pharmacies typically costs $150-350/mo depending on dose. These are pharmacy-prepared versions using the same active ingredient as Ozempic and Wegovy. Compounded medications are FDA-registered but not individually FDA-approved - quality varies by pharmacy. Discuss options with your provider.",
    ctaUrl: "https://www.joinlevity.com/#medication",
  },
  {
    id: 4,
    min: 150,
    label: "Liraglutide + B12",
    description:
      "Compounded Liraglutide with B12 could fit within your budget.",
    tips: "Compounded liraglutide + B12 is one of the most affordable GLP-1 options at $129-179/mo. Liraglutide is the active ingredient in Saxenda (FDA-approved for weight management). Compounded versions are FDA-registered but not individually FDA-approved. Discuss with your provider to confirm this option is appropriate for you.",
    ctaUrl: "https://www.joinlevity.com/product/compounded-liraglutide",
  },
  {
    id: 5,
    min: 0,
    label: "No Options",
    description: "No current GLP-1 options fit your budget at this time.",
    tips: "Your budget is tight right now. Consider exploring patient assistance programs - Novo Nordisk (NovoCare) and Eli Lilly both offer support for qualifying patients. Reducing discretionary spending or checking if your employer covers GLP-1s may also help.",
    ctaUrl: "https://www.joinlevity.com/#medication",
  },
];

