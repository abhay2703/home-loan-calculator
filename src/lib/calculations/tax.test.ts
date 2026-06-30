import { describe, expect, it } from "vitest";
import { calculateTaxBenefit } from "./tax";

describe("calculateTaxBenefit — slab math", () => {
  it("matches an independently computed new-regime slab tax (taxable 15L)", () => {
    // annualIncome chosen so taxableIncome lands exactly on 15,00,000 after
    // the 75,000 standard deduction (no home loan, no 80C in new regime).
    const result = calculateTaxBenefit({
      annualIncome: 1575000,
      regime: "new",
      homeLoanInterestPaid: 0,
      homeLoanPrincipalPaid: 0,
      other80CInvestments: 0,
      isFirstTimeBuyer: false,
      isSelfOccupied: true,
    });
    expect(result.taxableIncome).toBeCloseTo(1500000, 0);
    expect(result.taxPayable).toBeCloseTo(109200, 0);
  });

  it("matches an independently computed old-regime slab tax (taxable 8L)", () => {
    // annualIncome chosen so taxableIncome lands exactly on 8,00,000 after
    // the 50,000 standard deduction.
    const result = calculateTaxBenefit({
      annualIncome: 850000,
      regime: "old",
      homeLoanInterestPaid: 0,
      homeLoanPrincipalPaid: 0,
      other80CInvestments: 0,
      isFirstTimeBuyer: false,
      isSelfOccupied: true,
    });
    expect(result.taxableIncome).toBeCloseTo(800000, 0);
    expect(result.taxPayable).toBeCloseTo(75400, 0);
  });

  it("applies the section 87A rebate to zero out tax at the new-regime threshold", () => {
    const result = calculateTaxBenefit({
      annualIncome: 1275000, // 12,75,000 - 75,000 standard deduction = 12,00,000 taxable
      regime: "new",
      homeLoanInterestPaid: 0,
      homeLoanPrincipalPaid: 0,
      other80CInvestments: 0,
      isFirstTimeBuyer: false,
      isSelfOccupied: true,
    });
    expect(result.taxableIncome).toBeCloseTo(1200000, 0);
    expect(result.taxPayable).toBe(0);
  });
});

describe("calculateTaxBenefit — home loan deductions", () => {
  const baseInput = {
    annualIncome: 2000000,
    homeLoanInterestPaid: 300000,
    homeLoanPrincipalPaid: 200000,
    other80CInvestments: 100000,
    isFirstTimeBuyer: false,
    isSelfOccupied: true,
  };

  it("caps section 24 interest deduction at 2,00,000 for self-occupied, old regime", () => {
    const result = calculateTaxBenefit({ ...baseInput, regime: "old" });
    expect(result.section24Deduction).toBe(200000);
  });

  it("caps section 80C at 1,50,000 combining principal and other investments", () => {
    const result = calculateTaxBenefit({ ...baseInput, regime: "old" });
    expect(result.section80CDeduction).toBe(150000);
  });

  it("grants no section 24 deduction for self-occupied property under the new regime", () => {
    const result = calculateTaxBenefit({ ...baseInput, regime: "new" });
    expect(result.section24Deduction).toBe(0);
    expect(result.section80CDeduction).toBe(0);
  });

  it("allows the full interest deduction for let-out property under the new regime, capped at 2L", () => {
    const result = calculateTaxBenefit({ ...baseInput, regime: "new", isSelfOccupied: false });
    expect(result.section24Deduction).toBe(200000);
  });

  it("grants an additional 80EEA deduction for first-time buyers on the old regime, beyond the 24(b) cap", () => {
    const withFirstTime = calculateTaxBenefit({ ...baseInput, regime: "old", isFirstTimeBuyer: true });
    expect(withFirstTime.section80EEADeduction).toBeCloseTo(100000, 0); // 300000 - 200000 already claimed
  });

  it("always shows non-negative tax saved from the home loan", () => {
    const result = calculateTaxBenefit({ ...baseInput, regime: "old" });
    expect(result.taxSavedFromHomeLoan).toBeGreaterThan(0);
    expect(result.taxPayable).toBeLessThan(result.taxWithoutHomeLoan);
  });
});
