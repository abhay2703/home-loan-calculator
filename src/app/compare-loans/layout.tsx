import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Home Loan Offers — Up to 5 Banks Side by Side",
  description:
    "Compare EMI, total interest, processing fees, and total cost across up to 5 bank loan offers, with the best option automatically highlighted.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
