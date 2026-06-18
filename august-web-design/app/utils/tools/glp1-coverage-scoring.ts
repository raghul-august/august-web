import type { GLP1Answers } from "@/app/data/tools/glp1-coverage-questions";
import { calculateBMI as calculateBMIMetric, feetInchesToCm, lbsToKg } from "./health-math";

export type CoverageTier = "strong" | "good" | "requires_steps" | "unlikely" | "medical_review";

export interface CoverageTierInfo {
  tier: CoverageTier;
  title: string;
  description: string;
  badge: string;
}

export type MedicationCoverageStatus = "likely" | "possible" | "unlikely" | "not_recommended";

export interface MedicationCoverage {
  name: string;
  genericName: string;
  type: "injection" | "oral";
  approvedFor: string;
  coverageStatus: MedicationCoverageStatus;
  priorAuthLikely: boolean;
  compatibilityNotes: string[];
  featured: boolean;
}

export interface GLP1CoverageResult {
  overallTier: CoverageTierInfo;
  bmi: number;
  bmiCategory: string;
  medications: MedicationCoverage[];
  helpingFactors: string[];
  complicatingFactors: string[];
  recommendations: string[];
  hasContraindications: boolean;
  contraindications: string[];
}

export function calculateBMI(heightFeet: number, heightInches: number, weightLbs: number): number {
  const totalInches = heightFeet * 12 + heightInches;
  if (totalInches <= 0 || weightLbs <= 0) return 0;
  const heightCm = feetInchesToCm(heightFeet, heightInches);
  const weightKg = lbsToKg(weightLbs);
  return calculateBMIMetric({ weightKg, heightCm });
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obese (Class I)";
  if (bmi < 40) return "Obese (Class II)";
  return "Obese (Class III)";
}

function checkContraindications(answers: GLP1Answers): string[] {
  const result: string[] = [];
  const conditions = (answers.conditions as string[] | undefined) ?? [];

  if (answers.pregnant === "yes") result.push("Pregnancy, nursing, or trying to conceive");
  if (conditions.includes("dialysis")) result.push("Currently undergoing dialysis");
  if (conditions.includes("eating_disorder")) result.push("History of anorexia or bulimia");
  if (answers.pancreatitis === "yes") result.push("History of pancreatitis");
  if (answers.gastroparesis === "yes") result.push("History of gastroparesis");
  if (answers.mtc_men2 === "yes") result.push("Personal or family history of medullary thyroid cancer or MEN-2 syndrome");

  return result;
}

function getTierInfo(tier: CoverageTier): CoverageTierInfo {
  const map: Record<CoverageTier, CoverageTierInfo> = {
    strong: {
      tier: "strong",
      title: "Strong Coverage Likelihood",
      description:
        "Based on your profile, you meet the primary criteria most insurers use to approve GLP-1 medications for weight management.",
      badge: "badge-strong",
    },
    good: {
      tier: "good",
      title: "Good Coverage Likelihood",
      description:
        "Your profile shows qualifying factors that many insurers consider for GLP-1 coverage, especially with documented comorbidities.",
      badge: "badge-good",
    },
    requires_steps: {
      tier: "requires_steps",
      title: "Coverage May Require Steps",
      description:
        "You may qualify for coverage, but your insurer will likely require prior authorization and documentation of previous weight loss attempts.",
      badge: "badge-steps",
    },
    unlikely: {
      tier: "unlikely",
      title: "Coverage Unlikely",
      description:
        "Based on current criteria, most insurers require a BMI of 27 or higher for GLP-1 coverage. You may want to explore other options with your provider.",
      badge: "badge-unlikely",
    },
    medical_review: {
      tier: "medical_review",
      title: "Medical Review Needed",
      description:
        "Your responses indicate factors that need to be discussed with a healthcare provider before considering GLP-1 medications.",
      badge: "badge-review",
    },
  };
  return map[tier];
}

