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
import { ToolPageShell } from "@/components/tool-page-shell";
import { SliderInputField } from "@/components/calculator/slider-input-field";
import { ChartTooltip } from "@/components/calculator/charts/chart-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { projectSalaryGrowth } from "@/lib/calculations";
import { formatINR } from "@/lib/calculations/format";

export default function SalaryGrowthPage() {
  const [currentMonthlyIncome, setCurrentMonthlyIncome] = useState(150000);
  const [annualGrowthPercent, setAnnualGrowthPercent] = useState(8);
  const [years, setYears] = useState(15);
  const [foirPercent, setFoirPercent] = useState(50);
  const [existingEmis, setExistingEmis] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(40000);
  const [currentLoanEmi, setCurrentLoanEmi] = useState(43391);

  const projections = useMemo(
    () =>
      projectSalaryGrowth({
        currentMonthlyIncome,
        annualGrowthPercent,
        years,
        foirPercent,
        existingEmis,
        monthlyExpenses,
        currentLoanEmi,
      }),
    [currentMonthlyIncome, annualGrowthPercent, years, foirPercent, existingEmis, monthlyExpenses, currentLoanEmi]
  );

  const chartData = projections.map((p) => ({
    label: `Yr ${p.year}`,
    income: Math.round(p.projectedMonthlyIncome),
    prepaymentCapacity: Math.round(p.prepaymentCapacity),
  }));

  const firstCapableYear = projections.find((p) => p.prepaymentCapacity > 0)?.year;

  return (
    <ToolPageShell
      title="Salary Growth Simulator"
      description="As your income grows, here's how much extra you could put toward prepaying your loan, year by year."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SliderInputField
              label="Current monthly income"
              value={currentMonthlyIncome}
              onChange={setCurrentMonthlyIncome}
              min={20000}
              max={2000000}
              step={5000}
              prefix="₹"
            />
            <SliderInputField
              label="Annual income growth"
              value={annualGrowthPercent}
              onChange={setAnnualGrowthPercent}
              min={0}
              max={25}
              step={0.5}
              suffix="%"
            />
            <SliderInputField
              label="Current loan EMI"
              value={currentLoanEmi}
              onChange={setCurrentLoanEmi}
              min={0}
              max={1000000}
              step={1000}
              prefix="₹"
            />
            <SliderInputField
              label="Existing other EMIs"
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
              label="Lender's FOIR cap"
              value={foirPercent}
              onChange={setFoirPercent}
              min={30}
              max={65}
              step={1}
              suffix="%"
            />
            <SliderInputField
              label="Projection horizon"
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
          <CardHeader>
            <CardTitle className="text-lg">Prepayment capacity over time</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {firstCapableYear ? (
              <div className="rounded-lg bg-accent p-4 text-sm text-accent-foreground">
                You could start prepaying from <strong>year {firstCapableYear}</strong>, as your
                income outgrows your current EMI within the FOIR limit.
              </div>
            ) : (
              <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
                At this growth rate, your EMI stays within budget the whole horizon but doesn&apos;t
                free up extra prepayment capacity — try a higher growth rate or longer horizon.
              </div>
            )}
            <ResponsiveContainer width="100%" height={280}>
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
                <Line
                  type="monotone"
                  dataKey="prepaymentCapacity"
                  name="Prepayment Capacity"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Projected Income"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Year-by-year detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Projected income</TableHead>
                  <TableHead>Max affordable EMI</TableHead>
                  <TableHead>Prepayment capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projections.map((p) => (
                  <TableRow key={p.year}>
                    <TableCell>{p.year}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatINR(p.projectedMonthlyIncome, { decimals: 0 })}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatINR(p.maxAffordableEmi, { decimals: 0 })}
                    </TableCell>
                    <TableCell className="tabular-nums text-success">
                      {formatINR(p.prepaymentCapacity, { decimals: 0 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </ToolPageShell>
  );
}
