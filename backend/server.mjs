import { createServer } from "node:http";

const PORT = Number(process.env.PORT) || 3001;
const FALLBACK_USD = 98_500;
const CACHE_TTL_MS = 30_000;

let cached = { priceUsd: 0, source: "", ts: 0 };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

async function fetchCoinGecko() {
  const r = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
  );
  if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
  const d = await r.json();
  const p = d?.bitcoin?.usd;
  if (typeof p !== "number" || !Number.isFinite(p)) throw new Error("bad payload");
  return p;
}

async function fetchBinance() {
  const r = await fetch(
    "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
  );
  if (!r.ok) throw new Error(`Binance ${r.status}`);
  const d = await r.json();
  const p = parseFloat(d?.price ?? "");
  if (!Number.isFinite(p) || p <= 0) throw new Error("bad payload");
  return p;
}

async function fetchCoinDesk() {
  const r = await fetch(
    "https://api.coindesk.com/v1/bpi/currentprice.json",
  );
  if (!r.ok) throw new Error(`CoinDesk ${r.status}`);
  const d = await r.json();
  const usd = d?.bpi?.USD;
  if (!usd) throw new Error("bad payload");
  if (typeof usd.rate_float === "number" && Number.isFinite(usd.rate_float))
    return usd.rate_float;
  const p = parseFloat((usd.rate ?? "").replace(/,/g, ""));
  if (!Number.isFinite(p) || p <= 0) throw new Error("bad payload");
  return p;
}

const PROVIDERS = [
  { id: "coingecko", fn: fetchCoinGecko },
  { id: "binance", fn: fetchBinance },
  { id: "coindesk", fn: fetchCoinDesk },
];

async function getPrice() {
  if (Date.now() - cached.ts < CACHE_TTL_MS && cached.priceUsd > 0) {
    return cached;
  }
  for (const { id, fn } of PROVIDERS) {
    try {
      const priceUsd = await fn();
      cached = { priceUsd, source: id, ts: Date.now() };
      return cached;
    } catch {
      /* next provider */
    }
  }
  return { priceUsd: FALLBACK_USD, source: "fallback", ts: 0 };
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }

  if (req.url === "/api/btc-price" && req.method === "GET") {
    const { priceUsd, source } = await getPrice();
    res.writeHead(200, CORS);
    return res.end(JSON.stringify({ priceUsd, currency: "USD", source }));
  }

  res.writeHead(404, CORS);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`✓ Backend ready on http://localhost:${PORT}`);
});
