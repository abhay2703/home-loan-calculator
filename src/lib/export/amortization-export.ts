import type { AmortizationRow } from "@/lib/calculations/types";

const HEADER = [
  "EMI #",
  "Date",
  "Opening Balance",
  "EMI",
  "Principal",
  "Interest",
  "Extra Payment",
  "Closing Balance",
];

function toTableRows(rows: AmortizationRow[]): (string | number)[][] {
  return rows.map((r) => [
    r.period,
    r.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    Math.round(r.openingBalance),
    Math.round(r.emi),
    Math.round(r.principal),
    Math.round(r.interest),
    Math.round(r.extraPayment),
    Math.round(r.closingBalance),
  ]);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAmortizationToCsv(
  rows: AmortizationRow[],
  filename = "amortization-schedule.csv"
) {
  const body = toTableRows(rows);
  const lines = [HEADER, ...body].map((line) => line.join(","));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

export async function exportAmortizationToExcel(
  rows: AmortizationRow[],
  filename = "amortization-schedule.xlsx"
) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Amortization Schedule");
  const body = toTableRows(rows);

  sheet.addRow(HEADER);
  sheet.getRow(1).font = { bold: true };
  body.forEach((row) => sheet.addRow(row));
  sheet.columns.forEach((col) => {
    col.width = 16;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename
  );
}

export async function exportAmortizationToPdf(
  rows: AmortizationRow[],
  filename = "amortization-schedule.pdf"
) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "landscape" });
  const body = toTableRows(rows);

  doc.setFontSize(14);
  doc.text("Amortization Schedule", 14, 14);
  autoTable(doc, { head: [HEADER], body, startY: 20, styles: { fontSize: 8 } });
  doc.save(filename);
}

export function printAmortizationSchedule(rows: AmortizationRow[]) {
  const body = toTableRows(rows);
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  const styles = `
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: right; }
    th:nth-child(1), td:nth-child(1), th:nth-child(2), td:nth-child(2) { text-align: left; }
    thead { background: #f3f4f6; }
  `;
  const tableRows = body
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td>${typeof cell === "number" ? cell.toLocaleString("en-IN") : cell}</td>`)
          .join("")}</tr>`
    )
    .join("");

  win.document.write(`<!doctype html>
    <html><head><title>Amortization Schedule</title><style>${styles}</style></head>
    <body>
      <h1>Amortization Schedule</h1>
      <table>
        <thead><tr>${HEADER.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
