"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Download, FileSpreadsheet, FileText, Printer, Search } from "lucide-react";
import { useCalculator } from "./calculator-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatINR } from "@/lib/calculations/format";
import type { AmortizationRow } from "@/lib/calculations/types";
import {
  exportAmortizationToCsv,
  exportAmortizationToExcel,
  exportAmortizationToPdf,
  printAmortizationSchedule,
} from "@/lib/export/amortization-export";

type SortKey = keyof Pick<
  AmortizationRow,
  "period" | "openingBalance" | "emi" | "principal" | "interest" | "closingBalance"
>;

const PAGE_SIZE = 12;

const columns: { key: SortKey; label: string }[] = [
  { key: "period", label: "EMI #" },
  { key: "openingBalance", label: "Opening Balance" },
  { key: "emi", label: "EMI" },
  { key: "principal", label: "Principal" },
  { key: "interest", label: "Interest" },
  { key: "closingBalance", label: "Closing Balance" },
];

export function AmortizationTable() {
  const { schedule } = useCalculator();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("period");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return schedule.rows;
    const q = search.trim().toLowerCase();
    return schedule.rows.filter((row) => {
      const dateLabel = row.date
        .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        .toLowerCase();
      return String(row.period).includes(q) || dateLabel.includes(q);
    });
  }, [schedule.rows, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => (a[sortKey] - b[sortKey]) * (sortAsc ? 1 : -1));
    return copy;
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.max(Math.ceil(sorted.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = sorted.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg">Amortization Schedule</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by EMI # or date"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="h-8 w-56 pl-7"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              <Download className="size-3.5" /> Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportAmortizationToCsv(schedule.rows)}>
                <FileText className="size-3.5" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAmortizationToExcel(schedule.rows)}>
                <FileSpreadsheet className="size-3.5" /> Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAmortizationToPdf(schedule.rows)}>
                <FileText className="size-3.5" /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => printAmortizationSchedule(schedule.rows)}>
                <Printer className="size-3.5" /> Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      {col.label}
                      <ArrowUpDown className="size-3" />
                    </button>
                  </TableHead>
                ))}
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow key={row.period}>
                  <TableCell className="tabular-nums">{row.period}</TableCell>
                  <TableCell className="tabular-nums">{formatINR(row.openingBalance)}</TableCell>
                  <TableCell className="tabular-nums">{formatINR(row.emi)}</TableCell>
                  <TableCell className="tabular-nums text-success">
                    {formatINR(row.principal + row.extraPayment)}
                  </TableCell>
                  <TableCell className="tabular-nums text-chart-5">
                    {formatINR(row.interest)}
                  </TableCell>
                  <TableCell className="tabular-nums">{formatINR(row.closingBalance)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </TableCell>
                </TableRow>
              ))}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No rows match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {pageRows.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}–
            {currentPage * PAGE_SIZE + pageRows.length} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
            >
              Previous
            </Button>
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
