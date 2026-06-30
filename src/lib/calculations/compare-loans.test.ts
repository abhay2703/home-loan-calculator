import { describe, expect, it } from "vitest";
import { compareLoanOffers, type LoanOffer } from "./compare-loans";

describe("compareLoanOffers", () => {
  const offers: LoanOffer[] = [
    { id: "a", bankName: "Bank A", interestRatePercent: 8.5, processingFeeType: "percent", processingFeeValue: 0.5, otherCharges: 5000 },
    { id: "b", bankName: "Bank B", interestRatePercent: 8.2, processingFeeType: "flat", processingFeeValue: 15000, otherCharges: 0 },
    { id: "c", bankName: "Bank C", interestRatePercent: 9.0, processingFeeType: "percent", processingFeeValue: 0, otherCharges: 0 },
  ];

  it("computes EMI and total interest per offer independently", () => {
    const results = compareLoanOffers(5000000, 240, offers);
    expect(results).toHaveLength(3);
    // Higher rate -> higher EMI and higher total interest.
    const a = results.find((r) => r.id === "a")!;
    const c = results.find((r) => r.id === "c")!;
    expect(c.emi).toBeGreaterThan(a.emi);
    expect(c.totalInterest).toBeGreaterThan(a.totalInterest);
  });

  it("flags exactly one offer as best, by lowest total cost", () => {
    const results = compareLoanOffers(5000000, 240, offers);
    expect(results.filter((r) => r.isBest)).toHaveLength(1);
  });

  it("picks the lowest-rate offer as best when fees are comparable", () => {
    const results = compareLoanOffers(5000000, 240, [
      { id: "low", bankName: "Low Rate", interestRatePercent: 8.0, processingFeeType: "flat", processingFeeValue: 10000, otherCharges: 0 },
      { id: "high", bankName: "High Rate", interestRatePercent: 9.5, processingFeeType: "flat", processingFeeValue: 10000, otherCharges: 0 },
    ]);
    expect(results.find((r) => r.id === "low")?.isBest).toBe(true);
  });

  it("returns an empty array for no offers", () => {
    expect(compareLoanOffers(5000000, 240, [])).toEqual([]);
  });
});
