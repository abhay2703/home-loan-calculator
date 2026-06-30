export type EmiType = "normal" | "stepUp" | "stepDown" | "interestOnly";

export type PrepaymentFrequency = "monthly" | "quarterly" | "halfYearly" | "yearly";

export interface RecurringPrepayment {
  amount: number;
  frequency: PrepaymentFrequency;
  /** First month (1-indexed) the recurring prepayment applies. Defaults to the frequency's first cycle. */
  startMonth?: number;
}

export interface LumpSumPrepayment {
  /** 1-indexed month number from loan start. */
  month: number;
  amount: number;
  label?: string;
}

export type PrepaymentStrategy = "reduceTenure" | "reduceEmi";

export interface PrepaymentConfig {
  recurring?: RecurringPrepayment;
  lumpSums?: LumpSumPrepayment[];
  strategy: PrepaymentStrategy;
}

export interface RateChangeEntry {
  /** 1-indexed month this rate becomes effective. Must be > 1 — the loan's
   * base annualRatePercent always covers month 1 onward until the first
   * scheduled change. */
  fromMonth: number;
  annualRatePercent: number;
}

export interface LoanScheduleParams {
  principal: number;
  annualRatePercent: number;
  tenureMonths: number;
  startDate: Date;
  emiType: EmiType;
  /** Required for stepUp / stepDown: % the EMI changes every 12 months. */
  stepPercent?: number;
  /** Required for interestOnly: number of months at the start of tenureMonths that are interest-only. */
  interestOnlyMonths?: number;
  prepayment?: PrepaymentConfig;
  /** Optional floating-rate schedule. Each change recomputes a flat EMI off
   * the remaining balance and remaining original tenure, the same mechanism
   * prepayment's "reduceEmi" strategy uses. */
  rateSchedule?: RateChangeEntry[];
}

export interface EmiIncreaseParams {
  principal: number;
  annualRatePercent: number;
  tenureMonths: number;
  startDate: Date;
  /** The EMI to grow from — typically the loan's current flat EMI. */
  baselineEmi: number;
  /** % the EMI grows by every 12 months, paid voluntarily on top of the baseline. */
  annualIncreasePercent: number;
}

export interface AmortizationRow {
  period: number;
  date: Date;
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  extraPayment: number;
  closingBalance: number;
}

export interface LoanSummary {
  initialEmi: number;
  finalEmi: number;
  totalPrincipal: number;
  totalInterest: number;
  totalExtraPayments: number;
  totalPayment: number;
  interestPercent: number;
  principalPercent: number;
  scheduledTenureMonths: number;
  actualTenureMonths: number;
  monthsSaved: number;
}

export interface AmortizationResult {
  rows: AmortizationRow[];
  summary: LoanSummary;
}
