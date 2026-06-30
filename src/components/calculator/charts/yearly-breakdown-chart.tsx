"use client";

import {
  Bar,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCalculator } from "../calculator-context";
import { toYearlySeries } from "@/lib/calculations/chart-data";
import { ChartTooltip } from "./chart-tooltip";
import { formatINR } from "@/lib/calculations/format";

export default function YearlyBreakdownChart() {
  const { schedule } = useCalculator();
  const data = toYearlySeries(schedule.rows);

  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
        <Bar dataKey="principal" name="Principal" stackId="a" fill="var(--color-chart-2)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="interest" name="Interest" stackId="a" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
        <Line
          type="monotone"
          dataKey="closingBalance"
          name="Year-end Balance"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
