import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent vs Buy Calculator — Which Builds More Net Worth?",
  description:
    "A year-by-year net worth comparison between renting and investing the difference, vs. buying a home with a loan — based on your rent, appreciation, and investment return assumptions.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
