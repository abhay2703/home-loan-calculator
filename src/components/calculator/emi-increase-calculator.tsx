"use client";

import { useMemo, useState } from "react";
import { Rocket } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { SliderInputField } from "./slider-input-field";
import { buildEmiIncreaseSchedule, calculateEMI } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR, formatMonthsAsYears } from "@/lib/calculations/format";

export function EmiIncreaseCalculator() {
  const { values, principal } = useCalculator();
  const [increasePercent, setIncreasePercent] = useState(5);

  const baselineEmi = useMemo(
    () => calculateEMI(principal, values.interestRatePercent, values.tenureMonths),
    [principal, values.interestRatePercent, values.tenureMonths]
  );

  const result = useMemo(() => {
    if (principal <= 0 || increasePercent <= 0) return null;
    return buildEmiIncreaseSchedule({
      principal,
      annualRatePercent: values.interestRatePercent,
      tenureMonths: values.tenureMonths,
      startDate: values.startDate,
      baselineEmi,
      annualIncreasePercent: increasePercent,
    });
  }, [principal, values.interestRatePercent, values.tenureMonths, values.startDate, baselineEmi, increasePercent]);

  const fullTermInterest = useMemo(
    () =>
      buildEmiIncreaseSchedule({
        principal,
        annualRatePercent: values.interestRatePercent,
        tenureMonths: values.tenureMonths,
        startDate: values.startDate,
        baselineEmi,
        annualIncreasePercent: 0,
      }).summary.totalInterest,
    [principal, values.interestRatePercent, values.tenureMonths, values.startDate, baselineEmi]
  );

  const interestSaved = result ? fullTermInterest - result.summary.totalInterest : 0;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">EMI Increase Calculator</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground">
          Starting from today&apos;s EMI of {formatINR(baselineEmi, { decimals: 0 })}, voluntarily
          increase it every year and see how much earlier the loan ends.
        </p>
        <SliderInputField
          label="Annual EMI increase"
          value={increasePercent}
          onChange={setIncreasePercent}
          min={0}
          max={20}
          step={1}
          suffix="%"
        />
        {result && (
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-accent p-4 sm:grid-cols-3">
            <Stat
              label="Loan ends in"
              value={formatMonthsAsYears(result.summary.actualTenureMonths)}
            />
            <Stat
              label="Time saved"
              value={result.summary.monthsSaved > 0 ? formatMonthsAsYears(result.summary.monthsSaved) : "—"}
            />
            <Stat
              label="Interest saved"
              value={formatINR(Math.max(interestSaved, 0), { compact: true })}
            />
          </div>
        )}
        {result && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Rocket className="size-3.5" />
            <span>
              EMI grows from {formatINR(baselineEmi, { decimals: 0 })} to{" "}
              {formatINR(result.summary.finalEmi, { decimals: 0 })} by the final year.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold text-accent-foreground tabular-nums">{value}</span>
    </div>
  );
}
