import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Loan Tax Benefit Calculator — Old vs New Regime",
  description:
    "Estimate income tax savings from your home loan under both the old and new tax regimes — Section 24 interest deduction, 80C principal, and 80EEA first-time buyer benefit.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
