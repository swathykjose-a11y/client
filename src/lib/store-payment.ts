/** Public store payment identity. Matches the server checkout response. */
export const STORE_UPI = {
  payeeName: "Swathy Jose",
  vpa: "swathykjose-6@okhdfcbank",
  phone: "9619408985",
} as const;

export function buildUpiUri(amountInr: number, note: string): string {
  const query = [
    ["pa", STORE_UPI.vpa],
    ["pn", STORE_UPI.payeeName],
    ["am", amountInr.toFixed(2)],
    ["cu", "INR"],
    ["tn", note],
  ]
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `upi://pay?${query}`;
}

export interface UpiPaymentInstructions {
  payeeName: string;
  vpa: string;
  phone: string;
  amount: number;
  currency: "INR";
  note: string;
  upiUri: string;
}

export function upiInstructionsFor(amount: number, orderNumber: string): UpiPaymentInstructions {
  const note = `Dainty Dazzle ${orderNumber}`;
  return {
    payeeName: STORE_UPI.payeeName,
    vpa: STORE_UPI.vpa,
    phone: STORE_UPI.phone,
    amount,
    currency: "INR",
    note,
    upiUri: buildUpiUri(amount, note),
  };
}
