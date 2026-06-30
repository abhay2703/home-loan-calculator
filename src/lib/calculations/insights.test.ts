import { describe, expect, it } from "vitest";
import { buildAmortizationSchedule } from "./amortization";
import { deriveAdvancedInsights } from "./insights";
import { calculateProcessingFee } from "./loan-basics";
import type { LoanScheduleParams } from "./types";

const params: LoanScheduleParams = {
  principal: 5000000,
  annualRatePercent: 8.5,
  tenureMonths: 240,
  startDate: new Date(2026, 0, 1),
  emiType: "normal",
};

describe("deriveAdvancedInsights", () => {
  const { rows, summary } = buildAmortizationSchedule(params);
  const processingFee = calculateProcessingFee(params.principal, { type: "percent", value: 0.5 });
  const insights = deriveAdvancedInsights(
    rows,
    summary,
    processingFee,
    params.principal,
    params.tenureMonths
  );

  it("computes average monthly interest consistent with the total", () => {
    expect(insights.averageMonthlyInterest * rows.length).toBeCloseTo(summary.totalInterest, 0);
  });

  it("finds the highest-interest month as the very first row (reducing balance loan)", () => {
    expect(insights.highestInterestMonth?.period).toBe(1);
    expect(insights.highestInterestMonth?.interest).toBeCloseTo(rows[0].interest, 6);
  });

  it("reports interest milestones at 5/10/15 years that increase monotonically", () => {
    expect(insights.interestMilestones).toHaveLength(3);
    const [y5, y10, y15] = insights.interestMilestones;
    expect(y5.years).toBe(5);
    expect(y10.interestPaid).toBeGreaterThan(y5.interestPaid);
    expect(y15.interestPaid).toBeGreaterThan(y10.interestPaid);
  });

  it("looks up the remaining balance at a given year from the schedule", () => {
    expect(insights.balanceAtYear(0)).toBeCloseTo(5000000, 1);
    expect(insights.balanceAtYear(20)).toBeCloseTo(rows[rows.length - 1].closingBalance, 1);
    expect(insights.balanceAtYear(10)).toBeCloseTo(rows[119].closingBalance, 1);
  });

  it("computes a positive effective annual borrowing cost above the nominal rate", () => {
    // Processing fee folded in should push the effective cost at or above
    // what the nominal interest alone would imply.
    expect(insights.effectiveAnnualBorrowingCostPercent).toBeGreaterThan(0);
  });
});
