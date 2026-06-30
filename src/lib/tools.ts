import type { LucideIcon } from "lucide-react";
import {
  Calculator,
  Landmark,
  Wallet,
  Repeat,
  Home,
  Scale,
  TrendingUp,
  Users,
  GraduationCap,
} from "lucide-react";

export interface ToolConfig {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const TOOLS: ToolConfig[] = [
  {
    href: "/",
    label: "EMI Calculator",
    description: "Core loan calculator with charts, prepayment and amortization",
    icon: Calculator,
  },
  {
    href: "/tax-benefit",
    label: "Tax Benefit Calculator",
    description: "Old vs new regime, Section 24, 80C, first-time buyer benefit",
    icon: Landmark,
  },
  {
    href: "/affordability",
    label: "Affordability Calculator",
    description: "Find the maximum property price you can comfortably afford",
    icon: Wallet,
  },
  {
    href: "/refinance",
    label: "Refinance Calculator",
    description: "Should you switch lenders? Compare costs and find the breakeven",
    icon: Repeat,
  },
  {
    href: "/rent-vs-buy",
    label: "Rent vs Buy",
    description: "Which is financially better given your numbers?",
    icon: Home,
  },
  {
    href: "/emi-vs-cash",
    label: "EMI vs Full Cash",
    description: "Compare net worth: take a loan and invest, or pay cash",
    icon: Scale,
  },
  {
    href: "/opportunity-cost",
    label: "Opportunity Cost Calculator",
    description: "What could your down payment be worth if invested instead?",
    icon: TrendingUp,
  },
  {
    href: "/salary-growth",
    label: "Salary Growth Simulator",
    description: "Project your affordable EMI and prepayment capacity over time",
    icon: Users,
  },
  {
    href: "/compare-loans",
    label: "Compare Loan Offers",
    description: "Put up to 5 bank offers side by side",
    icon: Scale,
  },
  {
    href: "/learn",
    label: "Home Loan Education",
    description: "EMI, prepayment, tax benefits and best practices explained",
    icon: GraduationCap,
  },
];
