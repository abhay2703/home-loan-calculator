import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salary Growth Simulator — Future Prepayment Capacity",
  description:
    "Project how your affordable EMI and prepayment capacity grow over time as your income rises, based on your expected annual salary growth.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
