import type { LoanInputValues } from "@/lib/calculations/schema";

const STORAGE_KEY = "home-loan-calculator:scenarios";

export interface SavedScenario {
  name: string;
  savedAt: string;
  values: LoanInputValues;
}

function readAll(): SavedScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedScenario[];
    return parsed.map((s) => ({
      ...s,
      values: { ...s.values, startDate: new Date(s.values.startDate) },
    }));
  } catch {
    return [];
  }
}

function writeAll(scenarios: SavedScenario[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

export function listScenarios(): SavedScenario[] {
  return readAll().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveScenario(name: string, values: LoanInputValues) {
  const scenarios = readAll().filter((s) => s.name !== name);
  scenarios.push({ name, savedAt: new Date().toISOString(), values });
  writeAll(scenarios);
}

export function deleteScenario(name: string) {
  writeAll(readAll().filter((s) => s.name !== name));
}
