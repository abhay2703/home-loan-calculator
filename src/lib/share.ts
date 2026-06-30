import type { LoanInputValues } from "./calculations/schema";

/**
 * Encodes everything except startDate (a shared link reproduces the
 * scenario starting today rather than locking in the original start date).
 */
export function encodeShareState(values: LoanInputValues): string {
  if (typeof window === "undefined") return "";
  const { startDate: _startDate, ...rest } = values;
  void _startDate;
  return window.btoa(encodeURIComponent(JSON.stringify(rest)));
}

export function decodeShareState(encoded: string): Partial<LoanInputValues> | null {
  if (typeof window === "undefined") return null;
  try {
    const json = decodeURIComponent(window.atob(encoded));
    return JSON.parse(json) as Partial<LoanInputValues>;
  } catch {
    return null;
  }
}

export function buildShareUrl(values: LoanInputValues): string {
  if (typeof window === "undefined") return "";
  const encoded = encodeShareState(values);
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("s", encoded);
  return url.toString();
}