export function computeGLP1Coverage(answers: GLP1Answers): GLP1CoverageResult {
  // Step 1: BMI
  const heightRaw = answers.height as { feet: number; inches: number } | undefined;
  const feet = heightRaw?.feet ?? 0;
  const inches = heightRaw?.inches ?? 0;
  const weight = (answers.weight as number | undefined) ?? 0;
  const bmi = calculateBMI(feet, inches, weight);
  const bmiCategory = getBMICategory(bmi);

  // Step 2: Contraindications
  const contraindications = checkContraindications(answers);
  const hasContraindications = contraindications.length > 0;

  // Step 3: Tier
  const conditions = (answers.conditions as string[] | undefined) ?? [];
  const absorption = (answers.absorption as string[] | undefined) ?? [];
  const needleComfort = answers.needle_comfort as string | undefined;
  const weightLossMed = answers.weight_loss_med as string | undefined;
  const hasComorbidity =
    conditions.includes("heart_failure") ||
    conditions.includes("organ_transplant") ||
    conditions.includes("liver_failure") ||
    answers.cancer === "yes" ||
    answers.triglycerides === "yes";

  let tier: CoverageTier;
  if (hasContraindications) {
    tier = "medical_review";
  } else if (bmi >= 30) {
    tier = "strong";
  } else if (bmi >= 27 && hasComorbidity) {
    tier = "good";
  } else if (bmi >= 27) {
    tier = "requires_steps";
  } else {
    tier = "unlikely";
  }

  // Step 4: Per-medication breakdown
  const needleDislikeNote = "You indicated discomfort with needles — this is an injection";
  const needlePreferNote = "Matches your injection preference";
  const needleNotes = ((): string[] => {
    if (needleComfort === "dislike") return [needleDislikeNote];
    if (needleComfort === "prefer_injection") return [needlePreferNote];
    return [];
  })();

  const oralNeedleNotes = ((): string[] => {
    if (needleComfort === "dislike" || needleComfort === "prefer_oral")
      return ["Matches your preference for oral medication"];
    return [];
  })();

  const hasAbsorptionIssues = absorption.some((v) => v !== "none");

  const injectableCoverageStatus = (t: CoverageTier): MedicationCoverageStatus => {
    if (t === "strong" || t === "good") return "likely";
    if (t === "requires_steps") return "possible";
    if (t === "unlikely") return "unlikely";
    return "not_recommended";
  };

  const medications: MedicationCoverage[] = [
    {
      name: "Ozempic®",
      genericName: "semaglutide",
      type: "injection",
      approvedFor: "Type 2 Diabetes",
      coverageStatus: injectableCoverageStatus(tier),
      priorAuthLikely: tier !== "strong",
      compatibilityNotes: [...needleNotes],
      featured: false,
    },
    {
      name: "Wegovy®",
      genericName: "semaglutide",
      type: "injection",
      approvedFor: "Weight Loss + CV risk reduction",
      coverageStatus:
        tier === "strong" || tier === "good"
          ? "possible"
          : tier === "requires_steps"
          ? "unlikely"
          : tier === "unlikely"
          ? "unlikely"
          : "not_recommended",
      priorAuthLikely: true,
      compatibilityNotes: [...needleNotes, "Coverage for weight loss indication has declined 42% in 2026"],
      featured: tier === "strong",
    },
    {
      name: "Zepbound®",
      genericName: "tirzepatide",
      type: "injection",
      approvedFor: "Weight Loss",
      coverageStatus:
        tier === "strong" || tier === "good"
          ? "possible"
          : "unlikely",
      priorAuthLikely: true,
      compatibilityNotes: [...needleNotes, "12 million people lost coverage for Zepbound in the past year"],
      featured: false,
    },
    {
      name: "Mounjaro®",
      genericName: "tirzepatide",
      type: "injection",
      approvedFor: "Type 2 Diabetes",
      coverageStatus: injectableCoverageStatus(tier),
      priorAuthLikely: tier !== "strong",
      compatibilityNotes: [...needleNotes],
      featured: false,
    },
    {
      name: "Rybelsus®",
      genericName: "semaglutide",
      type: "oral",
      approvedFor: "Type 2 Diabetes",
      coverageStatus: injectableCoverageStatus(tier),
      priorAuthLikely: tier !== "strong",
      compatibilityNotes: [
        ...(answers.pill_swallowing === "yes" ? ["You indicated difficulty swallowing pills"] : []),
        ...oralNeedleNotes,
        ...(hasAbsorptionIssues ? ["Absorption issues may affect oral medication effectiveness"] : []),
      ],
      featured: needleComfort === "dislike" || needleComfort === "prefer_oral",
    },
  ];

  // Step 5: Factor analysis
  const helpingFactors: string[] = [];
  if (bmi >= 30) helpingFactors.push("Your BMI qualifies for weight management coverage");
  if (bmi >= 27 && bmi < 30 && hasComorbidity) helpingFactors.push("Weight-related health conditions support your case");
  if (weightLossMed === "currently" || weightLossMed === "previously")
    helpingFactors.push("Prior weight loss medication use satisfies step therapy requirements");
  if (!hasContraindications && tier !== "medical_review")
    helpingFactors.push("No contraindications identified");

  const complicatingFactors: string[] = [];
  if (bmi < 27) complicatingFactors.push("BMI below the typical 27+ threshold for coverage");
  if (bmi >= 27 && bmi < 30 && !hasComorbidity)
    complicatingFactors.push("BMI is in the qualifying range but without documented comorbidities");
  if (weightLossMed === "never")
    complicatingFactors.push("No prior weight loss medication attempts — step therapy may be required");
  if (needleComfort === "dislike") complicatingFactors.push("Needle aversion limits injectable medication options");
  if (hasAbsorptionIssues) complicatingFactors.push("Nutrient absorption issues may affect oral medication options");
  if (answers.gallbladder === "yes") complicatingFactors.push("Gallbladder history is a precaution with GLP-1 medications");
  if (answers.triglycerides === "yes") complicatingFactors.push("High triglycerides increase pancreatitis risk with GLP-1 medications");
  for (const c of contraindications) complicatingFactors.push(c);

  const recommendations: string[] = ["Discuss GLP-1 options with your healthcare provider"];
  if (tier === "requires_steps") {
    recommendations.push("Request prior authorization through your provider");
    recommendations.push("Document previous weight loss attempts for insurance");
  }
  if (weightLossMed === "never")
    recommendations.push("Your insurer may require trying other weight loss methods first");
  if (hasComorbidity)
    recommendations.push("Ensure your provider documents weight-related conditions for insurance");
  recommendations.push("Review your specific insurance plan's formulary for covered medications");
  if (tier === "unlikely") recommendations.push("Ask your provider about alternative weight management options");

  return {
    overallTier: getTierInfo(tier),
    bmi,
    bmiCategory,
    medications,
    helpingFactors,
    complicatingFactors,
    recommendations,
    hasContraindications,
    contraindications,
  };
}
