"use client";

import { useMemo, useState } from "react";
import { Star, ShieldCheck } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/ui/field";
import { calculateFinancialHealthScore } from "@/lib/calculations";

export function FinancialHealthScore() {
  const { values, schedule } = useCalculator();
  const [monthlyIncome, setMonthlyIncome] = useState<number | undefined>(undefined);

  const downPaymentPercent =
    values.inputMode === "propertyValue" && values.propertyValue > 0
      ? (values.downPayment / values.propertyValue) * 100
      : undefined;

  const result = useMemo(
    () =>
      calculateFinancialHealthScore({
        monthlyEmi: schedule.summary.initialEmi,
        monthlyIncome,
        totalInterest: schedule.summary.totalInterest,
        totalPrincipal: schedule.summary.totalPrincipal,
        tenureMonths: values.tenureMonths,
        downPaymentPercent,
        hasPrepaymentPlan: schedule.summary.totalExtraPayments > 0,
      }),
    [schedule.summary, monthlyIncome, values.tenureMonths, downPaymentPercent]
  );

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="size-4" /> Financial Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-semibold tabular-nums">{result.score}</span>
          <div className="flex flex-col gap-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${i < result.stars ? "fill-primary text-primary" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">{result.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FieldLabel className="text-xs whitespace-nowrap text-muted-foreground" htmlFor="health-income">
            Monthly income (optional, for accuracy)
          </FieldLabel>
          <Input
            id="health-income"
            type="number"
            placeholder="₹"
            value={monthlyIncome ?? ""}
            onChange={(e) => setMonthlyIncome(e.target.value ? Number(e.target.value) : undefined)}
            className="w-32"
          />
        </div>

        {result.suggestions.length > 0 && (
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {result.suggestions.map((s) => (
              <li key={s} className="flex gap-1.5">
                <span className="text-primary">•</span>
                {s}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
