import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

/** Used only when every live provider fails. */
const FALLBACK_USD = 98_500;

const REVALIDATE_SEC = 30;

async function fetchCoinGeckoUsd(): Promise<number> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
    { next: { revalidate: REVALIDATE_SEC } }
  );
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data = (await res.json()) as { bitcoin?: { usd?: number } };
  const priceUsd = data.bitcoin?.usd;
  if (typeof priceUsd !== "number" || !Number.isFinite(priceUsd)) {
    throw new Error("Invalid CoinGecko payload");
  }
  return priceUsd;
}

/** Public REST, no API key. USDT tracks USD closely. */
async function fetchBinanceUsd(): Promise<number> {
  const res = await fetch(
    "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
    { next: { revalidate: REVALIDATE_SEC } }
  );
  if (!res.ok) throw new Error(`Binance ${res.status}`);
  const data = (await res.json()) as { price?: string };
  const priceUsd = parseFloat(data.price ?? "");
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    throw new Error("Invalid Binance payload");
  }
  return priceUsd;
}

/**
 * CoinDesk Bitcoin Price Index (public, no key).
 * @see https://www.coindesk.com/coindesk-api
 */
async function fetchCoinDeskUsd(): Promise<number> {
  const res = await fetch(
    "https://api.coindesk.com/v1/bpi/currentprice.json",
    { next: { revalidate: REVALIDATE_SEC } }
  );
  if (!res.ok) throw new Error(`CoinDesk ${res.status}`);
  const data = (await res.json()) as {
    bpi?: {
      USD?: { rate?: string; rate_float?: number };
    };
  };
  const usd = data.bpi?.USD;
  if (!usd) throw new Error("Invalid CoinDesk payload");

  if (typeof usd.rate_float === "number" && Number.isFinite(usd.rate_float)) {
    return usd.rate_float;
  }
  const fromRate = parseFloat((usd.rate ?? "").replace(/,/g, ""));
  if (!Number.isFinite(fromRate) || fromRate <= 0) {
    throw new Error("Invalid CoinDesk USD rate");
  }
  return fromRate;
}

const PROVIDERS: Array<{ id: string; fetch: () => Promise<number> }> = [
  { id: "coingecko", fetch: fetchCoinGeckoUsd },
  { id: "binance", fetch: fetchBinanceUsd },
  { id: "coindesk", fetch: fetchCoinDeskUsd },
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  for (const { id, fetch } of PROVIDERS) {
    try {
      const priceUsd = await fetch();
      return NextResponse.json(
        { priceUsd, currency: "USD", source: id },
        { headers: CORS_HEADERS }
      );
    } catch {
      /* try next provider */
    }
  }

  return NextResponse.json(
    {
      priceUsd: FALLBACK_USD,
      currency: "USD",
      source: "fallback",
    },
    { headers: CORS_HEADERS }
  );
}
