"use client";

import { useState } from "react";
import { Save, Trash2, Upload, Layers } from "lucide-react";
import { toast } from "sonner";
import { useCalculator, derivePrincipal, toScheduleParams } from "./calculator-context";
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
import { buildAmortizationSchedule } from "@/lib/calculations";
import { formatINR, formatMonthsAsYears } from "@/lib/calculations/format";
import { deleteScenario, listScenarios, saveScenario, type SavedScenario } from "@/lib/scenarios";

export function ScenarioManager() {
  const { form, values } = useCalculator();
  const [scenarios, setScenarios] = useState<SavedScenario[]>(() => listScenarios());
  const [scenarioName, setScenarioName] = useState("");

  function refresh() {
    setScenarios(listScenarios());
  }

  function handleSave() {
    const name = scenarioName.trim();
    if (!name) return;
    saveScenario(name, values);
    setScenarioName("");
    refresh();
    toast.success(`Saved scenario "${name}"`);
  }

  function handleLoad(scenario: SavedScenario) {
    form.reset(scenario.values);
    toast.success(`Loaded scenario "${scenario.name}"`);
  }

  function handleDelete(name: string) {
    deleteScenario(name);
    refresh();
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="size-4" /> Saved Scenarios
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Scenario name (e.g. Scenario A)"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <Button type="button" variant="outline" onClick={handleSave} disabled={!scenarioName.trim()}>
            <Save className="size-3.5" /> Save current
          </Button>
        </div>

        {scenarios.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No saved scenarios yet. Save your current setup to compare it against other loan
            options later — everything stays on this device.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>EMI</TableHead>
                  <TableHead>Total interest</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarios.map((scenario) => {
                  const principal = derivePrincipal(scenario.values);
                  const result =
                    principal > 0
                      ? buildAmortizationSchedule(toScheduleParams(scenario.values, principal, true))
                      : null;
                  return (
                    <TableRow key={scenario.name}>
                      <TableCell className="font-medium">{scenario.name}</TableCell>
                      <TableCell className="tabular-nums">
                        {result ? formatINR(result.summary.initialEmi, { decimals: 0 }) : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {result ? formatINR(result.summary.totalInterest, { compact: true }) : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {result ? formatMonthsAsYears(result.summary.actualTenureMonths) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleLoad(scenario)}
                            aria-label={`Load ${scenario.name}`}
                          >
                            <Upload className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(scenario.name)}
                            aria-label={`Delete ${scenario.name}`}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
