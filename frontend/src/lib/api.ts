export type BtcPriceResponse = {
  priceUsd: number;
  currency: string;
  source?: string;
};

export function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:3001"
  );
}

export async function fetchBtcPriceUsd(): Promise<BtcPriceResponse> {
  const res = await fetch(`${getApiBase()}/api/btc-price`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch BTC price");
  return res.json() as Promise<BtcPriceResponse>;
}
