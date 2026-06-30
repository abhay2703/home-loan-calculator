"use client";

import { CalendarIcon } from "lucide-react";
import { Controller } from "react-hook-form";
import { format } from "date-fns";
import { useCalculator } from "./calculator-context";
import { SliderInputField } from "./slider-input-field";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { formatINR } from "@/lib/calculations/format";
import type { TenureUnit } from "./types";

export function LoanInputForm() {
  const { form, values, principal } = useCalculator();
  const { control, setValue, watch, formState } = form;
  const errors = formState.errors;

  const tenureUnit = watch("tenureUnit") as TenureUnit;
  const tenureMonths = watch("tenureMonths");
  const emiType = watch("emiType");

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Loan Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Controller
          control={control}
          name="inputMode"
          render={({ field }) => (
            <Tabs value={field.value} onValueChange={field.onChange}>
              <TabsList className="h-auto w-full flex-wrap">
                <TabsTrigger value="loanAmount" className="flex-1 py-1.5 text-xs sm:text-sm">
                  Enter loan amount
                </TabsTrigger>
                <TabsTrigger value="propertyValue" className="flex-1 py-1.5 text-xs sm:text-sm">
                  Property value + down payment
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />

        {values.inputMode === "loanAmount" ? (
          <Controller
            control={control}
            name="loanAmount"
            render={({ field }) => (
              <SliderInputField
                label="Loan Amount"
                value={field.value}
                onChange={field.onChange}
                min={100000}
                max={50000000}
                step={10000}
                prefix="₹"
                error={errors.loanAmount?.message}
              />
            )}
          />
        ) : (
          <>
            <Controller
              control={control}
              name="propertyValue"
              render={({ field }) => (
                <SliderInputField
                  label="Property Value"
                  value={field.value}
                  onChange={field.onChange}
                  min={100000}
                  max={100000000}
                  step={50000}
                  prefix="₹"
                  error={errors.propertyValue?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="downPayment"
              render={({ field }) => (
                <SliderInputField
                  label="Down Payment"
                  value={field.value}
                  onChange={field.onChange}
                  min={0}
                  max={watch("propertyValue")}
                  step={10000}
                  prefix="₹"
                  tooltip="Loan amount is automatically calculated as Property Value − Down Payment."
                  error={errors.downPayment?.message}
                />
              )}
            />
            <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Derived loan amount: </span>
              <span className="font-semibold text-primary">{formatINR(principal)}</span>
            </div>
          </>
        )}

        <Controller
          control={control}
          name="interestRatePercent"
          render={({ field }) => (
            <SliderInputField
              label="Interest Rate"
              value={field.value}
              onChange={field.onChange}
              min={1}
              max={20}
              step={0.1}
              suffix="%"
              error={errors.interestRatePercent?.message}
            />
          )}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <FieldLabel className="text-sm font-medium">Loan Tenure</FieldLabel>
            <Tabs
              value={tenureUnit}
              onValueChange={(unit) => setValue("tenureUnit", unit as TenureUnit)}
            >
              <TabsList>
                <TabsTrigger value="years">Years</TabsTrigger>
                <TabsTrigger value="months">Months</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <SliderInputField
            label=""
            value={tenureUnit === "years" ? Math.round(tenureMonths / 12) : tenureMonths}
            onChange={(v) =>
              setValue("tenureMonths", tenureUnit === "years" ? Math.round(v * 12) : Math.round(v), {
                shouldValidate: true,
              })
            }
            min={tenureUnit === "years" ? 1 : 6}
            max={tenureUnit === "years" ? 35 : 420}
            step={1}
            suffix={tenureUnit === "years" ? "yr" : "mo"}
            error={errors.tenureMonths?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel className="text-sm font-medium">Processing Fee</FieldLabel>
            <div className="flex gap-2">
              <Controller
                control={control}
                name="processingFeeType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">% of loan</SelectItem>
                      <SelectItem value="flat">Flat ₹</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="processingFeeValue"
                render={({ field }) => (
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel className="text-sm font-medium">Start Date</FieldLabel>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger
                    render={<Button variant="outline" className="h-8 w-full justify-start font-normal" />}
                  >
                    <CalendarIcon className="mr-2 size-3.5" />
                    {format(field.value, "dd MMM yyyy")}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => date && field.onChange(date)}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel className="text-sm font-medium">EMI Type</FieldLabel>
          <Controller
            control={control}
            name="emiType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal EMI</SelectItem>
                  <SelectItem value="stepUp">Step-up EMI</SelectItem>
                  <SelectItem value="stepDown">Step-down EMI</SelectItem>
                  <SelectItem value="interestOnly">Interest only (construction period)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {(emiType === "stepUp" || emiType === "stepDown") && (
          <Controller
            control={control}
            name="stepPercent"
            render={({ field }) => (
              <SliderInputField
                label={emiType === "stepUp" ? "Annual EMI Increase" : "Annual EMI Decrease"}
                value={field.value}
                onChange={field.onChange}
                min={1}
                max={25}
                step={1}
                suffix="%"
                tooltip="How much the EMI changes every 12 months."
              />
            )}
          />
        )}

        {emiType === "interestOnly" && (
          <Controller
            control={control}
            name="interestOnlyMonths"
            render={({ field }) => (
              <SliderInputField
                label="Interest-only Period"
                value={field.value}
                onChange={field.onChange}
                min={1}
                max={Math.max(tenureMonths - 1, 1)}
                step={1}
                suffix="mo"
                tooltip="Construction period during which only interest is paid, counted within the total tenure."
                error={errors.interestOnlyMonths?.message}
              />
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
