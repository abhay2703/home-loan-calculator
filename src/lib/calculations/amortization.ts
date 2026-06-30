import { addMonths } from "date-fns";
import { calculateEMI, solveStepEmi } from "./emi";
import type {
  AmortizationResult,
  AmortizationRow,
  EmiIncreaseParams,
  LoanScheduleParams,
  LoanSummary,
  PrepaymentConfig,
  RateChangeEntry,
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

function resolveAnnualRateForMonth(
  month: number,
  baseRate: number,
  sortedRateSchedule?: RateChangeEntry[]
): number {
  if (!sortedRateSchedule || sortedRateSchedule.length === 0) return baseRate;
  let rate = baseRate;
  for (const entry of sortedRateSchedule) {
    if (entry.fromMonth <= month) rate = entry.annualRatePercent;
    else break;
  }
  return rate;
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

interface SimulateScheduleParams {
  principal: number;
  startDate: Date;
  /** Used only to size the safety cap on simulated months. */
  tenureMonths: number;
  resolveMonth: (month: number, openingBalance: number) => { monthlyRate: number; emi: number };
  extraForMonth?: (month: number) => number;
  onAfterMonth?: (month: number, row: AmortizationRow) => void;
}

/**
 * Generic month-by-month capped-payment simulator shared by every schedule
 * builder in this module. A month's principal + extra payment is capped to
 * the opening balance so the loan always closes out exactly at zero, with
 * the final installment shrunk to whatever remains. Per-month rate and EMI
 * are fully delegated to resolveMonth, which is how floating rates,
 * prepayment-driven EMI recomputation, and the EMI-increase calculator all
 * plug into the same loop without duplicating it.
 */
function simulateSchedule(params: SimulateScheduleParams): AmortizationRow[] {
  const { principal, startDate, tenureMonths, resolveMonth, extraForMonth, onAfterMonth } = params;
  const rows: AmortizationRow[] = [];
  let balance = principal;
  // Generous safety cap: prepayments + step-downs could in pathological
  // inputs delay payoff well past the nominal tenure.
  const safetyCapMonths = tenureMonths + 360;

  for (let month = 1; month <= safetyCapMonths && balance > 0.5; month++) {
    const openingBalance = balance;
    const { monthlyRate, emi: scheduledEmi } = resolveMonth(month, openingBalance);
    const interest = openingBalance * monthlyRate;
    let principalComponent = Math.max(scheduledEmi - interest, 0);
    let extra = extraForMonth ? extraForMonth(month) : 0;
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

    const row: AmortizationRow = {
      period: month,
      date: addMonths(startDate, month - 1),
      openingBalance,
      emi: emiPaid,
      principal: principalComponent,
      interest,
      extraPayment: extra,
      closingBalance,
    };
    rows.push(row);

    onAfterMonth?.(month, row);

    if (balance <= 0) break;
  }

  return rows;
}

/**
 * Builds the full month-by-month amortization schedule for a loan, handling
 * normal/step-up/step-down/interest-only EMI structures, an optional
 * floating-rate schedule, and optional recurring + lump-sum prepayments.
 * Prepayments under the "reduceEmi" strategy — and every floating-rate
 * change — recompute a new flat EMI off the remaining balance and remaining
 * original tenure; "reduceTenure" keeps the scheduled EMI and simply lets
 * the loan close early.
 */
export function buildAmortizationSchedule(
  params: LoanScheduleParams
): AmortizationResult {
  const { principal, annualRatePercent, tenureMonths, startDate, prepayment, rateSchedule } = params;
  const sortedRateSchedule = rateSchedule
    ? [...rateSchedule].sort((a, b) => a.fromMonth - b.fromMonth)
    : undefined;
  const initialMonthlyRate = annualRatePercent / 1200;
  const { initialEmi, emiForMonth } = buildScheduledEmi(params, initialMonthlyRate);

  let dynamicEmi: number | null = null;
  let currentAnnualRate = annualRatePercent;
  let lastScheduledEmi = initialEmi;

  function resolveMonth(month: number, openingBalance: number) {
    const monthAnnualRate = resolveAnnualRateForMonth(month, annualRatePercent, sortedRateSchedule);
    if (monthAnnualRate !== currentAnnualRate) {
      const remainingMonths = tenureMonths - month + 1;
      if (remainingMonths > 0) {
        dynamicEmi = calculateEMI(openingBalance, monthAnnualRate, remainingMonths);
      }
      currentAnnualRate = monthAnnualRate;
    }
    const emi = dynamicEmi ?? emiForMonth(month);
    lastScheduledEmi = emi;
    return { monthlyRate: monthAnnualRate / 1200, emi };
  }

  const rows = simulateSchedule({
    principal,
    startDate,
    tenureMonths,
    resolveMonth,
    extraForMonth: (month) => getPrepaymentForMonth(month, prepayment),
    onAfterMonth: (month, row) => {
      if (row.extraPayment > 0 && prepayment?.strategy === "reduceEmi") {
        const remainingMonths = tenureMonths - month;
        if (remainingMonths > 0) {
          dynamicEmi = calculateEMI(row.closingBalance, currentAnnualRate, remainingMonths);
        }
      }
    },
  });

  const summary = deriveSummary(rows, principal, initialEmi, lastScheduledEmi, tenureMonths);
  return { rows, summary };
}

/**
 * Simulates voluntarily growing a flat EMI by a fixed percentage every 12
 * months, starting from a baseline (typically the loan's current EMI).
 * Unlike the stepUp EMI type — which solves for a *lower* starting EMI that
 * exactly zeroes out at the original tenure — this keeps the baseline EMI
 * and lets the growing payments close the loan out early.
 */
export function buildEmiIncreaseSchedule(params: EmiIncreaseParams): AmortizationResult {
  const { principal, annualRatePercent, tenureMonths, startDate, baselineEmi, annualIncreasePercent } = params;
  const monthlyRate = annualRatePercent / 1200;
  const growthFactor = 1 + annualIncreasePercent / 100;
  const emiForMonth = (month: number) =>
    baselineEmi * Math.pow(growthFactor, Math.floor((month - 1) / 12));

  const rows = simulateSchedule({
    principal,
    startDate,
    tenureMonths,
    resolveMonth: (month) => ({ monthlyRate, emi: emiForMonth(month) }),
  });

  const finalEmi = rows.length > 0 ? emiForMonth(rows.length) : baselineEmi;
  const summary = deriveSummary(rows, principal, baselineEmi, finalEmi, tenureMonths);
  return { rows, summary };
}
