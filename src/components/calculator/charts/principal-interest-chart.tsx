"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCalculator } from "../calculator-context";
import { toMonthlySeries } from "@/lib/calculations/chart-data";
import { ChartTooltip } from "./chart-tooltip";
import { formatINR } from "@/lib/calculations/format";

export default function PrincipalInterestChart() {
  const { schedule } = useCalculator();
  const data = toMonthlySeries(schedule.rows);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
        <Area
          type="monotone"
          dataKey="principal"
          name="Principal"
          stackId="1"
          stroke="var(--color-chart-2)"
          fill="var(--color-chart-2)"
          fillOpacity={0.5}
        />
        <Area
          type="monotone"
          dataKey="interest"
          name="Interest"
          stackId="1"
          stroke="var(--color-chart-5)"
          fill="var(--color-chart-5)"
          fillOpacity={0.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
