import { describe, expect, it } from "vitest";
import { requiredEmiForGoalTenure, solveRequiredYearlyPrepayment } from "./goal";
import { buildAmortizationSchedule } from "./amortization";
import { calculateEMI } from "./emi";
import type { LoanScheduleParams } from "./types";

describe("requiredEmiForGoalTenure", () => {
  it("matches calculateEMI for the goal tenure", () => {
    expect(requiredEmiForGoalTenure(5000000, 8.5, 120)).toBeCloseTo(
      calculateEMI(5000000, 8.5, 120),
      6
    );
  });

  it("is larger than the EMI for a longer tenure", () => {
    const goal10yr = requiredEmiForGoalTenure(5000000, 8.5, 120);
    const original20yr = requiredEmiForGoalTenure(5000000, 8.5, 240);
    expect(goal10yr).toBeGreaterThan(original20yr);
  });
});

describe("solveRequiredYearlyPrepayment", () => {
  const baseParams: Omit<LoanScheduleParams, "prepayment"> = {
    principal: 5000000,
    annualRatePercent: 8.5,
    tenureMonths: 240,
    startDate: new Date(2026, 0, 1),
    emiType: "normal",
  };

  it("returns 0 when the goal is already met without prepayment", () => {
    expect(solveRequiredYearlyPrepayment(baseParams, 240)).toBe(0);
    expect(solveRequiredYearlyPrepayment(baseParams, 300)).toBe(0);
  });

  it("finds a yearly prepayment that closes the loan by the goal year, within a month", () => {
    const goalMonths = 120;
    const requiredAmount = solveRequiredYearlyPrepayment(baseParams, goalMonths);
    expect(requiredAmount).toBeGreaterThan(0);

    const result = buildAmortizationSchedule({
      ...baseParams,
      prepayment: {
        strategy: "reduceTenure",
        recurring: { amount: requiredAmount, frequency: "yearly", startMonth: 12 },
      },
    });

    expect(Math.abs(result.summary.actualTenureMonths - goalMonths)).toBeLessThanOrEqual(1);
  });

  it("requires a larger prepayment for a more aggressive goal", () => {
    const tenYear = solveRequiredYearlyPrepayment(baseParams, 120);
    const fiveYear = solveRequiredYearlyPrepayment(baseParams, 60);
    expect(fiveYear).toBeGreaterThan(tenYear);
  });
});
