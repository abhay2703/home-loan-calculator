"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useCalculator } from "../calculator-context";
import { ChartTooltip } from "./chart-tooltip";

const COLORS = ["var(--color-chart-2)", "var(--color-chart-5)"];

export default function PrincipalInterestPie() {
  const { schedule } = useCalculator();
  const { summary } = schedule;

  const data = [
    { name: "Principal", value: Math.round(summary.totalPrincipal) },
    { name: "Interest", value: Math.round(summary.totalInterest) },
  ];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend verticalAlign="bottom" height={32} />
      </PieChart>
    </ResponsiveContainer>
  );
}
