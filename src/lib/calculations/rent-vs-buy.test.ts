import { describe, expect, it } from "vitest";
import { compareRentVsBuy } from "./rent-vs-buy";

const baseInput = {
  housePrice: 6000000,
  downPaymentPercent: 20,
  loanRatePercent: 8.5,
  loanTenureYears: 20,
  monthlyRent: 25000,
  rentGrowthPercent: 5,
  maintenancePercent: 1,
  propertyAppreciationPercent: 6,
  investmentReturnPercent: 10,
  stampDutyPercent: 6,
  horizonYears: 15,
};

describe("compareRentVsBuy", () => {
  it("produces one timeline point per horizon year", () => {
    const result = compareRentVsBuy(baseInput);
    expect(result.timeline).toHaveLength(15);
    expect(result.timeline.map((p) => p.year)).toEqual(
      Array.from({ length: 15 }, (_, i) => i + 1)
    );
  });

  it("favors renting when rent is far cheaper than owning", () => {
    const result = compareRentVsBuy({ ...baseInput, monthlyRent: 5000 });
    expect(result.recommendation).toBe("rent");
    expect(result.finalDifference).toBeLessThan(0);
  });

  it("favors buying when rent is far more expensive than owning", () => {
    const result = compareRentVsBuy({ ...baseInput, monthlyRent: 80000 });
    expect(result.recommendation).toBe("buy");
    expect(result.finalDifference).toBeGreaterThan(0);
  });

  it("shifts the recommendation toward buying as rent rises, all else equal", () => {
    const cheaperRent = compareRentVsBuy({ ...baseInput, monthlyRent: 20000 });
    const pricierRent = compareRentVsBuy({ ...baseInput, monthlyRent: 45000 });
    expect(pricierRent.finalDifference).toBeGreaterThan(cheaperRent.finalDifference);
  });

  it("tracks decreasing outstanding loan balance year over year", () => {
    const result = compareRentVsBuy(baseInput);
    for (let i = 1; i < result.timeline.length; i++) {
      expect(result.timeline[i].outstandingLoan).toBeLessThanOrEqual(
        result.timeline[i - 1].outstandingLoan
      );
    }
  });

  it("zeroes out the outstanding loan once the horizon exceeds the loan tenure", () => {
    const result = compareRentVsBuy({ ...baseInput, loanTenureYears: 10, horizonYears: 15 });
    expect(result.timeline[14].outstandingLoan).toBe(0);
  });
});
