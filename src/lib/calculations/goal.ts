import { buildAmortizationSchedule } from "./amortization";
import { calculateEMI } from "./emi";
import type { LoanScheduleParams } from "./types";

/** The flat EMI required to close the loan in exactly goalMonths. */
export function requiredEmiForGoalTenure(
  principal: number,
  annualRatePercent: number,
  goalMonths: number
): number {
  return calculateEMI(principal, annualRatePercent, goalMonths);
}

/**
 * Binary-searches the yearly recurring prepayment (reduceTenure strategy)
 * needed to close the loan by goalMonths, holding the loan's existing EMI
 * type and tenure fixed. Returns 0 if the goal is already met without any
 * prepayment. The search relies on actualTenureMonths decreasing
 * monotonically as the prepayment amount grows.
 */
export function solveRequiredYearlyPrepayment(
  baseParams: Omit<LoanScheduleParams, "prepayment">,
  goalMonths: number
): number {
  const withoutPrepayment = buildAmortizationSchedule(baseParams);
  if (withoutPrepayment.summary.actualTenureMonths <= goalMonths) return 0;

  let lo = 0;
  let hi = baseParams.principal;

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const result = buildAmortizationSchedule({
      ...baseParams,
      prepayment: {
        strategy: "reduceTenure",
        recurring: { amount: mid, frequency: "yearly", startMonth: 12 },
      },
    });
    if (result.summary.actualTenureMonths > goalMonths) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return hi;
}
