import { buildAmortizationSchedule } from "./amortization";
import { formatINR, formatMonthsAsYears } from "./format";
import type { EmiType } from "./types";

export interface SuggestionsInput {
  principal: number;
  annualRatePercent: number;
  tenureMonths: number;
  startDate: Date;
  emiType: EmiType;
  downPaymentPercent?: number;
}

export interface Suggestion {
  id: string;
  message: string;
  tone: "positive" | "warning" | "info";
}

const MIN_INTEREST_SAVINGS_TO_MENTION = 10000;

/**
 * Rule-based "AI-style" recommendations, all derived from re-running the
 * existing amortization engine against a clean baseline (normal EMI, no
 * prepayment) rather than whatever the user currently has configured — so
 * every suggestion reads as a self-contained, actionable comparison.
 */
export function generateSmartSuggestions(input: SuggestionsInput): Suggestion[] {
  const { principal, annualRatePercent, tenureMonths, startDate, downPaymentPercent } = input;
  if (principal <= 0 || tenureMonths <= 0) return [];

  const baselineParams = {
    principal,
    annualRatePercent,
    tenureMonths,
    startDate,
    emiType: "normal" as const,
  };
  const baseline = buildAmortizationSchedule(baselineParams);
  const baselineEmi = baseline.summary.initialEmi;

  const suggestions: Suggestion[] = [];

  // One extra EMI every year.
  const extraEmiScenario = buildAmortizationSchedule({
    ...baselineParams,
    prepayment: {
      strategy: "reduceTenure",
      recurring: { amount: baselineEmi, frequency: "yearly", startMonth: 12 },
    },
  });
  const extraEmiSavings = baseline.summary.totalInterest - extraEmiScenario.summary.totalInterest;
  if (extraEmiSavings > MIN_INTEREST_SAVINGS_TO_MENTION) {
    suggestions.push({
      id: "extra-emi",
      tone: "positive",
      message: `You can save ${formatINR(extraEmiSavings, { compact: true })} by paying one extra EMI every year.`,
    });
  }

  // Small monthly top-up.
  const bumpAmount = 2000;
  const bumpScenario = buildAmortizationSchedule({
    ...baselineParams,
    prepayment: {
      strategy: "reduceTenure",
      recurring: { amount: bumpAmount, frequency: "monthly", startMonth: 1 },
    },
  });
  if (bumpScenario.summary.monthsSaved > 0) {
    suggestions.push({
      id: "small-bump",
      tone: "positive",
      message: `If you increase your EMI by only ₹${bumpAmount.toLocaleString("en-IN")}/month, your loan finishes ${formatMonthsAsYears(bumpScenario.summary.monthsSaved)} earlier.`,
    });
  }

  // Interest vs principal callout.
  if (baseline.summary.totalInterest > baseline.summary.totalPrincipal) {
    const excessPercent =
      ((baseline.summary.totalInterest - baseline.summary.totalPrincipal) / baseline.summary.totalPrincipal) * 100;
    suggestions.push({
      id: "interest-exceeds-principal",
      tone: "warning",
      message: `Your total interest exceeds your principal by ${excessPercent.toFixed(0)}%.`,
    });
  }

  // Shorter tenure.
  if (tenureMonths > 180) {
    const shorterTenureMonths = Math.max(tenureMonths - 60, 120);
    const shorterScenario = buildAmortizationSchedule({ ...baselineParams, tenureMonths: shorterTenureMonths });
    const shorterSavings = baseline.summary.totalInterest - shorterScenario.summary.totalInterest;
    if (shorterSavings > MIN_INTEREST_SAVINGS_TO_MENTION) {
      suggestions.push({
        id: "shorter-tenure",
        tone: "positive",
        message: `A shorter tenure of ${Math.round(shorterTenureMonths / 12)} years saves ${formatINR(shorterSavings, { compact: true })}.`,
      });
    }
  }

  // Refinance nudge for high rates.
  if (annualRatePercent > 9) {
    const betterRate = annualRatePercent - 0.75;
    const refinanceScenario = buildAmortizationSchedule({ ...baselineParams, annualRatePercent: betterRate });
    const refinanceSavings = baseline.summary.totalInterest - refinanceScenario.summary.totalInterest;
    if (refinanceSavings > MIN_INTEREST_SAVINGS_TO_MENTION) {
      suggestions.push({
        id: "refinance",
        tone: "info",
        message: `Refinancing to around ${betterRate.toFixed(1)}% could save roughly ${formatINR(refinanceSavings, { compact: true })} — worth comparing offers.`,
      });
    }
  }

  // Down payment warning.
  if (downPaymentPercent !== undefined && downPaymentPercent < 20) {
    suggestions.push({
      id: "low-down-payment",
      tone: "warning",
      message: "Your down payment is below 20% of the property value, which increases your overall interest.",
    });
  }

  // Generic nudge toward the investment-comparison tools.
  if (annualRatePercent < 9) {
    suggestions.push({
      id: "appreciation-note",
      tone: "info",
      message:
        "At this interest rate, property appreciation or other investments may outperform paying down the loan early — see the Opportunity Cost Calculator.",
    });
  }

  return suggestions;
}
