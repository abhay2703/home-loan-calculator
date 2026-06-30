"use client";

import { useMemo } from "react";
import { CalendarRange } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toYearlySeries } from "@/lib/calculations/chart-data";
import { formatINR } from "@/lib/calculations/format";
import type { AmortizationRow } from "@/lib/calculations/types";

export function AmortizationTimeline() {
  const { schedule } = useCalculator();
  const yearly = useMemo(() => toYearlySeries(schedule.rows), [schedule.rows]);

  const rowsByYear = useMemo(() => {
    const map = new Map<number, AmortizationRow[]>();
    for (const row of schedule.rows) {
      const year = Math.ceil(row.period / 12);
      const existing = map.get(year);
      if (existing) existing.push(row);
      else map.set(year, [row]);
    }
    return map;
  }, [schedule.rows]);

  if (yearly.length === 0) return null;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarRange className="size-4" /> Amortization Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion>
          {yearly.map((year) => (
            <AccordionItem key={year.year} value={String(year.year)}>
              <AccordionTrigger>
                <div className="flex w-full flex-wrap items-center justify-between gap-2 pr-4">
                  <span>Year {year.year}</span>
                  <span className="flex gap-4 text-xs text-muted-foreground">
                    <span>Principal {formatINR(year.principal, { compact: true })}</span>
                    <span>Interest {formatINR(year.interest, { compact: true })}</span>
                    <span>Balance {formatINR(year.closingBalance, { compact: true })}</span>
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {(rowsByYear.get(year.year) ?? []).map((row) => (
                    <div
                      key={row.period}
                      className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-xs"
                    >
                      <span className="text-muted-foreground">
                        {row.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </span>
                      <span className="tabular-nums">{formatINR(row.emi, { decimals: 0 })}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
