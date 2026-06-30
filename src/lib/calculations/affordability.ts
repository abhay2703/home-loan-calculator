import { maxLoanAmountForEmi } from "./emi";

export interface AffordabilityInput {
  monthlyIncome: number;
  existingEmis: number;
  monthlyExpenses: number;
  targetDownPayment: number;
  annualRatePercent: number;
  tenureMonths: number;
  /** Fixed Obligation to Income Ratio cap most Indian lenders apply — typically 40-50%. */
  foirPercent: number;
}

export interface AffordabilityResult {
  maxAffordableEmi: number;
  maxLoanAmount: number;
  maxPropertyPrice: number;
  surplusAfterExpenses: number;
}

/**
 * Caps the affordable EMI at both the lender's FOIR limit (a fraction of
 * gross income, minus existing EMIs) and whatever income is actually left
 * after living expenses — whichever is lower. Shared by the affordability
 * calculator and the salary growth simulator.
 */
export function maxAffordableEmi(
  monthlyIncome: number,
  existingEmis: number,
  monthlyExpenses: number,
  foirPercent: number
): number {
  const foirCappedEmi = Math.max(monthlyIncome * (foirPercent / 100) - existingEmis, 0);
  const surplusAfterExpenses = Math.max(monthlyIncome - existingEmis - monthlyExpenses, 0);
  return Math.min(foirCappedEmi, surplusAfterExpenses);
}

export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const { monthlyIncome, existingEmis, monthlyExpenses, targetDownPayment, annualRatePercent, tenureMonths, foirPercent } = input;

  const surplusAfterExpenses = Math.max(monthlyIncome - existingEmis - monthlyExpenses, 0);
  const affordableEmi = maxAffordableEmi(monthlyIncome, existingEmis, monthlyExpenses, foirPercent);

  const maxLoanAmount = maxLoanAmountForEmi(affordableEmi, annualRatePercent, tenureMonths);
  const maxPropertyPrice = maxLoanAmount + targetDownPayment;

  return { maxAffordableEmi: affordableEmi, maxLoanAmount, maxPropertyPrice, surplusAfterExpenses };
}
