"use client";

import { useMemo, useState } from "react";
import { Info, Landmark } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { SliderInputField } from "@/components/calculator/slider-input-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { FieldLabel } from "@/components/ui/field";
import { Stat } from "@/components/stat";
import { calculateTaxBenefit, type TaxRegime } from "@/lib/calculations";
import { formatINR } from "@/lib/calculations/format";

export default function TaxBenefitPage() {
  const [regime, setRegime] = useState<TaxRegime>("old");
  const [annualIncome, setAnnualIncome] = useState(1800000);
  const [homeLoanInterestPaid, setHomeLoanInterestPaid] = useState(350000);
  const [homeLoanPrincipalPaid, setHomeLoanPrincipalPaid] = useState(150000);
  const [other80CInvestments, setOther80CInvestments] = useState(50000);
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false);
  const [isSelfOccupied, setIsSelfOccupied] = useState(true);

  const result = useMemo(
    () =>
      calculateTaxBenefit({
        annualIncome,
        regime,
        homeLoanInterestPaid,
        homeLoanPrincipalPaid,
        other80CInvestments,
        isFirstTimeBuyer,
        isSelfOccupied,
      }),
    [annualIncome, regime, homeLoanInterestPaid, homeLoanPrincipalPaid, other80CInvestments, isFirstTimeBuyer, isSelfOccupied]
  );

  return (
    <ToolPageShell
      title="Tax Benefit Calculator"
      description="Estimate how much your home loan reduces your income tax bill, under either regime."
    >
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Uses FY2025-26 slabs as a planning estimate — tax rules change most years and this isn&apos;t
          a substitute for advice from a CA. Section 80EEA eligibility has its own conditions
          (stamp value, sanction window) not modeled here.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Your income & loan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Tabs value={regime} onValueChange={(v) => setRegime(v as TaxRegime)}>
              <TabsList className="w-full">
                <TabsTrigger value="old" className="flex-1">
                  Old regime
                </TabsTrigger>
                <TabsTrigger value="new" className="flex-1">
                  New regime
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <SliderInputField
              label="Annual income"
              value={annualIncome}
              onChange={setAnnualIncome}
              min={300000}
              max={10000000}
              step={10000}
              prefix="₹"
            />
            <SliderInputField
              label="Home loan interest paid this year"
              value={homeLoanInterestPaid}
              onChange={setHomeLoanInterestPaid}
              min={0}
              max={2000000}
              step={5000}
              prefix="₹"
            />
            <SliderInputField
              label="Home loan principal paid this year"
              value={homeLoanPrincipalPaid}
              onChange={setHomeLoanPrincipalPaid}
              min={0}
              max={1000000}
              step={5000}
              prefix="₹"
              disabled={regime === "new"}
            />
            <SliderInputField
              label="Other 80C investments"
              value={other80CInvestments}
              onChange={setOther80CInvestments}
              min={0}
              max={500000}
              step={5000}
              prefix="₹"
              tooltip="PF, ELSS, life insurance premiums, etc. — shares the same ₹1.5L cap as the principal repayment."
              disabled={regime === "new"}
            />

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <FieldLabel className="text-sm font-medium">Self-occupied property</FieldLabel>
              <Switch checked={isSelfOccupied} onCheckedChange={setIsSelfOccupied} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <FieldLabel className="text-sm font-medium">First-time buyer (80EEA)</FieldLabel>
              <Switch
                checked={isFirstTimeBuyer}
                onCheckedChange={setIsFirstTimeBuyer}
                disabled={regime === "new"}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tax impact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="rounded-lg bg-accent p-4">
              <div className="mb-1 flex items-center gap-2 text-accent-foreground">
                <Landmark className="size-4" />
                <span className="text-sm font-semibold">Tax saved from your home loan</span>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-accent-foreground">
                {formatINR(result.taxSavedFromHomeLoan, { decimals: 0 })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">per year</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Stat label="Section 24 deduction" value={formatINR(result.section24Deduction, { decimals: 0 })} />
              <Stat label="Section 80C deduction" value={formatINR(result.section80CDeduction, { decimals: 0 })} />
              <Stat label="Section 80EEA deduction" value={formatINR(result.section80EEADeduction, { decimals: 0 })} />
              <Stat label="Standard deduction" value={formatINR(result.standardDeduction, { decimals: 0 })} />
            </div>

            <div className="border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Taxable income" value={formatINR(result.taxableIncome, { compact: true })} />
                <Stat
                  label="Tax payable"
                  value={formatINR(result.taxPayable, { decimals: 0 })}
                  helper={`vs ${formatINR(result.taxWithoutHomeLoan, { decimals: 0 })} without the loan`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageShell>
  );
}
