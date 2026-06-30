"use client";

import { useMemo } from "react";
import { useFieldArray, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingUpDown } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { buildAmortizationSchedule } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { formatINR } from "@/lib/calculations/format";

export function FloatingRateSimulator() {
  const { form, values, principal, schedule } = useCalculator();
  const { control, watch } = form;
  const floatingRateEnabled = watch("floatingRateEnabled");

  const { fields, append, remove } = useFieldArray({ control, name: "rateChanges" });

  const flatRateSchedule = useMemo(() => {
    if (principal <= 0) return null;
    return buildAmortizationSchedule({
      principal,
      annualRatePercent: values.interestRatePercent,
      tenureMonths: values.tenureMonths,
      startDate: values.startDate,
      emiType: values.emiType,
      stepPercent: values.stepPercent,
      interestOnlyMonths: values.interestOnlyMonths,
    });
  }, [
    principal,
    values.interestRatePercent,
    values.tenureMonths,
    values.startDate,
    values.emiType,
    values.stepPercent,
    values.interestOnlyMonths,
  ]);

  const interestDelta =
    floatingRateEnabled && flatRateSchedule
      ? schedule.summary.totalInterest - flatRateSchedule.summary.totalInterest
      : 0;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Floating Interest Rate Simulator</CardTitle>
        <Controller
          control={control}
          name="floatingRateEnabled"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </CardHeader>
      {floatingRateEnabled && (
        <CardContent className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Year 1 uses the base interest rate above. Add changes for later years —
            the EMI recomputes off the remaining balance and remaining tenure each time,
            same as the loan keeping a fixed term.
          </p>

          <div className="flex items-center justify-between">
            <FieldLabel className="text-sm font-medium">Rate changes</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ id: crypto.randomUUID(), year: 3, rate: values.interestRatePercent })}
            >
              <Plus className="size-3.5" /> Add
            </Button>
          </div>

          <AnimatePresence initial={false}>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs whitespace-nowrap text-muted-foreground">From year</span>
                <Controller
                  control={control}
                  name={`rateChanges.${index}.year`}
                  render={({ field: yearField }) => (
                    <Input
                      type="number"
                      min={2}
                      max={50}
                      value={yearField.value}
                      onChange={(e) => yearField.onChange(Number(e.target.value))}
                      className="w-20"
                      aria-label="Year"
                    />
                  )}
                />
                <span className="text-xs whitespace-nowrap text-muted-foreground">rate becomes</span>
                <Controller
                  control={control}
                  name={`rateChanges.${index}.rate`}
                  render={({ field: rateField }) => (
                    <Input
                      type="number"
                      step="0.1"
                      min={0.1}
                      max={25}
                      value={rateField.value}
                      onChange={(e) => rateField.onChange(Number(e.target.value))}
                      className="flex-1"
                      aria-label="Rate"
                    />
                  )}
                />
                <span className="text-xs text-muted-foreground">%</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label="Remove rate change"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          {fields.length === 0 && (
            <p className="text-xs text-muted-foreground">No rate changes added yet.</p>
          )}

          {fields.length > 0 && (
            <div className="rounded-lg bg-accent p-4">
              <div className="mb-2 flex items-center gap-2 text-accent-foreground">
                <TrendingUpDown className="size-4" />
                <span className="text-sm font-semibold">
                  vs. staying at {values.interestRatePercent}% for the whole tenure
                </span>
              </div>
              <p className="text-lg font-semibold tabular-nums text-accent-foreground">
                {interestDelta >= 0 ? "+" : "−"}
                {formatINR(Math.abs(interestDelta), { compact: true })} interest
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
