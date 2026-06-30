"use client";

import { useMemo, useState } from "react";
import { Target } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { SliderInputField } from "./slider-input-field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requiredEmiForGoalTenure, solveRequiredYearlyPrepayment } from "@/lib/calculations";
import { formatINR } from "@/lib/calculations/format";

type GoalMode = "emi" | "prepayment";

export function GoalBasedCalculator() {
  const { values, principal, schedule } = useCalculator();
  const [mode, setMode] = useState<GoalMode>("emi");
  const [goalYears, setGoalYears] = useState(10);

  const goalMonths = goalYears * 12;
  const currentTenureYears = Math.round(values.tenureMonths / 12);

  const requiredEmi = useMemo(
    () =>
      principal > 0
        ? requiredEmiForGoalTenure(principal, values.interestRatePercent, goalMonths)
        : 0,
    [principal, values.interestRatePercent, goalMonths]
  );

  const requiredPrepayment = useMemo(() => {
    if (principal <= 0 || mode !== "prepayment") return 0;
    return solveRequiredYearlyPrepayment(
      {
        principal,
        annualRatePercent: values.interestRatePercent,
        tenureMonths: values.tenureMonths,
        startDate: values.startDate,
        emiType: values.emiType,
        stepPercent: values.stepPercent,
        interestOnlyMonths: values.interestOnlyMonths,
      },
      goalMonths
    );
  }, [
    principal,
    mode,
    values.interestRatePercent,
    values.tenureMonths,
    values.startDate,
    values.emiType,
    values.stepPercent,
    values.interestOnlyMonths,
    goalMonths,
  ]);

  const alreadyMet = goalMonths >= schedule.summary.actualTenureMonths;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Goal-Based Calculator</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground">
          &ldquo;I want this loan finished in {goalYears} years&rdquo; — see the EMI or yearly
          prepayment that gets you there, versus the current {currentTenureYears}-year plan.
        </p>

        <SliderInputField
          label="Target payoff"
          value={goalYears}
          onChange={setGoalYears}
          min={1}
          max={Math.max(currentTenureYears, 1)}
          step={1}
          suffix="yr"
        />

        <Tabs value={mode} onValueChange={(v) => setMode(v as GoalMode)}>
          <TabsList className="w-full">
            <TabsTrigger value="emi" className="flex-1">
              Required EMI
            </TabsTrigger>
            <TabsTrigger value="prepayment" className="flex-1">
              Required prepayment
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {alreadyMet ? (
          <div className="rounded-lg bg-accent p-4 text-sm text-accent-foreground">
            Your current plan already finishes within {goalYears} years — no change needed.
          </div>
        ) : mode === "emi" ? (
          <div className="rounded-lg bg-accent p-4">
            <div className="mb-1 flex items-center gap-2 text-accent-foreground">
              <Target className="size-4" />
              <span className="text-sm font-semibold">New EMI needed</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-accent-foreground">
              {formatINR(requiredEmi, { decimals: 0 })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              vs. {formatINR(schedule.summary.initialEmi, { decimals: 0 })} today
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-accent p-4">
            <div className="mb-1 flex items-center gap-2 text-accent-foreground">
              <Target className="size-4" />
              <span className="text-sm font-semibold">Extra payment needed every year</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-accent-foreground">
              {formatINR(requiredPrepayment, { decimals: 0 })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">on top of your current EMI</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
