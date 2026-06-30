import type { AmortizationRow, LoanSummary } from "./types";
import { effectiveBorrowingCostPercent } from "./loan-basics";

export interface InterestMilestone {
  years: number;
  interestPaid: number;
}

export interface AdvancedInsights {
  averageMonthlyInterest: number;
  highestInterestMonth: { period: number; interest: number; date: Date } | null;
  interestMilestones: InterestMilestone[];
  balanceAtYear: (year: number) => number;
  effectiveAnnualBorrowingCostPercent: number;
}

const MILESTONE_YEARS = [5, 10, 15];

/**
 * Derives the "advanced insights" surfaced beyond the headline EMI/interest
 * cards — all computed directly off the schedule that's already built, no
 * extra simulation needed.
 */
export function deriveAdvancedInsights(
  rows: AmortizationRow[],
  summary: LoanSummary,
  processingFee: number,
  principal: number,
  tenureMonths: number
): AdvancedInsights {
  const averageMonthlyInterest = rows.length > 0 ? summary.totalInterest / rows.length : 0;

  const highestInterestRow = rows.reduce<AmortizationRow | null>(
    (max, row) => (!max || row.interest > max.interest ? row : max),
    null
  );

  const interestMilestones: InterestMilestone[] = MILESTONE_YEARS.filter(
    (years) => years * 12 <= rows.length
  ).map((years) => {
    const cutoffMonth = years * 12;
    const interestPaid = rows
      .filter((row) => row.period <= cutoffMonth)
      .reduce((sum, row) => sum + row.interest, 0);
    return { years, interestPaid };
  });

  function balanceAtYear(year: number): number {
    const month = year * 12;
    if (month <= 0) return principal;
    if (month >= rows.length) return rows[rows.length - 1]?.closingBalance ?? 0;
    return rows[month - 1].closingBalance;
  }

  const effectiveAnnualBorrowingCostPercent = effectiveBorrowingCostPercent(
    summary.totalInterest,
    processingFee,
    principal,
    tenureMonths / 12
  );

  return {
    averageMonthlyInterest,
    highestInterestMonth: highestInterestRow
      ? {
          period: highestInterestRow.period,
          interest: highestInterestRow.interest,
          date: highestInterestRow.date,
        }
      : null,
    interestMilestones,
    balanceAtYear,
    effectiveAnnualBorrowingCostPercent,
  };
}
