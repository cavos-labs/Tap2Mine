# Tap2Mine

A 15-second tap game (1 imaginary BTC per tap), a **username**-based leaderboard, and Bitcoin-inspired UI.

There is **no root `package.json`**: the app lives entirely in **`frontend/`** (Next.js App Router). Install and run from that folder.

## Quick start

```bash
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The BTC spot price is fetched in the browser from public price APIs (no separate backend).

Details: [frontend/README.md](frontend/README.md).

## Roadmap

- Replace mock sign-in with real Apple / Google / email auth.
- Persist leaderboard and game history via your API.
