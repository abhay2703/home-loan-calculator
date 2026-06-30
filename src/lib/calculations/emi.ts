/**
 * Standard reducing-balance EMI formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1),
 * where r is the monthly interest rate and n is the tenure in months.
 */
export function calculateEMI(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const r = annualRatePercent / 1200;
  if (r === 0) return principal / tenureMonths;
  const factor = Math.pow(1 + r, tenureMonths);
  return (principal * r * factor) / (factor - 1);
}

/**
 * Simulates a loan where the EMI changes by a fixed factor every 12 months,
 * returning the outstanding balance at the end of tenureMonths for a given
 * starting EMI. Used by solveStepEmi as the objective function for its
 * binary search.
 */
function simulateStepEndingBalance(
  principal: number,
  monthlyRate: number,
  tenureMonths: number,
  startingEmi: number,
  stepFactor: number
): number {
  let balance = principal;
  for (let month = 1; month <= tenureMonths; month++) {
    const yearIndex = Math.floor((month - 1) / 12);
    const emi = startingEmi * Math.pow(stepFactor, yearIndex);
    const interest = balance * monthlyRate;
    balance = balance + interest - emi;
  }
  return balance;
}

/**
 * Step-up/step-down EMIs have no closed-form solution for the starting EMI
 * (each year's payment depends on a compounding step factor), so we binary
 * search for the starting EMI that brings the balance to exactly zero by
 * the end of the tenure. The ending-balance function is monotonically
 * decreasing in startingEmi, which makes binary search reliable.
 */
export function solveStepEmi(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
  stepPercent: number,
  direction: "up" | "down"
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRatePercent / 1200;
  const stepFactor =
    direction === "up" ? 1 + stepPercent / 100 : 1 - stepPercent / 100;

  let lo = principal / tenureMonths / 50;
  let hi = principal;

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const endingBalance = simulateStepEndingBalance(
      principal,
      monthlyRate,
      tenureMonths,
      mid,
      stepFactor
    );
    if (endingBalance > 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}
