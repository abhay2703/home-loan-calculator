import { describe, expect, it } from "vitest";
import { projectSalaryGrowth } from "./salary-growth";

describe("projectSalaryGrowth", () => {
  const baseInput = {
    currentMonthlyIncome: 150000,
    annualGrowthPercent: 8,
    years: 10,
    foirPercent: 50,
    existingEmis: 0,
    monthlyExpenses: 40000,
    currentLoanEmi: 43391,
  };

  it("produces one projection per year", () => {
    expect(projectSalaryGrowth(baseInput)).toHaveLength(10);
  });

  it("grows projected income compounding at the given rate", () => {
    const projections = projectSalaryGrowth(baseInput);
    expect(projections[0].projectedMonthlyIncome).toBeCloseTo(150000 * 1.08, 1);
    expect(projections[9].projectedMonthlyIncome).toBeCloseTo(150000 * Math.pow(1.08, 10), 1);
  });

  it("increases prepayment capacity monotonically as income grows", () => {
    const projections = projectSalaryGrowth(baseInput);
    for (let i = 1; i < projections.length; i++) {
      expect(projections[i].prepaymentCapacity).toBeGreaterThanOrEqual(
        projections[i - 1].prepaymentCapacity
      );
    }
  });

  it("reports zero prepayment capacity while affordable EMI stays below the current EMI", () => {
    const projections = projectSalaryGrowth({ ...baseInput, currentLoanEmi: 5000000 });
    expect(projections.every((p) => p.prepaymentCapacity === 0)).toBe(true);
  });
});
