import { SiteHeader } from "@/components/site-header";
import { CalculatorProvider } from "@/components/calculator/calculator-context";
import { LoanInputForm } from "@/components/calculator/loan-input-form";
import { ResultsCards } from "@/components/calculator/results-cards";
import { ChartsSection } from "@/components/calculator/charts/charts-section";
import { PrepaymentSimulator } from "@/components/calculator/prepayment-simulator";
import { FloatingRateSimulator } from "@/components/calculator/floating-rate-simulator";
import { AmortizationTable } from "@/components/calculator/amortization-table";
import { AdvancedInsights } from "@/components/calculator/advanced-insights";
import { EmiIncreaseCalculator } from "@/components/calculator/emi-increase-calculator";
import { GoalBasedCalculator } from "@/components/calculator/goal-based-calculator";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Advanced Home Loan Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Plan your EMI, visualize amortization, and simulate prepayments — all
            calculated instantly in your browser.
          </p>
        </div>

        <CalculatorProvider>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-1">
              <LoanInputForm />
              <FloatingRateSimulator />
              <PrepaymentSimulator />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-2">
              <ResultsCards />
              <ChartsSection />
              <AdvancedInsights />
              <AmortizationTable />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <EmiIncreaseCalculator />
            <GoalBasedCalculator />
          </div>
        </CalculatorProvider>
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Built for Indian home loan borrowers. All calculations run locally in your browser — no data leaves your device.
      </footer>
    </div>
  );
}
