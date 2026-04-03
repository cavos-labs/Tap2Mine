/** Format imaginary mined BTC (whole numbers stay compact). */
export function formatImaginaryBtc(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  if (Number.isInteger(amount)) {
    return `${amount.toLocaleString("en-US")} BTC`;
  }
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 8 })} BTC`;
}

export const formatBtc = formatImaginaryBtc;
