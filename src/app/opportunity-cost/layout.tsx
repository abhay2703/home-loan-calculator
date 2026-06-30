import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opportunity Cost Calculator — Invest vs. Prepay",
  description:
    "Compare investing a lump sum at your expected return rate against using it to pay down your home loan, and see which choice actually leaves you wealthier.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
