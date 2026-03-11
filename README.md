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

   - `NEXT_PUBLIC_GRAPHQL_URI` — Main API (ccanext): auth, users, create game, game list, etc. (e.g. `http://localhost:3000/api/graphql`)
   - `NEXT_PUBLIC_GAME_API_URI` — CCA game play API (live session, moves, subscriptions). Production: `https://chessliveapi.blacksilvergroups.xyz/graphql`; dev: `http://localhost:4000/graphql`

3. Run the main backend (ccanext) and, for Vs Human games, the CCA game API (see `../cca`) so the live API and subscriptions are available.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Live games (Vs Human)

The game page uses the **CCA game API** (`NEXT_PUBLIC_GAME_API_URI`): mutations (startGameSession, makeMove, resignGame, offerDraw, acceptDraw, rejectDraw) over HTTP and the `gameUpdated` subscription over **graphql-ws** at `wss://<host>/subscriptions`. The UI passes the JWT in subscription `connectionParams: { token }`. Game record (create, list, fetch, record completed) stays on the main GraphQL API (ccanext).

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
