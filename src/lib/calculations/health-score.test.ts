import { describe, expect, it } from "vitest";
import { calculateFinancialHealthScore } from "./health-score";

describe("calculateFinancialHealthScore", () => {
  it("scores a healthy, well-structured loan highly", () => {
    const result = calculateFinancialHealthScore({
      monthlyEmi: 30000,
      monthlyIncome: 200000, // 15% EMI/income
      totalInterest: 2500000,
      totalPrincipal: 5000000, // 0.5 ratio
      tenureMonths: 120,
      downPaymentPercent: 30,
      hasPrepaymentPlan: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.stars).toBeGreaterThanOrEqual(4);
    expect(result.label).toMatch(/Excellent|Strong/);
  });

  it("scores a strained, poorly-structured loan low", () => {
    const result = calculateFinancialHealthScore({
      monthlyEmi: 90000,
      monthlyIncome: 120000, // 75% EMI/income
      totalInterest: 12000000,
      totalPrincipal: 5000000, // 2.4 ratio
      tenureMonths: 360,
      downPaymentPercent: 5,
      hasPrepaymentPlan: false,
    });
    expect(result.score).toBeLessThan(40);
    expect(result.stars).toBeLessThanOrEqual(2);
  });

  it("clamps stars to the 1-5 range", () => {
    const best = calculateFinancialHealthScore({
      monthlyEmi: 10000,
      monthlyIncome: 500000,
      totalInterest: 1000000,
      totalPrincipal: 5000000,
      tenureMonths: 60,
      downPaymentPercent: 50,
      hasPrepaymentPlan: true,
    });
    expect(best.stars).toBeLessThanOrEqual(5);
    expect(best.stars).toBeGreaterThanOrEqual(1);
  });

  it("falls back to a neutral score for factors with missing optional inputs", () => {
    const withIncome = calculateFinancialHealthScore({
      monthlyEmi: 43391,
      monthlyIncome: 150000,
      totalInterest: 5400000,
      totalPrincipal: 5000000,
      tenureMonths: 240,
      hasPrepaymentPlan: false,
    });
    const withoutIncome = calculateFinancialHealthScore({
      monthlyEmi: 43391,
      totalInterest: 5400000,
      totalPrincipal: 5000000,
      tenureMonths: 240,
      hasPrepaymentPlan: false,
    });
    // Without income data, the EMI-vs-income factor should not tank the score.
    expect(withoutIncome.score).toBeGreaterThan(0);
    expect(Math.abs(withIncome.score - withoutIncome.score)).toBeLessThan(40);
  });

  it("suggests a prepayment plan when none exists, and not when one does", () => {
    const without = calculateFinancialHealthScore({
      monthlyEmi: 43391,
      totalInterest: 5400000,
      totalPrincipal: 5000000,
      tenureMonths: 240,
      hasPrepaymentPlan: false,
    });
    const withPlan = calculateFinancialHealthScore({
      monthlyEmi: 43391,
      totalInterest: 5400000,
      totalPrincipal: 5000000,
      tenureMonths: 240,
      hasPrepaymentPlan: true,
    });
    expect(without.suggestions.some((s) => s.toLowerCase().includes("prepayment"))).toBe(true);
    expect(withPlan.suggestions.some((s) => s.toLowerCase().includes("recurring prepayment"))).toBe(false);
  });
});
