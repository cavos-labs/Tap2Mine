# Tap2Mine — Frontend

Standalone Next.js App Router app for Tap2Mine: home with **Start** and leaderboard, mock auth modal, player profile (`/player`), and game flow (`/game`). Run everything from this directory (`Tap2Mine/` has no root `package.json`).

## Setup

```bash
npm install
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000). No backend is required for the BTC spot price; the app fetches it in the browser from public price APIs.

## Stack

- Next.js 16, React 19, TypeScript  
- Tailwind CSS 4  
- Client state: React context + `localStorage` for the mock session, best score, and recent rounds  

## Scripts

- `npm run dev` — development server (Turbopack)  
- `npm run build` — production build  
- `npm run start` — production server  
- `npm run lint` — ESLint  
