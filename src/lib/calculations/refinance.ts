import { calculateEMI } from "./emi";

export interface RefinanceInput {
  outstandingBalance: number;
  remainingTenureMonths: number;
  currentRatePercent: number;
  newRatePercent: number;
  /** Defaults to remainingTenureMonths if the new loan keeps the same payoff date. */
  newTenureMonths?: number;
  processingFee: number;
  legalFees: number;
  balanceTransferFee: number;
}

export interface RefinanceResult {
  currentEmi: number;
  newEmi: number;
  monthlyEmiSavings: number;
  totalRefinanceCost: number;
  totalInterestCurrent: number;
  totalInterestNew: number;
  totalInterestSavings: number;
  netSavings: number;
  /** Months for EMI savings alone to cover the refinance cost; null if EMI doesn't drop. */
  breakevenMonths: number | null;
  worthIt: boolean;
}

/**
 * Compares staying on the current loan vs refinancing to a new rate (and
 * optionally a new tenure), netting out the one-time switching costs against
 * the interest saved over the remaining term.
 */
export function calculateRefinance(input: RefinanceInput): RefinanceResult {
  const {
    outstandingBalance,
    remainingTenureMonths,
    currentRatePercent,
    newRatePercent,
    processingFee,
    legalFees,
    balanceTransferFee,
  } = input;
  const newTenureMonths = input.newTenureMonths ?? remainingTenureMonths;

  const currentEmi = calculateEMI(outstandingBalance, currentRatePercent, remainingTenureMonths);
  const newEmi = calculateEMI(outstandingBalance, newRatePercent, newTenureMonths);
  const monthlyEmiSavings = currentEmi - newEmi;

  const totalInterestCurrent = currentEmi * remainingTenureMonths - outstandingBalance;
  const totalInterestNew = newEmi * newTenureMonths - outstandingBalance;
  const totalInterestSavings = totalInterestCurrent - totalInterestNew;

  const totalRefinanceCost = processingFee + legalFees + balanceTransferFee;
  const netSavings = totalInterestSavings - totalRefinanceCost;
  const breakevenMonths =
    monthlyEmiSavings > 0 ? Math.ceil(totalRefinanceCost / monthlyEmiSavings) : null;

  return {
    currentEmi,
    newEmi,
    monthlyEmiSavings,
    totalRefinanceCost,
    totalInterestCurrent,
    totalInterestNew,
    totalInterestSavings,
    netSavings,
    breakevenMonths,
    worthIt: netSavings > 0,
  };
}
