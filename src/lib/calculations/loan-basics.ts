export type ProcessingFeeType = "percent" | "flat";

export interface ProcessingFeeConfig {
  type: ProcessingFeeType;
  value: number;
}

export function deriveLoanAmount(propertyValue: number, downPayment: number): number {
  return Math.max(propertyValue - downPayment, 0);
}

export function calculateProcessingFee(
  loanAmount: number,
  fee: ProcessingFeeConfig
): number {
  if (fee.type === "flat") return Math.max(fee.value, 0);
  return Math.max((loanAmount * fee.value) / 100, 0);
}

/**
 * Effective annual borrowing cost folds the one-time processing fee into the
 * loan's cost, expressed as an equivalent flat percentage of the principal
 * over the tenure — useful for comparing loans with different fee structures.
 */
export function effectiveBorrowingCostPercent(
  totalInterest: number,
  processingFee: number,
  principal: number,
  tenureYears: number
): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  return ((totalInterest + processingFee) / principal / tenureYears) * 100;
}
