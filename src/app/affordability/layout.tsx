import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affordability Calculator — Maximum Property Price",
  description:
    "Find the maximum home loan EMI and property price you can comfortably afford based on your income, existing EMIs, and expenses.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
