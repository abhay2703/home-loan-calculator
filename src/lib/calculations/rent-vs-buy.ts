import { buildAmortizationSchedule } from "./amortization";

export interface RentVsBuyInput {
  housePrice: number;
  downPaymentPercent: number;
  loanRatePercent: number;
  loanTenureYears: number;
  monthlyRent: number;
  rentGrowthPercent: number;
  /** Annual maintenance as a % of the current house value. */
  maintenancePercent: number;
  propertyAppreciationPercent: number;
  investmentReturnPercent: number;
  /** One-time, % of house price, buy-side only. */
  stampDutyPercent: number;
  horizonYears: number;
}

export interface RentVsBuyYearPoint {
  year: number;
  houseValue: number;
  outstandingLoan: number;
  buyNetWorth: number;
  rentNetWorth: number;
}

export interface RentVsBuyResult {
  timeline: RentVsBuyYearPoint[];
  recommendation: "buy" | "rent" | "neutral";
  finalDifference: number;
}

/**
 * Year-by-year "equalized cash flow" comparison: whichever side pays less
 * in a given year invests the difference, and the renter additionally
 * invests the down payment + stamp duty they never had to spend, as a lump
 * sum from day one. House equity (value minus outstanding loan) is the
 * buyer's other asset; the renter has none. This mirrors the methodology
 * used by most public rent-vs-buy calculators.
 */
export function compareRentVsBuy(input: RentVsBuyInput): RentVsBuyResult {
  const {
    housePrice,
    downPaymentPercent,
    loanRatePercent,
    loanTenureYears,
    monthlyRent,
    rentGrowthPercent,
    maintenancePercent,
    propertyAppreciationPercent,
    investmentReturnPercent,
    stampDutyPercent,
    horizonYears,
  } = input;

  const downPayment = housePrice * (downPaymentPercent / 100);
  const stampDuty = housePrice * (stampDutyPercent / 100);
  const loanAmount = Math.max(housePrice - downPayment, 0);
  const tenureMonths = Math.round(loanTenureYears * 12);

  const schedule = buildAmortizationSchedule({
    principal: loanAmount,
    annualRatePercent: loanRatePercent,
    tenureMonths,
    startDate: new Date(),
    emiType: "normal",
  });

  const annualInvestmentReturn = investmentReturnPercent / 100;

  let buyerInvestmentPot = 0;
  let renterInvestmentPot = downPayment + stampDuty;

  const timeline: RentVsBuyYearPoint[] = [];

  for (let year = 1; year <= horizonYears; year++) {
    const houseValue = housePrice * Math.pow(1 + propertyAppreciationPercent / 100, year);

    const yearStartMonth = (year - 1) * 12 + 1;
    const yearEndMonth = year * 12;
    const yearRows = schedule.rows.filter(
      (row) => row.period >= yearStartMonth && row.period <= yearEndMonth
    );
    const annualEmiPaid = yearRows.reduce((sum, row) => sum + row.emi, 0);
    const outstandingLoan = yearRows.length > 0 ? yearRows[yearRows.length - 1].closingBalance : 0;

    const annualMaintenance = houseValue * (maintenancePercent / 100);
    const annualRent = monthlyRent * 12 * Math.pow(1 + rentGrowthPercent / 100, year - 1);

    const buyOutflow = annualEmiPaid + annualMaintenance;
    const rentOutflow = annualRent;

    buyerInvestmentPot *= 1 + annualInvestmentReturn;
    renterInvestmentPot *= 1 + annualInvestmentReturn;

    if (buyOutflow < rentOutflow) {
      buyerInvestmentPot += rentOutflow - buyOutflow;
    } else if (rentOutflow < buyOutflow) {
      renterInvestmentPot += buyOutflow - rentOutflow;
    }

    const buyNetWorth = houseValue - outstandingLoan + buyerInvestmentPot;
    const rentNetWorth = renterInvestmentPot;

    timeline.push({ year, houseValue, outstandingLoan, buyNetWorth, rentNetWorth });
  }

  const last = timeline[timeline.length - 1];
  const finalDifference = last ? last.buyNetWorth - last.rentNetWorth : 0;
  const neutralBand = housePrice * 0.005;
  const recommendation: RentVsBuyResult["recommendation"] =
    Math.abs(finalDifference) < neutralBand ? "neutral" : finalDifference > 0 ? "buy" : "rent";

  return { timeline, recommendation, finalDifference };
}
