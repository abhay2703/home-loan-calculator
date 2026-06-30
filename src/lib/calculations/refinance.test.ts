import { describe, expect, it } from "vitest";
import { calculateRefinance } from "./refinance";

describe("calculateRefinance", () => {
  const baseInput = {
    outstandingBalance: 4000000,
    remainingTenureMonths: 180,
    currentRatePercent: 9.5,
    newRatePercent: 8.3,
    processingFee: 10000,
    legalFees: 5000,
    balanceTransferFee: 5000,
  };

  it("shows a lower EMI and positive savings when the new rate is meaningfully lower", () => {
    const result = calculateRefinance(baseInput);
    expect(result.newEmi).toBeLessThan(result.currentEmi);
    expect(result.monthlyEmiSavings).toBeGreaterThan(0);
    expect(result.totalInterestSavings).toBeGreaterThan(0);
    expect(result.worthIt).toBe(true);
  });

  it("computes a breakeven month consistent with cost / monthly savings", () => {
    const result = calculateRefinance(baseInput);
    expect(result.breakevenMonths).toBe(
      Math.ceil(result.totalRefinanceCost / result.monthlyEmiSavings)
    );
  });

  it("is not worth it when fees outweigh a tiny rate improvement", () => {
    const result = calculateRefinance({
      ...baseInput,
      newRatePercent: 9.45,
      processingFee: 200000,
      legalFees: 50000,
      balanceTransferFee: 50000,
    });
    expect(result.worthIt).toBe(false);
    expect(result.netSavings).toBeLessThan(0);
  });

  it("returns a null breakeven when the new rate doesn't reduce the EMI", () => {
    const result = calculateRefinance({ ...baseInput, newRatePercent: 9.5 });
    expect(result.breakevenMonths).toBeNull();
  });
});
