"use client";

import { useMemo } from "react";
import { Milestone } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findCrossoverMonth } from "@/lib/calculations/chart-data";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function TimelineVisualization() {
  const { schedule } = useCalculator();
  const { rows } = schedule;

  const milestones = useMemo(() => {
    if (rows.length === 0) return null;
    const crossoverMonth = findCrossoverMonth(rows);
    const startDate = rows[0].date;
    const completionDate = rows[rows.length - 1].date;
    const crossoverDate = crossoverMonth ? rows[crossoverMonth - 1].date : null;
    const interestHeavyShare = crossoverMonth ? (crossoverMonth / rows.length) * 100 : 100;
    return { startDate, completionDate, crossoverDate, interestHeavyShare };
  }, [rows]);

  if (!milestones) return null;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Milestone className="size-4" /> Loan Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-chart-5"
            style={{ width: `${milestones.interestHeavyShare}%` }}
            title="Interest-heavy phase"
          />
          <div
            className="h-full bg-chart-2"
            style={{ width: `${100 - milestones.interestHeavyShare}%` }}
            title="Principal-heavy phase"
          />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-medium text-foreground">Start</span>
            <span>{formatDate(milestones.startDate)}</span>
          </div>
          {milestones.crossoverDate && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-medium text-foreground">Balanced point</span>
              <span>{formatDate(milestones.crossoverDate)}</span>
              <span>principal overtakes interest</span>
            </div>
          )}
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-medium text-foreground">Loan Completion</span>
            <span>{formatDate(milestones.completionDate)}</span>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-5" /> Interest-heavy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-2" /> Principal-heavy
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
