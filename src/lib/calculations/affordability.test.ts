import { describe, expect, it } from "vitest";
import { calculateAffordability } from "./affordability";
import { calculateEMI, maxLoanAmountForEmi } from "./emi";

describe("maxLoanAmountForEmi", () => {
  it("round-trips with calculateEMI", () => {
    const emi = calculateEMI(5000000, 8.5, 240);
    const principal = maxLoanAmountForEmi(emi, 8.5, 240);
    expect(principal).toBeCloseTo(5000000, 2);
  });

  it("returns 0 for non-positive EMI or tenure", () => {
    expect(maxLoanAmountForEmi(0, 8.5, 240)).toBe(0);
    expect(maxLoanAmountForEmi(50000, 8.5, 0)).toBe(0);
  });
});

describe("calculateAffordability", () => {
  it("caps the affordable EMI at the FOIR limit when expenses leave plenty of room", () => {
    const result = calculateAffordability({
      monthlyIncome: 150000,
      existingEmis: 0,
      monthlyExpenses: 20000,
      targetDownPayment: 1000000,
      annualRatePercent: 8.5,
      tenureMonths: 240,
      foirPercent: 50,
    });
    // FOIR cap: 150000*0.5 = 75000; surplus: 150000-20000 = 130000 -> FOIR binds
    expect(result.maxAffordableEmi).toBeCloseTo(75000, 0);
  });

  it("caps the affordable EMI at the expense-driven surplus when it is tighter than FOIR", () => {
    const result = calculateAffordability({
      monthlyIncome: 150000,
      existingEmis: 0,
      monthlyExpenses: 130000,
      targetDownPayment: 1000000,
      annualRatePercent: 8.5,
      tenureMonths: 240,
      foirPercent: 50,
    });
    // FOIR cap: 75000; surplus: 150000-130000 = 20000 -> surplus binds
    expect(result.maxAffordableEmi).toBeCloseTo(20000, 0);
  });

  it("subtracts existing EMIs from the FOIR budget", () => {
    const withoutExisting = calculateAffordability({
      monthlyIncome: 150000,
      existingEmis: 0,
      monthlyExpenses: 20000,
      targetDownPayment: 1000000,
      annualRatePercent: 8.5,
      tenureMonths: 240,
      foirPercent: 50,
    });
    const withExisting = calculateAffordability({
      monthlyIncome: 150000,
      existingEmis: 20000,
      monthlyExpenses: 20000,
      targetDownPayment: 1000000,
      annualRatePercent: 8.5,
      tenureMonths: 240,
      foirPercent: 50,
    });
    expect(withExisting.maxAffordableEmi).toBeCloseTo(withoutExisting.maxAffordableEmi - 20000, 0);
  });

  it("adds the down payment on top of the max loan amount for max property price", () => {
    const result = calculateAffordability({
      monthlyIncome: 150000,
      existingEmis: 0,
      monthlyExpenses: 20000,
      targetDownPayment: 1000000,
      annualRatePercent: 8.5,
      tenureMonths: 240,
      foirPercent: 50,
    });
    expect(result.maxPropertyPrice).toBeCloseTo(result.maxLoanAmount + 1000000, 2);
  });
});
