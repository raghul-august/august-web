import type { Tier } from "@/app/data/tools/glp1-budget-calculator-config";
import { TIERS } from "@/app/data/tools/glp1-budget-calculator-config";

export type BudgetInput = {
  income: number;
  expenses: Record<string, number>;
  hasCoverage: boolean;
  copay: number; // monthly copay if insured, 0 otherwise
};

export type BudgetResult = {
  budget: number;
  totalExpenses: number;
  tier: Tier;
  usedCopay: boolean;
};

function assertNonNegativeMoney(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative number.`);
  }
}

export function computeBudget(input: BudgetInput): BudgetResult {
  assertNonNegativeMoney(input.income, "Income");
  assertNonNegativeMoney(input.copay, "Copay");

  const totalExpenses = Object.entries(input.expenses).reduce((sum, [key, value]) => {
    assertNonNegativeMoney(value, `Expense "${key}"`);
    return sum + value;
  }, 0);

  const disposableBudget = Math.max(0, input.income - totalExpenses);

  if (input.hasCoverage && input.copay > 0) {
    // User has insurance — match copay against tiers instead of full retail
    // If copay fits within disposable budget, use copay as the effective "price" to beat
    const canAffordCopay = disposableBudget >= input.copay;
    if (canAffordCopay) {
      // With insurance, user effectively can afford any tier whose min <= disposableBudget
      // But the tier should reflect what they're actually paying (copay)
      const tier = TIERS.find((t) => disposableBudget >= t.min) ?? TIERS[TIERS.length - 1];
      return { budget: disposableBudget, totalExpenses, tier, usedCopay: true };
    }
  }

  // No insurance or copay exceeds budget — match disposable budget against tier thresholds
  const tier = TIERS.find((t) => disposableBudget >= t.min) ?? TIERS[TIERS.length - 1];
  return { budget: disposableBudget, totalExpenses, tier, usedCopay: false };
}
