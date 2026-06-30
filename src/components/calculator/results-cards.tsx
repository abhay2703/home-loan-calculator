"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, Banknote, PiggyBank } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR, formatPercent } from "@/lib/calculations/format";

interface ResultCardConfig {
  label: string;
  value: string;
  helper: string;
  icon: typeof Wallet;
  accent: string;
}

export function ResultsCards() {
  const { schedule } = useCalculator();
  const { summary } = schedule;

  const cards: ResultCardConfig[] = [
    {
      label: "Monthly EMI",
      value: formatINR(summary.initialEmi, { decimals: 0 }),
      helper:
        summary.finalEmi !== summary.initialEmi
          ? `Ends at ${formatINR(summary.finalEmi, { decimals: 0 })}`
          : "Fixed for the loan term",
      icon: Wallet,
      accent: "text-primary",
    },
    {
      label: "Total Interest",
      value: formatINR(summary.totalInterest, { compact: true }),
      helper: formatPercent(summary.interestPercent) + " of total payment",
      icon: TrendingUp,
      accent: "text-chart-5",
    },
    {
      label: "Total Payment",
      value: formatINR(summary.totalPayment, { compact: true }),
      helper: "Principal + interest over the loan term",
      icon: Banknote,
      accent: "text-foreground",
    },
    {
      label: "Principal Share",
      value: formatPercent(summary.principalPercent),
      helper: `Interest share ${formatPercent(summary.interestPercent)}`,
      icon: PiggyBank,
      accent: "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="border-border/60 shadow-sm">
            <CardContent className="flex flex-col gap-1.5 py-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className={`size-4 ${card.accent}`} />
              </div>
              <motion.span
                key={card.value}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-semibold tabular-nums"
              >
                {card.value}
              </motion.span>
              <span className="text-xs text-muted-foreground">{card.helper}</span>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
