import Link from "next/link";
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
import { FinancialHealthScore } from "@/components/calculator/financial-health-score";
import { SmartSuggestions } from "@/components/calculator/smart-suggestions";
import { TimelineVisualization } from "@/components/calculator/timeline-visualization";
import { AmortizationTimeline } from "@/components/calculator/amortization-timeline";
import { SavingsDashboard } from "@/components/calculator/savings-dashboard";
import { ScenarioManager } from "@/components/calculator/scenario-manager";
import { ShareActions } from "@/components/calculator/share-actions";
import { Card, CardContent } from "@/components/ui/card";
import { TOOLS } from "@/lib/tools";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Advanced Home Loan Calculator",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  description:
    "A premium, fully client-side home loan calculator for Indian borrowers — EMI, amortization charts, prepayment simulation, refinance and tax-benefit analysis.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
              <ScenarioManager />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-2">
              <ResultsCards />
              <SavingsDashboard />
              <ChartsSection />
              <TimelineVisualization />
              <AdvancedInsights />
              <FinancialHealthScore />
              <SmartSuggestions />
              <AmortizationTable />
              <AmortizationTimeline />
              <ShareActions />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <EmiIncreaseCalculator />
            <GoalBasedCalculator />
          </div>
        </CalculatorProvider>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">More tools</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.filter((tool) => tool.href !== "/").map((tool) => (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full border-border/60 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/40">
                  <CardContent className="flex flex-col gap-2 py-1">
                    <tool.icon className="size-5 text-primary" />
                    <span className="text-sm font-medium">{tool.label}</span>
                    <span className="text-xs text-muted-foreground">{tool.description}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Built for Indian home loan borrowers. All calculations run locally in your browser — no data leaves your device.
      </footer>
    </div>
  );
}
