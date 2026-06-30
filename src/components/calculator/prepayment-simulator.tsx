"use client";

import { useFieldArray, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { SliderInputField } from "./slider-input-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { formatINR, formatMonthsAsYears } from "@/lib/calculations/format";

export function PrepaymentSimulator() {
  const { form, schedule, baselineSchedule } = useCalculator();
  const { control, watch } = form;
  const prepaymentEnabled = watch("prepaymentEnabled");
  const recurringEnabled = watch("recurringEnabled");

  const { fields, append, remove } = useFieldArray({ control, name: "lumpSums" });

  const interestSaved = baselineSchedule.summary.totalInterest - schedule.summary.totalInterest;
  const monthsSaved = schedule.summary.monthsSaved;
  const moneySaved = interestSaved;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Prepayment Simulator</CardTitle>
        <Controller
          control={control}
          name="prepaymentEnabled"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </CardHeader>
      {prepaymentEnabled && (
        <CardContent className="flex flex-col gap-6">
          <Field>
            <FieldLabel className="text-sm font-medium">When extra money is paid in</FieldLabel>
            <Controller
              control={control}
              name="prepaymentStrategy"
              render={({ field }) => (
                <Tabs value={field.value} onValueChange={field.onChange}>
                  <TabsList className="w-full">
                    <TabsTrigger value="reduceTenure" className="flex-1">
                      Reduce tenure
                    </TabsTrigger>
                    <TabsTrigger value="reduceEmi" className="flex-1">
                      Reduce EMI
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            />
          </Field>

          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <FieldLabel className="text-sm font-medium">Recurring extra payment</FieldLabel>
              <Controller
                control={control}
                name="recurringEnabled"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
            {recurringEnabled && (
              <div className="flex flex-col gap-4">
                <Controller
                  control={control}
                  name="recurringAmount"
                  render={({ field }) => (
                    <SliderInputField
                      label="Extra amount"
                      value={field.value}
                      onChange={field.onChange}
                      min={1000}
                      max={2000000}
                      step={1000}
                      prefix="₹"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="recurringFrequency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Every month</SelectItem>
                        <SelectItem value="quarterly">Every quarter</SelectItem>
                        <SelectItem value="halfYearly">Every half year</SelectItem>
                        <SelectItem value="yearly">Every year</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <FieldLabel className="text-sm font-medium">
                One-off lump sums (e.g. bonus, Diwali payout)
              </FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ id: crypto.randomUUID(), year: 3, amount: 200000, label: "" })
                }
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
                  <Controller
                    control={control}
                    name={`lumpSums.${index}.year`}
                    render={({ field: yearField }) => (
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={yearField.value}
                        onChange={(e) => yearField.onChange(Number(e.target.value))}
                        className="w-20"
                        aria-label="Year"
                      />
                    )}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    year(s) in
                  </span>
                  <Controller
                    control={control}
                    name={`lumpSums.${index}.amount`}
                    render={({ field: amountField }) => (
                      <Input
                        type="number"
                        min={0}
                        value={amountField.value}
                        onChange={(e) => amountField.onChange(Number(e.target.value))}
                        className="flex-1"
                        aria-label="Amount"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label="Remove lump sum"
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {fields.length === 0 && (
              <p className="text-xs text-muted-foreground">No lump-sum payments added yet.</p>
            )}
          </div>

          {(recurringEnabled || fields.length > 0) && (
            <div className="rounded-lg bg-accent p-4">
              <div className="mb-3 flex items-center gap-2 text-accent-foreground">
                <Sparkles className="size-4" />
                <span className="text-sm font-semibold">Before vs after prepayment</span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="Interest saved" value={formatINR(Math.max(interestSaved, 0), { compact: true })} />
                <Stat
                  label="Tenure saved"
                  value={monthsSaved > 0 ? formatMonthsAsYears(monthsSaved) : "—"}
                />
                <Stat
                  label="New EMI"
                  value={
                    schedule.summary.finalEmi !== baselineSchedule.summary.initialEmi
                      ? formatINR(schedule.summary.finalEmi, { decimals: 0 })
                      : "—"
                  }
                />
                <Stat label="Money saved" value={formatINR(Math.max(moneySaved, 0), { compact: true })} />
              </div>
            </div>
          )}
        </CardContent>
      )}
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
