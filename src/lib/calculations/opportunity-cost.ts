export interface OpportunityCostParams {
  amount: number;
  /** The loan's interest rate — the cost of carrying that amount as debt instead of paying it down. */
  loanRatePercent: number;
  investmentReturnPercent: number;
  years: number;
}

export interface OpportunityCostResult {
  futureValueIfInvested: number;
  investmentGain: number;
  /** Compounding cost of carrying `amount` as debt for the horizon instead of using it to reduce the loan. */
  debtCostIfCarried: number;
  /** investmentGain − debtCostIfCarried. Positive means investing beats prepaying. */
  netAdvantage: number;
  recommendation: "invest" | "prepay" | "neutral";
}

/**
 * Compares investing a lump sum vs. using it to pay down the loan, by
 * compounding the same amount at the investment return rate and at the
 * loan's rate (its effective borrowing cost) over the same horizon.
 */
export function calculateOpportunityCost(params: OpportunityCostParams): OpportunityCostResult {
  const { amount, loanRatePercent, investmentReturnPercent, years } = params;
  const months = Math.round(years * 12);

  const futureValueIfInvested = amount * Math.pow(1 + investmentReturnPercent / 1200, months);
  const investmentGain = futureValueIfInvested - amount;

  const debtFutureValue = amount * Math.pow(1 + loanRatePercent / 1200, months);
  const debtCostIfCarried = debtFutureValue - amount;

  const netAdvantage = investmentGain - debtCostIfCarried;
  const neutralBand = amount * 0.001;
  const recommendation: OpportunityCostResult["recommendation"] =
    Math.abs(netAdvantage) < neutralBand ? "neutral" : netAdvantage > 0 ? "invest" : "prepay";

  return { futureValueIfInvested, investmentGain, debtCostIfCarried, netAdvantage, recommendation };
}
