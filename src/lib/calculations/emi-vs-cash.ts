import { buildAmortizationSchedule } from "./amortization";
import { calculateEMI } from "./emi";

export interface EmiVsCashInput {
  propertyPrice: number;
  downPayment: number;
  annualRatePercent: number;
  tenureMonths: number;
  investmentReturnPercent: number;
  horizonYears: number[];
}

export interface EmiVsCashYearResult {
  year: number;
  /** FV of investing (propertyPrice - downPayment) as a lump sum, minus the loan balance still owed. */
  loanScenarioNetWorth: number;
  /** FV of investing the EMI amount as a monthly SIP instead of paying it to a lender. */
  cashScenarioNetWorth: number;
  advantage: "loan" | "cash" | "neutral";
  difference: number;
}

function futureValueOfSip(monthlyAmount: number, monthlyRate: number, months: number): number {
  if (months <= 0 || monthlyAmount <= 0) return 0;
  if (monthlyRate === 0) return monthlyAmount * months;
  return monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

/**
 * Classic "leverage vs. cash" comparison: Scenario A takes a loan and
 * invests the cash that would otherwise have bought the house outright as a
 * lump sum; Scenario B pays cash for the house and instead invests an
 * amount equal to the EMI every month. House equity is excluded from both
 * sides since it's identical either way — only the liquid financial
 * position differs.
 */
export function compareEmiVsCash(input: EmiVsCashInput): EmiVsCashYearResult[] {
  const { propertyPrice, downPayment, annualRatePercent, tenureMonths, investmentReturnPercent, horizonYears } = input;
  const loanAmount = Math.max(propertyPrice - downPayment, 0);
  const emi = calculateEMI(loanAmount, annualRatePercent, tenureMonths);
  const schedule = buildAmortizationSchedule({
    principal: loanAmount,
    annualRatePercent,
    tenureMonths,
    startDate: new Date(),
    emiType: "normal",
  });
  const monthlyReturn = investmentReturnPercent / 1200;

  return horizonYears.map((years) => {
    const months = Math.round(years * 12);

    const lumpSumFv = loanAmount * Math.pow(1 + monthlyReturn, months);
    const remainingBalance =
      months >= schedule.rows.length ? 0 : (schedule.rows[months - 1]?.closingBalance ?? 0);
    const loanScenarioNetWorth = lumpSumFv - remainingBalance;

    const cashScenarioNetWorth = futureValueOfSip(emi, monthlyReturn, months);

    const difference = loanScenarioNetWorth - cashScenarioNetWorth;
    const neutralBand = Math.max(loanAmount, 1) * 0.001;
    const advantage: EmiVsCashYearResult["advantage"] =
      Math.abs(difference) < neutralBand ? "neutral" : difference > 0 ? "loan" : "cash";

    return { year: years, loanScenarioNetWorth, cashScenarioNetWorth, advantage, difference };
  });
}
