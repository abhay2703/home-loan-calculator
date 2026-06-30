import { maxAffordableEmi } from "./affordability";

export interface SalaryGrowthInput {
  currentMonthlyIncome: number;
  annualGrowthPercent: number;
  years: number;
  foirPercent: number;
  existingEmis: number;
  monthlyExpenses: number;
  currentLoanEmi: number;
}

export interface SalaryGrowthYearProjection {
  year: number;
  projectedMonthlyIncome: number;
  maxAffordableEmi: number;
  /** How much extra the borrower could put toward prepayment that year, on top of the current EMI. */
  prepaymentCapacity: number;
}

/**
 * Projects income growth year by year and derives, at each point, the
 * FOIR-capped affordable EMI and the surplus over the current loan's EMI —
 * i.e. how much extra could go toward prepayment as income rises.
 */
export function projectSalaryGrowth(input: SalaryGrowthInput): SalaryGrowthYearProjection[] {
  const { currentMonthlyIncome, annualGrowthPercent, years, foirPercent, existingEmis, monthlyExpenses, currentLoanEmi } = input;
  const growthFactor = 1 + annualGrowthPercent / 100;

  const projections: SalaryGrowthYearProjection[] = [];
  for (let year = 1; year <= years; year++) {
    const projectedMonthlyIncome = currentMonthlyIncome * Math.pow(growthFactor, year);
    const affordableEmi = maxAffordableEmi(projectedMonthlyIncome, existingEmis, monthlyExpenses, foirPercent);
    const prepaymentCapacity = Math.max(affordableEmi - currentLoanEmi, 0);
    projections.push({ year, projectedMonthlyIncome, maxAffordableEmi: affordableEmi, prepaymentCapacity });
  }
  return projections;
}
