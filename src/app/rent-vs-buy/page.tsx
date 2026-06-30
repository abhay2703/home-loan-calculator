"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Home } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { SliderInputField } from "@/components/calculator/slider-input-field";
import { ChartTooltip } from "@/components/calculator/charts/chart-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { compareRentVsBuy } from "@/lib/calculations";
import { formatINR } from "@/lib/calculations/format";

export default function RentVsBuyPage() {
  const [housePrice, setHousePrice] = useState(6000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [rentGrowth, setRentGrowth] = useState(5);
  const [maintenancePercent, setMaintenancePercent] = useState(1);
  const [appreciation, setAppreciation] = useState(6);
  const [investmentReturn, setInvestmentReturn] = useState(10);
  const [stampDuty, setStampDuty] = useState(6);
  const [horizonYears, setHorizonYears] = useState(15);

  const result = useMemo(
    () =>
      compareRentVsBuy({
        housePrice,
        downPaymentPercent,
        loanRatePercent: loanRate,
        loanTenureYears,
        monthlyRent,
        rentGrowthPercent: rentGrowth,
        maintenancePercent,
        propertyAppreciationPercent: appreciation,
        investmentReturnPercent: investmentReturn,
        stampDutyPercent: stampDuty,
        horizonYears,
      }),
    [
      housePrice,
      downPaymentPercent,
      loanRate,
      loanTenureYears,
      monthlyRent,
      rentGrowth,
      maintenancePercent,
      appreciation,
      investmentReturn,
      stampDuty,
      horizonYears,
    ]
  );

  const chartData = result.timeline.map((p) => ({
    label: `Yr ${p.year}`,
    Buy: Math.round(p.buyNetWorth),
    Rent: Math.round(p.rentNetWorth),
  }));

  const badgeLabel =
    result.recommendation === "buy" ? "Buying wins" : result.recommendation === "rent" ? "Renting wins" : "Roughly a wash";

  return (
    <ToolPageShell
      title="Rent vs Buy Calculator"
      description="Compares net worth under both paths — equity and appreciation for buying, invested savings for renting — over your chosen horizon."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SliderInputField
              label="House price"
              value={housePrice}
              onChange={setHousePrice}
              min={500000}
              max={50000000}
              step={50000}
              prefix="₹"
            />
            <SliderInputField
              label="Down payment"
              value={downPaymentPercent}
              onChange={setDownPaymentPercent}
              min={5}
              max={100}
              step={1}
              suffix="%"
            />
            <SliderInputField
              label="Loan interest rate"
              value={loanRate}
              onChange={setLoanRate}
              min={1}
              max={20}
              step={0.1}
              suffix="%"
            />
            <SliderInputField
              label="Loan tenure"
              value={loanTenureYears}
              onChange={setLoanTenureYears}
              min={1}
              max={35}
              step={1}
              suffix="yr"
            />
            <SliderInputField
              label="Monthly rent (equivalent home)"
              value={monthlyRent}
              onChange={setMonthlyRent}
              min={1000}
              max={500000}
              step={1000}
              prefix="₹"
            />
            <SliderInputField
              label="Annual rent growth"
              value={rentGrowth}
              onChange={setRentGrowth}
              min={0}
              max={15}
              step={0.5}
              suffix="%"
            />
            <SliderInputField
              label="Annual maintenance"
              value={maintenancePercent}
              onChange={setMaintenancePercent}
              min={0}
              max={5}
              step={0.1}
              suffix="%"
              tooltip="As a % of current house value, per year."
            />
            <SliderInputField
              label="Property appreciation"
              value={appreciation}
              onChange={setAppreciation}
              min={0}
              max={20}
              step={0.5}
              suffix="%"
            />
            <SliderInputField
              label="Investment return"
              value={investmentReturn}
              onChange={setInvestmentReturn}
              min={0}
              max={25}
              step={0.5}
              suffix="%"
              tooltip="Return the renter earns investing the down payment and any monthly savings."
            />
            <SliderInputField
              label="Stamp duty & registration"
              value={stampDuty}
              onChange={setStampDuty}
              min={0}
              max={15}
              step={0.5}
              suffix="%"
            />
            <SliderInputField
              label="Comparison horizon"
              value={horizonYears}
              onChange={setHorizonYears}
              min={1}
              max={30}
              step={1}
              suffix="yr"
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Net worth comparison</CardTitle>
            <Badge variant={result.recommendation === "rent" ? "secondary" : "default"}>{badgeLabel}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-accent p-4 text-accent-foreground">
              <Home className="size-4" />
              <span className="text-sm font-semibold">
                At year {horizonYears}, the difference is{" "}
                {formatINR(Math.abs(result.finalDifference), { compact: true })}
                {result.recommendation !== "neutral" ? ` in favor of ${result.recommendation}ing` : ""}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => formatINR(v, { compact: true })}
                  width={64}
                  className="text-muted-foreground"
                />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="Buy" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Rent" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </ToolPageShell>
  );
}
