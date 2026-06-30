import { z } from "zod";

export const emiTypeSchema = z.enum(["normal", "stepUp", "stepDown", "interestOnly"]);
export const tenureUnitSchema = z.enum(["years", "months"]);
export const inputModeSchema = z.enum(["loanAmount", "propertyValue"]);
export const processingFeeTypeSchema = z.enum(["percent", "flat"]);
export const prepaymentFrequencySchema = z.enum(["monthly", "quarterly", "halfYearly", "yearly"]);
export const prepaymentStrategySchema = z.enum(["reduceTenure", "reduceEmi"]);

export const lumpSumSchema = z.object({
  id: z.string(),
  year: z.number().min(1).max(50),
  amount: z.number().min(0).max(1_000_000_000),
  label: z.string().max(40).optional(),
});

export const rateChangeSchema = z.object({
  id: z.string(),
  // Year 1 is always the base interestRatePercent — changes start from year 2.
  year: z.number().min(2).max(50),
  rate: z.number().min(0.1).max(25),
});

export const loanInputSchema = z
  .object({
    inputMode: inputModeSchema,
    loanAmount: z.number().min(100000, "Minimum loan amount is ₹1,00,000").max(500_000_000),
    propertyValue: z.number().min(100000).max(1_000_000_000),
    downPayment: z.number().min(0).max(1_000_000_000),
    interestRatePercent: z.number().min(0.1, "Rate must be at least 0.1%").max(25),
    tenureMonths: z.number().min(6, "Minimum tenure is 6 months").max(420),
    tenureUnit: tenureUnitSchema,
    processingFeeType: processingFeeTypeSchema,
    processingFeeValue: z.number().min(0).max(10_000_000),
    startDate: z.date(),
    emiType: emiTypeSchema,
    stepPercent: z.number().min(0).max(50),
    interestOnlyMonths: z.number().min(0).max(60),
    prepaymentEnabled: z.boolean(),
    prepaymentStrategy: prepaymentStrategySchema,
    recurringEnabled: z.boolean(),
    recurringAmount: z.number().min(0).max(100_000_000),
    recurringFrequency: prepaymentFrequencySchema,
    lumpSums: z.array(lumpSumSchema),
    floatingRateEnabled: z.boolean(),
    rateChanges: z.array(rateChangeSchema),
  })
  .refine(
    (data) =>
      data.inputMode !== "propertyValue" || data.downPayment <= data.propertyValue,
    {
      message: "Down payment cannot exceed property value",
      path: ["downPayment"],
    }
  )
  .refine(
    (data) => data.emiType !== "interestOnly" || data.interestOnlyMonths < data.tenureMonths,
    {
      message: "Interest-only period must be shorter than the total tenure",
      path: ["interestOnlyMonths"],
    }
  );

export type LoanInputValues = z.infer<typeof loanInputSchema>;

export const defaultLoanInputValues: LoanInputValues = {
  inputMode: "loanAmount",
  loanAmount: 5_000_000,
  propertyValue: 6_000_000,
  downPayment: 1_000_000,
  interestRatePercent: 8.5,
  tenureMonths: 240,
  tenureUnit: "years",
  processingFeeType: "percent",
  processingFeeValue: 0.5,
  startDate: new Date(),
  emiType: "normal",
  stepPercent: 5,
  interestOnlyMonths: 12,
  prepaymentEnabled: false,
  prepaymentStrategy: "reduceTenure",
  recurringEnabled: false,
  recurringAmount: 50000,
  recurringFrequency: "yearly",
  lumpSums: [],
  floatingRateEnabled: false,
  rateChanges: [],
};
