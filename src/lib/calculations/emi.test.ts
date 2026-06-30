import { describe, expect, it } from "vitest";
import { calculateEMI, solveStepEmi } from "./emi";

describe("calculateEMI", () => {
  it("matches an independently computed reference value", () => {
    // Reference computed separately via node: P=50,00,000, rate=8.5%, n=240 months.
    expect(calculateEMI(5000000, 8.5, 240)).toBeCloseTo(43391.1617, 3);
  });

  it("returns principal / tenure when the rate is zero", () => {
    expect(calculateEMI(1200000, 0, 12)).toBeCloseTo(100000, 6);
  });

  it("returns 0 for non-positive principal or tenure", () => {
    expect(calculateEMI(0, 8.5, 240)).toBe(0);
    expect(calculateEMI(5000000, 8.5, 0)).toBe(0);
  });

  it("produces a larger EMI for a shorter tenure at the same rate", () => {
    const long = calculateEMI(5000000, 8.5, 240);
    const short = calculateEMI(5000000, 8.5, 120);
    expect(short).toBeGreaterThan(long);
  });
});

describe("solveStepEmi", () => {
  it("finds a starting EMI that fully amortizes a step-up loan over the tenure", () => {
    const principal = 5000000;
    const annualRate = 8.5;
    const tenureMonths = 240;
    const stepPercent = 5;
    const startingEmi = solveStepEmi(principal, annualRate, tenureMonths, stepPercent, "up");

    let balance = principal;
    const monthlyRate = annualRate / 1200;
    for (let month = 1; month <= tenureMonths; month++) {
      const yearIndex = Math.floor((month - 1) / 12);
      const emi = startingEmi * Math.pow(1 + stepPercent / 100, yearIndex);
      balance = balance + balance * monthlyRate - emi;
    }
    expect(balance).toBeCloseTo(0, 1);
  });

  it("starts lower than the flat EMI for step-up, and higher for step-down", () => {
    const principal = 5000000;
    const annualRate = 8.5;
    const tenureMonths = 240;
    const flatEmi = calculateEMI(principal, annualRate, tenureMonths);
    const stepUpEmi = solveStepEmi(principal, annualRate, tenureMonths, 5, "up");
    const stepDownEmi = solveStepEmi(principal, annualRate, tenureMonths, 5, "down");

    expect(stepUpEmi).toBeLessThan(flatEmi);
    expect(stepDownEmi).toBeGreaterThan(flatEmi);
  });
});
