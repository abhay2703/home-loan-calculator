import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Loan Refinance Calculator — Breakeven & Net Savings",
  description:
    "Compare staying on your current home loan vs refinancing to a new rate, including processing, legal, and balance transfer fees, with a clear breakeven point.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
