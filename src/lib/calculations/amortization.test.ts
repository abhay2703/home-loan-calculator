import { describe, expect, it } from "vitest";
import { buildAmortizationSchedule, buildEmiIncreaseSchedule } from "./amortization";
import { calculateEMI } from "./emi";
import type { LoanScheduleParams } from "./types";

const baseParams: LoanScheduleParams = {
  principal: 5000000,
  annualRatePercent: 8.5,
  tenureMonths: 240,
  startDate: new Date(2026, 0, 1),
  emiType: "normal",
};

describe("buildAmortizationSchedule — normal EMI", () => {
  const { rows, summary } = buildAmortizationSchedule(baseParams);

  it("runs for exactly the scheduled tenure", () => {
    expect(rows).toHaveLength(240);
  });

  it("fully pays off the loan by the last row", () => {
    expect(rows[rows.length - 1].closingBalance).toBeCloseTo(0, 1);
  });

  it("starts with the full principal as the opening balance", () => {
    expect(rows[0].openingBalance).toBeCloseTo(5000000, 1);
  });

  it("keeps a constant EMI across all rows", () => {
    const expectedEmi = calculateEMI(5000000, 8.5, 240);
    for (const row of rows) {
      expect(row.emi).toBeCloseTo(expectedEmi, 0);
    }
  });

  it("derives principal/interest percentages that sum to 100", () => {
    expect(summary.interestPercent + summary.principalPercent).toBeCloseTo(100, 5);
  });

  it("reports zero months saved with no prepayment", () => {
    expect(summary.monthsSaved).toBe(0);
  });
});

describe("buildAmortizationSchedule — step-up EMI", () => {
  it("increases the EMI every 12 months and still closes out near zero", () => {
    const { rows } = buildAmortizationSchedule({
      ...baseParams,
      emiType: "stepUp",
      stepPercent: 5,
    });
    expect(rows[12].emi).toBeGreaterThan(rows[0].emi);
    expect(rows[rows.length - 1].closingBalance).toBeCloseTo(0, 1);
  });
});

describe("buildAmortizationSchedule — interest-only construction period", () => {
  it("pays zero principal during the interest-only months", () => {
    const { rows } = buildAmortizationSchedule({
      ...baseParams,
      emiType: "interestOnly",
      interestOnlyMonths: 12,
    });
    for (let i = 0; i < 12; i++) {
      expect(rows[i].principal).toBeCloseTo(0, 6);
      expect(rows[i].closingBalance).toBeCloseTo(5000000, 1);
    }
    expect(rows[12].principal).toBeGreaterThan(0);
  });
});

describe("buildAmortizationSchedule — prepayment", () => {
  it("reduceTenure: finishes early and saves interest vs. no prepayment", () => {
    const withoutPrepayment = buildAmortizationSchedule(baseParams);
    const withPrepayment = buildAmortizationSchedule({
      ...baseParams,
      prepayment: {
        strategy: "reduceTenure",
        recurring: { amount: 100000, frequency: "yearly", startMonth: 12 },
      },
    });

    expect(withPrepayment.summary.actualTenureMonths).toBeLessThan(
      withoutPrepayment.summary.actualTenureMonths
    );
    expect(withPrepayment.summary.totalInterest).toBeLessThan(
      withoutPrepayment.summary.totalInterest
    );
    expect(withPrepayment.summary.monthsSaved).toBeGreaterThan(0);
  });

  it("reduceEmi: keeps roughly the same tenure but lowers the EMI over time", () => {
    const { rows, summary } = buildAmortizationSchedule({
      ...baseParams,
      prepayment: {
        strategy: "reduceEmi",
        recurring: { amount: 100000, frequency: "yearly", startMonth: 12 },
      },
    });

    expect(rows[rows.length - 1].emi).toBeLessThan(rows[0].emi);
    expect(summary.actualTenureMonths).toBeGreaterThan(230);
    expect(summary.actualTenureMonths).toBeLessThanOrEqual(240);
  });

  it("applies one-off lump sums on the exact scheduled month", () => {
    const { rows } = buildAmortizationSchedule({
      ...baseParams,
      prepayment: {
        strategy: "reduceTenure",
        lumpSums: [{ month: 36, amount: 200000 }],
      },
    });
    expect(rows[35].extraPayment).toBe(200000);
    expect(rows[34].extraPayment).toBe(0);
  });
});

