import { describe, expect, it } from "vitest";
import { compareEmiVsCash } from "./emi-vs-cash";

const baseInput = {
  propertyPrice: 6000000,
  downPayment: 1000000,
  annualRatePercent: 8.5,
  tenureMonths: 240,
  horizonYears: [5, 10, 15, 20],
};

describe("compareEmiVsCash", () => {
  it("is a financial wash when the investment return equals the loan rate, at every horizon", () => {
    const results = compareEmiVsCash({ ...baseInput, investmentReturnPercent: 8.5 });
    for (const r of results) {
      expect(r.difference).toBeCloseTo(0, 0);
      expect(r.advantage).toBe("neutral");
    }
  });

  it("favors the loan (leverage) scenario when investment returns exceed the loan rate", () => {
    const results = compareEmiVsCash({ ...baseInput, investmentReturnPercent: 12 });
    for (const r of results) {
      expect(r.loanScenarioNetWorth).toBeGreaterThan(r.cashScenarioNetWorth);
      expect(r.advantage).toBe("loan");
    }
  });

  it("favors the cash scenario when investment returns are below the loan rate", () => {
    const results = compareEmiVsCash({ ...baseInput, investmentReturnPercent: 6 });
    for (const r of results) {
      expect(r.cashScenarioNetWorth).toBeGreaterThan(r.loanScenarioNetWorth);
      expect(r.advantage).toBe("cash");
    }
  });

  it("returns one result per requested horizon year, in order", () => {
    const results = compareEmiVsCash({ ...baseInput, investmentReturnPercent: 10 });
    expect(results.map((r) => r.year)).toEqual([5, 10, 15, 20]);
  });
});
