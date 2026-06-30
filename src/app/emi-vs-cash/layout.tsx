import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EMI vs Full Cash Purchase — Net Worth Comparison",
  description:
    "Compare net worth over 5, 10, 15, 20, and 30 years between taking a home loan and investing your cash, vs. paying cash outright and investing the EMI instead.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
