import type { Metadata } from "next";
import { ToolPageShell } from "@/components/tool-page-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Home Loan Education — EMI, Prepayment, Tax Benefits Explained",
  description:
    "Plain-language explainers on EMI, reducing balance, fixed vs floating rates, prepayment, common loan myths, tax benefits, and best practices for Indian home loan borrowers.",
};

const SECTIONS = [
  {
    id: "what-is-emi",
    title: "What is an EMI?",
    body: (
      <>
        <p>
          An EMI (Equated Monthly Installment) is the fixed amount you pay your lender every
          month until the loan is fully repaid. Each EMI is split into two parts: the{" "}
          <strong>interest</strong> charged on what you currently owe, and the{" "}
          <strong>principal</strong> — the portion that actually reduces your outstanding balance.
        </p>
        <p>
          The EMI itself stays constant for a fixed-rate loan, but the split between interest and
          principal shifts every month as your balance shrinks.
        </p>
      </>
    ),
  },
  {
    id: "reducing-balance",
    title: "How does the reducing balance method work?",
    body: (
      <>
        <p>
          Indian home loans use the reducing (or diminishing) balance method: interest is charged
          only on the balance you still owe, not on the original loan amount. Early in the loan,
          your balance is highest, so most of each EMI goes toward interest. As the balance drops,
          a growing share of each EMI goes toward principal.
        </p>
        <p>
          This is why the Loan Reduction and Principal vs Interest charts on the calculator curve
          the way they do — interest dominates early, then principal takes over.
        </p>
      </>
    ),
  },
  {
    id: "fixed-vs-floating",
    title: "Fixed vs floating interest rates",
    body: (
      <>
        <p>
          A <strong>fixed</strong> rate stays the same for the loan&apos;s term (or a defined
          period), giving predictable EMIs but usually starting higher than a floating rate.
        </p>
        <p>
          A <strong>floating</strong> rate moves with the lender&apos;s benchmark (repo-linked
          rates in India). Your EMI or tenure adjusts when the rate changes — most lenders
          recalculate tenure first and only raise the EMI once tenure extension hits a cap. Use
          the Floating Interest Rate Simulator on the main calculator to see how rate changes at
          specific years would play out.
        </p>
      </>
    ),
  },
  {
    id: "why-prepayment-helps",
    title: "Why does early prepayment help so much?",
    body: (
      <>
        <p>
          Because interest is charged on the outstanding balance, any extra payment made early in
          the loan removes that amount from the balance for the <em>entire remaining tenure</em> —
          so it avoids years of future interest, not just one month&apos;s worth.
        </p>
        <p>
          A prepayment made in year 2 saves far more interest than the same amount paid in year
          15, simply because it has more remaining tenure to compound savings over. This is why
          the Prepayment Simulator and Goal-Based Calculator both emphasize starting early.
        </p>
      </>
    ),
  },
  {
    id: "loan-myths",
    title: "Common home loan myths",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>&ldquo;A longer tenure means I pay less.&rdquo;</strong> A longer tenure lowers
          your EMI but increases total interest paid — often dramatically.
        </li>
        <li>
          <strong>&ldquo;Prepayment penalties make extra payments pointless.&rdquo;</strong> Most
          Indian banks no longer charge prepayment penalties on floating-rate loans (RBI
          guidelines prohibit it for individual borrowers). Always confirm with your specific
          lender and loan type.
        </li>
        <li>
          <strong>&ldquo;The lowest advertised rate is always the best deal.&rdquo;</strong>{" "}
          Processing fees, legal charges, and the rate reset frequency all affect the real cost —
          compare total cost, not just the headline rate.
        </li>
        <li>
          <strong>&ldquo;Paying off my home loan should always be the priority.&rdquo;</strong> If
          your loan rate is well below what you could reasonably earn investing instead, prepaying
          aggressively isn&apos;t automatically optimal — see the Opportunity Cost Calculator.
        </li>
      </ul>
    ),
  },
  {
    id: "tax-benefits",
    title: "Tax benefits, in brief",
    body: (
      <>
        <p>
          Under the old tax regime, home loan interest is deductible under{" "}
          <strong>Section 24(b)</strong> (up to ₹2,00,000/year for a self-occupied property) and
          principal repayment qualifies under <strong>Section 80C</strong> (up to ₹1,50,000/year,
          shared with other 80C investments). First-time buyers may get an additional deduction
          under <strong>Section 80EEA</strong>, subject to conditions.
        </p>
        <p>
          The new tax regime drops most of these deductions for self-occupied property. Use the
          Tax Benefit Calculator to see which regime saves you more given your actual numbers —
          tax rules change most years, so treat this as a planning estimate, not filing advice.
        </p>
      </>
    ),
  },
  {
    id: "best-practices",
    title: "Best practices for home loan borrowers",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Keep your EMI comfortably under 40-50% of your monthly income.</li>
        <li>Put down as large a down payment as you reasonably can — it directly cuts interest.</li>
        <li>Compare at least 3-4 lenders on total cost, not just the interest rate.</li>
        <li>
          Even a small recurring prepayment (one extra EMI a year, or a fixed monthly top-up)
          compounds into large interest savings over a long tenure.
        </li>
        <li>
          Revisit your rate periodically — refinancing can make sense if rates have dropped
          meaningfully since you took the loan, once switching costs are accounted for.
        </li>
        <li>Keep an emergency fund separate from prepayment — don&apos;t over-extend your liquidity to prepay faster.</li>
      </ul>
    ),
  },
];

export default function LearnPage() {
  return (
    <ToolPageShell
      title="Home Loan Education"
      description="Plain-language explainers to help you borrow, prepay, and refinance with more confidence."
    >
      <div className="rounded-lg border border-border/60 bg-card p-2 shadow-sm sm:p-4">
        <Accordion>
          {SECTIONS.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="text-base">{section.title}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{section.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ToolPageShell>
  );
}
