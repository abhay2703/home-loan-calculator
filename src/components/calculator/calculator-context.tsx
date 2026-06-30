"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  buildAmortizationSchedule,
  calculateProcessingFee,
  deriveLoanAmount,
  type AmortizationResult,
  type LoanScheduleParams,
  type PrepaymentConfig,
} from "@/lib/calculations";
import {
  defaultLoanInputValues,
  loanInputSchema,
  type LoanInputValues,
} from "@/lib/calculations/schema";

interface CalculatorContextValue {
  form: UseFormReturn<LoanInputValues>;
  values: LoanInputValues;
  principal: number;
  processingFee: number;
  schedule: AmortizationResult;
  baselineSchedule: AmortizationResult;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

function buildPrepaymentConfig(values: LoanInputValues): PrepaymentConfig | undefined {
  if (!values.prepaymentEnabled) return undefined;
  const hasRecurring = values.recurringEnabled && values.recurringAmount > 0;
  const hasLumpSums = values.lumpSums.length > 0;
  if (!hasRecurring && !hasLumpSums) return undefined;

  return {
    strategy: values.prepaymentStrategy,
    recurring: hasRecurring
      ? { amount: values.recurringAmount, frequency: values.recurringFrequency }
      : undefined,
    lumpSums: hasLumpSums
      ? values.lumpSums.map((ls) => ({
          month: Math.round(ls.year * 12),
          amount: ls.amount,
          label: ls.label,
        }))
      : undefined,
  };
}

function toScheduleParams(
  values: LoanInputValues,
  principal: number,
  includePrepayment: boolean
): LoanScheduleParams {
  return {
    principal,
    annualRatePercent: values.interestRatePercent,
    tenureMonths: values.tenureMonths,
    startDate: values.startDate,
    emiType: values.emiType,
    stepPercent: values.stepPercent,
    interestOnlyMonths: values.interestOnlyMonths,
    prepayment: includePrepayment ? buildPrepaymentConfig(values) : undefined,
  };
}

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const form = useForm<LoanInputValues>({
    resolver: zodResolver(loanInputSchema),
    defaultValues: defaultLoanInputValues,
    mode: "onChange",
  });

  const values = form.watch();

  const principal = useMemo(() => {
    if (values.inputMode === "propertyValue") {
      return deriveLoanAmount(values.propertyValue, values.downPayment);
    }
    return values.loanAmount;
  }, [values.inputMode, values.propertyValue, values.downPayment, values.loanAmount]);

  const processingFee = useMemo(
    () =>
      calculateProcessingFee(principal, {
        type: values.processingFeeType,
        value: values.processingFeeValue,
      }),
    [principal, values.processingFeeType, values.processingFeeValue]
  );

  const schedule = useMemo(() => {
    if (principal <= 0) {
      return buildAmortizationSchedule(toScheduleParams({ ...values, prepaymentEnabled: false }, 1, false));
    }
    return buildAmortizationSchedule(toScheduleParams(values, principal, true));
  }, [values, principal]);

  const baselineSchedule = useMemo(() => {
    if (principal <= 0) {
      return buildAmortizationSchedule(toScheduleParams({ ...values, prepaymentEnabled: false }, 1, false));
    }
    return buildAmortizationSchedule(toScheduleParams(values, principal, false));
  }, [values, principal]);

  return (
    <CalculatorContext.Provider
      value={{ form, values, principal, processingFee, schedule, baselineSchedule }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error("useCalculator must be used within a CalculatorProvider");
  return ctx;
}
