"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Trophy } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { SliderInputField } from "@/components/calculator/slider-input-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { compareLoanOffers, type LoanOffer } from "@/lib/calculations";
import { formatINR } from "@/lib/calculations/format";

const MAX_OFFERS = 5;

function makeOffer(bankName: string, rate: number): LoanOffer {
  return {
    id: crypto.randomUUID(),
    bankName,
    interestRatePercent: rate,
    processingFeeType: "percent",
    processingFeeValue: 0.5,
    otherCharges: 0,
  };
}

export default function CompareLoansPage() {
  const [principal, setPrincipal] = useState(5000000);
  const [tenureYears, setTenureYears] = useState(20);
  const [offers, setOffers] = useState<LoanOffer[]>([
    makeOffer("Bank A", 8.5),
    makeOffer("Bank B", 8.3),
    makeOffer("Bank C", 8.7),
  ]);

  const results = useMemo(
    () => compareLoanOffers(principal, tenureYears * 12, offers),
    [principal, tenureYears, offers]
  );

  function updateOffer(id: string, patch: Partial<LoanOffer>) {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  return (
    <ToolPageShell
      title="Compare Loan Offers"
      description="Put up to 5 bank offers side by side on EMI, total interest, and all-in cost."
    >
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Loan amount & tenure</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SliderInputField
            label="Loan amount"
            value={principal}
            onChange={setPrincipal}
            min={100000}
            max={50000000}
            step={10000}
            prefix="₹"
          />
          <SliderInputField
            label="Tenure"
            value={tenureYears}
            onChange={setTenureYears}
            min={1}
            max={35}
            step={1}
            suffix="yr"
          />
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Offers</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={offers.length >= MAX_OFFERS}
            onClick={() => setOffers((prev) => [...prev, makeOffer(`Bank ${prev.length + 1}`, 8.5)])}
          >
            <Plus className="size-3.5" /> Add offer
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] sm:items-end"
            >
              <div className="flex flex-col gap-1">
                <FieldLabel className="text-xs text-muted-foreground">Bank name</FieldLabel>
                <Input
                  value={offer.bankName}
                  onChange={(e) => updateOffer(offer.id, { bankName: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel className="text-xs text-muted-foreground">Rate %</FieldLabel>
                <Input
                  type="number"
                  step="0.05"
                  value={offer.interestRatePercent}
                  onChange={(e) => updateOffer(offer.id, { interestRatePercent: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel className="text-xs text-muted-foreground">Fee type</FieldLabel>
                <Select
                  value={offer.processingFeeType}
                  onValueChange={(v) => updateOffer(offer.id, { processingFeeType: v as "percent" | "flat" })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">% of loan</SelectItem>
                    <SelectItem value="flat">Flat ₹</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel className="text-xs text-muted-foreground">Fee value</FieldLabel>
                <Input
                  type="number"
                  value={offer.processingFeeValue}
                  onChange={(e) => updateOffer(offer.id, { processingFeeValue: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel className="text-xs text-muted-foreground">Other charges ₹</FieldLabel>
                <Input
                  type="number"
                  value={offer.otherCharges}
                  onChange={(e) => updateOffer(offer.id, { otherCharges: Number(e.target.value) })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={offers.length <= 1}
                onClick={() => setOffers((prev) => prev.filter((o) => o.id !== offer.id))}
                aria-label="Remove offer"
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank</TableHead>
                  <TableHead>EMI</TableHead>
                  <TableHead>Total interest</TableHead>
                  <TableHead>Processing fee</TableHead>
                  <TableHead>Total cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.id} className={r.isBest ? "bg-success/10" : undefined}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-1.5">
                        {r.isBest && <Trophy className="size-3.5 text-success" />}
                        {r.bankName}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums">{formatINR(r.emi, { decimals: 0 })}</TableCell>
                    <TableCell className="tabular-nums">{formatINR(r.totalInterest, { compact: true })}</TableCell>
                    <TableCell className="tabular-nums">{formatINR(r.processingFee, { decimals: 0 })}</TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {formatINR(r.totalCost, { compact: true })}
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
