"use client";

import { useMemo } from "react";
import { PiggyBank } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/stat";
import { effectiveBorrowingCostPercent } from "@/lib/calculations";
import { formatINR, formatMonthsAsYears, formatPercent } from "@/lib/calculations/format";

export function SavingsDashboard() {
  const { schedule, baselineSchedule, processingFee, principal, values } = useCalculator();

  const metrics = useMemo(() => {
    const interestSaved = baselineSchedule.summary.totalInterest - schedule.summary.totalInterest;
    const timeSaved = schedule.summary.monthsSaved;
    const totalExtraPayments = schedule.summary.totalExtraPayments;
    const roiPercent = totalExtraPayments > 0 ? (interestSaved / totalExtraPayments) * 100 : 0;
    const effectiveRate = effectiveBorrowingCostPercent(
      schedule.summary.totalInterest,
      processingFee,
      principal,
      values.tenureMonths / 12
    );
    return { interestSaved, timeSaved, totalExtraPayments, roiPercent, effectiveRate };
  }, [schedule.summary, baselineSchedule.summary, processingFee, principal, values.tenureMonths]);

  if (metrics.totalExtraPayments <= 0) return null;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PiggyBank className="size-4" /> Savings Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Interest saved" value={formatINR(Math.max(metrics.interestSaved, 0), { compact: true })} />
        <Stat
          label="Time saved"
          value={metrics.timeSaved > 0 ? formatMonthsAsYears(metrics.timeSaved) : "—"}
        />
        <Stat label="Total extra payments" value={formatINR(metrics.totalExtraPayments, { compact: true })} />
        <Stat label="Effective interest rate" value={formatPercent(metrics.effectiveRate)} helper="incl. fees" />
        <Stat
          label="Prepayment ROI"
          value={formatPercent(metrics.roiPercent, 0)}
          helper="interest saved per ₹ prepaid"
        />
      </CardContent>
    </Card>
  );
}
