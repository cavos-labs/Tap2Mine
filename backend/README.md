# Tap2Mine — Backend

Standalone Next.js service exposing Bitcoin reference price for the frontend. It is a separate Node project from `frontend/` (own `package.json` and `npm install`).

## Setup

```bash
npm install
npm run dev
```

Runs at [http://localhost:3001](http://localhost:3001) (`package.json` sets port `3001`).

## Endpoints

### `GET /api/btc-price`

Returns JSON:

```json
{ "priceUsd": 98500, "currency": "USD", "source": "coingecko" }
```

(`source` can be `coingecko`, `binance`, `coindesk`, or `fallback`.)

The handler tries providers in order; the JSON field `source` tells you which one succeeded:

1. **CoinGecko** — [`/simple/price`](https://docs.coingecko.com/reference/simple-price) (free tier, rate limits apply; good for demos).
2. **Binance** — public [`/ticker/price`](https://binance-docs.github.io/apidocs/spot/en/#symbol-price-ticker) for `BTCUSDT` (no key; USDT ≈ USD).
3. **CoinDesk** — [`/v1/bpi/currentprice.json`](https://www.coindesk.com/coindesk-api) (BPI; uses `rate_float` or parses `rate`).

If both fail, you get a static `fallback` price so the UI still works.

### Other options (if you outgrow the above)

| Provider | Notes |
|----------|--------|
| [Coinbase Exchange API](https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproductticker) | `GET /products/BTC-USD/ticker`, public |
| [Kraken public Ticker](https://docs.kraken.com/rest/#tag/Market-Data/operation/getTickerInformation) | `XBTUSD` pair |
| [CoinGecko Pro](https://www.coingecko.com/en/api/pricing) | Higher limits, API key |

**Tip:** Keep calling **your** `/api/btc-price` from the frontend (as now) so keys stay on the server and you avoid CORS issues with third-party domains.

CORS is open (`*`) so the browser on `localhost:3000` can call this endpoint during development.

## Scripts

- `npm run dev` — development server on port 3001  
- `npm run build` — production build  
- `npm run start` — production server on port **3001** (same as dev)  
- `npm run lint` — ESLint  