describe("buildAmortizationSchedule — floating rate", () => {
  it("keeps the base rate until the scheduled change month", () => {
    const { rows } = buildAmortizationSchedule({
      ...baseParams,
      rateSchedule: [{ fromMonth: 25, annualRatePercent: 9.5 }],
    });
    // Interest = openingBalance * monthlyRate, so a rate bump shows up as a
    // jump in interest even though both months have a similar balance.
    expect(rows[23].interest / rows[23].openingBalance).toBeCloseTo(8.5 / 1200, 5);
    expect(rows[24].interest / rows[24].openingBalance).toBeCloseTo(9.5 / 1200, 5);
  });

  it("recomputes EMI off the remaining balance and remaining tenure at each change, keeping tenure fixed", () => {
    const { rows, summary } = buildAmortizationSchedule({
      ...baseParams,
      rateSchedule: [
        { fromMonth: 13, annualRatePercent: 9.5 },
        { fromMonth: 85, annualRatePercent: 7.9 },
      ],
    });

    const emiAtMonth12 = rows[11].emi;
    const emiAtMonth13 = rows[12].emi;
    const emiAtMonth84 = rows[83].emi;
    const emiAtMonth85 = rows[84].emi;

    expect(emiAtMonth13).not.toBeCloseTo(emiAtMonth12, 0);
    expect(emiAtMonth85).not.toBeCloseTo(emiAtMonth84, 0);
    expect(summary.actualTenureMonths).toBe(240);
    expect(rows[rows.length - 1].closingBalance).toBeCloseTo(0, 1);
  });

  it("matches the flat-rate schedule exactly when there is no rate change", () => {
    const flat = buildAmortizationSchedule(baseParams);
    const floating = buildAmortizationSchedule({ ...baseParams, rateSchedule: [] });
    expect(floating.summary.totalInterest).toBeCloseTo(flat.summary.totalInterest, 2);
  });
});

describe("buildEmiIncreaseSchedule", () => {
  it("closes the loan earlier than the original tenure as the EMI grows", () => {
    const baselineEmi = calculateEMI(5000000, 8.5, 240);
    const { summary } = buildEmiIncreaseSchedule({
      principal: 5000000,
      annualRatePercent: 8.5,
      tenureMonths: 240,
      startDate: new Date(2026, 0, 1),
      baselineEmi,
      annualIncreasePercent: 5,
    });

    expect(summary.actualTenureMonths).toBeLessThan(240);
    expect(summary.monthsSaved).toBeGreaterThan(0);
    expect(summary.finalEmi).toBeGreaterThan(baselineEmi);
  });

  it("behaves like a flat-EMI loan when the increase is 0%", () => {
    const baselineEmi = calculateEMI(5000000, 8.5, 240);
    const { summary } = buildEmiIncreaseSchedule({
      principal: 5000000,
      annualRatePercent: 8.5,
      tenureMonths: 240,
      startDate: new Date(2026, 0, 1),
      baselineEmi,
      annualIncreasePercent: 0,
    });

    expect(summary.actualTenureMonths).toBe(240);
    expect(summary.totalInterest).toBeCloseTo(
      buildAmortizationSchedule({
        principal: 5000000,
        annualRatePercent: 8.5,
        tenureMonths: 240,
        startDate: new Date(2026, 0, 1),
        emiType: "normal",
      }).summary.totalInterest,
      0
    );
  });
});
