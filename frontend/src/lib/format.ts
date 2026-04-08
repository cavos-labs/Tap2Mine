/** Format imaginary mined BTC (whole numbers stay compact). */
export function formatImaginaryBtc(
  amount: number,
  numberLocale: string = "en-US",
): string {
  if (!Number.isFinite(amount)) return "—";
  if (Number.isInteger(amount)) {
    return `${amount.toLocaleString(numberLocale)} BTC`;
  }
  return `${amount.toLocaleString(numberLocale, { maximumFractionDigits: 8 })} BTC`;
}

export const formatBtc = formatImaginaryBtc;

/** USD for live / game HUD (spot BTC price × mined amount). */
export function formatUsdApprox(
  usd: number,
  opts?: {
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    numberLocale?: string;
  },
): string {
  if (!Number.isFinite(usd)) return "—";
  const max = opts?.maximumFractionDigits ?? 0;
  const min = opts?.minimumFractionDigits ?? 0;
  const locale = opts?.numberLocale ?? "en-US";
  return usd.toLocaleString(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: max,
    minimumFractionDigits: min,
  });
}
