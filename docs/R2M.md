# Road to Master (R2M) — Architecture

R2M is the gamified progression layer for Cameroon Chess Academy. It models
each player as a Solo-Leveling-style "Hunter" with a six-attribute profile,
a class, a dungeon path, and a collection of "shadows" (missed brilliant
moves). The interface is built to feel like a high-tech HUD — chamfered
glass panels, neon glows, mana beams — not a generic web app.

## Repo layout

```
ccaui   — Next.js 14 frontend (this repo, all UI lives here)
cca     — Fastify + Apollo backend (data bridge for server-side Chess.com)
```

## System palette

Three primary tones drive every accent decision:

| Token              | CSS var                | Hex       | Used for                              |
|--------------------|------------------------|-----------|---------------------------------------|
| System Cyan        | `--sys-cyan`           | `#00F0FF` | Hunter identity, XP, the data bridge  |
| Shadow Purple      | `--sys-purple`         | `#8A2BE2` | Memory / mind, deep play              |
| Threat Pink/Red    | `--sys-threat`         | `#F06595` | Boss gates, weakness directives       |
| Epic Lavender      | `--sys-epic`           | `#B197FC` | Shadow inventory, rewards             |
| Prestige Gold      | `--sys-prestige-gold`  | `#F5C244` | Hunter's Pass, Prestige tier          |

Defined in [`src/app/globals.css`](../src/app/globals.css) (CSS vars + glow
utilities) and mirrored in [`tailwind.config.ts`](../tailwind.config.ts).
Chakra tokens for the same palette live in [`src/lib/theme.ts`](../src/lib/theme.ts).

Glow shortcuts:

```html
<div class="sys-glow-cyan sys-clip-panel"> … </div>
<span class="sys-text-prestige">Pass acquired</span>
```

## Domain model

### Six attributes — the radar chart

[`src/lib/r2m-attributes.ts`](../src/lib/r2m-attributes.ts) defines the
six-attribute block scored 0–100:

| Key            | RPG label    | Chess meaning                                                |
|----------------|--------------|--------------------------------------------------------------|
| `strength`     | Strength     | Captures, sacrifices, mating attacks                         |
| `agility`      | Agility      | Bullet & blitz performance, fast conversion                  |
| `intelligence` | Intelligence | Opening repertoire breadth and accuracy                      |
| `vitality`     | Vitality     | Long-game endurance, defensive saves                         |
| `sense`        | Sense        | Reading opponent intent before they act (prophylaxis)        |
| `willpower`    | Willpower    | Converting small advantages without error (endgame)          |

### Hunter classes — auto-assigned

Six classes, each anchored to two primary attributes:

| Class       | Primaries                  | Mentor              |
|-------------|----------------------------|---------------------|
| Assassin    | Strength + Agility         | Mikhail Tal         |
| Architect   | Intelligence + Sense       | Anatoly Karpov      |
| Guardian    | Vitality + Willpower       | Tigran Petrosian    |
| Tactician   | Strength + Intelligence    | Garry Kasparov      |
| Predator    | Sense + Strength           | Magnus Carlsen      |
| Sage        | Intelligence + Willpower   | José Raúl Capablanca|

`classifyByAttributes()` picks the class whose two primaries best match the
player's top two attributes (with a tiebreaker for both-in-top-three).

### Tiers — the chess strength ladder

[`src/lib/r2m.ts`](../src/lib/r2m.ts) keeps the existing `E < D < C < B < A < S < SS`
ladder; it overlays the attribute system rather than replacing it. Tier is
derived from rating; class is derived from playing style.

## Frontend components

All R2M components live under [`src/components/system/`](../src/components/system/).
They share a set of forged primitives (chamfered panel, button, scan line):

- [`SystemPrimitives.tsx`](../src/components/system/SystemPrimitives.tsx) — `SystemPanel`, `SystemButton`, `SystemLabel`, `Brackets`, `ScanLine`, keyframes.
- [`HexRadar.tsx`](../src/components/system/HexRadar.tsx) — pure SVG hexagonal radar (6 axes, animated polygon, elite-vertex pulse).
- [`StatusWindow.tsx`](../src/components/system/StatusWindow.tsx) — full Hunter Licence card: rank diamond, class badge, radar, attribute rail, mentor, weakness directive, Chess.com sync. Drops into a route or as a modal.
- [`PlayerHUD.tsx`](../src/components/system/PlayerHUD.tsx) — compact top-left HUD with rank, level, XP bar.
- [`DungeonMap.tsx`](../src/components/system/DungeonMap.tsx) — vertical level-spine, fog-of-war (5 visible + 4 obscured), mana-flow on the cleared portion, one-shot ignition beam + burst on level-up.
- [`ManaBeam.tsx`](../src/components/system/ManaBeam.tsx) — beam-of-light + burst primitives. Used by DungeonMap and reusable.
- [`MemoryEcho.tsx`](../src/components/system/MemoryEcho.tsx) — visualisation training: preview → recall → review on a custom SVG board.
- [`ShadowExtraction.tsx`](../src/components/system/ShadowExtraction.tsx) — find-the-brilliant-move puzzle + `ShadowCollection` inventory grid + `useShadowInventory()` local-storage hook.
- [`GuildBoard.tsx`](../src/components/system/GuildBoard.tsx) — Cameroon regional XP leaderboard with animated bars and S/A/B/C rank badges.
- [`HuntersPass.tsx`](../src/components/system/HuntersPass.tsx) — paid-tier checkout stub for Flutterwave (default, XAF) and Stripe (fallback, USD).
- [`LevelUpOverlay.tsx`](../src/components/system/LevelUpOverlay.tsx) — full-screen LEVEL-UP sequence: slash → modal → stats → reward.

