import type { AmortizationResult } from "@/lib/calculations/types";
import type { Suggestion } from "@/lib/calculations/suggestions";
import { toYearlySeries } from "@/lib/calculations/chart-data";
import { formatINR } from "@/lib/calculations/format";

export interface FinancialReportInput {
  principal: number;
  annualRatePercent: number;
  tenureMonths: number;
  schedule: AmortizationResult;
  baselineSchedule: AmortizationResult;
  suggestions: Suggestion[];
}

export async function downloadFinancialReportPdf(input: FinancialReportInput) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();

  const { principal, annualRatePercent, tenureMonths, schedule, baselineSchedule, suggestions } = input;
  const { summary } = schedule;
  const interestSaved = baselineSchedule.summary.totalInterest - summary.totalInterest;

  doc.setFontSize(18);
  doc.text("Home Loan Financial Report", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, 14, 25);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 32,
    head: [["Loan Summary", ""]],
    body: [
      ["Loan amount", formatINR(principal)],
      ["Interest rate", `${annualRatePercent}%`],
      ["Tenure", `${Math.round(tenureMonths / 12)} years`],
      ["Monthly EMI", formatINR(summary.initialEmi)],
      ["Total interest", formatINR(summary.totalInterest)],
      ["Total payment", formatINR(summary.totalPayment)],
      ["Interest / Principal split", `${summary.interestPercent.toFixed(1)}% / ${summary.principalPercent.toFixed(1)}%`],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  let nextY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  if (summary.totalExtraPayments > 0) {
    autoTable(doc, {
      startY: nextY,
      head: [["Prepayment Impact", ""]],
      body: [
        ["Total extra payments", formatINR(summary.totalExtraPayments)],
        ["Interest saved", formatINR(Math.max(interestSaved, 0))],
        ["Months saved", String(summary.monthsSaved)],
        ["Actual payoff", `${Math.round(summary.actualTenureMonths / 12)} years (vs ${Math.round(summary.scheduledTenureMonths / 12)} planned)`],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 163, 74] },
    });
    nextY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  if (suggestions.length > 0) {
    autoTable(doc, {
      startY: nextY,
      head: [["Recommendations"]],
      body: suggestions.map((s) => [s.message]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [234, 88, 12] },
    });
    nextY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  const yearly = toYearlySeries(schedule.rows);
  autoTable(doc, {
    startY: nextY,
    head: [["Year", "Principal", "Interest", "Closing Balance"]],
    body: yearly.map((y) => [
      String(y.year),
      formatINR(y.principal),
      formatINR(y.interest),
      formatINR(y.closingBalance),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save("home-loan-financial-report.pdf");
}
