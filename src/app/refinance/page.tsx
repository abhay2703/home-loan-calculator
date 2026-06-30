"use client";

import { useMemo, useState } from "react";
import { Repeat } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { SliderInputField } from "@/components/calculator/slider-input-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/stat";
import { calculateRefinance } from "@/lib/calculations";
import { formatINR, formatMonthsAsYears } from "@/lib/calculations/format";

export default function RefinancePage() {
  const [outstandingBalance, setOutstandingBalance] = useState(4000000);
  const [remainingTenureYears, setRemainingTenureYears] = useState(15);
  const [currentRate, setCurrentRate] = useState(9.5);
  const [newRate, setNewRate] = useState(8.3);
  const [processingFee, setProcessingFee] = useState(10000);
  const [legalFees, setLegalFees] = useState(5000);
  const [balanceTransferFee, setBalanceTransferFee] = useState(5000);

  const result = useMemo(
    () =>
      calculateRefinance({
        outstandingBalance,
        remainingTenureMonths: remainingTenureYears * 12,
        currentRatePercent: currentRate,
        newRatePercent: newRate,
        processingFee,
        legalFees,
        balanceTransferFee,
      }),
    [outstandingBalance, remainingTenureYears, currentRate, newRate, processingFee, legalFees, balanceTransferFee]
  );

  return (
    <ToolPageShell
      title="Refinance Calculator"
      description="Compare staying on your current loan vs switching lenders, fees included, with a clear breakeven point."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Current loan & new offer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SliderInputField
              label="Outstanding balance"
              value={outstandingBalance}
              onChange={setOutstandingBalance}
              min={100000}
              max={50000000}
              step={10000}
              prefix="₹"
            />
            <SliderInputField
              label="Remaining tenure"
              value={remainingTenureYears}
              onChange={setRemainingTenureYears}
              min={1}
              max={35}
              step={1}
              suffix="yr"
            />
            <SliderInputField
              label="Current interest rate"
              value={currentRate}
              onChange={setCurrentRate}
              min={1}
              max={20}
              step={0.05}
              suffix="%"
            />
            <SliderInputField
              label="New offer interest rate"
              value={newRate}
              onChange={setNewRate}
              min={1}
              max={20}
              step={0.05}
              suffix="%"
            />
            <SliderInputField
              label="Processing fee"
              value={processingFee}
              onChange={setProcessingFee}
              min={0}
              max={200000}
              step={1000}
              prefix="₹"
            />
            <SliderInputField
              label="Legal fees"
              value={legalFees}
              onChange={setLegalFees}
              min={0}
              max={100000}
              step={1000}
              prefix="₹"
            />
            <SliderInputField
              label="Balance transfer fee"
              value={balanceTransferFee}
              onChange={setBalanceTransferFee}
              min={0}
              max={100000}
              step={1000}
              prefix="₹"
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Should you switch?</CardTitle>
            <Badge variant={result.worthIt ? "default" : "destructive"}>
              {result.worthIt ? "Worth it" : "Not worth it"}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="rounded-lg bg-accent p-4">
              <div className="mb-1 flex items-center gap-2 text-accent-foreground">
                <Repeat className="size-4" />
                <span className="text-sm font-semibold">Net savings after fees</span>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-accent-foreground">
                {result.netSavings >= 0 ? "+" : "−"}
                {formatINR(Math.abs(result.netSavings), { compact: true })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Stat label="Current EMI" value={formatINR(result.currentEmi, { decimals: 0 })} />
              <Stat label="New EMI" value={formatINR(result.newEmi, { decimals: 0 })} />
              <Stat
                label="Monthly EMI savings"
                value={formatINR(result.monthlyEmiSavings, { decimals: 0 })}
              />
              <Stat
                label="Breakeven"
                value={result.breakevenMonths !== null ? formatMonthsAsYears(result.breakevenMonths) : "—"}
                helper="time for EMI savings to cover the switching cost"
              />
            </div>

            <div className="border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Stat
                  label="Total interest — stay"
                  value={formatINR(result.totalInterestCurrent, { compact: true })}
                />
                <Stat
                  label="Total interest — refinance"
                  value={formatINR(result.totalInterestNew, { compact: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageShell>
  );
}