## Routes

| Path                              | What                                          |
|-----------------------------------|-----------------------------------------------|
| `/road-to-master`                 | Lobby (tabs: Lobby · Status · Quests · Codex · Inventory) |
| `/road-to-master/status`          | Standalone Status Window                      |
| `/road-to-master/gate`            | Dungeon Map (full screen)                     |
| `/road-to-master/memory`          | Memory Echo trial                             |
| `/road-to-master/shadow`          | Shadow Extraction puzzle + Collection         |
| `/road-to-master/guild`           | Guild Conclave (district leaderboard)         |
| `/road-to-master/pass`            | Hunter's Pass checkout                        |

## Data flow — Chess.com → attributes

Two parallel implementations of the heuristic classifier exist; both
produce the same 6-attribute block. They differ in dependencies.

### Browser (lazy, on-demand)

[`src/lib/r2m-classifier.ts`](../src/lib/r2m-classifier.ts) uses `chess.js`
(already a `ccaui` dependency) to parse PGNs. `profileFromChessCom(username)`
fetches the latest archive (and backfills earlier months if it's sparse),
computes the 6 attributes, and returns a `HunterProfile`. Used by the
Chess.com sync flow inside the Status Window.

### Server (cached, shared)

[`cca/src/services/chesscom.service.ts`](../../cca/src/services/chesscom.service.ts)
fetches public-API archives with a 5-minute in-memory cache.
[`cca/src/services/playerStyle.service.ts`](../../cca/src/services/playerStyle.service.ts)
parses PGNs **via regex** (no chess.js dep on the backend) and runs the
same heuristic mapping. Exposed via the GraphQL resolver
[`cca/src/graphql/resolvers/hunter.resolvers.ts`](../../cca/src/graphql/resolvers/hunter.resolvers.ts)
as `hunterProfile(chesscomUsername, sampleSize)`.

The heuristics:

```
strength     = capture_rate × 0.55 + check_density × 0.20 + mate_win_share × 0.25
agility      = fast_share × 0.5  + fast_win_rate × 0.5
intelligence = repertoire_breadth × 0.55 + deep_win_share × 0.45
vitality     = long_share × 0.45 + long_survival × 0.55
sense        = quiet_density × 0.6 + draw_share × 0.4
willpower    = long_endgame_share × 0.4 + long_endgame_wins × 0.4 + long_win_rate × 0.2
```

Each component runs through a `tanh`-based scoring curve so the result is
bounded to 0–100. The whole thing is engine-free — no Stockfish required.

## Recommendation engine

The player's **weakest** attribute drives a "System Directive" — a
specific dungeon recommendation. Mapping is hardcoded in
[`r2m-attributes.ts`](../src/lib/r2m-attributes.ts) (`recommendedDungeon`)
and mirrored on the backend.

## Hunter's Pass (paid tier)

[`HuntersPass.tsx`](../src/components/system/HuntersPass.tsx) renders the
checkout UI. It accepts an `onCheckout` handler with `{ processor, plan }`
so the page can route to a real backend flow. A dev stub
(`stubHuntersPassCheckout`) is included for local testing.

Default plans:

| Plan         | Cadence              | XAF       | USD |
|--------------|----------------------|-----------|-----|
| Trial        | 1 month              | 2,500     | 5   |
| Season Pass  | 3 months / 1 season  | 6,000     | 12  |
| Monarch Pass | lifetime / prestige  | 49,000    | 99  |

Region selection: Flutterwave is the default for Cameroon (Mobile Money +
cards in XAF); Stripe is the global fallback in USD.

## Prestige (Level 100 — future work)

Once a player reaches Level 100 they undergo a "Job Change": Hunter →
National Master. The UI flips Cyan/Purple to Gold/Onyx (`--sys-prestige-*`
tokens are already defined). At Prestige tier the player unlocks the
"Create Gates" mechanic — they author lessons/puzzles for lower-rank
hunters. This route is **not yet built** but the palette and licence-card
component are pre-wired for it (`accent="gold"` on `SystemPanel` already
renders the Prestige variant).

## Accessibility note

The brief explicitly prioritises "game feel" over web accessibility
conventions. Even so:

- Every interactive element is a button or a link.
- All animations honour `prefers-reduced-motion` (set in `globals.css`).
- Colour is never the sole signal — labels, rank letters, and percentages
  appear alongside every glow.

## Testing the build

```
cd ccaui && npx tsc --noEmit   # strict TS pass
cd cca   && npx tsc --noEmit   # strict TS pass
```

Both pass cleanly as of the initial scaffolding commit.

## Where to extend next

- **Real game-review pipeline** that produces `ShadowCandidate[]` from
  reviewed losses (engine-tagged blunders + a top-line eval delta).
- **Persisted attributes** — currently the classifier runs ad hoc;
  schedule a nightly job to recompute and store per-user.
- **Server-side checkout** — wire `HuntersPass.onCheckout` to
  `cca`/Flutterwave + Stripe webhooks. Webhooks should set a `huntersPass`
  field on `Profile`.
- **Prestige route** — `/road-to-master/prestige` with the Gold/Onyx
  variant, "Create Gates" authoring tool.
- **Daily quest engine** — fold Chess.com loss-by-opening signal into the
  `DAILY_QUESTS` list so quests are personalised (e.g. "Drill Anti-Fried-Liver").
