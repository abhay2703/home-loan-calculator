"use client";

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { SliderInputField } from "./slider-input-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deriveAdvancedInsights } from "@/lib/calculations";
import { formatINR, formatPercent } from "@/lib/calculations/format";

export function AdvancedInsights() {
  const { schedule, processingFee, principal, values } = useCalculator();
  const [selectedYear, setSelectedYear] = useState(Math.round(values.tenureMonths / 12 / 2) || 1);

  const insights = useMemo(
    () =>
      deriveAdvancedInsights(
        schedule.rows,
        schedule.summary,
        processingFee,
        principal,
        values.tenureMonths
      ),
    [schedule.rows, schedule.summary, processingFee, principal, values.tenureMonths]
  );

  const tenureYears = Math.max(Math.round(values.tenureMonths / 12), 1);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="size-4" /> Advanced Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat
            label="Average monthly interest"
            value={formatINR(insights.averageMonthlyInterest, { decimals: 0 })}
          />
          <Stat
            label="Highest interest month"
            value={
              insights.highestInterestMonth
                ? formatINR(insights.highestInterestMonth.interest, { decimals: 0 })
                : "—"
            }
            helper={
              insights.highestInterestMonth
                ? insights.highestInterestMonth.date.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })
                : undefined
            }
          />
          <Stat
            label="Effective annual cost"
            value={formatPercent(insights.effectiveAnnualBorrowingCostPercent)}
            helper="incl. processing fee"
          />
        </div>

        {insights.interestMilestones.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Interest paid by milestone</p>
            <div className="grid grid-cols-3 gap-3">
              {insights.interestMilestones.map((m) => (
                <Stat
                  key={m.years}
                  label={`After ${m.years} yr`}
                  value={formatINR(m.interestPaid, { compact: true })}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <SliderInputField
            label="Remaining balance after year"
            value={selectedYear}
            onChange={setSelectedYear}
            min={0}
            max={tenureYears}
            step={1}
            suffix="yr"
          />
          <p className="mt-2 text-lg font-semibold tabular-nums">
            {formatINR(insights.balanceAtYear(selectedYear), { decimals: 0 })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-base font-semibold tabular-nums">{value}</span>
      {helper ? <span className="text-xs text-muted-foreground">{helper}</span> : null}
    </div>
  );
}
