"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { SliderInputField } from "@/components/calculator/slider-input-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/stat";
import { calculateOpportunityCost } from "@/lib/calculations";
import { formatINR } from "@/lib/calculations/format";

export default function OpportunityCostPage() {
  const [amount, setAmount] = useState(1000000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [investmentReturn, setInvestmentReturn] = useState(12);
  const [years, setYears] = useState(20);

  const result = useMemo(
    () =>
      calculateOpportunityCost({
        amount,
        loanRatePercent: loanRate,
        investmentReturnPercent: investmentReturn,
        years,
      }),
    [amount, loanRate, investmentReturn, years]
  );

  const badgeLabel =
    result.recommendation === "invest"
      ? "Investing wins"
      : result.recommendation === "prepay"
        ? "Prepaying wins"
        : "Roughly a wash";

  return (
    <ToolPageShell
      title="Opportunity Cost Calculator"
      description="If you invested this money instead of paying down your loan, what would it be worth — and which choice actually leaves you wealthier?"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SliderInputField
              label="Lump sum amount"
              value={amount}
              onChange={setAmount}
              min={50000}
              max={20000000}
              step={10000}
              prefix="₹"
            />
            <SliderInputField
              label="Loan interest rate"
              value={loanRate}
              onChange={setLoanRate}
              min={1}
              max={20}
              step={0.1}
              suffix="%"
              tooltip="The cost of carrying this amount as debt instead of paying it down."
            />
            <SliderInputField
              label="Expected investment return"
              value={investmentReturn}
              onChange={setInvestmentReturn}
              min={1}
              max={25}
              step={0.5}
              suffix="%"
            />
            <SliderInputField
              label="Time horizon"
              value={years}
              onChange={setYears}
              min={1}
              max={30}
              step={1}
              suffix="yr"
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Result</CardTitle>
            <Badge variant={result.recommendation === "prepay" ? "destructive" : "default"}>
              {badgeLabel}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="rounded-lg bg-accent p-4">
              <div className="mb-2 flex items-center gap-2 text-accent-foreground">
                <TrendingUp className="size-4" />
                <span className="text-sm font-semibold">
                  {formatINR(amount)} grows to {formatINR(result.futureValueIfInvested, { compact: true })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                if invested at {investmentReturn}% for {years} years
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Stat label="Investment gain" value={formatINR(result.investmentGain, { compact: true })} />
              <Stat
                label="Cost of carrying as debt"
                value={formatINR(result.debtCostIfCarried, { compact: true })}
                helper={`at ${loanRate}% over ${years} yr`}
              />
            </div>

            <div className="border-t border-border pt-4">
              <Stat
                label="Net advantage of investing"
                value={`${result.netAdvantage >= 0 ? "+" : "−"}${formatINR(Math.abs(result.netAdvantage), { compact: true })}`}
                className={result.netAdvantage >= 0 ? "text-success" : "text-destructive"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageShell>
  );
}
