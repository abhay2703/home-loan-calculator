"use client";

import { useMemo } from "react";
import { Lightbulb, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSmartSuggestions, type Suggestion } from "@/lib/calculations";

const TONE_ICON: Record<Suggestion["tone"], typeof TrendingUp> = {
  positive: TrendingUp,
  warning: AlertTriangle,
  info: Info,
};

const TONE_CLASS: Record<Suggestion["tone"], string> = {
  positive: "text-success",
  warning: "text-destructive",
  info: "text-primary",
};

export function SmartSuggestions() {
  const { values, principal } = useCalculator();

  const downPaymentPercent =
    values.inputMode === "propertyValue" && values.propertyValue > 0
      ? (values.downPayment / values.propertyValue) * 100
      : undefined;

  const suggestions = useMemo(
    () =>
      generateSmartSuggestions({
        principal,
        annualRatePercent: values.interestRatePercent,
        tenureMonths: values.tenureMonths,
        startDate: values.startDate,
        emiType: values.emiType,
        downPaymentPercent,
      }),
    [principal, values.interestRatePercent, values.tenureMonths, values.startDate, values.emiType, downPaymentPercent]
  );

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="size-4" /> Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {suggestions.map((s) => {
            const Icon = TONE_ICON[s.tone];
            return (
              <li key={s.id} className="flex items-start gap-2 text-sm">
                <Icon className={`mt-0.5 size-4 shrink-0 ${TONE_CLASS[s.tone]}`} />
                <span>{s.message}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
