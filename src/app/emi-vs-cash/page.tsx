"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Scale } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { SliderInputField } from "@/components/calculator/slider-input-field";
import { ChartTooltip } from "@/components/calculator/charts/chart-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compareEmiVsCash } from "@/lib/calculations";
import { formatINR } from "@/lib/calculations/format";

const HORIZONS = [5, 10, 15, 20, 30];

export default function EmiVsCashPage() {
  const [propertyPrice, setPropertyPrice] = useState(6000000);
  const [downPayment, setDownPayment] = useState(1000000);
  const [annualRate, setAnnualRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [investmentReturn, setInvestmentReturn] = useState(12);

  const results = useMemo(
    () =>
      compareEmiVsCash({
        propertyPrice,
        downPayment,
        annualRatePercent: annualRate,
        tenureMonths: tenureYears * 12,
        investmentReturnPercent: investmentReturn,
        horizonYears: HORIZONS,
      }),
    [propertyPrice, downPayment, annualRate, tenureYears, investmentReturn]
  );

  const chartData = results.map((r) => ({
    label: `${r.year} yr`,
    "Loan + Invest": Math.round(r.loanScenarioNetWorth),
    "Cash + SIP": Math.round(r.cashScenarioNetWorth),
  }));

  const finalResult = results[results.length - 1];

  return (
    <ToolPageShell
      title="EMI vs Full Cash Purchase"
      description="Take a loan and invest what you'd otherwise spend up front, or pay cash and invest the EMI every month — which leaves you wealthier?"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SliderInputField
              label="Property price"
              value={propertyPrice}
              onChange={setPropertyPrice}
              min={500000}
              max={50000000}
              step={50000}
              prefix="₹"
            />
            <SliderInputField
              label="Down payment (loan scenario)"
              value={downPayment}
              onChange={setDownPayment}
              min={0}
              max={propertyPrice}
              step={50000}
              prefix="₹"
              tooltip="In the loan scenario, the rest of the price (what you'd otherwise have paid in cash) is invested as a lump sum instead."
            />
            <SliderInputField
              label="Loan interest rate"
              value={annualRate}
              onChange={setAnnualRate}
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
              label="Investment return"
              value={investmentReturn}
              onChange={setInvestmentReturn}
              min={1}
              max={25}
              step={0.5}
              suffix="%"
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Net worth by year</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {finalResult && (
              <div className="flex items-center gap-2 rounded-lg bg-accent p-4 text-accent-foreground">
                <Scale className="size-4" />
                <span className="text-sm font-semibold">
                  At {finalResult.year} years,{" "}
                  {finalResult.advantage === "neutral"
                    ? "both paths land in roughly the same place"
                    : finalResult.advantage === "loan"
                      ? "taking the loan and investing wins"
                      : "paying cash and investing the EMI wins"}
                  {finalResult.advantage !== "neutral" &&
                    ` by ${formatINR(Math.abs(finalResult.difference), { compact: true })}`}
                </span>
              </div>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => formatINR(v, { compact: true })}
                  width={64}
                  className="text-muted-foreground"
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="Loan + Invest" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cash + SIP" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </ToolPageShell>
  );
}
