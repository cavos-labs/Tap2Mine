/** Format imaginary mined BTC (whole numbers stay compact). */
export function formatImaginaryBtc(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  if (Number.isInteger(amount)) {
    return `${amount.toLocaleString("en-US")} BTC`;
  }
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 8 })} BTC`;
}

export const formatBtc = formatImaginaryBtc;

/** USD for live / game HUD (spot BTC price × mined amount). */
export function formatUsdApprox(
  usd: number,
  opts?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
): string {
  if (!Number.isFinite(usd)) return "—";
  const max = opts?.maximumFractionDigits ?? 0;
  const min = opts?.minimumFractionDigits ?? 0;
  return usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: max,
    minimumFractionDigits: min,
  });
}
