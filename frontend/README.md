# Tap2Mine — Frontend

Standalone Next.js App Router app for Tap2Mine: home with **Start** and leaderboard, mock auth modal, player profile (`/player`), and game flow (`/game`). It does not share a root `package.json` with the backend—run everything from this directory.

## Setup

```bash
npm install
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000). Point the app at the API with `NEXT_PUBLIC_API_URL` (see `.env.example`).

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the Tap2Mine backend (default `http://localhost:3001`). |

## Stack

- Next.js 16, React 19, TypeScript  
- Tailwind CSS 4  
- Client state: React context + `localStorage` for the mock session, best score, and recent rounds  

## Scripts

- `npm run dev` — development server  
- `npm run build` — production build  
- `npm run start` — production server  
- `npm run lint` — ESLint  
