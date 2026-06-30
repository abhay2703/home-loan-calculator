"use client";

import { useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { SliderInputField } from "@/components/calculator/slider-input-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/stat";
import { calculateAffordability } from "@/lib/calculations";
import { formatINR } from "@/lib/calculations/format";

export default function AffordabilityPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(150000);
  const [existingEmis, setExistingEmis] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(40000);
  const [targetDownPayment, setTargetDownPayment] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [foirPercent, setFoirPercent] = useState(50);

  const result = useMemo(
    () =>
      calculateAffordability({
        monthlyIncome,
        existingEmis,
        monthlyExpenses,
        targetDownPayment,
        annualRatePercent: interestRate,
        tenureMonths: tenureYears * 12,
        foirPercent,
      }),
    [monthlyIncome, existingEmis, monthlyExpenses, targetDownPayment, interestRate, tenureYears, foirPercent]
  );

  return (
    <ToolPageShell
      title="Affordability Calculator"
      description="Based on your income, existing obligations, and expenses, here's the maximum property price you can comfortably take on."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Your finances</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SliderInputField
              label="Monthly income"
              value={monthlyIncome}
              onChange={setMonthlyIncome}
              min={20000}
              max={2000000}
              step={5000}
              prefix="₹"
            />
            <SliderInputField
              label="Existing EMIs"
              value={existingEmis}
              onChange={setExistingEmis}
              min={0}
              max={500000}
              step={1000}
              prefix="₹"
            />
            <SliderInputField
              label="Monthly expenses"
              value={monthlyExpenses}
              onChange={setMonthlyExpenses}
              min={0}
              max={1000000}
              step={1000}
              prefix="₹"
            />
            <SliderInputField
              label="Target down payment"
              value={targetDownPayment}
              onChange={setTargetDownPayment}
              min={0}
              max={20000000}
              step={50000}
              prefix="₹"
            />
            <SliderInputField
              label="Expected interest rate"
              value={interestRate}
              onChange={setInterestRate}
              min={1}
              max={20}
              step={0.1}
              suffix="%"
            />
            <SliderInputField
              label="Loan tenure"
              value={tenureYears}
              onChange={setTenureYears}
              min={1}
              max={35}
              step={1}
              suffix="yr"
            />
            <SliderInputField
              label="Lender's FOIR cap"
              value={foirPercent}
              onChange={setFoirPercent}
              min={30}
              max={65}
              step={1}
              suffix="%"
              tooltip="Fixed Obligation to Income Ratio — the share of gross income lenders allow toward all EMIs combined. Most Indian banks use 40-50%."
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">What you can afford</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="rounded-lg bg-accent p-4">
              <div className="mb-2 flex items-center gap-2 text-accent-foreground">
                <Wallet className="size-4" />
                <span className="text-sm font-semibold">Maximum property price</span>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-accent-foreground">
                {formatINR(result.maxPropertyPrice, { compact: true })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Max affordable EMI" value={formatINR(result.maxAffordableEmi, { decimals: 0 })} />
              <Stat label="Max loan amount" value={formatINR(result.maxLoanAmount, { compact: true })} />
              <Stat
                label="Monthly surplus today"
                value={formatINR(result.surplusAfterExpenses, { decimals: 0 })}
                helper="income − existing EMIs − expenses"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageShell>
  );
}
