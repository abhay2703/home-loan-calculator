export interface FinancialHealthInput {
  monthlyEmi: number;
  monthlyIncome?: number;
  totalInterest: number;
  totalPrincipal: number;
  tenureMonths: number;
  downPaymentPercent?: number;
  hasPrepaymentPlan: boolean;
}

export interface FinancialHealthFactor {
  label: string;
  score: number;
  weight: number;
}

export interface FinancialHealthResult {
  score: number;
  stars: number;
  label: string;
  factors: FinancialHealthFactor[];
  suggestions: string[];
}

/** Linear interpolation across a sorted set of (value, score) control points. */
function piecewiseScore(value: number, points: [number, number][]): number {
  if (value <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (value <= x1) {
      const t = (value - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return points[points.length - 1][1];
}

const NEUTRAL_SCORE = 65;

function emiToIncomeScore(emi: number, income?: number): number {
  if (!income || income <= 0) return NEUTRAL_SCORE;
  const ratio = (emi / income) * 100;
  return piecewiseScore(ratio, [[20, 100], [30, 90], [40, 65], [50, 35], [60, 10], [80, 0]]);
}

function interestToPrincipalScore(totalInterest: number, totalPrincipal: number): number {
  if (totalPrincipal <= 0) return NEUTRAL_SCORE;
  const ratio = totalInterest / totalPrincipal;
  return piecewiseScore(ratio, [[0.3, 100], [0.6, 85], [1.0, 65], [1.5, 40], [2.0, 15], [3.0, 0]]);
}

function tenureScore(tenureMonths: number): number {
  return piecewiseScore(tenureMonths, [[60, 100], [120, 90], [180, 75], [240, 55], [300, 35], [360, 15], [420, 0]]);
}

function downPaymentScore(downPaymentPercent?: number): number {
  if (downPaymentPercent === undefined) return NEUTRAL_SCORE;
  return piecewiseScore(downPaymentPercent, [[5, 15], [10, 35], [20, 70], [30, 90], [40, 100]]);
}

function prepaymentScore(hasPlan: boolean): number {
  return hasPlan ? 100 : 55;
}

/**
 * Rule-based 0-100 loan health score blending five weighted factors. Factors
 * that depend on optional inputs (income, down payment %) fall back to a
 * neutral score rather than penalizing the loan when that data isn't
 * provided.
 */
export function calculateFinancialHealthScore(input: FinancialHealthInput): FinancialHealthResult {
  const factors: FinancialHealthFactor[] = [
    { label: "EMI vs income", score: emiToIncomeScore(input.monthlyEmi, input.monthlyIncome), weight: 0.35 },
    { label: "Interest vs principal", score: interestToPrincipalScore(input.totalInterest, input.totalPrincipal), weight: 0.25 },
    { label: "Loan tenure", score: tenureScore(input.tenureMonths), weight: 0.15 },
    { label: "Down payment", score: downPaymentScore(input.downPaymentPercent), weight: 0.15 },
    { label: "Prepayment plan", score: prepaymentScore(input.hasPrepaymentPlan), weight: 0.1 },
  ];

  const score = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0));
  const stars = Math.max(1, Math.min(5, Math.round(score / 20)));

  const label =
    score >= 90
      ? "Excellent Loan Structure"
      : score >= 75
        ? "Strong Loan Structure"
        : score >= 60
          ? "Good, With Room to Improve"
          : score >= 40
            ? "Needs Attention"
            : "High Risk — Reassess This Loan";

  const suggestions: string[] = [];
  if (input.monthlyIncome && factors[0].score < 65) {
    suggestions.push("Your EMI is a large share of your income — consider a longer tenure or a bigger down payment.");
  }
  if (factors[1].score < 65) {
    suggestions.push("You're paying significantly more in interest than principal — a shorter tenure or prepayments would help.");
  }
  if (factors[2].score < 55) {
    suggestions.push("A long tenure increases total interest paid — consider shortening it if your budget allows.");
  }
  if (input.downPaymentPercent !== undefined && factors[3].score < 55) {
    suggestions.push("A bigger down payment reduces your loan amount and total interest.");
  }
  if (factors[4].score < 100) {
    suggestions.push("Even a small recurring prepayment can meaningfully cut your interest cost.");
  }

  return { score, stars, label, factors, suggestions };
}
