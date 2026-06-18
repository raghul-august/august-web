export type GLP1Medication = "semaglutide" | "tirzepatide";

export { US_STATES } from "@/app/data/tools/glp1-coverage-questions";

export const MEDICATION_OPTIONS = [
  { value: "semaglutide" as const, label: "Semaglutide" },
  { value: "tirzepatide" as const, label: "Tirzepatide" },
] as const;