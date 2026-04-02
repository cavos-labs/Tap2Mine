# Tap2Mine

A 15-second tap game (1 imaginary BTC per tap), a **username**-based leaderboard, and Bitcoin-inspired UI.

This repo splits the app into two Next.js projects:

- **`frontend/`** — App Router UI (dashboard, mock auth, player hub, game). See [frontend/README.md](frontend/README.md).
- **`backend/`** — Minimal API (`GET /api/btc-price`). See [backend/README.md](backend/README.md).

## Quick start

1. **API** (port `3001`):

   ```bash
   cd backend && npm install && npm run dev
   ```

2. **Web** (port `3000`):

   ```bash
   cd frontend && npm install && npm run dev
   ```

3. Optional: copy `frontend/.env.example` to `frontend/.env.local` if the API is not at `http://localhost:3001`.

Open [http://localhost:3000](http://localhost:3000).

## Roadmap

- Replace mock sign-in with real Apple / Google / email auth.
- Persist leaderboard and game history via your API.
