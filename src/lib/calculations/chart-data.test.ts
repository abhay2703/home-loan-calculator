import { describe, expect, it } from "vitest";
import { buildAmortizationSchedule } from "./amortization";
import { findCrossoverMonth } from "./chart-data";

describe("findCrossoverMonth", () => {
  it("finds the month principal first overtakes interest on a typical loan", () => {
    const { rows } = buildAmortizationSchedule({
      principal: 5000000,
      annualRatePercent: 8.5,
      tenureMonths: 240,
      startDate: new Date(2026, 0, 1),
      emiType: "normal",
    });
    const crossover = findCrossoverMonth(rows);
    expect(crossover).not.toBeNull();
    const row = rows[(crossover ?? 1) - 1];
    expect(row.principal).toBeGreaterThanOrEqual(row.interest);
    if (crossover && crossover > 1) {
      const prevRow = rows[crossover - 2];
      expect(prevRow.principal).toBeLessThan(prevRow.interest);
    }
  });

  it("returns null when principal never overtakes interest", () => {
    expect(findCrossoverMonth([])).toBeNull();
  });
});
