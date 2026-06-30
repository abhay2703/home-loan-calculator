import type { AmortizationRow } from "./types";

export interface MonthlyChartPoint {
  month: number;
  label: string;
  balance: number;
  principal: number;
  interest: number;
}

export interface YearlyChartPoint {
  year: number;
  label: string;
  principal: number;
  interest: number;
  extraPayment: number;
  closingBalance: number;
}

export function toMonthlySeries(rows: AmortizationRow[]): MonthlyChartPoint[] {
  return rows.map((row) => ({
    month: row.period,
    label: row.date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    balance: Math.round(row.closingBalance),
    principal: Math.round(row.principal + row.extraPayment),
    interest: Math.round(row.interest),
  }));
}

export function toYearlySeries(rows: AmortizationRow[]): YearlyChartPoint[] {
  const byYear = new Map<number, YearlyChartPoint>();

  for (const row of rows) {
    const year = Math.ceil(row.period / 12);
    const existing = byYear.get(year);
    if (existing) {
      existing.principal += row.principal;
      existing.interest += row.interest;
      existing.extraPayment += row.extraPayment;
      existing.closingBalance = row.closingBalance;
    } else {
      byYear.set(year, {
        year,
        label: `Yr ${year}`,
        principal: row.principal,
        interest: row.interest,
        extraPayment: row.extraPayment,
        closingBalance: row.closingBalance,
      });
    }
  }

  return Array.from(byYear.values())
    .sort((a, b) => a.year - b.year)
    .map((point) => ({
      ...point,
      principal: Math.round(point.principal),
      interest: Math.round(point.interest),
      extraPayment: Math.round(point.extraPayment),
      closingBalance: Math.round(point.closingBalance),
    }));
}
