export type TaxRegime = "old" | "new";

interface TaxSlab {
  upTo: number | null;
  ratePercent: number;
}

// FY2025-26 slabs (Budget 2025). Tax law changes most years — verify against
// the current official slabs before relying on this for a real filing.
const NEW_REGIME_SLABS: TaxSlab[] = [
  { upTo: 400000, ratePercent: 0 },
  { upTo: 800000, ratePercent: 5 },
  { upTo: 1200000, ratePercent: 10 },
  { upTo: 1600000, ratePercent: 15 },
  { upTo: 2000000, ratePercent: 20 },
  { upTo: 2400000, ratePercent: 25 },
  { upTo: null, ratePercent: 30 },
];

const OLD_REGIME_SLABS: TaxSlab[] = [
  { upTo: 250000, ratePercent: 0 },
  { upTo: 500000, ratePercent: 5 },
  { upTo: 1000000, ratePercent: 20 },
  { upTo: null, ratePercent: 30 },
];

const STANDARD_DEDUCTION: Record<TaxRegime, number> = { new: 75000, old: 50000 };
const REBATE_87A_THRESHOLD: Record<TaxRegime, number> = { new: 1200000, old: 500000 };
const SECTION_24_CAP = 200000;
const SECTION_80C_CAP = 150000;
const SECTION_80EEA_CAP = 150000;
const CESS_RATE = 0.04;

function calculateSlabTax(taxableIncome: number, slabs: TaxSlab[]): number {
  let tax = 0;
  let lowerBound = 0;
  for (const slab of slabs) {
    const upperBound = slab.upTo ?? Infinity;
    if (taxableIncome > lowerBound) {
      const taxableInSlab = Math.min(taxableIncome, upperBound) - lowerBound;
      tax += taxableInSlab * (slab.ratePercent / 100);
    }
    lowerBound = upperBound;
  }
  return tax;
}

function taxWithRebateAndCess(taxableIncome: number, regime: TaxRegime): number {
  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
  let tax = calculateSlabTax(taxableIncome, slabs);
  if (taxableIncome <= REBATE_87A_THRESHOLD[regime]) tax = 0;
  return tax * (1 + CESS_RATE);
}

export interface TaxBenefitInput {
  annualIncome: number;
  regime: TaxRegime;
  homeLoanInterestPaid: number;
  homeLoanPrincipalPaid: number;
  other80CInvestments: number;
  isFirstTimeBuyer: boolean;
  isSelfOccupied: boolean;
}

export interface TaxBenefitResult {
  standardDeduction: number;
  section24Deduction: number;
  section80CDeduction: number;
  section80EEADeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  taxPayable: number;
  taxWithoutHomeLoan: number;
  taxSavedFromHomeLoan: number;
}

/**
 * Approximates the income tax payable with and without home-loan deductions,
 * for both regimes. New regime drops 80C/80EEA entirely and only allows the
 * Section 24 interest deduction for let-out (not self-occupied) property.
 * This is an estimate for planning purposes, not a substitute for a CA.
 */
export function calculateTaxBenefit(input: TaxBenefitInput): TaxBenefitResult {
  const {
    annualIncome,
    regime,
    homeLoanInterestPaid,
    homeLoanPrincipalPaid,
    other80CInvestments,
    isFirstTimeBuyer,
    isSelfOccupied,
  } = input;

  const standardDeduction = STANDARD_DEDUCTION[regime];

  let section24Deduction = 0;
  let section80CDeduction = 0;
  let section80EEADeduction = 0;

  if (regime === "old") {
    section24Deduction = isSelfOccupied
      ? Math.min(homeLoanInterestPaid, SECTION_24_CAP)
      : homeLoanInterestPaid;
    section80CDeduction = Math.min(homeLoanPrincipalPaid + other80CInvestments, SECTION_80C_CAP);
    if (isFirstTimeBuyer) {
      const remainingInterest = Math.max(homeLoanInterestPaid - section24Deduction, 0);
      section80EEADeduction = Math.min(remainingInterest, SECTION_80EEA_CAP);
    }
  } else {
    // New regime: self-occupied home loan interest isn't deductible; let-out
    // property interest still is, capped the same way.
    section24Deduction = isSelfOccupied ? 0 : Math.min(homeLoanInterestPaid, SECTION_24_CAP);
  }

  const totalDeductions = standardDeduction + section24Deduction + section80CDeduction + section80EEADeduction;
  const taxableIncome = Math.max(annualIncome - totalDeductions, 0);
  const taxPayable = taxWithRebateAndCess(taxableIncome, regime);

  const other80CCapped = regime === "old" ? Math.min(other80CInvestments, SECTION_80C_CAP) : 0;
  const taxableIncomeWithoutHomeLoan = Math.max(annualIncome - standardDeduction - other80CCapped, 0);
  const taxWithoutHomeLoan = taxWithRebateAndCess(taxableIncomeWithoutHomeLoan, regime);

  return {
    standardDeduction,
    section24Deduction,
    section80CDeduction,
    section80EEADeduction,
    totalDeductions,
    taxableIncome,
    taxPayable,
    taxWithoutHomeLoan,
    taxSavedFromHomeLoan: Math.max(taxWithoutHomeLoan - taxPayable, 0),
  };
}
