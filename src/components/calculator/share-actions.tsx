"use client";

import { useState } from "react";
import { Link2, Copy, FileDown, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useCalculator } from "./calculator-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildShareUrl } from "@/lib/share";
import { generateSmartSuggestions } from "@/lib/calculations";
import { downloadFinancialReportPdf } from "@/lib/export/financial-report";
import { formatINR, formatMonthsAsYears } from "@/lib/calculations/format";

export function ShareActions() {
  const { values, principal, schedule, baselineSchedule } = useCalculator();
  const [downloading, setDownloading] = useState(false);

  async function handleCopyLink() {
    const url = buildShareUrl(values);
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard");
  }

  async function handleCopySummary() {
    const { summary } = schedule;
    const text = [
      "Home Loan Summary",
      `Loan amount: ${formatINR(principal)}`,
      `Interest rate: ${values.interestRatePercent}%`,
      `Tenure: ${formatMonthsAsYears(values.tenureMonths)}`,
      `Monthly EMI: ${formatINR(summary.initialEmi)}`,
      `Total interest: ${formatINR(summary.totalInterest)}`,
      `Total payment: ${formatINR(summary.totalPayment)}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Summary copied to clipboard");
  }

  async function handleDownloadReport() {
    setDownloading(true);
    try {
      const downPaymentPercent =
        values.inputMode === "propertyValue" && values.propertyValue > 0
          ? (values.downPayment / values.propertyValue) * 100
          : undefined;
      const suggestions = generateSmartSuggestions({
        principal,
        annualRatePercent: values.interestRatePercent,
        tenureMonths: values.tenureMonths,
        startDate: values.startDate,
        emiType: values.emiType,
        downPaymentPercent,
      });
      await downloadFinancialReportPdf({
        principal,
        annualRatePercent: values.interestRatePercent,
        tenureMonths: values.tenureMonths,
        schedule,
        baselineSchedule,
        suggestions,
      });
      toast.success("Report downloaded");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Share2 className="size-4" /> Share & Export
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleCopyLink}>
          <Link2 className="size-3.5" /> Copy share link
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleCopySummary}>
          <Copy className="size-3.5" /> Copy summary
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleDownloadReport} disabled={downloading}>
          <FileDown className="size-3.5" /> {downloading ? "Generating…" : "Download PDF report"}
        </Button>
      </CardContent>
    </Card>
  );
}
