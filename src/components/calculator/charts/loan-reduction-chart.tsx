"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCalculator } from "../calculator-context";
import { toMonthlySeries } from "@/lib/calculations/chart-data";
import { ChartTooltip } from "./chart-tooltip";
import { formatINR } from "@/lib/calculations/format";

export default function LoanReductionChart() {
  const { schedule } = useCalculator();
  const data = toMonthlySeries(schedule.rows);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          interval={Math.max(Math.floor(data.length / 12), 1)}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatINR(v, { compact: true })}
          width={64}
          className="text-muted-foreground"
        />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="balance"
          name="Outstanding Balance"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
