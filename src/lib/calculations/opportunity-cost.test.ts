import { describe, expect, it } from "vitest";
import { calculateOpportunityCost } from "./opportunity-cost";

describe("calculateOpportunityCost", () => {
  it("recommends investing when the return rate beats the loan rate", () => {
    const result = calculateOpportunityCost({
      amount: 5000000,
      loanRatePercent: 8.5,
      investmentReturnPercent: 12,
      years: 20,
    });
    expect(result.recommendation).toBe("invest");
    expect(result.netAdvantage).toBeGreaterThan(0);
    expect(result.futureValueIfInvested).toBeGreaterThan(5000000);
  });

  it("recommends prepaying when the loan rate beats the return rate", () => {
    const result = calculateOpportunityCost({
      amount: 5000000,
      loanRatePercent: 12,
      investmentReturnPercent: 7,
      years: 20,
    });
    expect(result.recommendation).toBe("prepay");
    expect(result.netAdvantage).toBeLessThan(0);
  });

  it("is neutral when both rates are equal", () => {
    const result = calculateOpportunityCost({
      amount: 1000000,
      loanRatePercent: 8.5,
      investmentReturnPercent: 8.5,
      years: 10,
    });
    expect(result.recommendation).toBe("neutral");
    expect(result.netAdvantage).toBeCloseTo(0, 6);
  });
});
