# Cameroon Chess Academy — UI

Next.js frontend for the CCA platform. Dark luxury theme with gold accents and Cameroon flag colors.

## Stack

- **Next.js 14** (App Router)
- **Chakra UI v3**
- **Apollo Client** (GraphQL)
- **react-chessboard** + **chess.js** (game board)
- **TypeScript**

## Setup

1. Install dependencies:

   ```bash
   npm install --legacy-peer-deps
   ```

2. Copy env example and set backend URL:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:

   - `NEXT_PUBLIC_GRAPHQL_URI` — CCA backend GraphQL endpoint (e.g. `http://localhost:4000/graphql`)
   - `NEXT_PUBLIC_WS_URL` — WebSocket base for live games (e.g. `ws://localhost:4000`)

3. Run the CCA backend (see `../cca`) so the API is available.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## WebSocket auth (live games)

The backend WebSocket route `/ws/game/:gameId` expects auth. Browsers cannot set `Authorization` on `WebSocket`; this UI sends the JWT via query: `?token=...`. If your backend only reads the header, add support for `request.url` query param `token` and use it when present.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint
- `npm run test` — run unit tests (Vitest)

## Routes

- `/` — landing
- `/login`, `/register` — auth
- `/dashboard` — user dashboard (protected)
- `/games` — game list; `/game/[id]` — live game (WebSocket)
- `/tournaments`, `/tournaments/[id]` — tournaments
- `/learning`, `/learning/puzzle/[id]` — puzzles
- `/schools`, `/schools/[id]` — schools
- `/admin` — admin (role-based)
