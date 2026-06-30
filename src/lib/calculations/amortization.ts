import { addMonths } from "date-fns";
import { calculateEMI, solveStepEmi } from "./emi";
import type {
  AmortizationResult,
  AmortizationRow,
  LoanScheduleParams,
  LoanSummary,
  PrepaymentConfig,
} from "./types";

const FREQUENCY_INTERVAL_MONTHS: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  halfYearly: 6,
  yearly: 12,
};

interface ScheduledEmiInfo {
  initialEmi: number;
  emiForMonth: (month: number) => number;
}

function buildScheduledEmi(
  params: LoanScheduleParams,
  monthlyRate: number
): ScheduledEmiInfo {
  const { principal, annualRatePercent, tenureMonths, emiType } = params;

  if (emiType === "stepUp" || emiType === "stepDown") {
    const stepPercent = params.stepPercent ?? 0;
    const direction = emiType === "stepUp" ? "up" : "down";
    const startingEmi = solveStepEmi(
      principal,
      annualRatePercent,
      tenureMonths,
      stepPercent,
      direction
    );
    const stepFactor =
      direction === "up" ? 1 + stepPercent / 100 : 1 - stepPercent / 100;
    return {
      initialEmi: startingEmi,
      emiForMonth: (month) =>
        startingEmi * Math.pow(stepFactor, Math.floor((month - 1) / 12)),
    };
  }

  if (emiType === "interestOnly") {
    const interestOnlyMonths = Math.min(
      Math.max(params.interestOnlyMonths ?? 0, 0),
      tenureMonths - 1
    );
    const remainingMonths = tenureMonths - interestOnlyMonths;
    const postEmi = calculateEMI(principal, annualRatePercent, remainingMonths);
    const interestOnlyEmi = principal * monthlyRate;
    return {
      initialEmi: interestOnlyMonths > 0 ? interestOnlyEmi : postEmi,
      emiForMonth: (month) => (month <= interestOnlyMonths ? interestOnlyEmi : postEmi),
    };
  }

  const emi = calculateEMI(principal, annualRatePercent, tenureMonths);
  return { initialEmi: emi, emiForMonth: () => emi };
}

function getPrepaymentForMonth(
  month: number,
  prepayment: PrepaymentConfig | undefined
): number {
  if (!prepayment) return 0;
  let extra = 0;

  if (prepayment.recurring && prepayment.recurring.amount > 0) {
    const interval = FREQUENCY_INTERVAL_MONTHS[prepayment.recurring.frequency];
    const startMonth = prepayment.recurring.startMonth ?? interval;
    if (month >= startMonth && (month - startMonth) % interval === 0) {
      extra += prepayment.recurring.amount;
    }
  }

  if (prepayment.lumpSums) {
    for (const lumpSum of prepayment.lumpSums) {
      if (lumpSum.month === month) extra += lumpSum.amount;
    }
  }

  return extra;
}

function deriveSummary(
  rows: AmortizationRow[],
  principal: number,
  initialEmi: number,
  finalEmi: number,
  scheduledTenureMonths: number
): LoanSummary {
  const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);
  const totalExtraPayments = rows.reduce((sum, row) => sum + row.extraPayment, 0);
  const totalPayment = principal + totalInterest;
  const actualTenureMonths = rows.length;

  return {
    initialEmi,
    finalEmi,
    totalPrincipal: principal,
    totalInterest,
    totalExtraPayments,
    totalPayment,
    interestPercent: totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0,
    principalPercent: totalPayment > 0 ? (principal / totalPayment) * 100 : 0,
    scheduledTenureMonths,
    actualTenureMonths,
    monthsSaved: Math.max(scheduledTenureMonths - actualTenureMonths, 0),
  };
}

/**
 * Builds the full month-by-month amortization schedule for a loan, handling
 * normal/step-up/step-down/interest-only EMI structures and optional
 * recurring + lump-sum prepayments. Prepayments under the "reduceEmi"
 * strategy recompute a new flat EMI off the remaining balance and remaining
 * original tenure each time they're applied; "reduceTenure" keeps the
 * scheduled EMI and simply lets the loan close early.
 */
export function buildAmortizationSchedule(
  params: LoanScheduleParams
): AmortizationResult {
  const { principal, annualRatePercent, tenureMonths, startDate, prepayment } = params;
  const monthlyRate = annualRatePercent / 1200;
  const { initialEmi, emiForMonth } = buildScheduledEmi(params, monthlyRate);

  const rows: AmortizationRow[] = [];
  let balance = principal;
  let dynamicEmi: number | null = null;
  // Tracks the steady-state scheduled EMI (pre-capping) so the summary can
  // report the real ongoing EMI rather than a shrunken final top-up payment
  // (the last installment of a payoff is often capped to just the remaining
  // balance, which is not representative of the EMI the borrower actually paid).
  let lastScheduledEmi = initialEmi;
  // Generous safety cap: prepayments + step-downs could in pathological
  // inputs delay payoff well past the nominal tenure.
  const safetyCapMonths = tenureMonths + 360;

  for (let month = 1; month <= safetyCapMonths && balance > 0.5; month++) {
    const openingBalance = balance;
    const scheduledEmi = dynamicEmi ?? emiForMonth(month);
    lastScheduledEmi = scheduledEmi;
    const interest = openingBalance * monthlyRate;
    let principalComponent = Math.max(scheduledEmi - interest, 0);
    let extra = getPrepaymentForMonth(month, prepayment);
    let emiPaid = scheduledEmi;
    let closingBalance: number;

    if (principalComponent + extra >= openingBalance) {
      principalComponent = openingBalance;
      extra = 0;
      emiPaid = openingBalance + interest;
      closingBalance = 0;
    } else {
      closingBalance = openingBalance - principalComponent - extra;
    }

    balance = closingBalance;

    rows.push({
      period: month,
      date: addMonths(startDate, month - 1),
      openingBalance,
      emi: emiPaid,
      principal: principalComponent,
      interest,
      extraPayment: extra,
      closingBalance,
    });

    if (balance <= 0) break;

    if (extra > 0 && prepayment?.strategy === "reduceEmi") {
      const remainingScheduledMonths = tenureMonths - month;
      if (remainingScheduledMonths > 0) {
        dynamicEmi = calculateEMI(balance, annualRatePercent, remainingScheduledMonths);
      }
    }
  }

  const summary = deriveSummary(rows, principal, initialEmi, lastScheduledEmi, tenureMonths);
  return { rows, summary };
}
