import { describe, expect, it } from "vitest";
import { generateSmartSuggestions } from "./suggestions";

const baseInput = {
  principal: 5000000,
  annualRatePercent: 8.5,
  tenureMonths: 240,
  startDate: new Date(2026, 0, 1),
  emiType: "normal" as const,
};

describe("generateSmartSuggestions", () => {
  it("returns an empty list for an invalid loan", () => {
    expect(generateSmartSuggestions({ ...baseInput, principal: 0 })).toEqual([]);
    expect(generateSmartSuggestions({ ...baseInput, tenureMonths: 0 })).toEqual([]);
  });

  it("suggests an extra EMI per year for a typical long-tenure loan", () => {
    const suggestions = generateSmartSuggestions(baseInput);
    expect(suggestions.some((s) => s.id === "extra-emi")).toBe(true);
  });

  it("suggests a shorter tenure for long-tenure loans, but not for already-short ones", () => {
    const longTenure = generateSmartSuggestions(baseInput);
    const shortTenure = generateSmartSuggestions({ ...baseInput, tenureMonths: 60 });
    expect(longTenure.some((s) => s.id === "shorter-tenure")).toBe(true);
    expect(shortTenure.some((s) => s.id === "shorter-tenure")).toBe(false);
  });

  it("nudges toward refinancing only when the rate is high", () => {
    const highRate = generateSmartSuggestions({ ...baseInput, annualRatePercent: 11 });
    const lowRate = generateSmartSuggestions({ ...baseInput, annualRatePercent: 7 });
    expect(highRate.some((s) => s.id === "refinance")).toBe(true);
    expect(lowRate.some((s) => s.id === "refinance")).toBe(false);
  });

  it("warns about a low down payment only when one is provided and below 20%", () => {
    const lowDp = generateSmartSuggestions({ ...baseInput, downPaymentPercent: 10 });
    const goodDp = generateSmartSuggestions({ ...baseInput, downPaymentPercent: 25 });
    const noDp = generateSmartSuggestions(baseInput);
    expect(lowDp.some((s) => s.id === "low-down-payment")).toBe(true);
    expect(goodDp.some((s) => s.id === "low-down-payment")).toBe(false);
    expect(noDp.some((s) => s.id === "low-down-payment")).toBe(false);
  });

  it("every suggestion has a non-empty message and a valid tone", () => {
    const suggestions = generateSmartSuggestions(baseInput);
    for (const s of suggestions) {
      expect(s.message.length).toBeGreaterThan(0);
      expect(["positive", "warning", "info"]).toContain(s.tone);
    }
  });
});
