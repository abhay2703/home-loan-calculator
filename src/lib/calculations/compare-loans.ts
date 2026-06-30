import { calculateEMI } from "./emi";
import { calculateProcessingFee, type ProcessingFeeType } from "./loan-basics";

export interface LoanOffer {
  id: string;
  bankName: string;
  interestRatePercent: number;
  processingFeeType: ProcessingFeeType;
  processingFeeValue: number;
  /** Flat one-time charges beyond processing fee — legal, admin, etc. */
  otherCharges: number;
}

export interface LoanOfferComparison {
  id: string;
  bankName: string;
  emi: number;
  totalInterest: number;
  processingFee: number;
  totalCost: number;
  isBest: boolean;
}

/**
 * Compares a fixed principal/tenure across multiple bank offers on EMI,
 * total interest, and total cost (interest + all one-time charges), and
 * flags the offer with the lowest total cost.
 */
export function compareLoanOffers(
  principal: number,
  tenureMonths: number,
  offers: LoanOffer[]
): LoanOfferComparison[] {
  const results = offers.map((offer) => {
    const emi = calculateEMI(principal, offer.interestRatePercent, tenureMonths);
    const totalInterest = emi * tenureMonths - principal;
    const processingFee = calculateProcessingFee(principal, {
      type: offer.processingFeeType,
      value: offer.processingFeeValue,
    });
    const totalCost = totalInterest + processingFee + offer.otherCharges;
    return {
      id: offer.id,
      bankName: offer.bankName,
      emi,
      totalInterest,
      processingFee,
      totalCost,
      isBest: false,
    };
  });

  if (results.length > 0) {
    const lowestCost = Math.min(...results.map((r) => r.totalCost));
    for (const result of results) {
      if (result.totalCost === lowestCost) result.isBest = true;
    }
  }

  return results;
}
